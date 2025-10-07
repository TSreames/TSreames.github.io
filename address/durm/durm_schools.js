define([
  "esri/layers/FeatureLayer"
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

      /* This block of code gets updated annually each summer */
      /* You also need to update a block of code in durm_main.js, for the text */

      // naming convention:
      // each year has schools (points) and schoolzones (polygons) which need to be joined together.  Years after 2024-2025 also have an additional 'region' (polygon).
      // there are placeholders for "this year" and "next year" and "special year".  URLs for this and next years should stay the same.
      durm.allschoolzones = ss.createSchoolLayer("allschoolzones", "School Zones, Current Year",
        "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/18", false);

      durm.allschools = ss.createSchoolLayer("allschools", "Schools, Current Year",
        "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/17", true);

      durm.allschoolzones_next = ss.createSchoolLayer("allschoolzones_next", "School Zones, Next Year",
        "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/21", false);

      durm.allschools_next = ss.createSchoolLayer("allschools_next", "Schools, Next Year",
        "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/22", true);

      durm.allschoolregions_next = ss.createSchoolLayer("allschoolregions_next", "Regions, Next Year",
        "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Education/MapServer/20", false);


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

    linow.classList.add("yeartoggleli")
    linext.classList.add("yeartoggleli")

    yeartoggle.appendChild(linow)
    
    yeartoggle.appendChild(linext) //   <----------   IMPORTANT.  Vitaly requested summer 2025 to "not show next year's results, temporarily" and commenting this out is the easiest way to do that.

    let bnow = document.createElement("button")
    let bnext = document.createElement("button") 

    bnow.classList.add("esri-button","yeartogglebutton")
    bnext.classList.add("esri-button","yeartogglebutton")

    bnow.innerHTML = nowstring
    bnext.innerHTML = nextstring

    bnext.addEventListener("click", () => {	ss.show_year("next") });	
    bnow.addEventListener("click", () => { ss.show_year("now") });

    //linow.appendChild(bnow)
    linext.appendChild(bnext)

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

    durm.allschoolzones.queryFeatures(ASZ)
    .then(function(zoneresult) {
      thisschool.generate_individual_school_result(zoneresult,nowdiv,"now",nowprefix)
      return durm.allschoolzones_next.queryFeatures(ASZ2)
    })
    .then(function(zoneresult_next) {
      thisschool.generate_individual_school_result(zoneresult_next,nextdiv,"next",nextprefix)
      return
    })
    .then(function() {
       ss.generate_html_for_new_schools();
       return
    });
  },
  generate_individual_school_result: function(zr,yr,flag,yearprefix) {
    try {
      //let specialtext2 = "Please Note: Currently, only elementary school application programs and school boundaries have been finalized for 2024-2025 school year. For more information about the Growing Together Student Assignment Plan, please visit <a class='dpsredlink' href='https://www.dpsnc.net/domain/2546'>https://www.dpsnc.net/domain/2546</a>."
      //let specialtext = "Please Note: The lottery submission window for DPS application-based programs runs from early January to early February each year. For more information about application program options please visit <a class='dpsredlink' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a>."

      let specialtext2 = "For more information about DPS’s new Student Assignment Plan, please visit <a class='dpsredlink' target='_blank' href='https://welcome.dpsnc.net/'>https://welcome.dpsnc.net/</a> or contact the Office of Student Assignment at 919-560-2059. New elementary school boundaries will take effect for the 2024-25 school year, while the middle & high school plan will not take effect until the 2025-26 school year."
      //let specialtext = "Please Note: The lottery submission window for DPS application-based programs runs from January 8 to February 9, 2024. The programs listed below do not include CTE and JROTC pathways for high school students (see more here: <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/Page/6641'>https://www.dpsnc.net/Page/6641</a>) and may not be exhaustive of all potential options. For more information about application program options please visit <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a> or contact the Office of Student Assignment at 919-560-2059."
      let specialtext = "The following schools and programs are available through the annual Application Schools Lottery. The programs listed below do not include CTE and JROTC pathways for high school students (see more here: <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/Page/6641'>https://www.dpsnc.net/Page/6641</a>) and may not be exhaustive of all potential options. For more information about application program options please visit <a class='dpsredlink' target='_blank' href='https://www.dpsnc.net/magnet'>https://www.dpsnc.net/magnet</a> or contact the Office of Student Assignment at 919-560-2059."
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
        appbasedprog_elem_label.id = flag + "_elemoptions"
        appbasedprog_elem_label.classList.add("w3-button")
        appbasedprog_elem_label.classList.add("w3-block")
        appbasedprog_elem_label.classList.add("w3-inactiveaccordion")
        appbasedprog_elem_label.innerHTML = "Elementary School (Grades K-5)"
        appbasedprog_elem_li.appendChild(appbasedprog_elem_label)  
        let appbasedprog_elem_tbl = document.createElement('table');
        appbasedprog_elem_tbl.classList.add("w3-hide")
        appbasedprog_elem_tbl.classList.add("w3-container")
        appbasedprog_elem_tbl.id = flag + "_elem_tbl"
        appbasedprog_elem_li.appendChild(appbasedprog_elem_tbl)
        appbasedprog_ul.appendChild(appbasedprog_elem_li);
        appbasedprog_elem_label.addEventListener("click", () => {	
					open_accordion(flag + "_elem_tbl",flag + "_elemoptions")
        });	

       // <button onclick="open_accordion('Demo1')" class="w3-button w3-block">Left aligned and full-width</button>
       // <div id="Demo1" class="w3-hide w3-container">
       // <p>Lorem ipsum...</p>
       // </div>

        let appbasedprog_mid_li = document.createElement("li")
        appbasedprog_mid_li.classList.add("segment_li")
        appbasedprog_mid_label = document.createElement("button")
        appbasedprog_mid_label.id = flag + "_midoptions"
        appbasedprog_mid_label.classList.add("w3-button")
        appbasedprog_mid_label.classList.add("w3-block")
        appbasedprog_mid_label.classList.add("w3-inactiveaccordion")
        appbasedprog_mid_label.innerHTML = "Middle School (Grades 6-8)"
        appbasedprog_mid_li.appendChild(appbasedprog_mid_label)  
        let appbasedprog_mid_tbl = document.createElement('table');
        appbasedprog_mid_tbl.classList.add("w3-hide")
        appbasedprog_mid_tbl.classList.add("w3-container")
        appbasedprog_mid_tbl.id = flag + "_mid_tbl"
        appbasedprog_mid_li.appendChild(appbasedprog_mid_tbl)
        appbasedprog_ul.appendChild(appbasedprog_mid_li);
        appbasedprog_mid_label.addEventListener("click", () => {	
					open_accordion(flag + "_mid_tbl",flag + "_midoptions")
        });	

        let appbasedprog_high_li = document.createElement("li")
        appbasedprog_high_li.classList.add("segment_li")
        appbasedprog_high_label = document.createElement("button")
        appbasedprog_high_label.id = flag + "_highoptions"
        appbasedprog_high_label.classList.add("w3-button")
        appbasedprog_high_label.classList.add("w3-block")
        appbasedprog_high_label.classList.add("w3-inactiveaccordion")
        appbasedprog_high_label.innerHTML = "High School (Grades 9-12)"
        appbasedprog_high_li.appendChild(appbasedprog_high_label)  
        let appbasedprog_high_tbl = document.createElement('table');
        appbasedprog_high_tbl.classList.add("w3-hide")
        appbasedprog_high_tbl.classList.add("w3-container")
        appbasedprog_high_tbl.id = flag + "_high_tbl"
        appbasedprog_high_li.appendChild(appbasedprog_high_tbl)
        appbasedprog_ul.appendChild(appbasedprog_high_li)
        appbasedprog_high_label.addEventListener("click", () => {	
					open_accordion(flag + "_high_tbl",flag + "_highoptions")
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
        /* This is because our underlying data structure is ... uh...  charitably what you might call "fluid."  We're dealing with a many-to-many relationship structure that doesn't jive well with Esri's toolset */
        /* The basic idea is that we construct an array called unique_list_of_zones as a sort of on-the-fly Javascript join, creating a "Master List" that we can rely on to be unique, flat-file of schools */
        /* Yes theres probably better ways of doing this */

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
              //1:1 ratio of records
              thisschool.copySchoolAttributes(s, result[0]);
            }
            else {
              //1:N ratio of records
              // Step 1: do the first record
              thisschool.copySchoolAttributes(s, result[0]);
              // Step 2: do the rest of the records, but add them as new items
              for(var i = 1; i < result.length; i++) {
                let newZone = {
                  type: s.type,
                  name: s.name,
                  facilityid: s.facilityid,
                  stateid: s.stateid
                };
                thisschool.copySchoolAttributes(newZone, result[i]);
                unique_list_of_zones.push(newZone);
              }
            }
          }
        });

        try {
          unique_list_of_zones.forEach(function(singleschool){
            if (singleschool.type == 'Elementary School Base Assignment Zone') { 
              console.log(singleschool)
              thisschool.write_school_html(singleschool,elementarybase_tbl,"elementary",flag);
            }
            else if(singleschool.type == 'Middle School Base Assignment Zone') {
              console.log(singleschool)
              thisschool.write_school_html(singleschool,middlebase_tbl,"middle",flag);
            }
            else if(singleschool.type == 'High School Base Assignment Zone') {
              console.log(singleschool)
              thisschool.write_school_html(singleschool,highbase_tbl,"high",flag);              
            }
          });
        } catch (e) { console.log(e) }

        // Once we have the school point, we query the region it is located in
        let ASZ4 = durm.allschoolregions_next.createQuery();
        ASZ4.geometry = durm.current_location_geometry;
        ASZ4.spatialRelationship = "intersects";
        durm.allschoolregions_next.queryFeatures(ASZ4).then(function(regionresult_next) {
          thisschool.write_options_from_region(regionresult_next.features[0],"Elementary",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          thisschool.write_options_from_region(regionresult_next.features[0],"Middle",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          thisschool.write_options_from_region(regionresult_next.features[0],"High",flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl)
          appbasedprog_header.innerHTML = appbasedprog_header.innerHTML + " for the <span class='dpsredtext'>"+regionresult_next.features[0].attributes.region+"</span> region"
        });
      }
      else { console.log("There were no school zones found.  The address could be outside of Durham County, or there could be a problem with the application.") }   
    } catch (e) {
      console.log(e);
    }
  },
  write_options_from_region: function(region,gradelevel,flag,appbasedprog_elem_tbl,appbasedprog_mid_tbl,appbasedprog_high_tbl) {
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
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.yr_ms_id2,"Year-Round")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.ib_ms_id,"International Baccalaureate (IB)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.arts_ms_id,"Arts")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.stem1_ms_id,"STEM")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.stem2_ms_id,"STEM")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.mont_ms1_id,"Montessori")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.mont_ms2_id,"Montessori")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.dli_ms_id,"Dual Language Instruction (DLI)")
        thisschool.write_individual_option_using_stateid25(appbasedprog_mid_tbl,flag,region.attributes.online_ms_id,"Online")
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
  write_school_html: function(singleschool,tbl,idtag,suffix) {
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

  },
  createSchoolLayer: function(id, title, url, hasDefinition) {
    let layer = new FeatureLayer({
      id: id,
      title: title,
      visible: false,
      url: url
    });
    if (hasDefinition) {
      layer.definitionExpression = "agency = 'Durham Public Schools'";
    }
    durm.map.add(layer);
    layer.when(function(){})
      .catch(function(error){
        mainscope.handle_layer_loading_failure(error);
      });
    return layer;
  },
  copySchoolAttributes: function(target, source) {
    const attrs = source.attributes;
    Object.assign(target, {
      agencyurl: attrs.agencyurl,
      agency: attrs.agency,
      agencytype: attrs.agencytype,
      caltype: attrs.caltype,
      spectype: attrs.spectype,
      factype: attrs.factype,
      fulladdr: attrs.fulladdr,
      grades: attrs.grades,
      municipality: attrs.municipality,
      schoolpoint_name: attrs.name,
      numstudent: attrs.numstudent,
      operdays: attrs.operdays,
      operhours: attrs.operhours,
      phone: attrs.phone,
      pocemail: attrs.pocemail,
      pocname: attrs.pocname,
      pocphone: attrs.pocphone,
      prektype: attrs.prektype
    });
  }
};
});