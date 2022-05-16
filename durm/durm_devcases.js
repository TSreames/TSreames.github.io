/*
Matt Reames, 2019
This module is to manage Development Cases and their display
*/
define([
		],
		function() {
    return {	
			render_development_cases: function() {			
				durm.final_query_string = "";

				//1 date
				let date_range_selection = "";
				startdate = document.getElementById('startdate').value;
				enddate = document.getElementById('enddate').value;
				date_range_selection = "(A_DATE >= '" + startdate + "' AND A_DATE <= '" + enddate + "') AND ";

				//2 type
				let case_type_selection = ""
				case_type_selection = document.getElementById('case-type').value.concat(" AND ");

				//3 status
				let case_status_selection = "";
				case_status_selection = document.getElementById('case-status').value;

				durm.final_query_string = date_range_selection + case_type_selection + case_status_selection;
				this.setCaseDefinitionExpression(durm, durm.final_query_string);	
			},

			setCaseDefinitionExpression: function(durm, new_query_string){
				durm.caseLayer.definitionExpression = new_query_string;
				if (!durm.caseLayer.visible) {durm.caseLayer.visible = true;}
				return this.draw_cases(durm);		
			},		
			draw_cases: function(durm){
				durm.initial_case_query = durm.caseLayer.createQuery();
				durm.new_case_set = durm.caseLayer.queryFeatures(durm.initial_case_query).then(function(response) {
						durm.caseGeometries = response.features.map(function(feature) {
							return feature.geometry;
						});				  
				return durm.caseGeometries;
				}); 
				return durm.new_case_set;	
			},
			buildCaseTypeSelect: function() {
				CASETYPE_DEFINITION_ARRAY.forEach(function(value) {
					var option = document.createElement("option")
					option.text =  value.label;
					option.value = value.defquery;
					durm.caseTypeSelect.add(option);
				});
				let as = document.getElementById('case-status')
				as.checked = true;
			},
			buildCaseStatusSelect: function() {
				CASESTATUS_DEFINITION_ARRAY.forEach(function(value) {
					var option = document.createElement("option");
					option.text =  value.label;
					option.value = value.defquery;
					durm.caseStatusSelect.add(option);
				});
				let at = document.getElementById('case-type')
				at.checked = true;
			}			
    };
});

