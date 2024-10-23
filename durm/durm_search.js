/*
Matt Reames, 2019
This module initializes the search widgets
*/
define([
	  "esri/widgets/Search"
  ], function(Search
  ) {
  return {
		build: function(){
		  try {
				let basic_locationsearch_services = [,
					{
						layer: durm.active_address_points,
						name: "Durham County Addresses",
						placeholder: "Search Addresses",
						searchFields: ["SITE_ADDRE", "STREETNAME"],
						displayField:"SITE_ADDRE",
						outFields: ["*"],
						suggestionTemplate: "{SITE_ADDRE}",	
						exactMatch: false,
						autoNavigate: true, // this doesn't zoom
						zoomScale : 6000,
						popupOpenOnSelect:true,
						popupEnabled: true,
						autoSelect: true,
						maxSuggestions: 4  
					},
					{
						layer: durm.parcelboundaryLayer,
						name: "Durham County Parcels",
						placeholder: "Search Parcels",
						searchFields: ["REID", "PIN"],
						displayField: "REID",					
						outFields: ["REID", "PIN"],
						suggestionTemplate: "PIN: {PIN} <br> REID: {REID}",	
						exactMatch: false,
						autoNavigate: true,
						popupOpenOnSelect:true,
						popupEnabled: true,		
						autoSelect: true,
						maxSuggestions: 4
				}];

				durm.searchWidget_default = new Search({
					id: "default-Search",
					view: durm.mapView,
					container: "default_search_container",
					allPlaceholder:"Find by Address or REID",
					includeDefaultSources:false,
					suggestionsEnabled: true,
					locationEnabled:false,
					searchAllEnabled:true,			
					resultGraphicEnabled: true,
					autoSelect:true,
					sources: basic_locationsearch_services
				});

				let opts = {
					duration: 500  // Duration of animation will be 5 seconds
				};

				durm.searchWidget_default.on("select-result", function(event){
					let f = event.feature;
					durm.mapView.goTo({
						target: f,
						zoom: 18
					}, opts);				

					if (event.source.layer.id === "active_address_points") {
						let query = durm.parcelboundaryLayer.createQuery();
						query.geometry = event.result.feature.geometry;
						query.spatialRelationship = "intersects";
						query.returnGeometry = true;
						query.outSpatialReference = { wkid: 102100 };
						query.outFields = [ "*" ];
						return durm.parcelboundaryLayer.queryFeatures(query)
						.then(function(response) {
							var feature = response.features[0];
							durm.mapView.popup.open({
								features: [feature]
							});
		
						});						
					}
				});
			} catch (e) { console.log(e); }	

			this.build_children();
		},
		
		build_children: function(){
		  try {		
				let development_search_sources = [{
					layer: durm.caseLayer,
					name: "Development Cases",
					placeholder: "Search Development Cases",
					searchFields: ["A_NUMBER","A_PROJECT_NAME"],
					displayField: "A_NUMBER",					
					outFields: ["A_NUMBER","A_PROJECT_NAME","A_DESCRIPTION"],
					suggestionTemplate: "{A_NUMBER}, <br>{A_PROJECT_NAME}<br>{A_DESCRIPTION}",	
					exactMatch: false,
					autoNavigate: true,
					popupOpenOnSelect:true,
					popupEnabled: true,
					resultGraphicEnabled: true,
					zoomScale: 2,
					resultSymbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            size: 12,
						color: [99, 161, 69],
            outline: { // autocasts as new SimpleLineSymbol()
							color: [255, 255, 255], // autocasts as new Color()
							width: 1.5
						}
          },
					maxSuggestions: 4
				},			
				{
					layer: durm.bldgpermitLayer,
					name: "Building Permits",
					placeholder: "Search Building Permits",
					searchFields: ["PermitNum"],
					displayField: "PermitNum",
					resultSymbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            size: 12,
						color: [99, 161, 69],
            outline: { // autocasts as new SimpleLineSymbol()
							color: [255, 255, 255], // autocasts as new Color()
							width: 1.5
						}
          },
					maxSuggestions: 4  
				}];

				durm.searchWidget_development = new Search({
					id: "devcase-Search",
					view: durm.mapView,
					container: "development_search_container",
					allPlaceholder:"Search Permits and Development Cases",
					sources: development_search_sources,
					includeDefaultSources:false,
					resultSymbol: {
						type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
						size: 12,
									color: [99, 161, 69],
						outline: { // autocasts as new SimpleLineSymbol()
										color: [255, 255, 255], // autocasts as new Color()
										width: 1.5
									}
					},
					suggestionsEnabled: true,
					locationEnabled:false,
					searchAllEnabled:true,			
					autoSelect:true					
				});
				let opts = {
					duration: 500  // Duration of animation will be 5 seconds
				};
				durm.searchWidget_development.on("suggest-complete", function(event){
					console.log("Suggest Complete")
				});
				durm.searchWidget_development.on("search-complete", function(event){
					console.log("Search Complete")
				});
		  } catch (e) { console.log(e); }	
		}
  };
});