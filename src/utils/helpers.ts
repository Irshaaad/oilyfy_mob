import { Linking, Platform, Alert } from 'react-native';
import CryptoJS from 'rn-crypto-js';
import { check, Permission, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { utility } from './utility';
import axios from 'axios';
import { API_KEY } from './constants';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import { Schedule } from './interface';

export type Coordinates = {
  longitude: number;
  latitude: number;
};

export const encryptPass = (value: string) => {
  try {
    return CryptoJS.AES.encrypt(
      value,
      'liqteq-default-encryption-key',
    )?.toString();
  } catch (error) {
    console.log(error);
  }
};

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatDateTimeString = (
  dateString: string | Date,
  mode = 'date',
  _format?: string,
) => {
  const date = new Date(dateString);

  if (mode === 'time') {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${strHours}:${strMinutes} ${ampm}`;
  } else {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options as any).replace(/ /g, ' ');
  }
};

export const formateDate = (dateVal: Date, type: string = 'dd-MM-YYYY') => {
  const date = new Date(dateVal);
  // let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  let day = String(date.getDate()).padStart(2, '0');
  let month = monthNames[date.getMonth()];
  let year = date.getFullYear();

  if (type === 'YYYY-MM-DD') {
    month = `${date.getMonth() + 1}`;
    return `${year}-${month}-${day}`;
  }

  return `${day}-${month}-${year}`;
};

// Utility to merge new data without duplicates
export const mergeDataWithoutDuplicates = (
  existingData: any[],
  newData: any[],
) => {
  const existingIds = existingData.map(item => item._id);
  return [
    ...existingData,
    ...newData.filter(item => !existingIds.includes(item._id)),
  ];
};

// Handle debounce for search function
// export const debounce = (func: Function, delay: number) => {
//   let timeoutId: NodeJS.Timeout;
//   return (...args: any[]) => {
//     if (timeoutId) clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

export function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30); // Approximate value for months

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  } else {
    return `${diffInMonths} months ago`;
  }
}

export function extractPlaceDetails(data: any) {
  const placeName =
    data.address_components.find(
      (component: any) =>
        component.types.includes('establishment') ||
        component.types.includes('point_of_interest'),
    )?.long_name || '';

  const city =
    data.address_components.find((component: any) =>
      component.types.includes('locality'),
    )?.long_name || '';

  const country =
    data.address_components.find((component: any) =>
      component.types.includes('country'),
    )?.long_name || '';

  const description = data.formatted_address || '';

  return {
    id: data?.place_id,
    placeName,
    city,
    country,
    description,
  };
}

export const checkAndRequestPermission = async (permission: Permission) => {
  try {
    const permissionStatus = await check(permission);

    if (permissionStatus === RESULTS.GRANTED) {
      console.log(`${permission} is granted`);
      return true;
    }

    const requestStatus = await request(permission);

    if (requestStatus === RESULTS.GRANTED) {
      console.log(`${permission} granted after request`);
      return true;
    } else {
      console.log(`${permission} denied`);
      return false;
    }
  } catch (error) {
    console.error('Permission error: ', error);
    return false;
  }
};

export const extractDateAndTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() ===
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  const isYesterday =
    date.toDateString() ===
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const time = date.toLocaleTimeString('en-US', timeOptions);

  if (isToday) {
    return `${utility.translate('TODAY')} ${utility.translate('AT')} ${time}`;
  } else if (isTomorrow) {
    return `${utility.translate('TOMORROW')} ${utility.translate(
      'AT',
    )} ${time}`;
  } else if (isYesterday) {
    return `${utility.translate('YESTERDAY')} ${utility.translate(
      'AT',
    )} ${time}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
    };
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
    return `${formattedDate} at ${time}`;
  }
};

export const handleErrorMessage = (error: any) => {
  console.log('=============handleErrorMessage=============', error);
  let errorMessage = 'Something weng wrong';
  if (error?.data?.message) {
    errorMessage = error?.data?.message;
  } else if (error?.message) {
    errorMessage = error?.message;
  } else if (error?.error) {
    errorMessage = error?.error;
  }
  showErrorToast(errorMessage);
};

export const showErrorToast = (message: string) => {
  utility.showToast?.show(message, { type: 'danger' });
};

export const showSuccessToast = (message: string) => {
  utility.showToast?.show(message, { type: 'success' });
};

export function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  let index = 0,
    lat = 0,
    lng = 0;
  const coordinates: { latitude: number; longitude: number }[] = [];

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

export const openGoogleMapsWithDirections = ({
  origin,
  destination,
  waypoints = [],
  callback,
}: {
  origin: Coordinates;
  destination: Coordinates;
  waypoints: Coordinates[];
  callback?: () => void;
}) => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    const waypointsStr = waypoints
      .map(wp => `${wp.latitude},${wp.longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1`;
    url += `&origin=${originStr}`;
    url += `&destination=${destinationStr}`;

    if (waypoints.length > 0) {
      url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
    }

    url += `&travelmode=driving`; // or 'walking', 'bicycling', 'transit'
    console.log('======[url]=====', JSON.stringify(url, null, 1));
    callback && callback();
    Linking.openURL(url);
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    Alert.alert('Unable to open Google Maps');
  }
};

export const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371000; // meters
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const fetchPolylineBetweenPoints = async (
  origin: { lat: number; long: number },
  destination: { lat: number; long: number },
  key: string,
  setPolylines: (data: any) => void,
) => {
  try {
    const endPoint = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.long}&destination=${destination.lat},${destination.long}&key=${API_KEY}`;
    const res = await axios.get(endPoint);
    const encoded = res.data.routes?.[0]?.overview_polyline?.points;
    if (encoded) {
      const decodedPath = decodePolyline(encoded);
      setPolylines(prev => ({ ...prev, [key]: decodedPath }));
    }
  } catch (err) {
    console.log('Error fetching directions:', err);
  }
};

export async function getRouteDirections(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
): Promise<{ latitude: number; longitude: number }[]> {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;

    console.log('======[originStr]=====', JSON.stringify(originStr, null, 1));
    console.log(
      '======[destinationStr]=====',
      JSON.stringify(destinationStr, null, 1),
    );

    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${originStr}&destination=${destinationStr}` +
      `&mode=${travelMode}&key=${API_KEY}`;

    const response = await axios.get(url);

    console.log(
      '======[response.data]=====',
      JSON.stringify(response.data, null, 1),
    );

    if (!response.data || response?.data?.status === 'ZERO_RESULTS') {
      throw new Error('');
    }

    const encoded = response.data?.routes[0].overview_polyline.points;
    const decoded = decodePolyline(encoded);

    return decoded;
  } catch (error) {
    if (error?.message == '') null;
    // handleErrorMessage(error);
  }
}

export const getCurrentUserLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> =>
  new Promise(async (resolve, reject) => {
    console.log('==========FETCHING CURRENT LOCATIAON==========');
    if (Platform.OS === 'android') {
      const isEnabled = await isLocationEnabled();
      if (!isEnabled) {
        await promptForEnableLocationIfNeeded();
      }
    }
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
    );
  });

export const onPressWhatsapp = (num: string) => {
  Linking.openURL(`whatsapp://send?phone=${num}`);
};

export const checkIfLocationEnabled = async () => {
  if (Platform.OS === 'android') {
    const res = await promptForEnableLocationIfNeeded();
    return res === 'already-enabled' || res === 'enabled';
  }

  if (Platform.OS === 'ios') {
    try {
      // // Check if location services are enabled
      // const isEnabled = await isLocationEnabled();

      // if (!isEnabled) {
      //   // Show alert to enable location services
      //   Alert.alert(
      //     'Location Services Disabled',
      //     'Location services are disabled. Please enable them in Settings to use location-based features.',
      //     [
      //       {
      //         text: 'Cancel',
      //         style: 'cancel',
      //       },
      //       {
      //         text: 'Open Settings',
      //         onPress: () => Linking.openSettings(),
      //       },
      //     ],
      //   );
      //   return false;
      // }

      // Check location permission status
      const permissionStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (permissionStatus === RESULTS.DENIED) {
        // Request permission
        const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return requestResult === RESULTS.GRANTED;
      } else if (permissionStatus === RESULTS.BLOCKED) {
        // Permission is blocked, show alert to go to settings
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to use location-based features. Please enable it in Settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return false;
      }

      return permissionStatus === RESULTS.GRANTED;
    } catch (error) {
      console.log('Error checking location status:', error);
      return false;
    }
  }

  return false;
};

export async function getOptimizedRoute(
  currentLocation: { latitude: number; longitude: number },
  locations: Schedule[],
) {
  const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
  const waypoints = locations
    .map(l => `${l.branch.location.lat},${l.branch.location.long}`)
    .join('|');
  const destination = waypoints.split('|').pop(); // use last point as destination

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') throw new Error('Google API error: ' + data.status);

  // Google tells you the optimized visiting order
  const order = data.routes[0].waypoint_order;
  return order.map(i => locations[i]);
}
