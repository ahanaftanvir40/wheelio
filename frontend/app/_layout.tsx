import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
        <Stack.Screen name="home/index" options={{ headerShown: false }} />
        <Stack.Screen name="list-vehicle/index" options={{ headerShown: false }} />
        <Stack.Screen name="vehicles/index" options={{ headerShown: false }} />
        <Stack.Screen name="vehicles/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="my-listings/index" options={{ headerShown: false }} />
        <Stack.Screen name="bookings/index" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
