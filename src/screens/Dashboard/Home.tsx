/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  checkMultiple,
  openSettings,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { heightToDP, widthToDP } from 'react-native-responsive-screens';
import GradientWrapper from '../../components/BackgroundWrappers/GradientWrapper';
import { EndTripFormSheet } from '../../components/BottomSheets/EndTripFormSheet';
import CustomButton from '../../components/common/CustomButton';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import SearchBar from '../../components/common/SearchBar';
import { TextNormal } from '../../components/common/Texts';
import { HomeHeader } from '../../components/Home/HomeHeader';
import { TripList } from '../../components/Trips/TripList';
import {
  useCancelScheduleMutation,
  useGetAllSchedulesQuery,
} from '../../redux/apis/schedules';
import {
  setCurrentTrips,
  setResetCurrentTrips,
  setTripActive,
} from '../../redux/reducers/generalSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  checkIfLocationEnabled,
  getCurrentUserLocation,
  getDistanceInMeters,
  handleErrorMessage,
  showErrorToast,
  showSuccessToast,
} from '../../utils/helpers';
import { useDailyReset } from '../../utils/hooks/useDailyReset';
import { GetSchedulesApiResponse, Schedule } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import { utility } from '../../utils/utility';

interface HomeProps { }

const permission =
  Platform.OS === 'ios'
    ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
    : [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ];

// Haversine distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function sortLocationsByNearest(locations) {
  const remaining = [...locations];
  const sorted = [];
  let currentLocation = await getCurrentUserLocation();
  let current = {
    lat: currentLocation.latitude,
    long: currentLocation.longitude,
  };

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const loc = remaining[i];
      const dist = getDistance(
        current.lat,
        current.long,
        parseFloat(loc.lat),
        parseFloat(loc.long),
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0];
    sorted.push(nearest);
    current = { lat: parseFloat(nearest.lat), long: parseFloat(nearest.long) };
  }

  return sorted;
}

export const Home: React.FC<HomeProps> = props => {
  const { } = props;

  const checkLocationPermission = async () => {
    return await checkMultiple(permission);
  };

  const { t } = useTranslation();

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

  const requestLocation = async () => {
    try {
      const result = await checkLocationPermission();
      const isAllowed = Object.values(result).includes(RESULTS.GRANTED);

      if (isAllowed) {
        // get current location
      } else {
        const requestResult = await requestMultiple(permission);
        const requestAllowed = Object.values(requestResult).includes(
          RESULTS.GRANTED,
        );
        if (requestAllowed) {
          // get current location
        } else {
          openSettingsAlert();
        }
      }
    } catch (error) {
      console.log('[ERROR REQUESTION]', error);
    } finally {
    }
  };
  const dispatch = useAppDispatch();
  const isCurrentTrip = useAppSelector(
    store => store.generalSlice.isCurrentTrip,
  );

  const currentTripList = useAppSelector(
    store => store.generalSlice.currentTripList,
  );

  const [endFormModal, setEndFormModal] = useState(false);
  const [tripInitLoader, setTripInitLoader] = useState(false);
  const [endTripList, setEndTripList] = useState<Schedule[]>([]);
  const [trips, setTrips] = useState<Schedule[]>([]);

  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [searchKey, setSearchKey] = useState(''); // 👈 add search state

  const onAddToTrips = (id: string | number) => {
    const schedule = schedules?.rows.find(i => i.id == id);
    if (!schedule) return;

    setTrips(prev => {
      const exists = prev.some(trip => trip.id == id);
      if (exists) {
        // Remove if already in trips
        return prev.filter(trip => trip.id != id);
      } else {
        // Add if not in trips
        return [...prev, schedule];
      }
    });
  };

  useDailyReset();

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        requestLocation();
      }, 1000);
    }, []),
  );

  const {
    data: allSchedules,
    error: scheduleError,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllSchedulesQuery(
    { type: tab, search: searchKey },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true },
  );

  const onSelectTab = (type: 'daily' | 'weekly') => {
    setTab(type);
  };

  const [cancelSchedule, { isLoading: cancelLoading }] =
    useCancelScheduleMutation();

  const handleCancelSchedule = async () => {
    try {
      const scheduleIDs = currentTripList.map(it => it.id);
      if (scheduleIDs.length === 0) {
        return null;
      }
      const response = await cancelSchedule({
        schedule_ids: scheduleIDs,
      }).unwrap();
      dispatch(setResetCurrentTrips({}));
      console.log(
        '===handleCancelSchedul response===>',
        JSON.stringify(response, null, 1),
      );
      showSuccessToast('Success ');
    } catch (error) {
      handleErrorMessage(error);
    }
  };

  const schedules: GetSchedulesApiResponse = allSchedules || null;
  // console.log('===schedules===>', JSON.stringify(schedules, null, 1));
  // const schedules: GetSchedulesApiResponse = ALL_SCHEDULES;
  // console.log('===schedules===>', JSON.stringify(schedules, null, 1));
  scheduleError &&
    console.log('===scheduleError===>', JSON.stringify(scheduleError, null, 1));

  const noIncompleteTripError = utility.translate('NO_INCOMPLETE_TRIPS');

  const sortTripByDistance = async (scheduleList: Schedule[]) => {
    let currentLocation = await getCurrentUserLocation();
    // let currentLocation = {latitude: 24.92561, longitude: 67.060623};

    // Make a shallow copy so we can remove items as we visit them
    const remaining = [...scheduleList];
    const sorted: Schedule[] = [];

    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const branchLat = parseFloat(`${remaining[i].branch?.location.lat}`);
        const branchLng = parseFloat(`${remaining[i].branch?.location.long}`);
        if (!Number.isFinite(branchLat) || !Number.isFinite(branchLng))
          continue;

        const distance = getDistanceInMeters(
          currentLocation.latitude,
          currentLocation.longitude,
          branchLat,
          branchLng,
        );

        if (distance < bestDist) {
          bestDist = distance;
          bestIdx = i;
        }
      }

      // Pick the nearest
      const next = remaining.splice(bestIdx, 1)[0];
      sorted.push(next);

      // Update current location
      const nextLoc = next.branch?.location;
      currentLocation = {
        latitude: parseFloat(`${nextLoc?.lat}`),
        longitude: parseFloat(`${nextLoc?.long}`),
      };
    }

    return sorted;
  };

  const onStartTrip = async () => {
    try {
      const res = await checkIfLocationEnabled();
      if (!res) {
        return Alert.alert(
          'Location not Enabled',
          'Please enable your location',
        );
      }
      setTripInitLoader(true);
      let filteredTrips: Schedule[] = [];
      if (isCurrentTrip) {
        filteredTrips = currentTripList;
      } else {
        filteredTrips = trips.length ? trips : schedules?.rows.filter(i => i.status === 'INCOMPLETE');
        // .splice(0, 3);
        if (!filteredTrips.length) {
          let errorMessage = noIncompleteTripError;
          const completedTrips = schedules?.rows.filter(
            i => i.status === 'COMPLETE',
          );
          const inProgressTrip = schedules?.rows.filter(
            i => i.status === 'IN_PROGRESS',
          );
          if (completedTrips.length === schedules?.rows.length) {
            errorMessage = t('ALL_TRIPS_ARE_COMPLETED');
          } else if (inProgressTrip.length === schedules?.rows.length) {
            errorMessage = t('ALL_TRIPS_ARE_IN_PROGRESS');
          }
          setTripInitLoader(false);

          return showErrorToast(errorMessage);
        }

        // const sortedByDistance = await sortLocationsByNearest(filteredTrips); // update version
        const sortedByDistance = await sortTripByDistance(filteredTrips);
        filteredTrips = sortedByDistance;
        dispatch(setTripActive(true));
        dispatch(setCurrentTrips(sortedByDistance));
      }
      setTripInitLoader(false);
      setTrips([])
      utility.navigation?.navigate('AllSchedulNavigation', {
        schedules: filteredTrips || [],
      });
    } catch (error) {
      console.log('errrrrrr', error);
    }
  };

  const onEndTrip = () => {
    const filtered = currentTripList.filter(
      i => i.status === 'IN_PROGRESS',
    ) as Schedule[];

    if (!filtered.length) {
      return showErrorToast('NO_TRIP_PICKUP_FOUND');
    }

    setEndTripList(filtered);

    setEndFormModal(true);
  };

  return (
    <SafeAreaWrapper dismissKeyboard={false}>
      <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
      <View style={styles.container}>
        <HomeHeader />
        {/* 🔍 Search bar */}
        <SearchBar
          onSearch={(val: string) => {
            setSearchKey(val);
          }}
        />
        <View style={{ alignItems: 'center' }}>
          {/* <HomeBannerSVG width={WIDTH} /> */}
        </View>
        <View
          style={{
            flexDirection: 'row',
            height: heightToDP(6),
            borderRadius: 30,
            overflow: 'hidden',
            backgroundColor: '#FAFAFA',
          }}>
          <GradientWrapper
            containerStyle={[styles.tab, tab === 'daily' && styles.selectedTab]}
            showGradient={tab == 'daily'}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
              onPress={() => onSelectTab('daily')}>
              <TextNormal bold color={tab === 'daily' ? 'white' : 'black'}>
                TODAY
              </TextNormal>
            </TouchableOpacity>
          </GradientWrapper>
          <GradientWrapper
            showGradient={tab === 'weekly'}
            containerStyle={[
              styles.tab,
              tab === 'weekly' && styles.selectedTab,
            ]}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
              onPress={() => onSelectTab('weekly')}>
              <TextNormal bold color={tab === 'weekly' ? 'white' : 'black'}>
                FUTUTRE_PICKUPS
              </TextNormal>
            </TouchableOpacity>
          </GradientWrapper>
        </View>
        <TripList
          schedules={schedules?.rows || []}
          tab={tab}
          isLoading={isLoading || isFetching}
          onRefetch={refetch}
          isUrgent={tab === 'weekly'}
          trips={trips}
          onAddToTrips={onAddToTrips}
        />
        {schedules?.rows.length && tab === 'daily' ? (
          <View style={styles.floatingTripButton}>
            <CustomButton
              title={isCurrentTrip ? 'CONTINUE' : trips.length ? `${t("NAVIGATE")} ${trips.length}` : 'NAVIGATE_ALL'}
              onPress={onStartTrip}
              gradient
              loading={tripInitLoader}
              width={isCurrentTrip ? '30%' : '100%'}
            />
            {isCurrentTrip && (
              <CustomButton
                title={'CANCEL_TRIP'}
                onPress={handleCancelSchedule}
                width={isCurrentTrip ? '30%' : '100%'}
                tirtiary
              />
            )}
            {isCurrentTrip && (
              <CustomButton
                title={'END_TRIP'}
                onPress={onEndTrip}
                width={isCurrentTrip ? '30%' : '100%'}
                tirtiary
              />
            )}
          </View>
        ) : null}
      </View>

      {endFormModal && (
        <EndTripFormSheet
          isMultipleSchedules
          schedules={endTripList}
          isOpen={endFormModal}
          closeSheet={() => setEndFormModal(false)}
        />
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthToDP(4),
    gap: 15,
    flex: 1,
  },
  floatingTripButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selectedTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
  },
});
