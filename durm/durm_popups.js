/*
Matt Reames, 2019
This module controls the default ESRI popup situation
*/
define([
  "esri/rest/query", "esri/rest/support/Query",
	"esri/geometry/geometryEngine",
  "../durm/durm_pdf.js",
	"../durm/durm_drill.js"
], function( 
	query, Query, geometryEngine, durm_pdf, durm_drill
	) {
		return {
			pre_init: function(){
				try{ 
					pt = this							
					parcelNotificationToolAction = {
						title: "Mailing List Tool",
						id: "open-buffer-tool",
						className: "esri-icon-duplicate"
					};
					let citylimitqueryobject = new Query({
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: true,
						where: "1=1"
					  });			
					query.executeQueryJSON(CITY_BOUNDARY, citylimitqueryobject).then(function(results){
					  citygeometry = results.features[0].geometry
					});
				} catch (e) { console.log(e); }
			},
			post_init: function(){
				try{ 

				} catch (e) { console.log(e); }
			},
			//below here is a lot of new stuff
			returnPhotoNode: function(REID) {
				//This returns an <img> tag as node
				try {
					let i = document.createElement("img")
					i.src = url_for_county_photos +	REID + ".JPG"
					i.alt = "Photo of Parcel " + REID + " from Durham County Tax Administration website"
					i.style.width = "100%"
					i.onerror = function() {
						console.log(`Image not found for REID: ${REID}`);
						i.alt = "No image available"
						//i.src = "path/to/placeholder/image.jpg"; // Provide a path to a placeholder image
						//i.alt = "Placeholder image"; // Update alt text for the placeholder
					};
					return i
				} catch (e) { console.log(e); }
			},
			returnCityLimitText: async function(OTLG) {
				//returns text "Yes" or "No"
				try {
					citytxt = "error"
					let rawsqft = geometryEngine.geodesicArea(OTLG,"square-feet")	
					if (pt.test_parcel_in_city_pct(OTLG,rawsqft) > 2) { citytxt = "Yes" }
					else { citytxt = "No"	}
					return citytxt
				} catch (e) { console.log(e); }		
			},
			test_parcel_in_city_pct: function(parcelgeometry,rawsqft){
				try {		
					let pct_of_parcel = 0
					let geom = geometryEngine.intersect(parcelgeometry,citygeometry)
					if (geom) {
						let matching_feet = geometryEngine.geodesicArea(geom,"square-feet")
						pct_of_parcel = Math.round((matching_feet / rawsqft)*100);
					}
					else {} //no geom
					return pct_of_parcel;
				} catch (e) { console.log(e); }	
			},
			returnZIPNode: async function(OTLG) {
				//Ideally this should handle large parcels that might span more than one ZIP code, but right now if that occurs it just chooses between one of the two, at random.
				try {
					let zn = document.createElement("span")
					let zquery = new Query({
						geometry: OTLG,
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: false,
						spatialRelationship: "intersects"
					});					
					return query
					.executeQueryJSON(ZIPCODE_SUB,zquery)
					.then(function(result) {
						zn.innerHTML = result.features[0].attributes.ZIPCODE
						return zn
					}, function(error){console.log(error)});
				} catch (e) { 					
					console.log(e);
					zn.innerHTML = "Network Error"
				 }
			},
			returnOwnerNode:async function(target,OTLG) {
				//This returns an <ul> tag as node
				try {		
					console.log(target.graphic.attributes.OBJECTID_1)	
					let owndiv = document.createElement("div")
					owndiv.classList.add("ownersection")
					let prquery = new Query({
						outFields: ["*"],
						outSpatialReference: { wkid:102100 },
						returnGeometry: true,
						where: "OBJECTID_1 = '"+target.graphic.attributes.OBJECTID_1+"'"
					});
					return query
					.executeQueryJSON(PARCELS_AGOL,prquery)
					.then(async function(result) {
						/* Owner Section */
						let ow = document.createElement("ul")
						let owl1 = document.createElement("li")
						let owl2 = document.createElement("li")
						let owl3 = document.createElement("li")
						let owl4 = document.createElement("li")
						owndiv.appendChild(ow)
						ow.appendChild(owl1)
						ow.appendChild(owl2)
						ow.appendChild(owl3)
						ow.appendChild(owl4)
						owl1.innerHTML = "Owner Address"
						owl1.style.fontWeight = "700"
						let ownermailstring = result.features[0].attributes.OWNER_MAIL_1
						if(result.features[0].attributes.OWNER_MAIL_2 == null) {} else {ownermailstring = ownermailstring + " " + result.features[0].attributes.OWNER_MAIL_2}
						if(result.features[0].attributes.OWNER_MAIL_3 == null) {} else {ownermailstring = ownermailstring + " " + result.features[0].attributes.OWNER_MAIL_3}
						owl2.innerHTML = result.features[0].attributes.PROPERTY_OWNER
						owl3.innerHTML = ownermailstring
						result.features[0].attributes.OWNER_MAIL_2 + " " + result.features[0].attributes.OWNER_MAIL_3
						owl4.innerHTML = result.features[0].attributes.OWNER_MAIL_CITY+", "+result.features[0].attributes.OWNER_MAIL_STATE+" "+result.features[0].attributes.OWNER_MAIL_ZIP


						/* Core Info */
						let ci = document.createElement("ul")
						owndiv.appendChild(ci)
						let cil = document.createElement("li")
						ci.appendChild(cil)
						let cit = document.createElement("table")
						cil.appendChild(cit)

						let citr0 = document.createElement("tr")
						cit.appendChild(citr0)
						let partitletd = document.createElement("td")	
						citr0.appendChild(partitletd)
						partitletd.style.fontWeight = "700"
						partitletd.innerHTML = "Parcel Information"


						let citr1 = document.createElement("tr")
						cit.appendChild(citr1)
						let titr1td1 = document.createElement("td")						
						let titr1td2 = document.createElement("td")
						citr1.appendChild(titr1td1)
						citr1.appendChild(titr1td2)
						titr1td1.innerHTML = "REID"
						titr1td2.innerHTML = result.features[0].attributes.REID

						let citr2 = document.createElement("tr")
						cit.appendChild(citr2)
						let titr2td1 = document.createElement("td")						
						let titr2td2 = document.createElement("td")
						citr2.appendChild(titr2td1)
						citr2.appendChild(titr2td2)
						titr2td1.innerHTML = "PIN"
						titr2td2.innerHTML = result.features[0].attributes.PIN

						let citr3 = document.createElement("tr")
						cit.appendChild(citr3)
						let titr3td1 = document.createElement("td")						
						let titr3td2 = document.createElement("td")
						citr3.appendChild(titr3td1)
						citr3.appendChild(titr3td2)
						titr3td1.innerHTML = "In City of Durham?"
						titr3td2.innerHTML = await pt.returnCityLimitText(OTLG)

						let citr4 = document.createElement("tr")
						cit.appendChild(citr4)
						let titr4td1 = document.createElement("td")
						let titr4td2 = document.createElement("td")
						citr4.appendChild(titr4td1)
						citr4.appendChild(titr4td2)
						titr4td1.innerHTML = "Land Class"
						titr4td2.innerHTML = result.features[0].attributes.LAND_CLASS

						let citr5 = document.createElement("tr")
						cit.appendChild(citr5)
						let titr5td1 = document.createElement("td")
						let titr5td2 = document.createElement("td")
						citr5.appendChild(titr5td1)	
						citr5.appendChild(titr5td2)
						titr5td1.innerHTML = "Property Description"
						titr5td2.innerHTML = result.features[0].attributes.PROPERTY_DESCR

						let citr6 = document.createElement("tr")
						cit.appendChild(citr6)
						let titr6td1 = document.createElement("td")
						let titr6td2 = document.createElement("td")
						citr6.appendChild(titr6td1)	
						citr6.appendChild(titr6td2)
						titr6td1.innerHTML = "ZIP Code"
						titr6td2.appendChild(await pt.returnZIPNode(OTLG))

						let citr7 = document.createElement("tr")
						cit.appendChild(citr7)
						let titr7td1 = document.createElement("td")
						let titr7td2 = document.createElement("td")
						citr7.appendChild(titr7td1)	
						citr7.appendChild(titr7td2)
						titr7td1.innerHTML = "Area"
						sqftarea = result.features[0].attributes["Shape__Area"].toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
						sqftacres = (result.features[0].attributes["Shape__Area"] / 43560).toFixed(2)
						titr7td2.innerHTML = sqftacres + " acres (" + sqftarea + " ft&sup2;)"												

						/* Tax Section */
						let tx = document.createElement("ul")
						owndiv.appendChild(tx)

						let txl1 = document.createElement("li")
						let txl2 = document.createElement("li")
						let txl3 = document.createElement("li")
						let txl4 = document.createElement("li")
						let txl5 = document.createElement("li")
						//let txl6 = document.createElement("li")
						tx.appendChild(txl1)
						tx.appendChild(txl2)
						tx.appendChild(txl3)
						tx.appendChild(txl4)
						tx.appendChild(txl5)
						//tx.appendChild(txl6)

						txl1.innerHTML = "Tax Appraisal Value"
						txl1.style.fontWeight = "700"
						if(result.features[0].attributes.TOTAL_BLDG_VALUE_ASSESSED) {txl2.innerHTML = "Building: $" + result.features[0].attributes.TOTAL_BLDG_VALUE_ASSESSED.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} else {txl2.innerHTML = "Building Value not provided"}
						if(result.features[0].attributes.TOTAL_LAND_VALUE_ASSESSED) {txl3.innerHTML = "Land: $"+ result.features[0].attributes.TOTAL_LAND_VALUE_ASSESSED.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} else {txl3.innerHTML = "Land Value not provided"}
						if(result.features[0].attributes.TOTAL_PROP_VALUE) {txl4.innerHTML = "Total: $" + result.features[0].attributes.TOTAL_PROP_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} else {txl4.innerHTML = "Total Property Value not provided."}
						
						//txl3.innerHTML = "Land: $"+ result.features[0].attributes.TOTAL_LAND_VALUE_ASSESSED.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						//txl4.innerHTML = "Total: $" + result.features[0].attributes.TOTAL_PROP_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

						let taxlink = document.createElement('a')
						//taxlink.href = "https://property.spatialest.com/nc/durham/#/property/" + result.features[0].attributes.REID
						taxlink.href = "https://taxcama.dconc.gov/camapwa/PropertySummary.aspx?PARCELPK=" + result.features[0].attributes.PARCEL_PK
						taxlink.innerHTML = "Durham County Tax Data"
						taxlink.target = "new"
						txl5.appendChild(taxlink)




						/* Misc Section */
						let mis = document.createElement("ul")
						owndiv.appendChild(mis)

						let mil1 = document.createElement("li")
						let mil2 = document.createElement("li")
						//let mil3 = document.createElement("li")
						//let mil4 = document.createElement("li")
						let mil5 = document.createElement("li")
						let mil6 = document.createElement("li")
						let mil7 = document.createElement("li")
						let mil8 = document.createElement("li")
						mis.appendChild(mil1)
						mis.appendChild(mil2)
						//mis.appendChild(mil3)
						//mis.appendChild(mil4)
						mis.appendChild(mil5)
						mis.appendChild(mil6)
						mis.appendChild(mil7)
						mis.appendChild(mil8)
						mil1.innerHTML = "Miscellaneous"
						mil1.style.fontWeight = "700"						
						let gmlink = document.createElement('a')
						gmlink.href = "https://www.google.com/maps/@"+(result.features[0].geometry.centroid.latitude-0.0006721930485)+","+(result.features[0].geometry.centroid.longitude-0.0000196467158)+",68a,35y,49.52t/data=!3m1!1e3"
						gmlink.innerHTML = "Google Earth / Streetview"
						gmlink.target = "new"
						mil2.appendChild(gmlink)
						//mil3.innerHTML = result.parcel_area_acres + " acres (" + result.parcel_area_sqft + " ft&sup2;)"

						//let pictlink = document.createElement('a')
						//pictlink.href = "https://community.spatialest.com/nc/durham/pictometry.php?y="+result.features[0].geometry.centroid.latitude+"&x="+result.features[0].geometry.centroid.longitude
						//pictlink.innerHTML = "Pictometry Oblique Aerials"
						//pictlink.target = "new"
						//mil3.appendChild(pictlink)

						let deedlink1 = document.createElement('a')
						mil5.appendChild(deedlink1)
						deedlink1.href = "https://rodweb.dconc.gov/web/search/DOCSEARCH5S1"
						deedlink1.setAttribute('target', '_blank');
						if(!result.features[0].attributes.DEED_BOOK) {deedlink1.innerHTML = "Deed Book: null (none)"}
						else {deedlink1.innerHTML = "Deed Book: " + result.features[0].attributes.DEED_BOOK.toString().replace(/^0+/, '')}

						let deedlink2 = document.createElement('a')
						mil6.appendChild(deedlink2)
						deedlink2.href = "https://rodweb.dconc.gov/web/search/DOCSEARCH5S1"
						deedlink2.setAttribute('target', '_blank');
						if(!result.features[0].attributes.DEED_PAGE) {deedlink2.innerHTML = "Deed Page: null (none)"}
						else{ deedlink2.innerHTML = "Deed Page: " + result.features[0].attributes.DEED_PAGE.toString().replace(/^0+/, '')}

						platlink1 = document.createElement('a')
						mil7.appendChild(platlink1)
						platlink1.href = "https://rodweb.dconc.gov/web/search/DOCSEARCH5S1"
						platlink1.setAttribute('target', '_blank');
						if(!result.features[0].attributes.PLAT_BOOK) { 
							platlink1.innerHTML = "Plat Book: null (none)"
						}
						else {
						platlink1.innerHTML = "Plat Book: " + result.features[0].attributes.PLAT_BOOK.toString().replace(/^0+/, '')
						}

						platlink2 = document.createElement('a')
						mil8.appendChild(platlink2)
						platlink2.href = "https://rodweb.dconc.gov/web/search/DOCSEARCH5S1"
						platlink2.setAttribute('target', '_blank');
						if(!result.features[0].attributes.PLAT_PAGE) { 
							platlink2.innerHTML = "Plat Page: null (none)"
						 }
						else {
							platlink2.innerHTML = "Plat Page: " + result.features[0].attributes.PLAT_PAGE.toString().replace(/^0+/, '')
						}
						return owndiv
					}, function(error){console.log(error)})
				} catch (e) { console.log(e); }
			},
			returnAddressResultNode: async function(OTLG) {
				//This returns an unordered list ul DOM element 
				try {
					let addresspoints_within_parcel_Query = new Query({
						geometry: OTLG,
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: false,
						spatialRelationship: "intersects"
					});				
					// execute the query task
					return query
						.executeQueryJSON(ADDRESS_FS_URL,addresspoints_within_parcel_Query)
						.then(function (result) {
							try {
								let addressul = document.createElement('ul')
								let lh1 = document.createElement('li')
								lh1.style.fontWeight = "700"
								lh1.innerHTML = "Addresses on Parcel"
								addressul.appendChild(lh1)
								if (result.features.length == 0) { return addressul }
								else {
										// this sorts alphabetically by SITE_ADDRE
										function compare(a,b) {
											if (a.attributes.SITE_ADDRE < b.attributes.SITE_ADDRE)
											return -1;
											if (a.attributes.SITE_ADDRE > b.attributes.SITE_ADDRE)
											return 1;
											return 0;		
										}
										result.features.sort(compare);								
										result.features.forEach(function(ftr) {
											let l = document.createElement('li')
											l.innerHTML = ftr.attributes.SITE_ADDRE
											addressul.appendChild(l)
										});
										return addressul			
								}
							} catch (e) { console.log(e); }
						}, function(error){console.log(error)});

				} catch (e) { console.log(e); }
			},			
			//These are the 3 functions, which generate popups, which can be run from 4 possible sources: 
			// Default click popup, or Clicking any of the three buttons.
			popup_initial_and_firstbutton: async function(target,OTLG) {
				//This returns DOM Elements that are children of bigcontent
				let new_child_inside_bigcontent = document.createElement("div")
				try {
					//Initial-state of popup, content section begin.  (Note that the button onclick overwrites everything here.)			
					new_child_inside_bigcontent.appendChild(await pt.returnOwnerNode(target,OTLG))
					new_child_inside_bigcontent.appendChild(await pt.returnAddressResultNode(OTLG))
					
				} catch (e) { 
					console.log(e); 
				}
				return new_child_inside_bigcontent
			},
			popup_secondbutton: async function(target,OTLG) {
				//This returns DOM Elements that are children of bigcontent
				try {
					return durm_drill.query_parcel_advanced_async(target.graphic.attributes.OBJECTID_1,OTLG)
				} catch (e) { console.log(e); }
			},
			popup_thirdbutton: async function(OTLG) {
				//This returns DOM Elements that are children of bigcontent
				try {
					return durm_drill.query_parcel_forpermits_async(OTLG)
				} catch (e) { console.log(e); }
			},
			returnTabManagerNode: async function(target,OTLG) {
				let bigtab = document.createElement("div")
				try {
					//bigtab is the main DIV that contains both the tab buttons and the resulting content					
					bigtab.classList.add("bigtab")
					//buttonholder is a container for the 3 buttons
					let ulbuttonholder = document.createElement("ul")
					ulbuttonholder.classList.add("ulbuttonholder")
					bigtab.appendChild(ulbuttonholder)

					//bigcontent holds the results of a button click.
					let bigcontent = document.createElement("div")
					bigcontent.classList.add("bigcontent")
					bigtab.appendChild(bigcontent)

					//Button Section Start
					ulbuttonholder.classList.add("ulbuttonholder")
					let libuttons = document.createElement("li")
					ulbuttonholder.appendChild(libuttons)

					let b1 = document.createElement("BUTTON")
					b1.innerHTML = "Property Record"
					b1.classList.add("mdc-button")
					b1.classList.add("mdc-button--dense")
					b1.classList.add("mdc-button--raised")
					b1.classList.add("mdc-ripple-upgraded")
					b1.classList.add("btn-success") //highlighted
					b1.addEventListener("click", async function() {
						b1.classList.remove("btn-primary")
						b2.classList.remove("btn-success")
						b3.classList.remove("btn-success")
						b1.classList.add("btn-success")
						b2.classList.add("btn-primary")
						b3.classList.add("btn-primary")
						bigcontent.replaceChild(await pt.popup_initial_and_firstbutton(target,OTLG), bigcontent.firstChild)
					});

					let b2 = document.createElement("BUTTON")
					b2.innerHTML = "Advanced Report"
					b2.classList.add("mdc-button")
					b2.classList.add("mdc-button--dense")
					b2.classList.add("mdc-button--raised")
					b2.classList.add("mdc-ripple-upgraded")
					b2.classList.add("btn-primary")//not highlighted
					b2.addEventListener("click", async function() {
						b1.classList.remove("btn-success")
						b2.classList.remove("btn-primary")
						b3.classList.remove("btn-success")
						b1.classList.add("btn-primary")
						b2.classList.add("btn-success")
						b3.classList.add("btn-primary")
						//while (bigcontent.hasChildNodes()) {
							//bigcontent.removeChild(bigcontent.firstChild);
						//}
						bigcontent.replaceChild(await pt.popup_secondbutton(target,OTLG), bigcontent.firstChild)
					});

					let b3 = document.createElement("BUTTON")
					b3.innerHTML = "Related Records"
					b3.classList.add("mdc-button")
					b3.classList.add("mdc-button--dense")
					b3.classList.add("mdc-button--raised")
					b3.classList.add("mdc-ripple-upgraded")
					b3.classList.add("btn-primary")//not highlighted
					b3.addEventListener("click", async function() {
						b1.classList.remove("btn-success")
						b2.classList.remove("btn-success")
						b3.classList.remove("btn-primary")
						b1.classList.add("btn-primary")
						b2.classList.add("btn-primary")
						b3.classList.add("btn-success")
						//while (bigcontent.hasChildNodes()) {
							//bigcontent.removeChild(bigcontent.firstChild);
						//}
						bigcontent.replaceChild(await pt.popup_thirdbutton(OTLG), bigcontent.firstChild)
					});
					libuttons.appendChild(b1) 
					libuttons.appendChild(b2) 
					libuttons.appendChild(b3) 
					//Button section end

					//Initial-state of popup, content section begin.  (Note that the button onclick overwrites everything here.)
					bigcontent.appendChild(await pt.popup_initial_and_firstbutton(target,OTLG))	

				} catch (e) { console.log(e); }
				return bigtab
			},

			//This generates content for the Parcel Popup
			queryParcelforPopup: async function(target) {
				let d = document.createElement("div")
				d.classList.add("div0")

				/* Hack-y bit here */
				/* When you're trying to draw popups for multiple parcels at once, the JSAPI will only send geometry for the first one */
				/* So we're trying to deal with situations of null parcel geometry, and in those cases we just re-use whatever was already there in the previous record */
				/* This code could get weird, in situations where the "top parcel" had no geometry. I don't think that should ever happen. */

				if(target.graphic.geometry == null) {} //If the geometry of the existing feature is null, then don't do anything.  This is hack-y and makes big time assumptions -- that if geometry is null, then that means we are in a secondary feature situation, and there can't be a secondary feature without a primary feature. 
				else {OTLG = target.graphic.geometry} //If the parcel actually has geometry, assume it is the OTLG.  Note that this may not actually be true, but if its false, then that just means the Parcel popup will show the geometry that corresponds to itself.
				try {						
					let pn0 = pt.returnPhotoNode(target.graphic.attributes.REID);
					d.appendChild(await pn0)
				} catch (e) {
					 console.log(e); 
				}

				try {	
					let tmn0 = await pt.returnTabManagerNode(target,OTLG)
					d.appendChild(await tmn0);	//TabManager is does about 90% of the work
				} catch (e) { 
					console.log(e); 
				}

				return d
			},
	
			load_special_popup:function(idfield,idvalue,url,title){
				popq = {}; 
				datefields = ['ISSUE_DATE','A_STATUS_DATE','A_DATE','CO_SIGNOFF_DATE','A_ISSUE_DATE']  //fields that will need to be detected and converted to date format using moment.js
				popq.individual_permit_by_ID = new Query({
				where: idfield + " = '"+idvalue+"'",
				outFields: ["*"]
				});
				return query.executeQueryJSON(url,popq.individual_permit_by_ID)
				.then(function(result) {		   
				popq.attr = result.features[0].attributes;
				popq.contentitem = ""+ 
					"<table class='esri-table'>"+
					"<tbody>"
				for(var i = 0; i < Object.keys(popq.attr).length; i++) {
					if(datefields.includes(Object.keys(popq.attr)[i])){ 
						popq.contentitem = popq.contentitem+
						"<tr><td class='shrink_to_content'>"+Object.keys(popq.attr)[i]+"</td><td class='esri-feature__field-data twenty_percent'>"+moment(Object.values(popq.attr)[i]).format('M/D/YYYY')+"</td></tr>"
					} else {
						popq.contentitem = popq.contentitem+
						"<tr><td class='shrink_to_content'>"+Object.keys(popq.attr)[i]+"</td><td class='esri-feature__field-data eighty_percent'>"+Object.values(popq.attr)[i]+"</td></tr>"
					}
				}
				popq.contentitem = popq.contentitem+
					"</tbody>"+
					"</table>";
				
				document.getElementById("independent_case_popup_content").innerHTML = popq.contentitem;
				document.getElementById("independent-popup-header").innerHTML = title;
				document.getElementById("independent_case_popup").style.zIndex = 51;
				document.getElementById("independent_case_popup").style.visibility = "visible";
				
				var headr = document.getElementById("independent-popup-header");
				var pdf_div_ind = document.createElement("span");
				pdf_div_ind.innerHTML = "Export to PDF";
				pdf_div_ind.style.color = "#63a145";
				pdf_div_ind.style.fontWeight = 700;
				pdf_div_ind.onclick = durm_pdf.parcelpopup_to_pdf;
				pdf_div_ind.style.display = "none";
				headr.appendChild(pdf_div_ind)
				}, function(error){console.log(error)});   
			}//last
    };//end return
});//end define
