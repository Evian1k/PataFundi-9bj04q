import { Stack } from 'expo-router';

export default function StaffLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="support" />
      <Stack.Screen name="fraud" />
      <Stack.Screen name="finance" />
      <Stack.Screen name="dispatch" />
      <Stack.Screen name="devops" />
    </Stack>
  );
}
