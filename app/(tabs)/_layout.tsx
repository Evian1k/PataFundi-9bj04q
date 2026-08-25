// Root (tabs) layout — not used by PataFundi roles (each role has its own group)
// This file exists from the template. PataFundi uses (customer), (fundi), (admin), (staff) groups.
import { Redirect } from 'expo-router';
export default function RootTabsRedirect() {
  return <Redirect href="/onboarding" />;
}
