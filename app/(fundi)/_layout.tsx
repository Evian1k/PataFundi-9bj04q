import { Stack } from 'expo-router';

export default function FundiLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="incoming-job" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="active-job" />
    </Stack>
  );
}
