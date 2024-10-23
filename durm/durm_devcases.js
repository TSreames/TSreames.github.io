/*
Matt Reames, 2019
This module is to manage Development Cases and their display
*/
define([
		],
		function() {
    return {	
			render_development_cases: function() {
				
				//1 date
				let date_range_selection = "";
				startdate = document.getElementById('startdate').value + ' 00:00:00';
				enddate = document.getElementById('enddate').value + ' 00:00:00';
				date_range_selection = "(A_DATE >= date '" + startdate + "' AND A_DATE <= date '" + enddate + "') AND ";
				//2 type
				let case_type_selection = ""
				case_type_selection = document.getElementById('case-type').value.concat(" AND ");

				//3 status
				let case_status_selection = "";
				case_status_selection = document.getElementById('case-status').value;

				let final_query_string = date_range_selection + case_type_selection + case_status_selection;
				this.setCaseDefinitionExpression(final_query_string);	
				
				durm.caseLayer
					.when(() => {
						return durm.caseLayer.queryExtent();						
					})
					.then((response) => {	
						durm.mapView.goTo({
							extent:response.extent
						});
						durm.caseLayer.refresh()
						durm.caseLayer.visible = true;						
					});					
			},

			setCaseDefinitionExpression: function(new_query_string){
				durm.caseLayer.definitionExpression = new_query_string;
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

