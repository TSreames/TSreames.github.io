/*
Matt Reames, 2019-2021
This module controls the basemap gallery
*/
define([
	  "esri/Basemap", 
	  "esri/portal/PortalItem",
		"esri/layers/VectorTileLayer", "esri/layers/ImageryLayer", "esri/layers/TileLayer"
    ], function(Basemap, PortalItem, VectorTileLayer, ImageryLayer, TileLayer
    ) {	
    return {
			populate_array_of_basemaps: function() {
				streetlabel_item = new PortalItem({ id: "30d6b8271e1849cd9c3042060001f425" });	  
				streetlabelVT = new VectorTileLayer({ 
					portalItem:streetlabel_item,
					lyr_zindex:9,
					listMode: "hide",
					layer_order:0
				});				

				durm.basemaparray = [];

				navigation_item = new PortalItem({ id: "c50de463235e4161b206d000587af18b" });	  
				navigation_basemap = new Basemap({ param:"0", parcelColor:"gray", portalItem:navigation_item });
				durm.basemaparray[0] = navigation_basemap;

				aerial_hybrid_item = new PortalItem({ id: "28f49811a6974659988fd279de5ce39f" });	  
				aerial_hybrid_basemap = new Basemap({ param:"1", title:"ESRI Aerials", parcelColor:"green", portalItem:aerial_hybrid_item });
				durm.basemaparray[1] = aerial_hybrid_basemap;	

				nearmap = new ImageryLayer({ 
					url:NEARMAP_URL,
					popupEnabled:false
				});				
				nearmapb = new Basemap({ param:"2", parcelColor:"green", title:"Nearmap Aerials ("+yearnum+")", baseLayers:[nearmap,streetlabelVT], thumbnailUrl: AERIAL_IMG });
				durm.basemaparray[2] = nearmapb;

				dark_grey_item = new PortalItem({ id: "358ec1e175ea41c3bf5c68f0da11ae2b" });	  
				dark_grey_basemap = new Basemap({ param:"3", portalItem:dark_grey_item, parcelColor:"gray" });
				durm.basemaparray[3] = dark_grey_basemap;
			
				//hillshade_tile is part of multiple different basemaps, fyi
				hillshade_tile = new TileLayer({ url:HILLSHADE_URL });
				hillshade_basemap = new Basemap({ param:"4", parcelColor:"gray", title:"Hillshade", baseLayers:[hillshade_tile], thumbnailUrl: "/img/hillshade.png" });
				durm.basemaparray[4] = hillshade_basemap; 

				// http://www.arcgis.com/home/group.html?id=30de8da907d240a0bccd5ad3ff25ef4a&start=1&view=list&sortOrder=asc&sortField=title#content 
				antique_item = new PortalItem({ id: "f35ef07c9ed24020aadd65c8a65d3754" });	  
				antique_basemap = new Basemap({ param:"5", portalItem:antique_item, parcelColor:"gray" }); // "Modern Antique Map"
				durm.basemaparray[5] = antique_basemap;

				light_grey_item = new PortalItem({ id: "979c6cc89af9449cbeb5342a439c6a76" });	  
				light_grey_basemap = new Basemap({ param:"6", portalItem:light_grey_item, parcelColor:"gray" });
				durm.basemaparray[6] = light_grey_basemap; // "Light Gray Canvas"
				
				swiss_item = new PortalItem({ id: "c29bcd10cc4d48749c4c05cc348fa754" });	  
				swiss_VT = new VectorTileLayer({ portalItem:swiss_item }); 
				swissb = new Basemap({ param:"7", parcelColor:"gray", title:"Swiss Style Basemap", baseLayers:[hillshade_tile,swiss_VT], thumbnailUrl: ICONSWISS_IMG });
				durm.basemaparray[7] = swissb;		
				
				terrain_with_labels_item = new PortalItem({ id: "a52ab98763904006aa382d90e906fdd5" });	  
				terrain_basemap = new Basemap({ param:"8", portalItem:terrain_with_labels_item, parcelColor:"gray" });
				durm.basemaparray[8] = terrain_basemap;  	  
				
				aerial_clarity_item  = new TileLayer({ url:CLARITY_URL });
				clarityb = new Basemap({ param:"9", parcelColor:"green", title:"ArcGIS Aerials (Clarity)", baseLayers:[aerial_clarity_item,streetlabelVT], thumbnailUrl: AERIAL_IMG });
				durm.basemaparray[9] = clarityb;
				
				usgs_item  = new TileLayer({ url:USGS_URL });
				usgsb = new Basemap({ param:"10", parcelColor:"gray", title:"USGS Topo Maps", baseLayers:[usgs_item], thumbnailUrl: USGS_IMG });
				durm.basemaparray[10] = usgsb;

				
				graymap_item = new VectorTileLayer({
					lyr_zindex:1,
					listMode: "hide",
					layer_order:0,
					url:GRAYBASE_BACKGROUND
				});

				graymapb = new Basemap({
					param:"11",
					lyr_zindex:4,
					parcelColor:"gray", title:"Durham Gray Basemap", baseLayers:[graymap_item], thumbnailUrl: GRAYBASE_IMG 
				})
				durm.basemaparray[11] = graymapb;
				
				durm.graymap_roads = new VectorTileLayer({
					id:"graymap_roads",
					lyr_zindex:5,
					listMode: "hide",
					layer_order:0,
					visible: false,
					url:GRAYBASE_ROADS_URL
				})
				durm.map.add(durm.graymap_roads);

				durm.graymap_labels = new VectorTileLayer({
					id:"graymap_labels",
					lyr_zindex:9,
					listMode: "hide",
					layer_order:0,
					visible: false,
					url:GRAYBASE_LABELS_URL
				})
				durm.map.add(durm.graymap_labels);	

				//this doesn't work on page load, only on clicks.
				durm.map.watch('basemap', function(e){
					if(e.param==11) {
						durm.graymap_roads.visible = true;
						durm.graymap_labels.visible = true;
					}    
					else {
						durm.graymap_roads.visible = false;
						durm.graymap_labels.visible = false;
					}    
				});
			},
			getDefaultBasemap: function(){
				return durm.basemaparray[11];
			},
			setBasemapID: function(bparam) {
				durm.map.basemap = durm.basemaparray[bparam];
				if(bparam==11) {
					durm.graymap_roads.visible = true;
					durm.graymap_labels.visible = true;				
				}
			},
    };
});
