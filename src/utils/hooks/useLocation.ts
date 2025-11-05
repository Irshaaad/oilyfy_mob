/* eslint-disable react-hooks/exhaustive-deps */
// useLocation.js

import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {
  checkMultiple,
  openSettings,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { setCurrentLocation } from '../../redux/reducers/generalSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { API_KEY } from '../constants';
import { decodePolyline, handleErrorMessage } from '../helpers';

export const LATITUDE_DELTA = 0.0422;
export const LONGITUDE_DELTA = 0.8;

const useLocation = () => {
  const dispatch = useAppDispatch();
  const currentLocation = useAppSelector(
    store => store.generalSlice.currentLocation,
  );
  const [loading, setLoading] = useState(false);
  const [errorLocation, setError] = useState<string | null>(null);
  const [isLocationAllowed, setIsLocationAllowed] = useState(false);

  const permission =
    Platform.OS === 'ios'
      ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
      : [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ];

  const checkLocationPermission = async () => {
    return await checkMultiple(permission);
  };

  const requestLocation = async () => {
    try {
      setLoading(true);
      const result = await checkLocationPermission();
      const isAllowed = Object.values(result).includes(RESULTS.GRANTED);
      setIsLocationAllowed(isAllowed);

      if (isAllowed) {
        getCurrentLocation();
      } else {
        const requestResult = await requestMultiple(permission);
        const requestAllowed = Object.values(requestResult).includes(
          RESULTS.GRANTED,
        );
        if (requestAllowed) {
          getCurrentLocation();
        } else {
          openSettingsAlert();
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationInfo = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    // try {
    //   const response = await axios.get(
    //     `https://maps.googleapis.com/maps/api/geocode/json`,
    //     {
    //       params: {
    //         latlng: `${coords.latitude},${coords.longitude}`,
    //         key: API_KEY,
    //       },
    //     },
    //   );
    //   if (response.data.results.length > 0) {
    //     return extractPlaceDetails(response.data.results[0]);
    //   } else {
    //     setError('No location information found');
    //     return null;
    //   }
    // } catch (err: any) {
    //   setError(err.message);
    //   return null;
    // }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    if (Platform.OS === 'android') {
      const isEnabled = await isLocationEnabled();
      if (!isEnabled) {
        await promptLocationAccess();
      }
    }
    await requestLocation();
    Geolocation.getCurrentPosition(
      async (position: any) => {
        setLoading(true);
        dispatch(
          setCurrentLocation({
            ...position.coords,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }),
        );
        setError(null);
        setLoading(false);
        // const result = await fetchLocationInfo(position.coords);
        // setCurrentLocationDetail(result);
      },
      async (error: any) => {
        setLoading(false);
        console.log('===error===>', JSON.stringify(error, null, 1));
        if (error.message === 'No location provider available.') {
          if (Platform.OS === 'android') {
            await promptLocationAccess();
          }
        }
        setError(error.message);
      },
      // {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
    setLoading(false);
  };

  const promptLocationAccess = async () => {
    try {
      return await promptForEnableLocationIfNeeded();
    } catch (error: any) {
      console.log('===error===>', JSON.stringify(error?.message, null, 1));
    }
  };

  const openSettingsAlert = () => {
    Alert.alert(
      'Location Permission Required',
      'This app needs access to your location. Please enable it in settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            // Open app settings
            openSettings();
          },
        },
      ],
      { cancelable: false },
    );
  };

  // utils/getDirections.ts

  async function getRouteDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  ): Promise<{ latitude: number; longitude: number }[]> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;

      console.log("======[originStr]=====", JSON.stringify(originStr, null, 1))
      console.log("======[destinationStr]=====", JSON.stringify(destinationStr, null, 1))

      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${originStr}&destination=${destinationStr}` +
        `&mode=${travelMode}&key=${API_KEY}`;

      const response = await axios.get(url);

      console.log("======[response.data]=====", JSON.stringify(response.data, null, 1))

      if (!response.data || response?.data?.status === "ZERO_RESULTS") {
        throw new Error("");
      }

      const encoded = response.data?.routes[0].overview_polyline.points;
      const decoded = decodePolyline(encoded);

      return decoded;
    } catch (error) {
      if (error?.message == "") null
      // handleErrorMessage(error);
    }
  }

  const getCurrentUserLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> =>
    new Promise(async (resolve, reject) => {
      if (Platform.OS === 'android') {
        const isEnabled = await isLocationEnabled();
        if (!isEnabled) {
          await promptLocationAccess();
        }
      }
      await requestLocation();
      Geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        error => {
          console.log('===error locatio ===>', JSON.stringify(error, null, 1));
          reject(error);
        },
        // {
        //   enableHighAccuracy: true,
        //   timeout: 15000, // 15 seconds
        //   maximumAge: 10000,
        // },
      );
    });

  return {
    error: errorLocation,
    requestLocation,
    fetchLocationInfo,
    getCurrentLocation,
    isLocationAllowed,
    getCurrentUserLocation,
    promptLocationAccess,
    getRouteDirections,
    currentLocation,
    location: currentLocation,
    loading,
  };
};

export default useLocation;
