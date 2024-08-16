/*
Matt Reames, 2020
This module is to manage the user interface
*/
define([

	], function(
    ) {
  	return {
		/*  init runs at the very beginning, before there is a 'mapview' and before there are layers.  */
		init: function(){
			try {
				//document.getElementById("bodycontainer").style.cursor = "progress";
				// Instantiate MDC Drawer
				const drawerEl = document.querySelector('.mdc-drawer');
				const drawer = new mdc.drawer.MDCDrawer.attachTo(drawerEl);
				// Instantiate MDC Top App Bar (required)
				const topAppBarEl = document.querySelector('.mdc-top-app-bar');
				const topAppBar = new mdc.topAppBar.MDCTopAppBar.attachTo(topAppBarEl);

				topAppBar.setScrollTarget(document.querySelector('.main-content'));
				topAppBar.listen('MDCTopAppBar:nav', () => {
					drawer.open = !drawer.open;
				});      

				drawer.open = false;
			} catch (e) { console.log(e); }
		}
  };
});