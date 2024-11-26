/**
 * @file Camera Management Hook
 * @author Danor S.O.D.A
 * @lastModified 26-11-2024
 *
 * @description
 * Custom hook that manages camera device setup and configuration.
 * Key features:
 * - Camera device selection and initialization
 * - Camera position switching (front/back)
 * - Format configuration (resolution, FPS)
 * - Camera permissions handling
 * - Platform-specific pixel format handling
 */
import { useCallback, useMemo, useState } from "react";
import {
  CameraPosition,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { Platform } from "react-native";
import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/core";

type PixelFormat = "yuv" | "rgb";

/**
 * Hook for managing camera device and configuration
 *
 * @returns {Object} Camera configuration object
 * @property {CameraDevice} device - The selected camera device
 * @property {CameraFormat} format - The camera format configuration
 * @property {number} cameraFps - The maximum FPS for the camera
 * @property {PixelFormat} pixelFormat - The pixel format (platform-specific)
 * @property {CameraPosition} position - Current camera position (front/back)
 * @property {Function} flipCamera - Function to switch between front and back cameras
 */
export const useCamera = () => {
  const [position, setPosition] = useState<CameraPosition>("front");
  const formatPreferences = useMemo(
    () => [{ videoResolution: { width: 1920, height: 1080 } }, { fps: 60 }],
    []
  );

  const device = useCameraDevice(position);
  const format = useCameraFormat(device, formatPreferences);
  const cameraFps = useMemo(() => format?.maxFps, [format]);
  const pixelFormat = useMemo<PixelFormat>(
    () => (Platform.OS === "ios" ? "rgb" : "yuv"),
    []
  );

  const isFocused = useIsFocused();
  const appState = useAppState();

  // Memoize computed values
  const isAppActive = useMemo(
    () => isFocused && appState === "active",
    [isFocused, appState]
  );

  // Memoize the flipCamera callback
  const flipCamera = useCallback(
    () => setPosition((pos) => (pos === "front" ? "back" : "front")),
    []
  );

  return useMemo(
    () => ({
      device,
      format,
      cameraFps,
      pixelFormat,
      position,
      flipCamera,
      isAppActive,
    }),
    [device, format, cameraFps, pixelFormat, position, flipCamera, isAppActive]
  );
};
