import 'react-native-get-random-values';

import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#0F766E',
    surface: '#FFFFFF',
    background: '#F5F7FB',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="addPhone" />
        <Stack.Screen name="editPhone" />
      </Stack>
    </PaperProvider>
  );
}
