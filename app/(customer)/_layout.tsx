import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job-create" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="job-matching" options={{ animation: 'fade' }} />
      <Stack.Screen name="job-tracking" />
      <Stack.Screen name="fundi-profile" />
      <Stack.Screen name="chat-room" />
      <Stack.Screen name="payment-flow" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
