/*
Matt Reames, 2019-21
This controls almost all the operational layers
*/
define([
	"esri/portal/PortalItem",
	  "esri/layers/FeatureLayer","esri/layers/TileLayer","esri/layers/MapImageLayer","esri/layers/GroupLayer","esri/layers/VectorTileLayer","esri/layers/ImageryLayer",
	  "esri/tasks/QueryTask","esri/portal/Portal",
		"../durm/durm_popups.js", "../durm/durm_devcases.js", "../durm/durm_search.js"
		], function(
			PortalItem,
			FeatureLayer, TileLayer, MapImageLayer, GroupLayer, VectorTileLayer,ImageryLayer,
			QueryTask,  Portal,
			durm_popups, durm_devcases, durm_search
    ) {
    return {
		// This is super important
    populate: async function(){
			try {//	
				pplt = this;
				durm_popups.pre_init();

				durm.cityportal = new Portal({
					url: DURHAM_PORTAL_URL // First instance
				});
				durm.cityportal.authMode = "auto";

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

			} catch (e) { 
				console.log("We caught a layer that failed to load")
				console.log(e);
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

			/*const pinlabelClass = { // autocasts as new LabelClass()
				symbol: {
					type: "text", // autocasts as new TextSymbol()
					color: "black",
					haloColor: "white",
					haloSize: "0.8px",
					yoffset: "-5pt",
					xoffset: 0,
					font: { // autocast as new Font()
						family: "sans-serif",
						size: 9,
						weight: "bold",
						decoration: "none",
						style: "normal"
					}
				},
					labelPlacement: "always-horizontal", // This changes between polygon/point/line
					minScale: 3000,
					labelExpressionInfo: {
						expression: "$feature.PIN" + "\n"
					}
				};
				pinlabelClass.deconflictionStrategy = "none";*/

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
					title: "Parcel ID: {PARCEL_ID}", 
					actions: [parcelNotificationToolAction],
					outFields: ["*"],// We NEED for outfields to be specified here, because it makes the popups work correctly in cases where there are multiple target parcels.
					content: durm_popups.queryParcelforPopup //Note that this fires, not for every click, but for every parcel that gets selected. So it could run 10x or 100x
				}
			});
			durm.parcelboundaryLayer.minScale = 18000;
			pplt.add_to_map(durm.parcelboundaryLayer);
			durm.parcelrecordquerytask = new QueryTask({ url: PARCELS_AGOL });

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
			pplt.add_to_map(durm.orangepars);
			durm.parcelrecordquerytask_o = new QueryTask({ url: ORANGE_URL });

			
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
			pplt.add_to_map(durm.wakepars);
			durm.parcelrecordquerytask_w = new QueryTask({ url: WAKE_URL });

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
				renderer: renderer_cases,
				popupTemplate: caseLayer_popup
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
			
			durm.FLUlayer = new TileLayer({
				id: "FLU",
				title: "Future Land Use",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:2,
				url: FUTURE_LAND_USE_URL,
				icon: "DUR",
				visible: false,
				opacity: 1
			});
			pplt.add_to_map(durm.FLUlayer);

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
			
			/* Note for future reference --  Development Tiers should use server-side rendering because the 'urban' tier has a big donut hole that causes problems in client-side labeling. */	
			durm.developmenttiers = new MapImageLayer({
				id: "developmenttiers",
				title: "Development Tiers",
				listcategory: "Planning",
				sublayers:[{
					id: 5,
					visible:true
				}],
				layer_order:0,
				lyr_zindex:8,
				url: PLANNING_BASE_URL,
				icon: "DUR",
				visible: false,  
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

			durm.urbangrowthboundary = new FeatureLayer({
				id: "urbangrowthboundary",
				title: "Proposed Urban Growth Boundary",
				listMode: "show",
				listcategory: "Planning",
				layer_order:0,
				lyr_zindex:4,
				url: UGB_URL,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.urbangrowthboundary);

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
		},
		add_education: async function(){
			//We should probably figure out a less labor-intensive way to manage this
			//But FeatureLayers provides the sort of labeling + interactivity we need.

			//21-22
			durm.elemschools21_22 = new GroupLayer({
				id: "elemschools21_22",
				title: "Elementary Schools and Zones, 2021-2022",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.elemschools21_22);

			durm.elem21_22_6 = new FeatureLayer({
				id: "elem21_22_6",
				layerId: 6,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_6);

			durm.elem21_22_5 = new FeatureLayer({
				id: "elem21_22_5",
				layerId: 5,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:8,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_5);

			durm.elem21_22_4 = new FeatureLayer({
				id: "elem21_22_4",
				layerId: 4,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_4);

			durm.elem21_22_3 = new FeatureLayer({
				id: "elem21_22_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_3);

			durm.elem21_22_2 = new FeatureLayer({
				id: "elem21_22_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_2);

			durm.elem21_22_1 = new FeatureLayer({
				id: "elem21_22_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_1);

			durm.elem21_22_0 = new FeatureLayer({
				id: "elem21_22_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools21_22.add(durm.elem21_22_0);
			
			durm.middleschools21_22 = new GroupLayer({
				id: "middleschools21_22",
				title: "Middle Schools and Zones, 2021-2022",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.middleschools21_22);

			durm.middle21_22_3 = new FeatureLayer({
				id: "middle21_22_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools21_22.add(durm.middle21_22_3);

			durm.middle21_22_2 = new FeatureLayer({
				id: "middle21_22_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools21_22.add(durm.middle21_22_2);
			
			durm.middle21_22_1 = new FeatureLayer({
				id: "middle21_22_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools21_22.add(durm.middle21_22_1);

			durm.middle21_22_0 = new FeatureLayer({
				id: "middle21_22_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools21_22.add(durm.middle21_22_0);

			/* high */
			durm.highschools21_22 = new GroupLayer({
				id: "highschools21_22",
				title: "High Schools and Zones, 2021-2022",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.highschools21_22);

			durm.high21_22_3 = new FeatureLayer({
				id: "high21_22_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools21_22.add(durm.high21_22_3);

			durm.high21_22_2 = new FeatureLayer({
				id: "high21_22_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools21_22.add(durm.high21_22_2);
			
			durm.high21_22_1 = new FeatureLayer({
				id: "high21_22_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools21_22.add(durm.high21_22_1);

			durm.high21_22_0 = new FeatureLayer({
				id: "high21_22_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2122_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools21_22.add(durm.high21_22_0);

			//22-23
			durm.elemschools22_23 = new GroupLayer({
				id: "elemschools22_23",
				title: "Elementary Schools and Zones, 2022-2023",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.elemschools22_23);

			durm.elem22_23_6 = new FeatureLayer({
				id: "elem22_23_6",
				layerId: 6,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true,
				opacity:0.45,
			});
			durm.elemschools22_23.add(durm.elem22_23_6);

			durm.elem22_23_5 = new FeatureLayer({
				id: "elem22_23_5",
				layerId: 5,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:8,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_5);

			durm.elem22_23_4 = new FeatureLayer({
				id: "elem22_23_4",
				layerId: 4,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:6,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_4);

			durm.elem22_23_3 = new FeatureLayer({
				id: "elem22_23_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_3);

			durm.elem22_23_2 = new FeatureLayer({
				id: "elem22_23_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_2);

			durm.elem22_23_1 = new FeatureLayer({
				id: "elem22_23_1",
				layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_1);

			//points
			durm.elem22_23_0 = new MapImageLayer({
				id: "elem22_23_0",
				layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: ELEM2223_URL,
				sublayers:[
					{
						id: 0,
						visible: true
					}
				],				
				icon: "DUR",
				visible: true
			});
			durm.elemschools22_23.add(durm.elem22_23_0);
			
			durm.middleschools22_23 = new GroupLayer({
				id: "middleschools22_23",
				title: "Middle Schools and Zones, 2022-2023",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.middleschools22_23);

			durm.middle22_23_3 = new FeatureLayer({
				id: "middle22_23_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2223_URL,	
				opacity:0.4,				
				icon: "DUR",
				visible: true
			});
			durm.middleschools22_23.add(durm.middle22_23_3);

			durm.middle22_23_2 = new FeatureLayer({
				id: "middle22_23_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools22_23.add(durm.middle22_23_2);
			
			durm.middle22_23_1 = new MapImageLayer({
				id: "middle22_23_1",
				//layerId: 1,
				sublayers:[
					{
						id: 1,
						visible: true
					}
				],	
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.middleschools22_23.add(durm.middle22_23_1);

			durm.middle22_23_0 = new MapImageLayer({
				id: "middle22_23_0",
				//layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: MID2223_URL,	
				sublayers:[
					{
						id: 0,
						visible: true
					}
				],					
				icon: "DUR",
				visible: true
			});
			durm.middleschools22_23.add(durm.middle22_23_0);


			/* high */
			durm.highschools22_23 = new GroupLayer({
				id: "highschools22_23",
				title: "High Schools and Zones, 2022-2023",
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:7,
				icon: "DUR",
				visible: false
			});
			pplt.add_to_map(durm.highschools22_23);

			durm.high22_23_3 = new FeatureLayer({
				id: "high22_23_3",
				layerId: 3,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2223_URL,
				opacity:0.5,			
				icon: "DUR",
				visible: true
			});
			durm.highschools22_23.add(durm.high22_23_3);

			durm.high22_23_2 = new FeatureLayer({
				id: "high22_23_2",
				layerId: 2,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2223_URL,					
				icon: "DUR",
				visible: true
			});
			durm.highschools22_23.add(durm.high22_23_2);
			
			durm.high22_23_1 = new MapImageLayer({
				id: "high22_23_1",
				//layerId: 1,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2223_URL,
				sublayers:[
					{
						id: 1,
						visible: true
					}
				],						
				icon: "DUR",
				visible: true
			});
			durm.highschools22_23.add(durm.high22_23_1);

			durm.high22_23_0 = new MapImageLayer({
				id: "high22_23_0",
				//layerId: 0,
				listMode: "show",
				listcategory: "Education",
				layer_order:0,
				lyr_zindex:9,
				url: HIGH2223_URL,	
				sublayers:[
					{
						id: 0,
						visible: true
					}
				],					
				icon: "DUR",
				visible: true
			});
			durm.highschools22_23.add(durm.high22_23_0);
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

			durm.satellite2008_ir = new MapImageLayer({
				id: "satellite2008_ir",
				title: "2008 Color-infrared Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Satellite2008_ColorIR/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.satellite2008_ir);
			
			durm.satellite2008 = new MapImageLayer({
				id: "satellite2008",
				title: "2008 Satellite Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Satellite2008/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.satellite2008);

			durm.soils1983 = new MapImageLayer({
				id: "soils1983",
				title: "1983 Aerial Photos, with stream delination and soils",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: SOILS1983_URL,
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.soils1983);

			durm.aerials2021 = new MapImageLayer({
				id: "aerials2021",
				title: "2021 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2021/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2021);

			durm.aerials2019 = new MapImageLayer({
				id: "aerials2019",
				title: "2019 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2019/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2019);

			durm.aerials2017 = new MapImageLayer({
				id: "aerials2017",
				title: "2017 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2017/MapServer",
				icon: "DUR",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2017);	

			durm.aerials2013 = new MapImageLayer({
				id: "aerials2013",
				title: "2013 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2013/MapServer",
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2013);	

			durm.aerials2010 = new MapImageLayer({
				id: "aerials2010",
				title: "2010 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2010/MapServer",
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2010);	

			durm.aerials2008 = new MapImageLayer({
				id: "aerials2008",
				title: "2008 Aerial Photos (NAIP)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2008/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2008);


			durm.aerials2005 = new MapImageLayer({
				id: "aerials2005",
				title: "2005 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2005/MapServer",
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2005);

			durm.aerials2002 = new MapImageLayer({
				id: "aerials2002",
				title: "2002 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho2002/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials2002);

			durm.aerials1999 = new MapImageLayer({
				id: "aerials1999",
				title: "1999 Aerial Photos",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho1999/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials1999);

			durm.aerials1994 = new MapImageLayer({
				id: "aerials1994",
				title: "1994 Aerial Photos (City Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho1994/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials1994);

			durm.aerials1988 = new MapImageLayer({
				id: "aerials1988",
				title: "1988 Aerial Photos (County Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho1988/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials1988);

			durm.aerials1940 = new MapImageLayer({
				id: "aerials1940",
				title: "1940 Aerial Photos (City Only)",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:2,
				url: "https://webgis.durhamnc.gov/server/rest/services/Rasters/Ortho1940/MapServer",
				icon: "USA",
				visible: false
			});				
			pplt.add_to_map(durm.aerials1940);

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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				maxScale:0,
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
				title: "Brownfields",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: BROWNFIELDS_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.brownfields);	
		
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

			durm.hazwaste = new FeatureLayer({
				id: "hazwaste",
				title: "Hazardous Waste Sites",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: HAZWASTE_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.hazwaste);

			durm.inactivehazsites = new FeatureLayer({
				id: "inactivehazsites",
				title: "Inactive Hazardous Sites",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: INACTIVEHAZ_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.inactivehazsites);

			durm.active_permitted_landfills = new FeatureLayer({
				id: "active_permitted_landfills",
				title: "Active Permitted Landfills",
				listMode: "show",
				listcategory: "Hazards",
				layer_order:0,
				lyr_zindex:10,
				url: LANDFILLS_URL,
				icon: "NC",
				visible: false
			});				
			pplt.add_to_map(durm.active_permitted_landfills);

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
			  durm.STREETMAINT = new FeatureLayer({
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

				
				durm.speedhumps = new FeatureLayer({
				  id: "speedhumps",
				  title: "Speed Humps",
					listMode: "show",
					listcategory: "Transportation",
					layer_order:0,
					lyr_zindex:6,
					url: SPEED_HUMPS_URL,
					icon: "DUR",
				  visible: false
				});
				pplt.add_to_map(durm.speedhumps);  
				
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
							id: "ba2f19b723e24c178bd0ea3754bfa1bc",
							portal:durm.cityportal
						}
					});
				pplt.add_to_map(durm.stormwatergroup);

				durm.waterlayer = new MapImageLayer({
					id: "waterlayer",
					title: "Water",
					listMode: "show",
					layer_order:0,
					lyr_zindex:8,
					listcategory: "Utilities",
					opacity: 0.9,
					portalItem: { 
						id: "03f6ea70ee0246aea7e450d1e69d9608",
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
						id: "8e3ab1d74c864574a47c74a4adb528de",
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
				pplt.add_to_map(durm.stormsewersheds);

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
			//Slider
			durm.aeriallist = [
				durm.aerials1940,
				durm.soils1983,
				durm.aerials1988,
				durm.aerials1994,
				durm.aerials1999,
				durm.aerials2002,
				durm.aerials2005,
				durm.satellite2008,
				durm.aerials2008,
				durm.aerials2010,
				durm.aerials2013,
				durm.nearmap2014,
				durm.nearmap2015_spring,
				durm.nearmap2015_fall,
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
				durm.nearmap2022_spring1
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

			durm.defaultaerialid = 30; //Note: This is used to specify which aerial is the default, as defined by its place in aeriallist[]

			durm.sliderinput.min = 0;
			durm.sliderinput.value = durm.defaultaerialid;
			durm.sliderinput.max = durm.aeriallist.length-1;
			sliderholder.appendChild(durm.sliderinput)

			let sliderlabel = document.createElement('div')
			sliderlabel.id = "outputlabel"
			sliderholder.appendChild(sliderlabel)

			durm.input = document.getElementById('rangeinput');
			durm.output = document.getElementById('outputlabel');
			durm.input.oninput = function(){
				durm.output.innerHTML = durm.aeriallist[this.value].title;
					for (i = 0; i < durm.aeriallist.length; i++) {
						if(i == this.value) {
							durm.aeriallist[i].visible = true;
						}
						else { 
							durm.aeriallist[i].visible = false;
						}
					}
			};
			durm.input.oninput();
		},
		handle_layer_loading_failure: async function(l0){
			console.log("Caught: Layer Failed to Load")
			console.log(l0)
			if(l0.details.ssl===false) {
				console.log("Caught SSL error")
			}
			else if(l0.details.ssl===true) {
				console.log("Error was not SSL")
			}
			else { console.log("Other") }
		},
		add_to_map: async function(l0){
			durm.map.add(l0)
			l0.when(function(){})
			.catch(function(error){
				pplt.handle_layer_loading_failure(error);
			});
		}
		
};
});