/*
Aerial imagery layer definitions and loading
Handles both nearmap and non-nearmap aerial/satellite layers
*/

define([
	"esri/portal/PortalItem",
	"esri/layers/TileLayer",
	"esri/layers/VectorTileLayer",
	"esri/layers/ImageryLayer",
	"../durm/durm_slider.js","../durm/durm_nearmap.js",
	"../js/durm_aerial_metadata.js",
], function(PortalItem, TileLayer, VectorTileLayer, ImageryLayer, durm_slider,durm_nearmap, AERIAL_METADATA) {    //Maybe remove the durm_slider import?
	return {
		// Helper function to create a layer from metadata
		create_layer_from_metadata: function(metadata) {
			// Replace placeholder URLs with actual values
			let url = metadata.url;
			if (url === "NEARMAP_URL") {
				url = NEARMAP_URL;
			}

			// Build layer configuration object
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
				visible: metadata.visible,
				legendEnabled: metadata.legendEnabled,
				popupEnabled: metadata.popupEnabled
			};

			// Add nearmap-specific properties
			if (metadata.isNearmap) {
				layerConfig.opacity = metadata.opacity;
				layerConfig.minScale = metadata.minScale;
				layerConfig.maxScale = metadata.maxScale;
				layerConfig.definitionExpression = metadata.definitionExpression;
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
				layer.sliderIndex = metadata.sliderIndex;
				layer.isNearmap = metadata.isNearmap;
			}

			return layer;
		},

		add_aerials: async function(){
			// Start the nearmap check
			durm_nearmap.checkNearmap();

			// Wait for nearmap check to complete
			await durm.nearmapCheckComplete;

			if (durm.use_nearmap) {
				console.log("Adding aerials after Nearmap passed check.");
			} else {
				console.log("Skipping Nearmap imagery due to failed check.");
			}

			// Collect all layers from metadata
			const allLayers = [];

			// Process non-nearmap layers from webgis2 array
			for (const metadata of AERIAL_METADATA.webgis2) {
				const layer = this.create_layer_from_metadata(metadata);
				if (layer) {
					durm[metadata.id] = layer;
					allLayers.push(layer);
					pplt.add_to_map(layer);
				}
			}

			// Process nearmap array - check if nearmap is available for nearmap layers
			for (const metadata of AERIAL_METADATA.nearmap) {
				// Skip nearmap layers if nearmap is not available
				if (metadata.isNearmap && !durm.use_nearmap) {
					continue;
				}

				const layer = this.create_layer_from_metadata(metadata);
				if (layer) {
					durm[metadata.id] = layer;
					allLayers.push(layer);
					pplt.add_to_map(layer);
				}
			}

			// Sort layers by date chronologically
			allLayers.sort((a, b) => {
				const dateA = new Date(a.sortDate);
				const dateB = new Date(b.sortDate);
				return dateA - dateB;
			});

			// Add all layers to the map
			pplt.add_all_layers_to_map(aerials2load);

			// Build aeriallist for slider
			durm.aeriallist = [];

			// Combine both metadata arrays
			const allMetadata = [...AERIAL_METADATA.webgis2, ...AERIAL_METADATA.nearmap];

			// Filter and collect layers with valid sliderIndex
			for (const metadata of allMetadata) {
				// Skip if no sliderIndex defined
				if (metadata.sliderIndex === null) {
					continue;
				}

				// Skip nearmap layers if nearmap not available
				if (metadata.isNearmap && !durm.use_nearmap) {
					continue;
				}

				// Get the layer from durm object
				const layer = durm[metadata.id];
				if (layer) {
					durm.aeriallist.push(layer);
				}
			}

			// Sort by sliderIndex
			durm.aeriallist.sort((a, b) => a.sliderIndex - b.sliderIndex);

			// Default to newest available aerial (last in chronologically sorted list)
			const nonNearmapAerials = durm.aeriallist.filter(layer => !layer.isNearmap);
			if (nonNearmapAerials.length > 0) {
				// Get the last non-nearmap aerial (newest)
				const newestNonNearmap = nonNearmapAerials[nonNearmapAerials.length - 1];
				durm.defaultaerialid = durm.aeriallist.indexOf(newestNonNearmap);
			} else {
				// No non-Nearmap aerials found, use newest overall
				durm.defaultaerialid = durm.aeriallist.length - 1;
			}
			console.log(`Built aeriallist with ${durm.aeriallist.length} layers, default: ${durm.defaultaerialid} (${durm.aeriallist[durm.defaultaerialid]?.title})`);

			// Initialize the aerial slider
			durm_slider.init_aerial_slider();

			console.log("Aerials and Historical Imagery loaded");
		},

		//This is the stub for the NEW add_aerials function that we're going to use when we split NearMap and non-Nearmap
		add_aerials_NEW: async function(){
			console.log("add aerials")
			/* This is used for labeling during Aerial Mode.  It is not turned on/off via layerlist. */
			durm.aeriallabels_item = new PortalItem({ id: "eb214cb984ac42ad9156977c52c1bdb7" });
			durm.aeriallabelsVT = new VectorTileLayer({
				id: "aeriallabels",
				title: "Road Labels for Aerial Photos",
				listcategory: "Cartographic",
				portalItem:durm.aeriallabels_item,
				layer_order:0,
				lyr_zindex:9,
				listMode: "hide",
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.aeriallabelsVT);

			// Non-nearmap aerials - always added
			this.add_non_nearmap_aerials();

			// Nearmap aerials - only add if use_nearmap is true
			if (durm.use_nearmap) {
				this.add_nearmap_aerials();
			}

			// Add all aerial layers to map
			durm_layers.add_all_layers_to_map(aerials2load);

			// Initialize slider
			durm_slider.init_aerial_slider();

			console.log("Aerials and Historical Imagery loaded");
		},

		add_non_nearmap_aerials: function() {
			// Satellite and historical aerials (not nearmap)
			// These are always added regardless of nearmap status

			// Placeholder - will be filled with actual layer definitions
			// from durm_layers.js add_aerials function
			console.log("Adding non-nearmap aerials");
		},

		add_nearmap_aerials: function() {
			// Nearmap-specific layers
			// Only called if durm.use_nearmap is true

			// Placeholder - will be filled with actual nearmap layer definitions
			// from durm_layers.js add_aerials function
			console.log("Adding nearmap aerials");
		}
	};
});
