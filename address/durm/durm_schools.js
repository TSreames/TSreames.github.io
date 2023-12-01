define([
  "esri/layers/FeatureLayer",
  "dojo/domReady!"
], function(FeatureLayer
) {
return {
  init: function(now,nextyear) {
    ss = this
    try {
      elementary_now = "elemschools" + now
      elementary_next = "elemschools" + nextyear
      middle_now = "middleschools" + now
      middle_next = "middleschools" + nextyear
      high_now = "highschools" + now
      high_next = "highschools" + nextyear

      // naming convention:
      // each year has schools (points) and schoolzones (polygons) which need to be joined together.  Years after 2024-2025 also have an additional 'region' (polygon).
      // there are placeholders for "this year" and "next year" and "special year".  URLs for this and next years should stay the same.
      
      durm.allschoolzones = new FeatureLayer({
        id: "allschoolzones",
        title: "School Zones, Current Year",
        visible: false,
        url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/13"
      });
      durm.map.add(durm.allschoolzones);
      durm.allschoolzones.when(function(){})
			.catch(function(error){
				mainscope.handle_layer_loading_failure(error);
			});

      durm.allschools = new FeatureLayer({
        id: "allschools",
        title: "Schools, Current Year",
        visible: false,
        definitionExpression: "agency = 'Durham Public Schools'",
        url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/12"
      });
      durm.map.add(durm.allschools);
      durm.allschools.when(function(){})
			.catch(function(error){
				mainscope.handle_layer_loading_failure(error);
			});

      durm.allschoolzones_next = new FeatureLayer({
        id: "allschoolzones_next",
        title: "School Zones, Next Year",
        visible: false,
        url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/15"
      });
      durm.map.add(durm.allschoolzones_next);
      durm.allschoolzones_next.when(function(){})
			.catch(function(error){
				mainscope.handle_layer_loading_failure(error);
			});

      durm.allschools_next = new FeatureLayer({
        id: "allschools_next",
        title: "Schools, Next Year",
        visible: false,
        definitionExpression: "agency = 'Durham Public Schools'",
        url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/14"
      });
      durm.map.add(durm.allschools_next);
      durm.allschools_next.when(function(){})
			.catch(function(error){
				mainscope.handle_layer_loading_failure(error);
			});
      durm.allschoolregions_next = new FeatureLayer({
        id: "allschoolregions_next",
        title: "Regions, Next Year",
        visible: false,
        //definitionExpression: "agency = 'Durham Public Schools'",
        url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/16"
      });
      durm.map.add(durm.allschoolregions_next);
      durm.allschoolregions_next.when(function(){})
			.catch(function(error){
				mainscope.handle_layer_loading_failure(error);
			});


      // durm.allschoolzones_special = new FeatureLayer({
      //   id: "allschoolzones_special",
      //   title: "School Zones, Special Year",
      //   visible: false,
      //   url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/15"
      // });
      // durm.map.add(durm.allschoolzones_special);
      // durm.allschoolzones_special.when(function(){})
			// .catch(function(error){
			// 	mainscope.handle_layer_loading_failure(error);
			// });

      // durm.allschools_special = new FeatureLayer({
      //   id: "allschools_special",
      //   title: "Schools, Special Year",
      //   visible: false,
      //   definitionExpression: "agency = 'Durham Public Schools'",
      //   url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/14"
      // });
      // durm.map.add(durm.allschools_special);
      // durm.allschools_special.when(function(){})
			// .catch(function(error){
			// 	mainscope.handle_layer_loading_failure(error);
			// });

      // durm.allschoolregions_special = new FeatureLayer({
      //   id: "allschoolregions_special",
      //   title: "Regions, Special Year",
      //   visible: false,
      //   //definitionExpression: "agency = 'Durham Public Schools'",
      //   url: "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/16"
      // });
      // durm.map.add(durm.allschoolregions_special);
      // durm.allschoolregions_special.when(function(){})
			// .catch(function(error){
			// 	mainscope.handle_layer_loading_failure(error);
			// });

      /* School Filtering --  not all schools should be drawn */
      /* So we remove specific school names */
      durm.all_schools = []
      durm.allschools.queryFeatures().then(function(allschoolsresult) {
        try {
          let as1 = allschoolsresult.features.filter(obj => { return obj.attributes.name != "Hillside New Tech High School"})  
          //we filter out Hillside New Tech High as a workaround because it uses the same Address Point as Hillside High and that causes it to show up in places where it shouldn't.
          as1.forEach(function(s){
            durm.all_schools.push(s);
          });
        } catch (e) { console.log(e) }
      });

      durm.all_schools_next = []
      durm.allschools_next.queryFeatures().then(function(allschoolsresult_next) {
        try {
          let as1 = allschoolsresult_next.features.filter(obj => { return obj.attributes.name != "Hillside New Tech High School"})  
          //we filter out Hillside New Tech High as a workaround because it uses the same Address Point as Hillside High and that causes it to show up in places where it shouldn't.
          as1.forEach(function(s){
            durm.all_schools_next.push(s);
          });
        } catch (e) { console.log(e) }
      });

      // durm.all_schools_special = []
      // durm.allschools_special.queryFeatures().then(function(allschoolsresult_special) {
      //   try {
      //     let as1 = allschoolsresult_special.features.filter(obj => { return obj.attributes.name != "Hillside New Tech High School"})  
      //     //we filter out Hillside New Tech High as a workaround because it uses the same Address Point as Hillside High and that causes it to show up in places where it shouldn't.
      //     as1.forEach(function(s){
      //       durm.all_schools_special.push(s);
      //     });
      //   } catch (e) { console.log(e) }
      // });

      // durm.all_regions_special = []
      // durm.allschoolregions_special.queryFeatures().then(function(region) {
      //   try {
      //     let as1 = region.features.filter(obj => { return obj.attributes.name != "Hillside New Tech High School"})  
      //     //we filter out Hillside New Tech High as a workaround because it uses the same Address Point as Hillside High and that causes it to show up in places where it shouldn't.
      //     as1.forEach(function(s){
      //       durm.all_regions_special.push(s);
      //     });
      //   } catch (e) { console.log(e) }
      // });

    } catch (e) {
      console.log(e);
    }	
  },
  /* This is for building the overall frame -- the button, the parent CSS/HTML, the toggle event */
  /* We build two different sets of results : this year and next year. */
  render_school_results: function() {
    durm.next_list = []
    durm.now_list = []
    //durm.special_list = []
    let result_address_node = document.createElement("span")
    result_address_node.innerHTML = "Showing results for: " + durm.result.name
    result_address_node.className = "addr_res_conf"
    document.getElementById("results").appendChild(result_address_node)

    let dpslogo = document.createElement("img")
    dpslogo.src = "./img/dpslogo.png"
    dpslogo.className = "dpslogo"
    document.getElementById("results").appendChild(dpslogo)

    /* School Year Toggle Button */
    let yeartoggle = document.createElement("ul")
    yeartoggle.classList.add("yeartoggleul")
    let linow = document.createElement("li")
    let linext = document.createElement("li")
    //let lispecial = document.createElement("li")
    linow.classList.add("yeartoggleli")
    linext.classList.add("yeartoggleli")
    //lispecial.classList.add("yeartoggleli")
    yeartoggle.appendChild(linow)
    yeartoggle.appendChild(linext)
    //yeartoggle.appendChild(lispecial)
    let bnow = document.createElement("button")
    let bnext = document.createElement("button") 
    //let bspecial = document.createElement("button")
    bnow.classList.add("esri-button","yeartogglebutton")
    bnext.classList.add("esri-button","yeartogglebutton")
    //bspecial.classList.add("esri-button","yeartogglebutton")
    bnow.innerHTML = nowstring
    bnext.innerHTML = nextstring
    //bspecial.innerHTML = specialstring
    bnext.addEventListener("click", () => {	ss.show_year("next") });	
    bnow.addEventListener("click", () => { ss.show_year("now") });
    //bspecial.addEventListener("click", ()=> { ss.show_year("special")});

    linow.appendChild(bnow)
    linext.appendChild(bnext)
    //lispecial.appendChild(bspecial)
    document.getElementById("results").appendChild(yeartoggle)

    durm.mapView.when(() => {
      this.populate_with_schools()
    });

  },
  /* This was the original single-function that has been split apart.  It now manages the N number of years that need to show */
  populate_with_schools: function() {
    thisschool = this;

    let nowdiv = document.createElement("div")
    nowdiv.classList.add("result_container")
    nowdiv.id = "now_result"
    document.getElementById("results").appendChild(nowdiv)

    let nextdiv = document.createElement("div")
    nextdiv.id = "next_result"
    nextdiv.style.visibility = "hidden"; //hide until buttonclick
    nextdiv.style.display = "none"; //hide until buttonclick
    nextdiv.classList.add("result_container")    
    document.getElementById("results").appendChild(nextdiv)

    let specialdiv = document.createElement("div")
    specialdiv.id = "special_result"
    specialdiv.style.visibility = "hidden"; //hide until buttonclick
    specialdiv.style.display = "none"; //hide until buttonclick
    specialdiv.classList.add("result_container")    
    document.getElementById("results").appendChild(specialdiv)

    let ASZ = durm.allschoolzones.createQuery();
    ASZ.geometry = durm.current_location_geometry;
    ASZ.spatialRelationship = "intersects";

    let ASZ2 = durm.allschoolzones_next.createQuery();
    ASZ2.geometry = durm.current_location_geometry;
    ASZ2.spatialRelationship = "intersects";

    // let ASZ3 = durm.allschoolzones_special.createQuery();
    // ASZ3.geometry = durm.current_location_geometry;
    // ASZ3.spatialRelationship = "intersects";

    durm.allschoolzones.queryFeatures(ASZ)
    .then(function(zoneresult) {
      thisschool.generate_individual_school_result_for2024(zoneresult,nowdiv,"now",nowprefix)
      return durm.allschoolzones_next.queryFeatures(ASZ2)
    })
    .then(function(zoneresult_next) {
      thisschool.generate_individual_school_result_FOR2025(zoneresult_next,nextdiv,"next",nextprefix)
      return //durm.allschoolzones_special.queryFeatures(ASZ3)
    })
    //.then(function(zoneresult_special) {
      //thisschool.generate_individual_school_result_FOR2025(zoneresult_special,specialdiv,"special",specialprefix)
      //return
    //})
    .then(function() {
       ss.generate_html_for_new_schools();
       return
    });
  },
  
  generate_individual_school_result_for2024: function(zr,yr,flag,yearprefix) {
    try {
      /* wrap results in a div that we can reset */
      let unique_list_of_zones = [];
      let zones = zr.features;
      if(zones) {
        let elementary_walk_zone = "n"
        let elementary_traditional_option_zone = "n"
        let elementary_magnet_priority_zone = "n"
        let elementary_magnet_choice_zone = "n"
        let secondary_school_covers_middle_and_high = "n"
        for(var i = 0; i < zones.length; i++) {           
          if(zones[i].attributes.disttype === "Elementary Magnet Walk Zone"){elementary_walk_zone="y"}
          if(zones[i].attributes.disttype === "Elementary Magnet Priority Zone"){elementary_magnet_priority_zone="y"}
          if(zones[i].attributes.disttype === "Elementary Magnet Choice Zone"){elementary_magnet_choice_zone="y"}               
        }

        /* Create HTML top-level items */
        let base_assignment_header = thisschool.writeH4("Base Assignments " + yearprefix)
        yr.appendChild(base_assignment_header)
        let guaranteed_base_ul = document.createElement("ul")
        guaranteed_base_ul.classList.add("school_type_ul")
        yr.appendChild(guaranteed_base_ul)

        //walk zones
        if(elementary_walk_zone === "y") {
          let ewz_header = thisschool.writeH4("Walk Zone Options " + yearprefix)
          yr.appendChild(ewz_header)
          guaranteed_options_ul = document.createElement("ul")
          guaranteed_options_ul.classList.add("school_type_ul")
          yr.appendChild(guaranteed_options_ul)
        }

        //priority options zones
        if(elementary_magnet_priority_zone === "y") {
          let empz_header = thisschool.writeH4("Priority Zone Options " + yearprefix)
          yr.appendChild(empz_header)
          priority_options_ul = document.createElement("ul")
          priority_options_ul.classList.add("school_type_ul")
          yr.appendChild(priority_options_ul)
        }

        //choice options zones
        if(elementary_magnet_choice_zone === "y") {
          let emcz_header = thisschool.writeH4("Choice Zone Options " + yearprefix)
          yr.appendChild(emcz_header)
          choice_options_ul = document.createElement("ul")
          choice_options_ul.classList.add("school_type_ul")
          yr.appendChild(choice_options_ul)
        }

        // calendar options
        let calendar_option_header = thisschool.writeH4("Calendar Options " + yearprefix)
        yr.appendChild(calendar_option_header)

        // Calendar option message about lottery schools 
        let specialtext2023_24 = "Please Note: The lottery submission window for DPS application-based programs runs from early January to early February each year. For more information about application program options please visit <a class='dpsredlink' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a>."
        let specialmessage23_24 = document.createElement('p')
        specialmessage23_24.classList = "h4specialmsg"
        specialmessage23_24.innerHTML = specialtext2023_24
        yr.appendChild(specialmessage23_24)

        let calendar_option_ul = document.createElement("ul")
        calendar_option_ul.classList.add("school_type_ul")
        yr.appendChild(calendar_option_ul)




        /* Populate top-level items */
        let elementarybase_li = document.createElement("li")
        elementarybase_li.classList.add("segment_li")
        let elementarybase_tbl = document.createElement('table')        
        elementarybase_li.appendChild(elementarybase_tbl);
        guaranteed_base_ul.appendChild(elementarybase_li)

        let middlebase_li = document.createElement("li")
        middlebase_li.classList.add("segment_li")
        let middlebase_tbl = document.createElement('table');
        middlebase_li.appendChild(middlebase_tbl)
        guaranteed_base_ul.appendChild(middlebase_li);

        let highbase_li = document.createElement("li")
        highbase_li.classList.add("segment_li")
        let highbase_tbl = document.createElement('table');
        highbase_li.appendChild(highbase_tbl)
        guaranteed_base_ul.appendChild(highbase_li);

        if(elementary_walk_zone === "y") {
          elementarywalkzone_li = document.createElement("li")
          elementarywalkzone_li.classList.add("segment_li")
          elementarywalkzone_tbl = document.createElement('table')
          elementarywalkzone_li.appendChild(elementarywalkzone_tbl)
          guaranteed_options_ul.appendChild(elementarywalkzone_li)
        }

        if(elementary_magnet_priority_zone === "y") {
          elementarypriority_li = document.createElement("li")
          elementarypriority_li.classList.add("segment_li")
          elementarypriority_tbl = document.createElement('table')
          elementarypriority_li.appendChild(elementarypriority_tbl)
          priority_options_ul.appendChild(elementarypriority_li)
        }

        if(elementary_magnet_choice_zone === "y") {
          elementarychoice_li = document.createElement("li")
          elementarychoice_li.classList.add("segment_li")
          elementarychoice_tbl = document.createElement('table')
          elementarychoice_li.appendChild(elementarychoice_tbl)
          choice_options_ul.appendChild(elementarychoice_li)
        }

        //Calendar Options
        let elementary_cal_li = document.createElement("li")
        elementary_cal_li.classList.add("segment_li")
        let elementary_cal_tbl = document.createElement('table')
        elementary_cal_li.appendChild(elementary_cal_tbl)
        calendar_option_ul.appendChild(elementary_cal_li)

        let middle_cal_li = document.createElement("li")
        middle_cal_li.classList.add("segment_li")
        let middle_cal_tbl = document.createElement('table')
        middle_cal_li.appendChild(middle_cal_tbl)
        calendar_option_ul.appendChild(middle_cal_li)

        let high_cal_li = document.createElement("li")
        high_cal_li.classList.add("segment_li")
        let high_cal_tbl = document.createElement('table')
        high_cal_li.appendChild(high_cal_tbl)
        calendar_option_ul.appendChild(high_cal_li)

        zones.forEach(function(z) {
          if (z.name == "Hillside New Tech High School") {}
          else {
            unique_list_of_zones.push({ShortName:z.attributes.ShortName, disttype:z.attributes.disttype, name:z.attributes.name, facilityid:z.attributes.facilityid, stateid:z.attributes.stateid})
          }
        });

        unique_list_of_zones.sort((a, b) => (a.disttype > b.disttype) ? 1 : -1)

        let school2use
        if(flag=="next") {
          school2use = durm.all_schools_next
        }
        else {
          school2use = durm.all_schools
        }

        /* This is where we join the polygon/school zone attributes to the point/school attributes,  and we're using the facilityid field to do that. */
        /* This is because we're dealing with a many-to-many relationship structure that doesn't jive well with Esri's toolset */
        /* The basic idea is that we construct an array called unique_list_of_zones as a sort of on-the-fly Javascript join, creating a "Master List" that we can rely on to be unique, flat-file of schools */

        unique_list_of_zones.forEach(function(s){
          var result = school2use.filter(obj => { return obj.attributes.facilityid === s.facilityid })
          if(result.length == 0) { 
            //The zone we're matching up doesn't have a school -- this would only happen if there was an error.
            console.log("Error : We found a zone that had no school.  Check the facilityid fields of the educational points and zones to ensure data integrity.")
            console.log(result)
            console.log(s)
          }
          else if (result.length == 1) {
            //This is when there's a 1:1 relationship between the school and zone.
            s.shortName = result[0].attributes.ShortName
            s.agencyurl = result[0].attributes.agencyurl
            s.agency = result[0].attributes.agency
            s.agencytype = result[0].attributes.agencytype
            s.caltype = result[0].attributes.caltype
            s.spectype = result[0].attributes.spectype
            s.factype = result[0].attributes.factype
            s.fulladdr = result[0].attributes.fulladdr
            s.grades = result[0].attributes.grades
            s.municipality = result[0].attributes.municipality
            s.schoolpoint_name = result[0].attributes.name
            s.numstudent = result[0].attributes.numstudent
            s.operdays = result[0].attributes.operdays
            s.operhours = result[0].attributes.operhours
            s.phone = result[0].attributes.phone
            s.pocemail = result[0].attributes.pocemail
            s.pocname = result[0].attributes.pocname
            s.pocphone = result[0].attributes.pocphone
            s.prektype = result[0].attributes.prektype
          }
          else {
            // these are edge cases, where schools have multiple zones, and vice-versa
            s.shortName = result[0].attributes.ShortName
            s.agencyurl = result[0].attributes.agencyurl
            s.agency = result[0].attributes.agency
            s.agencytype = result[0].attributes.agencytype
            s.caltype = result[0].attributes.caltype
            s.spectype = result[0].attributes.spectype
            s.factype = result[0].attributes.factype
            s.fulladdr = result[0].attributes.fulladdr
            s.grades = result[0].attributes.grades
            s.municipality = result[0].attributes.municipality
            s.schoolpoint_name = result[0].attributes.name
            s.numstudent = result[0].attributes.numstudent
            s.operdays = result[0].attributes.operdays
            s.operhours = result[0].attributes.operhours
            s.phone = result[0].attributes.phone
            s.pocemail = result[0].attributes.pocemail
            s.pocname = result[0].attributes.pocname
            s.pocphone = result[0].attributes.pocphone
            s.prektype = result[0].attributes.prektype

            // Important:  This loop starts on the SECOND feature [1], not the first, [0].
            // On these, we need to create a new record to insert into unique_list_of_zones
            for(var i = 1; i < result.length; i++) {
              unique_list_of_zones.push({ShortName:s.ShortName, 
                disttype:s.disttype, 
                name:s.name, 
                facilityid:s.facilityid, 
                stateid:s.stateid,
                shortName:result[i].attributes.ShortName,
                agencyurl:result[i].attributes.agencyurl,
                agency:result[i].attributes.agency,
                agencytype:result[i].attributes.agencytype,
                caltype:result[i].attributes.caltype,
                spectype:result[i].attributes.spectype,
                factype:result[i].attributes.factype,
                fulladdr:result[i].attributes.fulladdr,
                grades:result[i].attributes.grades,
                municipality:result[i].attributes.municipality,
                schoolpoint_name:result[i].attributes.name,
                numstudent:result[i].attributes.numstudent,
                operdays:result[i].attributes.operdays,
                operhours:result[i].attributes.operhours,
                phone:result[i].attributes.phone,
                pocemail:result[i].attributes.pocemail,
                pocname:result[i].attributes.pocname,
                pocphone:result[i].attributes.pocphone,
                prektype:result[i].attributes.prektype
                })
            }
          }
        });
        //Now that we've transformed the data into something that matches common sense for our purposes, we can start dealing with how we display the results.
        //This is where we start writing HTML directly
        try{

          let elementary_url = elementary_now
          let middle_url = middle_now
          let high_url = high_now
          if(flag=="next") {
            elementary_url = elementary_next
            middle_url = middle_next
            high_url = high_next
          }

          unique_list_of_zones.forEach(function(singleschool){
            //Base Assignments
            if (singleschool.disttype == 'Elementary School Base Assignment Zone') { 
              thisschool.write_school_html_202324(singleschool,elementarybase_tbl,elementary_url,"elementary",flag);
            }
            else if(singleschool.disttype == 'Middle School Base Assignment Zone') { 
              thisschool.write_school_html_202324(singleschool,middlebase_tbl,middle_url,"middle",flag);
            }
            else if(singleschool.disttype == 'High School Base Assignment Zone') {
              thisschool.write_school_html_202324(singleschool,highbase_tbl,high_url,"high",flag);
            }
          });  

          //Elementary Calendar Option
          unique_list_of_zones.forEach(function(singleschool){
            /* important bit of biz logic :  if we're in a traditional option zone there is no need to display  a year-round school zone.  */
            if(elementary_traditional_option_zone === "y") {
              if(singleschool.disttype == 'Elementary School Traditional Option Zone'){ thisschool.write_school_html_202324(singleschool,elementary_cal_tbl,elementary_url,"elementarytrad",flag)}
            }
            else {
              if(singleschool.disttype == 'Elementary School Attendance Zone' && singleschool.caltype == 'Year-Round') {thisschool.write_school_html_202324(singleschool,elementary_cal_tbl,elementary_url,"elementaryattd",flag)}
            }
          });

          //Middle School Calendar Option
          unique_list_of_zones.forEach(function(singleschool){
            if(singleschool.disttype == 'Middle School Attendance Zone' && singleschool.caltype == 'Year-Round') {
              thisschool.write_school_html_202324(singleschool,middle_cal_tbl,middle_url,"middleyrrd",flag);
            }
            else if(singleschool.disttype == 'Secondary School Attendance Zone' && singleschool.caltype == 'Year-Round')
              thisschool.write_school_html_202324(singleschool,middle_cal_tbl,middle_url,"secondaryatt",flag);
              secondary_school_covers_middle_and_high = "y"
          });

          //High School Calendar Option
          if(secondary_school_covers_middle_and_high == "y") {}
          else { 
            unique_list_of_zones.forEach(function(singleschool){
              if((singleschool.disttype == 'High School Attendance Zone' || singleschool.disttype == 'Secondary School Attendance Zone') && singleschool.caltype == 'Year-Round') {
                thisschool.write_school_html_202324(singleschool,high_cal_tbl,high_url,"highattdzn",flag);
              }
            });
          }
          
          //Special Elementary Zones
          unique_list_of_zones.forEach(function(singleschool){
              if(singleschool.disttype == 'Elementary Magnet Walk Zone') { 
                thisschool.write_school_html_202324(singleschool,elementarywalkzone_tbl,elementary_url,"elemwalk",flag);
              }
              else if(singleschool.disttype == 'Elementary Magnet Priority Zone') { 
                thisschool.write_school_html_202324(singleschool,elementarypriority_tbl,elementary_url,"elemprior",flag);
              }
              else if(singleschool.disttype == 'Elementary Magnet Choice Zone') { 
                thisschool.write_school_html_202324(singleschool,elementarychoice_tbl,elementary_url,"elemchoice",flag);
              }
          });  
        } catch (e) { console.log(e) }        
      }
      else { console.log("There were no school zones found.  The address could be outside of Durham County, or there could be a problem with the application.") }   
    } catch (e) {
      console.log(e);
    }
  },
  generate_individual_school_result_FOR2025: function(zr,yr,flag,yearprefix) {
    try {
      //let specialtext2 = "Please Note: Currently, only elementary school application programs and school boundaries have been finalized for 2024-2025 school year. For more information about the Growing Together Student Assignment Plan, please visit <a class='dpsredlink' href='https://www.dpsnc.net/domain/2546'>https://www.dpsnc.net/domain/2546</a>."
      //let specialtext = "Please Note: The lottery submission window for DPS application-based programs runs from early January to early February each year. For more information about application program options please visit <a class='dpsredlink' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a>."

      let specialtext2 = "For more information about DPS’s new Student Assignment Plan, please visit <a class='dpsredlink' target='_blank' href='https://welcome.dpsnc.net/'>https://welcome.dpsnc.net/</a> or contact the Office of Student Assignment at 919-560-2059. New elementary school boundaries will take effect for the 2024-25 school year, while the middle & high school plan will not take effect until the 2025-26 school year."
      let specialtext = "Please Note: The lottery submission window for DPS application-based programs runs from January 8 to February 9, 2024. The programs listed below do not include CTE and JROTC pathways for high school students (see more here: <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/Page/6641'>https://www.dpsnc.net/Page/6641</a>) and may not be exhaustive of all potential options. For more information about application program options please visit <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a> or contact the Office of Student Assignment at 919-560-2059."

      let specialmessage = document.createElement('p')
      specialmessage.classList = "h4specialmsg"
      specialmessage.innerHTML = specialtext

      let specialmessage2 = document.createElement('p')
      specialmessage2.classList = "h4specialmsg"
      specialmessage2.innerHTML = specialtext2

      /* wrap results in a div that we can reset */
      let unique_list_of_zones = [];
      let zones = zr.features;
      if(zones) {
        /* Create HTML top-level items */
        //base assignments
        let base_assignment_header = thisschool.writeH4(yearprefix + " Base Assignments")
        yr.appendChild(base_assignment_header)
        yr.appendChild(specialmessage2)
        let guaranteed_base_ul = document.createElement("ul")
        guaranteed_base_ul.classList.add("school_type_ul")
        yr.appendChild(guaranteed_base_ul)


        // application-based programs
        let appbasedprog_header = thisschool.writeH4(yearprefix+ " Application Options")  
        yr.appendChild(appbasedprog_header)
        yr.appendChild(specialmessage)
        let appbasedprog_ul = document.createElement("ul")
        appbasedprog_ul.classList.add("school_type_ul")
        yr.appendChild(appbasedprog_ul)

        /* Populate top-level items with LI's */
        let elementarybase_li = document.createElement("li")
        elementarybase_li.classList.add("segment_li")
        let elementarybase_tbl = document.createElement('table')
        elementarybase_li.appendChild(elementarybase_tbl);
        guaranteed_base_ul.appendChild(elementarybase_li)

        let middlebase_li = document.createElement("li")
        middlebase_li.classList.add("segment_li")
        let middlebase_tbl = document.createElement('table');
        middlebase_li.appendChild(middlebase_tbl)
        guaranteed_base_ul.appendChild(middlebase_li);

        let highbase_li = document.createElement("li")
        highbase_li.classList.add("segment_li")
        let highbase_tbl = document.createElement('table');
        highbase_li.appendChild(highbase_tbl)
        guaranteed_base_ul.appendChild(highbase_li);

        let appbasedprog_elem_li = document.createElement("li")
        appbasedprog_elem_li.classList.add("segment_li")
        appbasedprog_elem_label = document.createElement("button")
        appbasedprog_elem_label.id = "elem_label"
        appbasedprog_elem_label.classList.add("w3-button")
        appbasedprog_elem_label.classList.add("w3-block")
        appbasedprog_elem_label.classList.add("w3-inactiveaccordion")
        appbasedprog_elem_label.innerHTML = "Elementary School (Grades K-5)"
        appbasedprog_elem_li.appendChild(appbasedprog_elem_label)  
        let appbasedprog_elem_tbl = document.createElement('table');
        appbasedprog_elem_tbl.classList.add("w3-hide")
        appbasedprog_elem_tbl.classList.add("w3-container")
        appbasedprog_elem_tbl.id = "elem_tbl"
        appbasedprog_elem_li.appendChild(appbasedprog_elem_tbl)
        appbasedprog_ul.appendChild(appbasedprog_elem_li);
        appbasedprog_elem_label.addEventListener("click", () => {	
					open_accordion('elem_tbl',"elem_label")
        });	

       // <button onclick="open_accordion('Demo1')" class="w3-button w3-block">Left aligned and full-width</button>
       // <div id="Demo1" class="w3-hide w3-container">
       // <p>Lorem ipsum...</p>
       // </div>

        let appbasedprog_mid_li = document.createElement("li")
        appbasedprog_mid_li.classList.add("segment_li")
        appbasedprog_mid_label = document.createElement("button")
        appbasedprog_mid_label.id = "mid_label"
        appbasedprog_mid_label.classList.add("w3-button")
        appbasedprog_mid_label.classList.add("w3-block")
        appbasedprog_mid_label.classList.add("w3-inactiveaccordion")
        appbasedprog_mid_label.innerHTML = "Middle School (Grades 6-8)"
        appbasedprog_mid_li.appendChild(appbasedprog_mid_label)  
        let appbasedprog_mid_tbl = document.createElement('table');
        appbasedprog_mid_tbl.classList.add("w3-hide")
        appbasedprog_mid_tbl.classList.add("w3-container")
        appbasedprog_mid_tbl.id = "mid_tbl"
        appbasedprog_mid_li.appendChild(appbasedprog_mid_tbl)
        appbasedprog_ul.appendChild(appbasedprog_mid_li);
        appbasedprog_mid_label.addEventListener("click", () => {	
					open_accordion('mid_tbl',"mid_label")
        });	

        let appbasedprog_high_li = document.createElement("li")
        appbasedprog_high_li.classList.add("segment_li")
        appbasedprog_high_label = document.createElement("button")
        appbasedprog_high_label.id = "high_label"
        appbasedprog_high_label.classList.add("w3-button")
        appbasedprog_high_label.classList.add("w3-block")
        appbasedprog_high_label.classList.add("w3-inactiveaccordion")
        appbasedprog_high_label.innerHTML = "High School (Grades 9-12)"
        appbasedprog_high_li.appendChild(appbasedprog_high_label)  
        let appbasedprog_high_tbl = document.createElement('table');
        appbasedprog_high_tbl.classList.add("w3-hide")
        appbasedprog_high_tbl.classList.add("w3-container")
        appbasedprog_high_tbl.id = "high_tbl"
        appbasedprog_high_li.appendChild(appbasedprog_high_tbl)
        appbasedprog_ul.appendChild(appbasedprog_high_li)
        appbasedprog_high_label.addEventListener("click", () => {	
					open_accordion('high_tbl',"high_label")
        });	


        zones.forEach(function(z) {
          if (z.name == "Hillside New Tech High School") {}
          else {            
            unique_list_of_zones.push({
              choice:z.attributes.choice,
              type:z.attributes.type,
              name:z.attributes.name, 
              shortname:z.attributes.shortname,
              region:z.attributes.region,
              calendar:z.attributes.calendar,
              facilityid:z.attributes.facilityid, 
              stateid:z.attributes.stateid
            })
          }
        });

        unique_list_of_zones.sort((a, b) => (a.disttype > b.disttype) ? 1 : -1)

        let school2use
        if(flag=="next") {
          school2use = durm.all_schools_next
        }
        else {
          school2use = durm.all_schools
        }

        /* This is where we join the polygon/school zone attributes to the point/school attributes,  and we're using the facilityid field to do that. */
        /* This is because we're dealing with a many-to-many relationship structure that doesn't jive well with Esri's toolset */
        /* The basic idea is that we construct an array called unique_list_of_zones as a sort of on-the-fly Javascript join, creating a "Master List" that we can rely on to be unique, flat-file of schools */

        unique_list_of_zones.forEach(function(s){
          if (s.name == "Hillside New Tech High School") {}
          else {
            var result = school2use.filter(obj => { 
              return obj.attributes.stateid == s.stateid
            })
            if(result.length == 0) { 
              //The zone we're matching up doesn't have a school -- this would only happen if there was an error.
              console.log("Error : We found a zone that had no school.  Check the stateid fields of the educational points and zones to ensure data integrity.")
              console.log(result[0])
              console.log(s)
            }
            else if (result.length == 1) {
              //This is when there's a 1:1 relationship between the school and zone.
              s.agencyurl = result[0].attributes.agencyurl
              s.agency = result[0].attributes.agency
              s.agencytype = result[0].attributes.agencytype
              s.caltype = result[0].attributes.caltype
              s.spectype = result[0].attributes.spectype
              s.factype = result[0].attributes.factype
              s.fulladdr = result[0].attributes.fulladdr
              s.grades = result[0].attributes.grades
              s.municipality = result[0].attributes.municipality
              s.schoolpoint_name = result[0].attributes.name
              s.numstudent = result[0].attributes.numstudent
              s.operdays = result[0].attributes.operdays
              s.operhours = result[0].attributes.operhours
              s.phone = result[0].attributes.phone
              s.pocemail = result[0].attributes.pocemail
              s.pocname = result[0].attributes.pocname
              s.pocphone = result[0].attributes.pocphone
              s.prektype = result[0].attributes.prektype
            }
            else {
              // result length was greater than 1.
              // Step 1: do the first record, like you would above..
              s.agencyurl = result[0].attributes.agencyurl
              s.agency = result[0].attributes.agency
              s.agencytype = result[0].attributes.agencytype
              s.caltype = result[0].attributes.caltype
              s.spectype = result[0].attributes.spectype
              s.factype = result[0].attributes.factype
              s.fulladdr = result[0].attributes.fulladdr
              s.grades = result[0].attributes.grades
              s.municipality = result[0].attributes.municipality
              s.schoolpoint_name = result[0].attributes.name
              s.numstudent = result[0].attributes.numstudent
              s.operdays = result[0].attributes.operdays
              s.operhours = result[0].attributes.operhours
              s.phone = result[0].attributes.phone
              s.pocemail = result[0].attributes.pocemail
              s.pocname = result[0].attributes.pocname
              s.pocphone = result[0].attributes.pocphone
              s.prektype = result[0].attributes.prektype
              // Step 2: do the rest of the records, but add them as new items
              for(var i = 1; i < result.length; i++) {
                unique_list_of_zones.push({
                  type:s.type, 
                  name:s.name, 
                  facilityid:s.facilityid, 
                  stateid:s.stateid,
                  agencyurl:result[i].attributes.agencyurl,
                  agency:result[i].attributes.agency,
                  agencytype:result[i].attributes.agencytype,
                  caltype:result[i].attributes.caltype,
                  spectype:result[i].attributes.spectype,
                  factype:result[i].attributes.factype,
                  fulladdr:result[i].attributes.fulladdr,
                  grades:result[i].attributes.grades,
                  municipality:result[i].attributes.municipality,
                  schoolpoint_name:result[i].attributes.name,
                  numstudent:result[i].attributes.numstudent,
                  operdays:result[i].attributes.operdays,
                  operhours:result[i].attributes.operhours,
                  phone:result[i].attributes.phone,
                  pocemail:result[i].attributes.pocemail,
                  pocname:result[i].attributes.pocname,
                  pocphone:result[i].attributes.pocphone,
                  prektype:result[i].attributes.prektype
                  })
              }
            }
          }
        });

        try {
          unique_list_of_zones.forEach(function(singleschool){
            if (singleschool.type == 'Elementary School Base Assignment Zone') { 
              console.log(singleschool)
              thisschool.write_school_html_202425(singleschool,elementarybase_tbl,"elementary","next");
            }
            else if(singleschool.type == 'Middle School Base Assignment Zone') {
              console.log(singleschool)
              thisschool.write_school_html_202425(singleschool,middlebase_tbl,"middle","next");
            }
            else if(singleschool.type == 'High School Base Assignment Zone') {
              console.log(singleschool)
              thisschool.write_school_html_202425(singleschool,highbase_tbl,"high","next");              
            }
          });
        } catch (e) { console.log(e) }

        // Once we have the school point, we query the region it is located in
        let ASZ4 = durm.allschoolregions_next.createQuery();
        ASZ4.geometry = durm.current_location_geometry;
        ASZ4.spatialRelationship = "intersects";
        durm.allschoolregions_next.queryFeatures(ASZ4).then(function(regionresult_next) {
          thisschool.write_options_from_region25(regionresult_next.features[0],"Elementary",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          thisschool.write_options_from_region25(regionresult_next.features[0],"Middle",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          thisschool.write_options_from_region25(regionresult_next.features[0],"High",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          appbasedprog_header.innerHTML = appbasedprog_header.innerHTML + " for the <span class='dpsredtext'>"+regionresult_next.features[0].attributes.region+"</span> region"
        });
      }
      else { console.log("There were no school zones found.  The address could be outside of Durham County, or there could be a problem with the application.") }   
    } catch (e) {
      console.log(e);
    }
  },
  write_options_from_region25: function(region,gradelevel,flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl) {
    if(gradelevel=="Elementary") {
      try {   
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.mont_id,"Montessori")
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.ib_id,"International Baccalaureate (IB)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.dli_id,"Dual Language Instruction (DLI)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.yr_id,"Year-Round")
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.yr2_id,"Year-Round")
        thisschool.write_individual_option_using_stateid25(appbasedprog_elem_tbl,flag,region.attributes.online_es_id,"Online")
        
      } catch (e) { 
        console.log(e);
      }
    }
    else if(gradelevel=="Middle") {
      try {   
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.yr_ms_id,"Year-Round")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.ib_ms_id,"International Baccalaureate (IB)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.arts_ms_id,"Arts")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.stem1_ms_id,"STEM")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.stem2_ms_id,"STEM")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.mon_ms1_id,"Montessori")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.mon_ms2_id,"Montessori")        
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.dli_ms_id,"Dual Language Instruction (DLI)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.onli_ms_id,"Online")
      } catch (e) {
        console.log(e);
      }
    }
    else if(gradelevel=="High") {
      try {   
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.stem_hs_id,"STEM")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.ib_hs_id,"International Baccalaureate (IB)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.arts_hs_id,"Arts")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.ec1_hs_id,"Early College")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.ec2_hs_id,"Early College")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.ec3_hs_id,"Early College")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.ec4_hs_id,"Early College")
        thisschool.write_individual_option_using_stateid25(appbasedprog_high_tbl,flag,region.attributes.online_hs_id,"Online")
      } catch (e) { 
        console.log(e);
      }
    }
    else {
      console.log("No grade level for options?");
    }

  },
  write_individual_option_using_stateid25: function(tbl,flag,schoolid,label) {
    try {
      if(schoolid) {
      singleschool = thisschool.get_singleschool_from_id25(flag,schoolid)[0].attributes
      tbl.appendChild(mainscope.write_tr("","<a target='_blank' class='schoollink' href='"+ singleschool.agencyurl +"'>"+singleschool.name+"</a>"));
      tbl.appendChild(mainscope.write_tr("","<span class='progtypelabel'>Program Type: "+label+"</span>"));
      tbl.appendChild(mainscope.write_tr("","<span class='school grades'>"+singleschool.caltype+" Calendar"));     //, Grades "+singleschool.grades+"</span>"));      
      tbl.appendChild(mainscope.write_tr("","<span class='school addr'>"+singleschool.fulladdr+"</span>"));        
      tbl.appendChild(mainscope.write_tr("","<span class='school hrs'>Operating Hours : "+singleschool.operdays +" "+ singleschool.operhours+"</span>")); 
      tbl.appendChild(mainscope.write_tr("","<span class='school tel'>Telephone : "+ singleschool.pocphone+"</span>"));
      tbl.appendChild(mainscope.write_tr_single("&nbsp;"));
      }
    } catch (e) { 
      if (schoolid) { 
        console.log(e)
        console.log("Problem finding school " + schoolid.toString())}
      else {
        console.log(label) 
        console.log(schoolid) 
      }
      
    }
  },
  get_singleschool_from_id25: function(flag,schoolid) {
    if(flag=="special") {
      school2use = durm.all_schools_special
    }
    else if(flag=="next") {
      school2use = durm.all_schools_next
    }
    else {
      school2use = durm.all_schools
    }
    let result = school2use.filter(obj => { 
      /*if(obj.attributes.stateid == schoolid) {
        console.log(obj.attributes.stateid + " matched " + schoolid)
      } else {console.log(obj.attributes.stateid + " did not match " + schoolid) }*/
      return obj.attributes.stateid == schoolid 
    })
    return result
  },
  write_school_html_202425: function(singleschool,tbl,idtag,suffix) {
    try {
      tbl.appendChild(mainscope.write_tr_single("<a target='_blank' id='"+idtag+"_"+suffix+"' class='schoollink' href='"+ singleschool.agencyurl +"'>"+singleschool.schoolpoint_name+"</a>"));
      tbl.appendChild(mainscope.write_tr_single("<span class='school progtype'>Program Type: "+singleschool.choice));
      tbl.appendChild(mainscope.write_tr_single("<span class='school grades'>"+singleschool.caltype+" Calendar")); //, Grades "+singleschool.grades+"</span>",""));      
      tbl.appendChild(mainscope.write_tr("<span class='school addr'>"+singleschool.fulladdr+"</span>",""));        
      tbl.appendChild(mainscope.write_tr("<span class='school hrs'>Operating Hours : "+singleschool.operdays +" "+ singleschool.operhours+"</span>","")); 
      tbl.appendChild(mainscope.write_tr("<span class='school tel'>Telephone : "+ singleschool.pocphone+"</span>","")); 
    } catch (e) { 
      console.log(e);
    }
  },
  write_school_html_202324: function(singleschool,tbl,external_map_layer_type,idtag,suffix) {
    try {
      tbl.appendChild(mainscope.write_tr("<a target='_blank' id='"+idtag+"_"+suffix+"' class='schoollink' href='"+ singleschool.agencyurl +"'>"+singleschool.schoolpoint_name+"</a>","<a target='_blank' class='maplink' href='https://maps.durhamnc.gov/?x="+durm.xresult+"&y="+durm.yresult+"&z="+durm.zresult+"&r=1&b=11&a=-1&u=0&pid=NA&s=custom&l=active_address_points,countymask,parcels,"+external_map_layer_type+",#'>District Map</a>"));
      tbl.appendChild(mainscope.write_tr("<span class='school grades'>"+singleschool.caltype+" Calendar, Grades "+singleschool.grades+"</span>",""));
      tbl.appendChild(mainscope.write_tr("<span class='school addr'>"+singleschool.fulladdr+"</span>",""));        
      tbl.appendChild(mainscope.write_tr("<span class='school hrs'>Operating Hours : "+singleschool.operdays +" "+ singleschool.operhours+"</span>","")); 
      tbl.appendChild(mainscope.write_tr("<span class='school tel'>Telephone : "+ singleschool.phone+"</span>",""));       
    } catch (e) { 
      console.log(e);
    }
  },
  /* HTML helpers */
  writeH4: function(t) {
    let schooltype_header = document.createElement("h4")
    schooltype_header.innerHTML = t
    schooltype_header.classList.add("h4assignment")
    return schooltype_header
  },
  show_year: function(state){
    switch(state) {
      case "now":
        document.getElementById("next_result").style.visibility = "hidden";
        document.getElementById("next_result").style.display = "none";
        document.getElementById("now_result").style.visibility = "visible";
        document.getElementById("now_result").style.display = "block";
        // document.getElementById("special_result").style.visibility = "hidden";
        // document.getElementById("special_result").style.display = "none";
        break;
      case "next":			
        document.getElementById("next_result").style.visibility = "visible";
        document.getElementById("next_result").style.display = "block";
        document.getElementById("now_result").style.visibility = "hidden";
        document.getElementById("now_result").style.display = "none";
        // document.getElementById("special_result").style.visibility = "hidden";
        // document.getElementById("special_result").style.display = "none";
        break;
      // case "special":			
      //   document.getElementById("next_result").style.visibility = "hidden";
      //   document.getElementById("next_result").style.display = "none";
      //   document.getElementById("now_result").style.visibility = "hidden";
      //   document.getElementById("now_result").style.display = "none";
      //   document.getElementById("special_result").style.visibility = "visible";
      //   document.getElementById("special_result").style.display = "block";
      //   break;		
      default:
        document.getElementById("next_result").style.visibility = "hidden";
        document.getElementById("next_result").style.display = "none";
        document.getElementById("now_result").style.visibility = "visible";
        document.getElementById("now_result").style.display = "block";
        // document.getElementById("special_result").style.visibility = "hidden";
        // document.getElementById("special_result").style.display = "none";
        break;
    }
  },
  generate_html_for_new_schools: function() {
    console.log("OK")
    /* Note: For version 1.06, we left the "Next Year Change Detection" code unchanged. No "special" here. */

    //Right now this triggers on name mismatch
    //In the future we maybe should use State ID mismatch

    //stypes = ["elementary_now","middle_now","high_now","elementarytrad_now","elementaryattd_now","middleyrrd_now","secondaryatt_now","highattdzn_now"]
    nexts = document.getElementById("next_result")
    nows = document.getElementById("now_result")

    nextslinks = nexts.getElementsByClassName("schoollink") //get all HTML elements that are children of id 'next_result' that are also the big green title of the school
    nowslinks = nows.getElementsByClassName("schoollink")//get all HTML elements that are children of id 'now_result' that are also the big green title of the school

    if(nowslinks['elementary_now'].innerHTML == nextslinks['elementary_next'].innerHTML) { 
      console.log("Elementary Schools Matched")
    } else { 
      console.log("Elementary Schools Did Not Match")
      let note0 = document.createElement("div")
      note0.classList.add("new_school_warning")
      let noteline1 = document.createElement("div")
      let noteline2 = document.createElement("div")
      let noteline3 = document.createElement("div")
      noteline1.innerHTML = "Our records show that this school assignment may be changing next school year."
      noteline2.innerHTML =nextprefix+" school assignment is: "+nextslinks['elementary_next'].innerHTML
      noteline3.innerHTML ="Please contact the Durham Public Schools Office of Student Assignment if you have questions or believe this notification is in error."
      note0.appendChild(noteline1)
      note0.appendChild(noteline2)
      note0.appendChild(noteline3)
      nowslinks['elementary_now'].after(note0)
    }

    if(nowslinks['middle_now'].innerHTML == nextslinks['middle_next'].innerHTML) { 
      console.log("Middle Schools Matched")
    } else { console.log("Middle Schools Did Not Match")
      let note1 = document.createElement("div")
      note1.classList.add("new_school_warning")
      let noteline1 = document.createElement("div")
      let noteline2 = document.createElement("div")
      let noteline3 = document.createElement("div")
      noteline1.innerHTML = "Our records show that this school assignment may be changing next school year."
      noteline2.innerHTML =nextprefix+" school assignment is: "+nextslinks['middle_next'].innerHTML
      noteline3.innerHTML ="Please contact the Durham Public Schools Office of Student Assignment if you have questions or believe this notification is in error."
      note1.appendChild(noteline1)
      note1.appendChild(noteline2)
      note1.appendChild(noteline3)
      nowslinks['middle_now'].after(note1)  
    }

    if(nowslinks['high_now'].innerHTML == nextslinks['high_next'].innerHTML) { 
      console.log("High Schools Matched") 
    } else { 
      console.log("High Schools Did Not Match")
      let note0 = document.createElement("div")
      note0.classList.add("new_school_warning")
      let noteline1 = document.createElement("div")
      let noteline2 = document.createElement("div")
      let noteline3 = document.createElement("div")
      noteline1.innerHTML = "Our records show that this school assignment may be changing next school year."
      noteline2.innerHTML =nextprefix+" school assignment is: "+nextslinks['high_next'].innerHTML
      noteline3.innerHTML ="Please contact the Durham Public Schools Office of Student Assignment if you have questions or believe this notification is in error."
      note0.appendChild(noteline1)
      note0.appendChild(noteline2)
      note0.appendChild(noteline3)
      nowslinks['high_now'].after(note0)
    }

  }

};
});

