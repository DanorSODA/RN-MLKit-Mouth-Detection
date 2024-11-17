# Vision Camera Mouth Detection Demo

A React Native application that demonstrates real-time mouth contour detection using VisionCamera. The app uses the device's camera to detect and draw contours around the mouth area, supporting both iOS and Android platforms.

## Features

- Real-time mouth contour detection
- Support for both front and back cameras
- Platform-specific optimizations for iOS and Android
- High-performance rendering using React Native Skia
- Camera flip functionality

## Prerequisites

- Node.js (v16 or newer)
- Yarn package manager
- iOS: XCode (for iOS development)
- Android: Android Studio (for Android development)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/danor93/vision-camera-mouth-detection-demo.git
```

2. Install dependencies:

```bash
yarn install
```

3. Install iOS pods (iOS only):

```bash
cd ios
pod install
```

## Running the App

### Development Build

First, create a development build:

```bash
// For iOS
yarn ios
```

```bash
// For Android
yarn android
```

### Start the Development Server

```bash
yarn start
```

## Project Structure

- `CameraScreen.tsx` - Main camera implementation with face detection
- `PointsSkia.tsx` - Skia-based rendering component for mouth points
- `package.json` - Project dependencies and scripts

## Dependencies

The project uses several key dependencies:

- `react-native-vision-camera` - For camera access and frame processing
- `react-native-vision-camera-face-detector` - For face detection capabilities
- `@shopify/react-native-skia` - For high-performance 2D graphics
- `react-native-worklets-core` - For running code in the JavaScript thread
- `expo` - Development framework and tools

## Platform-Specific Notes

### iOS

- Uses Skia frame processor for rendering
- RGB pixel format

### Android

- Uses standard frame processor
- YUV pixel format
- Custom points rendering implementation

## Troubleshooting

1. Camera Permission Issues

   - Ensure camera permissions are granted in device settings
   - The app will request permissions on first launch

2. Black Screen Issues

   - On Android with front camera: This is a known limitation when using Skia frame processor

3. Build Issues
   - Clear metro bundler cache: `yarn start --c`
   - For iOS: Clean XCode build folder
   - For Android: Clean gradle build `cd android && ./gradlew clean`
