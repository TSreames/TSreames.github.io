/*
Matt Reames, 2019
This module includes a variety of custom events, particularly those related to the UI
*/
define([
    //"esri/core/watchUtils",
    "esri/core/reactiveUtils",
    "../durm/durm_ui.js",
    "esri/widgets/DistanceMeasurement2D", "esri/widgets/AreaMeasurement2D"
    ], function(//watchUtils, 
      reactiveUtils,
      durm_ui,
      DistanceMeasurement2D,AreaMeasurement2D) {
    return {       
        set_watches: function(){
          try {
            durm.watchscope = this;

            /* watch for right clicks -- this will be a menu */
            durm.mapView.on("click", function(event) {
               if(event.button === 2) { 
                   rightclickmenu.setAbsolutePosition(event.x, event.y);
                   rightclickmenu.open = true;
                }
               else {}
            });

            /* update URL when a new basemap is chosen */
            durm.map.watch('basemap', function(){
              push_new_url();              
            });

            /* update URL when mapView is stationary */
            reactiveUtils.when(
              () => durm.mapView.stationary === true,
              () => {
                push_new_url();
              }
             );

            //When the Popup cycles thru its active selections, push that to the PID
            //Remember that some of these are not always Parcel popups, they could be any layer that has a popup
            durm.mapView.popup.when(() => {
              reactiveUtils.watch(
                () => durm.mapView.popup.selectedFeature,
                (v) => {
                  if(v==null) {
                    durm.pidparam = "NA"
                  }
                  else {
                    if(v.layer==null){
                      durm.pidparam = "NA"
                    }
                    else {
                      if(v.layer.id == "parcels") {
                        durm.pidparam = v.attributes.REID
                      }
                      else {
                        durm.pidparam = "NA"
                      }
                    }
                  }
                  push_new_url()
                });
            });


            reactiveUtils.watch(
              () => durm.mapView.popup.visible,
              (v) => {
                if(durm.mapView.popup.visible){           
                } else {
                  durm.pidparam = "NA";
                }
                push_new_url();
              });
      

            durm.mapView.on("hold", function(event) {
              rightclickmenu.setAbsolutePosition(event.x, event.y);
              rightclickmenu.open = true;
            });

            //durm.activeWidget = null;

            durm.distance_button = document.getElementById("distanceButton");

            durm.distance_button.addEventListener("click", function(){
              setActiveWidget(null);
              if (!this.classList.contains("active")) { setActiveWidget("distance") } 
              else { setActiveButton(null) }
            });

            durm.area_button.addEventListener("click", function(){
              setActiveWidget(null);
              if (!this.classList.contains("active")) { setActiveWidget("area") } 
              else { setActiveButton(null) }
            });

            /* the event handler for the Mailing List  button is in durm_addresstool */            
            function setActiveWidget(type) {
                switch (type) {
                  case "distance":
                    durm.activeWidget = new DistanceMeasurement2D({
                      //view: durm.mapView,
                      viewModel: {
                        view: durm.mapView,
                        mode: "geodesic",
                        unit: "us-feet"
                      }
                    });      
                    // skip the initial 'new measurement' button
                    durm.activeWidget.viewModel.start();

                    durm.mapView.ui.add(durm.activeWidget, "top-right");
                    setActiveButton(document.getElementById("distanceButton"));
                    break;
                  case "area":
                    console.log(durm.mapView);
                    durm.activeWidget = new AreaMeasurement2D({
                      //view: durm.mapView
                      viewModel: {
                        view: durm.mapView,
                        mode: "geodesic",
                        unit: "square-us-feet"
                      }
                    });      
                    // skip the initial 'new measurement' button
                    durm.activeWidget.viewModel.start();      
                    durm.mapView.ui.add(durm.activeWidget, "top-right");
                    setActiveButton(document.getElementById("areaButton"));
                    break;
                  case null:
                    if (durm.activeWidget) {
                      durm.mapView.ui.remove(durm.activeWidget);
                      durm.activeWidget.destroy();
                      durm.activeWidget = null;
                    }
                    break;
                }
              }
            function setActiveButton(selectedButton) {
                // focus the view to activate keyboard shortcuts for sketching
                durm.mapView.focus();
                var elements = document.getElementsByClassName("active");
                for (var i = 0; i < elements.length; i++) {
                  elements[i].classList.remove("active");
                }
                if (selectedButton) {
                  selectedButton.classList.add("active");
                }
            }

            /* change cursor to loading when map updates */
            durm.mapView.watch("updating", function(updating){
                if(updating === true) { document.getElementById("mapViewDiv").style.cursor = "progress"; }
                else { document.getElementById("mapViewDiv").style.cursor = "default"; }
            });

            durm.reset_button.addEventListener("click", function(){
              durm_ui.set_app_state("default");
              durm_ui.disable_aerials_mode();
            });

            let cb1 = document.getElementById("closebar1")
            cb1.addEventListener("click", function(){
              document.getElementById("layerpanel").classList.remove("is-visible")
            });
            let t0gg = document.getElementById("maptoggle")
            t0gg.addEventListener("click", () => {
              if(durm.aparam==-1) {
                durm_ui.enable_aerials_mode(durm.defaultaerialid);
              } else {
                durm_ui.disable_aerials_mode();
              }
            });

          } catch (e) { console.log(e); }
        }
    };
});