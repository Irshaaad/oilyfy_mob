/* eslint-disable react-native/no-inline-styles */
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Callout,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {widthToDP} from 'react-native-responsive-screens';
import {PickupDetailSheet} from '../../components/BottomSheets/PickupDetailSheet';
import {PickupFormSheet} from '../../components/BottomSheets/PickupFormSheet';
import CustomButton from '../../components/common/CustomButton';
import CustomIcon from '../../components/common/CustomIcon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import {TextBig, TextNormal} from '../../components/common/Texts';
import {useAppSelector} from '../../redux/store';
import {API_KEY, NEAR_VALUE} from '../../utils/constants';
import {Schedule, ScreenProps} from '../../utils/interface';
import {utility} from '../../utils/utility';
import {CustomCallout} from './ViewLocation';
import {COLORS} from '../../utils/theme';
import useLocation from '../../utils/hooks/useLocation';
import {openGoogleMapsWithDirections} from '../../utils/helpers';

interface Props extends ScreenProps {}

const GOOGLE_MAPS_API_KEY = API_KEY;

const getDistanceInMeters = (
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

const decodePolyline = (encoded: string) => {
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;
  const coordinates: {latitude: number; longitude: number}[] = [];

  while (index < len) {
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

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
};

const MyCustomMarkerView = ({title, styles}) => (
  <View style={styles.markerContainer}>
    <View
      style={{
        borderRadius: 100,
        backgroundColor: COLORS.primary,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1,
      }}>
      <TextNormal bold color={'white'}>
        {title}
      </TextNormal>
    </View>
    {/* <CustomIcon name={'location-on'} type="material-icons" color="red" /> */}
  </View>
);

const CustomMarker = React.memo(
  ({schedule, latitude, longitude, onViewTripDetail, styles, index}) => {
    return (
      <Marker
        key={schedule?.id.toString()}
        coordinate={{latitude, longitude}}
        title={schedule?.branch?.name}>
        <MyCustomMarkerView title={index + 1} styles={styles} />
        <Callout onPress={() => onViewTripDetail(schedule)}>
          <CustomCallout item={schedule} />
        </Callout>
      </Marker>
    );
  },
);

const AllSchedulNavigation: React.FC<Props> = props => {
  const {route} = props;
  const schedules: Schedule[] = route?.params?.schedules;

  const mapRef = useRef<MapView>(null);
  const prevUserLocationRef = useRef<{lat: number; long: number} | null>(null);
  const locationTimeout = useRef<NodeJS.Timeout | null>(null);

  const {getCurrentUserLocation} = useLocation();
  const [sortedSchedule, setSortedSchedules] = useState<Schedule[]>([]);

  const [showUserLocation, setShowUserLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const [nearbySchedule, setNearbySchedule] = useState<Schedule | null | any>();
  const [viewSchedule, setViewScheduled] = useState<Schedule>();
  const [polylines, setPolylines] = useState<Record<number, any[]>>({});
  const [pickupDetailModal, setPickupDetailModal] = useState(false);
  const [pickupFormModal, setPickupFormModal] = useState(false);
  const [distanceLoader, setDistanceLoader] = useState(true);

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = useMemo(() => dynamicStyles(!!isRTL), [isRTL]);

  const onMapReady = () => setShowUserLocation(true);

  // sorting the schedules by shortest distance between user location and place
  useEffect(() => {
    (async () => {
      const currentLocation = await getCurrentUserLocation();
      const sorted = schedules
        .map(schedule => {
          const branchLat = parseFloat(schedule.branch?.location.lat);
          const branchLng = parseFloat(schedule?.branch?.location.long);
          const distance = getDistanceInMeters(
            currentLocation.latitude,
            currentLocation.longitude,
            branchLat,
            branchLng,
          );
          return {...schedule, distance};
        })
        .sort((a, b) => a.distance - b.distance);
      setSortedSchedules(sorted);
    })();
  }, []);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        if (locationTimeout.current) clearTimeout(locationTimeout.current);
        locationTimeout.current = setTimeout(() => {
          setUserLocation({lat: latitude, long: longitude});
        }, 1000); // debounce update
      },
      error => console.log(error),
      {enableHighAccuracy: true, distanceFilter: 5, interval: 5000},
    );

    return () => {
      Geolocation.clearWatch(watchId);
      if (locationTimeout.current) clearTimeout(locationTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!userLocation || sortedSchedule.length === 0) return;

    const prev = prevUserLocationRef.current;

    const hasMovedSignificantly =
      !prev ||
      getDistanceInMeters(
        prev.lat,
        prev.long,
        userLocation.lat,
        userLocation.long,
      ) > 20;

    if (!hasMovedSignificantly) return;
    prevUserLocationRef.current = userLocation;

    const allPoints = [
      {id: 0, lat: userLocation.lat, long: userLocation.long},
      ...sortedSchedule.map(s => ({
        id: s.id,
        lat: parseFloat(`${s?.branch?.location.lat}`),
        long: parseFloat(`${s?.branch?.location.long}`),
      })),
    ];

    const fetchPolylineBetweenPoints = async (
      origin: {lat: number; long: number},
      destination: {lat: number; long: number},
      key: string,
    ) => {
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.long}&destination=${destination.lat},${destination.long}&key=${GOOGLE_MAPS_API_KEY}`,
        );
        const encoded = res.data.routes?.[0]?.overview_polyline?.points;
        if (encoded) {
          const decodedPath = decodePolyline(encoded);
          setPolylines(prev => ({...prev, [key]: decodedPath}));
        }
      } catch (err) {
        console.log('Error fetching directions:', err);
      }
    };

    const fetchAllPolylines = async () => {
      // setDistanceLoader(true);
      for (let i = 0; i < allPoints.length - 1; i++) {
        const from = allPoints[i];
        const to = allPoints[i + 1];
        const key = `${from.id}_${to.id}`;
        await fetchPolylineBetweenPoints(from, to, key);
      }

      const points = allPoints.map(i => ({latitude: i.lat, longitude: i.long}));

      mapRef.current?.fitToCoordinates(points, {
        edgePadding: {top: 80, right: 40, bottom: 100, left: 40},
        animated: true,
      });

      setDistanceLoader(false);
    };

    fetchAllPolylines();

    // Find the nearest schedule
    let closest: Schedule | null = null;
    let minDistance = Infinity;

    sortedSchedule.forEach(schedule => {
      const loc = schedule.branch?.location;
      const dist = getDistanceInMeters(
        userLocation.lat,
        userLocation.long,
        parseFloat(loc.lat),
        parseFloat(loc.long),
      );
      if (dist < NEAR_VALUE && dist < minDistance) {
        closest = schedule;
        minDistance = dist;
      }
    });

    setNearbySchedule(closest);
    // setNearbySchedule(schedules[0]);
  }, [userLocation, sortedSchedule]);

  const onViewTripDetail = useCallback(sch => {
    setViewScheduled(sch);
    setTimeout(() => {
      setPickupDetailModal(true);
    }, 130);
  }, []);

  const onPickupSchedule = () => {
    if (!nearbySchedule) return;
    setPickupFormModal(true);
  };

  const onBacknCancel = () => utility.navigation?.goBack();

  const handleOpenMap = async () => {
    const origin = await getCurrentUserLocation();
    let waypoints = sortedSchedule.map(schedule => {
      const loc = schedule.branch?.location;
      return {
        latitude: loc?.lat,
        longitude: loc?.long,
      };
    });
    const destination = waypoints.pop();
    openGoogleMapsWithDirections({origin, destination, waypoints});
  };

  const memoizedMarkers = useMemo(() => {
    return sortedSchedule.map((schedule, index) => {
      const loc = schedule.branch?.location;
      const latitude = parseFloat(loc.lat);
      const longitude = parseFloat(loc.long);
      if (isNaN(latitude) || isNaN(longitude)) return null;
      return (
        <CustomMarker
          key={schedule.id}
          schedule={schedule}
          latitude={latitude}
          longitude={longitude}
          onViewTripDetail={onViewTripDetail}
          styles={styles}
          index={index}
        />
      );
    });
  }, [sortedSchedule, styles, onViewTripDetail]);

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <TouchableOpacity onPress={utility.navigation?.goBack}>
              <CustomIcon
                name={'arrow-left'}
                type="feather"
                color="black"
                onPress={utility.navigation?.goBack}
              />
            </TouchableOpacity>
            <TextBig bold>ALL_TRIP</TextBig>
          </View>
          <TouchableOpacity onPress={handleOpenMap}>
            <CustomIcon
              name={'directions'}
              type="material-icons"
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={showUserLocation}
          userLocationUpdateInterval={1000}
          showsMyLocationButton
          moveOnMarkerPress
          onMapReady={onMapReady}
          userLocationCalloutEnabled
          style={{flex: 1}}
          initialRegion={{
            latitude: Number(
              userLocation?.lat ||
                (sortedSchedule.length &&
                  sortedSchedule[0].branch?.location.lat),
            ),
            longitude: Number(
              userLocation?.long ||
                (sortedSchedule.length &&
                  sortedSchedule[0].branch?.location.long),
            ),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onUserLocationChange={({nativeEvent}) => {
            const {latitude, longitude} = nativeEvent.coordinate;
            setUserLocation({lat: latitude, long: longitude});
          }}>
          {/* {sortedSchedule.map((schedule, index) => {
            const loc = schedule.branch?.location;
            const latitude = parseFloat(loc.lat);
            const longitude = parseFloat(loc.long);

            if (isNaN(latitude) || isNaN(longitude)) {
              console.warn(
                `Skipping schedule ${schedule.id} due to invalid coordinates`,
              );
              return null;
            }

            return (
              <CustomMarker schedule={schedule} latitude={latitude} longitude={longitude}
                onViewTripDetail={onViewTripDetail} styles={styles} index={index} />
            );
          })} */}

          {memoizedMarkers}

          {Object.entries(polylines).map(([key, coords]) => (
            <Polyline
              key={key}
              coordinates={coords}
              strokeColor="blue"
              strokeWidth={4}
            />
          ))}
        </MapView>

        <View style={styles.btnContainer}>
          <CustomButton
            title={'BACK_N_CANCEL'}
            onPress={onBacknCancel}
            width={!nearbySchedule ? '100%' : '48%'}
            tirtiary
          />
          {nearbySchedule && (
            <CustomButton
              title={'PICKUP'}
              width={'48%'}
              onPress={onPickupSchedule}
            />
          )}
        </View>
      </View>

      <PickupDetailSheet
        key={'pickup-detail-view'}
        isOpen={pickupDetailModal}
        closeSheet={() => setPickupDetailModal(false)}
        schedule={viewSchedule as Schedule}
        handlePickup={(item: Schedule) => {
          setPickupFormModal(true);
        }}
      />

      <PickupFormSheet
        key={'pickup-form'}
        isOpen={pickupFormModal}
        closeSheet={() => setPickupFormModal(false)}
        schedule={nearbySchedule}
        isSingleTrip={false}
      />

      {distanceLoader && (
        <View
          style={{
            position: 'absolute',
            height: '110%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <ActivityIndicator color={COLORS.primary} size={'large'} />
          <TextNormal color={'white'} bold textStyle={{marginTop: 15}}>
            CALCULATING_DISTANCE
          </TextNormal>
        </View>
      )}
    </SafeAreaWrapper>
  );
};

export default AllSchedulNavigation;

const dynamicStyles = (isRTL: boolean) =>
  StyleSheet.create({
    mapView: {flex: 1},
    container: {
      paddingHorizontal: widthToDP(4),
      flex: 1,
      gap: 10,
    },
    btnContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
    },
    markerContainer: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      alignItems: 'center',
      // backgroundColor: COLORS.primary,
      borderRadius: 5,
    },
    markerText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
