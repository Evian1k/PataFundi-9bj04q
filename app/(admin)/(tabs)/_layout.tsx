import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function AdminTabLayout() {
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
      tabBarActiveTintColor: Colors.role.admin,
      tabBarInactiveTintColor: Colors.text.muted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="jobs" options={{ title: 'Jobs', tabBarIcon: ({ color, size }) => <MaterialIcons name="work" size={size} color={color} /> }} />
      <Tabs.Screen name="payments" options={{ title: 'Finance', tabBarIcon: ({ color, size }) => <MaterialIcons name="account-balance" size={size} color={color} /> }} />
    </Tabs>
  );
}
