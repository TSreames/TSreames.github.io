//misc external URLs
const url_for_county_photos = "https://image-cdn.spatialest.com/image/durham-images/lrg/"
const ORANGE_URL = "https://gis.orangecountync.gov/arcgis/rest/services/WebParcelService/MapServer/0"
const WAKE_URL = "https://maps.wakegov.com/arcgis/rest/services/Property/Parcels/MapServer/0"

//NC Onemap URLs
const STATE_HYDRO_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hydrography/MapServer/2"
const MANAGED_AREAS_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Ownership/MapServer/0"
//const STATE_OWNED_LAND = "https://services.nconemap.gov/secure/rest/services/NC1Map_Ownership/MapServer/0"
const STATE_OWNED_LAND = "https://services3.arcgis.com/zMTrRjxZirPAKsKd/arcgis/rest/services/State_Owned_Land_NC_Latest_02/FeatureServer/0"
const GEOLOGY_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Geological/MapServer/2"
const NPDES_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Environment/MapServer/4"
const BROWNFIELDS_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/NCBP_Feature_Poly_View/FeatureServer/0"
const DRYCLEANING_URL = "https://services.nconemap.gov/secure/rest/services/NC1Map_Hazardous_Waste/MapServer/1"
const LANDFILLS_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/ArcGIS/rest/services/Active_Permitted_Landfills/FeatureServer/0"
const HAZWASTE_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/ArcGIS/rest/services/Hazardous_Waste_Sites_2019/FeatureServer/0"
const INACTIVEHAZ_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/Inactive_Hazardous_Sites/FeatureServer/8"
const LANDFILLS_PREREG_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/Pre_Regulatory_Landfill_Sites/FeatureServer/0"
const DEQ401_cert_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/401Certification_Wetland_Permits/FeatureServer/0"
const npdesnondischarge_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/NPDES_Non_Discharge_Permits_(View)/FeatureServer/0"
const npdeswastewaterdischarge_URL = "https://services2.arcgis.com/kCu40SDxsCGcuUWO/arcgis/rest/services/NPDES_Wastewater_Discharge_Permits/FeatureServer/0"

//AGOL urls
const HILLSHADE_IMG = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"
const GRAYBASE_IMG = "https://www.arcgis.com/sharing/rest/content/items/a52ab98763904006aa382d90e906fdd5/info/thumbnail/thumbnail1561651343086.jpeg"
const CLARITY_URL = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer"
const USGS_URL = "https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer"
//const NEARMAP_URL = "https://utility.arcgis.com/usrsvcs/servers/df77582554224f329e55d7147854294c/rest/services/nearmap_us/ImageServer"
const NEARMAP_URL = "https://webgis2.durhamnc.gov/portal/sharing/servers/71665c6734234c6fb13cd4829fed7239/rest/services/nearmap_us/ImageServer"

const HILLSHADE_URL = "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"
const ADDRESS_FS_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Active_Addresses/FeatureServer/0"
const PARCELS_AGOL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Parcels_NEW/FeatureServer/0"
const PARCELS = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/Parcels_NewSchema/MapServer/0" //This is used by the DPS Locator, so don't screw with it

//icons
const AERIAL_IMG = "https://maps.durhamnc.gov/img/aerial.png"
const ICONSWISS_IMG = "https://maps.durhamnc.gov/img/esriswiss.png"
const USGS_IMG = "https://maps.durhamnc.gov/img/usgs.png"

//AGOL vector
const GRAYBASE_BACKGROUND = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Background/VectorTileServer"
const GRAYBASE_ROADS_URL = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Roads/VectorTileServer"
const GRAYBASE_LABELS_URL = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Graybase_Labels/VectorTileServer"
const citymask = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/City_Mask/VectorTileServer"
const countymask = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/County_Mask/VectorTileServer"
const dps_high_2526 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_High_2025_2026/VectorTileServer"
const dps_middle_2526 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Middle_2025_2026/VectorTileServer"
const dps_elementary_2526 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Elementary_2025_2026_0/VectorTileServer"
const dps_high_2425 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_High_2024_2025/VectorTileServer"
const dps_middle_2425 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Middle_2024_2025_0/VectorTileServer"
const dps_elementary_2425 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Elementary_2024_2025_0/VectorTileServer"
const dps_high_2324 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_High_2023_2024/VectorTileServer"
const dps_middle_2324 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Middle_2023_2024/VectorTileServer"
const dps_elementary_2324 = "https://tiles.arcgis.com/tiles/G5vR3cOjh6g2Ed8E/arcgis/rest/services/DPS_Elementary_2023_2024/VectorTileServer"

//tools
//const geometryservice_url = "https://webgis2.durhamnc.gov/server/rest/services/Utilities/Geometry/GeometryServer"
const DURHAM_PORTAL_URL = "https://webgis2.durhamnc.gov/portal"
const PRINT_SERVICE_URL = "https://webgis2.durhamnc.gov/host/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"

//Public Safety
const EM_MITIGATION_FACILITIES = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Public_Safety/MapServer/0"
const crpsa_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Public_Safety/MapServer/15"

//Administrative

const ZIPCODE_SUB = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/0"
const CITY_BOUNDARY = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/1"
const COUNTY_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/2"
const SOLID_WASTE_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/6"
const PARKS_IMPACT_FEE_ZONES = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Administrative/MapServer/7"
const OPENSPACEIMPACTFEEZONE_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/8"
const STREETS_IMPACT_FEE_ZONES = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/9"
const RTP_BOUNDARY_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/11"
const PAC_DISTRICTS = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/12"
const CODE_ENF_OFF_AREAS = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/13"
const DCHCMPO_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/ArcGIS/rest/services/Administrative/FeatureServer/14"

//Community
const PARKS = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/8"
const TRAILS_ALL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/"
const TRAILS_SUB = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/6"
const SIDEWALKS = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/5"
const RECANDAQUA = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Community/MapServer/7"

//Electoral
const COUNCIL_WARDS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/3"
const SCHOOL_BOARD_DIST = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/7"
const US_CONG_DIST = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/6"
const NCSENATE_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/5"
const NCHOUSE_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/4"
const VOTERPRECINCT_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Electoral/MapServer/"

//Inspections
const UTA_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/7"
const DEMO_PERMITS_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/10"
const CO_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/11"
const BUILDING_PERMITS = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/12"
const BUILDING_PERMITS_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/12"
const ACTV_BLDG_PERMITS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/13"
const ACTV_PLUMB_PERMITS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/14"
const ACTV_MECH_PERMITS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/15"
const ACTV_ELEC_PERMITS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Inspections/FeatureServer/16"
const CROSS_CONNECT_PERMITS_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/BackflowCrossConnection/MapServer/3"


//Transportation
const BUS_STOPS = "https://gis.dchcmpo.org/arcgis/rest/services/Core/TransitBusStopsRoutes/MapServer/3"
const BUS_ROUTES = "https://gis.dchcmpo.org/arcgis/rest/services/Core/TransitBusStopsRoutes/MapServer/2"
const SPEED_HUMPS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/9"
const POLES_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/8"
const SIGNALS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/11"

//Flood_Zones_Development (advanced popup)
const FIRM2018D_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Development/MapServer/0"
//Flood_Zones_Insurance (advanced popup)
const FIRM2018I_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Flood_Zones_Insurance/MapServer/0"
//Flood_Zones_Development (draws on map)
const FIRM2018D_URL = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/FIRM_Development/MapServer"
//Flood_Zones_Insurance (draws on map)
const FIRM2018I_URL = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/FIRM_Insurance/MapServer"

//Environmental
const TRIASSIC_SOILS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Environmental/MapServer/12"
const EROSIONDISTRICTS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Environmental/MapServer/13"


//Property 
const TAX_DISTRICTS_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer/2"
const TAX_DISTRICTS_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Property/MapServer/2"

//Planning
//these two use MapImageLayer, so they stay on MapServer / webgis2 / enterprise
const EDSOP_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer"

//these use FeatureLayer, so they use AGOL bc way faster
const NPO_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/0"
const LOCAL_HIST_LANDMARKS_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/1"
const WATERSHED_PROTECTION_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/3"
const DEVELOPMENT_TIERS_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/5"
const DEVELOPMENT_TIERS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/5"
const AIRPORT_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/6"
const MAJOR_TRANSPORTATION_CORRIDOR_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/8"
const WATERSHEDS_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/9"
const WATERSHEDS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/9"
const LHD_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/10"
const NATL_HIST_DISTRICTS_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/11"
const ALL_DEV_CASES = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/17"
const TRANSITIONAL_OFFICE_OVERLAY_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/18"
const TRANSITIONAL_OFFICE_OVERLAY_URL_SUBLAYER = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/18"
const ALL_DEV_CASES_POLY = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/19"

const ALL_BI_TRADE_PERMITS = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Tables/MapServer/1"
const ALL_BLDG_PERMITS = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Tables/MapServer/2"
const NEW_FGA_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/16"  //Future Growth Areas
const NEW_UGB_URL = "https://services2.arcgis.com/G5vR3cOjh6g2Ed8E/arcgis/rest/services/Planning/FeatureServer/24"  //Urban Growth Boundary
const VTCD_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Transportation/MapServer/14"
const NEW_PLACETYPE_URL = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/25"
const NEW_PLACETYPE_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/PublicServices/Planning/MapServer/25"


//CartographicServices
const ELEM2122_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2021_2022/MapServer"
const ELEM2223_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2022_2023/MapServer"
const ELEM2324_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Elementary_2023_2024/MapServer"
const MID2122_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2021_2022/MapServer"
const MID2223_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2022_2023/MapServer"
const MID2324_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_Middle_2023_2024/MapServer"
const HIGH2122_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2021_2022/MapServer"
const HIGH2223_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2022_2023/MapServer"
const HIGH2324_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/DPS_High_2023_2024/MapServer"
const CALCANNO_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/Calculated_Annotation/MapServer"
const SEWERSHEDS = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/1"
const SEWERSHEDS_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/1"
const CITYSEWERDRAIN2COUNTY = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/County_Sewer_Boundaries/MapServer/0"
const NWI_URL = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/NationalWetlandInventory/MapServer"
const NWI_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/NationalWetlandInventory/MapServer/0"
const CENSUSBLOCK2010_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/Census2010/MapServer/2"
const PROPERTYINFO = "https://webgis2.durhamnc.gov/server/rest/services/CartographicServices/PropertyInfoV2/MapServer"

//CachedServices
const IMPERV_URL = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Impervious_Surfaces/MapServer"
const TOPO_2ft = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Topographic_Contours_2ft/MapServer"
const ZONINGURL = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Zoning/MapServer"
const ZONINGURL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Zoning/MapServer/0"
const STREETMAINT_URL ="https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Street_Maintenance/MapServer"
const SOILS_URL = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Soil/MapServer"
const SOILS_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/CachedServices/Soil/MapServer/0"



//ProjectServices
const BIKEFACILITIES_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/Trans_HikeBikeMap/MapServer/6"
const DOLRT_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/DOLRT/MapServer"
const TCHI_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/LongtimeHomeownerGrant/MapServer/0"
const LTHG_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/LongtimeHomeownerGrant/MapServer/1"
const OPP_ZONES_URL = "https://webgis2.durhamnc.gov/server/rest/services/ProjectServices/NC_Opportunity_Zones_in_Durham__NC/MapServer"

//Rasters
const ELEV2010_URL = "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Elevation2010/MapServer"
const SOILS1983_URL = "https://webgis2.durhamnc.gov/server/rest/services/Rasters/Ortho1983/MapServer"

//PublicWorksServices
const STORMSEWERSHED_URL_SUBLAYER = "https://webgis2.durhamnc.gov/server/rest/services/PublicWorksServices/StormwaterSystem/MapServer/10"