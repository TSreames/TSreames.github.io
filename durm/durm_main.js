/*
Matt Reames, 2019
This module loads the Map and MapView, and begins a cascade of related functions
*/

define([
    "esri/Map","esri/views/MapView",
    //"esri/config",
    "esri/widgets/Popup", "esri/widgets/Popup/PopupViewModel",//"esri/rest/geometryService",
    "../durm/durm_popups.js",
    "../durm/durm_gallery.js","../durm/durm_watch.js",
    "../durm/durm_layers.js", "../durm/durm_url.js", "../durm/durm_addresstool.js",
    "../durm/durm_ui.js"
  ], function(Map, MapView, 
    //esriConfig,
    Popup, PopupViewModel, //geometryService,
    durm_popups,
    durm_gallery,durm_watch,
    durm_layers, durm_url, durm_addresstool,
    durm_ui
  ) {
  return {
    init: function(){
      try {
        // Initialize Promise for nearmap check coordination
        durm.nearmapCheckComplete = new Promise(resolve => {
          durm._resolveNearmapCheck = resolve;
        });
        document.getElementById("bodycontainer").style.cursor = "progress";
        durm.all_planner_button = document.getElementById("all_planner_button");
        durm.planner_checkboxes = document.getElementById("planner-checkboxes");

        //independent popup control
        durm.fire_devcase_popup = function(permitid){	durm_popups.load_special_popup("A_NUMBER",permitid,ALL_DEV_CASES,"Development Cases")	}
        durm.fire_allpermit_popup = function(permitid){	durm_popups.load_special_popup("PermitNum",permitid,BUILDING_PERMITS_SUBLAYER,"Building Permit")	}
        durm.fire_tradepermit_popup = function(permitid){	durm_popups.load_special_popup("A_NUMBER",permitid,ALL_BI_TRADE_PERMITS,"Trade Permit") }
        durm.fire_bldgpermit_popup = function(permitid){	durm_popups.load_special_popup("Permit_ID",permitid,ACTV_BLDG_PERMITS_URL_SUBLAYER,"Building Permit") }
        durm.fire_mechpermit_popup = function(permitid){	durm_popups.load_special_popup("Permit_ID",permitid,ACTV_MECH_PERMITS_URL_SUBLAYER,"Mechanical Permit")	}
        durm.fire_elecpermit_popup = function(permitid){	durm_popups.load_special_popup("Permit_ID",permitid,ACTV_ELEC_PERMITS_URL_SUBLAYER,"Electrical Permit")	}
        durm.fire_plumpermit_popup = function(permitid){	durm_popups.load_special_popup("Permit_ID",permitid,ACTV_PLUMB_PERMITS_URL_SUBLAYER,"Plumbing Permit")	}
  

        d = new Date();
				yearnum = d.getFullYear();

        durm_url.init();

        durm.PopupViewModel =  new PopupViewModel({
          view: durm.mapView,
          visible: false,
        });

        durm.Popup = new Popup({
          viewModel: durm.PopupViewModel,
          dockEnabled: true,
          defaultPopupTemplateEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: "top-left"
          },
          visibleElements: {
              collapseButton: false
          }
        });

        durm.map = new Map();
        durm.mapView = new MapView({
          map: durm.map,
          center: [-78.8986, 35.994],
          zoom: 11,
          popup: durm.Popup,
          container: "mapViewDiv",
          highlightOptions: {
            color: [66, 244, 209, 1],
            haloOpacity: 0.95,
            fillOpacity: 0.25
          }
        });

        durm_gallery.populate_array_of_basemaps()	
        durm.map.basemap = durm_gallery.getDefaultBasemap();

        durm.mapView.when(async () => {
          try {
            await durm_layers.connect_to_portals();
            durm_ui.init();

            // WAIT for populate to complete
            await durm_layers.populate();
            console.log("✓ All layers ready");

            // Build layer list UI - CRITICAL: Must run BEFORE URL params
            durm_ui.init_layer_control();

            // Create widgets
            durm_ui.draw_initial_widgets();

            // Process URL params (moved from whenLoaded)
            this.checkPIDpassed();
            this.checkBasemappassed();
            this.checkLayerstringpassed();
            this.checkAerialspassed();
            this.checkUtilitiespassed();

            // Adjust responsive layout
            durm_ui.set_components_desktop_or_mobile();

            // Set up event listeners
            durm_ui.set_responsive_watches();
            durm_watch.set_watches();

            // Initialize address tool (moved from whenLoaded)
            durm_addresstool.init();

            // Signal app is ready
            document.getElementById("bodycontainer").style.cursor = "default";
          } catch (error) {
            console.error("Initialization failed:", error);
            document.getElementById("bodycontainer").style.cursor = "default";
            //alert("Failed to load map layers. Please refresh the page.");
          }
        });


      } catch (e) {
        console.log(e);
      }	
    }, 
    ensure_item_is_on_by_id: function(idname) {
      console.log("toggle:", idname);      
      setTimeout(() => {
          var listItem = document.getElementById(idname);
          if (listItem) {
              let checkbox = listItem.querySelector(".onoffswitch-checkbox");
              if (checkbox) {
                  checkbox.checked = !checkbox.checked;
                  checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
              }
          } else {
              console.warn("Item not found, even after delay:", idname);
          }
      }, 500);
    },

    checkPIDpassed: function() {
      console.log("durm_main: checkPIDpassed called");
        if(durm.PID_passed){
          durm_url.zoom_to_pid();
        } else if(durm.all_initial_view_parameters_passed) {              
          durm.mapView.scale = durm.zparam;
          durm.mapView.center = [durm.yparam, durm.xparam];
          durm.mapView.rotation = durm.rparam;
        } else {
          durm.mapView.center = [-78.8986, 35.994];
          durm.mapView.zoom = 11;
        }	  
    },
    checkBasemappassed: function() {
      console.log("durm_main: checkBasemappassed called");
        if (durm.basemap_passed) {
          durm_gallery.setBasemapID(durm.bparam);
        }
    },
    checkLayerstringpassed: function() {
        console.log("durm_main: checkLayerstringpassed called");
        stuff_to_ignore = ["parcels","active_address_points","countymask","graymap_roads","graymap_labels","graphics","orangepars","wakepars"]
        if ((durm.appstate_passed) && (durm.lyrstate_passed)) {
          // IF the status is anything but default, then make whatever you find in durm.layer_state_string visible.
          if(durm.app_state_string == "custom") {               
            lyrIDlist = durm.layer_state_string.split(',')
            durm.map.layers.items.forEach(function(r) {
              //Preset button should ignore certain layers
              if(stuff_to_ignore.includes(r.id)) {
              }
              else if (lyrIDlist.includes(r.id)) { 
                // Note.  We COULD borrow ensure_item_is_on_by_id for this, but we don't need to.  The original design is to simply set r.visible and the event listeners take it from there.
                //   Because secured layers (in the section below this one) are *not added to the map until toggled* they work differently.
                r.visible = true; 
              }
              else { 
                r.visible = false; // Force any other layers nonvisible
              }
            });
            durm.securedLayers.forEach(function(r) {
              try {
                if(stuff_to_ignore.includes(r.id)) {
                  // If it's in stuff_to_ignore, then ignore it.
                }
                else if (lyrIDlist.includes(r.id)) {
                  // If it's been imported in the URL string upon load, then use toggle_item_by_id to fire the menu event
                  console.log("Toggling visibility for:", r.id);
                  self.ensure_item_is_on_by_id(r.id)  //Instead of adding the layer to durm.map (which would seem common sense, but is problematic here), we should flip the HTML toggle programmatically.
                }
                else { 
                }
              } catch (e) {
                  console.error("Error processing layer:", r.id, e);
              }
            });

          }
          else { durm_ui.set_app_state(durm.sparam,durm.lparam); }
        } else if(durm.appstate_passed) {
          durm_ui.set_app_state(durm.sparam);
        } else {
          durm_ui.set_app_state("default");
        }
    },
    checkAerialspassed: function() {
            if (durm.aerials_passed) {
              console.log("whenLoaded checked if aerials were passed.")
              if(durm.aparam == -1) { 
                console.log("durm_main disabled aerial mode via durm.aerials_passed")
                durm_ui.disable_aerials_mode(); 
              }
              else { 
                console.log("durm_main enabled aerial mode via durm.aerials_passed")
                durm_ui.enable_aerials_mode(durm.aparam); 
              }
            } 
            else { 
              durm_ui.disable_aerials_mode();
            }

    },
    checkUtilitiespassed: function() {
            if (durm.utilities_passed) {
              if(durm.uparam == 1) {
                console.log("durm_main enabled utilities mode via durm.uparam")
                durm_ui.load_utilities()
              }
              else {
                durm.uparam = 0
              }
            } else {
              durm.uparam = 0
            }     
    }
  };
});