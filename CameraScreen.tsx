import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Button, Platform } from "react-native";
import {
  Camera,
  useSkiaFrameProcessor,
  useCameraFormat,
  CameraPosition,
  useCameraDevice,
} from "react-native-vision-camera";
import {
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Skia, PaintStyle } from "@shopify/react-native-skia";

interface Point {
  x: number;
  y: number;
}

export default function CameraScreen() {
  const [position, setPosition] = useState<CameraPosition>("front");
  const device = useCameraDevice(position);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 60 },
  ]);
  const fps = format?.maxFps;
  const pixelFormat = Platform.OS === "ios" ? "rgb" : "yuv";

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "denied") {
        console.log("Camera permission denied");
      }
    })();
  }, []);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "fast",
    contourMode: "all",
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);
  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render();
      // Workaround for Android rotation to fix the camera orientation.
      if (Platform.OS === "android") {
        frame.translate(frame.width / 2, frame.height / 2);
        frame.rotate(90, 0, 0);
        frame.translate(-frame.height / 2, -frame.width / 2);
      }

      const faces = detectFaces(frame);

      if (faces.length > 0) {
        const face = faces[0];
        const lowerLipContour = Object.values(
          face.contours.LOWER_LIP_TOP || {}
        );
        const upperLipContour = Object.values(
          face.contours.UPPER_LIP_BOTTOM || {}
        );
        const allContours = [...lowerLipContour, ...upperLipContour];

        const linePaint = Skia.Paint();
        linePaint.setColor(Skia.Color("green"));
        linePaint.setStrokeWidth(6);
        linePaint.setStyle(PaintStyle.Stroke);

        // Create a path to draw the line
        const path = Skia.Path.Make();

        // Start the path at the first point
        if (allContours.length > 0) {
          const firstPoint = allContours[0];
          path.moveTo(firstPoint.x, firstPoint.y);

          // Draw lines to each subsequent point
          for (let i = 1; i < allContours.length; i++) {
            const point = allContours[i];
            if (point && point.x != null && point.y != null) {
              path.lineTo(point.x, point.y);
            }
          }

          // Close the path by connecting back to the first point
          path.close();

          // Draw the path
          frame.drawPath(path, linePaint);
        }
      }
    },
    [detectFaces]
  );

  const flipCamera = useCallback(() => {
    setPosition((pos) => (pos === "front" ? "back" : "front"));
  }, []);

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
        fps={fps}
        pixelFormat={pixelFormat}
        enableFpsGraph={true}
      />

      {/* Flip Camera Button */}
      <View style={styles.buttonContainer}>
        <Button title="Flip Camera" onPress={flipCamera} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
});
