# Master Crypto Mobile App

React Native Expo mobile application for cryptocurrency and gift card exchange.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the crypto-app directory:
```bash
cd crypto-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## 📱 Features

- ✅ User Authentication (Login/Register)
- ✅ KYC Verification (3-step process)
- ✅ Dashboard with Balance Display
- ✅ Buy Cryptocurrency
- ✅ Exchange Crypto to Naira
- ✅ Buy Gift Cards
- ✅ Exchange Gift Cards
- ✅ Transaction History
- ✅ Notifications
- ✅ Profile Management

## 🔧 Configuration

### Backend API
Update the API endpoint in `utils/api.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS/cosmic-view-frames-main/public/php';
```

**Important**: Replace `localhost` with your computer's IP address when testing on a physical device.

## 📂 Project Structure

```
crypto-app/
├── screens/           # All screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── KYCScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── BuyCryptoScreen.tsx
│   ├── ExchangeCryptoScreen.tsx
│   └── ...
├── utils/            # Utilities
│   ├── api.ts        # API client
│   └── storage.ts    # AsyncStorage helpers
├── constants/        # App constants
│   └── theme.ts      # Colors & spacing
├── App.tsx           # Main app entry
├── package.json
└── app.json
```

## 🎨 Customization

### Theme Colors
Edit `constants/theme.ts` to change colors:
```typescript
export const colors = {
  primary: '#667eea',
  secondary: '#764ba2',
  // ...
};
```

## 📱 Testing

### On Physical Device
1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code

### On iOS Simulator (Mac only)
```bash
npm run ios
```

### On Android Emulator
```bash
npm run android
```

## 🔐 Security Notes

- User credentials are stored in AsyncStorage
- API calls use axios for HTTP requests
- File uploads use FormData with multipart/form-data

## 📝 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## 🐛 Troubleshooting

### Module not found errors
```bash
npm install
```

### Network request failed
- Check your API_BASE_URL in `utils/api.ts`
- Use your computer's IP address instead of localhost
- Ensure PHP backend is running

### Expo Go connection issues
- Ensure your phone and computer are on the same WiFi network
- Try restarting the Expo server

## 📦 Dependencies

- expo: ~51.0.0
- react-native: 0.74.0
- @react-navigation/native: ^6.1.9
- axios: ^1.12.2
- expo-linear-gradient: ~13.0.2
- expo-image-picker: ~15.0.5
- @react-native-async-storage/async-storage: 1.23.1

## 🔄 Syncing with Web App

The mobile app connects to the same PHP backend as the web app. Ensure your backend is accessible from your mobile device's network.

## 📄 License

Private Project
