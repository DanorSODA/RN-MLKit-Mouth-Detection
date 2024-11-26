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
import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useCamera } from "./hooks/useCamera";
import { useFaceFrameProcessing } from "./hooks/useFaceFrameProcessing";
import { useCameraPermissions } from "./hooks/useCameraPermissions";

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
  const { device, format, cameraFps, pixelFormat, flipCamera, isAppActive } =
    useCamera();
  const { frameProcessor } = useFaceFrameProcessing();
  const { status, requestPermission, isLoading } = useCameraPermissions();

  const handlePermissionRequest = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (status === "denied") {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission is required to use this feature.
        </Text>
        <Text style={styles.subPermissionText}>
          Please grant camera access to continue.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handlePermissionRequest}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        isActive={isAppActive}
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
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  subPermissionText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MouthDetectionScreen;
