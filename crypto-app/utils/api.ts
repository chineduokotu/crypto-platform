import axios from 'axios';
import { Platform } from 'react-native';

// 🧠 Replace this with your computer's current IP address
const LOCAL_IP = '192.168.0.135';

// 🔹 Auto-detect platform: use localhost for web, use IP for Expo Go
const baseURL =
  Platform.OS === 'web'
    ? 'http://localhost/php'
    : `http://${LOCAL_IP}/php`;

// 🔹 Create one Axios instance
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // optional
});

// 🔹 Optional global error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.message || error);
    return Promise.reject(error);
  }
);

export default apiClient;
