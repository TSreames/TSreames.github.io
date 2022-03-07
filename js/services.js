const url_for_county_photos = "https://image-cdn.spatialest.com/image/durham-images/lrg/"
const geometryservice_url = "https://webgis.durhamnc.gov/server/rest/services/Utilities/Geometry/GeometryServer"
const DURHAM_PORTAL_URL = "https://webgis.durhamnc.gov/portal"
const PRINT_SERVICE_URL = "https://webgis.durhamnc.gov/server/rest/services/Tools/ESRIExportWebMap/GPServer/Export%20Web%20Map"

//administrative
const ZIPCODE_SUB = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/0"
const CITY_BOUNDARY = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/1"
const PARKS_IMPACT_FEE_ZONES = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/7"
const OPENSPACEIMPACTFEEZONE_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/8"
const STREETS_IMPACT_FEE_ZONES = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/9"
const RTP_BOUNDARY_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/11"
const PAC_DISTRICTS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/12"
const CODE_ENF_OFF_AREAS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/13"
const SOLID_WASTE_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/6" 
const ADDRESS_FS_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Active_Addresses/FeatureServer/0"
const COUNTY_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/2"

//community
const PARKS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/8"
const TRAILS_ALL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/"
const TRAILS_SUB = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/6"
const SIDEWALKS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/5"
const RECANDAQUA = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/7"

//electoral
const COUNCIL_WARDS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/3"
const SCHOOL_BOARD_DIST = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/7"
const US_CONG_DIST = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/6"
const NCSENATE_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/5"
const NCHOUSE_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/4"

//education
const ELEM1920_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2019_2020/MapServer"
const ELEM2021_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2020_2021/MapServer"
const ELEM2122_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2021_2022/MapServer"
const ELEM2223_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2022_2023/MapServer"

const MID1920_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2019_2020/MapServer"
const MID2021_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2020_2021/MapServer"
const MID2122_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2021_2022/MapServer"
const MID2223_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2022_2023/MapServer"

const HIGH1920_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2019_2020/MapServer"
const HIGH2021_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2020_2021/MapServer"
const HIGH2122_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2021_2022/MapServer"
const HIGH2223_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2022_2023/MapServer"

//environmental
const IMPERV_URL = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Impervious_Surfaces/MapServer"
const TOPO_2ft = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Topographic_Contours_2ft/MapServer"

//floodzones
const FIRM2018D_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Development/MapServer"
const FIRM2018D_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Development/MapServer/0"
const FIRM2018I_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Insurance/MapServer"
const FIRM2018I_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Insurance/MapServer/0"

//inspections
const CO_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/11"

//planning
const WATERSHED_PROTECTION_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/3"
const NPO_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/0";
const DEVELOPMENT_TIERS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/5";
const DEVELOPMENT_TIERS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/5"; 
const PLANNING_BASE_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/";

const ZONINGURL = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Zoning/MapServer"
const ZONINGURL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Zoning/MapServer/0"

const AIRPORT_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/6"
const MAJOR_TRANSPORTATION_CORRIDOR_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/8"
const ALL_DEV_CASES = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/17"
const ALL_DEV_CASES_POLY = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/19"
const FUTURE_LAND_USE_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Future_Land_Use/MapServer/0";
const FUTURE_LAND_USE_URL = "https://webgis.durhamnc.gov/server/rest/services/CachedServices/Future_Land_Use/MapServer";

const TRANSITIONAL_OFFICE_OVERLAY_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/18";
const TRANSITIONAL_OFFICE_OVERLAY_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/18";

//historic
const NATL_HIST_DISTRICTS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/11";
const LHD_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/10";
const LOCAL_HIST_LANDMARKS_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/1"

//property
const PARCELS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer/1"
const PARCELS_AGOL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Parcels/FeatureServer/0"
const PROPERTYINFO = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/PropertyInfoV2/MapServer"


//SAFETY
const EM_MITIGATION_FACILITIES = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Public_Safety/MapServer/0";

//transportation
const STREETMAINT_URL ="https://webgis.durhamnc.gov/server/rest/services/CachedServices/Street_Maintenance/MapServer"
const BIKEFACILITIES_URL = "https://webgis.durhamnc.gov/server/rest/services/ProjectServices/Trans_HikeBikeMap/MapServer/6"
const BUS_STOPS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/0"
const BUS_ROUTES = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/3"
const BUS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/"
const DOLRT_URL = "https://webgis.durhamnc.gov/server/rest/services/ProjectServices/DOLRT/MapServer"
const SPEED_HUMPS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/9"
const POLES_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/8"
const SIGNALS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/11"

//tables
const ALL_BI_TRADE_PERMITS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Tables/MapServer/1"
const ALL_BLDG_PERMITS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Tables/MapServer/2"


const TCHI_URL = "https://webgis.durhamnc.gov/server/rest/services/ProjectServices/LongtimeHomeownerGrant/MapServer/0"
const LTHG_URL = "https://webgis.durhamnc.gov/server/rest/services/ProjectServices/LongtimeHomeownerGrant/MapServer/1"

const OPP_ZONES_URL = "https://webgis.durhamnc.gov/server/rest/services/ProjectServices/NC_Opportunity_Zones_in_Durham__NC/MapServer"



const citymask = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/City_Mask/VectorTileServer"
const countymask = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/County_Mask/VectorTileServer"

const CALCANNO_URL = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/Calculated_Annotation/MapServer"


//DEV
const BUILDING_PERMITS = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/12"
const BUILDING_PERMITS_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/12"

const SOILS_URL = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Soils/MapServer";
const SOILS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Soils/MapServer/0";

const TAX_DISTRICTS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer/2"
const TAX_DISTRICTS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer/2"



//INSP
const UTA = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Unioned_Trade_Areas/MapServer"
const UTA_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Unioned_Trade_Areas/MapServer/0"
const ACTV_ELEC_PERMITS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/16"
const ACTV_BLDG_PERMITS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/13"
const ACTV_MECH_PERMITS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/15"
const ACTV_PLUMB_PERMITS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Inspections/MapServer/14"


//ENV
const ELEV2010_URL = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Elevation_2010/MapServer"
const NWI_URL = "https://webgis.durhamnc.gov/server/rest/services/OpenData/National_Wetland_Inventory/MapServer"
const NWI_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/OpenData/National_Wetland_Inventory/MapServer/0"
const WATERSHEDS_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/9"
const WATERSHEDS_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/9"
const SOILS1983_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicWorksServices/DurhamSoils/MapServer/"

//POLIT
const CENSUSBLOCK2010_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/OpenData/Census_2010/MapServer/2"
const VOTERPRECINCT_URL = "https://webgis.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/"

//TRANS
const DCHCMPO_URL = "https://webgis.durhamnc.gov/server/rest/services/OpenData/DCHC_MPO_Boundary/MapServer"

//UTIL
const STORMSEWERSHED_URL_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/PublicWorksServices/StormwaterUtilitiesMapService/MapServer/10"
const SEWERSHEDS = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/1"
const SEWERSHEDS_SUBLAYER = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/1"
const CITYSEWERDRAIN2COUNTY = "https://webgis.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/0"



//aerials
const aerial88url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_88_Scanned/MapServer"
const aerial94url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_1994/MapServer"
const aerial99url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_1999/MapServer"
const aerial05url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_05/MapServer"
const aerial10url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_2010/MapServer"
const aerial13url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Ortho_2013/MapServer"

const satellite06url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_06/MapServer"
const satellite07url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_07/MapServer"
const satellite08url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_08/MapServer"
const satellite09url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_09/MapServer"
const satellite11url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_11/MapServer"
const satellite12url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_12/MapServer"
const satellite14url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_2014/MapServer"
const satellite15url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_2015/MapServer"
const satellite16url = "https://webgis.durhamnc.gov/server/rest/services/BaseMaps/Satellite_2016/MapServer"


const GRAYBASE_BACKGROUND = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Background/VectorTileServer"
const GRAYBASE_ROADS_URL = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Roads/VectorTileServer"
const GRAYBASE_LABELS_URL = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Labels/VectorTileServer"

//NC Onemap
const STATE_HYDRO_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hydrography/MapServer/2"
const MANAGED_AREAS_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Ownership/MapServer/0"
const STATE_OWNED_LAND = "https://services.nconemap.gov/secure/rest/services/NC1Map_Ownership/MapServer/0"
const GEOLOGY_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Geological/MapServer/2"
const NPDES_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Environment/MapServer/4"
const BROWNFIELDS_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/0"
const DRYCLEANING_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/1"
const LANDFILLS_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/4"
const HAZWASTE_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/2"
const INACTIVEHAZ_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/3"

const AERIAL_IMG = "https://webgis.durhamnc.gov/img/aerial.png"
const ICONSWISS_IMG = "https://webgis.durhamnc.gov/img/esriswiss.png"
const USGS_IMG = "https://webgis.durhamnc.gov/img/usgs.png"
const HILLSHADE_IMG = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"
const GRAYBASE_IMG = "https://www.arcgis.com/sharing/rest/content/items/a52ab98763904006aa382d90e906fdd5/info/thumbnail/thumbnail1561651343086.jpeg"

const CLARITY_URL = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer"
const USGS_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer"
const NEARMAP_URL = "https://utility.arcgis.com/usrsvcs/servers/df77582554224f329e55d7147854294c/rest/services/nearmap_us/ImageServer"
const HILLSHADE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"
const ORANGE_URL = "https://gis.orangecountync.gov/arcgis/rest/services/WebParcelService/MapServer/0"
const WAKE_URL = "https://maps.wakegov.com/arcgis/rest/services/Property/Parcels/MapServer/0"