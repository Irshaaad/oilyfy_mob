/* eslint-disable react-native/no-inline-styles */
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { heightToDP } from 'react-native-responsive-screens';
import { Schedule } from '../../utils/interface';
import { COLORS } from '../../utils/theme';
import { PickupDetailSheet } from '../BottomSheets/PickupDetailSheet';
import { PickupFormSheet } from '../BottomSheets/PickupFormSheet';
import { TextNormal, TextSmall } from '../common/Texts';
import { Trip } from './Trip';

interface TripListProps {
  schedules: Schedule[];
  trips: Schedule[];
  isLoading: boolean;
  isUrgent: boolean;
  onRefetch: () => void;
  onAddToTrips: (id: string | number) => void;
  tab: 'daily' | 'weekly';
}

export const TripList: React.FC<TripListProps> = props => {
  const { schedules, tab, isLoading, isUrgent, onRefetch, trips, onAddToTrips } = props;

  const [selectedTrip, setSelectedTrip] = useState<Schedule | undefined>(
    undefined,
  );
  const [pickupDetailModal, setPickupDetailModal] = useState(false);
  const [pickupFormModal, setPickupFormModal] = useState(false);

  const detailSheetRef = useRef<BottomSheetModal>(null);
  const pickupSheetRef = useRef<BottomSheetModal>(null);

  const onSelectTrip = (item: Schedule) => {
    setSelectedTrip(item);
    setPickupDetailModal(true);
  };

  const handlePickup = (item: Schedule) => {
    setTimeout(() => {
      setPickupFormModal(true);
    }, 100);
  };

  return (
    <>
      <FlatList
        data={schedules || []}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefetch} />
        }
        ListHeaderComponent={
          <View
            style={{
              height: heightToDP(3),
              marginBottom: 5,
              justifyContent: 'center',
            }}>
            <TextSmall bold color={COLORS.blackGrey}>
              {tab == 'daily' ? 'TODAYS_TRIP_LIST' : 'WEEKLY_TRIP_LIST'}
            </TextSmall>
          </View>
        }
        contentContainerStyle={{ gap: 15, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Trip
            item={item}
            onSelectTrip={onSelectTrip}
            isUrgent={isUrgent}
            isSelected={!!trips.find(i => i.id == item.id)}
            addToTrips={() => onAddToTrips(item.id)}
          />
        )}
        ListEmptyComponent={
          <View
            style={{ height: '50%', width: '100%', justifyContent: 'center' }}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <TextNormal center bold color={COLORS.blackGrey}>
                NO_SCHEDULED_ITEMS_FOUND
              </TextNormal>
            )}
          </View>
        }
      />
      <PickupDetailSheet
        schedule={selectedTrip as Schedule}
        isOpen={pickupDetailModal}
        bottomSheetRef={detailSheetRef}
        closeSheet={() => setPickupDetailModal(false)}
        handlePickup={handlePickup}
        hideNavigate={isUrgent ? false : true}
      />

      <PickupFormSheet
        schedule={selectedTrip as Schedule}
        isOpen={pickupFormModal}
        bottomSheetRef={pickupSheetRef}
        closeSheet={() => setPickupFormModal(false)}
      />
    </>
  );
};
