import {Schedule, User} from '../../utils/interface';

export interface IGeneralState {
  language: 'en' | 'es' | 'fr' | 'ur';
  accessToken?: string | null;
  refreshToken?: string | null;
  tempToken?: string | null;
  isRTL?: boolean;
  isCurrentTrip: boolean;
  currentTripList: Schedule[];
  currentLocation?: {
    accuracy: number | null;
    altitude: number | null;
    heading: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
  };
}

export interface IUserState extends User {}
