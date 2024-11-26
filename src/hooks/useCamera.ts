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
import { useState, useEffect } from "react";
import {
  Camera,
  CameraPosition,
  PixelFormat,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { Platform } from "react-native";

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
  const device = useCameraDevice(position);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 60 },
  ]);
  const cameraFps = format?.maxFps;
  const pixelFormat: PixelFormat = Platform.OS === "ios" ? "rgb" : "yuv";

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "denied") {
        console.log("Camera permission denied");
      }
    })();
  }, []);

  const flipCamera = () =>
    setPosition((pos) => (pos === "front" ? "back" : "front"));

  return {
    device,
    format,
    cameraFps,
    pixelFormat,
    position,
    flipCamera,
  };
};
