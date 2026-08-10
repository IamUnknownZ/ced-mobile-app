import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL always takes priority. When running in Expo Go, Expo tells us
// the computer's LAN address, so a physical phone can reach JSON Server too.
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const automaticUrl = metroHost
  ? `http://${metroHost}:3008`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:3008'
    : 'http://localhost:3008';

export const API_BASE_URL = configuredUrl || automaticUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
