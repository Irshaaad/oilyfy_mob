import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useDispatch} from 'react-redux';
import {reduxPersistStorage} from '../../redux/mmkv-middleware';
import {setResetCurrentTrips} from '../../redux/reducers/generalSlice';
import {utility} from '../utility';

// Utility function to get today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const useDailyReset = () => {
  const dispatch = useDispatch();

  const checkAndClearStore = async () => {
    try {
      const lastCleared = await reduxPersistStorage.getItem('lastClearedDate');
      const today = getToday();

      if (lastCleared !== today) {
        console.log("==== RESETTING THE TRIPS ====")
        // Clear redux store
        dispatch(setResetCurrentTrips({}));
        // Save today's date
        utility.resetNavigation(utility.navigation, 'Home');
        await reduxPersistStorage.setItem('lastClearedDate', today);
      }
    } catch (e) {
      console.log('Error clearing daily store:', e);
    }
  };

  useEffect(() => {
    // Run once when component mounts (app start)
    checkAndClearStore();

    console.log("CHECKING FOR CHANGE")

    // Also listen for app foreground to re-check
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkAndClearStore();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
