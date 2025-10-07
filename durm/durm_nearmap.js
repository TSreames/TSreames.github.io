/*
Nearmap URL checking and path detection
Handles checking if Nearmap is accessible and triggering appropriate initialization path
*/

define([
], function() {
	return {
		checkNearmap: async function () {
			console.log("Checking Nearmap URL accessibility...");
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 4000);

			try {
				const response = await fetch(`${NEARMAP_URL}?f=pjson`, {
					method: "GET",
					mode: "cors",
					signal: controller.signal
				});

				clearTimeout(timeout);

				if (!response.ok) {
					console.log("Nearmap server returned non-OK status:", response.status);
					durm.use_nearmap = false;
				} else {
					const json = await response.json();

					if (json.error?.code === 498 || json.error) {
						console.log("Nearmap error:", json.error);
						durm.use_nearmap = false;
					} else {
						console.log("Nearmap is accessible.");
						durm.use_nearmap = true;
					}
				}

			} catch (error) {
				console.log("Nearmap fetch failed. Not adding aerials.");
				console.log(error);
				durm.use_nearmap = false;
			}


			//durm_aerials.add_aerials();   //i don't think we want to run this here. It is an option, though.

			durm._resolveNearmapCheck();
		},

		load_nearmap_into_aerial_list: async function(){

			//Feb 2024   1/28 - 2/15

			//May 2024 -  5/27 to 6/1


			durm.nearmap2025_winter = new ImageryLayer({
				id: "nearmap2025_winter",
				title: "2025 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2025-1-25 20:10:05' AND TIMESTAMP '2025-1-30 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2025_winter);


			durm.nearmap2024_fall = new ImageryLayer({
				id: "nearmap2024_fall",
				title: "2024 Nearmap Aerials, Oct",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2024-10-20 20:10:05' AND TIMESTAMP '2024-11-10 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2024_fall);






			durm.nearmap2024_summer = new ImageryLayer({
				id: "nearmap2024_summer",
				title: "2024 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2024-05-27 20:10:05' AND TIMESTAMP '2024-06-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2024_summer);

			durm.nearmap2024_spring = new ImageryLayer({
				id: "nearmap2024_spring",
				title: "2024 Nearmap Aerials, February",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2024-01-26 20:10:05' AND TIMESTAMP '2024-02-15 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2024_spring);

			durm.nearmap2023_fall = new ImageryLayer({
				id: "nearmap2023_fall",
				title: "2023 Nearmap Aerials, October",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-10-01 20:10:05' AND TIMESTAMP '2023-10-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_fall);


			durm.nearmap2023_spring = new ImageryLayer({
				id: "nearmap2023_spring",
				title: "2023 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-05-04 20:10:05' AND TIMESTAMP '2023-05-11 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_spring);

			durm.nearmap2023_winter = new ImageryLayer({
				id: "nearmap2023_winter",
				title: "2023 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2023-01-22 20:10:05' AND TIMESTAMP '2023-01-28 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2023_winter);


			durm.nearmap2022_fall = new ImageryLayer({
				id: "nearmap2022_fall",
				title: "2022 Nearmap Aerials, Oct",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-10-16 20:10:05' AND TIMESTAMP '2022-10-19 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_fall);

			durm.nearmap2022_spring2 = new ImageryLayer({
				id: "nearmap2022_spring2",
				title: "2022 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-05-01 20:10:05' AND TIMESTAMP '2022-07-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_spring2);

			durm.nearmap2022_spring1 = new ImageryLayer({
				id: "nearmap2022_spring1",
				title: "2022 Nearmap Aerials, Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2022-02-01 20:10:05' AND TIMESTAMP '2022-02-07 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2022_spring1);

			durm.nearmap2021_fall = new ImageryLayer({
				id: "nearmap2021_fall",
				title: "2021 Nearmap Aerials, Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-11-01 20:10:05' AND TIMESTAMP '2021-12-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_fall);


			durm.nearmap2021_spring2 = new ImageryLayer({
				id: "nearmap2021_spring2",
				title: "2021 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-05-01 20:10:05' AND TIMESTAMP '2021-06-05 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_spring2);

			durm.nearmap2021_spring1 = new ImageryLayer({
				id: "nearmap2021_spring1",
				title: "2021 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2021-01-01 20:10:05' AND TIMESTAMP '2021-02-05 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2021_spring1);
			
			durm.nearmap2020_fall = new ImageryLayer({
				id: "nearmap2020_fall",
				title: "2020 Nearmap Aerials, Sep",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-09-01 20:10:05' AND TIMESTAMP '2020-10-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_fall);	

			durm.nearmap2020_spring2 = new ImageryLayer({
				id: "nearmap2020_spring2",
				title: "2020 Nearmap Aerials, May-Jun",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-05-01 20:10:05' AND TIMESTAMP '2020-07-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_spring2);	

			durm.nearmap2020_spring1 = new ImageryLayer({
				id: "nearmap2020_spring1",
				title: "2020 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2020-01-01 20:10:05' AND TIMESTAMP '2020-02-02 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2020_spring1);	

			durm.nearmap2019_fall = new ImageryLayer({
				id: "nearmap2019_fall",
				title: "2019 Nearmap Aerials, Oct-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-10-01 20:10:05' AND TIMESTAMP '2019-12-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_fall);	

			durm.nearmap2019_spring2 = new ImageryLayer({
				id: "nearmap2019_spring2",
				title: "2019 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-05-01 20:10:05' AND TIMESTAMP '2019-06-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_spring2);	

			durm.nearmap2019_spring1 = new ImageryLayer({
				id: "nearmap2019_spring1",
				title: "2019 Nearmap Aerials, Jan",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2019-01-01 20:10:05' AND TIMESTAMP '2019-02-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2019_spring1);	

			durm.nearmap2018_fall = new ImageryLayer({
				id: "nearmap2018_fall",
				title: "2018 Nearmap Aerials, Sep-Oct",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2018-09-01 20:10:05' AND TIMESTAMP '2018-11-01 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2018_fall);	

			durm.nearmap2018_spring = new ImageryLayer({
				id: "nearmap2018_spring",
				title: "2018 Nearmap Aerials, Jan-Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2018-01-01 20:10:05' AND TIMESTAMP '2018-02-26 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2018_spring);	

			durm.nearmap2017_fall = new ImageryLayer({
				id: "nearmap2017_fall",
				title: "2017 Nearmap Aerials, Sep-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-09-01 20:10:05' AND TIMESTAMP '2017-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_fall);	

			durm.nearmap2017_spring2 = new ImageryLayer({
				id: "nearmap2017_spring2",
				title: "2017 Nearmap Aerials, May",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-05-01 20:10:05' AND TIMESTAMP '2017-05-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_spring2);			

			durm.nearmap2017_spring1 = new ImageryLayer({
				id: "nearmap2017_spring1",
				title: "2017 Nearmap Aerials, Jan-Feb",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2017-01-01 20:10:05' AND TIMESTAMP '2017-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2017_spring1);					

			durm.nearmap2016_fall = new ImageryLayer({
				id: "nearmap2016_fall",
				title: "2016 Nearmap Aerials, Sep",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2016-09-01 20:10:05' AND TIMESTAMP '2016-09-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2016_fall);							

			durm.nearmap2016_spring = new ImageryLayer({
				id: "nearmap2016_spring",
				title: "2016 Nearmap Aerials, Feb-Mar",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2016-02-01 20:10:05' AND TIMESTAMP '2016-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2016_spring);				

			durm.nearmap2015_fall = new ImageryLayer({
				id: "nearmap2015_fall",
				title: "2015 Nearmap Aerials, Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2015-11-01 20:10:05' AND TIMESTAMP '2015-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2015_fall);

			durm.nearmap2015_spring = new ImageryLayer({
				id: "nearmap2015_spring",
				title: "2015 Nearmap Aerials, Mar",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2015-03-01 20:10:05' AND TIMESTAMP '2015-03-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2015_spring);

			durm.nearmap2014 = new ImageryLayer({
				id: "nearmap2014",
				title: "2014 Nearmap Aerials, Oct-Nov",
				listMode: "hide",
				listcategory: "Aerial Photos, Historical",
				layer_order:0,
				lyr_zindex:1,
				url: NEARMAP_URL,
				loadingtype: "nearmap",
				icon: "DUR",
				visible: false, legendEnabled: false, popupEnabled: false,
				opacity:1,
				minScale:0,
				maxScale:564,
				popupEnabled:false,
				definitionExpression: "acquisitiondate BETWEEN TIMESTAMP '2014-10-01 20:10:05' AND TIMESTAMP '2014-11-29 20:20:20'"
			});				
			pplt.add_to_map(durm.nearmap2014);
			//Nearmap items used to load here.

			pplt.add_all_layers_to_map(aerials2load);

			//durm_slider.init_aerial_slider();

		
			console.log("Aerials and Historical Imagery loaded");
		}
		
	};
});