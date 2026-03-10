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

export interface LicensesEntity {
  name: string;
  url: string;
}

export interface Rate {
  limit: number;
  remaining: number;
  reset: number;
}

export interface ResultsEntity {
  annotations: Annotations;
  bounds: Bounds;
  components: Components;
  confidence: number;
  formatted: string;
  geometry: NortheastOrSouthwestOrGeometry;
}

export interface Annotations {
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

export interface DMS {
  lat: string;
  lng: string;
}

export interface Mercator {
  x: number;
  y: number;
}

export interface OSM {
  edit_url: string;
  note_url: string;
  url: string;
}

export interface UNM49 {
  regions: Regions;
  statistical_groupings?: string[] | null;
}

export interface Regions {
  "AFRICA": string;
  "SOUTHERN_AFRICA": string;
  'SUB-SAHARAN_AFRICA': string;
  "WORLD": string;
  "ZA": string;
}

export interface Currency {
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

export interface Roadinfo {
  drive_on: string;
  road: string;
  road_type: string;
  speed_in: string;
}

export interface Sun {
  rise: RiseOrSet;
  set: RiseOrSet;
}

export interface RiseOrSet {
  apparent: number;
  astronomical: number;
  civil: number;
  nautical: number;
}

export interface Timezone {
  name: string;
  now_in_dst: number;
  offset_sec: number;
  offset_string: string;
  short_name: string;
}

export interface What3words {
  words: string;
}

export interface Bounds {
  northeast: NortheastOrSouthwestOrGeometry;
  southwest: NortheastOrSouthwestOrGeometry;
}

export interface NortheastOrSouthwestOrGeometry {
  lat: number;
  lng: number;
}

export interface Components {
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

export interface Status {
  code: number;
  message: string;
}

export interface StayInformed {
  blog: string;
  twitter: string;
}

export interface Timestamp {
  created_http: string;
  created_unix: number;
}
