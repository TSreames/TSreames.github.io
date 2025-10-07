// This is the *main* app, meaning that it loads the Map and MapView, and any related functions.
define([
    "esri/Map","esri/views/MapView",
    "esri/core/reactiveUtils",
    "esri/layers/FeatureLayer",
    "esri/Basemap", "esri/portal/PortalItem",
    "./durm/durm_search.js","./durm/durm_schools.js","./durm/durm_property.js","./durm/durm_ui.js"
  ], function(Map, MapView,
    reactiveUtils,
    FeatureLayer,
    Basemap, PortalItem,
    durm_search, durm_schools, durm_property, durm_ui
  ) {
  return {
    init: function(){
      try {
        /* This block of code gets updated annually each summer */
        /* You also need to update a block of code in durm_schools.js, for the services */
        now = "25_26"
        nowstring = "View Current Year's Assignment (2025-26)"
        nowprefix = "2025-2026"

        nextyear = "26_27"  //used in the link back to Durham Maps
        nextstring = "View Next Year's Assignment (2026-27)"  //used in the button
        nextprefix = "2026-2027" //used in results table

        /* end */

        durm_ui.init()
        mainscope = this;
        durm.map = new Map();
        durm.mapView = new MapView({
          map: durm.map,
          container: "mapViewDiv",
          center: [-78.8986, 35.994],
          zoom: 11,
          highlightOptions: {
            color: [66, 244, 209, 1],
            haloOpacity: 0.95,
            fillOpacity: 0.25
          }
        });

        durm.mapView.popup = null;
  
        navigation_item = new PortalItem({ id: "c50de463235e4161b206d000587af18b" });	  
        navigation_basemap = new Basemap({ portalItem:navigation_item });
        durm.map.basemap = navigation_basemap;
  
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
        durm.active_address_points = new FeatureLayer({
          id: "active_address_points",
          title: "Address Points",
          listcategory: "Administrative",
          url: ADDRESS_FS_URL,
          popupTemplate: {title:"Address Point",content:[{
            type: "fields",
            fieldInfos: [{
              fieldName: "SITE_ADDRE",
              label: "Site Address"
              }]
            }]
          },
          labelingInfo: [addresslabelClass],
          visible: true
        });
        durm.active_address_points.minScale = 6000;
        durm.map.add(durm.active_address_points);
        durm.active_address_points.when(function(){})
        .catch(function(error){
          mainscope.handle_layer_loading_failure(error);
        });
  
        
        durm.parcelboundaryLayer = new FeatureLayer({
          id: "parcels",
          title: "Parcels",
          url: PARCELS_AGOL,
          visible: true,
          outFields: ["REID","PIN"]
        });
        durm.parcelboundaryLayer.minScale = 17000;
        durm.map.add(durm.parcelboundaryLayer);

        durm_schools.init(now,nextyear);
        durm_property.init();

        durm_search.search_init();
        this.whenLoaded();

      } catch (e) {
        console.log(e);
      }

      // Handle URL parameters
      try {
        durm.yresult = 0
        durm.xresult = 0
        durm.zresult = 0
        // This function takes whatever is in the URL, and converts it to a JS value. Useful for the initialized version of the map.
        var urlParam = function(name, w) {
          w = w || window;
          var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
              val = w.location.search.match(rx);
          return !val ? '':val[1];
        }

        durm.pageparam = urlParam('page');        
        if (durm.pageparam) { 
          durm.app_state_string = durm.pageparam;
        } else {
          durm.app_state_string = "schools";
          durm.pageparam = "schools";
        }

        durm.addressidparam = urlParam('addr')
        if (durm.addressidparam) { 
          durm.addressid_string = durm.addressidparam;
        } else {
          durm.addressid_string = "-1";
          durm.addressidparam = "-1";
        }
        
        reactiveUtils.when(
          () => durm.mapView.stationary === true,
          () => {
            history.pushState(null, null, "?" + "page=" + durm.app_state_string + "&addr=" + durm.addressid_string);
            durm.yresult = durm.mapView.center.longitude
            durm.xresult = durm.mapView.center.latitude
            durm.zresult = durm.mapView.scale
          }
         );

				document.getElementById("propertybutton").addEventListener("click", () => {	
					this.set_app_state("property")
				});	
				document.getElementById("schoolsbutton").addEventListener("click", () => {	
					this.set_app_state("schools")
        });	
        
        } catch (e) { console.log(e); }	

    },
		set_app_state: function(state){	
			durm.app_state_string = state;
      history.pushState(null, null, "?" + "page=" + durm.app_state_string);
      mainscope.load_results_based_on_current_appstate();
    },
    push_new_url: function(){
      history.pushState(null, null, "?" + "page=" + durm.app_state_string);
    },  
    load_results_based_on_current_appstate: function() {      
      try {
        if(durm.current_location_feature) {
          if (durm.app_state_string === "property") {
            document.getElementById("results").innerHTML = ""           
            durm_property.populate_with_propertyinfo(durm.current_top_parcel,durm.current_location_geometry,durm.current_location_name)
          }
          else if (durm.app_state_string === "schools") {
            document.getElementById("results").innerHTML = ""           
            durm_schools.render_school_results()
          }
        }
      } catch (e) { 
        console.log(e);
      }
    },
    build_table_header: function(inputtable,header) {
      try {
        let tr = document.createElement('tr')
        let td = document.createElement('td')
        td.innerHTML = header
        td.className = "header_td"
        tr.appendChild(td)
        inputtable.appendChild(tr);
      } catch (e) { 
        console.log(e);
      }
    },
    write_tr: function(title,results) {
      try {
        let tr = document.createElement('tr')
        let td1 = document.createElement('td')
        td1.innerHTML = title
        let td2 = document.createElement('td')
        td2.innerHTML = results
        tr.appendChild(td1)
        tr.appendChild(td2)
        return tr;       
      } catch (e) { 
        console.log(e);
      }
    },
    write_tr_single: function(title) {
      try {
        let tr = document.createElement('tr')
        let td1 = document.createElement('td')
        td1.innerHTML = title
        tr.appendChild(td1)
        return tr;       
      } catch (e) { 
        console.log(e);
      }
    },
    write_th: function(title) {
      try {
        let th = document.createElement('th')
        let td1 = document.createElement('td')
        td1.innerHTML = title
        th.appendChild(td1)
        return th;       
      } catch (e) { 
        console.log(e);
      }
    },
    build_empty_li: function(item_htmltext,titletxt) {
      try {
        let li = document.createElement('li');
        li.className="liitem";
        return li;
      } catch (e) { 
        console.log(e);
      }
    },
    whenLoaded: function() {
      try {
        durm.mapView.when(() => { 
          document.getElementsByTagName("input")[0].focus(); 
          durm.mapView.ui.remove([durm.legend,"attribution","zoom"]);
        });
      } catch (e) { 
        console.log(e);
      }
    },
    handle_layer_loading_failure: async function(l0){
      console.log("Layer Failed to Load")
      console.log(l0)
      let alert = document.createElement("div")
      alert.classList.add("layer_load_fail_alert")
      alert.innerHTML = "Error : Some data services were unavailable. Please try again later."
      let main00 = document.getElementById("searchbox")
      main00.after(alert)
    }
  };
});