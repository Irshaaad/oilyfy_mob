import {NavigationProp, RouteProp} from '@react-navigation/native';

export interface COUNTRY {
  name: string;
  language: string;
  countryCode: string;
  nameCode: string;
  flagUrl: string;
  label: string;
  value: string;
  cc: string;
}

export type AppThemeType = 'dark' | 'light';

export interface ScreenProps {
  navigation?: NavigationProp<any, any>;
  route?: RouteProp<any>;
}

export type Status = 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TripStatus = Record<Status, string>;

export type TripStatusColor = Record<
  'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETED',
  string
>;

export interface LoginResponseType {
  success: boolean;
  session: Session;
  user: User;
}

export interface Session {
  id: number;
  user_id: number;
  jwt_token: string;
  firebase_token: any;
  updatedAt: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email_address: string;
  phone_number: any;
  profile_pic_url: any;
  provider: string;
  status: number;
  role_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
  company_id: number;
  created_by: any;
}

export interface GetSchedulesApiResponse {
  success: boolean;
  count: number;
  rows: Schedule[];
}

export interface Schedule {
  id: number;
  to_be_tested: boolean;
  expected_volume: string;
  oil_collected: string;
  signature: string;
  manager_name: string;
  status: string;
  date: string;
  time: string;
  collected_oil_sample: boolean;
  is_urgent: number;
  createdAt: string;
  updatedAt: string;
  user_id: number;
  trip_id?: number;
  order_id: number;
  branch_id: number;
  order: Order;
  trip?: Trip;
  branch: Branch;
}

export interface Order {
  id: number;
  contract_start_date: string;
  contract_end_date: string;
  capacity: any;
  visits_per_week: number;
  slot?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user_id: number;
  company_id: number;
  restaurant_id: number;
  branch_id?: number;
  oil_post_id: number;
}

export interface Trip {
  id: number;
  total_pickups: string;
  total_oil_cans: string;
  oil_collected: string;
  manager_name: string;
  signature: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  driver_id: any;
}

export interface Branch {
  id: number;
  Branch_Admin: BranchAdmin;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  admin_id: number;
  created_by: any;
  restaurant_id: number;
  location: Location;
  restaurant: Restaurant;
}

export interface Location {
  lat: string;
  long: string;
  nearby: string;
}

export interface Restaurant {
  name: string;
  number_of_branches: number;
  user_id: number;
  user: User;
}

export interface User {
  name: string;
  email_address: string;
  profile_pic_url: any;
}

export interface Restaurant2 {
  name: string;
  number_of_branches: number;
  user_id: number;
  user: User;
}

export interface BranchAdmin {
  name: string;
  whatsapp: any;
  email_address: string;
}
