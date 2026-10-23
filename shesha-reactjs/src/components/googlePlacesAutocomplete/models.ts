export interface IOpenCageResponse {
  documentation: string;
  licenses?: LicensesEntity[] | null;
  rate: Rate;
  results?: ResultsEntity[] | null;
  status: Status;
  stay_informed: StayInformed;
  thanks: string;
  timestamp: Timestamp;
  total_results: number;
}

interface LicensesEntity {
  name: string;
  url: string;
}

interface Rate {
  limit: number;
  remaining: number;
  reset: number;
}

interface ResultsEntity {
  annotations: Annotations;
  bounds: Bounds;
  components: Components;
  confidence: number;
  formatted: string;
  geometry: NortheastOrSouthwestOrGeometry;
}

interface Annotations {
  DMS: DMS;
  MGRS: string;
  Maidenhead: string;
  Mercator: Mercator;
  OSM: OSM;
  UN_M49: UNM49;
  callingcode: number;
  currency: Currency;
  flag: string;
  geohash: string;
  qibla: number;
  roadinfo: Roadinfo;
  sun: Sun;
  timezone: Timezone;
  what3words: What3words;
}

interface DMS {
  lat: string;
  lng: string;
}

interface Mercator {
  x: number;
  y: number;
}

interface OSM {
  edit_url: string;
  note_url: string;
  url: string;
}

interface UNM49 {
  regions: Regions;
  statistical_groupings?: string[] | null;
}

interface Regions {
  "AFRICA": string;
  "SOUTHERN_AFRICA": string;
  'SUB-SAHARAN_AFRICA': string;
  "WORLD": string;
  "ZA": string;
}

interface Currency {
  alternate_symbols?: null[] | null;
  decimal_mark: string;
  html_entity: string;
  iso_code: string;
  iso_numeric: string;
  name: string;
  smallest_denomination: number;
  subunit: string;
  subunit_to_unit: number;
  symbol: string;
  symbol_first: number;
  thousands_separator: string;
}

interface Roadinfo {
  drive_on: string;
  road: string;
  road_type: string;
  speed_in: string;
}

interface Sun {
  rise: RiseOrSet;
  set: RiseOrSet;
}

interface RiseOrSet {
  apparent: number;
  astronomical: number;
  civil: number;
  nautical: number;
}

interface Timezone {
  name: string;
  now_in_dst: number;
  offset_sec: number;
  offset_string: string;
  short_name: string;
}

interface What3words {
  words: string;
}

interface Bounds {
  northeast: NortheastOrSouthwestOrGeometry;
  southwest: NortheastOrSouthwestOrGeometry;
}

interface NortheastOrSouthwestOrGeometry {
  lat: number;
  lng: number;
}

interface Components {
  'ISO_3166-1_alpha-2'?: string;
  'ISO_3166-1_alpha-3'?: string;
  "_category"?: string;
  "_type"?: string;
  "city"?: string;
  "continent"?: string;
  "country"?: string;
  "country_code"?: string;
  "county"?: string;
  "postcode"?: string;
  "road"?: string;
  "road_type"?: string;
  "state"?: string;
  "state_code"?: string;
  "suburb"?: string;
}

interface Status {
  code: number;
  message: string;
}

interface StayInformed {
  blog: string;
  twitter: string;
}

interface Timestamp {
  created_http: string;
  created_unix: number;
}
