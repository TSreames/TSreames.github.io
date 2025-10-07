// This is not used, but it can be used to throttle layer loading to avoid overwhelming

define([
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/GroupLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/ImageryLayer",
  "esri/portal/Portal",
  // your layer factory/registration file; it should push into aerials2load/layers2load

], function (
  FeatureLayer, TileLayer, MapImageLayer, GroupLayer, VectorTileLayer, ImageryLayer,
  Portal
) {

  // ---- helpers --------------------------------------------------------------
  var delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };

  function hostKey(url) {
    try { return new URL(url).host; } catch (e) { return "unknown"; }
  }

  // ---- configurable knobs (tune as needed) ---------------------------------
  var loaderConfig = {
    globalLimit: 6,                 // total concurrent loads across all hosts
    perHostLimit: {                 // per-host caps (keep on-prem small)
      "services.arcgisonline.com": 8,
      "services2.arcgisonline.com": 8,
      "tiles.arcgis.com": 8,
      "js.arcgis.com": 8,
      "webgis2.durhamnc.gov": 1,
      "nearmap.com": 1,
      "maps.wakegov.com": 1,
      "gis.orangecountync.gov": 1,
      "unknown": 8                  // fallback
      
    },
    baseBackoffMs: 600,
    maxRetries: 4,
    idlePauseMs: 300,
    // optional per-host inter-start pause (ms). If a host is present here it will
    // override the global idlePauseMs when scheduling the next start.
    perHostIdleMs: {
      // tuned per-host inter-start pause (ms) — smaller = faster, larger = slower
      "services.arcgisonline.com": 1,
      "js.arcgis.com": 1,
      "services2.arcgisonline.com": 1,      "tiles.arcgis.com": 1,
      "services2.arcgisonline.com": 1,
      "webgis2.durhamnc.gov": 2000,
      "nearmap.com": 1500,
      "maps.wakegov.com": 1000,
      "gis.orangecountync.gov": 1000,
      "unknown": 1
      }
    };


  function getPerHostLimit(host) {
    return loaderConfig.perHostLimit.hasOwnProperty(host)
      ? loaderConfig.perHostLimit[host]
      : (loaderConfig.perHostLimit["unknown"] || 1);
  }

    function getPerHostIdle(host) {
      return loaderConfig.perHostIdleMs && loaderConfig.perHostIdleMs.hasOwnProperty(host)
        ? loaderConfig.perHostIdleMs[host]
        : loaderConfig.idlePauseMs;
    }

  // ---- queue implementation -------------------------------------------------
  function LayerLoadQueue(view, map) {
    this.view = view;
    this.map = map;
    this.q = [];               // { layer, bucket }
    this.running = 0;
    this.runningPerHost = {};  // host -> count
    this.started = false;
  }

  LayerLoadQueue.prototype.enqueue = function (layer, bucket) {
    this.q.push({ layer: layer, bucket: bucket });
  };

  LayerLoadQueue.prototype._canStart = function (host) {
    if (this.running >= loaderConfig.globalLimit) return false;
    var hostRunning = this.runningPerHost[host] || 0;
    console.log(host)
    return hostRunning < getPerHostLimit(host);
  };

  LayerLoadQueue.prototype._markStart = function (host) {
    this.running += 1;
    this.runningPerHost[host] = (this.runningPerHost[host] || 0) + 1;
  };

  LayerLoadQueue.prototype._markDone = function (host) {
    this.running -= 1;
    var cur = (this.runningPerHost[host] || 0) - 1;
    this.runningPerHost[host] = cur > 0 ? cur : 0;
  };

  LayerLoadQueue.prototype._withRetry = async function (fn) {
    var attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (e) {
        var status = (e && (e.details && e.details.httpStatus)) || e.httpStatus || e.status;
        var retriable = (status === 429 || status === 0 || status === undefined || (typeof status === "number" && status >= 500));
        if (!retriable || attempt >= loaderConfig.maxRetries) throw e;
        var backoff = loaderConfig.baseBackoffMs * Math.pow(2, attempt) + Math.random() * 250;
        await delay(backoff);
        attempt += 1;
      }
    }
  };

  LayerLoadQueue.prototype._runOne = async function (layer, host, onLayerFail) {
    var originalVisible = !!layer.visible;
    layer.visible = false;  // prevent immediate draw/export spam

    try {
      // Load metadata first (fields/capabilities). This is the heavy request.
      await this._withRetry(function () { return layer.load(); });

      // Add to map only after successful load
      this.map.add(layer);

      // Let the view stabilize the LayerView (optional — ignore failures)
      try { await this.view.whenLayerView(layer); } catch (_e) {}

      // Restore intended visibility
      layer.visible = originalVisible;

    } catch (err) {
      console.error("[durm_loader] failed:", layer && layer.id, err);
      if (onLayerFail) onLayerFail(layer, err);
      // If it failed before map.add, keep it off the map.
      // You could collect failures in a global array for diagnostics.
    }
  };

  LayerLoadQueue.prototype.start = async function () {
    if (this.started) return;
    this.started = true;

    while (this.q.length) {
      // find a task whose host is under its per-host limit
      var selectedIndex = -1;
      for (var i = 0; i < this.q.length; i++) {
        var host = hostKey(this.q[i].layer.url);
        if (this._canStart(host)) { selectedIndex = i; break; }
      }

      if (selectedIndex === -1) {
        await delay(100);
        continue;
      }

      var item = this.q.splice(selectedIndex, 1)[0];
      var h = hostKey(item.layer.url);

  this._markStart(h);
  this._runOne(item.layer, h, this.onLayerFail).finally(this._markDone.bind(this, h));
  // use per-host idle pause when scheduling the next start to allow tuning 'speed' per host
  await delay(getPerHostIdle(h));
    }

    // wait for in-flight items
    while (this.running > 0) { await delay(100); }
  };

  // ---- public API -----------------------------------------------------------
return {
  add_to_map_throttled: function (opts) {
    opts = opts || {};
    var view = opts.view || durm.view;
    var map  = opts.map  || durm.map;
    var onLayerFail = opts.onLayerFail || function() {};

    var q = new LayerLoadQueue(view, map);
    q.onLayerFail = onLayerFail;

    // accept either/both; no problem if one is empty
    var aerials = opts.aerials || [];
    var layers  = opts.layers  || [];

    aerials.forEach(function (lyr) { q.enqueue(lyr, "aerial"); });
    layers.forEach(function (lyr)  { q.enqueue(lyr, "normal"); });

    // allow per-call tuning
    if (typeof opts.globalLimit === "number") loaderConfig.globalLimit = opts.globalLimit;
    if (opts.perHostLimit) Object.assign(loaderConfig.perHostLimit, opts.perHostLimit);

    q.start();  // safe to call multiple times; each call makes and drains its own queue
  }
};
});