import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function FundiTabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
        paddingTop: 8,
        paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
        paddingHorizontal: 8,
        backgroundColor: Colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: Colors.glass.borderLight,
      },
      tabBarActiveTintColor: Colors.brand.accent,
      tabBarInactiveTintColor: Colors.text.muted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} /> }} />
      <Tabs.Screen name="jobs" options={{ title: 'My Jobs', tabBarIcon: ({ color, size }) => <MaterialIcons name="assignment" size={size} color={color} /> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: ({ color, size }) => <MaterialIcons name="account-balance-wallet" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
