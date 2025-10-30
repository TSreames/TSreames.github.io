/*
Aerial imagery layer definitions and loading
Handles both nearmap and non-nearmap aerial/satellite layers
*/

define([
	"esri/portal/PortalItem",
	"esri/layers/TileLayer",
	"esri/layers/VectorTileLayer",
	"esri/layers/ImageryLayer",
	"esri/portal/PortalItem","esri/portal/Portal","esri/layers/Layer",
	"esri/layers/support/WMSSublayer",
	"../durm/durm_slider.js","../durm/durm_nearmap.js",
	"../js/durm_aerial_metadata.js",
], function(PortalItem, TileLayer, VectorTileLayer, ImageryLayer,
	PortalItem,Portal,Layer,
	WMSSublayer,
	durm_slider,durm_nearmap, AERIAL_METADATA) {    //Maybe remove the durm_slider import?
	return {


		// For traditional aerials - creates actual layers
		create_standard_layer: function(metadata) {
			// Replace placeholder URLs with actual values
			let url = metadata.url;
			if (url === "NEARMAP_URL") {
				url = NEARMAP_URL;
			}

			const layerConfig = {
				id: metadata.id,
				title: metadata.title,
				listMode: metadata.listMode,
				listcategory: metadata.listcategory,
				layer_order: metadata.layer_order,
				lyr_zindex: metadata.lyr_zindex,
				url: url,
				loadingtype: metadata.loadingtype,
				icon: metadata.icon,
				visible: false, // Start hidden
				legendEnabled: metadata.legendEnabled,
				popupEnabled: metadata.popupEnabled
			};

			// Add layer-type specific properties
			if (metadata.opacity !== undefined) {
				layerConfig.opacity = metadata.opacity;
			}
			if (metadata.minScale !== undefined) {
				layerConfig.minScale = metadata.minScale;
			}
			if (metadata.maxScale !== undefined) {
				layerConfig.maxScale = metadata.maxScale;
			}

			// Create the appropriate layer type
			let layer;
			if (metadata.layerType === "TileLayer") {
				layer = new TileLayer(layerConfig);
			} else if (metadata.layerType === "ImageryLayer") {
				layer = new ImageryLayer(layerConfig);
			}

			// Store metadata on the layer for sorting
			if (layer) {
				layer.sortDate = metadata.sortDate;
				layer.layerType = "standard"; // Mark as standard
			}

			return layer;
		},

		// For nearmap - returns metadata wrapper, not actual layer.  This only works for "Esri Imageserver" version of aerials, not "WMS version"
		// We don't want to use this anymore, but we still want to keep it around, in case we ever decide to use ImageLayer again.
		create_nearmap_virtual_layer_for_IMAGELAYER: function(metadata) {
			return {
				type: "nearmap-virtual",
				id: metadata.id,
				title: metadata.title,
				sortDate: metadata.sortDate,
				definitionExpression: metadata.definitionExpression,    //<<------  This isn't going to work with WMS, because WMS does not use definitionexpression at all!
				metadata: metadata
			};
		},
		// Creates a virtual layer for WMS by finding matching sublayers from dateIndex
	create_nearmap_virtual_layer_for_WMSLAYER: function(metadata) {
			// Blocked months in YYYY-MM format - add months here to exclude them
			//const blockedMonths = ['2023-05','2021-11','2020-01'];  // Note: Some months have broken imagery
			blockedMonths = []

			// Parse the date range from definitionExpression
			// Format: "acquisitiondate BETWEEN TIMESTAMP '2024-10-20 ...' AND TIMESTAMP '2024-11-10 ...'"
			let match = metadata.definitionExpression?.match(/TIMESTAMP '(\d{4}-\d{1,2}-\d{1,2}).*?AND TIMESTAMP '(\d{4}-\d{1,2}-\d{1,2})/);
			if (!match) {
					console.warn(`Could not parse date range for ${metadata.id}`);
					return null;
			}

			let startDate = match[1];
			let endDate = match[2];

			// Find matching groups from the dateIndex
			let dateIndex = durm_nearmap.getDateIndex();
			if (!dateIndex) {
					console.warn("Date index not available yet");
					return null;
			}

			let startD = new Date(startDate);
			let endD = new Date(endDate);
			let matchingSublayers = [];

			for (let [groupStartDate, groupData] of dateIndex.entries()) {
					const groupStart = new Date(groupData.startDate);
					const groupEnd = new Date(groupData.endDate);

					// Check if this group overlaps with the requested date range
					if (groupStart <= endD && groupEnd >= startD) {
							// Check if this group is in a blocked month
							const year = groupStart.getFullYear();
							const month = String(groupStart.getMonth() + 1).padStart(2, '0');
							const yearMonth = `${year}-${month}`;

							if (blockedMonths.includes(yearMonth)) {
									console.log(`Blocking group starting ${groupStartDate} (falls in blocked month ${yearMonth})`);
									continue; // Skip this group
							}

							// Add ALL sublayers from this group (includes merged duplicates)
							matchingSublayers.push(...groupData.sublayers);
					}
			}

			if (matchingSublayers.length === 0) {
					console.warn(`No WMS sublayers found for ${metadata.id} (${startDate} to ${endDate})`);
					return null;
			}

			// Use the title from the grouped data
			let friendlyTitle = null;
			for (let [groupStartDate, groupData] of dateIndex.entries()) {
					const groupStart = new Date(groupData.startDate);
					const groupEnd = new Date(groupData.endDate);
					if (groupStart <= endD && groupEnd >= startD) {
							friendlyTitle = groupData.title;
							break;
					}
			}

			// Fallback title if needed
			if (!friendlyTitle) {
					const firstDate = new Date(startDate);
					const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
					friendlyTitle = `${firstDate.getFullYear()} Nearmap Aerials, ${monthNames[firstDate.getMonth()]}`;
			}

			return {
					type: "nearmap-virtual",
					id: metadata.id,
					title: friendlyTitle,
					sortDate: metadata.sortDate,
					sublayers: matchingSublayers, // Now includes ALL merged sublayers
					metadata: metadata
			};
	},

		add_aerials_HYBRID: async function() {
			// 1. Check nearmap WMS availability and load base layer
			const nearmapData = await durm_nearmap.load_nearmap_for_WMSLAYER();

			if (durm.use_nearmap && nearmapData) {
				console.log("Nearmap WMS loaded successfully");

				// 2. Store the master WMS layer and initialize date index
				durm.nearmap_master_layer = nearmapData.wmsLayer;

				// Set custom properties on the master layer
				durm.nearmap_master_layer.id = "nearmap_master";
				durm.nearmap_master_layer.title = "Nearmap Aerials";
				durm.nearmap_master_layer.listMode = "hide";
				durm.nearmap_master_layer.listcategory = "Aerial Photos, Historical";
				durm.nearmap_master_layer.layer_order = 0;
				durm.nearmap_master_layer.lyr_zindex = 1;
				durm.nearmap_master_layer.visible = false; // Start hidden
				durm.nearmap_master_layer.opacity = 1;
				durm.nearmap_master_layer.minScale = 0;
				durm.nearmap_master_layer.maxScale = 564;
				durm.nearmap_master_layer.popupEnabled = false;
				durm.nearmap_master_layer.legendEnabled = false;
				durm.nearmap_master_layer.loadingtype = "nearmap";

				// Add the master layer to map (initially hidden, sublayers will be managed dynamically)
				pplt.add_to_map(durm.nearmap_master_layer);

				// Wait for the WMS layer to load, then initialize date index
				await durm.nearmap_master_layer.when();
				await durm_nearmap.init(); // Build dateIndex from capabilities or sublayers
				console.log("Created master Nearmap WMS layer");
			} else {
				console.log("Nearmap unavailable - using traditional aerials only");
				showToast(generic_nearmap_error_message);
			}

			// 3. Create traditional layers (one per time period)
			const traditionalLayers = [];
			for (const metadata of AERIAL_METADATA.webgis2) {
				const layer = this.create_standard_layer(metadata);
				if (layer) {
					durm[metadata.id] = layer;
					traditionalLayers.push(layer);
					pplt.add_to_map(layer);
				}
			}
			console.log(`Created ${traditionalLayers.length} enterprise aerial layers`);

			// 4. Actually add all aerial layers to the map
			pplt.add_all_layers_to_map(aerials2load);
			//console.log("Added all aerial layers to map");

			// 5. Build combined slider array (Nearmap groups are now auto-discovered in build_aerial_slider_HYBRID)
			this.build_aerial_slider_HYBRID();
		},

		build_aerial_slider_HYBRID: function() {
			const sliderItems = [];

			// 1. Add all enterprise (non-Nearmap) layers from webgis2 metadata
			for (const metadata of AERIAL_METADATA.webgis2) {
				const layer = durm[metadata.id];
				if (layer && layer.visible !== undefined) {
					sliderItems.push({
						type: "standard",
						id: layer.id,
						title: layer.title,
						sortDate: layer.sortDate,
						layer: layer // Direct reference to layer
					});
				}
			}

			// 2. Add Nearmap groups directly from dateIndex (auto-discovery)
			if (durm.use_nearmap) {
				const dateIndex = durm_nearmap.getDateIndex();
				if (dateIndex) {
					let groupIndex = 0;
					for (const [groupStartDate, groupData] of dateIndex.entries()) {
						groupIndex++;
						sliderItems.push({
							type: "nearmap-virtual",
							id: `nearmap_group_${groupIndex}`,
							title: groupData.title,
							sortDate: groupData.startDate,
							sublayers: groupData.sublayers
						});
					}
				}
			}

			// Sort by sortDate (chronological order)
			sliderItems.sort((a, b) => {
				const dateA = new Date(a.sortDate);
				const dateB = new Date(b.sortDate);
				return dateA - dateB;
			});

			// Assign sliderIndex based on array position
			sliderItems.forEach((item, index) => {
				item.sliderIndex = index;
			});

			// Store in durm.aeriallist for slider
			durm.aeriallist = sliderItems;

			// Default to newest non-nearmap aerial
			const nonNearmapItems = sliderItems.filter(item => item.type === "standard");
			if (nonNearmapItems.length > 0) {
				const newestNonNearmap = nonNearmapItems[nonNearmapItems.length - 1];
				durm.defaultaerialid = sliderItems.indexOf(newestNonNearmap);
			} else {
				durm.defaultaerialid = sliderItems.length - 1;
			}

			console.log(`Built slider with ${sliderItems.length} items (${nonNearmapItems.length} standard, ${sliderItems.length - nonNearmapItems.length} nearmap-virtual)`);

			// Initialize the aerial slider
			durm_slider.init_aerial_slider();
		},

		// Show a specific aerial by index - handles both standard and nearmap-virtual layers
		// This will necessarily be fired as part of enabling aerials -- at the present moment it's part of the init chain for enabling aerials.
		show_aerial_by_index: function(aerialid) {
			console.log(`show_aerial_by_index called with ${aerialid}, aeriallist length: ${durm.aeriallist?.length}`);

			if (aerialid < 0 || aerialid >= durm.aeriallist.length) {
				console.error(`Invalid aerial index: ${aerialid}`);
				return false;
			}

			const item = durm.aeriallist[aerialid];

			if (item.type === "standard" && item.layer) {
				//console.log(`Showing standard layer: ${item.layer.id}`);
				item.layer.visible = true;
				return true;
			} else if (item.type === "nearmap-virtual" && durm.nearmap_master_layer) {
				//console.log(`Showing nearmap-virtual: ${item.title}`);
				//console.log(`[VERIFY] durm.nearmap_master_layer in map: ${durm.map.layers.includes(durm.nearmap_master_layer)}, loaded: ${durm.nearmap_master_layer.loaded}, visible: ${durm.nearmap_master_layer.visible}`);

				// Update title first
				durm.nearmap_master_layer.title = item.title;

				// For WMS: Update the sublayers property to show only the desired sublayers
				// instead of hiding all and then showing some
				if (item.sublayers && item.sublayers.length > 0) {
					// Create new WMSSublayer instances for the desired sublayers
					const newSublayers = item.sublayers.map(targetSublayer => {
						return new WMSSublayer({
							name: targetSublayer.name,
							title: targetSublayer.title,
							visible: true
						});
					});

					// Replace the sublayers array
					durm.nearmap_master_layer.sublayers = newSublayers;
				}

				// Make layer visible
				durm.nearmap_master_layer.visible = true;

				// Handle async loading
				durm.nearmap_master_layer.when(() => {
					//console.log(`RESOLVED: Nearmap layer showing: ${item.title}`);
				}, (error) => {
					console.error(`Nearmap layer failed to load:`, error);
				});

				return true;
			} else {
				// Legacy: assume direct layer object
				if (item.visible !== undefined) {
					item.visible = true;
					return true;
				}
			}

			console.error(`Could not show aerial at index ${aerialid}`);
			return false;
		},

		// Hide all aerials - handles both standard and nearmap-virtual layers
		hide_all_aerials: function() {
			for (let i = 0; i < durm.aeriallist.length; i++) {
				const item = durm.aeriallist[i];
				if (item.type === "standard" && item.layer) {
					item.layer.visible = false;
				} else if (item.visible !== undefined) {
					// Legacy: direct layer object
					item.visible = false;
				}
			}

			// Hide nearmap master layer if it exists
			if (durm.nearmap_master_layer) {
				durm.nearmap_master_layer.visible = false;
			}
		}
	};
});
