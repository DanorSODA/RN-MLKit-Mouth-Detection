import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import {
  Camera,
  useCameraDevice,
  useSkiaFrameProcessor,
  useCameraFormat,
} from "react-native-vision-camera";
import {
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Skia, PaintStyle } from "@shopify/react-native-skia";

export default function CameraScreen() {
  const device = useCameraDevice("front");
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
  ]);
  const pixelFormat = Platform.OS === "ios" ? "rgb" : "yuv";

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "denied") {
        console.log("Camera permission denied");
      }
    })();
  }, []);

  // Initialize face detection options
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "accurate",
    contourMode: "all",
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  // Define paint for drawing points
  const pointPaint = Skia.Paint();
  pointPaint.setColor(Skia.Color("green"));
  pointPaint.setStrokeWidth(5);
  pointPaint.setStyle(PaintStyle.Fill);

  // Skia Frame Processor
  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";

      // Render the camera frame
      frame.render();

      // Detect faces
      const faces = detectFaces(frame);

      // console.log("Detected Faces:", JSON.stringify(faces, null, 2));

      if (faces.length > 0) {
        const face = faces[0];

        // Use Object.values to safely access each point as an array
        const lowerLipContour = Object.values(
          face.contours.LOWER_LIP_TOP || {}
        );
        const upperLipContour = Object.values(
          face.contours.UPPER_LIP_BOTTOM || {}
        );
        const allContours = [...lowerLipContour, ...upperLipContour];

        // Draw each point in the contours on the frame
        for (let i = 0; i < allContours.length; i++) {
          const point = allContours[i];
          if (point && point.x != null && point.y != null) {
            frame.drawCircle(point.x, point.y, 6, pointPaint);
          }
        }
      }
    },
    [detectFaces]
  );

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
        fps={format?.maxFps}
        pixelFormat={pixelFormat}
        enableFpsGraph={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
