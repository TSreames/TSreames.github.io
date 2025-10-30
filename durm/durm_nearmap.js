/*
Nearmap URL checking and path detection
Handles checking if Nearmap is accessible and triggering appropriate initialization path
*/

define([
	"esri/layers/WMSLayer",
	"esri/layers/support/WMSSublayer",
	"../durm/durm_ui.js",
	// ARCHIVED: These imports are for ImageLayer approach (kept for future use)
	// "esri/portal/PortalItem","esri/portal/Portal","esri/layers/Layer",
	// "esri/layers/VectorTileLayer",
	// "esri/portal/PortalItem"
], function(
	WMSLayer,
	WMSSublayer,
	durm_ui
) {
	// Module-scoped variables
	let dateIndex = null;
	let nearmapBaseLayer = null;
	let capabilitiesCache = null; // Cached layer data from GetCapabilities XML

	// NEARMAP_WMS_URL = base URL for creating WMS layers (defined in services.js)
	// NEARMAP_WMS_GETCAPABILITIES_URL = GetCapabilities URL for checking availability (defined in services.js)
	return {
		// ==========================================
		// ACTIVE WMS FUNCTIONS
		// These functions are currently in use for the WMS-based Nearmap system
		// ==========================================

		// Load and verify Nearmap WMS Layer accessibility
		// Called by add_aerials_HYBRID in durm_aerials.js
		load_nearmap_for_WMSLAYER: async function () {
			//console.log("Creating Nearmap WMS Layer...");

			try {
				nearmapBaseLayer = new WMSLayer({
					url: NEARMAP_WMS_URL,  // Base URL - ESRI adds WMS params automatically
					version: "1.1.1",   // Nearmap WMS 2.0 is based on 1.1.1
					imageFormat: "image/png",
					transparent: true
				});

				await nearmapBaseLayer.load();

				//console.log("Nearmap WMS item loaded successfully.");
				//console.log("  Total sublayers:", nearmapBaseLayer.allSublayers.length);
				//console.log("  Sublayers initially visible:", nearmapBaseLayer.allSublayers.filter(sl => sl.visible).length);

				durm.use_nearmap = true;

				// Return the loaded WMS layer
				return {
					wmsLayer: nearmapBaseLayer
				};

			} catch (error) {
				console.log("Nearmap WMS layer check failed:", error);
				durm.use_nearmap = false;
				return null;
			}
		},
		// Initialize the base Nearmap layer and build date index with smart grouping
		init: async function() {
				try {
						// Build an index of ALL sublayers by date
						const rawDateIndex = new Map(); // Map<isoDate, Array<{name, title}>>
						// Accept single-digit months/days and common Unicode hyphens (\u2010-\u2015)
						const dateRegex = /\b(20\d{2})[\-\/\u2010-\u2015](\d{1,2})[\-\/\u2010-\u2015](\d{1,2})\b/;

						datelist = ""

						nearmapBaseLayer.allSublayers.forEach(sl => {
								const text = `${sl.name} ${sl.title}`;
								const m = text.match(dateRegex);
								if (m) {
										// Zero-pad month and day for consistent ISO format
										const year = m[1];
										const month = m[2].padStart(2, '0');
										const day = m[3].padStart(2, '0');
										const iso = `${year}-${month}-${day}`; // YYYY-MM-DD

										datelist += " "
										datelist += iso

										// Store multiple sublayers per date (handles duplicates like "Raleigh 2")
										if (!rawDateIndex.has(iso)) {
												rawDateIndex.set(iso, []);
										}
										rawDateIndex.get(iso).push({ name: sl.name, title: sl.title });
								}
						});

						alert(`Found ${rawDateIndex.size} unique dates with sublayers
							${datelist}
							
							`);

						// Group dates within 14-day windows
						dateIndex = this.groupDatesByProximity(rawDateIndex, 14);

						console.log(`Grouped into ${dateIndex.size} aerial layer groups`);
						return true;
				} catch(e) {
						console.log("Nearmap initialization failed:", e);
						return false;
				}
		},

		// Group dates within a proximity window and merge all sublayers
		groupDatesByProximity: function(rawDateIndex, windowDays) {
				const grouped = new Map(); // Map<groupKey, {sublayers: Array, startDate: Date, endDate: Date}>

				// Sort all dates chronologically
				const sortedDates = Array.from(rawDateIndex.keys()).sort();

				let groupIndex = 0;
				let currentGroup = null;
				let currentGroupEndMs = null;
				const windowMs = windowDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

				sortedDates.forEach(isoDate => {
						// Parse YYYY-MM-DD explicitly as UTC to avoid timezone interpretation
						const parts = isoDate.split('-').map(Number);
						const currentDateMs = Date.UTC(parts[0], parts[1] - 1, parts[2]);
						const sublayers = rawDateIndex.get(isoDate);

						// Start a new group if we don't have one, or if current date is outside the window
						if (!currentGroup || currentDateMs > currentGroupEndMs) {
								groupIndex++;
								const groupKey = `group_${groupIndex}`;

								currentGroup = {
										sublayers: [],
										startDateMs: currentDateMs,
										endDateMs: currentDateMs,
										isoStart: isoDate,
										isoEnd: isoDate
								};

								// Set the window end to N days from start (in milliseconds)
								currentGroupEndMs = currentDateMs + windowMs;

								grouped.set(groupKey, currentGroup);
						}

						// Add all sublayers from this date to the current group (merges duplicates)
						currentGroup.sublayers.push(...sublayers);

						// Update end date
						if (currentDateMs > currentGroup.endDateMs) {
								currentGroup.endDateMs = currentDateMs;
								currentGroup.isoEnd = isoDate;
						}
				});

				// Convert grouped data to the format expected by create_nearmap_virtual_layer_for_WMSLAYER
				// We'll use the isoStart as the map key for compatibility
				const finalIndex = new Map();

				grouped.forEach((group, key) => {
						// Generate friendly title using UTC milliseconds
						const title = this.generateGroupTitle(group.startDateMs, group.endDateMs);

						finalIndex.set(group.isoStart, {
								sublayers: group.sublayers,
								startDate: group.isoStart,
								endDate: group.isoEnd,
								title: title
						});
				});

				return finalIndex;
		},


		// Generate friendly title like "2022 Nearmap Aerials, Jan-Feb"
		// Accepts UTC milliseconds (startDateMs, endDateMs) to avoid timezone issues
		generateGroupTitle: function(startDateMs, endDateMs) {
				const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

				// Extract UTC year and month from milliseconds
				const startDate = new Date(startDateMs);
				const endDate = new Date(endDateMs);
				const year = startDate.getUTCFullYear();
				const startMonth = startDate.getUTCMonth();
				const endMonth = endDate.getUTCMonth();

				if (startMonth === endMonth) {
						// Same month
						return `${year} Nearmap Aerials, ${monthNames[startMonth]}`;
				} else {
						// Spans months
						return `${year} Nearmap Aerials, ${monthNames[startMonth]}-${monthNames[endMonth]}`;
				}
		},
		getDateIndex: function() {
			return dateIndex;
		}
	};
});
