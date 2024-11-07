import { InferQueryModel } from '@/lib/drizzle-type-helper';

export type AttendanceWithUserAndProfile = InferQueryModel<
  'attendances',
  true,
  { user: { columns: { nrp: true }; with: { profile: true } } }
>;

interface GeocodeResponse {
  results: UserLocation[];
}

export interface UserLocation {
  components: Components;
  formatted: string;
}

export interface Components {
  'ISO_3166-1_alpha-2': string;
  'ISO_3166-1_alpha-3': string;
  'ISO_3166-2': string[];
  _category: string;
  _normalized_city: string;
  _type: string;
  city: string;
  continent: string;
  country: string;
  country_code: string;
  postcode: string;
  region: string;
  road: string;
  road_type?: string;
  state: string;
  state_code: string;
  town?: string;
  suburb?: string;
}
