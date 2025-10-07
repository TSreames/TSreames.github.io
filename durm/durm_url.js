/*
Matt Reames, 2020-22
This module handles the URL-webmap interactions.
*/
define([], function() {
  return {
    // The idea here is to not directly control mapview from this module.
    // We are setting global variables under the durm namespace, which the mapview reacts to elsewhere. 
    // Also esri has a urlToObject in its urlutils that could be used here instead. 
      init: function(){
        try {
          /* By default, assume no parameters were passed by the user */
          durm.all_initial_view_parameters_passed = false;
          durm.PID_passed = false;
          durm.lyrstate_passed = false;
          durm.appstate_passed = false;
          durm.basemap_passed = false;
          durm.aerials_passed = false;
          durm.utilities_passed = false;

          /* Extract any parameters that exist */
          durm.yparam = urlParam('y'); // longitude
          durm.xparam = urlParam('x'); // latitude
          durm.zparam = urlParam('z'); // scale
          durm.rparam = urlParam('r'); // rotation
          durm.bparam = urlParam('b'); // basemap          
          durm.pidparam = urlParam('pid'); //REID

          /* Test if REID is valid */
          const isValidPID = /^\d{6}$/gm.test(durm.pidparam);
          if(isValidPID) {
            durm.pidparam = urlParam('pid');
            durm.PID_passed = true;
          } else {
            durm.pidparam = "NA";
            durm.PID_passed = false;
          }
          durm.sparam = urlParam('s'); // app state string
          durm.lparam = urlParam('l'); // layer state string
          durm.aparam = urlParam('a'); // aerial mode
          durm.uparam = urlParam('u'); // utilities mode
          lyrIDlist = "";

        
          // load app state string on init
          if (durm.sparam) { 
            durm.appstate_passed = true; 
            durm.app_state_string = durm.sparam;
          } else { 
            //No state was specified
            durm.app_state_string = "default";
          }

          // load layer state string on init
          if (durm.lparam){
            durm.lyrstate_passed = true; 
            durm.layer_state_string = durm.lparam;
          } else {
            //No layers were specified to be on by default
            durm.layer_state_string = "";
          }

          // load basemap id on init
          if (durm.bparam) {   
            durm.basemap_passed = true;
          }

          // zoom on init
          if (durm.yparam && durm.xparam && durm.zparam && durm.rparam) { durm.all_initial_view_parameters_passed = true; }

          // // load basemap id on init
          // if (durm.aparam) {   
          //   durm.aerials_passed = true;
          // } else {}



          //console.log(durm.aparam)
          durm.aparam = durm.aparam !== undefined && durm.aparam !== null ? Number(durm.aparam) : null;
          //console.log(durm.aparam)

          if (durm.aparam == null) {
            durm.aerials_passed = false;
            console.log("durm.aparam is null, setting durm.aerials_passed to false");
          } else if (typeof durm.aparam !== 'number') {
            console.log("durm.aparam is not a number, setting durm.aerials_passed to false");
            durm.aerials_passed = false;
          } else if (!Number.isInteger(durm.aparam)) {
            console.log("durm.aparam is not an integer, setting durm.aerials_passed to false");
            durm.aerials_passed = false;
          } else if (durm.aparam === 0) {
            console.log("durm.aparam is 0, setting durm.aerials_passed to false");
            durm.aerials_passed = false;
          } else if (durm.aparam === -1) {
            console.log("durm.aparam is -1, setting durm.aerials_passed to true");
            durm.aerials_passed = false;
          } else if (durm.aparam > 0) {
            console.log("durm.aparam is greater than 0, setting durm.aerials_passed to true");
            durm.aerials_passed = true;
          } else {
            console.log("durm.aparam is some other thing, so setting durm.aerials_passed to false");
            durm.aerials_passed = false;
          }


          if (durm.uparam) {   
            durm.utilities_passed = true;
          }

        } catch (e) { console.log(e); }

      },
      zoom_to_pid: function() {
        let query = durm.parcelboundaryLayer.createQuery();
        query.where = "REID = '"+durm.pidparam+"'";
        query.returnGeometry = true;
        query.outSpatialReference = { wkid: 102100 };
        query.outFields = [ "*" ];

        durm.parcelboundaryLayer.queryFeatures(query)
          .then(function(response){
            if(response.features.length > 0){

              durm.mapView.popup.open({
                features: [response.features[0]]
              });

              //This bit helps "Center" the zoom on the right half of the page.
              //There is definitely a more precise way to do this
              let dx = durm.mapView.width*-0.03//default
              var cloneExt = response.features[0].geometry.extent.clone();
              extentcoeff = (response.features[0].geometry.extent.xmax-response.features[0].geometry.extent.xmin)*(-0.2)
              widthcoeff = durm.mapView.width*(-0.005)
              dx = extentcoeff + widthcoeff

              //dx = 0 //Use no offset until we can figure out something more precise
              var cloneExt = response.features[0].geometry.extent.clone();
              durm.mapView.goTo({
                target: response.features[0],
                extent: cloneExt.expand(1.75).offset(dx,0,0)
              }, { 
                duration: 500  // Duration of animation will be 5 seconds
              });

            } else {
              //the server didn't return a valid result, so nothing
              console.log("URL Parameter passed in invalid REID")
            }
          });
      }
  };
});