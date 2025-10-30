/*
Matt Reames, 2019
This module is to manage the user interface
*/
define([
	//"esri/core/watchUtils",
	"esri/core/reactiveUtils",
	"esri/widgets/Print","esri/widgets/Expand","esri/widgets/BasemapGallery","esri/widgets/Legend","esri/widgets/Compass","esri/widgets/ScaleBar","esri/widgets/Sketch",
	"esri/layers/GraphicsLayer", "../durm/durm_suppress_identity_modal.js", "../durm/durm_aerials.js"
	], function(//watchUtils,
		reactiveUtils,
		Print, Expand, BasemapGallery, Legend, Compass, ScaleBar, Sketch,
		GraphicsLayer, durm_suppress_identity_modal, durm_aerials
    ) {
  	return {
		/*  init runs at the very beginning, before there is a 'mapview' and before there are layers.  */
		init: function(){
			try {
				uiscope = this;
				durm.preset_ignore_list = ["parcels", "active_address_points", "countymask", "graymap_roads", "graymap_labels","aeriallabels", "graphics","waterlayer","sewerlayer","orangepars","wakepars","stormsewersheds", "stormwaterlayer"]
				
				durm_suppress_identity_modal.init();

				document.getElementById("bodycontainer").style.cursor = "progress";				
				//js pointers to HTML Buttons in the 'development case' form.
				durm.caseStatusSelect = document.getElementById("case-status");
				durm.caseTypeSelect = document.getElementById("case-type");
				durm.draw_button = document.getElementById("draw_button");
				durm.area_button = document.getElementById("areaButton");
				durm.reset_button = document.getElementById("reset_button");
				durm.parcel_buffer_button = document.getElementById("parcelbufferButton");
				

				// basic controls for independent popup and its close button.
				durm.customCaseWindow = document.getElementById("independent_case_popup");
				durm.customCaseWindow.style.zIndex = 0;	
				durm.customCaseWindow.style.visibility = "hidden";	   
				durm.customCaseWindow.style.backgroundColor = '#fff';

				const independentpopupclosebuttondiv = document.getElementById('independent-popup-close');   
				independentpopupclosebuttondiv.addEventListener('click', (event) => {
					durm.customCaseWindow.style.zIndex = 0;		
					durm.customCaseWindow.style.visibility = "hidden";
					event.preventDefault();		
				});


				document.getElementById('logobutton').addEventListener('click', (event) => {
					this.set_app_state("default") 
					this.disable_aerials_mode();
				});

				// Google Stuff after this. 
				durm.drawer1 = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer--modal'));
				const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
				topAppBar.listen('MDCTopAppBar:nav', () => {
					durm.drawer1.open = !durm.drawer1.open;
				});

				//click auto-closes
				const mapdiv = document.getElementById('mapViewDiv');   
				mapdiv.addEventListener('click', () => {
						if(durm.drawer1.open === true){
							durm.drawer1.open = false
						}
				});

				//click auto-closes
				const clbr = document.getElementById('closebar1');   
				clbr.addEventListener('click', () => {
						if(durm.drawer1.open === true){
							durm.drawer1.open = false
						}
				});

				rightclickmenu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));

				const scrim1 = document.getElementById('scrim1');
				scrim1.addEventListener('click', () => {
					if(durm.drawer1.open === true){
						durm.drawer1.open = false
					}
					document.getElementById("layerpanel").classList.remove("is-visible") 
				});


				//MDC configuration related to 'roles',  i.e.,  how MDC decides how the button highlighting works in the nav.
				const nav_mdclist1 = new mdc.list.MDCList(document.getElementById('nav_mdclist1'));
				nav_mdclist1.singleSelection = true;
				const nav_mdclist2 = new mdc.list.MDCList(document.getElementById('nav_mdclist2'));
				nav_mdclist2.singleSelection = true;
				const nav_mdclist2b = new mdc.list.MDCList(document.getElementById('nav_mdclist2b'));
				nav_mdclist2b.singleSelection = true;				
				const nav_mdclist3 = new mdc.list.MDCList(document.getElementById('nav_mdclist3'));
				nav_mdclist3.singleSelection = false;		
				const nav_mdclist4 = new mdc.list.MDCList(document.getElementById('nav_mdclist4'));
				nav_mdclist4.singleSelection = false;

				// We want the user to have a simpler default viewport setting.  Only later when it's necessary do we have Esri take over the scalability.
				let viewportMeta = document.querySelector('meta[name="viewport"]');
				if (!viewportMeta) {
				  viewportMeta = document.createElement('meta');
				  viewportMeta.name = "viewport";
				  document.head.appendChild(viewportMeta);
				}			  
				viewportMeta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

			} catch (e) { console.log(e); }	
		},

		// This detects initial browser width and sets components accordingly.  All changes to this will be handled by durm.mapView.watch()
		set_components_desktop_or_mobile: function() { 
			tscope = this;
			console.log("width: " + durm.mapView.widthBreakpoint)
			console.log("height: " + durm.mapView.heightBreakpoint)
			if (durm.mapView.widthBreakpoint === "xsmall") { 
				tscope.shrink_to_portrait_phone(); 
			}
			else if (durm.mapView.heightBreakpoint === "xsmall") { 
				tscope.shrink_to_landscape_phone(); 
			}
			else { 
				tscope.grow(durm); 
			}			
		},
			
		set_responsive_watches: function() { 
			durm.mapView.watch("widthBreakpoint", function(newVal){
				if (newVal === "xsmall"){ tscope.shrink_to_portrait_phone() }			
				else if (newVal === "xlarge" || newVal === "large" || newVal === "medium" || newVal ==="small") { tscope.grow()	}
			});
			durm.mapView.watch("heightBreakpoint", function(newVal){
				if (newVal === "xsmall"){
					tscope.shrink_to_landscape_phone();
				}			
				else if (newVal === "xlarge" || newVal === "large" || newVal === "medium" || newVal ==="small") {
					tscope.grow()
				}
			});
		},

		load_widgets_pre: function() {
			//These widgets load relatively early because they 'look nice in the ui'and have no layer dependencies
			//In the long run we may want to have this run in parallel ALONGSIDE populate, but it may be simpler in the short-run to run it BEFORE populate


				//compass - note that this doesn't actually draw unti later, when it's added to durm.mapView.ui.add
				durm.compassWidget = new Compass({
					view: durm.mapView
				});

				//scalebar
				let sd = document.createElement("div");
				document.body.appendChild(sd);
				sd.classList.add("scale_div") 
				durm.scaleWidget = new ScaleBar({
					view: durm.mapView,
					unit:"imperial"
				});
				durm.scaleWidget.container = sd;



				// Bindings for "Aerial" and "Map" buttons in mdc menu. 
				durm.load_simple_basemap = document.getElementById("load_simple_basemap");
				durm.load_simple_basemap.addEventListener("click", () => {
					this.disable_aerials_mode();
					durm.map.basemap = this.load_simple_basemap();
				});
				durm.enable_aerials_mode = document.getElementById("enable_aerials_mode");
				durm.enable_aerials_mode.addEventListener("click",() => {
					this.enable_aerials_mode(durm.defaultaerialid);
				});


				//Put the ui_panel / form_panel stuff inside esri ui
				durm.devcase_form = document.getElementById("devcase_form_panel")				
				durm.devcase_form.style.display == "none"
				durm.mapView.ui.add(durm.devcase_form, "top-right");

				durm.address_ui = document.getElementById('parceltool_form_panel')
				durm.address_ui.style.display == "none"
				durm.mapView.ui.add(durm.address_ui, "top-right");

				durm.mtd = document.createElement("div");
				durm.mts = document.createElement("span");
				durm.mti = document.createElement("img");

				durm.mtd.classList = "maptogglebutton"
				durm.mtd.id = "maptoggle"
				durm.mts.id = "maptogglebuttonphotocaption"
				durm.mti.id = "maptogglebuttonphoto"

				durm.mti.src = "./img/aerialmode.png"
				durm.mts.innerHTML = "Aerials"
				durm.mts.style.color = "#323232"

				durm.mtd.appendChild(durm.mts)
				durm.mtd.appendChild(durm.mti)
				document.getElementById("mapViewDiv").appendChild(durm.mtd)
		},

		load_widgets_deferred: function() {
			try {	
				//basemap gallery widget and button
				basemapGallery = new BasemapGallery({
					view: durm.mapView,
					container: document.createElement("div"),
					source: durm.basemaparray
					});		  
				durm.bgExpand = new Expand({
					id: "background-selector",
					expandTooltip: "Change Basemap",
					view: durm.mapView,
					content: basemapGallery.container,
					autoCollapse: true,
					expandIconClass: "esri-icon-basemap"
				});		
				//print (pdf export) widget and button
				durm.print = new Print({
					view: durm.mapView,
					container: document.createElement("div"),
					printServiceUrl: PRINT_SERVICE_URL
				});	  
				durm.printExpand = new Expand({
					id: "print-selector",
					expandIconClass: "esri-icon-save",
					expandTooltip: "Export / Save to PDF",
					view: durm.mapView,
					autoCollapse: true,
					content: durm.print.domNode
				});
				//add the above buttons to the ui
				durm.mapView.ui.add([ durm.compassWidget,durm.bgExpand,durm.printExpand ], "top-right");


				//Bindings for "Print" button in mdc menu
				durm.toggle_print = document.getElementById("toggle_print");
				durm.toggle_print.addEventListener("click", () => {
					window.print()
				});			

				//Bindings for Esri drawtool, plus some initialization for the underlying Sketch item it draws
				durm.toggle_drawtool_item = document.getElementById("toggle_drawtool_item");	
				durm.sketch_button_container = document.getElementById("sketch_button_container");	
				durm.sketch_button_container.style.display = "none";
				durm.toggle_drawtool_item.addEventListener("click", () => {
					if(durm.sketch_button_container.style.display == "none") { 
						durm.sketch_button_container.style.display = "inherit"; 
						durm.toggle_drawtool_item.classList.add("mdc-list-item--activated") 
						}
					else { 
						durm.sketch_button_container.style.display = "none"; 
						durm.toggle_drawtool_item.classList.remove("mdc-list-item--activated") 
						}
				});
				durm.toggle_drawtool_item = document.getElementById("toggle_drawtool_item");	
				durm.sketch_button_container = document.getElementById("sketch_button_container");
				durm.sketchlayer = new GraphicsLayer({
					listMode: "hide",
					id:"graphics",
					lyr_zindex:10
				});
				durm.map.add(durm.sketchlayer);
				durm.sketch = new Sketch({
					layer: durm.sketchlayer,
					view: durm.mapView,
					container:"sketch_button_container"
				});
				durm.mapView.ui.add(durm.sketch, "top-right");

			} catch (e) { console.log(e); }	

			try {
				durm.toggle_legend_item = document.getElementById("toggle_legend_item");		
				durm.legend = new Legend({
					id: "legend",
					container: "legend_container",
					view: durm.mapView
				});		
				durm.toggle_legend_item.addEventListener("click", () => { 
					let leg_div = document.querySelector(".esri-legend");
					console.log(leg_div)
					if(leg_div.style.display == "none") { 
						leg_div.style.display = "block"; 
						// mdc normally handles the highlighting of the buttons.  but if the button is activated by default, mdc won't handle it automagically.
						durm.toggle_legend_item.classList.add("mdc-list-item--activated")
						}
					else { 
						leg_div.style.display = "none"; 
						durm.toggle_legend_item.classList.remove("mdc-list-item--activated")
					}
				});

				durm.load_layertable = document.getElementById("load_layertable");
				durm.load_layertable.addEventListener("click", function(e) {			
					if( e.target.classList.contains(".cd-panel") || e.target.classList.contains(".cd-panel-close") ) { 
						document.getElementById("layerpanel").classList.remove("is-visible") 
						e.preventDefault();
					}
					else {		
						e.preventDefault();
						document.getElementById("layerpanel").classList.add("is-visible") 
					}			
				});

				durm.buttonbar0 = document.getElementById("layerlistbutton1");
				durm.buttonbar0.addEventListener("click", function(e) {
					durm.drawer1.open = true
					if( e.target.classList.contains(".cd-panel") || e.target.classList.contains(".cd-panel-close") ) { 
						document.getElementById("layerpanel").classList.remove("is-visible") 
						e.preventDefault();
					}
					else {		
						e.preventDefault();
						document.getElementById("layerpanel").classList.add("is-visible") 
					}			
				});

				//Toggle preset buttons
				durm.development_preset = document.getElementById("development_preset");
				durm.zoning_preset = document.getElementById("zoning_preset");
				durm.drainage_preset = document.getElementById("drainage_preset");  
				durm.toggle_utilities = document.getElementById("toggle_utilities");

				durm.zoning_preset.addEventListener("click", () => {	
					this.set_app_state("zoning",durm.layer_state_string)
				});	
				durm.development_preset.addEventListener("click", () => { 
					this.set_app_state("devcases",durm.layer_state_string)
				});					
				durm.drainage_preset.addEventListener("click",() => {	
					this.set_app_state("stormwater",durm.layer_state_string) 
				});
				durm.toggle_utilities.addEventListener("click", () => {
					this.toggle_utilities()
				} );
				//end preset
			} catch (e) { console.log(e); }	
		},
		
		set_app_state: function(state,layerparams){
			durm.app_state_string = state;
			switch(state) {
				case "zoning":
					this.load_zoning_preset(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "devcases":
					this.load_dev_preset(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "stormwater":
					this.load_storm_preset(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "custom":
					this.load_custom_state(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "default":
					this.load_default_state(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				default: 
					this.load_default_state(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
			}
		},
		
    	trigger_panel_situation: function(state){
			let allpanels = [];
			allpanels.push(document.getElementById("devcase_form_panel"))
			
			allpanels.forEach(function(p){
				p.style.visibility = "hidden";
				p.style.display = "none";
			});
			switch(state) {
				case "zoning":
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;
				case "devcases":			
					document.getElementById("devcase_form_panel").style.visibility = "visible";
					document.getElementById("devcase_form_panel").style.display = "inline-block";
					this.set_components_desktop_or_mobile()
					break;
				case "inspections":
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;
				case "stormwater":
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;
				case "utilities":
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;
				case "custom":
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;				
				default:
					document.getElementById("devcase_form_panel").style.visibility = "hidden";
					document.getElementById("devcase_form_panel").style.display = "none";
					break;
			}
		},

		load_default_state: function(){
			//loading of the default state (preset) involves slightly different logic than the other states,
			// in the sense that 'default' will forcefully reset ALL the layers, including the ones that were added manually. 
			// Other app_states will preserve any layers that the user had previously turned on manually.
			try {
				durm.map.layers.items.forEach(function(r) {
					if(durm.preset_ignore_list.includes(r.id)) {}
					else { r.visible = false; }
				}); 
			} catch (e) { console.log(e); }	
		},

		load_custom_state: function(layerparams){
			try {
				//do nothing.  This is just a status change that allows you to load something custom on init.
			} catch (e) { console.log(e); }	
		},

		load_zoning_preset: function(layerparams)
		{
			if(layerparams) { lyrIDlist = layerparams.split(',') }
			else {}			
			durm.map.layers.items.forEach(function(r) {
				if(r.visible===true){	
					if(durm.aeriallist_ids.includes(r.id)) { }
					else if(durm.preset_ignore_list.includes(r.id)) { }
					else { r.visible = false; }
				}
			}); 	  
			let zoning_layers = [durm.zoninglayer,durm.transitionalofficeoverlay,durm.NPOlayer,durm.NHDlayer,durm.LocHistLandmarks,durm.airportoverlay,durm.cityboundaryLayer,durm.active_address_points,durm.RTPboundarylayer,durm.countymask];
			let allvisible = true;
			zoning_layers.forEach(function(r) {
				if(r.visible) {}
				else { allvisible = false; }
			});			  
			if(allvisible) {
				zoning_layers.forEach(function(r) {
					r.visible = false;
				});
			}
			else {
				zoning_layers.forEach(function(r) {
					r.visible = true;
				});
			}				
		},

		load_dev_preset: function(layerparams)
		{
			try{
			if(layerparams) { lyrIDlist = layerparams.split(',') }
			else {}
			durm.map.layers.items.forEach(function(r) {
				if(durm.preset_ignore_list.includes(r.id)) {}
				else if(durm.aeriallist_ids.includes(r.id)) {}
				else { r.visible = false; }
			}); 
			let development_layers = [durm.developmenttiers,durm.active_address_points,durm.citymask];
			let allvisible = true;
			development_layers.forEach(function(r) {
				if(r.visible) {}
				else { allvisible = false; }
			});			  
			if(allvisible) {
				development_layers.forEach(function(r) {
					r.visible = false;
				});
			}
			else {
				development_layers.forEach(function(r) {
					r.visible = true;
				});
			}
			} catch (e) { console.log(e); }	
		},

		load_storm_preset: function(layerparams) {
			try {
			if(layerparams) { lyrIDlist = layerparams.split(',') }
			else {}
			durm.map.layers.items.forEach(function(r) {
					if(durm.preset_ignore_list.includes(r.id)) {}
					else if(durm.aeriallist_ids.includes(r.id)) {}
					else { r.visible = false; }
			}); 		  
			const wetland_layers = [durm.impervious,durm.NWIlayer,durm.FEMA_risk_development,durm.TOPO_2ft,durm.countymask];
			let allvisible = true;
			wetland_layers.forEach(function(r) {
				if(r.visible) {}
				else { allvisible = false; }
			});			  
			if(allvisible) {
				wetland_layers.forEach(function(r) {
					r.visible = false;
				});
			}
			else {
				wetland_layers.forEach(function(r) {
					r.visible = true;
				});
			}
			} catch (e) { console.log(e); }	
		},

		toggle_utilities: function()
		{		
			try {
				switch(durm.uparam) {
					case 1:
						this.unload_utilities();
						break;
					case 0:
						this.load_utilities();
						break;
					default: 
						this.unload_utilities();
						break;
				}
			} catch (e) { console.log(e); }		
		},

		load_utilities: function() {
			durm.cityportal.authMode = "auto";   //Ensure that we aren't running in anonymous mode.
			durm_suppress_identity_modal.enableTypicalEsriMode();
		  
			// Check if waterlayer is already added; if not, add it.
			if (!durm.map.findLayerById(durm.waterlayer.id)) {
			  durm.map.add(durm.waterlayer);
			}
			durm.waterlayer.visible = true;
		  
			// Check if sewerlayer is already added; if not, add it.
			if (!durm.map.findLayerById(durm.sewerlayer.id)) {
			  durm.map.add(durm.sewerlayer);
			}
			durm.sewerlayer.visible = true;
		  
			durm.uparam = 1;
			push_new_url();
		  },

		unload_utilities: function() {
			//durm.cityportal.authMode = "anonymous";
			durm_suppress_identity_modal.disableTypicalEsriMode();

			durm.waterlayer.visible = false;
			durm.map.remove(durm.waterlayer);

			durm.sewerlayer.visible = false;							
			durm.map.remove(durm.sewerlayer);	
			
			durm.uparam = 0
			push_new_url()
		  },

        shrink_to_portrait_phone: function(){
			durm.mapView.ui.remove([durm.legend]);
			let fps = document.getElementById("devcase_form_panel")
			fps.style.display = "inline-block";		
		},

		shrink_to_landscape_phone: function(){
			durm.mapView.ui.remove([durm.legend]);		
			let fps = document.getElementById("devcase_form_panel")
			fps.style.display = "none";
			/*let fps = document.getElementsByClassName("ui_panel")
			for (let i = 0; i < fps.length; i++) {
				fps[i].style.display = "none";
			}	*/
		},	

		// grow runs on init, and on resizing					
		grow: function(){
				durm.mapView.ui.add([{
					component: durm.legend,
					position: "bottom-left"
				}]);

				if(durm.app_state_string === "devcases") {
					let fps = document.getElementById("devcase_form_panel")
					fps.style.display = "inline-block";
				}
		},
		init_layer_control: function(){
			try {
					lyrctrlscope = this;	
					durm.layerlistcategories = [];
					let combinedLayers = durm.map.layers.items.concat(durm.securedLayers);

					// Building the HTML list containers							
					durm.layertable_container = document.getElementById("layerpanel");
					durm.layertable_ul_nonvisible = document.getElementById("ul_layers");

					/* Building the Categories */
					combinedLayers.forEach(function(r) {
						if (durm.layerlistcategories.includes(r.listcategory)) {}
						else {
							if (r.listcategory) {durm.layerlistcategories.push(r.listcategory)}						
						}
					});
					durm.layerlistcategories.sort();

					durm.layerlistcategories.forEach(function(r) {
						var newcategoryli = document.createElement('li')
						durm.layertable_ul_nonvisible.appendChild(newcategoryli)
						var newcategoryul = document.createElement('ul')
						newcategoryul.id = r;
						newcategoryul.classList.add("ul_category")
						newcategoryli.appendChild(newcategoryul)   //  this might look backwards, but this is (by intent) a <ul> nested within a <li> nested within a <ul>
						headerli = document.createElement('li')
						headerli.classList.add("lyrlist-header")
						headerli.innerHTML = r
						newcategoryul.appendChild(headerli)	

						//exception for Aerial Photos.  I'm not actually sure this runs anymore.
						if(r === "Aerial Photos, Historical"){
							let tag0 = document.createElement('li')
							let a0 = document.createElement('a')
							a0.innerHTML = "Aerials"
							a0.href = "#"
							a0.id = "aerials_tag"
							tag0.appendChild(a0)
							newcategoryul.appendChild(tag0)
							a0.addEventListener("click", function(){
								console.log("durm_ui enabled aerial mode via layer control")
								lyrctrlscope.enable_aerials_mode(durm.defaultaerialid)
								document.getElementById("layerpanel").classList.remove("is-visible")
							});
						}
	
					});

					/* Sort the layers alphabetically before we begin */
					//This messes with the layer draw order if r
					combinedLayers.sort(function(a,b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);} );

					/* Building the individual list items */
					combinedLayers.forEach(function(r) {
						if (r.listMode == "hide") {} // if we've set listmode to hide, ignore this layer.
						else {
							var newli = document.createElement('li')
							newli.id = r.id
							newli.setAttribute("data-durmdrawindex", r.lyr_zindex)  //  this matches up the html data property with the js data property
							newli.style.display = "list-item"
							newli.classList.add("noselect")
							newli.classList.add("layer-table-list-item")
							var onoff = document.createElement('div')
							onoff.style.display = "inline-block"
							onoff.classList.add("onoffswitch")
							var inp = document.createElement('input')
							inp.style.display = "none"
							inp.style.lineHeight = "inherit"
							inp.setAttribute("type", "checkbox")
							inp.setAttribute("name", "onoffswitch")
							inp.classList.add("onoffswitch-checkbox")
							let random_id = Math.random().toString(36).substring(7)
							inp.id = random_id
							onoff.appendChild(inp)


							
							// This makes visibility change on click -
							inp.addEventListener('click', function(e) {
								if (!durm.map.findLayerById(r.id)) {
									console.log("ADDING SECURED LAYER")
									
									durm.cityportal.authMode = "auto"
									durm.map.add(r);
									durm_suppress_identity_modal.enableTypicalEsriMode();
								  }

								if(r.visible) { 
									r.visible = false
									lyrctrlscope.ensure_not_in_url(r);
								} else { 
									r.visible = true 
									lyrctrlscope.add_to_url(r);
									// Whenever we click on a utility layer in the layerlist, if it was non-visible and we're turning it on, we also want to enable visibility of login/pass
									if (r.id == "waterlayer") {
										durm_suppress_identity_modal.enableTypicalEsriMode();
									}
									else if(r.id == "sewerlayer") {
										durm_suppress_identity_modal.enableTypicalEsriMode();
									}
									else {}									
								}
								//If we were "Default",  change to "Custom"
								// People want to be able to click a user preset, then turn a layer on, and keep the preset,  so don't do this for Devcases/Zoning/Drainage/Util, only do it for default
								if(durm.app_state_string=="default"){lyrctrlscope.set_app_state("custom",durm.layer_state_string)}
								else{}
							});

							let lab = document.createElement('label')
							lab.style.display = "block"
							lab.style.margin = 0;
							lab.classList.add("onoffswitch-label") 
							lab.htmlFor = random_id
							onoff.appendChild(lab)
							let switch1 = document.createElement('span')
							switch1.style.display = "block"
							switch1.classList.add("onoffswitch-inner") 
							lab.appendChild(switch1)
							let switch2 = document.createElement('span')
							switch2.style.display = "block"
							switch2.classList.add("onoffswitch-switch") 
							lab.appendChild(switch2)
							newli.appendChild(onoff)
							/* icon */
							if(r.icon=="USA") {
								let iconspan = document.createElement('img')
								iconspan.className = "flagicon"
								iconspan.src = "/icons/usflag16.png"
								newli.appendChild(iconspan)
							}
							else if(r.icon=="NC") {			
								let iconspan = document.createElement('img')
								iconspan.className = "flagicon"
								iconspan.src = "/icons/ncflag16.png"
								newli.appendChild(iconspan)
							}
							else if(r.icon=="DUR") {
								let iconspan = document.createElement('img')
								iconspan.className = "flagicon"
								iconspan.src = "/icons/durmflag16.png"
								iconspan.alt = "City of Durham / Durham County"
								newli.appendChild(iconspan)
							}
							else {}

							let newtext = document.createElement('span')
							newtext.style.display = "inline-block"
							newtext.innerHTML = r.title
							newli.appendChild(newtext)

							if (durm.layerlistcategories.includes(r.listcategory)) {								
								proper_ul_category = document.getElementById(r.listcategory);
								proper_ul_category.appendChild(newli)
							}
							else {}		

							/* watch layer visibility;  when true/false, toggle the html */
							/*watchUtils.whenTrue(r, "visible", function() {
								inp.checked = true;
								lyrctrlscope.add_to_url(r);
							});						
							watchUtils.whenFalse(r, "visible", function() {
								inp.checked = false;							
								lyrctrlscope.ensure_not_in_url(r);
							});*/


							/* watchUtils used to fire automatically on init */
							/* reactiveUtils seems to want the whole app to initialize before it begins watching anything */
							/* therefore reactiveUtils is not suitable for setting the layer list's initial on/off setting */
							
							//only runs once on init to set HTML switches on/off depending on what is visible at init
							if(r.visible) {
								inp.checked = true;
							}
							
							reactiveUtils.when(
								() => r?.visible === false,
								() => {
									inp.checked = false;							
									lyrctrlscope.ensure_not_in_url(r);
								}
							);
							   
							reactiveUtils.when(
								() => r?.visible === true,
								() => {
									inp.checked = true;
									lyrctrlscope.add_to_url(r);
								}
							);




						}
					});

					//lyrscope.update_layer_draw_order_based_on_lyr_zindex(); // run once at beginning of app
				} catch (e) { console.log(e); }
		},

		add_to_url: function(r) {
			try {
				if(r.id){
					let s = r.id + ",";
					if(durm.layer_state_string.includes(s,'')){
						//nothing. 
					} else {
						durm.layer_state_string = durm.layer_state_string + r.id + ","
						push_new_url();
					}
				}
			} catch (e) { console.log(e); }
		},

		ensure_not_in_url: function(r) {
			try {
				durm.layer_state_string = durm.layer_state_string.replace(r.id + ",",'')
				push_new_url();
			} catch (e) { console.log(e); }
		},

		enable_aerials_mode: function(aerialid) {
			try {
				console.log("Enable aerials mode called with aerialid: " + aerialid)
				this.ensure_aerials_are_nonvisible() // When this is run we want to ensure all aerials are off first to avoid problems.
				if(aerialid == -1) {
					this.disable_aerials_mode()
				}
				else {
					// Bounds check: if aerialid is out of range, use default
					if (aerialid < 0 || aerialid >= durm.aeriallist.length) {
						console.log(`Aerial ID ${aerialid} out of bounds (0-${durm.aeriallist.length - 1}), using default: ${durm.defaultaerialid}`);
						aerialid = durm.defaultaerialid;
					}
					durm.sliderinput.value = aerialid
					durm.aoutput.innerHTML = durm.aeriallist[aerialid].title;

					console.log("enable_aerials_mode calling show_aerial_by_index with:", aerialid);
					durm_aerials.show_aerial_by_index(aerialid);

					durm.aparam = aerialid
					durm.aeriallabelsVT.visible = true; // Make labels visible
					durm.map.basemap = durm.basemaparray[4]; //Set to Hillshade basemap		
					durm.parcelboundaryLayer.renderer = lavender_parcelboundaryRenderer
					let sd00 = document.getElementById("sliderDiv")
					sd00.style.visibility = "visible"; //toggle panel visibility
					push_new_url()

					document.getElementById("load_simple_basemap").classList.remove("mdc-list-item--activated")
					document.getElementById("enable_aerials_mode").classList.add("mdc-list-item--activated")
					durm.mti.src = "./img/map.png"
					durm.mts.innerHTML = "Map"
					durm.mts.style.color = "#323232"
				}

			} catch (e) { console.log(e); }
		},

		disable_aerials_mode: function() {
			try {
				durm.aparam = "-1"
				durm.sliderinput.value = durm.defaultaerialid; // Set slider back to original position
				durm.map.basemap = durm.basemaparray[11]; //Switch back to original basemap
				durm.aeriallabelsVT.visible = false; // Make labels nonvisible
				this.ensure_aerials_are_nonvisible()
				durm.parcelboundaryLayer.renderer = parcelboundaryRenderer //Switch back to original parcel
				let sd00 = document.getElementById("sliderDiv")
				sd00.style.visibility = "hidden";	//toggle panel visibility
				let b00 = document.getElementById("enable_aerials_mode")
				b00.classList.remove("mdc-list-item--activated") 

				push_new_url()

				document.getElementById("load_simple_basemap").classList.add("mdc-list-item--activated")
				document.getElementById("enable_aerials_mode").classList.remove("mdc-list-item--activated")
				durm.mti.src = "./img/aerialmode.png"
				durm.mts.innerHTML = "Aerials"
				durm.mts.style.color = "#323232"			

				

			} catch (e) { console.log(e); }
		},

		ensure_aerials_are_nonvisible: function() {
			try {
				durm_aerials.hide_all_aerials();
			} catch (e) { console.log(e); }
		},

		load_simple_basemap: function() {
			return durm.basemaparray[11];
		},

		// This is critical to layer ordering, what layers draw on top of one another, which all must be pre-set at the very beginning, ONCE and never changes.
		// This is very slow and very inefficient and is therefore only run at the beginning.
		// Don't try and get cute and re-work this to be a dynamic re-ordering situation unless you already understand the ramifications of calling the hellish reorder() function
		reorder_all_layers_to_default: function() {
			console.log("re-ordering layers")

			// Log nearmap master layer before sorting
			const nearmapLayer = durm.map.layers.find(l => l.id === "nearmap_master");
			if (nearmapLayer) {
				console.log("  Nearmap master before sort: lyr_zindex=", nearmapLayer.lyr_zindex, "layer_order=", nearmapLayer.layer_order, "visible=", nearmapLayer.visible);
			} else {
				console.log("  WARNING: nearmap_master not found in durm.map.layers!");
			}

			durm.map.layers.sort(function(a, b){
				if(a.lyr_zindex < b.lyr_zindex) return -1;
				if(a.lyr_zindex > b.lyr_zindex) return 1;
				return 0;
			});

			let count = 0;
			durm.map.layers.forEach(function(lyr) {
				lyr.layer_order = count;
				count++;
			});

			durm.map.layers.forEach(function(lyr) {
				durm.map.reorder(lyr.id,lyr.layer_order);
			});

			// Log nearmap master layer after reordering
			if (nearmapLayer) {
				console.log("  Nearmap master after reorder: layer_order=", nearmapLayer.layer_order, "visible=", nearmapLayer.visible);
			}
		}

  };
});