/*
Matt Reames, 2019
This module is to manage the user interface
*/
define([
	"esri/core/watchUtils",
	"../durm/durm_url.js","../durm/durm_gallery.js",
	"esri/widgets/Print","esri/widgets/Expand","esri/widgets/BasemapGallery","esri/widgets/Legend","esri/widgets/Compass","esri/widgets/ScaleBar","esri/widgets/Sketch",
	"esri/layers/GraphicsLayer"
	], function(watchUtils,
		durm_url,durm_gallery,
		Print, Expand, BasemapGallery, Legend, Compass, ScaleBar, Sketch,
		GraphicsLayer
    ) {
  	return {
		/*  init runs at the very beginning, before there is a 'mapview' and before there are layers.  */
		init: function(){
			try {
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
				});

				// Google Stuff after this. 
				const drawer1 = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer--modal'));
				const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
				topAppBar.listen('MDCTopAppBar:nav', () => {
					drawer1.open = !drawer1.open;
				});

				//click auto-closes
				const mapdiv = document.getElementById('mapViewDiv');   
				mapdiv.addEventListener('click', () => {
						if(drawer1.open === true){
							drawer1.open = false
						}
				});

				//click auto-closes
				const clbr = document.getElementById('closebar1');   
				clbr.addEventListener('click', () => {
						if(drawer1.open === true){
							drawer1.open = false
						}
				});

				rightclickmenu = new mdc.menu.MDCMenu(document.querySelector('.mdc-menu'));

				const scrim1 = document.getElementById('scrim1');
				scrim1.addEventListener('click', () => {
					if(drawer1.open === true){
						drawer1.open = false
					}
					document.getElementById("layerpanel").classList.remove("is-visible") 
				});

				//Ensure single-role lists.  Unsure if this is necessary..
				const nav_mdclist1 = new mdc.list.MDCList(document.getElementById('nav_mdclist1'));
				nav_mdclist1.singleSelection = true;
				const nav_mdclist2 = new mdc.list.MDCList(document.getElementById('nav_mdclist2'));
				nav_mdclist2.singleSelection = true;
				const nav_mdclist3 = new mdc.list.MDCList(document.getElementById('nav_mdclist3'));
				nav_mdclist3.singleSelection = false;		
				const nav_mdclist4 = new mdc.list.MDCList(document.getElementById('nav_mdclist4'));
				nav_mdclist4.singleSelection = false;


				

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

		//  This function is a huge ridiculous mess that needs to be cleaned up
		//  Mainly because of all the code needed for the draw tools
		draw_initial_widgets: function() {
			try {
				durm.mapView.popup.collapseEnabled = false;
				
				//compass
				durm.compassWidget = new Compass({
					view: durm.mapView
				});
							
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
				durm.mapView.ui.add([ durm.compassWidget,durm.bgExpand, durm.printExpand ], "top-right");

				//scalebar
				let sd = document.createElement("div");
				document.body.appendChild(sd);
				sd.classList.add("scale_div") 
				durm.scaleWidget = new ScaleBar({
					view: durm.mapView,
					unit:"non-metric"
				});
				durm.scaleWidget.container = sd;

				// Bindings for "Aerial" and "Map" buttons in mdc menu. 
				durm.toggle_simple_basemap = document.getElementById("toggle_simple_basemap");
				durm.toggle_simple_basemap.addEventListener("click", () => {
					durm.map.basemap = durm_gallery.toggle_simple_basemap();
				});
				durm.toggle_simple_aerials = document.getElementById("toggle_simple_aerials");
				durm.toggle_simple_aerials.addEventListener("click",() => {
					durm.map.basemap = durm_gallery.toggle_simple_aerials();
				});

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


				//Put the ui_panel / form_panel stuff inside esri ui
				durm.devcase_form = document.getElementById("devcase_form_panel")				
				durm.devcase_form.style.display == "none"
				durm.mapView.ui.add(durm.devcase_form, "top-right");

				durm.address_ui = document.getElementById('parceltool_form_panel')
				durm.address_ui.style.display == "none"
				durm.mapView.ui.add(durm.address_ui, "top-right");


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

				//Toggle preset buttons
				durm.toggle_development_preset = document.getElementById("toggle_development_preset");
				durm.toggle_zoning_preset = document.getElementById("toggle_zoning_preset");
				durm.toggle_wetland_preset = document.getElementById("toggle_wetland_preset");  
				durm.toggle_utilities_preset = document.getElementById("toggle_utilities_preset");
				durm.toggle_inspections_preset = document.getElementById("toggle_inspections_preset");

				durm.toggle_zoning_preset.addEventListener("click", () => {	
					this.load_zoning_preset() 
					this.set_app_state("zoning",durm.layer_state_string)
				});	
				durm.toggle_development_preset.addEventListener("click", () => { 
					this.load_dev_preset()	
					this.set_app_state("devcases",durm.layer_state_string)
				});					
				durm.toggle_wetland_preset.addEventListener("click",() => {	
					this.load_storm_preset()
					this.set_app_state("stormwater",durm.layer_state_string) 
				});
				durm.toggle_utilities_preset.addEventListener("click", () => {
					this.load_utilities_preset()
					this.set_app_state("utilities",durm.layer_state_string)
				} );	

				
			} catch (e) { console.log(e); }	
		},
		// first argument is mandatory, second argument is optional.
		set_app_state: function(state,layerparams){
			durm.app_state_string = state;
			//history.pushState(null, null, "/?x=" + durm.mapView.center.latitude + "&y=" + durm.mapView.center.longitude + "&z=" + durm.mapView.scale + "&r=" + durm.mapView.rotation + "&b=" + durm.map.basemap.param + "&s=" + durm.app_state_string + "&l=" + durm.layer_state_string);
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
				case "inspections":
					this.load_insp_preset(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "stormwater":
					this.load_storm_preset(layerparams);
					push_new_url();
					this.trigger_panel_situation(state);
					break;
				case "utilities":
					this.load_utilities_preset(layerparams);
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

		//this is called on init, and frequently thereafter
		//this is a semi-hacky sort of thing that controls parts of the panel.
		//this is a great example of "Never do premature optimization." Many of these DOM elements never got used, and a lot of this complexity is unnecessary.
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
					// Turn on parcels, address points, and the county mask.
					if (r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") { r.visible = true }

					// Ignore these special basemap layers, let their visibility be controlled somewhere else.
					else if(r.id==="graymap_roads" || r.id==="graymap_labels") {/*do nothing to these*/}

					// Ignore water and sewer layers, until we can upgrade this functionality.
					else if(r.id==="sewerlayer" || r.id==="waterlayer") { /*do nothing to these*/ }
					
					// Ignore graphics.
					else if(r.type ==="graphics") { /*do nothing to these*/  }

					// Turn everything else off.
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
					//Preset button should ignore certain layers
					if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
					else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
					else if(r.id === "graphics") {}
					// After much thought and experimentation, we want to ensure that the presets effectively 'reset' the layers and do not carry over previously selected layers.
					// But we went to a lot of trouble to build it, so just uncomment out the below to reverse that.
					//else if (lyrIDlist.includes(r.id)) { r.visible = true; }
					else { r.visible = false; }
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
					//Preset button should ignore certain layers
					if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
					else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
					else if(r.id === "graphics") {}
					// After much thought and experimentation, we want to ensure that the presets effectively 'reset' the layers and do not carry over previously selected layers.
					// But we went to a lot of trouble to build it, so just uncomment out the below to reverse that.
					//else if (lyrIDlist.includes(r.id)) { r.visible = true; }
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
		load_insp_preset: function(layerparams)
		{
			try{
				if(layerparams) { lyrIDlist = layerparams.split(',') }
				else {}
				durm.map.layers.items.forEach(function(r) {
					//Preset button should ignore certain layers
					if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
					else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
					else if(r.id === "graphics") {}
					// After much thought and experimentation, we want to ensure that the presets effectively 'reset' the layers and do not carry over previously selected layers.
					// But we went to a lot of trouble to build it, so just uncomment out the below to reverse that.
					//else if (lyrIDlist.includes(r.id)) { r.visible = true; }
					else { r.visible = false; }
				}); 	
				var inspection_layers =[durm.countymask]
				var allvisible = true;
				inspection_layers.forEach(function(r) {
					if(r.visible) {}
					else { allvisible = false; }
				});	
				if(allvisible) {//turn em off
					inspection_layers.forEach(function(r) { r.visible = false; });
				}
				else { //turn em on
					inspection_layers.forEach(function(r) { r.visible = true; });
				}
			} catch (e) { console.log(e); }			
		},
		load_storm_preset: function(layerparams) {
			try {
			if(layerparams) { lyrIDlist = layerparams.split(',') }
			else {}
			durm.map.layers.items.forEach(function(r) {
					//Preset button should ignore certain layers
					if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
					else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
					else if(r.id === "graphics") {}
					// After much thought and experimentation, we want to ensure that the presets effectively 'reset' the layers and do not carry over previously selected layers.
					// But we went to a lot of trouble to build it, so just uncomment out the below to reverse that.
					//else if (lyrIDlist.includes(r.id)) { r.visible = true; }
					else { r.visible = false; }
				}); 		  
			const wetland_layers = [durm.stormwatergroup,durm.impervious,durm.NWIlayer,durm.FEMA_risk_development,durm.TOPO_2ft,durm.countymask];
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
		load_utilities_preset: function(layerparams)
		{		
			try{
			if(layerparams) { lyrIDlist = layerparams.split(',') }
			else {}
			durm.map.layers.items.forEach(function(r) {
					//Preset button should ignore certain layers
					if(r.id === "parcels" || r.id === "active_address_points" || r.id === "countymask") {}
					else if(r.id=="graymap_roads" || r.id=="graymap_labels") {}
					else if(r.id === "graphics") {}
					// After much thought and experimentation, we want to ensure that the presets effectively 'reset' the layers and do not carry over previously selected layers.
					// But we went to a lot of trouble to build it, so just uncomment out the below to reverse that.
					//else if (lyrIDlist.includes(r.id)) { r.visible = true; }
					else { r.visible = false; }
			}); 	  
			let utilities_layers = [durm.countymask,durm.countymask];
			//if all the layers are visible, then turn them all off.   Otherwise, turn them on.
			var allvisible = true;
			utilities_layers.forEach(function(r) {
				if(r.visible) {}
				else { allvisible = false; }
			});			  
			if(allvisible) {
				utilities_layers.forEach(function(r) {
					r.visible = false;
				});
			}
			else {
				utilities_layers.forEach(function(r) {
					r.visible = true;
				});
			}	
			durm.map.add(durm.waterlayer);
			durm.waterlayer.visible = true;

			durm.map.add(durm.sewerlayer);	
			durm.sewerlayer.visible = true;	

			} catch (e) { console.log(e); }		
		},

    shrink_to_portrait_phone: function(){
			durm.mapView.ui.remove([durm.legend]);
			let fps = document.getElementById("devcase_form_panel")
			fps.style.display = "inline-block";		
			
			/*let fps = document.getElementsByClassName("ui_panel")
			for (let i = 0; i < fps.length; i++) {
				fps[i].style.display = "inline-block";
			}*/
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
				/*let fps = document.getElementsByClassName("ui_panel")
				for (let i = 0; i < fps.length; i++) {
					fps[i].style.display = "inline-block";
				}*/
		},
		init_layer_control: function(){
			try {
					lyrctrlscope = this;	
					durm.layerlistcategories = [];

					// Building the HTML list containers							
					durm.layertable_container = document.getElementById("layerpanel");
					durm.layertable_ul_nonvisible = document.getElementById("ul_layers");

					/* Building the Categories */
					durm.map.layers.items.forEach(function(r) {
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
					});

					/* Sort the layers alphabetically before we begin */
					//This messes with the layer draw order if r
					durm.map.layers.items.sort(function(a,b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);} );

					/* Building the individual list items */
					durm.map.layers.items.forEach(function(r) {
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
								if(r.visible) { 
									r.visible = false
									lyrctrlscope.ensure_not_in_url(r);
									console.log("inp.addEventListener fired ensure_not_in_url")
								} else { 
									r.visible = true 
									lyrctrlscope.add_to_url(r);
								}
								//If we were "Default",  change to "Custom"
								// But we learned the hard way :  People want to be able to click a user preset, then turn a layer on, and keep the preset,  so don't do this for Devcases/Zoning/Drainage/Util, only do it for default
								if(durm.app_state_string=="default"){lyrctrlscope.set_app_state("custom",durm.layer_state_string)}
								else{}
								//console.log(durm.app_state_string)
								//if(durm.app_state_string="default") { console.log("We detected default.")}
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
							watchUtils.whenTrue(r, "visible", function() {
								inp.checked = true;
								lyrctrlscope.add_to_url(r);
							});						
							watchUtils.whenFalse(r, "visible", function() {
								inp.checked = false;							
								lyrctrlscope.ensure_not_in_url(r);
								//console.log("watchUtils.whenFalse fired ensure_not_in_url")
							});
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

		// This is critical to layer ordering, what layers draw on top of one another, which all must be pre-set at the very beginning, ONCE and never changes.
		// This is very slow and very inefficient (blame ESRI on that) and is therefore only run at the beginning.
		// Don't try and get cute and re-work this to be a dynamic re-ordering situation unless you already understand the ramifications of calling the hellish reorder() function
		reorder_all_layers_to_default: function() {
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
		}

  };
});