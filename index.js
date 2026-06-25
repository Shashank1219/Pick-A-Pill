/**
 * @format
 */

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { ensureNotificationChannelReady } from './src/services/notificationService';
import { initializeMmkvStorage } from './src/storage/mmkvStorage';

initializeMmkvStorage()
  .then(() => ensureNotificationChannelReady())
  .then(() => {
    const App = require('./App').default;
    AppRegistry.registerComponent(appName, () => App);
  })
  .catch(error => {
    console.error('[Bootstrap] Fatal: app initialization failed', error);
    const App = require('./App').default;
    AppRegistry.registerComponent(appName, () => App);
  });
