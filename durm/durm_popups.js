/*
Matt Reames, 2019
This module controls the default ESRI popup situation
*/
define([
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
	//"esri/rest/support/Query",
	"esri/geometry/geometryEngine",
  "../durm/durm_pdf.js",
	"../durm/durm_drill.js"
], function(QueryTask, Query, geometryEngine, durm_pdf, durm_drill
	) {
		return {
			pre_init: function(){
				try{ 
					pt = this
					addresses_within_parcel_QT = new QueryTask({  url: ADDRESS_FS_URL });
					city_QT = new QueryTask({  url: CITY_BOUNDARY });
					zipcode_QT = new QueryTask({  url: ZIPCODE_SUB });								
					parcelNotificationToolAction = {
						title: "Mailing List Tool",
						id: "open-buffer-tool",
						className: "esri-icon-duplicate"
					};
					durm_drill.init();	
				} catch (e) { console.log(e); }
			},
			post_init: function(){
				try{ 

				} catch (e) { console.log(e); }
			},

			//below here is a lot of new stuff
			returnPhotoNode: function(PARCEL_ID) {
				//This returns an <img> tag as node
				try {
					let i = document.createElement("img")
					i.src = url_for_county_photos +	PARCEL_ID + ".JPG?v=210614"
					i.alt = "Photo of Parcel " + PARCEL_ID + " from Durham County Tax Administration website"
					i.style.width = "100%"
					//i.height = "237"
					//i.width = "342"
					return i
				} catch (e) { console.log(e); }
			},
			returnCityLimitText: async function(OTLG) {
				//returns text "Yes" or "No"
				try {
					let cquery = new Query({
						geometry: OTLG,
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: true,
						spatialRelationship: "intersects"
					});
					let citytxt = "error"
					return city_QT
					.execute(cquery)
					.then(function(result) {
						if (result.features.length == 0) {	citytxt = "No"}
						else {
							try {
								let rawsqft = geometryEngine.geodesicArea(OTLG,"square-feet")	
								if (durm_drill.test_parcel_in_city_pct(result,OTLG,rawsqft) > 2) {	citytxt = "Yes"	}
								else { citytxt = "No"	}
						  } catch (e) { console.log(e); }					
						}
						return citytxt									
					})
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
					return zipcode_QT
					.execute(zquery)
					.then(function(result) {
						zn.innerHTML = result.features[0].attributes.ZIPCODE
						return zn
					});
				} catch (e) { console.log(e); }
			},
			returnOwnerNode:async function(target,OTLG) {
				//This returns an <ul> tag as node
				try {			
					let owndiv = document.createElement("div")
					owndiv.classList.add("ownersection")
					let prquery = new Query({
						outFields: ["*"],
						outSpatialReference: { wkid:102100 },
						returnGeometry: true,
						where: "OBJECTID = '"+target.graphic.attributes.OBJECTID+"'"
					});

					return durm.parcelrecordquerytask
					.execute(prquery)
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
						owl2.innerHTML = result.features[0].attributes.OWNER_NAME
						owl3.innerHTML = result.features[0].attributes.OWNER_ADDR
						owl4.innerHTML = result.features[0].attributes.OWCITY+", "+result.features[0].attributes.OWSTA+" "+result.features[0].attributes.OWZIPA


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
						titr1td1.innerHTML = "Parcel ID"
						titr1td2.innerHTML = result.features[0].attributes.PARCEL_ID

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
						titr4td1.innerHTML = "Land Use"
						titr4td2.innerHTML = result.features[0].attributes.LANDUSE_DESC

						let citr5 = document.createElement("tr")
						cit.appendChild(citr5)
						let titr5td1 = document.createElement("td")
						let titr5td2 = document.createElement("td")
						citr5.appendChild(titr5td1)	
						citr5.appendChild(titr5td2)
						titr5td1.innerHTML = "Subdivision"
						titr5td2.innerHTML = result.features[0].attributes.SUBD_DESC

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
						//titr7td2.innerHTML = result.features[0].attributes.SUM_ACRE + " acres (" + sqftarea + " ft&sup2;)"
												

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
						txl2.innerHTML = "Building: $" + result.features[0].attributes.BLDG_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						txl3.innerHTML = "Land: $"+ result.features[0].attributes.LAND_VALUE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						txl4.innerHTML = "Total: $" + result.features[0].attributes.TOTAL_VALU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

						let taxlink = document.createElement('a')
						taxlink.href = "https://property.spatialest.com/nc/durham/#/property/" + result.features[0].attributes.PARCEL_ID
						taxlink.innerHTML = "Durham County Tax Data"
						taxlink.target = "new"
						txl5.appendChild(taxlink)




						/* Misc Section */
						let mis = document.createElement("ul")
						owndiv.appendChild(mis)

						let mil1 = document.createElement("li")
						let mil2 = document.createElement("li")
						let mil3 = document.createElement("li")
						//let mil4 = document.createElement("li")
						let mil5 = document.createElement("li")
						let mil6 = document.createElement("li")
						let mil7 = document.createElement("li")
						let mil8 = document.createElement("li")
						mis.appendChild(mil1)
						mis.appendChild(mil2)
						mis.appendChild(mil3)
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

						let pictlink = document.createElement('a')
						pictlink.href = "https://community.spatialest.com/nc/durham/pictometry.php?y="+result.features[0].geometry.centroid.latitude+"&x="+result.features[0].geometry.centroid.longitude
						pictlink.innerHTML = "Pictometry Oblique Aerials"
						pictlink.target = "new"
						mil3.appendChild(pictlink)

						let deedlink1 = document.createElement('a')
						mil5.appendChild(deedlink1)
						deedlink1.href = "http://rodweb.co.durham.nc.us/RealEstate/SearchEntry.aspx"
						deedlink1.setAttribute('target', '_blank');
						if(!result.features[0].attributes.DEED_BOOK) {deedlink1.innerHTML = "Deed Book: null (none)"}
						else {deedlink1.innerHTML = "Deed Book: " + result.features[0].attributes.DEED_BOOK.toString().replace(/^0+/, '')}

						let deedlink2 = document.createElement('a')
						mil6.appendChild(deedlink2)
						deedlink2.href = "http://rodweb.co.durham.nc.us/RealEstate/SearchEntry.aspx"
						deedlink2.setAttribute('target', '_blank');
						if(!result.features[0].attributes.DEED_PAGE) {deedlink2.innerHTML = "Deed Page: null (none)"}
						else{ deedlink2.innerHTML = "Deed Page: " + result.features[0].attributes.DEED_PAGE.toString().replace(/^0+/, '')}

						platlink1 = document.createElement('a')
						mil7.appendChild(platlink1)
						platlink1.href = "http://rodweb.co.durham.nc.us/RealEstate/Map/SearchEntry.aspx"
						platlink1.setAttribute('target', '_blank');
						if(!result.features[0].attributes.PLAT_BOOK) { 
							platlink1.innerHTML = "Plat Book: null (none)"
						}
						else {
						platlink1.innerHTML = "Plat Book: " + result.features[0].attributes.PLAT_BOOK.toString().replace(/^0+/, '')
						}

						platlink2 = document.createElement('a')
						mil8.appendChild(platlink2)
						platlink2.href = "http://rodweb.co.durham.nc.us/RealEstate/Map/SearchEntry.aspx"
						platlink2.setAttribute('target', '_blank');
						if(!result.features[0].attributes.PLAT_PAGE) { 
							platlink2.innerHTML = "Plat Page: null (none)"
						 }
						else {
							platlink2.innerHTML = "Plat Page: " + result.features[0].attributes.PLAT_PAGE.toString().replace(/^0+/, '')
						}
						return owndiv
					})
				} catch (e) { console.log(e); }
			},
			returnAddressResultNode: async function(OTLG) {
				//This returns an unordered list ul DOM element 
				try {
					addresses_QT = new QueryTask({  url: ADDRESS_FS_URL });
					let addresspoints_within_parcel_Query = new Query({
						geometry: OTLG,
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: false,
						spatialRelationship: "intersects"
					});				
					// execute the query task
					return addresses_QT
						.execute(addresspoints_within_parcel_Query)
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
						});

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
					return durm_drill.query_parcel_advanced_async(target.graphic.attributes.OBJECTID,OTLG)
				} catch (e) { console.log(e); }
			},
			popup_thirdbutton: async function(OTLG) {
				//This returns DOM Elements that are children of bigcontent
				try {
					return durm_drill.query_parcel_forpermits_async(OTLG)
				} catch (e) { console.log(e); }
			},
			returnTabManagerNode: async function(target,OTLG) {
				//This needs to return a node EVERY TIME.  This is failing for some reason a lot of the time.
				//This returns a div tag as a domnode
				//BUT keep in mind that this div tag includes loads of children, loads of events, etc
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
					let pn0 = pt.returnPhotoNode(target.graphic.attributes.PARCEL_ID);
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

			// This is the popup for Orange and Wake County parcels
			show_special_parcelpopup: function(target) {
					try {			
						/* Note that a lot of this code is duplicated in other places like durm_drill  */		
						let parcelgeometry = target.graphic.geometry
						let result = {};
						result.rawsqft = geometryEngine.geodesicArea(parcelgeometry,"square-feet")
						result.parcel_area_sqft = Math.round(result.rawsqft).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						result.parcel_area_acres = (result.rawsqft * 0.0000229568).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
	
						// At some point, we want to re-work this to see if geometryEngine can be used in lieu of a server request.
						// That day is not today
	
						let points_within_parcel_Query = new Query({
							geometry: parcelgeometry,
							outSpatialReference: { wkid:102100 },
							outFields: ["*"],
							spatialRelationship: "intersects"
						});
	
						let prquery = new Query({
							outFields: ["*"],
							outSpatialReference: { wkid:102100 },
							returnGeometry: true,
							where: "OBJECTID = '"+target.graphic.attributes.OBJECTID+"'"
						});
	
						let zquery = new Query({
							geometry: parcelgeometry,
							outSpatialReference: { wkid:102100 },
							outFields: ["*"],
							returnGeometry: false,
							spatialRelationship: "intersects"
						});
						
						let cquery = new Query({
							geometry: parcelgeometry,
							outSpatialReference: { wkid:102100 },
							outFields: ["*"],
							returnGeometry: true,
							spatialRelationship: "intersects"
						});

						let c=""
						if(target.graphic.layer.id == "wakepars") { 
							console.log("This is in Wake County")
							durm.prt = durm.parcelrecordquerytask_w 
							c = "Wake"
						}
						else if(target.graphic.layer.id == "orangepars") { 
							console.log("This is in Orange County")
							durm.prt = durm.parcelrecordquerytask_o
							c = "Orange"
						}
						else{}
	
						return durm.prt.execute(prquery).then(function(presult) {
							result.parcel = presult
							console.log(presult)
							return addresses_within_parcel_QT.execute(points_within_parcel_Query)
						})
						.then(function(presult) {
							result.addresses = "";
							if (presult.features.length == 0) {}
							else {
								// this sorts alphabetically by SITE_ADDRE
								function compare(a,b) {
									if (a.attributes.SITE_ADDRE < b.attributes.SITE_ADDRE)
									return -1;
									if (a.attributes.SITE_ADDRE > b.attributes.SITE_ADDRE)
									return 1;
									return 0;		
								}
								presult.features.sort(compare);								
								presult.features.forEach(function(ftr) {
									result.addresses = result.addresses + "<li>" + ftr.attributes.SITE_ADDRE + "</li>"
								});
							}
							return zipcode_QT.execute(zquery)
						})
						.then(function(zresult) {
							result.ZIP = "";
							if (zresult.features.length == 0) {}
							else {
								result.ZIP = zresult.features[0].attributes.ZIPCODE;
							}	
							return city_QT.execute(cquery)
						})					
						.then(function(cresult) {
							result.city = "";
							if (cresult.features.length == 0) {
								result.city = "No"
							}
							else {
								// Here we need to test the result to see what % it overlaps the Parcel.
								result.pct = durm_drill.test_parcel_in_city_pct(cresult,target.graphic.geometry,result.rawsqft);
								if (result.pct > 2) {	result.city = "Yes"	}
								else { result.city = "No"	}							
							}											
						})
						.then(function() {
							console.log(result)
							let attr = result.parcel.features[0].attributes
							let geom = result.parcel.features[0].geometry
							let PIN = ""
							if(c=="Wake") {
								console.log(attr)
								PIN = attr.PIN_NUM
							}
							else if(c=="Orange") {
								console.log(attr)
								PIN = attr.PIN
							}
							else {}
							console.log(PIN)
							let parcelpopupcontentdiv = document.createElement("div")
							console.log(parcelpopupcontentdiv)
								
							/* Owner Section */
							let ow = document.createElement("ul")
							parcelpopupcontentdiv.appendChild(ow)
	
							let owl1 = document.createElement("li")
							let owl2 = document.createElement("li")
							let owl3 = document.createElement("li")
							let owl4 = document.createElement("li")
							let owl5 = document.createElement("li")
							ow.appendChild(owl1)
							ow.appendChild(owl2)
							ow.appendChild(owl3)
							ow.appendChild(owl4)
							ow.appendChild(owl5)
							owl1.innerHTML = "Owner Address"
							owl1.style.fontWeight = "700"
							owl2.innerHTML = attr.OWNER
							owl3.innerHTML = attr.ADDR1
							owl4.innerHTML = attr.ADDR2
							owl5.innerHTML = attr.ADDR3
	
							/* Core Info */
							let ci = document.createElement("ul")
							parcelpopupcontentdiv.appendChild(ci)
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
							titr1td1.innerHTML = "PIN"
							titr1td2.innerHTML = PIN

							let citr2 = document.createElement("tr")
							cit.appendChild(citr2)
							let titr2td1 = document.createElement("td")						
							let titr2td2 = document.createElement("td")
							citr2.appendChild(titr2td1)
							citr2.appendChild(titr2td2)
							titr2td1.innerHTML = "County"
							titr2td2.innerHTML = c
	
							let citr3 = document.createElement("tr")
							cit.appendChild(citr3)
							let titr3td1 = document.createElement("td")						
							let titr3td2 = document.createElement("td")
							citr3.appendChild(titr3td1)
							citr3.appendChild(titr3td2)
							titr3td1.innerHTML = "In City of Durham?"
							titr3td2.innerHTML = result.city													
	
	
							/* Misc Section */
							/* ok, i know, there was probably a more elegant way to do this */
							let mis = document.createElement("ul")
							parcelpopupcontentdiv.appendChild(mis)
	
							let mil1 = document.createElement("li")
							let mil2 = document.createElement("li")
							let mil3 = document.createElement("li")
							let mil4 = document.createElement("li")
							let mil5 = document.createElement("li")
							let mil6 = document.createElement("li")
							let mil7 = document.createElement("li")
							let mil8 = document.createElement("li")
							mis.appendChild(mil1)
							mis.appendChild(mil2)
							mis.appendChild(mil3)
							mis.appendChild(mil4)
							mis.appendChild(mil5)
							//mis.appendChild(mil6)
							//mis.appendChild(mil7)
							//mis.appendChild(mil8)
							mil1.innerHTML = "Miscellaneous"
							mil1.style.fontWeight = "700"						
							let gmlink = document.createElement('a')
							gmlink.href = "https://www.google.com/maps/@"+(geom.centroid.latitude-0.0006721930485)+","+(geom.centroid.longitude-0.0000196467158)+",68a,35y,49.52t/data=!3m1!1e3"
							gmlink.innerHTML = "Google Earth / Streetview"
							gmlink.target = "new"
							mil2.appendChild(gmlink)

							let pictlink = document.createElement('a')
							pictlink.href = "https://community.spatialest.com/nc/durham/pictometry.php?y="+geom.centroid.latitude+"&x="+geom.centroid.longitude
							pictlink.innerHTML = "Pictometry Oblique Aerials"
							pictlink.target = "new"
							mil5.appendChild(pictlink)		

							mil3.innerHTML = result.parcel_area_acres + " acres (" + result.parcel_area_sqft + " ft&sup2;)"
							mil4.innerHTML = "ZIP Code: " + attr.ZIPNUM
	
							/* Addresses Section */
							let ad = document.createElement("ul")
							parcelpopupcontentdiv.appendChild(ad)
							let adl = document.createElement("li")
							adl.style.fontWeight = "700"
							ad.appendChild(adl)
							adl.innerHTML = "Addresses on Parcel"
							console.log(result.addresses)
							ad.appendChild(result.addresses)
	
							return parcelpopupcontentdiv;
						});			
					} catch (e) { console.log(e); }
			},
			
			load_case_popup:function(caseid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: ALL_DEV_CASES });	 
				popupquery.individual_case_by_ID = new Query({
				where: "A_NUMBER = '"+caseid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_case_by_ID)
				.then(function(result) {		   
				popupquery.case1 = result.features[0].attributes;
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='List of attributes and values'>"+
					"<tbody>"+
					"<tr><td class='shrink_to_content'>Case Number</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_NUMBER + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Status</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.AppStatus + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Last Status Update</td><td class='esri-feature__field-data esri-feature__field-data--date'>" + moment(popupquery.case1.A_STATUS_DATE).format('M/D/YYYY') + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Application Date</td><td class='esri-feature__field-data esri-feature__field-data--date'>" + moment(popupquery.case1.A_DATE).format('M/D/YYYY') + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Case Title</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_PROJECT_NAME + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Case Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.AppType + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Case Description</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_DESCRIPTION + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Case Planner</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.CasePlanner + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Case Planner EMail</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.EMAIL + "</td></tr>"+
					"</tbody>"+
					"</table>";
				
				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Development Case";
				document.getElementById("independent_case_popup").style.zIndex = 51;
				document.getElementById("independent_case_popup").style.visibility = "visible";
				});	    
			},
			load_bldgpermit_popup:function(permitid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: ACTV_BLDG_PERMITS_URL_SUBLAYER });	 
				popupquery.individual_permit_by_ID = new Query({
				where: "Permit_ID = '"+permitid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_permit_by_ID)
				.then(function(result) {		   
				popupquery.case1 = result.features[0].attributes;

				let m0 = ""
				let ks = Object.entries(popupquery.case1)
				for (k of ks) {
					m0 = m0 + "<tr><td class='shrink_to_content'>" + k[0] + "</td><td class='esri-feature__field-data eighty_percent'>" + k[1] + "</td></tr>"
				}
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='Permit Record'>"+
					"<tbody>"+
					m0 +
					"</tbody>"+
					"</table>";		

				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Active Building Permit";
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
				});		   
			},
			load_mechpermit_popup:function(permitid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: ACTV_MECH_PERMITS_URL_SUBLAYER });	 
				popupquery.individual_permit_by_ID = new Query({
				where: "Permit_ID = '"+permitid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_permit_by_ID)
				.then(function(result) {
				let m0 = ""
				let ks = Object.entries(result.features[0].attributes)
				for (k of ks) {
					m0 = m0 + "<tr><td class='shrink_to_content'>" + k[0] + "</td><td class='esri-feature__field-data eighty_percent'>" + k[1] + "</td></tr>"
				}
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='Permit Record'>"+
					"<tbody>"+
					m0 +
					"</tbody>"+
					"</table>";		

				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Active Mechanical Permit";
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
				});		   
			},
			load_tradepermit_popup:function(permitid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: ALL_BI_TRADE_PERMITS });	 
				popupquery.individual_permit_by_ID = new Query({
				where: "A_NUMBER = '"+permitid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_permit_by_ID)
				.then(function(result) {		   
				popupquery.case1 = result.features[0].attributes;
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='Permit Record'>"+
					"<tbody>"+
					"<tr><td class='shrink_to_content'>Permit Number</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_NUMBER + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_TYPE + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Building Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.BLD_Type + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Status</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_STATUS + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Status Date</td><td class='esri-feature__field-data eighty_percent'>" + moment(popupquery.case1.A_STATUS_DATE).format('M/D/YYYY') + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Issue Date</td><td class='esri-feature__field-data esri-feature__field-data--date'>" + moment(popupquery.case1.A_ISSUE_DATE).format('M/D/YYYY') + "</td></tr>"+					"<tr><td class='shrink_to_content'>Project Name</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PROJECT_NAME + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Comments</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_COMMENTS + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Description</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_DESCRIPTION + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Project Name</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_PROJECT_NAME + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Project Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.A_PROJECT_TYPE + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Total Fee</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.TotalFee + "</td></tr>"+
					"<tr><td class='shrink_to_content'>PID</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.P_PID + "</td></tr>"+
					"</tbody>"+
					"</table>";
				
				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Trade Permit";
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
				});		   
			},
			load_plumpermit_popup:function(permitid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: ACTV_PLUMB_PERMITS_URL_SUBLAYER });	 
				popupquery.individual_permit_by_ID = new Query({
				where: "Permit_ID = '"+permitid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_permit_by_ID)
				.then(function(result) {		   
				popupquery.case1 = result.features[0].attributes;
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='Permit Record'>"+
					"<tbody>"+
					"<tr><td class='shrink_to_content'>Permit Number</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.Permit_ID + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Site Address</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.SiteAdd + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Parcel ID</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PID + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.P_Type + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Status</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.P_Status + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Description</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.P_Descript + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Project Activity</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.P_Activity + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Plumbing District</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PLUMB_DIST + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Plumbing Inspector</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PLUMB_INSP + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Plumbing Inspector Phone</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PLUMB_PH + "</td></tr>"+
					"<tr><td class='shrink_to_content'>In City</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.In_CIty + "</td></tr>"+
					"<tr><td class='shrink_to_content'>In County</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.In_County + "</td></tr>"+
					"</tbody>"+
					"</table>";
				
				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Plumbing Permit";
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
				});		   
			},
			load_permit_popup:function(permitid){
				popupquery = {};
				popupquery.independent_popup_QT = new QueryTask({ url: BUILDING_PERMITS_SUBLAYER });	 
				popupquery.individual_permit_by_ID = new Query({
				where: "PermitNum = '"+permitid+"'",
				outFields: ["*"]
				});
				return popupquery.independent_popup_QT.execute(popupquery.individual_permit_by_ID)
				.then(function(result) {		   
				popupquery.case1 = result.features[0].attributes;
				popupquery.contentitem = ""+ 
					"<table class='esri-table' summary='Permit Record'>"+
					"<tbody>"+
					"<tr><td class='shrink_to_content'>Permit Number</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PermitNum + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Activity</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.BLDB_ACTIVITY_1 + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Building Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.BLD_Type + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Occupancy</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.Occupancy + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Status</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PmtStatus + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Issue Date</td><td class='esri-feature__field-data esri-feature__field-data--date'>" + moment(popupquery.case1.ISSUE_DATE).format('M/D/YYYY') + "</td></tr>"+
					"<tr><td class='shrink_to_content'>CO Signoff Date</td><td class='esri-feature__field-data esri-feature__field-data--date'>" + moment(popupquery.case1.CO_SIGNOFF_DATE).format('M/D/YYYY') + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Project Name</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PROJECT_NAME + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Project Type</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.PROJECT_TYPE + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Description</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.DESCRIPTION + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Comments</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.COMMENTS + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Land Area (ft&sup2;)</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.SQFT_LAND + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Floor Area (ft&sup2;)</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.SQFT_FLOOR + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Building Cost</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.BLD_Cost + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Estimated Electrical Cost</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.ESTIMATED_ELEC_COST + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Estimated Mechanical Cost</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.ESTIMATED_MECH_COST + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Estimated Other Cost</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.ESTIMATED_OTH_COST + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Total Rooms</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.TOTAL_ROOMS + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Dwelling Units</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.DWELLING_UNITS + "</td></tr>"+
					"<tr><td class='shrink_to_content'>Parking</td><td class='esri-feature__field-data eighty_percent'>" + popupquery.case1.NO_PARKING + "</td></tr>"+
					"</tbody>"+
					"</table>";
				
				document.getElementById("independent_case_popup_content").innerHTML = popupquery.contentitem;
				document.getElementById("independent-popup-header").innerHTML = "Building Permit";
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
				});		   
			}//last
    };//end return
});//end define
