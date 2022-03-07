/*
Matt Reames, 2019
This module loads the Map and MapView, and begins a cascade of related functions
*/

define([
    "esri/Map","esri/views/MapView",
    "esri/config",
    "esri/widgets/Popup", "esri/widgets/Popup/PopupViewModel","esri/tasks/GeometryService",
    "../durm/durm_popups.js",
    "../durm/durm_gallery.js","../durm/durm_watch.js",
    "../durm/durm_layers.js", "../durm/durm_url.js", "../durm/durm_addresstool.js",
    "../durm/durm_ui.js"
  ], function(Map, MapView, 
    esriConfig,
    Popup, PopupViewModel, GeometryService,
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
        durm.fire_devcase_popup = function(caseid){	durm_popups.load_case_popup(caseid)	}
        durm.fire_allpermit_popup = function(permitid){	durm_popups.load_permit_popup(permitid)	}
        durm.fire_tradepermit_popup = function(permitid){	durm_popups.load_tradepermit_popup(permitid)	}
        durm.fire_bldgpermit_popup = function(permitid){	durm_popups.load_bldgpermit_popup(permitid)	}
        durm.fire_mechpermit_popup = function(permitid){	durm_popups.load_mechpermit_popup(permitid)	}
        durm.fire_elecpermit_popup = function(permitid){	durm_popups.load_elecpermit_popup(permitid)	}
        durm.fire_plumpermit_popup = function(permitid){	durm_popups.load_plumpermit_popup(permitid)	}
        durm.fire_parcel_popup = function(parcelid){ durm_popups.load_parcel_popup(target_parcel)	}

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

        
        esriConfig.geometryService = new GeometryService(geometryservice_url);

        durm_gallery.populate_array_of_basemaps()	
        durm.map.basemap = durm_gallery.getDefaultBasemap();

        durm.mapView.when(() => {
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
    whenLoaded: function() {
      try {
        durm.mapView.when(() => {
          durm.mapView.whenLayerView(durm.parcelboundaryLayer).then(function(parcellayerView){
            durm.parcellayerView = parcellayerView;
            document.getElementById("bodycontainer").style.cursor = "default";

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

            if ((durm.appstate_passed) && (durm.lyrstate_passed)) {
              // IF the status is anything but default, then make whatever you find in durm.layer_state_string visible.
              if(durm.app_state_string == "custom") {
                lyrIDlist = durm.layer_state_string.split(',')
                durm.map.layers.items.forEach(function(r) {
                  //Preset button should ignore certain layers
                  if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
                  else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
                  else if(r.id === "graphics") {}
                  else if (lyrIDlist.includes(r.id)) { r.visible = true; }
                  else { r.visible = false; }
                });

                // then run something that ensures the individual layers have visibility set to "true"
              }
              else { durm_ui.set_app_state(durm.sparam,durm.lparam); }
            } else if(durm.appstate_passed) {
              durm_ui.set_app_state(durm.sparam);
            } else {
              durm_ui.set_app_state("default");
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