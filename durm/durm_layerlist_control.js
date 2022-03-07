define(["esri/core/watchUtils"
		], function(watchUtils
    ) {
    return {
		/* Everything below here is related to the core layer operations.   */
		/**
		 * We've manually assigned 'categories' to each layer. (i.e. Utilities, Environmental, etc) as well as a z-index
		 * 
		 * Originally this was planned to allow the user to drag the item in the list to change the draw order on the map, but we were thwarted by esri's shitty re-ordering function
		 */
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
							} else { 
								r.visible = true 
							}
						});

						var lab = document.createElement('label')
						lab.style.display = "block"
						lab.style.margin = 0;
						lab.classList.add("onoffswitch-label")
						lab.htmlFor = random_id
						onoff.appendChild(lab)
						var switch1 = document.createElement('span')
						switch1.style.display = "block"
						switch1.classList.add("onoffswitch-inner")
						lab.appendChild(switch1)
						var switch2 = document.createElement('span')
						switch2.style.display = "block"
						switch2.classList.add("onoffswitch-switch")
						lab.appendChild(switch2)
						newli.appendChild(onoff)
						var newtext = document.createElement('span')
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
							durm_ui.set_layer_state();

						});						
						watchUtils.whenFalse(r, "visible", function() {
							inp.checked = false;							
							durm_ui.set_layer_state();
						});

					}
				});

				//lyrscope.update_layer_draw_order_based_on_lyr_zindex(); // run once at beginning of app
			} catch (e) { console.log(e); }
		},



		// This is very slow and very inefficient and is only run at the beginning.
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