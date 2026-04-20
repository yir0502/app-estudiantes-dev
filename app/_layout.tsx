import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/src/lib/auth-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="perfil" options={{ headerShown: false }} />
            <Stack.Screen name="admin/usuarios" options={{ headerShown: false }} />
            <Stack.Screen name="modals/add-schedule" options={{ presentation: "modal", title: "Nueva Materia", headerShown: true }} />
            <Stack.Screen name="modals/add-task" options={{ presentation: "modal", title: "Nueva Tarea", headerShown: true }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal", headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}