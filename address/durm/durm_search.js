define([
  "esri/widgets/Search"
], function(
  Search
) {
return {
  search_init: function(g) {
    try {  
      let sources1 = [
        {
          url: "https://webgis2.durhamnc.gov/host/rest/services/Tools/Active_Addresses/GeocodeServer",
          singleLineFieldName: "SingleLine",
          outFields: ["*"],
          name: "Durham Address Locator",
          placeholder: "Enter Address",
          resultSymbol: {
            type: "simple-marker",  // autocasts as new PictureMarkerSymbol()
            color:"#bf1e2e",
            outline: {
              color: "black",
              width:"0.5px"
            },
            size:11,
            xoffset: 0,
            yoffset: 0
          }
        }
      ]

      durm.searchWidget_default = new Search({
        id: "default-Search",
        view: durm.mapView,
        locationEnabled:false,
        includeDefaultSources: false,
        sources: sources1,
        container:"searchbox"
      });  
      durm.searchWidget_default.on("select-result", function(event){ 
        durm.result = event.result;        
        durm.current_location_feature = event.result.feature;
        durm.current_location_geometry = event.result.feature.geometry;
        durm.current_location_name = event.result.feature.attributes.LongLabel
        let query = durm.parcelboundaryLayer.createQuery();
        query.geometry = durm.current_location_geometry;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        query.outSpatialReference = { wkid: 102100 };
        query.outFields = [ "*" ];         
        durm.parcelboundaryLayer.queryFeatures(query).then(function(response) {
          durm.current_top_parcel = response.features[0];
          durm.current_all_parcels = response.features;
          return;
        }).then(function() {
          mainscope.load_results_based_on_current_appstate();
        });
        
      });
    } catch (e) {
      console.log(e);
    }
  }
};
});