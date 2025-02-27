 /*
Matt Reames, 2019-
This module handles the logic of the advanced parcel popup
*/
 define([
	  //"esri/tasks/QueryTask",
		//"esri/tasks/support/Query",
		"esri/rest/query", "esri/rest/support/Query",
		"../durm/durm_pdf.js",
		"esri/geometry/geometryEngine"
	], function(//QueryTask, 
	query, Query,
	durm_pdf,
	geometryEngine
    ) {
    return {
		print_VAD_results: function(results,rtitle,popup_ul,popup_ul_nonoverlaps) {
			try {

				if (results.features && results.features.length > 0) {
					console.log("The FeatureSet has features:", results.features);
					let finalresult = [
						{ keycode: "Within a half mile" }
					  ];
					drillscope.add_results_to_popup_tablestyle(rtitle,finalresult,popup_ul);
				  } 
				else {
					console.log("The FeatureSet is empty.");
					drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);
				}
			} catch (e) { console.log(e); }
		},
		print_VAD_resultsold: function(results,rtitle,popup_ul,popup_ul_nonoverlaps) {
			try {
				if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
				else {		
					console.log(results)	
															
					let finalresult = [
						{ keycode: "Within a half mile" }
					  ];
					if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
					else {drillscope.add_results_to_popup_tablestyle(rtitle,finalresult,popup_ul);	}
				}			
			} catch (e) { console.log(e); }
		},
		print_pct_results: function(results,rtitle,single_keycode,popup_ul,popup_ul_nonoverlaps) {
			try {
				if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
				else {						
					let polys_that_actually_intersect = [];	
					results.features.forEach(function(r) {
						var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
						if (geom) {
							var acres = geometryEngine.geodesicArea(geom, 109402);
							var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);
							var kc = r.attributes[single_keycode];
							if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:kc,geom:geom,acres:acres}); }								
							}				
					});								
					finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
					if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
					else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
				}			
			} catch (e) { console.log(e); }
		},

		add_nonoverlapping_item: function(layername,popup_ul_nonoverlaps){
			try {
			let popup_li_nonoverlapitem = document.createElement("li");
			popup_li_nonoverlapitem.className = "drilltableitem";
			popup_li_nonoverlapitem.innerHTML = layername;
			popup_ul_nonoverlaps.appendChild(popup_li_nonoverlapitem)
			} catch (e) { console.log(e); }
		},


		// Style 1 --  Add item as a bunch of <tr></tr> ,  with no acreage or % listed.
		add_results_to_popup_tablestyle: function(rtitle,finalresult,popup_ul){
			try {			
			let popup_li_DLI = document.createElement("li");
			popup_li_DLI.className="drillListItem";
			let popup_header = document.createElement("h4");
			popup_header.innerHTML = rtitle;   
			popup_li_DLI.appendChild(popup_header)
			popup_ul.appendChild(popup_li_DLI)			
			let popup_ul_table =  document.createElement("ul");
			popup_li_DLI.appendChild(popup_ul_table)
			finalresult.forEach(function(r) {
				let popup_li_table =  document.createElement("li");
				popup_li_table.className = "drilltableitem";
				popup_li_table.innerHTML = "<table>"+r.keycode+"</table>";
				popup_ul_table.appendChild(popup_li_table)					
			});
			} catch (e) { console.log(e); }
		},
		// Style 2 ,  shows acreage.  Useful for wetlands/flood zones 
		add_acrage_results_to_popup: function(rtitle,finalresult,popup_ul){
			try {			
			let popup_li_DLI = document.createElement("li");
			popup_li_DLI.className="drillListItem";
			let popup_header = document.createElement("h4");
			popup_header.innerHTML = rtitle;   
			popup_li_DLI.appendChild(popup_header)
			popup_ul.appendChild(popup_li_DLI)						
			let popup_ul_table =  document.createElement("ul");
			popup_li_DLI.appendChild(popup_ul_table)
			finalresult.forEach(function(r) {
				let popup_li_table =  document.createElement("li");
				popup_li_table.className = "drilltableitem";
				popup_li_table.innerHTML = r.keycode+", " + Math.round(r.acres*1000)/1000 + " acres";
				popup_ul_table.appendChild(popup_li_table)						
			});
			} catch (e) { console.log(e); }
		},
		// Style 3 , shows %.  This is useful if you expect full coverage of a parcel
		add_pct_results_to_popup: function(rtitle,finalresult,popup_ul){
			try {			
			let popup_li_DLI = document.createElement("li");
			popup_li_DLI.className="drillListItem";
			let popup_header = document.createElement("h4");
			popup_header.innerHTML = rtitle;
			popup_li_DLI.appendChild(popup_header)
			popup_ul.appendChild(popup_li_DLI)		
			let popup_ul_table =  document.createElement("ul");
			popup_li_DLI.appendChild(popup_ul_table)
			finalresult.forEach(function(r) {
				let popup_li_table =  document.createElement("li");
				let pct = Math.round((r.acres / advquery.parcel_acres)*100.0);
				if (pct === 0) { 
					pct = "<1"; 
				}
				let pct_string = " ("+ pct + "%)";
				if (pct === 100) {
					pct_string = "";
				}
				popup_li_table.className = "drilltableitem";
				popup_li_table.innerHTML = "<table><tr><td>"+r.keycode + pct_string +"</td></tr></table>";
				popup_ul_table.appendChild(popup_li_table)		
			});
			} catch (e) { console.log(e); }
		},				
		build_list_of_results_by_acreage: function(polys_that_actually_intersect){
			try {
			//get list of all codes	
			code_summary = [];
			polys_that_actually_intersect.forEach(function(p) {						
				if (code_summary.includes(p.keycode)) {}
				else { code_summary.push(p.keycode); }
			});						
			final_list = [];
			code_summary.forEach(function(p) {
				var acreage_per_code = 0;
				polys_that_actually_intersect.forEach(function(r2) {
					if( p == r2.keycode ){
						acreage_per_code = acreage_per_code + r2.acres;								
					}
				});
				final_list.push({keycode:p,acres:acreage_per_code});
			});								
			var bySize = final_list.slice(0);							
			bySize.sort(function(a,b) {
				return b.acres - a.acres;
			});
			return bySize;
			} catch (e) { console.log(e); }
		},
      	query_parcel_advanced_async: function(OBJECTID_1,OTLG){
				try {
				 //this returns a DOM node 'popup_div_container'
				 	document.getElementById("bodycontainer").style.cursor = "progress";
				 	document.getElementById("mapViewDiv").style.cursor = "progress";
					advquery = {};
	
					drillscope = this;
					let popup_div_container = document.createElement("div"); 
					popup_div_container.id = "drill_list";
	
					let pdf_div = document.createElement("span");
					pdf_div.innerHTML = "Export to PDF";
					pdf_div.style.marginLeft = "5px";
					pdf_div.style.color = "#63a145";
					pdf_div.style.fontWeight = 700;
					pdf_div.onclick = durm_pdf.parcelpopup_to_pdf;
					pdf_div.style.display = "none";
					popup_div_container.appendChild(pdf_div)
					
					let popup_ul =  document.createElement("ul");
					popup_ul.id = "drill_list_ul";
					popup_div_container.appendChild(popup_ul)

					let popup_ul2 =  document.createElement("ul");
					popup_ul2.id = "drill_footer_ul";					
					popup_div_container.appendChild(popup_ul2)
					
					
					let popup_li_nonoverlap = document.createElement("li");
					popup_li_nonoverlap.className = "drillListItem";
					let popup_header_nonoverlap = document.createElement("h4");
					popup_header_nonoverlap.innerHTML = "Layers that did not overlap";	  
					popup_li_nonoverlap.appendChild(popup_header_nonoverlap)
					let popup_ul_nonoverlaps = document.createElement("ul");
					popup_ul_nonoverlaps.id = "nonoverlaps";			  
					popup_ul_nonoverlaps.style.listStyleType = "none";
					popup_li_nonoverlap.appendChild(popup_ul_nonoverlaps)
					popup_ul2.appendChild(popup_li_nonoverlap)
					
					advquery.target = durm.mapView.popup.selectedFeature; //durm.mapView.popup.selectedFeature is a pointer to the currently selected feature displayed in the popup.  It FREQUENTLY has no geometry, and attribution can be spotty as well.
					advquery.OTLG = OTLG //OTLG is the original top-level geometry.  This is needed because Esri's popups do not obtain/retain geometry for second-level items

					try {	
						advquery.parcel_acres = geometryEngine.geodesicArea(advquery.OTLG, 109402);		  
					} catch (e) { console.log(e); }

					advquery.PARCEL_INTERSECT_QUERY_VAD = new Query({ 
						geometry: advquery.OTLG, 
						outFields: ["*"], 
						returnGeometry: false, 
						spatialRelationship: "intersects" 
					});
	
					advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY = new Query({ 
						geometry: advquery.OTLG, 
						outFields: ["*"], 
						returnGeometry: true, 
						outSpatialReference: { wkid:102100 }, 
						spatialRelationship: "intersects" }
						);	
					advquery.PARCEL_INTERSECT_QUERY = new Query({ geometry: advquery.OTLG, outFields: ["*"], outSpatialReference: { wkid:102100 }, spatialRelationship: "intersects" });	
					
					let popup_li_parcel =  document.createElement("li");
					popup_li_parcel.className = "drillListItem";
					let prquery = new Query({
						outSpatialReference: { wkid:102100 },
						outFields: ["*"],
						returnGeometry: true,
						where: "OBJECTID_1 = '"+OBJECTID_1+"'"
					});

					query.executeQueryJSON(PARCELS_AGOL,prquery)
					.catch(function(error){
						if(error.name="request:server") {
							console.log("Server Error")
							console.log(error)
						}
						else {
							console.log("Error message: ", error.message);
							console.log(error)
						}
					})
					.then(function (result) {
						let attr = result.features[0].attributes;	
						popup_li_parcel.innerHTML = "<h4>Parcel Record</h4><table class='drilltablerecord'><tr><td>REID</td><td>" + attr.REID + "</td></tr>" +
						"<tr><td>PIN</td><td>" + attr.PIN + "</td></tr><tr><td>Deeded Acres</td><td>" + attr.DEEDED_ACRES + "</td></tr>" +
						"<tr><td>Property Owner</td><td>" + attr.PROPERTY_OWNER + "</td></tr>"+
						"<tr><td>Location Address</td><td>" + attr.LOCATION_ADDR + "</td></tr></table>";
						popup_ul.appendChild(popup_li_parcel)
						return query.executeQueryJSON(ZONINGURL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)						
					})
					.catch(function(error){
						if(error.name="request:server") {
							console.log("Server Error")
							console.log(error)
						}
						else {
							console.log("Error message: ", error.message);
							console.log(error)
						}
					})
					.then(function(results) {
						try {
							let rtitle = "Zoning";	
							if (results.length == 0) {
								drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);
							}
							else {
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);	
										var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);
										if (r.attributes.CASE_NO === undefined) {
											r.attributes.CASE_NO = "N/A"
										}
										else if (r.attributes.CASE_NO === " ") {
											r.attributes.CASE_NO = "N/A"
										}
										else if (r.attributes.CASE_NO === "  ") {
											r.attributes.CASE_NO = "N/A"
										}
										else if (r.attributes.CASE_NO === "") {
											r.attributes.CASE_NO = "N/A"
										}
										else {}
	
										if(r.attributes.CASE_NO === "N/A"){
											if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.UDO_LABEL,geom:geom,acres:acres}); }
											else{}
										}
										else {
											if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.UDO_LABEL+", Case: "+r.attributes.CASE_NO,geom:geom,acres:acres}); }
											else{}
										}									
									}
									else {}						
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }
						return query.executeQueryJSON(NEW_PLACETYPE_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					})
					.catch(function(error){
						if(error.name="request:server") {
							console.log("Server Error")
							console.log(error)
						}
						else {
							console.log("Error message: ", error.message);
							console.log(error)
						}
					})					
					.then(function(results) {
						try {
							var rtitle = "Place Type";					
							if (results.length == 0) {
								drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);
							}
							else {
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);	
										var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);
										if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.PlaceTypeName,geom:geom,acres:acres}); }
										}
									else {}						
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }		
					})					
					.catch(function(error){
						if(error.name="request:server") {
							console.log("Server Error")
							console.log(error)
						}
						else {
							console.log("Error message: ", error.message);
							console.log(error)
						}
					});

					durm.generic_items = [
						{url:TAX_DISTRICTS_URL_SUBLAYER,genericfield:["Tax District","DESCRIP"]},
						{url:DEVELOPMENT_TIERS_URL_SUBLAYER, genericfield:["Development Tier","NAME"]},
						{url:WATERSHEDS_URL_SUBLAYER, genericfield:["Stormwater Regulatory Basin (Watershed)","BASIN"]},
						{url:WATERSHED_PROTECTION_URL_SUBLAYER, genericfield:["Watershed Protection Overlay","NAME"]},
						{url:SEWERSHEDS_SUBLAYER, genericfield:["Sewer Basin","OPERATIONALAREA"]},
						{url:STREETS_IMPACT_FEE_ZONES, genericfield:["Streets Impact Fee Zone","RoadsZone"]},
						{url:PARKS_IMPACT_FEE_ZONES, genericfield:["Parks and Recreation Facility Impact Fee Zone","ZONENAME"]},
						{url:OPENSPACEIMPACTFEEZONE_URL, genericfield:["Open Space Land Impact Fee Zone","REC_PAYMENT_ZONE"]},
						{url:SOILS_URL_SUBLAYER, genericfield:["Soils","DSL_NAME"]},
					]
					for(var i = 0; i < durm.generic_items.length; i++){
						let n = durm.generic_items[i]
						query
						.executeQueryJSON(n.url,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
						.catch(function(error){
							if(error.name="request:server") {
								console.log("Server Error")
								console.log(error)
							}
							else {
								console.log("Error message: ", error.message);
								console.log(error)
							}
						})
						.then(function(results) {
							try {
							drillscope.print_pct_results(results,n.genericfield[0],n.genericfield[1],popup_ul,popup_ul_nonoverlaps);
							} catch (e) { console.log(e); }	
						});
					}

					//NWI
					// acres
					query
					.executeQueryJSON(NWI_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
							var rtitle = "National Wetland Inventory";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {					
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);							
										if (acres > 0.00001) { polys_that_actually_intersect.push({keycode:r.attributes.ATTRIBUTE,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_acrage_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }
					});
					query
					.executeQueryJSON(FIRM2018I_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
							var rtitle = "Flood Zones 2018 (for insurance purposes)";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {						
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {	
										var acres = geometryEngine.geodesicArea(geom, 109402);							
										if (acres > 0.00001) { polys_that_actually_intersect.push({keycode:r.attributes.ZoneCode,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_acrage_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }
					});
					// acres
					query
					.executeQueryJSON(FIRM2018D_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
							var rtitle = "Flood Zones 2018 (for development purposes)";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {						
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);							
										if (acres > 0.00001) { polys_that_actually_intersect.push({keycode:r.attributes.ZoneCode,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_acrage_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }
					});

					//CENSUSBLOCK2010
					// acres -- also table
					query
					.executeQueryJSON(CENSUSBLOCK2010_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try{
							var rtitle = "Census Blocks 2010";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {						
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);
										var keycodetablerow = "<tr><td>Block Name</td><td>"+r.attributes.NAME10+"</td></tr><tr><td>Tract</td><td>"+r.attributes.TRACTCE10+"</td></tr><tr><td>Population</td><td>"+r.attributes.POP+"</td></tr><tr><td>Dwelling Units</td><td>"+r.attributes.TOT_DU+"</td></tr>"								
										if (acres > 0.02) { polys_that_actually_intersect.push({keycode:keycodetablerow,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_results_to_popup_tablestyle(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }				
						});		
					//Unioned Trade Areas
					// by acres -- also table
					query
					.executeQueryJSON(UTA_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try{
							var rtitle = "Trade Inspectors";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {						
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);
										var keycodetablerow = "<tr><td>Building</td><td>"+r.attributes.BDMAPTITLE+"</td></tr><tr><td>Electrical</td><td>"+r.attributes.ELMAPTITLE+"</td></tr><tr><td>Mechanical</td><td>"+r.attributes.MCMAPTITLE+"</td></tr><tr><td>Plumbing</td><td>"+r.attributes.PBMAPTITLE+"</td></tr><tr><td>Multitrade</td><td>"+r.attributes.MLMAPTITLE+"</td></tr><tr><td>Cross Connection</td><td>"+r.attributes.CCMAPTITLE+"</td></tr>"								
										if (acres > 0.02) { polys_that_actually_intersect.push({keycode:keycodetablerow,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_results_to_popup_tablestyle(rtitle,finalresult,popup_ul);	}
							}
						} catch (e) { console.log(e); }					
					});

					query
					.executeQueryJSON(LTHG_URL,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
							try {
							var rtitle = "Longtime Homeowner Grant Assistance Area";
							if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
							else {						
								let polys_that_actually_intersect = [];	
								results.features.forEach(function(r) {
									var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
									if (geom) {								
										var acres = geometryEngine.geodesicArea(geom, 109402);		
										var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);									
										if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.LHG_AssistanceArea,geom:geom,acres:acres}); }
										}				
								});								
								finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
								if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
								else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
							}
							} catch (e) { console.log(e); }
							return		
					});
					//National Historic Districts % complicated keycode
					query
					.executeQueryJSON(NATL_HIST_DISTRICTS_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
						var rtitle = "National Historic Districts";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {							
									var acres = geometryEngine.geodesicArea(geom, 109402);		
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);									
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:"<a target='_blank' href='"+r.attributes.LinkPath+"'>"+r.attributes.SITE_NAME+"</a>, "+r.attributes.NRType+", Listed "+r.attributes.YearListed,geom:geom,acres:acres}); }
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return		
						});			
					//LHD % complicated keycode
					query
					.executeQueryJSON(LHD_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try{
						var rtitle = "Local Historic Districts";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {								
									var acres = geometryEngine.geodesicArea(geom, 109402);	
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);								
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.NAME+", Adopted "+moment(r.attributes.DATEADOPTED).format('M/D/YYYY'),geom:geom,acres:acres}); }								
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return		
						});
					//NPO %,  complicated keycode
					query
					.executeQueryJSON(NPO_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
						var rtitle = "Neighborhood Protection Overlay";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {								
									var acres = geometryEngine.geodesicArea(geom, 109402);
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);								
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:r.attributes.NPO_NAME+", Adopted "+moment(r.attributes.ADOPTED).format('M/D/YYYY'),geom:geom,acres:acres}); }
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return	
						});
					// Local Historic Landmark %, complicated keycode
					query
					.executeQueryJSON(LOCAL_HIST_LANDMARKS_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
						var rtitle = "Local Historic Landmarks";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {								
									var acres = geometryEngine.geodesicArea(geom, 109402);
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);	
									var kc = "<a href='"+r.attributes.ORDURL+"' target='_blank'>" + r.attributes.CASENO + "</a>, " + r.attributes.NAME;
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:kc,geom:geom,acres:acres}); }								
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return		
						});
					query
					.executeQueryJSON(CITYSEWERDRAIN2COUNTY,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
						var rtitle = "City Sewer Drain to County (County 80% Sewer Area)";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {								
									var acres = geometryEngine.geodesicArea(geom, 109402);
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);	
									var kc = r.attributes.NAME;
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:kc,geom:geom,acres:acres}); }								
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_pct_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return		
						});
					//RTP %
					query
					.executeQueryJSON(RTP_BOUNDARY_URL,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY)
					.then(function(results) {
						try {
						drillscope.print_pct_results(results,"Research Triangle Park","RTP_COVENA",popup_ul,popup_ul_nonoverlaps);
						} catch (e) { console.log(e); }	
						return query.executeQueryJSON(AIRPORT_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY);		
						})
					//Airport Overlay %
					.then(function(results) {
						try {
						drillscope.print_pct_results(results,"Airport Overlay","AIRPORT",popup_ul,popup_ul_nonoverlaps);
						} catch (e) { console.log(e); }
						return query.executeQueryJSON(MAJOR_TRANSPORTATION_CORRIDOR_URL,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY);		
						})
					//Major Transportation Corridor %
					.then(function(results) {
						try {
						drillscope.print_pct_results(results,"Major Transportation Corridor","MTC",popup_ul,popup_ul_nonoverlaps);
						} catch (e) { console.log(e); }
						return query.executeQueryJSON(SWM_VAD,advquery.PARCEL_INTERSECT_QUERY_VAD);		
						})	
					//Voluntary Agricultural Districts
					.then(function(results) {
						try {
						drillscope.print_VAD_results(results,"Proximity to a Voluntary Agricultural District",popup_ul,popup_ul_nonoverlaps);
						} catch (e) { console.log(e); }
						return query.executeQueryJSON(TRANSITIONAL_OFFICE_OVERLAY_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY);		
						})	
					//Transitional Office Overlay
					//acres
					.then(function(results) {
						try {
						var rtitle = "Transitional Office Overlay";
						if (results.length == 0) {drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);}
						else {						
							let polys_that_actually_intersect = [];	
							results.features.forEach(function(r) {
								var geom = geometryEngine.intersect(advquery.OTLG,r.geometry);
								if (geom) {								
									var acres = geometryEngine.geodesicArea(geom, 109402);
									var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);	
									var kc = r.attributes.CASE_NO;
									if(r.attributes.CITY_COUNCIL_DATE == null) {kc = kc + ", No approval by City Council";}
									else {kc = kc + ", Approved by City Council on "+moment(r.attributes.CITY_COUNCIL_DATE).format('M/D/YYYY')}
									if(r.attributes.BOC_DATE == null) {kc = kc + ", No approval by Board of Commissioners";}
									else {kc = kc + ", Approved by Board of Commissioners on "+moment(r.attributes.CITY_COUNCIL_DATE).format('M/D/YYYY')}
									if (pct_of_parcel > 1) { polys_that_actually_intersect.push({keycode:kc,geom:geom,acres:acres}); }								
									}				
							});								
							finalresult = drillscope.build_list_of_results_by_acreage(polys_that_actually_intersect);
							if (finalresult.length == 0) { drillscope.add_nonoverlapping_item(rtitle,popup_ul_nonoverlaps);	}
							else {drillscope.add_acrage_results_to_popup(rtitle,finalresult,popup_ul);	}
						}
						} catch (e) { console.log(e); }
						return;
						})						
					.then(function(server_results) {
						try {
							pdf_div.style.display = "inline";
						} catch (e) { console.log(e); }
					});	

					return popup_div_container;
				} catch (e) { console.log(e); }
					/*			  
					TO DO (maybe):
					----
					Urban Growth boundary  
					Township (type)
					primary fire district,  ?
					county water sewer customer area ?
					*/		  
		},

		/* Permit 'drill' starts here ---- */
		query_parcel_forpermits_async: async function(OTLG) {
			try {	
				document.getElementById("bodycontainer").style.cursor = "progress";
				document.getElementById("mapViewDiv").style.cursor = "progress";
				advquery = {};
				permitscope = this;
				
				let popup_div_container = document.createElement("div"); 
				popup_div_container.id = "permits_container";
				let drill_popup_ul =  document.createElement("ul");
				popup_div_container.id = "permits_list";

				popup_div_container.appendChild(drill_popup_ul)

				advquery.target = durm.mapView.popup.selectedFeature;
				advquery.OTLG = OTLG //OTLG is the original top-level geometry.  This is needed because Esri's popups do not obtain/retain geometry for second-level items
				advquery.parcel_acres = geometryEngine.geodesicArea(advquery.OTLG, 109402);	


				//Spatial Queries a layer to see if it intersects geometrically with a given parcel geometry
				//Answer does return geometry 
				advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY_DEVCASE_SORT = new Query({ 
					geometry: advquery.OTLG, 
					outFields: ["*"], 
					returnGeometry: true, 
					spatialRelationship: "intersects",
					orderByFields: ["A_DATE DESC"]
				});	
				//Spatial Queries a layer to see if it intersects geometrically with a given parcel geometry
				//Answer does NOT return geometry 
				advquery.PARCEL_INTERSECT_QUERY = new Query({ 
					geometry: advquery.OTLG, 
					outFields: ["*"], 
					returnGeometry: false, 
					spatialRelationship: "intersects" 
				});

				advquery.PARCEL_INTERSECT_QUERY_BY_PERMIT_ID = new Query({ 
					geometry: advquery.OTLG, 
					outFields: ["*"], 
					returnGeometry: false, 
					spatialRelationship: "intersects",
					orderByFields: ["Permit_ID DESC"]
				});

				advquery.PARCEL_INTERSECT_QUERY_BUILDINGPERMITSSORT = new Query({ 
					geometry: advquery.OTLG, 
					outFields: ["*"], 
					returnGeometry: false, 
					spatialRelationship: "intersects",
					orderByFields: ["PermitNum DESC"]
				});

				advquery.PARCEL_INTERSECT_QUERY_CROSSCONNECT = new Query({ 
					geometry: advquery.OTLG, 
					outFields: ["*"], 
					returnGeometry: false, 
					spatialRelationship: "intersects",
					orderByFields: ["A_NUMBER DESC"]
				});


				//Queries parcel records by P_PID, doesn't return geometry
				advquery.PPID_QUERY_TRADEPERMITS = new Query({
					where: "P_PID = '"+advquery.target.attributes.REID+"'",
					outFields: ["*"],
					returnGeometry:false,
					orderByFields: ["A_NUMBER DESC"]
				});

				//Queries parcel records by REID, doesn't return geometry
				advquery.REID_QUERY = new Query({
					where: "REID = '"+advquery.target.attributes.REID+"'",
					outFields: ["*"],
					returnGeometry:false
				});		

				//Queries parcel records by REID, doesn't return geometry
				advquery.PARCELID_QUERY_COs = new Query({
					where: "PARCEL_ID = '"+advquery.target.attributes.REID+"'",
					outFields: ["*"],
					returnGeometry:false,
					orderByFields: ["CO_Date DESC"]
				});			


				query.executeQueryJSON(ALL_DEV_CASES_POLY,advquery.PARCEL_INTERSECT_QUERY_WGEOMETRY_DEVCASE_SORT)
				.catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Development Cases",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function (results) {
					if (typeof results !== 'undefined'){
					try {
						let title = "Development Cases";
						let list_of_results = [];
						let PLI = document.createElement("li");
						drill_popup_ul.appendChild(PLI)
						permitscope.write_PLI(PLI,title);
						if (results.features.length == 0) {	
							permitscope.write_nopermit(PLI); }
						else {
							try {					
								results.features.forEach(function(item) {
									var geom = geometryEngine.intersect(advquery.OTLG,item.geometry);
									if (geom) {					
										var acres = geometryEngine.geodesicArea(geom, 109402);
										var pct_of_parcel = Math.round((acres / advquery.parcel_acres)*100.0);			
										if (pct_of_parcel > 2) {  //what did we do here? We calculated the area where the Devcase Poly overlaps the Parcel in question, and we figure out that figure as a percentage of the original parcel. If there's less than 2% overlap we treat that like no overlap.
											var trow = '<td><a href="#" onclick="durm.fire_devcase_popup(&quot;'+item.attributes.A_NUMBER+'&quot;);return false;">' + item.attributes.A_NUMBER + '</a></td><td class="grow">' + moment(item.attributes.A_DATE).format('YYYY') + '</td><td style="width:20%;">' + item.attributes.AppStatus + '</td><td style="width:45%;">' + item.attributes.A_PROJECT_NAME + '</td>';
											list_of_results.push({trow:trow});
										}
									}
								});
								//If there were no results, write "None"
								if (list_of_results.length == 0) {	
									permitscope.write_nopermit(PLI); }
								else {
									permitscope.write_permitresults(list_of_results,PLI);
								}
							} catch (e) { console.log(e); }							
						}
					} catch (e) { console.log(e); }
					}
					return query.executeQueryJSON(BUILDING_PERMITS_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_BUILDINGPERMITSSORT)
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Building Permits (2007-Present)",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
					if (typeof results !== 'undefined'){
					try {
						let title = "Building Permits (2007-Present)";
						let list_of_results = [];
						let PLI = document.createElement("li");
						drill_popup_ul.appendChild(PLI)
						permitscope.write_PLI(PLI,title);
						if (results.features.length == 0) {	
							permitscope.write_nopermit(PLI); }
						else {	
							try {		
								results.features.forEach(function(item) {
									var trow = '<td><a href="#" onclick="durm.fire_allpermit_popup(&quot;'+item.attributes.PermitNum+'&quot;);return false;">' + item.attributes.PermitNum + '</a></td><td class="grow">' + moment(item.attributes.ISSUE_DATE).format('YYYY') + '</td><td style="width:20%;">' + item.attributes.PmtStatus + '</td><td style="width:45%;">' + item.attributes.BLDB_ACTIVITY_1 + '</td>';
									list_of_results.push({trow:trow});
								});		
								permitscope.write_permitresults(list_of_results,PLI);
							} catch (e) { console.log(e); }						
						}
					} catch (e) { console.log(e); }	
					}
					return query.executeQueryJSON(CO_URL_SUBLAYER,advquery.PARCELID_QUERY_COs)
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Certificates of Occupancy",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
					if (typeof results !== 'undefined'){
					try {
						let title = "Certificates of Occupancy";
						let list_of_results = [];
						let PLI = document.createElement("li");
						drill_popup_ul.appendChild(PLI)
						permitscope.write_PLI(PLI,title);
						if (results.features.length == 0) {	permitscope.write_nopermit(PLI); }
						else {	
							try {	
								results.features.forEach(function(item) {
									var trow = '<td>'+item.attributes.PermitNum+'</td><td>'+moment(item.attributes.CO_Date).format('MM/DD/YYYY')+'</td>';
									list_of_results.push({trow:trow});
								});		
								permitscope.write_permitresults(list_of_results,PLI);
							} catch (e) { console.log(e); }						
						}
					} catch (e) { console.log(e); }	
					}
					return query.executeQueryJSON(ALL_BI_TRADE_PERMITS,advquery.PPID_QUERY_TRADEPERMITS);
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Trade Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
					if (typeof results !== 'undefined'){
					try {							
							let title = "Trade Permits"
							let list_of_results = [];

							let PLI = document.createElement("li");
							drill_popup_ul.appendChild(PLI)
							permitscope.write_PLI(PLI,title);

							if (results.features.length == 0) {	
								permitscope.write_nopermit(PLI); }
							else {	
								try {		
									results.features.forEach(function(item) {
										//var trow = '<td><a href="#" onclick="durm.fire_tradepermit_popup(&quot;'+item.attributes.A_NUMBER+'&quot;);return false;">' + item.attributes.A_NUMBER + '</a></td><td class="grow">' + moment(item.attributes.A_ISSUE_DATE).format('YYYY') + '</td><td style="width:20%;">' + item.attributes.Status + '</td><td style="width:45%;">' + item.attributes.Type + '</td>';
										let trow = '<td class="grow"><a href="#" onclick="durm.fire_tradepermit_popup(&quot;'+item.attributes.A_NUMBER+'&quot;);return false;">' + item.attributes.A_NUMBER + '</a></td>'+
										'<td class="grow"><ul>'+
										'<li>'+moment(item.attributes.A_ISSUE_DATE).format('MMMM YYYY')+'</li><li>'+item.attributes.Type+', '+item.attributes.Status+'</li><li>'+item.attributes.A_DESCRIPTION+'</li></ul></td>';
										list_of_results.push({trow:trow});
									});		
									permitscope.write_permitresults(list_of_results,PLI);
								} catch (e) { console.log(e); }						
							}
						
					} catch (e) { console.log(e); }	
					}						
					return query.executeQueryJSON(ACTV_BLDG_PERMITS_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY);
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Active Building Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
					if (typeof results !== 'undefined'){
					try {
						let title = "Active Building Permits";
						let list_of_results = [];

						let PLI = document.createElement("li");
						drill_popup_ul.appendChild(PLI)
						permitscope.write_PLI(PLI,title);			

						if (results.features.length == 0) {	
							permitscope.write_nopermit(PLI); 
						}
						else {
							try {
								results.features.forEach(function(item) {
									let trow = '<td class="grow"><a href="#" onclick="durm.fire_bldgpermit_popup(&quot;'+item.attributes.Permit_ID+'&quot;);return false;">' + item.attributes.Permit_ID + '</a></td>'+
									'<td class="grow"><ul>'+
									'<li>'+item.attributes.BDMAPTITLE +'</li><li>'+item.attributes.P_Descript+'</li></ul></td>';
									list_of_results.push({trow:trow});
								});
								permitscope.write_permitresults(list_of_results,PLI);
							} catch (e) { console.log(e); }	
						}	
					} catch (e) { console.log(e); }
					}
					return query.executeQueryJSON(ACTV_ELEC_PERMITS_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_BY_PERMIT_ID);	  
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Active Electrical Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
						if (typeof results !== 'undefined'){
						try {
							let title = "Active Electrical Permits";
							let list_of_results = [];
							
							let PLI = document.createElement("li");
							drill_popup_ul.appendChild(PLI)
							permitscope.write_PLI(PLI,title);

							if (results.features.length == 0) {	permitscope.write_nopermit(PLI); }
							else {
								try {
									results.features.forEach(function(item) {
										let trow = '<td class="grow"><a href="#" onclick="durm.fire_elecpermit_popup(&quot;'+item.attributes.Permit_ID+'&quot;);return false;">' + item.attributes.Permit_ID + '</a></td>'+
										'<td class="grow"><ul>'+
										'<li>'+item.attributes.ELMAPTITLE +'</li><li>'+item.attributes.P_Descript+'</li></ul></td>';
										list_of_results.push({trow:trow});
									});
									permitscope.write_permitresults(list_of_results,PLI);
								} catch (e) { console.log(e); }	
							}
						} catch (e) { console.log(e); }		
						}
						return query.executeQueryJSON(ACTV_MECH_PERMITS_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_BY_PERMIT_ID);		
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Active Mechanical Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
						if (typeof results !== 'undefined'){
						try {
							let title = "Active Mechanical Permits";
							let list_of_results = [];								
							let PLI = document.createElement("li");
							drill_popup_ul.appendChild(PLI)
							permitscope.write_PLI(PLI,title);
							if (results.features.length == 0) {	permitscope.write_nopermit(PLI); }
							else {
								try {
									results.features.forEach(function(item) {
										let trow = '<td class="grow"><a href="#" onclick="durm.fire_mechpermit_popup(&quot;'+item.attributes.Permit_ID+'&quot;);return false;">' + item.attributes.Permit_ID + '</a></td>'+
										'<td class="grow"><ul>'+
										'<li>'+item.attributes.MECH_DIST + ': ' + item.attributes.MECH_INSP +'</li><li>'+item.attributes.P_Descript+'</li></ul></td>';
										list_of_results.push({trow:trow});
									});
									permitscope.write_permitresults(list_of_results,PLI);
								} catch (e) { console.log(e); }		
							}
						} catch (e) { console.log(e); }
						}
						return query.executeQueryJSON(ACTV_PLUMB_PERMITS_URL_SUBLAYER,advquery.PARCEL_INTERSECT_QUERY_BY_PERMIT_ID);		
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Active Plumbing Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
						try {
							let title = "Active Plumbing Permits";
							let list_of_results = [];
							let PLI = document.createElement("li");
							drill_popup_ul.appendChild(PLI)
							permitscope.write_PLI(PLI,title);
							if (results.features.length == 0) {	permitscope.write_nopermit(PLI); }
							else {
								try {
									results.features.forEach(function(item) {
										let trow = '<td class="grow"><a href="#" onclick="durm.fire_plumpermit_popup(&quot;'+item.attributes.Permit_ID+'&quot;);return false;">'+item.attributes.Permit_ID+'</a></td>'+
										'<td class="grow"><ul>'+
										'<li>'+item.attributes.PBMAPTITLE +'</li><li>'+item.attributes.P_Descript+'</li></ul></td>';
										list_of_results.push({trow:trow});
									});
									permitscope.write_permitresults(list_of_results,PLI);
								} catch (e) { console.log(e); }		
							}						
						} catch (e) { console.log(e); }	
						return query.executeQueryJSON(CROSS_CONNECT_PERMITS_URL,advquery.PARCEL_INTERSECT_QUERY_CROSSCONNECT);
				}).catch(function(error){
					if(error.name="request:server") {
						console.log("Server Error")
						permitscope.create_and_write_error_PLI("Cross Connection Permits",drill_popup_ul)
						console.log(error)
					}
					else {
						console.log("Error message: ", error.message);
						console.log(error)
					}
				}).then(function(results) {
						if (typeof results !== 'undefined'){
						try {
							let title = "Cross Connection Permits";
							let list_of_results = [];
							let PLI = document.createElement("li");
							drill_popup_ul.appendChild(PLI)
							permitscope.write_PLI(PLI,title);
							if (results.features.length == 0) {	permitscope.write_nopermit(PLI); }
							else {
								try {
									/*results.features.forEach(function(item) {
										var trow = '<td>'+item.attributes.A_NUMBER+'</td><td>'+moment(item.attributes.A_DATE).format('MM/DD/YYYY')+'</td>';
										list_of_results.push({trow:trow});
									});*/
									results.features.forEach(function(item) {
										let trow = '<td class="grow"><a href="#" onclick="durm.fire_ccpermit_popup(&quot;'+item.attributes.A_NUMBER+'&quot;);return false;">'+item.attributes.A_NUMBER+'</a></td>'+
										'<td class="grow"><ul>'+
										'<li>'+ moment(item.attributes.A_DATE).format('YYYY') +'</li><li>'+item.attributes.A_DESCRIPTION+'</li></ul></td>';
										list_of_results.push({trow:trow});
									});
									permitscope.write_permitresults(list_of_results,PLI);
								} catch (e) { console.log(e); }		
							}
						} catch (e) { console.log(e); }
						}
						return	
				});
				document.getElementById("bodycontainer").style.cursor = "default";
				document.getElementById("mapViewDiv").style.cursor = "default";
				return popup_div_container
			} catch (e) { console.log(e); }
		},
		create_and_write_error_PLI: async function(title,drill_popup_ul) {
			try {						
				let PLI = document.createElement("li");
				drill_popup_ul.appendChild(PLI)
				PLI.className="permitListItem";
				let popup_header = document.createElement("h4");
				popup_header.innerHTML = title;   
				PLI.appendChild(popup_header)
				let popup_p_noresult = document.createElement("p");
				PLI.appendChild(popup_p_noresult)
				popup_p_noresult.innerHTML = "Error"; 
			} catch (e) { console.log(e); }
		},
		
		write_PLI: async function(PLI,title) {
			try {
				PLI.className="permitListItem";
				let popup_header = document.createElement("h4");
				popup_header.innerHTML = title;   
				PLI.appendChild(popup_header)
			} catch (e) { console.log(e); }
		},
			// This prints the header and the results
		write_permitresults: async function(finalresult,PLI){
			try {										  
				let results_table = document.createElement("table");
				PLI.appendChild(results_table)		  
				finalresult.forEach(function(r) {
					let result_row = document.createElement("tr");
					result_row.innerHTML = r.trow;				
					results_table.appendChild(result_row)				
				});		  
			} catch (e) { console.log(e); }
			
		},
		// This "None" if there are no results.
		write_nopermit: async function(PLI){
			try {		
				let popup_p_noresult = document.createElement("p");
				PLI.appendChild(popup_p_noresult)
				popup_p_noresult.innerHTML = "None";  
			} catch (e) { console.log(e); }		
		}
  	};
});