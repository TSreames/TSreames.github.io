/*
Aerial slider UI and controls
Handles the slider widget for navigating through historical aerial imagery
*/

define([
], function() {
	return {
		//Note: This is the ORIGINAL function we moved FROM DURM_LAYERS
		init_aerial_slider: function(){
			// Critical that this runs AFTER aerials have been added to map.
			// durm.aeriallist should already be populated by add_aerials()
			if (!durm.aeriallist || durm.aeriallist.length === 0) {
				console.error("durm.aeriallist not populated before init_aerial_slider");
				return;
			}

			// Set default aerial if not already set
			if (typeof durm.defaultaerialid === 'undefined') {
				durm.defaultaerialid = durm.aeriallist.length - 1;
			}

			durm.aeriallist_ids = []
			for (i = 0; i < durm.aeriallist.length; i++) {
				durm.aeriallist_ids.push(durm.aeriallist[i].id)
			}

			let sliderholder = document.createElement('div')
			sliderholder.id = "sliderDiv"
			sliderholder.className = "sliderholder"
			sliderholder.style.visibility = "hidden";
			document.getElementById("bodycontainer").appendChild(sliderholder);

			durm.sliderinput = document.createElement("input") //note :input elements for sliders styled globally.
			durm.sliderinput.id = "rangeinput"
			durm.sliderinput.type = "range"

			
			durm.sliderinput.min = 0;
			durm.sliderinput.max = durm.aeriallist.length-1;
			sliderholder.appendChild(durm.sliderinput)

			let sliderlabel = document.createElement('div')
			sliderlabel.id = "outputlabel"
			sliderholder.appendChild(sliderlabel)

			durm.ainput = document.getElementById('rangeinput');
			durm.aoutput = document.getElementById('outputlabel');

			// create a debounced handler that will do the heavy work (push_new_url + toggling)
			// label updates are cheap and done immediately for UI feedback
			durm._debouncedAerialChange = this.slider_debounce(function (value) {
				// commit selected index and update map layers
				durm.aparam = value;
				push_new_url();
				for (i = 0; i < durm.aeriallist.length; i++) {
					if (i == value) {
						durm.aeriallist[i].visible = true;
					} else {
						durm.aeriallist[i].visible = false;
					}
				}
			}, 1000);

			// immediate UI feedback on input; heavy work deferred by debounce
			durm.ainput.addEventListener('input', function (evt) {
				var v = parseInt(this.value, 10);
				durm.aoutput.innerHTML = durm.aeriallist[v].title;
				durm._debouncedAerialChange(v);
			});

			// on change (user finished interaction) cancel pending debounce and commit immediately
			durm.ainput.addEventListener('change', function (evt) {
				var v = parseInt(this.value, 10);
				if (durm._debouncedAerialChange && durm._debouncedAerialChange.cancel) durm._debouncedAerialChange.cancel();
				durm.aparam = v;
				push_new_url();
				for (i = 0; i < durm.aeriallist.length; i++) {
					if (i == v) {
						durm.aeriallist[i].visible = true;
					} else {
						durm.aeriallist[i].visible = false;
					}
				}
			});
		},

		//Note: This is the NEW function we're going to use when we start splitting NearMap and non-Nearmap aerials up.
		init_aerial_slider_NEW: function(){
			// Critical that this runs AFTER aerials have been added to map.
			//Slider
			durm.defaultaerialid = 39; //This is used to specify which aerial is the default, as defined by its place in aeriallist[]

			// Build aeriallist based on whether nearmap is available
			durm.aeriallist = this.build_aerial_list();

			durm.aeriallist_ids = []
			for (i = 0; i < durm.aeriallist.length; i++) {
				durm.aeriallist_ids.push(durm.aeriallist[i].id)
			}

			let sliderholder = document.createElement('div')
			sliderholder.id = "sliderDiv"
			sliderholder.className = "sliderholder"
			sliderholder.style.visibility = "hidden";
			document.getElementById("bodycontainer").appendChild(sliderholder);

			durm.sliderinput = document.createElement("input") //note :input elements for sliders styled globally.
			durm.sliderinput.id = "rangeinput"
			durm.sliderinput.type = "range"


			durm.sliderinput.min = 0;
			durm.sliderinput.max = durm.aeriallist.length-1;
			sliderholder.appendChild(durm.sliderinput)

			let sliderlabel = document.createElement('div')
			sliderlabel.id = "outputlabel"
			sliderholder.appendChild(sliderlabel)

			durm.ainput = document.getElementById('rangeinput');
			durm.aoutput = document.getElementById('outputlabel');

			// create a debounced handler that will do the heavy work (push_new_url + toggling)
			// label updates are cheap and done immediately for UI feedback
			durm._debouncedAerialChange = this.slider_debounce(function (value) {
				// commit selected index and update map layers
				durm.aparam = value;
				push_new_url();
				for (i = 0; i < durm.aeriallist.length; i++) {
					if (i == value) {
						durm.aeriallist[i].visible = true;
					} else {
						durm.aeriallist[i].visible = false;
					}
				}
			}, 1000);

			// immediate UI feedback on input; heavy work deferred by debounce
			durm.ainput.addEventListener('input', function (evt) {
				var v = parseInt(this.value, 10);
				durm.aoutput.innerHTML = durm.aeriallist[v].title;
				durm._debouncedAerialChange(v);
			});

			// on change (user finished interaction) cancel pending debounce and commit immediately
			durm.ainput.addEventListener('change', function (evt) {
				var v = parseInt(this.value, 10);
				if (durm._debouncedAerialChange && durm._debouncedAerialChange.cancel) durm._debouncedAerialChange.cancel();
				durm.aparam = v;
				push_new_url();
				for (i = 0; i < durm.aeriallist.length; i++) {
					if (i == v) {
						durm.aeriallist[i].visible = true;
					} else {
						durm.aeriallist[i].visible = false;
					}
				}
			});
		},

		build_aerial_list: function() {
			// Conditionally build the list based on whether nearmap is available
			if (durm.use_nearmap) {
				// Full list with nearmap
				return [
					durm.aerials1940,
					durm.soils1983,
					durm.aerials1988,
					durm.aerials1994,
					durm.aerials1999,
					durm.aerials2002,
					durm.aerials2005,
					durm.satellite2007,
					durm.satellite2008,
					durm.aerials2008,
					durm.satellite2009,
					durm.satellite2010,
					durm.aerials2010,
					durm.satellite2011,
					durm.satellite2012,
					durm.satellite2013,
					durm.aerials2013,
					durm.satellite2014,
					durm.nearmap2014,
					durm.satellite2015,
					durm.nearmap2015_spring,
					durm.nearmap2015_fall,
					durm.satellite2016,
					durm.nearmap2016_spring,
					durm.nearmap2016_fall,
					durm.aerials2017,
					durm.nearmap2017_spring1,
					durm.nearmap2017_spring2,
					durm.nearmap2017_fall,
					durm.nearmap2018_spring,
					durm.nearmap2018_fall,
					durm.aerials2019,
					durm.nearmap2019_spring1,
					durm.nearmap2019_spring2,
					durm.nearmap2019_fall,
					durm.nearmap2020_spring1,
					durm.nearmap2020_spring2,
					durm.nearmap2020_fall,
					durm.nearmap2021_spring1,
					durm.aerials2021,
					durm.nearmap2021_fall,
					durm.nearmap2022_spring1,
					durm.nearmap2022_spring2,
					durm.nearmap2022_fall,
					durm.nearmap2023_winter,
					durm.nearmap2023_spring,
					durm.nearmap2023_fall,
					durm.nearmap2024_spring,
					durm.nearmap2024_summer,
					durm.nearmap2024_fall,
					durm.nearmap2025_winter
				];
			} else {
				// List without nearmap entries
				return [
					durm.aerials1940,
					durm.soils1983,
					durm.aerials1988,
					durm.aerials1994,
					durm.aerials1999,
					durm.aerials2002,
					durm.aerials2005,
					durm.satellite2007,
					durm.satellite2008,
					durm.aerials2008,
					durm.satellite2009,
					durm.satellite2010,
					durm.aerials2010,
					durm.satellite2011,
					durm.satellite2012,
					durm.satellite2013,
					durm.aerials2013,
					durm.satellite2014,
					durm.satellite2015,
					durm.satellite2016,
					durm.aerials2017,
					durm.aerials2019,
					durm.aerials2021
				];
			}
		},

		slider_debounce: function (fn, waitMs, options) {
			// fn: function(value)
			// waitMs: ms to wait after last call before invoking
			// options: { leading: false }
			options = options || {};
			var leading = !!options.leading;
			var timeout = null;
			var lastArgs = null;
			var ctx = null;

			function invoke() {
				timeout = null;
				if (!leading && lastArgs !== null) {
					fn.apply(ctx, lastArgs);
					lastArgs = null;
				}
			}

			function debounced() {
				ctx = this;
				lastArgs = arguments;
				if (timeout) clearTimeout(timeout);
				if (leading && !timeout) {
					fn.apply(ctx, lastArgs);
					lastArgs = null;
				}
				timeout = setTimeout(invoke, waitMs);
			}

			debounced.cancel = function () {
				if (timeout) { clearTimeout(timeout); timeout = null; }
				lastArgs = null;
			};

			return debounced;
		}
	};
});
