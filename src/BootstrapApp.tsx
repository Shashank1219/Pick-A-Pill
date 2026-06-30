import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ensureNotificationChannelReady } from '@/services/notificationService';
import { hydrateAllStores } from '@/stores/hydrateStores';
import { initializeMmkvStorage } from '@/storage/mmkvStorage';
import { Colors } from '@/tokens/colors';

type AppComponent = React.ComponentType;

export function BootstrapApp() {
  const [App, setApp] = useState<AppComponent | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await initializeMmkvStorage();
        hydrateAllStores();
        await ensureNotificationChannelReady();
      } catch (error) {
        console.error('[Bootstrap] Initialization failed:', error);
      }

      if (cancelled) {
        return;
      }

      const LoadedApp = require('../App').default as AppComponent;
      setApp(() => LoadedApp);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (App === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  return <App />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
});
