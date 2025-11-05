/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  PermissionsAndroid,
  Platform,
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
import {ms} from 'react-native-size-matters';
import {EndTripFormSheet} from '../../components/BottomSheets/EndTripFormSheet';
import {PickupDetailSheet} from '../../components/BottomSheets/PickupDetailSheet';
import {PickupFormSheet} from '../../components/BottomSheets/PickupFormSheet';
import CustomButton from '../../components/common/CustomButton';
import CustomIcon from '../../components/common/CustomIcon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import {TextBig, TextNormal} from '../../components/common/Texts';
import {useAppSelector} from '../../redux/store';
import {NEAR_VALUE} from '../../utils/constants';
import {
  getCurrentUserLocation,
  getDistanceInMeters,
  getRouteDirections,
  handleErrorMessage,
  openGoogleMapsWithDirections,
  showSuccessToast,
} from '../../utils/helpers';
import {Schedule, ScreenProps} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {utility} from '../../utils/utility';
import {useCancelScheduleMutation} from '../../redux/apis/schedules';

interface ViewLocationProps extends ScreenProps {}

const POLYLINE_MIN_INTERVAL_MS = 6000; // throttle polyline work
const SIGNIFICANT_MOVE_METERS_STATE = 12; // avoid state churn
const SIGNIFICANT_MOVE_METERS_POLY = 20;

export const ViewLocation: React.FC<ViewLocationProps> = props => {
  const {route} = props;

  const [pickupFormModal, setPickupFormModal] = useState(false);
  const [pickupDetailModal, setPickupDetailModal] = useState(false);
  const [endFormModal, setEndFormModal] = useState(false);

  const pickupDetailRef = useRef<BottomSheetModal>(null);
  const pickupFormRef = useRef<BottomSheetModal>(null);

  const loadMapRef = useRef(false);
  const inFlightRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const mapRef = useRef<MapView>(null);

  const [routeCoords, setRouteCoords] = useState<
    {latitude: number; longitude: number}[]
  >([]);

  const [appIsActive, setAppIsActive] = useState(true);
  const [distanceLoader, setDistanceLoader] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  const [isNear, setIsNear] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  const LOCATION_UPDATE_THRESHOLD_METERS = 20;
  const schedule: Schedule = route?.params?.schedule;

  const destination = {
    latitude: Number(schedule?.branch?.location?.lat),
    longitude: Number(schedule?.branch?.location?.long),
  };

  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  const [cancelSchedule, {isLoading: cancelLoading}] =
    useCancelScheduleMutation();

  const handleCancelSchedule = async () => {
    try {
      const response = await cancelSchedule({
        schedule_ids: [schedule.id],
      }).unwrap();
      console.log(
        '===handleCancelSchedul response===>',
        JSON.stringify(response, null, 1),
      );
      showSuccessToast('Success');
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const calculateDistance = useCallback(
    (
      coord1: {latitude: number; longitude: number},
      coord2: {latitude: number; longitude: number},
    ) => {
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371e3;
      const φ1 = toRad(coord1.latitude);
      const φ2 = toRad(coord2.latitude);
      const Δφ = toRad(coord2.latitude - coord1.latitude);
      const Δλ = toRad(coord2.longitude - coord1.longitude);

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const fetchRoute = useCallback(
    async (current: {latitude: number; longitude: number}) => {
      try {
        if (loadMapRef.current) {
          return null;
        }
        loadMapRef.current = true;
        console.log(
          '===fetching route===>',
          JSON.stringify('fetching route', null, 1),
        );
        const coords = await getRouteDirections(current, destination);
        setRouteCoords(coords);
        console.log('===coords===>', JSON.stringify(coords, null, 1));

        if (mapRef.current && coords.length > 1) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: {top: 80, right: 40, bottom: 100, left: 40},
            animated: true,
          });
        }

        const distance = calculateDistance(current, destination);
        console.log('======[distance]=====', JSON.stringify(distance, null, 1));
        setIsNear(distance <= NEAR_VALUE); // 100 meters range
        setDistanceLoader(false);
        loadMapRef.current = false;
      } catch (err) {
        setDistanceLoader(false);
        console.error('Error fetching route:', err);
      } finally {
        setDistanceLoader(false);
      }
    },
    [calculateDistance, destination, getRouteDirections],
  );

  // const handleUserLocationChange = useCallback(
  //   async (newLocation: {latitude: number; longitude: number}) => {
  //     if (!lastFetchedLocation) {
  //       await fetchRoute(newLocation);
  //       setLastFetchedLocation(newLocation);
  //       return;
  //     }

  //     const moved = calculateDistance(newLocation, lastFetchedLocation);
  //     if (moved >= LOCATION_UPDATE_THRESHOLD_METERS) {
  //       await fetchRoute(newLocation);
  //       setLastFetchedLocation(newLocation);
  //     }
  //   },
  //   [lastFetchedLocation, calculateDistance, fetchRoute],
  // );

  const handleUserLocationChange = useCallback(
    ({nativeEvent}) => {
      console.log('handleUserLocationChange');
      if (!appIsActive) return;
      const {latitude, longitude} = nativeEvent?.coordinate ?? {};
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      setUserLocation(prev => {
        if (!prev?.latitude || !prev?.longitude) return {latitude, longitude};
        const moved =
          getDistanceInMeters(
            prev.latitude as number,
            prev.longitude as number,
            latitude,
            longitude,
          ) > SIGNIFICANT_MOVE_METERS_STATE;

        return moved ? {latitude, longitude} : prev;
      });
    },
    [appIsActive],
  );

  // AppState: pause work when backgrounded
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      appStateRef.current = nextState;
      const active = nextState === 'active';
      setAppIsActive(active);

      // When moving to background, stop heavy processing
      if (!active) {
        inFlightRef.current = false; // future async completions will be ignored by reqGen check anyway
      }
    });
    return () => {
      sub.remove();
    };
  }, []);

  // Wait for both map and permissions
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isMounted && userLocation.latitude && userLocation.longitude) {
        try {
          await fetchRoute(userLocation);
        } catch (err) {
          console.warn('Failed to get initial location:', err);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      initialize();
    };
  }, [userLocation]);

  const onMapReady = () => {
    if (Platform.OS !== 'ios') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
    setShowUserLocation(true);
  };

  const onBacknCancel = async () => {
    if (schedule.status === 'IN_PROGRESS') {
      await handleCancelSchedule();
    }
    utility.navigation?.goBack();
  };

  const onStartTrip = () => {
    setPickupFormModal(true);
    setTimeout(() => {
      pickupFormRef.current?.present();
    }, 50);
  };
  const onEndTrip = () => setEndFormModal(true);
  // const onViewTripDetail = () => setPickupDetailModal(true);
  const onViewTripDetail = () => {
    setPickupDetailModal(true);
    setTimeout(() => {
      pickupDetailRef.current?.present();
    }, 50);
  };

  const handleOpenMap = async () => {
    const origin = userLocation;
    const destination = {
      latitude: parseFloat(schedule.branch?.location.lat as string),
      longitude: parseFloat(schedule.branch?.location.long as string),
    };

    openGoogleMapsWithDirections({origin, destination});
  };

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
            <TextBig bold>{schedule?.order?.restaurant?.name}</TextBig>
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
          style={styles.mapView}
          showsUserLocation={showUserLocation}
          userLocationPriority="high"
          followsUserLocation
          showsMyLocationButton
          showsCompass
          moveOnMarkerPress
          onMapReady={onMapReady}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            ...destination,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onUserLocationChange={handleUserLocationChange}>
          <Marker coordinate={destination} title={schedule?.branch?.name}>
            <Callout onPress={onViewTripDetail}>
              <CustomCallout item={schedule} />
            </Callout>
          </Marker>

          {routeCoords?.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>

        <View style={styles.btnContainer}>
          <CustomButton
            title={
              schedule?.status === 'INCOMPLETE' ? 'GO_BACK' : 'BACK_N_CANCEL'
            }
            onPress={onBacknCancel}
            width={isNear || schedule.status === 'IN_PROGRESS' ? '40%' : '100%'}
            tirtiary
          />
          {(isNear || schedule.status === 'IN_PROGRESS') && (
            <CustomButton
              gradient
              title={schedule.status === 'IN_PROGRESS' ? 'END_TRIP' : 'PICKUP'}
              width={'48%'}
              onPress={
                schedule.status === 'IN_PROGRESS' ? onEndTrip : onStartTrip
              }
            />
          )}
        </View>
      </View>

      {pickupDetailModal && (
        <PickupDetailSheet
          key={'pickup-detail-view'}
          schedule={schedule}
          bottomSheetRef={pickupDetailRef}
          isOpen={pickupDetailModal}
          closeSheet={() => setPickupDetailModal(false)}
          handlePickup={(item: Schedule) => {
            setPickupFormModal(true);
          }}
          hideNavigate={false}
          nearbySchedule={isNear ? schedule : undefined}
        />
      )}
      {pickupFormModal && (
        <PickupFormSheet
          key={'pickup-form'}
          isOpen={pickupFormModal}
          bottomSheetRef={pickupFormRef}
          closeSheet={() => setPickupFormModal(false)}
          schedule={schedule}
          isSingleTrip
        />
      )}
      <EndTripFormSheet
        key={'endTrip-form'}
        schedule={schedule}
        isOpen={endFormModal}
        closeSheet={() => setEndFormModal(false)}
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

export const CustomCallout = ({item}: {item: Schedule}) => (
  <View
    style={{
      width: widthToDP(70),
      justifyContent: 'center',
      padding: ms(12),
      gap: 10,
    }}>
    <TextBig>{item?.branch?.name}</TextBig>
    <TextNormal numberOfLines={2}>
      {item.branch?.restaurant?.name || 'NA'}
    </TextNormal>
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        zIndex: 1000,
      }}>
      <CustomButton
        gradient
        containerStyle={{width: '100%'}}
        title="VIEW_DETAIL"
      />
    </View>
  </View>
);

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
  });
