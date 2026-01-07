# Miami Beach Resort - React Native App

A mobile app for Miami Beach Resort front desk management built with React Native and Expo.

## Features

- ✅ **Today View** - Check-ins, check-outs, and in-house guests
- ✅ **Calendar** - Visual room availability grid
- ✅ **Bookings** - Search and manage all bookings
- ✅ **Housekeeping** - Room status management
- ✅ **Accounting** - Revenue reports and outstanding payments
- ✅ **Search & Book** - Create new reservations
- ✅ **Role-based Access** - Admin, Front Desk, Accounting, HK Manager, HK Team

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

```bash
# Navigate to project directory
cd MiamiBeachResort

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Your Device

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npx expo start` in terminal
3. Scan the QR code with:
   - **iOS:** Camera app
   - **Android:** Expo Go app

### Running on Emulator

```bash
# Android
npx expo start --android

# iOS (Mac only)
npx expo start --ios
```

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin (full access) |
| frontdesk | fd123 | Front Desk |
| accounting | acc123 | Accounting |
| hkmanager | hkm123 | HK Manager |
| hkteam | team123 | HK Team |

## Role Access Matrix

| Screen | Admin | Front Desk | Accounting | HK Manager | HK Team |
|--------|-------|------------|------------|------------|---------|
| Today | ✅ | ✅ | ✅ | ✅ | ❌ |
| Calendar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bookings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Housekeeping | ✅ | ❌ | ❌ | ✅ | ✅ |
| Accounting | ✅ | ❌ | ✅ | ❌ | ❌ |
| Search & Book | ✅ | ✅ | ❌ | ❌ | ❌ |

## Project Structure

```
MiamiBeachResort/
├── App.js                 # Main entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── babel.config.js        # Babel configuration
├── assets/                # Icons and splash screens
└── src/
    ├── constants/
    │   ├── colors.js      # Design system colors
    │   └── config.js      # API endpoints, room config
    ├── context/
    │   └── AuthContext.js # Authentication state
    ├── navigation/
    │   └── AppNavigator.js# Navigation structure
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── TodayScreen.js
    │   ├── CalendarScreen.js
    │   ├── BookingsScreen.js
    │   ├── HousekeepingScreen.js
    │   ├── AccountingScreen.js
    │   ├── BookingDetailScreen.js
    │   └── SearchBookScreen.js
    └── services/
        └── api.js         # API calls
```

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (for direct installation)
eas build -p android --profile preview

# Build AAB (for Play Store)
eas build -p android --profile production
```

### iOS

```bash
# Build for iOS (requires Apple Developer account)
eas build -p ios --profile production
```

## API Endpoints

The app connects to:
- **Beds24 Proxy:** https://beds24-proxy-1006186358018.us-central1.run.app
- **Housekeeping API:** https://hk-api-1006186358018.us-central1.run.app

## Customization

### Change Colors
Edit `src/constants/colors.js`

### Change API Endpoints
Edit `src/constants/config.js`

### Add New Rooms
Update the `ROOMS` and `ROOM_NUMBERS` arrays in `src/constants/config.js`

## Troubleshooting

### "Unable to resolve module" error
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Metro bundler issues
```bash
npx expo start --clear
```

### Build fails
```bash
eas build:configure
eas build -p android --profile preview
```

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build toolchain
- **React Navigation** - Navigation library
- **AsyncStorage** - Persistent local storage

## License

Private - Miami Beach Resort
