/**
 * @file MouthDetectionScreen
 * @author Danor S.O.D.A
 * @lastModified 26-11-2024
 *
 * @description
 * This screen component provides real-time mouth detection functionality using the device's camera.
 * Key features:
 * - Real-time camera feed with face detection
 * - Camera flip functionality (front/back)
 * - FPS monitoring
 * - Support for both iOS and Android platforms
 *
 * @requires react-native-vision-camera
 * @requires expo-vector-icons
 */
import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Camera } from "react-native-vision-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useCamera } from "./hooks/useCamera";
import { useFaceFrameProcessing } from "./hooks/useFaceFrameProcessing";

/**
 * MouthDetectionScreen Component
 *
 * A screen component that implements real-time mouth detection using the device camera.
 * Utilizes custom hooks for camera management and face frame processing.
 *
 * @component
 * @returns {JSX.Element} The rendered component
 */
const MouthDetectionScreen = () => {
  const { device, format, cameraFps, pixelFormat, flipCamera } = useCamera();
  const { frameProcessor } = useFaceFrameProcessing();

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No Device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={true}
        device={device}
        format={format}
        frameProcessor={frameProcessor}
        fps={cameraFps}
        pixelFormat={pixelFormat}
        enableFpsGraph={true}
      />

      {/* Flip Camera Button */}
      <View style={styles.flipButtonContainer}>
        <MaterialIcons
          name={
            Platform.OS === "ios" ? "flip-camera-ios" : "flip-camera-android"
          }
          size={40}
          color="white"
          onPress={flipCamera}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flipButtonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: 10,
  },
});

export default MouthDetectionScreen;
