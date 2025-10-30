/*
Aerial slider UI and controls
Handles the slider widget for navigating through historical aerial imagery
*/

define([
	"esri/layers/support/WMSSublayer"
], function(WMSSublayer) {
	return {
		//Note: This is the ORIGINAL function we moved FROM DURM_LAYERS
		init_aerial_slider: function(){
			sliderscope = this;
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
				sliderscope.switch_to_aerial(value);
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
				sliderscope.switch_to_aerial(v);
			});
		},
		switch_to_aerial: function(index) {
			const item = durm.aeriallist[index];

			if (!item) {
				console.error("No item at index", index);
				return;
			}

			console.log("Switching to aerial index", index, "type:", item.type, "title:", item.title);

			if (item.type === "standard") {
				// Traditional: Hide all layers, show selected one
				console.log("  Type is STANDARD, hiding all enterprise aerials");
				this.hide_all_enterprise_aerials();

				// Hide nearmap if it was showing
				if (durm.nearmap_master_layer) {
					console.log("  Hiding nearmap master layer");
					durm.nearmap_master_layer.visible = false;
				}

				// Show selected standard layer
				if (item.layer) {
					//console.log("  Setting layer visible:", item.layer.id);
					item.layer.visible = true;
					//console.log("  Layer visible is now:", item.layer.visible);
				} else {
					console.error("  ERROR: item.layer is null/undefined!");
				}

			} else if (item.type === "nearmap-virtual") {
				// Nearmap WMS: Update which sublayers are visible on master layer
				//console.log("  Type is NEARMAP-VIRTUAL, hiding all enterprise aerials");
				this.hide_all_enterprise_aerials();

				if (durm.nearmap_master_layer) {
					//console.log("  Nearmap master layer exists, updating sublayers");
					//console.log("  Item has", item.sublayers?.length || 0, "sublayers");

					// Update title
					durm.nearmap_master_layer.title = item.title;

					// Replace the sublayers array with new WMSSublayer instances
					if (item.sublayers && item.sublayers.length > 0) {
						const newSublayers = item.sublayers.map(targetSublayer => {
							return new WMSSublayer({
								name: targetSublayer.name,
								title: targetSublayer.title,
								visible: true
							});
						});
						durm.nearmap_master_layer.sublayers = newSublayers;
						//console.log("  Replaced sublayers with", newSublayers.length, "new sublayers");
					}

					durm.nearmap_master_layer.visible = true;
					//console.log("  Nearmap master layer visible:", durm.nearmap_master_layer.visible);
				} else {
					console.error("  ERROR: durm.nearmap_master_layer is null/undefined!");
				}
			} else {
				// Legacy compatibility: assume it's a layer object with .visible property
				for (var i = 0; i < durm.aeriallist.length; i++) {
					if (i == index) {
						durm.aeriallist[i].visible = true;
					} else {
						durm.aeriallist[i].visible = false;
					}
				}
			}
		},

		hide_all_enterprise_aerials: function() {
			for (var i = 0; i < durm.aeriallist.length; i++) {
				const item = durm.aeriallist[i];
				if (item.type === "standard" && item.layer) {
					item.layer.visible = false;
				}
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
