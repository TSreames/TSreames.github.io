//parcels
var wakeparcelboundaryRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [204, 0, 102, 0.8],
	  width: 0.75,
	}
  }
};
var orangeparcelboundaryRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [204, 102, 0, 0.8],
	  width: 0.75,
	}
  }
};
var parcelboundaryRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [124, 124, 124, 0.6],
	  width: 0.5,
	}
  }
};

var PINlabelsRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [0, 0, 0, 0.0],
	  width: 0,
	}
  }
};

var parcelidlabelsRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [0, 0, 0, 0.0],
	  width: 0,
	}
  }
};


var green_parcelboundaryRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [0, 0, 0, 0],
	outline: {
	  color: [99, 161, 69, 0.8],
	  width: 0.5,
	}
  }
};

var thicc_parcelboundaryRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [168, 74, 52, 0.1],
	outline: {
	  color: [50, 50, 162, 1],
	  width: 1.5,
	}
  }
};

//NPO
var NPORenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [255, 255, 0, 0.2],
	outline: {
	  color: [255, 255, 20, 0.8],
	  width: 2,
	}
  }
};

//Historic Districts
var HDRenderer = {
  type: "simple",
  symbol: {
	type: "simple-fill", // autocasts as new SimpleFillSymbol()
	color: [103, 141, 48, 0.2],
	outline: {
	  color: [103, 141, 55, 0.8],
	  width: 2,
	}
  }
};

//development cases
var renderer_cases = {
	type: "unique-value",
	defaultSymbol: graysquare,
	uniqueValueInfos: [
    {
			value: "Annexation Petition",
      symbol: yellowsquare
		},{
			value: "Board of Adjustment Cases",
      symbol: greensquare
    },{
      value: "Common Signage Plan Review",  
      symbol: purplesquare  
    }, {
      value: "Comprehensive Plan Amendment",  
      symbol: whitesquare 
    }, {
      value: "Home Occupation Permit",  
      symbol: orangesquare 
    }, {
      value: "Historic District Cases",  
      symbol: bluesquare 
    }, {
      value: "Major Special Use Permit",  
      symbol: redcircle 
    }, {
      value: "Site Plans and Preliminary Plats",  
      symbol: bluecircle 
    }, {
      value: "Statutory Vested Rights Determination",  
      symbol: greencircle 
    }, {
      value: "Street Closing or Renaming",  
      symbol: yellowcircle 
    }, {
      value: "Subdivisions",  
      symbol: redsquare 
    }, {
      value: "Variance",  
      symbol: orangecircle 
    }, {
      value: "Zoning Map Change",  
      symbol: purplecircle 
	}	
	]};
	renderer_cases.valueExpression = `
	var type = $feature.A_TYPE;
	var lbl = "";
	if (type == 'PL_ANEX') {lbl="Annexation Petition"}
	else if (type == 'PL_SUP') {lbl="Board of Adjustment Case"}
	else if (type == 'PL_APPEAL') {lbl="Board of Adjustment Case"}
	else if (type == 'PL_CSPR') {lbl="Common Signage Plan Review"}
	else if (type == 'PL_CPAA') {lbl="Comprehensive Plan Amendment"}
	else if (type == 'PL_HOP') {lbl="Home Occupation Permit"}
	else if (type == 'PL_MAJSUP') {lbl="Major Special Use Permit"}
	else if (type == 'PL_TSUP') {lbl="Major Special Use Permit"}
	else if (type == 'PL_ADR') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_DDO') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_ASP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_SSP_SM2') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_SSP_SM') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_SSP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_MINSP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_MINPP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_CCPP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_MAJSP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_MAJPP') {lbl="Site Plans and Preliminary Plats"}
	else if (type == 'PL_ACOA') {lbl="Historic District Cases"}
	else if (type == 'PL_DEM') {lbl="Historic District Cases"}
	else if (type == 'PL_HDD') {lbl="Historic District Cases"}
	else if (type == 'PL_HLD') {lbl="Historic District Cases"}
	else if (type == 'PL_MJ_COA') {lbl="Historic District Cases"}
	else if (type == 'PL_COA') {lbl="Historic District Cases"}
	else if (type == 'PL_SVRD') {lbl="Statutory Vested Rights Determination"}
	else if (type == 'PL_STREET') {lbl="Street Closing or Renaming"}
	else if (type == 'PL_SR') {lbl="Street Closing or Renaming"}
	else if (type == 'PL_VAR') {lbl="Variance"}
	else if (type == 'FIN_EXE') {lbl="Subdivisions"}
	else if (type == 'FIN_MAJ') {lbl="Subdivisions"}
	else if (type == 'I_REZ') {lbl="Zoning Map Change"}
	else if (type == 'D_REZ') {lbl="Zoning Map Change"}
  return lbl;
`;


const caseLayer_popup = {title:"Development Cases",content:[{
	type: "fields",
	fieldInfos: [{
		fieldName: "A_NUMBER",
		label: "Case Number"
		},{
			fieldName: "AppStatus",
			label: "Status"
		},{
			fieldName: "A_STATUS_DATE",
			label: "Last Status Update"
		},{
			fieldName: "A_DATE",
			label: "Application Date"
		},{
			fieldName: "A_PROJECT_NAME",
			label: "Case Title"
		},{
			fieldName: "AppType",
			label: "Case Type"
		},{
			fieldName: "A_DESCRIPTION",
			label: "Case Description"
		},{
			fieldName: "CasePlanner",
			label: "Case Planner"
		},{
			fieldName: "EMAIL",
			label: "Case Planner EMail"
		}]
	}]
}