/*
Matt Reames, 2019
This module handles the  'address tool' which is a sort of buffer-by-feet, then get parcel data within that buffer,  functionality.

It could be a lot better, i.e.
it shouldn't select multiple parcels in the same spot
it should instead deselect the parcel chosen
*/
define([
    "esri/geometry/geometryEngine","esri/Graphic","esri/layers/GraphicsLayer",
    'dgrid/Grid'
  ], function(
  geometryEngine, Graphic, GraphicsLayer,
  Grid
  ) {
  return {
        /*
        This will have two ways to work
        
        #1 --   User is in parcel and clicks "Mailing List"
                This will open up a panel

        #2 --   User is in rightclick menu and clicks "Mailing List"
                This will open up a panel
                AND this will turn the cursor into a selector
        */

        /*        
        Note / To Do :    The old one allowed you to select multiple parcels, then 'Find' (Buffer/select)  on those parcels.

        Output should give you two buttons :  Export Parcel Info,  and Export Owner Info


        */
        init: function(){
          try {
            atthis = this;
            user_features = [];
            durm.mailingtool_list_of_events = []

            document.getElementById("export_parcels_tocsvbutton").style.cursor = "pointer";
            document.getElementById("export_owners_tocsvbutton").style.cursor = "pointer";
            document.getElementById("export_resident_tocsvbutton").style.cursor = "pointer";

            document.getElementById('export_owners_tocsvbutton').addEventListener("click", function(){
              atthis.exportOwnerTableToCSV('selected_owner_addresses.csv')
            });
          
            document.getElementById('export_parcels_tocsvbutton').addEventListener("click", function(){
              atthis.exportParcelTableToCSV('selected_parcels.csv')
            });

            document.getElementById('export_resident_tocsvbutton').addEventListener("click", function(){
              atthis.exportResidentTableToCSV('selected_residentaddresses.csv')
            });

            durm.mapView.popup.on("trigger-action", function(event) {
              if (event.action.id === "open-buffer-tool") {
                atthis.open_addresstool_mode();
              }
            });

            durm.parcel_buffer_button.addEventListener("click", function(){
              atthis.open_addresstool_mode();
            });

            document.getElementById('parcelbufferpanelclosebutton').addEventListener("click", function(){
              atthis.close_panel();
            });

            document.getElementById('results-close').addEventListener('click', (event) => {
              atthis.close_tool_results();
            });    
            
            document.getElementById('parcelselectbutton').addEventListener('click', (event) => {
              atthis.select_parcels_button();
            });

            document.getElementById('parcelclearbutton').addEventListener('click', (event) => {
              atthis.clear_addresstool_button();
            });

            document.getElementById('parcelresultsbutton').addEventListener('click', (event) => {
              atthis.generate_list_button();
            });

          } catch (e) { console.log(e); }
        },

        close_panel: function(){
          try {
            document.getElementById("tool_results_table").style.zIndex = 0;
            document.getElementById("tool_results_table").style.visibility = "hidden";
            atthis.close_addresstool_mode();            
          } catch (e) { console.log(e); }
        },

        close_tool_results: function(){
          try {
            document.getElementById("tool_results_table").style.zIndex = 0;
            document.getElementById("tool_results_table").style.visibility = "hidden";	        
          } catch (e) { console.log(e); }
        },

        //Start/end widget
        open_addresstool_mode: function(){
          try {
            document.getElementById('parceltool_form_panel').style.visibility = "visible";
            document.getElementById('parceltool_form_panel').style.display = "inline-block";
            buffer_result_graphicslayer = new GraphicsLayer({id:'at_br'});
            durm.map.add(buffer_result_graphicslayer);
            user_selected_graphics = new GraphicsLayer({id:'at_user'});
            durm.map.add(user_selected_graphics);
          } catch (e) { console.log(e); }
        },
        close_addresstool_mode: function(){
          try {
            document.getElementById("mapViewDiv").style.cursor = "default";
            for (var idk_item of durm.mailingtool_list_of_events) {
              idk_item.remove()
            }
            durm.mailingtool_list_of_events = []

            try {
              user_selected_graphics.removeAll(); 
            } catch (e) { console.log(e); }

            try {
              durm.map.remove(user_selected_graphics);
            } catch (e) { console.log(e); }

            try {
              buffer_result_graphicslayer.removeAll();
            } catch (e) { console.log(e); }

            try {
              durm.map.remove(buffer_result_graphicslayer);
            } catch (e) { console.log(e); }

            //This is sort of overkill, i think ideally we would not need to run this because it removes ALL graphics from the mapview
            // And that could cause issues or bugs with the interaction between address lists and other graphics (Drawtools)
            durm.mapView.map.layers.items.forEach(element => {
              if(element.type=="graphics") {
                try{
                element.removeAll();
                } catch (e) { console.log(e); }
              }
            })

            document.getElementById('parceltool_form_panel').style.visibility = "hidden";
            document.getElementById('parceltool_form_panel').style.display = "none";
            user_features = [];
            try {
              grid1.refresh();
              grid1.renderArray("");
            } catch (e) { console.log(e); }
          } catch (e) { console.log(e); }
        },

        //Buttons
        clear_addresstool_button: function(){
          try {
            document.getElementById("parcelnotification_recordcount").innerHTML = "";
            document.getElementById("ownergrid").innerHTML = "";

            document.getElementById("addressnotification_recordcount").innerHTML = "";
            document.getElementById("residentgrid").innerHTML = "";

            for (var idk_item of durm.mailingtool_list_of_events) {
              idk_item.remove()
            }
            durm.mailingtool_list_of_events = []
            
            try {
              buffer_result_graphicslayer.removeAll();
            } catch (e) { console.log(e); }

            try {
              user_selected_graphics.removeAll();
            } catch (e) { console.log(e); }

            durm.mapView.map.layers.items.forEach(element => {
              if(element.type=="graphics") {
                try{
                element.removeAll();
                } catch (e) { console.log(e); }
              }
            })

            user_features = [];

            try {
              grid1.refresh();
              grid1.renderArray("");
            } catch (e) { console.log(e); }

          } catch (e) { console.log(e); }
        },
        select_parcels_button: function(){
          try {
            document.getElementById("mapViewDiv").style.cursor = "crosshair";
            document.getElementById("parceltool_form_panel").style.cursor = "default";
            let address_clickhandler = durm.mapView.on("click", function (event) {
              if(event.button === 2) {}
              else {
                durm.specialhittest = durm.mapView.hitTest(event).then(function (response) {
                  let parcel_in_question = response.results.filter(function(result) {
                    return result.graphic.layer === durm.parcelboundaryLayer;
                  })[0].graphic;          
                  let bufferGraphic = new Graphic({
                    geometry: parcel_in_question.geometry,
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
                  user_features.push(parcel_in_question);
                  user_selected_graphics.add(bufferGraphic);
                  event.stopPropagation();
                });
              }
              event.stopPropagation();
            });
            durm.mailingtool_list_of_events.push(address_clickhandler)
          } catch (e) { console.log(e); }
        },
        deselect_parcels_button: function(){
          try {
            document.getElementById("mapViewDiv").style.cursor = "crosshair";
            document.getElementById("parceltool_form_panel").style.cursor = "default";
            let deselect_clickhandler = durm.mapView.on("click", function (event) {
              if(event.button === 2) {}
              else {
                durm.mapView.hitTest(event).then(function (response) {
                  let graphic_in_question = response.results.filter(function(result) {
                    if(result.graphic.layer.id === 'at_user'){
                      return result
                    }                    
                  })[0].graphic;
                  user_selected_graphics.remove(graphic_in_question);
                  for (var i = 0; i < user_features.length; i++) {
                    if (user_features[i].geometry.rings === graphic_in_question.geometry.rings) {
                      user_features.splice(i--, 1);
                    }
                  }
                  event.stopPropagation();
                });
              }
              event.stopPropagation();
            });
            durm.mailingtool_list_of_events.push(deselect_clickhandler)
          } catch (e) { console.log(e); }
        },
        make_loading: function(){
          return "<img class='centered-spinner' src='./img/loading_spinner.gif'></img>"
        },
        generate_list_button: function(){
          try {
            //Note : When this runs ...
            //  For user-selected parcels, we should RETAIN the user-selected GRAPHICS and the LIST OF PARCELS.
            //  For the buffered results, We should DELETE AND RE-GENERATE the GRAPHICS and the LIST OF PARCELS
            document.getElementById("ownergrid").innerHTML = this.make_loading()            
            if(typeof grid1 === 'undefined') {}
            else { 
              grid1.refresh();
              grid1.renderArray("");
            }
            atthis.bufferaction(document.getElementById("bufferfeetinput").value).then(function(response){
              parcelresponse = response[0] ?? []
              addressresponse = response[1] ?? []
              full_parcel_table = parcelresponse;
              document.getElementById("ownergrid").innerHTML = ""
              grid1 = new Grid({
                  columns: {
                    LOCATION_ADDR: 'Site Address',
                    REID: 'REID',
                    PIN: 'PIN',
                    PROPERTY_OWNER: 'Property Owner',
                    OWNER_MAIL_1: 'Owner Address Line 1',
                    OWNER_MAIL_2: 'Owner Address Line 2',
                    OWNER_MAIL_3: 'Owner Address Line 3',
                    OWNER_MAIL_CITY: 'Owner City',
                    OWNER_MAIL_STATE: 'Owner State',
                    OWNER_MAIL_ZIP: 'Owner Zip'
                  }
              }, 'ownergrid');              
              grid1.refresh();
              grid1.renderArray(parcelresponse);
              document.getElementById("owner-results-header").innerHTML = "Parcel Site Addresses";
              let pnum = parcelresponse.length ?? "0"
              document.getElementById("parcelnotification_recordcount").innerHTML = pnum + " records returned.";


              try {
                //Note : When this runs ...
                //  For user-selected parcels, we should RETAIN the user-selected GRAPHICS and the LIST OF PARCELS.
                //  For the buffered results, We should DELETE AND RE-GENERATE the GRAPHICS and the LIST OF PARCELS
                if(typeof grid2 === 'undefined') {}
                else { 
                  grid2.refresh();
                  grid2.renderArray("");
                  document.getElementById("residentgrid").innerHTML = ""
                }
                full_address_table = addressresponse;
                grid2 = new Grid({
                    columns: {
                        SITE_ADDRE: 'Resident Address',
                        CITY2: 'Resident City',
                        ZIPCODE: 'Resident Zip'
                    }
                }, 'residentgrid');
                grid2.refresh();
                grid2.renderArray(addressresponse);
                document.getElementById("resident-results-header").innerHTML = "Address Points";
                let anum = addressresponse.length ?? "0"
                document.getElementById("addressnotification_recordcount").innerHTML = anum + " records returned.";
              } catch (e) { console.log(e); }


            });
          } catch (e) { console.log(e); }

          document.getElementById("tool_results_table").style.zIndex = 51;
          document.getElementById("tool_results_table").style.visibility = "visible";
          document.getElementById("defaultOpen").click();
        },
        bufferaction: function(feetft) {
          try{
            let user_polys = []
            for (var i=0; i < user_features.length; i++) {
              user_polys.push(user_features[i].geometry)
            }
            let union = geometryEngine.union(user_polys);
            let geom = union;
            let buffer = geometryEngine.geodesicBuffer(geom, feetft, "feet");
            let query = durm.parcelboundaryLayer.createQuery();
            query.geometry = buffer;
            query.spatialRelationship = "intersects";
            query.returnGeometry = true;
            query.outSpatialReference = { wkid: 102100 };
            query.outFields = [ "*" ];
            return durm.parcelboundaryLayer.queryFeatures(query)
            .then(function(response) {
                buffer_result_parcel_geometry = [];// clear ,  in case this was run once before    
                buffer_result_parcel_attributes = []; // clear ,  in case this was run once before            
                buffer_result_graphicslayer.removeAll();
                let resultFeatures = response.features;
                for (var i=0; i < resultFeatures.length; i++) {
                    let bufferGraphic = new Graphic({
                        geometry: resultFeatures[i].geometry,
                        symbol: {
                          type: "simple-fill", // autocasts as new SimpleFillSymbol()
                          color: [76, 230, 0, 0.12],
                          outline: {
                            width: 1.5,
                            color: "dodgerblue"
                          },                                  
                          style: "solid"
                        }
                      });
                      buffer_result_parcel_attributes.push(resultFeatures[i].attributes);
                      buffer_result_parcel_geometry.push(resultFeatures[i].geometry)
                      buffer_result_graphicslayer.add(bufferGraphic);
                }
                return buffer_result_parcel_attributes;
            }).then(function(buffer_result_parcel_attributes){                 
              let union0 = geometryEngine.union(buffer_result_parcel_geometry);

              let aq = durm.active_address_points.createQuery();
              aq.geometry = union0;
              aq.spatialRelationship = "intersects";
              aq.outSpatialReference = { wkid: 102100 };
              aq.outFields = [ "*" ];
              return durm.active_address_points.queryFeatures(aq)
            }).then(function(addr){
              buffer_result_point_attributes = []
              let resultFeatures = addr.features;
              for (var i=0; i < resultFeatures.length; i++) {
                buffer_result_point_attributes.push(resultFeatures[i].attributes);
              }
              return[buffer_result_parcel_attributes,buffer_result_point_attributes]
            });
          } catch (e) { console.log(e); }
        },

        //Note: 3 export csv functions is probably superfluous
        exportParcelTableToCSV: function(filename) {
          try{
            var csv = [];
            //write header first.
            for(var i = 0; i < 1; i++){
              let row = []
              for (let [key, value] of Object.entries(full_parcel_table[i])) {
                row.push(key)
              }
              csv.push(row.join(","));
            }

            //write full
            for(var i = 0; i < full_parcel_table.length; i++){
              let row = []
              for (let [key, value] of Object.entries(full_parcel_table[i])) {
                row.push('"'+value+'"')
              }
              csv.push(row.join(","));
            }
            this.downloadCSV(csv.join("\n"), filename);
          } catch (e) { console.log(e); }
        }, 
        exportOwnerTableToCSV: function(filename) {
          try{
            var csv = [];
            var tbl = document.getElementById("ownergrid");
            var rows = tbl.querySelectorAll("table tr");      
            for(var i = 0; i < rows.length; i++){
                var row = [], cols = rows[i].querySelectorAll("td, th");
                for(var j = 0; j < cols.length; j++){
                    row.push('"'+cols[j].innerText+'"');
                }
                csv.push(row.join(","));
            }
            this.downloadCSV(csv.join("\n"), filename);
          } catch (e) { console.log(e); }
        },      
        exportResidentTableToCSV: function(filename) {
          try{
            let csv = []
            let tbl = document.getElementById("residentgrid");
            var rows = tbl.querySelectorAll("table tr");      
            for(var i = 0; i < rows.length; i++){
                var row = [], cols = rows[i].querySelectorAll("td, th");
                for(var j = 0; j < cols.length; j++){
                    row.push(cols[j].innerText);
                }
                csv.push(row.join(","));
            }
            this.downloadCSV(csv.join("\n"), filename);
          } catch (e) { console.log(e); }
        },
        downloadCSV: function(csv, filename) {
          try {
            var csvFile;
            var downloadLink;      
            if (window.Blob == undefined || window.URL == undefined || window.URL.createObjectURL == undefined) {
              alert("Error : Browser doesn't support Blob().  Updating your browser should fix this.");
              return;
            }        
            csvFile = new Blob([csv], {type:"text/csv"});
            downloadLink = document.createElement("a");
            downloadLink.download = filename;
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
          } catch (e) { console.log(e); }
        }
    }
  }
);