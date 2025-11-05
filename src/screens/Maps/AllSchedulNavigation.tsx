/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
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
import {useAppDispatch, useAppSelector} from '../../redux/store';
import {NEAR_VALUE} from '../../utils/constants';
import {
  fetchPolylineBetweenPoints,
  getDistanceInMeters,
  handleErrorMessage,
  openGoogleMapsWithDirections,
  showSuccessToast,
} from '../../utils/helpers';
import {Schedule, ScreenProps} from '../../utils/interface';
import {COLORS} from '../../utils/theme';
import {utility} from '../../utils/utility';
import {CustomCallout} from './ViewLocation';
import {useCancelScheduleMutation} from '../../redux/apis/schedules';
import {setResetCurrentTrips} from '../../redux/reducers/generalSlice';

interface AllSchedulNavigationProps extends ScreenProps {}

const POLYLINE_MIN_INTERVAL_MS = 6000; // throttle polyline work
const SIGNIFICANT_MOVE_METERS_STATE = 12; // avoid state churn
const SIGNIFICANT_MOVE_METERS_POLY = 20; // your existing threshold

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
  </View>
);

const CustomMarker = React.memo(
  ({schedule, latitude, longitude, onViewTripDetail, styles, index}) => {
    return (
      <Marker
        key={schedule?.id?.toString?.() ?? String(schedule?.id)}
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

const AllSchedulNavigation: React.FC<AllSchedulNavigationProps> = props => {
  const {route} = props;

  const dispatch = useAppDispatch();
  const isRTL = useAppSelector(store => store.generalSlice.isRTL);
  const styles = dynamicStyles(!!isRTL);

  const [showUserLocation, setShowUserLocation] = useState(false);
  const [nearbySchedule, setNearbySchedule] = useState<Schedule | null | any>();
  const [viewSchedule, setViewScheduled] = useState<Schedule>();
  const [polylines, setPolylines] = useState<Record<number, any[]>>({});
  const [pickupDetailModal, setPickupDetailModal] = useState(false);
  const [pickupFormModal, setPickupFormModal] = useState(false);
  const [distanceLoader, setDistanceLoader] = useState(true);
  const [openLinkLoader, setOpenLinkLoader] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  const [appIsActive, setAppIsActive] = useState(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const schedules: Schedule[] = route?.params?.schedules ?? [];
  const mapRef = useRef<MapView>(null);
  const prevUserLocationRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const lastPolylineAtRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);
  const reqGenRef = useRef<number>(0); // ignore stale async results
  const didInitialFitRef = useRef<boolean>(false);

  const [cancelSchedule, {isLoading: cancelLoading}] =
    useCancelScheduleMutation();

  const handleCancelSchedule = async () => {
    try {
      const scheduleIDs = schedules.map(it => it.id);
      if (scheduleIDs.length === 0) {
        return null;
      }
      const response = await cancelSchedule({
        schedule_ids: scheduleIDs,
      }).unwrap();
      dispatch(setResetCurrentTrips({}));
      utility.navigation?.goBack();
      console.log(
        '===handleCancelSchedul response===>',
        JSON.stringify(response, null, 1),
      );
      showSuccessToast('Success ');
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const handleOpenMap = useCallback(async () => {
    try {
      setOpenLinkLoader(true);
      // single-shot location query only on explicit action
      const origin = userLocation;
      let waypoints = schedules.map(schedule => {
        const loc = schedule?.branch?.location ?? {};
        return {
          latitude: Number(loc?.lat),
          longitude: Number(loc?.long),
        };
      });
      const destination = waypoints.pop();
      openGoogleMapsWithDirections({
        origin,
        destination,
        waypoints,
      });
    } catch (error) {
      console.log('===handleOpenMap error===>', error);
    } finally {
      setOpenLinkLoader(false);
    }
  }, []);

  const onMapReady = useCallback(() => setShowUserLocation(true), []);

  const onPickupSchedule = useCallback(() => {
    if (!nearbySchedule) return;
    setPickupFormModal(true);
  }, [nearbySchedule]);

  const onViewTripDetail = useCallback((sch: Schedule) => {
    setViewScheduled(sch);
    setTimeout(() => {
      setPickupDetailModal(true);
    }, 130);
  }, []);

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

  const fetchAllPolylines = useCallback(
    async (
      allPoints: Array<{id: number; lat: number; long: number}>,
      generation: number,
      doFit: boolean,
    ) => {
      try {
        inFlightRef.current = true;
        // setDistanceLoader(true); // keep commented if you don’t want UI overlay
        for (let i = 0; i < allPoints.length - 1; i++) {
          const from = allPoints[i];
          const to = allPoints[i + 1];
          const key = `${from.id}_${to.id}`;
          // respect generation to avoid updating state from stale calls
          if (generation !== reqGenRef.current || !appIsActive) return;
          await fetchPolylineBetweenPoints(from, to, key, setPolylines);
        }

        if (generation !== reqGenRef.current || !appIsActive) return;

        if (doFit) {
          const points = allPoints.map(i => ({
            latitude: i.lat,
            longitude: i.long,
          }));
          mapRef.current?.fitToCoordinates(points, {
            edgePadding: {top: 80, right: 40, bottom: 100, left: 40},
            animated: true,
          });
        }
      } catch (e) {
        console.log('error in fetchAllPolylines', e);
      } finally {
        inFlightRef.current = false;
        setDistanceLoader(false);
      }
    },
    [appIsActive],
  );

  const getPolyLinesForMap = useCallback(
    async (isInitial: boolean = false) => {
      try {
        console.log('getPolyLinesForMap');
        if (!appIsActive) return; // do nothing if app is backgrounded
        const {latitude, longitude} = userLocation;
        if (!latitude || !longitude || schedules.length === 0) return;

        const prev = prevUserLocationRef.current;
        const movedEnough =
          isInitial ||
          !prev ||
          getDistanceInMeters(
            prev.latitude,
            prev.longitude,
            latitude as number,
            longitude as number,
          ) > SIGNIFICANT_MOVE_METERS_POLY;

        // throttle
        const now = Date.now();
        const throttleOk =
          isInitial ||
          now - lastPolylineAtRef.current >= POLYLINE_MIN_INTERVAL_MS;

        if (!movedEnough || !throttleOk || inFlightRef.current) return;

        prevUserLocationRef.current = {latitude, longitude};
        lastPolylineAtRef.current = now;

        const allPoints = [
          {id: 0, lat: latitude as number, long: longitude as number},
          ...schedules.map(s => ({
            id: s.id,
            lat: Number(s?.branch?.location?.lat),
            long: Number(s?.branch?.location?.long),
          })),
        ].filter(p => Number.isFinite(p.lat) && Number.isFinite(p.long));

        const generation = ++reqGenRef.current;
        const shouldFit = isInitial || !didInitialFitRef.current;
        await fetchAllPolylines(allPoints as any, generation, shouldFit);
        if (shouldFit) didInitialFitRef.current = true;
      } catch (error) {
        console.log('error in polyline get', error);
      }
    },
    [appIsActive, userLocation, schedules, fetchAllPolylines],
  );

  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      // Find the nearest schedule
      console.log('FINIDING NEAREST');
      let closest: Schedule | null = null;
      let minDistance = Infinity;

      schedules.forEach(schedule => {
        const loc = schedule.branch?.location;
        const dist = getDistanceInMeters(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(loc.lat),
          parseFloat(loc.long),
        );
        if (dist < NEAR_VALUE && dist < minDistance) {
          closest = schedule;
          minDistance = dist;
        }
      });

      setNearbySchedule(closest);
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Recompute polylines when userLocation changes (active + throttled inside)
  useEffect(() => {
    if (!userLocation?.latitude || !userLocation?.longitude) return;
    getPolyLinesForMap(false);
  }, [userLocation?.latitude, userLocation?.longitude]);

  // // Safer, memoized handler: only update state on meaningful movement AND while active
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

  const memoizedMarkers = useMemo(() => {
    return schedules.map((schedule, index) => {
      const loc = schedule?.branch?.location ?? {};
      const latitude = Number(loc?.lat);
      const longitude = Number(loc?.long);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        return null;
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
  }, [schedules, styles, onViewTripDetail]);

  const handleUpdateStatus = () => {
    setNearbySchedule(p => ({...p, status: 'IN_PROGRESS'}));
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
            <TextBig bold>ALL_TRIP</TextBig>
          </View>
          <TouchableOpacity onPress={handleOpenMap} disabled={openLinkLoader}>
            {openLinkLoader ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <CustomIcon
                name={'directions'}
                type="material-icons"
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={showUserLocation}
          // Keep interval modest; heavy work is throttled anyway
          userLocationUpdateInterval={2500}
          showsMyLocationButton
          moveOnMarkerPress
          onMapReady={onMapReady}
          userLocationCalloutEnabled
          style={{flex: 1}}
          onUserLocationChange={handleUserLocationChange}>
          {memoizedMarkers}
          {Object.entries(polylines).map(([key, coords]) => (
            <Polyline
              key={key}
              coordinates={coords as any}
              strokeColor="blue"
              strokeWidth={4}
            />
          ))}
        </MapView>

        <View style={styles.btnContainer}>
          <CustomButton
            title={'BACK_N_CANCEL'}
            onPress={handleCancelSchedule}
            width={!nearbySchedule ? '100%' : '48%'}
            tirtiary
          />
          {nearbySchedule && nearbySchedule.status === 'INCOMPLETE' && (
            <CustomButton
              title={'PICKUP'}
              gradient
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
        handlePickup={(_item: Schedule) => {
          setPickupFormModal(true);
        }}
        hideNavigate={false}
        nearbySchedule={nearbySchedule}
      />

      <PickupFormSheet
        key={'pickup-form'}
        isOpen={pickupFormModal}
        closeSheet={() => setPickupFormModal(false)}
        schedule={nearbySchedule}
        isSingleTrip={false}
        handleUpdateStatus={handleUpdateStatus}
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
      {cancelLoading && (
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
      borderRadius: 5,
    },
    markerText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
