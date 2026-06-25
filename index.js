/**
 * @format
 */

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { initializeMmkvStorage } from './src/storage/mmkvStorage';

initializeMmkvStorage()
  .then(() => {
    const App = require('./App').default;
    AppRegistry.registerComponent(appName, () => App);
  })
  .catch(error => {
    console.error('[MMKV] Fatal: storage initialization failed', error);
    const App = require('./App').default;
    AppRegistry.registerComponent(appName, () => App);
  });
