//var APPROVED = "(AppStatus = 'Approved' OR AppStatus = 'Approved With Conditions')"; 
//var UNDER_REVIEW = "(AppStatus = 'Approvals Received' OR AppStatus = 'Complete' OR AppStatus ='Corrections Required' OR AppStatus = 'Under Review' OR AppStatus = 'Received')"; 
//Statuses
var ALL_STATUSES = {
	label: "All",
	defquery: "(1=1)"
}
var APPROVED = {
	label: "Approved",
	defquery: "(AppStatus = 'Approved' OR AppStatus = 'Approved With Conditions')"
}
var UNDER_REVIEW = {
	label: "Under Review",
	defquery: "(AppStatus = 'Approvals Received' OR AppStatus = 'Complete' OR AppStatus ='Corrections Required' OR AppStatus = 'Under Review' OR AppStatus = 'Received')"
}
//
//Types
var ALL_CASES = {
	label: "All",
	defquery: "(1=1)"
}
var ANNEXATION_PETITION = {
	label: "Annexation Petitions",
	defquery: "(A_TYPE = 'PL_ANEX')"
};
var BOA_CASES = {
	label: "Board of Adjustment Cases",
	defquery: "(A_TYPE = 'PL_APPEAL' OR A_TYPE = 'PL_SUP')"
};
var COMMON_SIGNAGE_PLAN_REVIEW = {
	label: "Common Signage Plan Review",
	defquery: "(A_TYPE = 'PL_CSPR')"
};
var COMPREHENSIVE_PLAN_AMENDMENT = {
	label: "Comprehensive Plan Amendment",
	defquery: "(A_TYPE = 'PL_CPAA')"
};
var HISTORIC_DISTRICT_CASES = {
	label: "Historic District Cases",
	defquery: "(A_TYPE = 'PL_ACOA' OR A_TYPE = 'PL_DEM' OR A_TYPE = 'PL_HDD' OR A_TYPE = 'PL_HLD' OR A_TYPE = 'PL_MJ_COA' OR A_TYPE = 'PL_COA')"
};
var HOME_OCCUPATION_PERMITS = {
	label: "Home Occupation Permit",
	defquery:"(A_TYPE = 'PL_HOP')"
};
var MAJOR_SPECIAL_USE_PERMITS = {
	label: "Major Special Use Permit",
	defquery:"(A_TYPE = 'PL_MAJSUP' OR A_TYPE = 'PL_TSUP')"
};
var SITE_PLAN_PRELIM_PLAT = {
	label: "Site Plans and Preliminary Plats",
	defquery:"(A_TYPE = 'PL_ADR' OR A_TYPE = 'PL_DDO' OR A_TYPE = 'PL_ASP' OR A_TYPE = 'PL_SSP_SM2' OR A_TYPE = 'PL_SSP_SM' OR A_TYPE = 'PL_SSP' OR A_TYPE = 'PL_MINSP' OR A_TYPE = 'PL_MINPP' OR A_TYPE = 'PL_CCPP' OR A_TYPE = 'PL_MAJSP' OR A_TYPE = 'PL_MAJPP')"
};
var STATUTORY_VESTED_RIGHTS = {
	label: "Statutory Vested Rights Determination",
	defquery:"(A_TYPE = 'PL_SVRD')"
};
var STREET_CLOSING_RENAMING = {
	label: "Street Closing or Renaming",
	defquery:"(A_TYPE = 'PL_STREET' OR A_TYPE = 'PL_SR')"
};
var SUBDIVISIONS = {
	label: "Subdivisions",
	defquery:"(A_TYPE = 'FIN_EXE' OR A_TYPE = 'FIN_MAJ')"
};
var VARIANCE = {
	label: "Variance",
	defquery:"(A_TYPE = 'PL_VAR')"
};
var ZONING_MAP_CHANGE = {
	label: "Zoning Map Change",
	defquery:"(A_TYPE = 'I_REZ' OR A_TYPE = 'D_REZ')"
};
	
const CASETYPE_DEFINITION_ARRAY = [ALL_CASES,ANNEXATION_PETITION,BOA_CASES,COMMON_SIGNAGE_PLAN_REVIEW,COMPREHENSIVE_PLAN_AMENDMENT,HOME_OCCUPATION_PERMITS,MAJOR_SPECIAL_USE_PERMITS,SITE_PLAN_PRELIM_PLAT,STATUTORY_VESTED_RIGHTS,STREET_CLOSING_RENAMING,SUBDIVISIONS,VARIANCE,ZONING_MAP_CHANGE]
const CASESTATUS_DEFINITION_ARRAY = [ALL_STATUSES,APPROVED,UNDER_REVIEW]
	
var state_plane_proj = '+proj=lcc +lat_1=36.16666666666666 +lat_2=34.33333333333334 +lat_0=33.75 +lon_0=-79 +x_0=609601.2192024384 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
var wgs84_proj = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';