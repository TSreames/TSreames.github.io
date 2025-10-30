/*
Matt Reames, 2019-21
This controls almost all the operational layers
*/
define([
	"esri/portal/PortalItem",
	  "esri/layers/FeatureLayer","esri/layers/TileLayer","esri/layers/MapImageLayer","esri/layers/GroupLayer","esri/layers/VectorTileLayer","esri/layers/ImageryLayer",
	  "esri/portal/Portal",
	  "../durm/durm_aerials.js",
	  "../durm/durm_popups.js", "../durm/durm_devcases.js", "../durm/durm_search.js", "../durm/durm_ui.js"
		], function(
			PortalItem,
			FeatureLayer, TileLayer, MapImageLayer, GroupLayer, VectorTileLayer,ImageryLayer,
			Portal,
			durm_aerials,
			durm_popups, durm_devcases, durm_search, durm_ui
    ) {
    return {
		connect_to_portals: async function() {
			// Durham Enterprise portal (for utilities)
			try {
				durm.cityportal = new Portal({
					url: DURHAM_PORTAL_URL
				});
				durm.cityportal.authMode = "anonymous";
				await durm.cityportal.load();
				console.log("✓ Durham portal connected");
				durm.cityportal_available = true;
			} catch (error) {
				console.warn("⚠️ Durham portal failed to connect - utilities layers will not be available");
				console.error(error);
				durm.cityportal_available = false;
				// Don't throw - let app continue
			}

			// ArcGIS Online portal (for address points and other AGOL items)
			try {
				durm.agolportal = new Portal({
					url: "https://www.arcgis.com"
				});
				await durm.agolportal.load();
				console.log("✓ ArcGIS Online portal connected");
				durm.agolportal_available = true;
			} catch (error) {
				console.warn("⚠️ ArcGIS Online portal failed to connect");
				console.error(error);
				durm.agolportal_available = false;
				// Don't throw - let app continue
			}
		},
    	populate: async function(){
			try {
				pplt = this;
				layers2load = []
				aerials2load = []
				durm_popups.pre_init();

				this.add_defaults();
				try {
					await durm_aerials.add_aerials_HYBRID();
				} catch (error) {
					console.error("add_aerials failed:", error);
				}
				this.add_administrative();
				this.add_utilities();
				this.add_planning();
				this.add_permits();
				this.add_economic();
				this.add_electoral();
				this.add_environmental();
				this.add_education();
				this.add_transportation();
				this.add_nconemap();
				this.add_other();

				// Add ALL layers to map FIRST
				this.add_all_layers_to_map(layers2load);  // ← Move to HERE

				// Wait for critical layers to be LOADED and have layer views
				await this.wait_for_critical_layers();

				// THEN build search widget (needs layers ready)
				durm_search.build();

				durm_popups.post_init();
				durm_devcases.buildCaseTypeSelect();
				durm_devcases.buildCaseStatusSelect();
				durm.draw_button.addEventListener("click", function(){
					durm_devcases.render_development_cases()
				});

				//It is VERY important that this runs after ALL the layers have been added.
				durm_ui.reorder_all_layers_to_default();
				return {
					parcels: durm.parcelboundaryLayer,
					addresses: durm.active_address_points
				};
				

			} catch (error) { 
				console.log("We caught a layer that failed to load")
				console.log(error);
				throw error; // Re-throw so caller knows it failed
			}
		},
		wait_for_critical_layers: async function() {
			console.log("Waiting for critical layers to be ready...");

			try {
				// Wait for parcels to load
				if (durm.parcelboundaryLayer) {
					if (!durm.map.layers.includes(durm.parcelboundaryLayer)) {
						throw new Error("Parcel layer not added to map yet");
					}
					await durm.parcelboundaryLayer.when();
					console.log("✓ Parcels loaded");
				} else {
					throw new Error("Parcel layer was never created");
				}

				// Wait for address points to load
				if (durm.active_address_points) {
					if (!durm.map.layers.includes(durm.active_address_points)) {
						throw new Error("Address points layer not added to map yet");
					}
					await durm.active_address_points.when();
					console.log("✓ Address points loaded");
				} else {
					throw new Error("Address points layer was never created");
				}

				// Wait for city limits geometry to load
				if (window.citygeometry) {
					console.log("✓ City limits geometry already loaded");
				} else {
					console.log("⏳ Waiting for city limits geometry...");
					// Wait up to 5 seconds for citygeometry to be set
					let attempts = 0;
					while (!window.citygeometry && attempts < 50) {
						await new Promise(resolve => setTimeout(resolve, 100));
						attempts++;
					}
					if (window.citygeometry) {
						console.log("✓ City limits geometry loaded");
					} else {
						console.warn("⚠️ City limits geometry failed to load - popups may be broken");
						// Don't throw - let app continue but warn
					}
				}

				// Wait for layer views to be ready
				await durm.mapView.whenLayerView(durm.parcelboundaryLayer);
				await durm.mapView.whenLayerView(durm.active_address_points);
				console.log("✓ Layer views ready");

				return true;
			} catch (error) {
				console.error("Critical layer failed to load:", error);
				throw error;
			}
		},
		add_to_map: async function(l0) {
			// If this layer is marked as Nearmap and use_nearmap is false, skip it
			if (l0.loadingtype === "nearmap" && durm.use_nearmap === false) {
				console.log("Skipping Nearmap layer due to use_nearmap set to false -- could not load URL.");
				return;
			}
			else if (l0.loadingtype === "nearmap" && durm.use_nearmap === true) {
				//Nearmap layer, only gets added if use_nearmap is true
				aerials2load.push(l0);				
				return;
			}
			else if (l0.loadingtype === "enterprisetile") {
				//Enterprise tile layer, always gets added.
				aerials2load.push(l0);				
				return;
			}
			else {
				//Normal feature layer, always gets added.
				layers2load.push(l0);
				return;
			}

		},		
		//Note that this is run a few times - once on layers2load and once on aerials2load
		add_all_layers_to_map: function(stuff2load){
			durm.map.addMany(stuff2load);
		},
		add_defaults: async function(){
			const addresslabelClass = { // autocasts as new LabelClass()
				symbol: {
				  type: "text", // autocasts as new TextSymbol()
				  color: "black",
				  haloColor: "white",
				  haloSize: "0.8px",
				  xoffset: 0,
				  yoffset: 0,
				  font: { // autocast as new Font()
						family: "sans-serif",
						size: 7,
						weight: "bold",
						decoration: "none",
						style: "normal"
				  }
				},
				labelPlacement: "center-center",
				minScale: 2000,
				labelExpressionInfo: {
					expression: "$feature.SITE_ADDRE"
				}
			};
			addresslabelClass.deconflictionStrategy = "static";

			durm.active_address_points = new FeatureLayer({
				id: "active_address_points",
				title: "Address Points",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:9,
				url: ADDRESS_FS_URL,
				// DO NOT USE THE PORTAL ITEM. It just doesn't work sometimes. IDGI. maybe my syntax is off. Maybe having dual portals is a bad idea. I don't know, I just know the service URL works EVERY TIME and we can't afford to have any errors with address points.
				// portalItem: {
				// 	// autocasts as new PortalItem
				// 	id: "2defd7f6efd5483bb044bf873444ecc7",
				// 	portal: durm.agolportal
				// },					
				icon: "DUR",
				labelingInfo: [addresslabelClass],
				popupEnabled: false,
				visible: true
			});
			durm.active_address_points.minScale = 3000;
			pplt.add_to_map(durm.active_address_points);
			durm.active_address_points.on('error', function(error){
				console.info(error);
			});

			durm.parcellabels = new MapImageLayer({
				id: "parcellabels",
				spatialReference: { wkid: 102100 },
				title: "PIN and PID Labels",
				listMode: "show",
				listcategory: "Cartographic",
				layer_order:0,
				lyr_zindex:7,
				url: PROPERTYINFO,
				icon: "DUR",
				minScale: 2260,
				maxScale: 0,
				visible: false,
				sublayers:[
					{
						id: 0,
						visible: false
					},
					{
						id: 1,
						visible: false
					},
					{
						id: 2,
						visible: false
					},
					{
						id: 3,
						visible: false
					},
					{
						id: 6,
						visible: false
					},
					{
						id: 4,
						visible: true
					},
					{
						id: 5,
						visible: true
					}
				],
			});
			pplt.add_to_map(durm.parcellabels);


			durm.parcelboundaryLayer = new FeatureLayer({
				id: "parcels",
				spatialReference: { wkid: 102100 },
				title: "Parcels, Durham County",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:7,
				url: PARCELS_AGOL,
				icon: "DUR",
				outFields: ["*"],
				renderer: parcelboundaryRenderer,
				popupTemplate: {
					title: "REID: {REID}", 
					actions: [parcelNotificationToolAction],
					outFields: ["*"],// We NEED for outfields to be specified here, because it makes the popups work correctly in cases where there are multiple target parcels.
					content: durm_popups.queryParcelforPopup //Note that this fires, not for every click, but for every parcel that gets selected. So it could run 10x or 100x
				}
			});
			durm.parcelboundaryLayer.minScale = 18000;
			pplt.add_to_map(durm.parcelboundaryLayer);

			durm.orangepars = new FeatureLayer({
				id:"orangepars",
				title:"Parcels, City of Durham in Orange County",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:7,
				renderer: orangeparcelboundaryRenderer,
				url: ORANGE_URL,
				definitionExpression: "Zoning_Admin = 'Durham'"	
			});
			durm.orangepars.minScale = 18000;
			pplt.add_to_map(durm.orangepars);	

			durm.wakepars = new FeatureLayer({
				id:"wakepars",
				title:"Parcels, City of Durham in Wake County",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:7,
				renderer: wakeparcelboundaryRenderer,
				url: WAKE_URL,
				definitionExpression: "CITY = 'DUR'"
			});
			durm.wakepars.minScale = 18000;
			pplt.add_to_map(durm.wakepars);

			durm.countymask = new VectorTileLayer({
				id: "countymask",
				title: "Durham County Boundary (shaded)",
				listMode: "show",
				listcategory: "Cartographic",
				layer_order:0,
				lyr_zindex:7,
				url: countymask,
				icon: "NC",
				visible: true,
				opacity:0.85
			});				
			pplt.add_to_map(durm.countymask);


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


		},
		add_administrative: async function(){
			durm.cityboundaryLayer = new FeatureLayer({
				id: "citylimits",
				title: "City of Durham Boundary (Lines)",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:7,
				url: CITY_BOUNDARY,
				icon: "DUR",
				popupEnabled: false,
				visible: false
			});				
			pplt.add_to_map(durm.cityboundaryLayer);

			
			durm.countyboundarylayer = new FeatureLayer({
				id: "citylimits",
				title: "Durham County Boundary (Lines)",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:7,
				url: COUNTY_URL,
				icon: "DUR",
				popupEnabled: false,
				visible: false
			});				
			pplt.add_to_map(durm.countyboundarylayer);

			durm.citymask = new VectorTileLayer({
				id: "citymask",
				title: "Area not in City of Durham (shaded)",
				listMode: "show",
				listcategory: "Cartographic",
				layer_order:0,
				lyr_zindex:7,
				url: citymask,
				icon: "DUR",
				visible: false,
				opacity:0.85
			});				
			pplt.add_to_map(durm.citymask);	

			durm.parcellabels = new MapImageLayer({
				id: "parcellabels",
				title: "Calculated Parcel Annotation",
				listMode: "show",
				listcategory: "Cartographic",
				layer_order:0,
				lyr_zindex:8,
				url: CALCANNO_URL,
				icon: "DUR",
				minScale: 2260,
				maxScale: 0,
				sublayers:[
					{
						id: 0,
						visible: true
					}
				],
				visible: false
			});
			pplt.add_to_map(durm.parcellabels);			

			durm.RTPboundarylayer = new FeatureLayer({
				id: "RTPboundary",
				title: "Research Triangle Park Boundary",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:8,
				icon: "DUR",
				url: RTP_BOUNDARY_URL,
				visible: false
			});
			pplt.add_to_map(durm.RTPboundarylayer);	

			durm.taxdistrictslayer = new FeatureLayer({
				id: "taxdistricts",
				title: "Tax Districts",
				listMode: "show",
				url: TAX_DISTRICTS_URL,
				icon: "DUR",
				listcategory: "Administrative",
				popupEnabled: true,
				layer_order:0,
				lyr_zindex:4,
				visible: false,
				opacity:0.85
			});
			pplt.add_to_map(durm.taxdistrictslayer);

			durm.code_officer_areas = new FeatureLayer({
				id: "code_officer_areas",
				title: "NIS Code Enforcement Officer Areas",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:2,
				url: CODE_ENF_OFF_AREAS,
				icon: "DUR",
				opacity: 0.95,
				visible: false
			});
			pplt.add_to_map(durm.code_officer_areas);
		},
		add_planning: async function(){
			durm.caseLayer = new FeatureLayer({
				id: "cases",
				title: "Development Cases",
				listcategory: "Planning",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: ALL_DEV_CASES,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false,
				renderer: renderer_cases
				//popupTemplate: caseLayer_popup
			});
			pplt.add_to_map(durm.caseLayer);

			durm.townshipsLayer = new FeatureLayer({
				id: "townships",
				title: "Townships",
				listcategory: "Administrative",
				listMode: "show",
				layer_order:0,
				lyr_zindex:7,
				url: TOWNSHIPS_URL,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.townshipsLayer);

			durm.transitionalofficeoverlay = new FeatureLayer({
				id: "transitionalofficeoverlay",
				title: "Transitional Office Overlay",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: TRANSITIONAL_OFFICE_OVERLAY_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.transitionalofficeoverlay);
			
			durm.watershedprotectionoverlay = new FeatureLayer({
				id: "watershednotification",
				title: "Watershed Protection Overlay",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: WATERSHED_PROTECTION_URL_SUBLAYER,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.watershedprotectionoverlay);
			const npolabelClass = { // autocasts as new LabelClass()
				symbol: {
					type: "text", // autocasts as new TextSymbol()
					color: "yellow",
					haloColor: "#333",
					haloSize: "0.8px",
					xoffset: 0,
					yoffset: 0,
					font: { // autocast as new Font()
						family: "sans-serif",
						size: 12,
						weight: "bold",
						decoration: "none",
						style: "normal"
					}
				},
					labelPlacement: "always-horizontal", // This changes between polygon/point/line
					minScale: 19000,
					labelExpressionInfo: {
						expression: "$feature.NPO_NAME + ' NPO'"
					}
				};
			durm.NPOlayer = new FeatureLayer({
				id: "NPO",
				title: "Neighborhood Protection Overlay (NPO)",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: NPO_URL_SUBLAYER,
				icon: "DUR",
				labelingInfo: [npolabelClass],
				renderer: NPORenderer,
				popupTemplate: {title:"Neighborhood Protection Overlay",content:[{
					type: "fields",
					fieldInfos: [{
						fieldName: "NPO_NAME",
						label: "Name"
						},{
							fieldName: "CASE_NO",
							label: "Case Number"
						},{
							fieldName: "ADOPTED",
							label: "Date Adopted"
						},{
							fieldName: "ACRES",
							label: "Acres"
						}]
					}]
				},
				visible: false,
				opacity: 0.9
			});
			pplt.add_to_map(durm.NPOlayer);
			
			
			//Natl Historic Districts
			const HDlabelClass = { // autocasts as new LabelClass()
				symbol: {
					type: "text", // autocasts as new TextSymbol()
					color: "green",
					haloColor: "#eee",
					haloSize: "0.8px",
					xoffset: 0,
					yoffset: 0,
					font: { // autocast as new Font()
						family: "sans-serif",
						size: 12,
						weight: "bold",
						decoration: "none",
						style: "normal"
					}
				},
					labelPlacement: "always-horizontal", // This changes between polygon/point/line
					minScale: 19000,
					labelExpressionInfo: {
						expression: "$feature.NAME"
					}
				};
			durm.NHDlayer = new FeatureLayer({
				id: "NHD",
				title: "National Historic Districts",
				listMode: "show",
				listcategory: "Historic",
				layer_order:0,
				lyr_zindex:8,
				url: NATL_HIST_DISTRICTS_URL_SUBLAYER,
				icon: "USA",
				visible: false,
				opacity: 0.9
			});
			pplt.add_to_map(durm.NHDlayer);


			durm.LocHistLandmarks = new FeatureLayer({
				id: "LocHistLandmarks",
				title: "Local Historic Landmarks",
				listMode: "show",
				listcategory: "Historic",
				layer_order:0,
				lyr_zindex:8,
				url: LOCAL_HIST_LANDMARKS_SUBLAYER,
				icon: "DUR",
				visible: false,
				opacity: 0.9
			});
			pplt.add_to_map(durm.LocHistLandmarks);


			durm.LocHistDist = new FeatureLayer({
				id: "LocHistDist",
				title: "Local Historic Districts",
				listMode: "show",
				listcategory: "Historic",
				layer_order:0,
				lyr_zindex:8,
				url: LHD_URL_SUBLAYER,
				icon: "DUR",
				visible: false,
				opacity: 0.9
			});
			pplt.add_to_map(durm.LocHistDist);

			durm.FGAs = new FeatureLayer({
				id: "FGAs",
				title: "Future Growth Areas",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:7,
				url: NEW_FGA_URL,
				icon: "DUR",
				visible: false,
				opacity: 0.65
			});
			pplt.add_to_map(durm.FGAs);

			durm.urbangrowthboundary = new FeatureLayer({
				id: "urbangrowthboundary",
				title: "Urban Growth Boundary",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:4,
				url: NEW_UGB_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.urbangrowthboundary);

			// durm.placetype = new TileLayer({
			// 	id: "placetype",
			// 	title: "Draft Place Type Map",
			// 	listMode: "show",
			// 	listcategory: "Planning",
			// 	layer_order:0,
			// 	lyr_zindex:2,
			// 	url: PLACETYPE_URL,
			// 	icon: "DUR",
			// 	visible: false,
			// 	opacity: 1
			// });
			// pplt.add_to_map(durm.placetype);

			durm.placetype = new FeatureLayer({
				id: "placetype",
				title: "Place Type Map",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:2,
				url: NEW_PLACETYPE_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.placetype);

			durm.zoninglayer = new TileLayer({
				id: "zoning",
				title: "Zoning",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:2,
				url: ZONINGURL,
				icon: "DUR",
				visible: false,
				opacity: 1
			});
			pplt.add_to_map(durm.zoninglayer);
			
			// durm.FLUlayer = new TileLayer({
			// 	id: "FLU",
			// 	title: "Future Land Use",
			// 	listMode: "show",
			// 	listcategory: "Planning",
			// 	layer_order:0,
			// 	lyr_zindex:2,
			// 	url: FUTURE_LAND_USE_URL,
			// 	icon: "DUR",
			// 	visible: false,
			// 	opacity: 1
			// });
			// pplt.add_to_map(durm.FLUlayer);

			durm.STREETSIMPACTFEEZONE = new FeatureLayer({
				id: "STREETSIMPACTFEEZONE",
				title: "Streets Impact Fee Zones",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:4,
				url: STREETS_IMPACT_FEE_ZONES,
				icon: "DUR",
				visible: false,
				opacity: 0.95
			});
			pplt.add_to_map(durm.STREETSIMPACTFEEZONE);
			
			durm.OPENSPACEIMPACTFEEZONE = new FeatureLayer({
				id: "OPENSPACEIMPACTFEEZONE",
				title: "Open Space Land Impact Fee Zones",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:2,
				url: OPENSPACEIMPACTFEEZONE_URL,
				icon: "DUR",
				visible: false,
				opacity: 0.95
			});
			pplt.add_to_map(durm.OPENSPACEIMPACTFEEZONE);

			durm.PARKSIMPACTFEEZONES = new FeatureLayer({
				id: "PARKSIMPACTFEEZONES",
				title: "Parks and Recreation Facility Impact Fee Zones",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:2,
				url: PARKS_IMPACT_FEE_ZONES,
				icon: "DUR",
				visible: false,
				opacity: 0.95
			});
			pplt.add_to_map(durm.PARKSIMPACTFEEZONES);	
			
			durm.developmenttiers = new FeatureLayer({
				id: "developmenttiers",
				title: "Development Tiers",
				listcategory: "Planning",
				//sublayers:[{
				//	id: 5,
				//	visible:true
				//}],
				layer_order:0,
				lyr_zindex:8,
				url: DEVELOPMENT_TIERS_URL_SUBLAYER,
				icon: "DUR",
				visible: false,
				popupEnabled: false
			});
			pplt.add_to_map(durm.developmenttiers);



			durm.airportoverlay = new FeatureLayer({
				id: "airportoverlay",
				title: "Airport Overlay",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: AIRPORT_URL_SUBLAYER,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.airportoverlay);	

			
			durm.ruralvillages = new FeatureLayer({
				id: "ruralvillages",
				title: "Rural Villages",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: RURAL_VILLAGES_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.ruralvillages);	

			durm.EDOSPgroup = new GroupLayer({
				id: "EDOSP",
				title: "Eastern Durham Open Space Plan",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.EDOSPgroup);
							
			durm.EDOSPB = new MapImageLayer({
				id: "EDOSPB",
				title: "Eastern Durham Open Space Plan Buffers",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:6,
				url: EDSOP_URL,
				sublayers:[{
					id: 23
				}],
				visible: true
			});
			durm.EDOSPgroup.add(durm.EDOSPB);

			durm.EDOSPWC = new MapImageLayer({
				id: "EDOSPWC",
				title: "Eastern Durham Open Space Plan Wildlife Corridors",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:6,
				url: EDSOP_URL,
				sublayers:[{
					id: 22				
				}],
				visible: true
			});
			durm.EDOSPgroup.add(durm.EDOSPWC);



			durm.restrictedcovenants = new FeatureLayer({
				id: "restrictedcovenants",
				title: "Preservation Durham Restricted Covenants",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:8,
				url: PDRC_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.restrictedcovenants);	



		},
		add_permits: async function(){
			durm.bldgpermitLayer = new FeatureLayer({
				id: "building_permits",
				title: "All Building Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: BUILDING_PERMITS_SUBLAYER,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.bldgpermitLayer);

			durm.activebldgpermitLayer = new FeatureLayer({
				id: "active_building_permits",
				title: "Active Building Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: ACTV_BLDG_PERMITS_URL_SUBLAYER,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.activebldgpermitLayer);

			durm.activeplumbpermitLayer = new FeatureLayer({
				id: "active_plumbing_permits",
				title: "Active Plumbing Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: ACTV_PLUMB_PERMITS_URL_SUBLAYER,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.activeplumbpermitLayer);

			durm.activeelecpermitLayer = new FeatureLayer({
				id: "active_elec_permits",
				title: "Active Electrical Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: ACTV_ELEC_PERMITS_URL_SUBLAYER,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.activeelecpermitLayer);

			durm.activemechpermitLayer = new FeatureLayer({
				id: "active_mech_permits",
				title: "Active Mechanical Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: ACTV_MECH_PERMITS_URL_SUBLAYER,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.activemechpermitLayer);

			durm.certificates_of_occupancy = new FeatureLayer({
				id: "certificates_of_occupancy",
				title: "Certificates of Occupancy",
				listMode: "show",
				listcategory: "Permits",
				layer_order:0,
				lyr_zindex:10,
				url: CO_URL_SUBLAYER,
				icon: "DUR",
				visible: false,
				featureReduction: {
					type: "cluster",
					clusterRadius:"25px",
					popupTemplate: {
						content: "This cluster represents <b>{cluster_count}</b> features.",
						fieldInfos: [{
							fieldName: "cluster_count",
							format: {
								digitSeparator: true,
								places: 0
							}
						}]
					}
				}
			});
			pplt.add_to_map(durm.certificates_of_occupancy);

			durm.demo_permits = new FeatureLayer({
				id: "demo_permits",
				title: "Demolition Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: DEMO_PERMITS_URL,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.demo_permits);


		},
		add_economic: async function(){
			durm.oppzones = new FeatureLayer({
				id: "oppzones",
				title: "Opportunity Zones",
				listMode: "show",
				listcategory: "Economic",
				layer_order:0,
				lyr_zindex:8,
				url: OPP_ZONES_URL,
				icon: "USA",
				visible: false,
				popupTemplate: {title:"Opportunity Zones",content:[{
					type: "fields",
					fieldInfos: [{
						fieldName: "NAMELSAD10",
						label: "Tract"
						}]
					}]
				}
			});				
			pplt.add_to_map(durm.oppzones);	

			durm.LTHG = new FeatureLayer({
				id: "LTHG",
				title: "Longtime Homeowner Grant Assistance Areas",
				listMode: "show",
				listcategory: "Economic",
				opacity:0.6,
				layer_order:0,
				lyr_zindex:8,
				url: LTHG_URL,
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.LTHG);	

			durm.TCHI = new FeatureLayer({
				id: "TCHI",
				title: "City Housing Investment in Target Areas (2010-2015)",
				listMode: "show",
				listcategory: "Economic",
				layer_order:0,
				lyr_zindex:9,
				url: TCHI_URL,
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.TCHI);	
		},
		add_environmental: async function(){
			durm.elevation_2010 = new MapImageLayer({
				id: "elevation_2010",
				title: "Elevation 2010",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:2,
				url: ELEV2010_URL,
				icon: "NC",
				visible: false
			});
			pplt.add_to_map(durm.elevation_2010);


			durm.soilslayer = new TileLayer({
				id: "soilslayer",
				title: "Soils",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:2,
				url: SOILS_URL,
				icon: "USA",
				visible: false,
				opacity:0.65
			});				
			pplt.add_to_map(durm.soilslayer);

			durm.NWIlayer = new MapImageLayer({
					id: "NWIlayer",
					title: "National Wetland Inventory",
					listMode: "show",
					listcategory: "Environmental",
					layer_order:0,
					lyr_zindex:5,
					url: NWI_URL,
					icon: "USA",
					visible: false,
					opacity:0.65
				});				
				pplt.add_to_map(durm.NWIlayer);
			
			durm.impervious = new TileLayer({
					id: "impervious",
					title: "Impervious Surfaces (Building Footprints)",
					listMode: "show",
					listcategory: "Environmental",
					layer_order:0,
					lyr_zindex:6,
					url: IMPERV_URL,
					icon: "DUR",
					visible: false,
					opacity:0.95
				});				
				pplt.add_to_map(durm.impervious);

			durm.TOPO_2ft = new TileLayer({
				id: "TOPO_2ft",
				title: "Topographic Contour Lines, 2 feet",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:4,
				icon: "DUR",
				url: TOPO_2ft,
				visible: false
			});
			pplt.add_to_map(durm.TOPO_2ft);

			durm.FEMA_risk_development = new MapImageLayer({
				id: "FEMA_risk_development",
				title: "FEMA Flood Zones 2018 (for development purposes)",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:5,
				url: FIRM2018D_URL,
				icon: "USA",
				visible: false
			});
			pplt.add_to_map(durm.FEMA_risk_development);
			
			durm.FEMA_risk_insurance = new MapImageLayer({
				id: "FEMA_risk_insurance",
				title: "FEMA Flood Zones 2018 (for insurance purposes)",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:5,
				url: FIRM2018I_URL,		
				icon: "USA",		
				visible: false
			});
			pplt.add_to_map(durm.FEMA_risk_insurance);


			durm.triassicsoils = new FeatureLayer({
				id: "triassicsoils",
				title: "Triassic Soils Basin",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:3,
				url: TRIASSIC_SOILS_URL,
				icon: "USA",
				opacity:0.65,
				visible: false
			});				
			pplt.add_to_map(durm.triassicsoils);	

			durm.erosiondistricts = new FeatureLayer({
				id: "erosiondistricts",
				title: "Sedimentation and Erosion Inspection Districts",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:3,
				url: EROSIONDISTRICTS_URL,
				icon: "DUR",
				opacity:0.65,
				visible: false
			});				
			pplt.add_to_map(durm.erosiondistricts);


		},
		add_education: async function(){


			/* 25-26 */
			durm.highschools25_26 = new VectorTileLayer({
				id: "highschools25_26",
				title: "High Schools and Zones, 2025-2026",
				listMode: "show",
				listcategory: "Education",
				url: dps_high_2526,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.55
			});
			pplt.add_to_map(durm.highschools25_26);


			durm.middleschools25_26 = new VectorTileLayer({
				id: "middleschools25_26",
				title: "Middle Schools and Zones, 2025-2026",
				listMode: "show",
				listcategory: "Education",
				url: dps_middle_2526,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.55
			});
			pplt.add_to_map(durm.middleschools25_26);


			durm.elemschools25_26 = new VectorTileLayer({
				id: "elemschools25_26",
				title: "Elementary Schools and Zones, 2025-2026",
				listMode: "show",
				listcategory: "Education",
				url: dps_elementary_2526,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.55
			});
			pplt.add_to_map(durm.elemschools25_26);
			
			

			/* 24-25 */
			durm.highschools24_25 = new VectorTileLayer({
				id: "highschools24_25",
				title: "High Schools and Zones, 2024-2025",
				listMode: "show",
				listcategory: "Education",
				url: dps_high_2425,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.highschools24_25);


			durm.middleschools24_25 = new VectorTileLayer({
				id: "middleschools24_25",
				title: "Middle Schools and Zones, 2024-2025",
				listMode: "show",
				listcategory: "Education",
				url: dps_middle_2425,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.middleschools24_25);


			durm.elemschools24_25 = new VectorTileLayer({
				id: "elemschools24_25",
				title: "Elementary Schools and Zones, 2024-2025",
				listMode: "show",
				listcategory: "Education",
				url: dps_elementary_2425,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.elemschools24_25);



			/* 23-24 */
			durm.highschools23_24 = new VectorTileLayer({
				id: "highschools23_24",
				title: "High Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				url: dps_high_2324,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.highschools23_24);


			durm.middleschools23_24 = new VectorTileLayer({
				id: "middleschools23_24",
				title: "Middle Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				url: dps_middle_2324,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.middleschools23_24);


			durm.elemschools23_24 = new VectorTileLayer({
				id: "elemschools23_24",
				title: "Elementary Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				url: dps_elementary_2324,
				layer_order:0,
				lyr_zindex:6,
				icon: "DUR",
				visible: false,
				opacity:0.65
			});
			pplt.add_to_map(durm.elemschools23_24);
		},
		add_electoral: async function(){
			// durm.voter_precincts = new MapImageLayer({
			// 	id: "voter_precincts",
			// 	title: "Voter Precincts",
			// 	listMode: "show",
			// 	listcategory: "Electoral",
			// 	layer_order:0,
			// 	lyr_zindex:6,
			// 	url: VOTERPRECINCT_URL,
			// 	icon: "DUR",
			// 	sublayers:[{
			// 		id: 2,
			// 		visible: true
			// 	}],
			// 	visible: false				
			// });
			// pplt.add_to_map(durm.voter_precincts);

			durm.voter_precincts = new FeatureLayer({
				id: "voter_precincts",
				title: "Voter Precincts",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:6,
				url: VOTERPRECINCT_FEATURE_URL,
				icon: "DUR",
				visible: false				
			});
			pplt.add_to_map(durm.voter_precincts);

			VOTERPRECINCT_FEATURE_URL

			durm.schoolboard_dist = new FeatureLayer({
				id: "schoolboard_dist",
				title: "School Board Districts",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:2,
				url: SCHOOL_BOARD_DIST,
				icon: "DUR",
				opacity: 0.95,
				visible: false
			});
			pplt.add_to_map(durm.schoolboard_dist);	


			durm.PAClayer = new FeatureLayer({
				id: "PACDistricts",
				title: "PAC Districts",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:2,
				url: PAC_DISTRICTS,
				icon: "DUR",
				opacity: 1,
				visible: false
			});
			pplt.add_to_map(durm.PAClayer);	

			const USHOUSElabelClass = { // autocasts as new LabelClass()
				symbol: {
					type: "text", // autocasts as new TextSymbol()
					color: "black",
					haloColor: "white",
					haloSize: "0.8px",
					xoffset: 0,
					yoffset: 0,
					font: { // autocast as new Font()
						family: "sans-serif",
						size: 12,
						weight: "bold",
						decoration: "none",
						style: "normal"
					}
				},
					labelExpressionInfo: {
						expression: "'District ' + $feature.District"
					}
			};			  
			durm.USHOUSE = new FeatureLayer({
				id: "USHOUSE",
				title: "US Congressional Districts",
				listMode: "show",
				listcategory: "Electoral",					
				layer_order:0,
				lyr_zindex:2,
				url: US_CONG_DIST,
				icon: "USA",
				labelingInfo: [USHOUSElabelClass],
				visible: false
			});
			pplt.add_to_map(durm.USHOUSE);
			
			durm.NCSENATE = new FeatureLayer({
				id: "NCSENATE",
				title: "NC Senate Districts",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:2,
				url: NCSENATE_URL,
				icon: "NC",
				visible: false
			});
			pplt.add_to_map(durm.NCSENATE);

			durm.NCHOUSE = new FeatureLayer({
				id: "NCHOUSE",
				title: "NC House Districts",
				listMode: "show",
				url: NCHOUSE_URL,
				icon: "NC",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:2,
				opacity: 0.7,
				visible: false
			});
			pplt.add_to_map(durm.NCHOUSE);
			
			durm.councilwardslayer = new FeatureLayer({
				id: "councilwards",
				title: "City Council Wards",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:3,
				opacity: 0.95,
				url: COUNCIL_WARDS_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.councilwardslayer);	
		},
		add_nconemap: async function(){
			
			// Hazards		
			durm.brownfields = new FeatureLayer({
				id: "brownfields",
				title: "NC Brownfields Program",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: BROWNFIELDS_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.brownfields);

			durm.hazwaste = new FeatureLayer({
				id: "hazwaste",
				title: "NC DEQ Hazardous Waste Sites (2019)",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: HAZWASTE_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.hazwaste);		

			/*durm.inactivehazsites = new FeatureLayer({
				id: "inactivehazsites",
				title: "NC DEQ Inactive Hazardous Sites",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: INACTIVEHAZ_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.inactivehazsites);*/
			
			durm.active_permitted_landfills = new FeatureLayer({
				id: "active_permitted_landfills",
				title: "NC DEQ Active Permitted Landfills",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: LANDFILLS_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.active_permitted_landfills);

			durm.preregulatory_landfills = new FeatureLayer({
				id: "preregulatory_landfills",
				title: "NC DEQ Pre-Regulatory Landfill Sites",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: LANDFILLS_PREREG_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.preregulatory_landfills);

			durm.deq401cert = new FeatureLayer({
				id: "deq401cert",
				title: "NC DEQ Wetland Permits, 401 Certification",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:10,
				url: DEQ401_cert_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.deq401cert);


			durm.npdesnondischarge = new FeatureLayer({
				id: "npdesnondischarge",
				title: "NPDES Non Discharge Permits",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: npdesnondischarge_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.npdesnondischarge);

			durm.npdeswastewaterdischarge = new FeatureLayer({
				id: "npdeswastewaterdischarge",
				title: "NPDES Wastewater Discharge Permits",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: npdeswastewaterdischarge_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.npdeswastewaterdischarge);

			/*
			durm.drycleaning = new FeatureLayer({
				id: "drycleaning",
				title: "Dry-cleaning Solvent Cleanup Sites",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: DRYCLEANING_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.drycleaning);
			*/

			
			/*
			durm.state_hydrography = new FeatureLayer({
				id: "state_hydrography",
				title: "State Hydrography",
				listMode: "show",
				listcategory: "Environmental",
				layer_order:0,
				lyr_zindex:8,
				url: STATE_HYDRO_URL,
				icon: "NC",
				visible: false
			});
			pplt.add_to_map(durm.state_hydrography); 
			*/

			const statelandlabelClass = { // autocasts as new LabelClass()
				symbol: {
					type: "text", // autocasts as new TextSymbol()
					color: "black",
					haloColor: "white",
					haloSize: "0.8px",
					xoffset: 0,
					yoffset: 0,
					font: { // autocast as new Font()
						family: "sans-serif",
						size: 7,
						weight: "bold",
						decoration: "none",
						style: "normal"
					}
				},
					labelPlacement: "always-horizontal", // This changes between polygon/point/line
					minScale: 152000,
					labelExpressionInfo: {
						expression: "$feature.ComplexNam"
					}
			};
			
			durm.state_owned_land = new FeatureLayer({
				id: "state_owned_land",
				title: "State-Owned Land",
				listMode: "show",
				listcategory: "Administrative",
				layer_order:0,
				lyr_zindex:8,
				url: STATE_OWNED_LAND,
				icon: "NC",
				visible: false,
				labelingInfo: [statelandlabelClass],
			});
			pplt.add_to_map(durm.state_owned_land)
			
		},
		add_transportation: async function(){
			  durm.STREETMAINT = new TileLayer({
				  id: "STREETMAINT",
				  title: "Road and Street Maintenance Responsibility",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: STREETMAINT_URL,
					icon: "DUR",
				  visible: false
				});
			  pplt.add_to_map(durm.STREETMAINT);
			  
			  durm.major_transportation_corridor = new FeatureLayer({
				  id: "major_transportation_corridor",
				  title: "Major Transportation Corridor",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:4,
					url: MAJOR_TRANSPORTATION_CORRIDOR_URL,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.major_transportation_corridor); 

				

				durm.VTCD = new FeatureLayer({
					id: "VTCD",
					title: "Vertical Traffic Calming Devices",
					  listMode: "show",
					  listcategory: "Transportation",
					  layer_order:0,
					  lyr_zindex:6,
					  url: VTCD_URL,
					  icon: "DUR",
					visible: false
				  });
				  pplt.add_to_map(durm.VTCD);  

				
			  durm.sidewalkslayer = new FeatureLayer({
				  id: "sidewalkslayer",
				  title: "Sidewalks",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: SIDEWALKS,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.sidewalkslayer);  

				durm.poles = new FeatureLayer({
				  id: "poles",
				  title: "Poles",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: POLES_URL,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.poles); 

				durm.signals = new FeatureLayer({
				  id: "signals",
				  title: "Signals",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: SIGNALS_URL,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.signals); 
			  
				durm.DATA_Bus_Group = new GroupLayer({
				  id: "DATA_Bus_Group",
				  title: "Bus Routes and Stops",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.DATA_Bus_Group);

				durm.busstops = new FeatureLayer({
				  id: "busstops",
				  title: "GoDurham Bus Stops",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: BUS_STOPS,
				  visible: true
				});
				durm.DATA_Bus_Group.add(durm.busstops);	  
				
			  durm.buslines = new FeatureLayer({
				  id: "buslines",
				  title: "GoDurham Bus Lines",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:8,
					url: BUS_ROUTES,
					icon: "NC",
				  visible: true
				});
				durm.DATA_Bus_Group.add(durm.buslines);


			  
			  durm.BIKEFACILITIES = new FeatureLayer({
				  id: "BIKEFACILITIES",
				  title: "Bike Facilities",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,					
					url: BIKEFACILITIES_URL,
					icon: "DUR",
				  visible: false
				});
			  pplt.add_to_map(durm.BIKEFACILITIES);  
			  
			  durm.DCHCMPO = new FeatureLayer({
				  id: "DCHCMPO",
				  title: "Durham-CH-Carrboro MPO Boundary",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:2,
					url: DCHCMPO_URL,
					icon: "NC",
				  visible: false,
					popupEnabled:false
				});
				pplt.add_to_map(durm.DCHCMPO); 
		},
		add_utilities: async function(){				
				//utilities				
				durm.watershedslayer = new FeatureLayer({
					id: "watershedslayer",
					title: "Stormwater Regulatory Basins (Watersheds)",
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:4,
					url: WATERSHEDS_URL,
					icon: "DUR",
					visible: false,
					opacity: 0.55
				});				
				pplt.add_to_map(durm.watershedslayer);	
				
				//sw
				durm.stormwatergroup = new MapImageLayer({
						id: "stormwaterlayer",
						title: "Stormwater Infrastructure (City)",
						listMode: "show",
						icon: "DUR",
						layer_order:0,
						lyr_zindex:8,
						listcategory: "Utilities",
						opacity: 0.9,
						icon: "DUR",
						visible: false,
						portalItem: { 
							//id: "6674d68fa69b40ec87befed3af9e94ce",
							id:"a48db6d6195143f9873b7f4aa486ceff",  //Updated as of 11/24
							portal:durm.cityportal
						}
					});
				pplt.add_to_map(durm.stormwatergroup);

				if (durm.cityportal_available) {
					durm.securedLayers = []
					durm.waterlayer = new MapImageLayer({
						id: "waterlayer",
						title: "Water Infrastructure (City)",
						listMode: "show",
						layer_order:0,
						lyr_zindex:8,
						listcategory: "Utilities",
						opacity: 0.9,
						icon: "DUR",
						visible: false,
						portalItem: { 
							id: "8aaffdcf38fa4d91afe3519459f776ab",
							portal:durm.cityportal
						}
					});
					durm.securedLayers.push(durm.waterlayer);  // ADD AS SECURED


					durm.sewerlayer = new MapImageLayer({
					id: "sewerlayer",
					title: "Sewer Infrastructure (City)",
					visible: false,
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:8,
					icon: "DUR",
					portalItem: { 
							id: "34ebafea5d6745a38e75cb1ccafac279",
							portal:durm.cityportal
						},
					opacity: 0.9
					});
					durm.securedLayers.push(durm.sewerlayer); // ADD AS SECURED


					durm.countysewerlayer = new MapImageLayer({
					id: "countysewerlayer",
					title: "Sewer Infrastructure (County)",
					visible: false,
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:8,
					icon: "DUR",
					portalItem: { 
							id: "6edab51d4d1f46f1b89042a8fe2ecf7b",
							portal:durm.cityportal
						},
					opacity: 0.9
					});
					durm.securedLayers.push(durm.countysewerlayer); // ADD AS SECURED

				} else {
					console.log("City Portal not available, Utilities not loaded.")
				}

			  durm.sewershedslayer = new FeatureLayer({
				  id: "sewershedslayer",
				  title: "Sewer Basins",
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:2,
					url: SEWERSHEDS,
					icon: "DUR",
				  visible: false,
				  opacity: 0.7
				});
				pplt.add_to_map(durm.sewershedslayer);	

				durm.stormsewersheds = new FeatureLayer({
				  id: "stormsewersheds",
				  title: "Storm Sewersheds",
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:6,
					url: STORMSEWERSHED_URL_SUBLAYER,
					icon: "DUR",
				  visible: false,
				  opacity: 0.7
				});
				pplt.add_to_map(durm.stormsewersheds);

				durm.citysewerdrainingtocounty = new FeatureLayer({
				  id: "citysewerdrainingtocounty",
				  title: "City Sewer Area draining to County",
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:3,
					url: CITYSEWERDRAIN2COUNTY,
					icon: "DUR",
				  visible: false,
				  opacity: 0.7
				});
				pplt.add_to_map(durm.citysewerdrainingtocounty);
		},
		add_other: async function(){
				//safety
			  durm.emmitigationlayer = new FeatureLayer({
				  id: "emmitigation",
				  title: "Emergency Mitigation Facilities",
					listMode: "show",
					listcategory: "Safety",
					icon: "DUR",
					layer_order:0,
					lyr_zindex:6,
				  url: EM_MITIGATION_FACILITIES,
				  visible: false
				});
				pplt.add_to_map(durm.emmitigationlayer);

				durm.crpsa = new FeatureLayer({
					id: "crpsa",
					title: "HEART Service Area",
					listMode: "show",
					listcategory: "Safety",
					icon: "DUR",
					layer_order:0,
					lyr_zindex:6,
					url: crpsa_URL,
					visible: false
				  });
				  pplt.add_to_map(durm.crpsa);

				//recreation
				durm.trailslayer = new MapImageLayer({
					id: "trailslayer",
				  title: "Trails",
					listMode: "show",
					listcategory: "Recreation",
					layer_order:0,
					lyr_zindex:8,
					visible: false,
					url: TRAILS_ALL,
					icon: "DUR",
					sublayers: [{
						id: 6,
						visible: true,
						labelsVisible: true,
						labelingInfo: [{
							labelExpression: "[name]",
							labelPlacement: "above-along",
							symbol: {
								type: "text",  // autocasts as new TextSymbol()
								color: "#4C7300",
								haloColor: [250, 250, 250, 0.85],
								haloSize: 1,
								font: {
									size: 9
								}
							},
							minScale: 2400000,
							maxScale: 0
						}]
					}]
				});
				pplt.add_to_map(durm.trailslayer);


			  durm.recandaqua = new FeatureLayer({
				  id: "recandaqua",
				  title: "Recreation and Aquatics Centers",
					listMode: "show",
					listcategory: "Recreation",
					layer_order:0,
					lyr_zindex:8,
					url: RECANDAQUA,
					icon: "DUR",
				  visible: false,
				  opacity: 0.95
				});
			  pplt.add_to_map(durm.recandaqua);

			  durm.parkslayer = new FeatureLayer({
				  id: "parkslayer",
				  title: "Parks",
					listMode: "show",
					listcategory: "Recreation",
					layer_order:0,
					lyr_zindex:4,
					url: PARKS,
					icon: "DUR",
					visible: false,
					popupTemplate: {
						title:"Park",content:[{
						type: "fields",
						fieldInfos: [{
							fieldName: "NAME",
							label: "Name"
							},{
							fieldName: "FULLADDR",
							label: "Address"
							}]
						}]
					},
				  opacity: 0.95
				});
			  pplt.add_to_map(durm.parkslayer);
		},
		handle_layer_loading_failure: async function(l0){
			console.log("Caught: Layer Failed to Load")
			console.log(l0)
			if(l0.details.ssl===false) {
				console.log("SSL was false")
			}
			else if(l0.details.ssl===true) {
				console.log("SSL was true")
			}
			else { console.log("Other") }
		}
};
});