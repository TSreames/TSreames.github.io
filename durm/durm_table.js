/*
Matt Reames, 2022
*/
define([
  "esri/widgets/FeatureTable","esri/geometry/Multipoint", "esri/geometry/geometryEngineAsync","esri/layers/FeatureLayer","esri/Graphic","esri/layers/GraphicsLayer","esri/geometry/Polygon"
], function(
  FeatureTable,Multipoint, geometryEngineAsync, FeatureLayer, Graphic, GraphicsLayer, Polygon
) {
return {
      init: function(){
        console.log("Table Init")
        document.getElementById("defaultAdvOpen").click();
        let table_features = []
        try {
          let defaultemptyfeatures000 = [
            {
              geometry: {
                type: "polygon",
                rings:  []
              },
              attributes: {
                ObjectID: 0,
                SITE_ADDRE: '.',
                PARCEL_ID: '.'
              }
            }
           ];

          durm.advsearch_features = new FeatureLayer({
            id:'advsearch_feature_results',
            source: defaultemptyfeatures000,
            title:'Search Results',
            renderer: thicc_parcelboundaryRenderer,
            objectIDField: "ObjectID",
            fields: [
                {
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                },
                {
                    name: "SITE_ADDRE",
                    alias: "SITE_ADDRE",
                    type: "string"
                },
                {
                    name: "PARCEL_ID",
                    alias: "PARCEL_ID",
                    type: "string"
                }
            ]
          });
          durm.map.add(durm.advsearch_features);


          durm.featureTable = new FeatureTable({
            view: durm.mapView,
            layer: durm.advsearch_features, 
            menuItems: {
              clearSelection: true,
              refreshData: true,
              toggleColumns: true,
              selectedRecordsShowAllToggle: true,
              selectedRecordsShowSelectedToggle: true,
              zoomToSelection: true
            },
            highlightOnRowSelectEnabled: true,
            autoRefreshEnabled: true,
            multiSortEnabled: true,
            visibleElements: {selectionColumn: true},
            container: "tableDiv"
          });

          
          durm.featureTable.viewModel.watch("state", function (state) {
            if (state === "ready") {
              console.log("State was ready so we selected features")
              durm.advsearch_features.queryObjectIds().then(function (ids) {
                durm.featureTable.selectRows(ids);
              });
            }
          });
          
          
          durm.featureTable.on("selection-change", (changes) => {
            console.log("Selection change was triggered.")
            changes.removed.forEach((item) => {
              const data = table_features.find((data) => {
                return data === item.objectId;
              });
              if (data) {
                table_features.splice(table_features.indexOf(data), 1);
              }
            });  
            // If the selection is added, push all added selections to array
            changes.added.forEach((item) => {
              table_features.push(item.objectId);
            });  
            // set excluded effect on the features that are not selected in the table
            durm.advsearch_features.featureEffect = {
              filter: {
                objectIds: table_features
              },
              excludedEffect: "blur(5px) grayscale(90%) opacity(40%)"
            };
          });
          
          durm.buttonbar2 = document.getElementById("advanced_search_button");
          durm.buttonbar2.addEventListener("click", function(e) {
            if( e.target.classList.contains(".cd-panel") || e.target.classList.contains(".cd-panel-close") ) { 
              document.getElementById("searchpanel").classList.remove("is-visible") 
              e.preventDefault();
            }
            else {		
              e.preventDefault();
              document.getElementById("searchpanel").classList.add("is-visible") 
            }			
          });


        } catch (e) { console.log(e); }
      },
      table_button_click: function(){
        try {
          console.log("CLIIICK")
          //If table is on, turn it off.  If table is off, turn it on.

        } catch (e) {
          console.log(e)
        }
      },
      removeAllFeatures: function(layer2edit){
        console.log("removeAllFeatures")
        try {
          durm.advsearch_features.queryObjectIds().then(function (ids) {
            let all_current_feature_ids = []
            let deleteFeaturesList = [
             // { objectId: 123 },
             // { objectId: 445 }
            ];
            all_current_feature_ids.push(ids)
            for(let k = 0; k < all_current_feature_ids[0].length; k++){
              let dff = { objectId : all_current_feature_ids[0][k] }
              deleteFeaturesList.push(dff);
            }
            return deleteFeaturesList       
          }).then(function(deleteFeaturesList){
            edits = {
              deleteFeatures: deleteFeaturesList
            }
            return edits
          }).then(function(edits){
            console.log(edits)
            layer2edit.applyEdits(edits).then((results) => {
              console.log(results)
              if (results.deleteFeatureResults.length > 0) {
                console.log(
                  results.deleteFeatureResults.length,
                  "features have been removed"
                );
              }
              durm.featureTable.refresh();
            })
            .catch((error) => {
              console.error();
            });
          });         
        } catch (e) {
          console.log(e)
        }
      },
      addFeatures: function(layer2edit,edits){
        console.log("addFeatures")
        try {
          layer2edit
              .applyEdits(edits)
              .then((results) => {
                // if edits were removed
                if (results.deleteFeatureResults.length > 0) {
                  console.log(
                    results.deleteFeatureResults.length,
                    "features have been removed"
                  );
                }
                if (results.addFeatureResults.length > 0) {
                  var objectIds = [];
                  results.addFeatureResults.forEach((item) => {
                    objectIds.push(item.objectId);
                  });                
                  layer2edit
                    .queryFeatures({
                      objectIds: objectIds
                    })
                    .then((results) => {
                      console.log(
                        results.features.length,
                        "features have been added."
                      );
                    });                    
                }
                durm.featureTable.refresh();
              })
              .catch((error) => {
                console.error();
              });
          
        } catch (e) {
          console.log(e)
        }
      },  
      call_REST_streetname: function(streetstring) {
        console.log("call_REST_streetname")
        try {
          advthis = this;
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(streetstring)
 
              let advaddrquery = durm.active_address_points.createQuery();
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
    
              advaddrquery.returnGeometry = true;
              advaddrquery.outSpatialReference = { wkid: 4326 };
              advaddrquery.outFields = [ "STREETNAME" ];
              let de = "STREETNAME = '"+ streetstring +"'"
              advaddrquery.where = de
              return durm.active_address_points.queryFeatures(advaddrquery)
              .then(function(addrresponse) {
                console.log(addrresponse.features.length)
                let mp00 = new Multipoint()
                for(var j = 0; j < addrresponse.features.length; j++){
                  mp00.addPoint(addrresponse.features[j].geometry);
                }
                advparcelquery.geometry = mp00;
                advparcelquery.spatialRelationship = "intersects";
                advparcelquery.returnGeometry = true;
                advparcelquery.outSpatialReference = { wkid: 4326 };           
                return durm.parcelboundaryLayer.queryFeatures(advparcelquery)
              }).then(function(parcel_response){
                advthis.removeAllFeatures(durm.advsearch_features);                
                features2add = []
                for (var i=0; i < parcel_response.features.length; i++) {
                  let advsearchGraphic = new Graphic({
                    title:"idk",
                        geometry: parcel_response.features[i].geometry,
                        attributes: {
                          ObjectID: parcel_response.features[i].attributes.OBJECTID,
                          SITE_ADDRE: parcel_response.features[i].attributes.SITE_ADDRE,
                          PARCEL_ID: parcel_response.features[i].attributes.PARCEL_ID
                        }
                  });
                  features2add.push(advsearchGraphic)              
                }

                advthis.addFeatures(durm.advsearch_features,{
                  addFeatures: features2add
                });

                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible") 
                console.log(features2add)
                durm.mapView.goTo(features2add)
              });    
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
      call_REST_ownername: function(ownerstring) {
        console.log("call_REST_ownername")
        try {
          advthis = this;
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(ownerstring)
 
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
    
              advparcelquery.returnGeometry = true;
              advparcelquery.outSpatialReference = { wkid: 4326 };
              //advparcelquery.outFields = [ "STREETNAME" ];
              let de = "OWNER_NAME = '"+ ownerstring +"'"
              advparcelquery.where = de
              return durm.parcelboundaryLayer.queryFeatures(advparcelquery)
              .then(function(parcel_response){
                advthis.removeAllFeatures(durm.advsearch_features);                
                features2add = []
                for (var i=0; i < parcel_response.features.length; i++) {
                  let advsearchGraphic = new Graphic({
                    title:"idk",
                        geometry: parcel_response.features[i].geometry,
                        attributes: {
                          ObjectID: parcel_response.features[i].attributes.OBJECTID,
                          SITE_ADDRE: parcel_response.features[i].attributes.SITE_ADDRE,
                          PARCEL_ID: parcel_response.features[i].attributes.PARCEL_ID
                        }
                  });
                  features2add.push(advsearchGraphic)              
                }

                advthis.addFeatures(durm.advsearch_features,{
                  addFeatures: features2add
                });

                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible") 
                console.log(features2add)
                durm.mapView.goTo(features2add)
              });    
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
      //not used
      selectFeatures: function(geometry){
        try {
          console.log("SELECT FEATURES")
          if (durm.parcellayerView) {
            // create a query and set its geometry parameter to the
            // rectangle that was drawn on the view
            const query = {
              geometry: geometry,
              outFields: ["*"]
            };

            // query graphics from the csv layer view. Geometry set for the query
            // can be polygon for point features and only intersecting geometries are returned
            durm.parcellayerView
              .queryFeatures(query)
              .then((results) => {
                if (results.features.length === 0) {
                  durm.featureTable.clearSelection();
                } else {
                  featureTable.filterGeometry = geometry;
                  console.log(results.features)
                  featureTable.selectRows(results.features);
                }
              })
              .catch(console.log("Error"));
          }


        } catch (e) {
          console.log(e)
        }
      }

  }
}
);