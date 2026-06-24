import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { CalendarDays, ChartBar, Home, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAB } from '@/components/FAB';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_BAR_HEIGHT = 56;
const FAB_GAP = 16;

export function AppNavigator() {
  const [activeTab, setActiveTab] = React.useState<keyof TabParamList>('Home');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const showFab = activeTab === 'Home';
  const fabBottom = TAB_BAR_HEIGHT + insets.bottom + FAB_GAP;

  return (
    <View style={styles.wrap}>
      <Tab.Navigator
        screenListeners={{
          state: e => {
            const idx = e.data.state?.index ?? 0;
            const route = e.data.state?.routes[idx];
            if (route?.name) {
              setActiveTab(route.name as keyof TabParamList);
            }
          },
        }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.navy,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: Typography.caption,
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <CalendarDays size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ChartBar size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      {showFab && (
        <FAB
          visible
          bottom={fabBottom}
          onPress={() => navigation.navigate('AddMedicationFlow', {})}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.card,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});
