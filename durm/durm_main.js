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
        durm.fire_ccpermit_popup = function(permitid){	durm_popups.load_special_popup("A_NUMBER",permitid,CROSS_CONNECT_PERMITS_URL,"Cross Connection Permit")	}
  

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

        durm.mapView.when(() => {
          durm_layers.connect_to_portal();
          durm_ui.init();
          durm_ui.draw_initial_widgets();	
          durm_layers.populate();      
          durm_ui.set_components_desktop_or_mobile();
          document.getElementById("bodycontainer").style.cursor = "progress";   
          durm_ui.set_responsive_watches();
          durm_watch.set_watches();
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
  
  
    whenLoaded: function() {
      try {
        let self = this;
        durm.mapView.when(() => {
          durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
            durm.parcellayerView = parcellayerView;
            document.getElementById("bodycontainer").style.cursor = "default";

            /* implement whatever initial parameters were passed in through the URL */

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

            if (durm.basemap_passed) {
              durm_gallery.setBasemapID(durm.bparam);
            }

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

            if (durm.aerials_passed) {
              if(durm.aparam == -1) { durm_ui.disable_aerials_mode(); }
              else { durm_ui.enable_aerials_mode(durm.aparam); }
            } 
            else { 
              durm_ui.disable_aerials_mode();
            }

            if (durm.utilities_passed) {
              if(durm.uparam == 1) {
                durm_ui.load_utilities()
              }
              else {
                durm.uparam = 0
              }
            } else {
              durm.uparam = 0
            }

            durm_ui.init_layer_control();
            durm_ui.reorder_all_layers_to_default();
            durm_addresstool.init();            
          });
        });
      } catch (e) { 
        console.log(e);
      }	
    }
  };
});