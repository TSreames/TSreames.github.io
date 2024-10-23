/*
Matt Reames, 2019-21
This controls almost all the operational layers
*/
define([
	"esri/portal/PortalItem",
	  "esri/layers/FeatureLayer","esri/layers/TileLayer","esri/layers/MapImageLayer","esri/layers/GroupLayer","esri/layers/VectorTileLayer","esri/layers/ImageryLayer",
	  "esri/portal/Portal",
		"../durm/durm_popups.js", "../durm/durm_devcases.js", "../durm/durm_search.js"
		], function(
			PortalItem,
			FeatureLayer, TileLayer, MapImageLayer, GroupLayer, VectorTileLayer,ImageryLayer,
			Portal,
			durm_popups, durm_devcases, durm_search
    ) {
    return {
		connect_to_portal: function() {
			durm.cityportal = new Portal({
				url: DURHAM_PORTAL_URL // First instance
			});
			durm.cityportal.authMode = "anonymous";
		},
		// This is super important
    	populate: async function(){
			try {//	
				pplt = this;
				layers2load = []
				durm_popups.pre_init();
				this.add_defaults();
				this.add_administrative();
				this.add_utilities();
				this.add_planning();
				this.add_permits();
				this.add_economic();
				this.add_electoral();
				this.add_environmental();
				this.add_education();
				this.add_transportation();
				this.add_aerials();
				this.add_nconemap();
				this.add_other();

				durm_popups.post_init();
				durm_search.build();
	
				durm_devcases.buildCaseTypeSelect();
				durm_devcases.buildCaseStatusSelect();
				durm.draw_button.addEventListener("click", function(){
					durm_devcases.render_development_cases()
				});
				this.add_to_map0(layers2load);

			} catch (error) { 
				console.log("We caught a layer that failed to load")
				console.log(error);
			}
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
				//url: ADDRESS_FS_URL,
				portalItem: {
					// autocasts as new PortalItem
					id: "2defd7f6efd5483bb044bf873444ecc7"
				},					
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

			durm.crossconnectpermits = new FeatureLayer({
				id: "crossconnectpermits",
				title: "Cross Connection Permits",
				listcategory: "Permits",
				listMode: "show",
				layer_order:0,
				lyr_zindex:10,
				url: CROSS_CONNECT_PERMITS_URL,
				icon: "DUR",
				outFields: ["*"],	  
				visible: false
			});
			pplt.add_to_map(durm.crossconnectpermits);

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
				visible: true,
				opacity:0.65
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
				opacity:0.65
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
				opacity:0.65
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
				visible: true,
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
			durm.elemschools23_24 = new GroupLayer({
				id: "elemschools23_24",
				title: "Elementary Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.elemschools23_24);

			durm.elem23_24_6 = new FeatureLayer({
				id: "elem23_24_6",
				layerId: 6,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				opacity:0.4,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_6);

			durm.elem23_24_5 = new FeatureLayer({
				id: "elem23_24_5",
				layerId: 5,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:8,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_5);

			durm.elem23_24_4 = new FeatureLayer({
				id: "elem23_24_4",
				layerId: 4,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_4);

			durm.elem23_24_3 = new FeatureLayer({
				id: "elem23_24_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_3);

			durm.elem23_24_2 = new FeatureLayer({
				id: "elem23_24_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_2);

			durm.elem23_24_1 = new FeatureLayer({
				id: "elem23_24_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_1);

			durm.elem23_24_0 = new FeatureLayer({
				id: "elem23_24_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools23_24.add(durm.elem23_24_0);
			
			durm.middleschools23_24 = new GroupLayer({
				id: "middleschools23_24",
				title: "Middle Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.middleschools23_24);

			durm.middle23_24_3 = new FeatureLayer({
				id: "middle23_24_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools23_24.add(durm.middle23_24_3);

			durm.middle23_24_2 = new FeatureLayer({
				id: "middle23_24_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools23_24.add(durm.middle23_24_2);
			
			durm.middle23_24_1 = new FeatureLayer({
				id: "middle23_24_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools23_24.add(durm.middle23_24_1);

			durm.middle23_24_0 = new FeatureLayer({
				id: "middle23_24_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools23_24.add(durm.middle23_24_0);

			/* high */
			durm.highschools23_24 = new GroupLayer({
				id: "highschools23_24",
				title: "High Schools and Zones, 2023-2024",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.highschools23_24);

			durm.high23_24_3 = new FeatureLayer({
				id: "high23_24_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				opacity:0.3,
				url: HIGH2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools23_24.add(durm.high23_24_3);

			durm.high23_24_2 = new FeatureLayer({
				id: "high23_24_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools23_24.add(durm.high23_24_2);
			
			durm.high23_24_1 = new FeatureLayer({
				id: "high23_24_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools23_24.add(durm.high23_24_1);

			durm.high23_24_0 = new FeatureLayer({
				id: "high23_24_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2324_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools23_24.add(durm.high23_24_0);

			//22-23
			// durm.elemschools22_23 = new GroupLayer({
			// 	id: "elemschools22_23",
			// 	title: "Elementary Schools and Zones, 2022-2023",
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:7,
			// 	icon: "DUR",
			// 	visible: false
			// });
			// pplt.add_to_map(durm.elemschools22_23);

			// durm.elem22_23_6 = new FeatureLayer({
			// 	id: "elem22_23_6",
			// 	layerId: 6,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:6,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true,
			// 	opacity:0.45,
			// });
			// durm.elemschools22_23.add(durm.elem22_23_6);

			// durm.elem22_23_5 = new FeatureLayer({
			// 	id: "elem22_23_5",
			// 	layerId: 5,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:8,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_5);

			// durm.elem22_23_4 = new FeatureLayer({
			// 	id: "elem22_23_4",
			// 	layerId: 4,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:6,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_4);

			// durm.elem22_23_3 = new FeatureLayer({
			// 	id: "elem22_23_3",
			// 	layerId: 3,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_3);

			// durm.elem22_23_2 = new FeatureLayer({
			// 	id: "elem22_23_2",
			// 	layerId: 2,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_2);

			// durm.elem22_23_1 = new FeatureLayer({
			// 	id: "elem22_23_1",
			// 	layerId: 1,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: ELEM2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_1);

			// //points
			// durm.elem22_23_0 = new MapImageLayer({
			// 	id: "elem22_23_0",
			// 	layerId: 0,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: ELEM2223_URL,
			// 	sublayers:[
			// 		{
			// 			id: 0,
			// 			visible: true
			// 		}
			// 	],				
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.elemschools22_23.add(durm.elem22_23_0);
			
			// durm.middleschools22_23 = new GroupLayer({
			// 	id: "middleschools22_23",
			// 	title: "Middle Schools and Zones, 2022-2023",
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:7,
			// 	icon: "DUR",
			// 	visible: false
			// });
			// pplt.add_to_map(durm.middleschools22_23);

			// durm.middle22_23_3 = new FeatureLayer({
			// 	id: "middle22_23_3",
			// 	layerId: 3,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: MID2223_URL,	
			// 	opacity:0.4,				
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.middleschools22_23.add(durm.middle22_23_3);

			// durm.middle22_23_2 = new FeatureLayer({
			// 	id: "middle22_23_2",
			// 	layerId: 2,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: MID2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.middleschools22_23.add(durm.middle22_23_2);
			
			// durm.middle22_23_1 = new MapImageLayer({
			// 	id: "middle22_23_1",
			// 	//layerId: 1,
			// 	sublayers:[
			// 		{
			// 			id: 1,
			// 			visible: true
			// 		}
			// 	],	
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: MID2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.middleschools22_23.add(durm.middle22_23_1);

			// durm.middle22_23_0 = new MapImageLayer({
			// 	id: "middle22_23_0",
			// 	//layerId: 0,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: MID2223_URL,	
			// 	sublayers:[
			// 		{
			// 			id: 0,
			// 			visible: true
			// 		}
			// 	],					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.middleschools22_23.add(durm.middle22_23_0);


			// /* high */
			// durm.highschools22_23 = new GroupLayer({
			// 	id: "highschools22_23",
			// 	title: "High Schools and Zones, 2022-2023",
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:7,
			// 	icon: "DUR",
			// 	visible: false
			// });
			// pplt.add_to_map(durm.highschools22_23);

			// durm.high22_23_3 = new FeatureLayer({
			// 	id: "high22_23_3",
			// 	layerId: 3,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: HIGH2223_URL,
			// 	opacity:0.5,			
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.highschools22_23.add(durm.high22_23_3);

			// durm.high22_23_2 = new FeatureLayer({
			// 	id: "high22_23_2",
			// 	layerId: 2,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: HIGH2223_URL,					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.highschools22_23.add(durm.high22_23_2);
			
			// durm.high22_23_1 = new MapImageLayer({
			// 	id: "high22_23_1",
			// 	//layerId: 1,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: HIGH2223_URL,
			// 	sublayers:[
			// 		{
			// 			id: 1,
			// 			visible: true
			// 		}
			// 	],						
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.highschools22_23.add(durm.high22_23_1);

			// durm.high22_23_0 = new MapImageLayer({
			// 	id: "high22_23_0",
			// 	//layerId: 0,
			// 	listMode: "show",
			// 	listcategory: "Education",
			// 	layer_order:0,
			// 	lyr_zindex:9,
			// 	url: HIGH2223_URL,	
			// 	sublayers:[
			// 		{
			// 			id: 0,
			// 			visible: true
			// 		}
			// 	],					
			// 	icon: "DUR",
			// 	visible: true
			// });
			// durm.highschools22_23.add(durm.high22_23_0);
		},
		add_electoral: async function(){
			durm.voter_precincts = new MapImageLayer({
				id: "voter_precincts",
				title: "Voter Precincts",
				listMode: "show",
				listcategory: "Electoral",
				layer_order:0,
				lyr_zindex:6,
				url: VOTERPRECINCT_URL,
				icon: "DUR",
				sublayers:[{
					id: 2,
					visible: true
				}],
				visible: false				
			});
			pplt.add_to_map(durm.voter_precincts);

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
		add_aerials: async function(){
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

			durm.satellite2007 = new TileLayer({
				id: "satellite2007",
				title: "2007 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2007/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2007);

			durm.satellite2008_ir = new TileLayer({
				id: "satellite2008_ir",
				title: "2008 Color-infrared Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2008_ColorIR/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2008_ir);
			
			durm.satellite2008 = new TileLayer({
				id: "satellite2008",
				title: "2008 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2008/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2008);

			durm.satellite2009 = new TileLayer({
				id: "satellite2009",
				title: "2009 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2009/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2009);

			durm.satellite2010 = new TileLayer({
				id: "satellite2010",
				title: "2010 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2010/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2010);

			durm.satellite2011 = new TileLayer({
				id: "satellite2011",
				title: "2011 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2011/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2011);

			durm.satellite2012 = new TileLayer({
				id: "satellite2012",
				title: "2012 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2012/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.satellite2012);

			durm.satellite2013 = new TileLayer({
				id: "satellite2013",
				title: "2013 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2013/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2013);
			
			durm.satellite2014 = new TileLayer({
				id: "satellite2014",
				title: "2014 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2014/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2014);

			durm.satellite2015 = new TileLayer({
				id: "satellite2015",
				title: "2015 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2015/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2015);

			durm.satellite2016 = new TileLayer({
				id: "satellite2016",
				title: "2016 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Satellite2016/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.satellite2016);






			durm.soils1983 = new TileLayer({
				id: "soils1983",
				title: "1983 Aerial Photos, with stream delination and soils",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: SOILS1983_URL,
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.soils1983);

			durm.aerials2021 = new TileLayer({
				id: "aerials2021",
				title: "2021 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2021/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2021);

			durm.aerials2019 = new TileLayer({
				id: "aerials2019",
				title: "2019 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2019/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2019);

			durm.aerials2017 = new TileLayer({
				id: "aerials2017",
				title: "2017 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2017/MapServer",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2017);	

			durm.aerials2013 = new TileLayer({
				id: "aerials2013",
				title: "2013 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2013/MapServer",
				icon: "NC",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2013);	

			durm.aerials2010 = new TileLayer({
				id: "aerials2010",
				title: "2010 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2010/MapServer",
				icon: "NC",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2010);	

			durm.aerials2008 = new TileLayer({
				id: "aerials2008",
				title: "2008 Aerial Photos (NAIP)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2008/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2008);


			durm.aerials2005 = new TileLayer({
				id: "aerials2005",
				title: "2005 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2005/MapServer",
				icon: "NC",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2005);

			durm.aerials2002 = new TileLayer({
				id: "aerials2002",
				title: "2002 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho2002/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials2002);

			durm.aerials1999 = new TileLayer({
				id: "aerials1999",
				title: "1999 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho1999/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials1999);

			durm.aerials1994 = new TileLayer({
				id: "aerials1994",
				title: "1994 Aerial Photos (City Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho1994/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials1994);

			durm.aerials1988 = new TileLayer({
				id: "aerials1988",
				title: "1988 Aerial Photos (County Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho1988/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials1988);

			durm.aerials1940 = new TileLayer({
				id: "aerials1940",
				title: "1940 Aerial Photos (City Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho1940/MapServer",
				icon: "USA",
				visible: false, legendEnabled: false, popupEnabled: false
			});				
			pplt.add_to_map(durm.aerials1940);

			//Feb 2024   1/28 - 2/15

			//May 2024 -  5/27 to 6/1

			durm.nearmap2024_summer = new ImageryLayer({
				id: "nearmap2024_summer",
				title: "2024 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2024-05-27 20:10:05' AND TIMESTAMP '2024-06-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2024_summer);

			durm.nearmap2024_spring = new ImageryLayer({
				id: "nearmap2024_spring",
				title: "2024 Nearmap Aerials, February",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2024-01-26 20:10:05' AND TIMESTAMP '2024-02-15 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2024_spring);

			durm.nearmap2023_fall = new ImageryLayer({
				id: "nearmap2023_fall",
				title: "2023 Nearmap Aerials, October",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-10-01 20:10:05' AND TIMESTAMP '2023-10-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_fall);


			durm.nearmap2023_spring = new ImageryLayer({
				id: "nearmap2023_spring",
				title: "2023 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-05-04 20:10:05' AND TIMESTAMP '2023-05-11 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_spring);

			durm.nearmap2023_winter = new ImageryLayer({
				id: "nearmap2023_winter",
				title: "2023 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-01-22 20:10:05' AND TIMESTAMP '2023-01-28 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_winter);


			durm.nearmap2022_fall = new ImageryLayer({
				id: "nearmap2022_fall",
				title: "2022 Nearmap Aerials, Oct",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-10-16 20:10:05' AND TIMESTAMP '2022-10-19 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_fall);

			durm.nearmap2022_spring2 = new ImageryLayer({
				id: "nearmap2022_spring2",
				title: "2022 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-05-01 20:10:05' AND TIMESTAMP '2022-07-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_spring2);

			durm.nearmap2022_spring1 = new ImageryLayer({
				id: "nearmap2022_spring1",
				title: "2022 Nearmap Aerials, Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-02-01 20:10:05' AND TIMESTAMP '2022-02-07 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_spring1);

			durm.nearmap2021_fall = new ImageryLayer({
				id: "nearmap2021_fall",
				title: "2021 Nearmap Aerials, Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-11-01 20:10:05' AND TIMESTAMP '2021-12-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_fall);


			durm.nearmap2021_spring2 = new ImageryLayer({
				id: "nearmap2021_spring2",
				title: "2021 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-05-01 20:10:05' AND TIMESTAMP '2021-06-05 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_spring2);

			durm.nearmap2021_spring1 = new ImageryLayer({
				id: "nearmap2021_spring1",
				title: "2021 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-01-01 20:10:05' AND TIMESTAMP '2021-02-05 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_spring1);
			
			durm.nearmap2020_fall = new ImageryLayer({
				id: "nearmap2020_fall",
				title: "2020 Nearmap Aerials, Sep",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-09-01 20:10:05' AND TIMESTAMP '2020-10-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_fall);	

			durm.nearmap2020_spring2 = new ImageryLayer({
				id: "nearmap2020_spring2",
				title: "2020 Nearmap Aerials, May-Jun",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-05-01 20:10:05' AND TIMESTAMP '2020-07-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_spring2);	

			durm.nearmap2020_spring1 = new ImageryLayer({
				id: "nearmap2020_spring1",
				title: "2020 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-01-01 20:10:05' AND TIMESTAMP '2020-02-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_spring1);	

			durm.nearmap2019_fall = new ImageryLayer({
				id: "nearmap2019_fall",
				title: "2019 Nearmap Aerials, Oct-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-10-01 20:10:05' AND TIMESTAMP '2019-12-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_fall);	

			durm.nearmap2019_spring2 = new ImageryLayer({
				id: "nearmap2019_spring2",
				title: "2019 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-05-01 20:10:05' AND TIMESTAMP '2019-06-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_spring2);	

			durm.nearmap2019_spring1 = new ImageryLayer({
				id: "nearmap2019_spring1",
				title: "2019 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-01-01 20:10:05' AND TIMESTAMP '2019-02-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_spring1);	

			durm.nearmap2018_fall = new ImageryLayer({
				id: "nearmap2018_fall",
				title: "2018 Nearmap Aerials, Sep-Oct",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2018-09-01 20:10:05' AND TIMESTAMP '2018-11-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2018_fall);	

			durm.nearmap2018_spring = new ImageryLayer({
				id: "nearmap2018_spring",
				title: "2018 Nearmap Aerials, Jan-Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2018-01-01 20:10:05' AND TIMESTAMP '2018-02-26 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2018_spring);	

			durm.nearmap2017_fall = new ImageryLayer({
				id: "nearmap2017_fall",
				title: "2017 Nearmap Aerials, Sep-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-09-01 20:10:05' AND TIMESTAMP '2017-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_fall);	

			durm.nearmap2017_spring2 = new ImageryLayer({
				id: "nearmap2017_spring2",
				title: "2017 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-05-01 20:10:05' AND TIMESTAMP '2017-05-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_spring2);			

			durm.nearmap2017_spring1 = new ImageryLayer({
				id: "nearmap2017_spring1",
				title: "2017 Nearmap Aerials, Jan-Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-01-01 20:10:05' AND TIMESTAMP '2017-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_spring1);					

			durm.nearmap2016_fall = new ImageryLayer({
				id: "nearmap2016_fall",
				title: "2016 Nearmap Aerials, Sep",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2016-09-01 20:10:05' AND TIMESTAMP '2016-09-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2016_fall);							

			durm.nearmap2016_spring = new ImageryLayer({
				id: "nearmap2016_spring",
				title: "2016 Nearmap Aerials, Feb-Mar",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2016-02-01 20:10:05' AND TIMESTAMP '2016-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2016_spring);				

			durm.nearmap2015_fall = new ImageryLayer({
				id: "nearmap2015_fall",
				title: "2015 Nearmap Aerials, Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2015-11-01 20:10:05' AND TIMESTAMP '2015-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2015_fall);

			durm.nearmap2015_spring = new ImageryLayer({
				id: "nearmap2015_spring",
				title: "2015 Nearmap Aerials, Mar",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2015-03-01 20:10:05' AND TIMESTAMP '2015-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2015_spring);

			durm.nearmap2014 = new ImageryLayer({
				id: "nearmap2014",
				title: "2014 Nearmap Aerials, Oct-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				icon: "DUR",
				visible: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2014-10-01 20:10:05' AND TIMESTAMP '2014-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2014);

			this.init_aerial_slider();
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

				
				// durm.speedhumps = new FeatureLayer({
				//   id: "speedhumps",
				//   title: "Speed Humps",
				// 	listMode: "show",
				// 	listcategory: "Transportation",
				// 	layer_order:0,
				// 	lyr_zindex:6,
				// 	url: SPEED_HUMPS_URL,
				// 	icon: "DUR",
				//   visible: false
				// });
				// pplt.add_to_map(durm.speedhumps);

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


				durm.DOLRTgroup = new GroupLayer({
				  id: "DOLRTgrouplayer",
				  title: "Durham Orange Light Rail",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.DOLRTgroup);
			  			  
			  durm.DOLRTlines = new MapImageLayer({
				  id: "DOLRTlines",
				  title: "Durham Orange Light Rail Lines",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: DOLRT_URL,
					sublayers:[{
						id: 2,
						popupTemplate: {
							title: "Light Rail Line",
							content: "{Type}"
						}
					}],
				  visible: true
				});
				durm.DOLRTgroup.add(durm.DOLRTlines);

			  durm.DOLRTaeriallines = new MapImageLayer({
				  id: "DOLRTaeriallines",
				  title: "Durham Orange Light Rail Lines",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: DOLRT_URL,
					sublayers:[{
						id: 1,
						popupTemplate: {
							title: "Light Rail Line, Aerial Section",
							content: "{Type}"
						}						
					}],
				  visible: true
				});
				durm.DOLRTgroup.add(durm.DOLRTaeriallines);
		
			  durm.DOLRTstation = new MapImageLayer({
				  id: "DOLRTstation",
				  title: "Light Rail Station",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: DOLRT_URL,
					sublayers:[{
						id: 0,
						popupTemplate: {
							title: "Light Rail Station",
							content: "{LABEL}, {Access_type}"
						}
					}],
				  visible: true
				});
			  durm.DOLRTgroup.add(durm.DOLRTstation);
				
			  durm.DOLRTmaint = new MapImageLayer({
				  id: "DOLRTmaint",
				  title: "Light Rail Operations and Maintenance",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: DOLRT_URL,
					sublayers:[{
						id: 3,
						popupTemplate: {
							title: "Light Rail Operations and Maintenance",
							content: "{ROMF_Name}"
						}
					}],
				  visible: true
				});
			  durm.DOLRTgroup.add(durm.DOLRTmaint);
			  
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
						title: "Stormwater Infrastructure",
						listMode: "show",
						icon: "DUR",
						layer_order:0,
						lyr_zindex:8,
						listcategory: "Utilities",
						opacity: 0.9,
						portalItem: { 
							id: "6674d68fa69b40ec87befed3af9e94ce",
							portal:durm.cityportal
						}
					});
				//pplt.add_to_map(durm.stormwatergroup);

				durm.waterlayer = new MapImageLayer({
					id: "waterlayer",
					title: "Water",
					listMode: "show",
					layer_order:0,
					lyr_zindex:8,
					listcategory: "Utilities",
					opacity: 0.9,
					portalItem: { 
						id: "91c5e853e83244d68dca4df30ff37add",
						portal:durm.cityportal
					}
				});

				durm.sewerlayer = new MapImageLayer({
				  id: "sewerlayer",
				  title: "Sewer",
					listMode: "show",
					listcategory: "Utilities",
					layer_order:0,
					lyr_zindex:8,
					portalItem: { 
						id: "3d5220432ce84ea1b8f1f160c0b1505f",
						portal:durm.cityportal
					},
				  opacity: 0.9
				});

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
				//pplt.add_to_map(durm.stormsewersheds);

				durm.citysewerdrainingtocounty = new FeatureLayer({
				  id: "citysewerdrainingtocounty",
				  title: "City Sewer draining to County",
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

		init_aerial_slider: function(){
			// Critical that this runs AFTER aerials have been added to map.
			//Slider
			durm.defaultaerialid = 39; //This is used to specify which aerial is the default, as defined by its place in aeriallist[]

			durm.aeriallist = [
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
				durm.nearmap2024_summer
			];	

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
			durm.ainput.oninput = function(){
				durm.aparam = this.value
				push_new_url()	
				durm.aoutput.innerHTML = durm.aeriallist[this.value].title;
				//visibility control
				for (i = 0; i < durm.aeriallist.length; i++) {
					if(i == this.value) { durm.aeriallist[i].visible = true; }
					else { durm.aeriallist[i].visible = false; }
				}
			};
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
		},
		add_to_map: async function(l0){			
			layers2load.push(l0)
			//durm.map.add(l0)
			//l0.when(function(){})
			//.catch(function(error){
		//		pplt.handle_layer_loading_failure(error);
	//		});
		},
		add_to_map0: function(layers2load){
			durm.map.addMany(layers2load);
		}
};
});