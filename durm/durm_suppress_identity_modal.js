//
// the purpose of this class is to have two modes
// in one NO_LOGIN_MODE, esri-identity-modal css class is suppressed somehow. it, and all its subclasses, are not visible.  This is an OVERRIDE ESRI mode.
// in the other, TYPICAL_ESRI_MODE, esri-identity-modal is whatever the defaults are, loaded by esri


// NO_LOGIN_MODE is the default
//The ONLY thing that turns on "TYPICAL_ESRI_MODE" is durm_ui.load_utilities
//The ONLY thing that turns off "TYPICAL_ESRI_MODE" is durm_ui.unload_utilities  (changes back to NO_LOGIN_MODE)



define([
	"esri/core/reactiveUtils",
	"esri/widgets/Print","esri/widgets/Expand","esri/widgets/BasemapGallery"
	], function(//watchUtils,
		reactiveUtils,
		Print, Expand, BasemapGallery
    ) {
  	return {
		/*  Modes
		   - NO_LOGIN_MODE (default): injects CSS that hides .esri-identity-modal and descendants
		   - TYPICAL_ESRI_MODE: removes the injected CSS so Esri's default modal styles apply
		*/
		init: function () {
            console.log("[durm_suppress_identity_modal] init");
			// idempotent init; we don't assume DOM ready beyond document.head availability
			this._styleId = 'durm-suppress-identity-style';
			this._mode = 'NO_LOGIN_MODE';
			this.onModeChange = null; // optional hook: function(newMode) {}
			// ensure suppression is applied by default
			try {
				this._applySuppression();
			} catch (e) { console.log(e); }
		},

		/** Returns true when in TYPICAL_ESRI_MODE (i.e. suppression removed) */
		isTypicalEsriMode: function () {
			return this._mode === 'TYPICAL_ESRI_MODE';
		},

		/** Enable Esri's typical mode (remove suppression) */
		enableTypicalEsriMode: function () {
			if (this._mode === 'TYPICAL_ESRI_MODE') return;
			this._mode = 'TYPICAL_ESRI_MODE';
			this._removeSuppression();
			if (typeof this.onModeChange === 'function') try { this.onModeChange(this._mode); } catch (e) { console.log(e); }
		},

		/** Disable Esri login UI (apply suppression) */
		disableTypicalEsriMode: function () {
			if (this._mode === 'NO_LOGIN_MODE') return;
			this._mode = 'NO_LOGIN_MODE';
			this._applySuppression();
			if (typeof this.onModeChange === 'function') try { this.onModeChange(this._mode); } catch (e) { console.log(e); }
		},

		// internal: inject suppression stylesheet (idempotent)
		_applySuppression: function () {
			var id = this._styleId;
			if (!document || !document.head) return;
			if (document.getElementById(id)) return; // already applied
			var css = '' +
			  '.esri-identity-modal, .esri-identity-modal * { display: none !important; visibility: hidden !important; opacity: 0 !important; }' +
			  '.esri-identity-modal { pointer-events: none !important; }';
			var style = document.createElement('style');
			style.id = id;
			style.setAttribute('type', 'text/css');
			if (style.styleSheet) { style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); }
			document.head.appendChild(style);
		},

		// internal: remove suppression stylesheet (idempotent)
		_removeSuppression: function () {
			var id = this._styleId;
			if (!document || !document.head) return;
			var el = document.getElementById(id);
			if (el) el.parentNode.removeChild(el);
			// also try to restore inline style on any existing modal element
			try {
				var modal = document.querySelector('.esri-identity-modal');
				if (modal) {
					modal.style.display = '';
					modal.style.visibility = '';
					modal.style.opacity = '';
					modal.style.pointerEvents = '';
				}
			} catch (e) { /* ignore */ }
		},

    }
});