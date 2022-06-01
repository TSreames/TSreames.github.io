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
        tblscope = this;
        let table_features = []
        try {
          durm.advsearch_graphics = new GraphicsLayer({id:'advsearch_graphics_results'});
          durm.map.add(durm.advsearch_graphics);

          let defaultemptyfeatures000 = [
            {
              geometry: {
                type: "polygon",
                rings:  []
              },
              attributes: {
                ObjectID: 0,
                SITE_ADDRE: 'WORDS',
                PARCEL_ID: 'MOREWORds'
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
             // { objectId: 467 },
             // { objectId: 500 }
            ];
            all_current_feature_ids.push(ids)
            console.log(all_current_feature_ids)
            for(let k = 0; k < all_current_feature_ids[0].length; k++){
              console.log(all_current_feature_ids.length)
              console.log(all_current_feature_ids[0][k])
              //console.log(all_current_feature_ids[k][0])
              let dff = { objectId : all_current_feature_ids[0][k] }
              deleteFeaturesList.push(dff);
            }
            return deleteFeaturesList       
          }).then(function(deleteFeaturesList){
            console.log(deleteFeaturesList)
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
                // if features were added - call queryFeatures to return
                //    newly added graphics
                if (results.addFeatureResults.length > 0) {
                  var objectIds = [];
                  results.addFeatureResults.forEach((item) => {
                    objectIds.push(item.objectId);
                  });
                  // query the newly added features from the layer                  
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
      call_REST: function(streetstring,ownerstring) {
        console.log("call_REST")
        try {
          advthis = this;
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(streetstring)
              console.log(ownerstring)
  
              let advaddrquery = durm.active_address_points.createQuery();
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
    
              advaddrquery.returnGeometry = true;
              advaddrquery.outSpatialReference = { wkid: 4326 };
              advaddrquery.outFields = [ "STREETNAME" ];
              let de = "STREETNAME = '"+ streetstring +"'"
              advaddrquery.where = de
              return durm.active_address_points.queryFeatures(advaddrquery)
              .then(function(addrresponse) {
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
                        }/*,
                        symbol: {
                          type: "simple-fill", // autocasts as new SimpleFillSymbol()
                          color: [244, 66, 66, 1],
                          outline: {
                            width: 1.5,
                            color: "red"
                          },                                  
                          style: "solid"
                        }*/
                  });
                  features2add.push(advsearchGraphic)              
                }

                advthis.addFeatures(durm.advsearch_features,{
                  addFeatures: features2add
                });
                /*
                durm.advsearch_features.applyEdits({
                  addFeatures: [features2add]
                }).then(function(results) {
                  console.log(results)
                  return durm.advsearch_features.queryFeatures()
                }).then(function(results) {
                  console.log(results)
                  durm.featureTable.layer = durm.advsearch_features
                });
                */


                //durm.featureTable.layer = durm.advsearch_features


                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible") 

                durm.mapView.goTo(durm.advsearch_features)
              });    
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
      call_REST_STILLNOTWORKIGN: function(streetstring,ownerstring) {
        try {
          restthis = this
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(streetstring)
              console.log(ownerstring)
  
              let advaddrquery = durm.active_address_points.createQuery();
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
    
              advaddrquery.returnGeometry = true;
              advaddrquery.outSpatialReference = { wkid: 4326 };
              advaddrquery.outFields = [ "STREETNAME" ];
              let de = "STREETNAME = '"+ streetstring +"'"
              advaddrquery.where = de
              return durm.active_address_points.queryFeatures(advaddrquery)
              .then(function(addrresponse) {
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
                console.log(parcel_response)                

                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible")  
   
                durm.advsearch_graphics.removeAll();
                for (var i=0; i < parcel_response.features.length; i++) {
                  console.log(parcel_response.features[i])
                  let advsearchGraphic = new Graphic({
                        geometry: parcel_response.features[i].geometry,
                        symbol: {
                          type: "simple-fill", // autocasts as new SimpleFillSymbol()
                          color: [244, 66, 66, 1],
                          outline: {
                            width: 1.5,
                            color: "red"
                          },                                  
                          style: "solid"
                        }
                  });
                  durm.advsearch_graphics.add(advsearchGraphic);

                  let advsearchPoly = new Polygon({
                    geometry: parcel_response.features[i].geometry,
                    attributes: parcel_response.features[i].attributes,
                    symbol: {
                      type: "simple-fill", // autocasts as new SimpleFillSymbol()
                      color: [244, 66, 66, 1],
                      outline: {
                        width: 1.5,
                        color: "red"
                      },                                  
                      style: "solid"
                    }
                  });
                  //restthis.addFeature(advsearchPoly.geometry)

                  let attributes = {};
                  attributes["SITE_ADDRE"] = parcel_response.features[i].attributes["SITE_ADDRE"];
                  attributes["PARCEL_ID"] = parcel_response.features[i].attributes["PARCEL_ID"];
        
                  const addFeature =  new Graphic({
                    geometry: geometry,
                    attributes: attributes
                  });
                
                  const deleteFeatures = [
                    { objectId: 467 },
                    { objectId: 500 }
                  ];
                
                  durm.advsearch_features.applyEdits({
                    addFeatures: [addFeature]
                    //deleteFeatures: deleteFeatures
                  }).then(function(results) {});

                  //advsearch_result_parcel_attributes.push(parcel_response[i].attributes);
                  //durm.advsearch_features.add(advsearchPoly);
                  //durm.advsearch_features.applyEdits(advsearchPoly);

                  // ADD INDIVIDUAL POLYGON TO FEATURE LAYER HERE.  SOMEHOW.  IDK.

                }
                console.log(durm.advsearch_graphics)
                console.log(durm.advsearch_features)
                durm.mapView.goTo(durm.advsearch_graphics.graphics)

                //durm.featureTable.layer = durm.advsearch_graphics.graphics;  
                

              });  
  
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
      call_REST_working_but_VERYslow: function(streetstring,ownerstring) {
        try {
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(streetstring)
              console.log(ownerstring)
  
              let advaddrquery = durm.active_address_points.createQuery();
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
  
              //1.  query address points by streetname
              //2.  get the results as x,y and do spatial query intersecting with parcels
              //3.  get parcels as objectids only
              //4.  load a new FeatureLayer with a definition expression loading only those objectid's
              //5.  add that to the map and the table
  
              advaddrquery.returnGeometry = true;
              advaddrquery.outSpatialReference = { wkid: 4326 };
              advaddrquery.outFields = [ "STREETNAME" ];
              let de = "STREETNAME = '"+ streetstring +"'"
              advaddrquery.where = de
              return durm.active_address_points.queryFeatures(advaddrquery)
              .then(function(addrresponse) {
                let mp00 = new Multipoint()
                for(var j = 0; j < addrresponse.features.length; j++){
                  mp00.addPoint(addrresponse.features[j].geometry);
                }
                advparcelquery.geometry = mp00;
                advparcelquery.spatialRelationship = "intersects";
                advparcelquery.returnGeometry = false;
                advparcelquery.outSpatialReference = { wkid: 4326 };
                advparcelquery.outFields = ['OBJECTID'];              
                return durm.parcelboundaryLayer.queryObjectIds(advparcelquery)
              }).then(function(parcel_response){
                //console.log(parcel_response)

                console.log(parcel_response.length)

                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible")  

                let defex = "OBJECTID IN ("
                for(var j = 0; j < parcel_response.length; j++){
                  if(j == parcel_response.length-1) {
                    defex = defex + parcel_response
                  } else {
                  defex = defex + parcel_response + ", "
                  }
                }
                defex = defex + ")"

                //console.log(defex)

                const parcels_temp = new FeatureLayer({
                  id: "parcels_temp",
                  url: PARCELS_AGOL,
                  spatialReference: { wkid: 102100 },
                  listMode: "hide",
                  definitionExpression: defex,
                  renderer: thicc_parcelboundaryRenderer
                });
                durm.map.add(parcels_temp)
                durm.featureTable.layer = parcels_temp;  

              });  
  
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
      call_REST_NOTWORKING: function(streetstring,ownerstring) {
        try {
          durm.mapView.when(() => {
            durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
              
              console.log(streetstring)
              console.log(ownerstring)

              durm.featureTable.layer = durm.parcelboundaryLayer;  
  
              let advaddrquery = durm.active_address_points.createQuery();
              let advparcelquery = durm.parcelboundaryLayer.createQuery();
  
              //1.  query address points by streetname
              //2.  get the results as x,y and do spatial query intersecting with parcels
              //3.  get parcels
              //4.  add parcels to map + table
  
              advaddrquery.returnGeometry = true;
              advaddrquery.outSpatialReference = { wkid: 4326 };
              advaddrquery.outFields = [ "STREETNAME" ];
              let de = "STREETNAME = '"+ streetstring +"'"
              console.log(de)
              //STREETNAME = 'Englewood'
              advaddrquery.where = de
              return durm.active_address_points.queryFeatures(advaddrquery)
              .then(function(addrresponse) {
                let mp00 = new Multipoint()
                for(var j = 0; j < addrresponse.features.length; j++){
                  mp00.addPoint(addrresponse.features[j].geometry);
                }
                advparcelquery.geometry = mp00;
                advparcelquery.spatialRelationship = "intersects";
                advparcelquery.returnGeometry = true;
                advparcelquery.outSpatialReference = { wkid: 4326 };
                advparcelquery.outFields = ['PARCEL_ID','SITE_ADDRE'];              
                return durm.parcelboundaryLayer.queryFeatures(advparcelquery)
              }).then(async function(pars){
                const geometries = pars.features.map(function (
                  graphic
                ) {
                  return graphic.geometry;
                });
                queryGeometry = await geometryEngineAsync.union(
                  geometries
                );
                document.getElementById("tableDiv").style.visibility = "visible";   
                document.getElementById("searchpanel").classList.remove("is-visible")  

  
                //durm.featureTable.filterGeometry = queryGeometry;
                //console.log(durm.mapView.extent)
                //durm.featureTable.filterGeometry = durm.mapView.extent;

                //durm.featureTable.selectRows(pars.features);
                
                
                
                
                
                //tblscope.selectFeatures(queryGeometry);  


                
                

                if (durm.parcellayerView) {
                  // create a query and set its geometry parameter to the
                  // rectangle that was drawn on the view
                  console.log(queryGeometry)
                  const query = {
                    geometry: queryGeometry,
                    outFields: ["*"]
                  };
      
                  // query graphics from the csv layer view. Geometry set for the query
                  // can be polygon for point features and only intersecting geometries are returned
                  durm.parcellayerView
                    .queryFeatures(query)
                    .then((results) => {
                      console.log(results)
                      if (results.features.length === 0) {
                        console.log("results had no features so we cleared")
                        durm.featureTable.clearSelection();
                      } else {
                        // pass in the query results to the table by calling its selectRows method.
                        // This will trigger FeatureTable's selection-change event
                        // where we will be setting the feature effect on the csv layer view
                        console.log("results had features so we filtered")
                        durm.featureTable.filterGeometry = queryGeometry;
                        console.log(results.features)
                        durm.featureTable.selectRows(results.features);
                      }
                    })
                    .catch(console.log("Error"));
                }











              });  
  
            });
          });
        } catch (e) { 
          console.log(e);
        }	
      },
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