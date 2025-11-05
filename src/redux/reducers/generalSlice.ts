import {createSlice} from '@reduxjs/toolkit';
import {IGeneralState} from './interface';

const initialState: IGeneralState = {
  language: 'en',
  accessToken: null,
  refreshToken: null,
  isRTL: false,

  isCurrentTrip: false,
  currentTripList: [],

  currentLocation: {
    accuracy: null,
    altitude: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
  },
};

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setLanguage: (state, {payload}) => {
      state.isRTL = payload ? (payload === 'en' ? false : true) : false;
      state.language = payload || 'en';
    },
    setAccessToken: (state, {payload}) => {
      state.accessToken = payload;
    },
    setRefreshToken: (state, {payload}) => {
      state.refreshToken = payload;
    },
    setCurrentLocation: (state, {payload}) => {
      state.currentLocation = payload;
    },
    setTripActive: (state, {payload}) => {
      state.isCurrentTrip = payload;
    },
    setCurrentTrips: (state, {payload}) => {
      state.currentTripList = payload;
    },
    setResetCurrentTrips: (state, {payload}) => {
      state.currentTripList = [];
      state.isCurrentTrip = false;
    },
  },
});

export const {
  setLanguage,
  setAccessToken,
  setRefreshToken,
  setCurrentLocation,
  setTripActive,
  setCurrentTrips,
  setResetCurrentTrips,
} = generalSlice.actions;

export default generalSlice.reducer;
