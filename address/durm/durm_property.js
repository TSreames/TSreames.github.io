define([
  "esri/rest/query", "esri/rest/support/Query"
], function(query, Query,
  on
) {
return {
  init: function() {
    try {  

    } catch (e) {
      console.log(e);
    }	
  },
  populate_with_propertyinfo: function(topfeature,located_point_geom,located_point_name) {
    try {
      piscope = this;
      let result_address_node = document.createElement("span")
      result_address_node.innerHTML = "Showing results for: " + durm.result.name
      result_address_node.className = "addr_res_conf"
      document.getElementById("results").appendChild(result_address_node)

      let ul = document.createElement('ul');
      ul.className="ulwideflex";
      document.getElementById("results").appendChild(ul);

      let img_li = mainscope.build_empty_li();
      let img1 = document.createElement('img')
      img1.src = "https://image-cdn.spatialest.com/image/durham-images/lrg/" + topfeature.attributes.REID + ".JPG"
      img1.alt = "Photo of Parcel"
      img1.className = "propertyphoto"
      img_li.appendChild(img1)
      ul.appendChild(img_li);

      let tbl_li = document.createElement('li')
      let t = document.createElement('table');
      tbl_li.appendChild(t)
      ul.appendChild(tbl_li);

      t.appendChild(mainscope.write_th("Location"))

      console.log(located_point_geom)

      t.appendChild(mainscope.write_tr("Address",located_point_name));

      piscope.getZIP(located_point_geom).then(function(result){ 
        t.appendChild(mainscope.write_tr("ZIP Code", result))
      })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_th("Ownership"))
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Owner",topfeature.attributes.OWNER_NAME));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("",topfeature.attributes.OWNER_ADDR));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("",topfeature.attributes.OWCITY + ", " + topfeature.attributes.OWSTA + " " + topfeature.attributes.OWZIPA));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_th("Community"))
      // });

      // piscope.getCity(located_point_geom).then(function(result){ 
      //   t.appendChild(mainscope.write_tr("In City of Durham?", result))
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Subdivision",topfeature.attributes.SUBD_DESC));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_th("Legal Information"))
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Parcel ID",topfeature.attributes.REID));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("PIN",topfeature.attributes.PIN));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Size",topfeature.attributes.SUM_ACRE));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Deed Book",topfeature.attributes.DEED_BOOK.replace(/^0+/, '')));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Deed Page",topfeature.attributes.DEED_PAGE.replace(/^0+/, '')));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Plat Book",topfeature.attributes.PLAT_BOOK.replace(/^0+/, '')));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Plat Page  ",topfeature.attributes.PLAT_PAGE.replace(/^0+/, '')));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_th("Appraisal"))
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Total Value","$"+topfeature.attributes.TOTAL_VALU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Land Value","$"+topfeature.attributes.LAND_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_tr("Building Value","$"+topfeature.attributes.BLDG_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")));
      // })
      // .then(function(result){ 
      //   t.appendChild(mainscope.write_th(""))
      // })
      .then(function(result){ 

        // let buttons_li = mainscope.build_empty_li();
        // buttons_li.className="liitem";
        // let county_button = document.createElement('button');
        // county_button.className = "mdc-button mdc-button--outlined mdc-button--raised"
        // county_button.innerHTML = "Durham County Tax Record"
        // on(county_button, "click", function(evt) { 
        //   let newWindow = window.open("", "_blank");
        //   newWindow.location = "https://property.spatialest.com/nc/durham/#/property/" + topfeature.attributes.REID 
        // });
        // buttons_li.appendChild(county_button)
        // ul.appendChild(buttons_li);

        // let gmaps_button = document.createElement('button');
        // gmaps_button.className = "mdc-button mdc-button--outlined mdc-button--raised"
        // gmaps_button.innerHTML = "Google Maps"
        // on(gmaps_button, "click", function(evt) { 
        //   let newWindow = window.open("", "_blank");
        //   newWindow.location = "https://www.google.com/maps/@"+(topfeature.geometry.centroid.latitude-0.0006721930485)+","+(topfeature.geometry.centroid.longitude-0.0000196467158)+",68a,35y,49.52t/data=!3m1!1e3" });
        // buttons_li.appendChild(gmaps_button)
        // ul.appendChild(buttons_li);
      })

    } catch (e) { 
      console.log(e);
    }
  },
  getCity: function(geometry) {
    try {      
      let cquery = new Query({
        geometry: geometry,
        outSpatialReference: { wkid:102100 },
        outFields: ["*"],
        returnGeometry: false,
        spatialRelationship: "intersects"
      });
      return query.executeQueryJSON(CITY_BOUNDARY,cquery).then(function(result) {  
        let c = "" 
        if(result.features[0]){ c = "Yes" }
        else{ c = "No" }
        return c; 
      });
    } catch (e) {
      console.log(e);
    }	
  },
  getZIP: function(geometry) {
    try {      
      let cquery = new Query({
        geometry: geometry,
        outSpatialReference: { wkid:102100 },
        outFields: ["*"],
        returnGeometry: false,
        spatialRelationship: "intersects"
      });
      return query.executeQueryJSON(ZIPCODE_SUB,cquery).then(function(result) { 
        if(result.features[0].attributes.ZIPCODE){ return result.features[0].attributes.ZIPCODE }
        else { return "Error" }        
      });
    } catch (e) {
      console.log(e);
    }	
  }
};
});