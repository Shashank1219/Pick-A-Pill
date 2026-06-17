import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { ChartBar, Home, Settings } from 'lucide-react-native';

import { FAB } from '@/components/FAB';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<TabParamList>();

export function AppNavigator() {
  const [tabIndex, setTabIndex] = React.useState(0);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const showFab = tabIndex === 0 || tabIndex === 1;

  return (
    <View style={styles.wrap}>
      <Tab.Navigator
        screenListeners={{
          state: e => {
            const idx = e.data.state?.index ?? 0;
            setTabIndex(idx);
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
      <FAB
        visible={showFab}
        onPress={() => navigation.navigate('AddMedicationFlow', {})}
      />
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
