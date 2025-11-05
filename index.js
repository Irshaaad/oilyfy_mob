import notifee from '@notifee/react-native';
import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';
import './src/localization/i18n';

notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;

  // Check if the user pressed the "Mark as read" action
  // if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {

  //     // Remove the notification
  //     await notifee.cancelNotification(notification.id);
  // }
  console.log('=========BACKGROUND NOTIFICATION HANDLER=========');
  console.log('type', JSON.stringify(type, null, 1));
  console.log('detail', JSON.stringify(detail, null, 1));
  console.log('=========BACKGROUND NOTIFICATION HANDLER=========');
});

AppRegistry.registerComponent(appName, () => App);
