import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  Platform,
  Dimensions,
} from "react-native";
import {
  Camera,
  useFrameProcessor,
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
import { Worklets } from "react-native-worklets-core";
import PointsSkia from "./PointsSkia";

interface Point {
  x: number;
  y: number;
}

export default function CameraScreen() {
  const [position, setPosition] = useState<CameraPosition>("front");
  const device = useCameraDevice(position);
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
  ]);
  const pixelFormat = Platform.OS === "ios" ? "rgb" : "yuv";
  const [mouthPoints, setMouthPoints] = useState<Point[]>([]);

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "denied") {
        console.log("Camera permission denied");
      }
    })();
  }, []);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: "accurate",
    contourMode: "all",
    autoScale: Platform.OS === "android" ? true : false,
    windowHeight: screenHeight,
    windowWidth: screenWidth,
  }).current;

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const setMouthPointsJS = Worklets.createRunOnJS(setMouthPoints);

  // Android frame processor (currently when using skia frame processor on android front camera, it renders a black screen)
  const androidFrameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const faces = detectFaces(frame);

      if (faces.length > 0) {
        const face = faces[0];
        const lowerLipContour = Object.values(
          face.contours.LOWER_LIP_TOP || {}
        );
        const upperLipContour = Object.values(
          face.contours.UPPER_LIP_BOTTOM || {}
        );
        const allContours = [...lowerLipContour, ...upperLipContour] as Point[];

        setMouthPointsJS(allContours);
      }
    },
    [setMouthPointsJS]
  );

  // iOS frame processor (unchanged)
  const iosFrameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render();
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

        const pointPaint = Skia.Paint();
        pointPaint.setColor(Skia.Color("green"));
        pointPaint.setStrokeWidth(5);
        pointPaint.setStyle(PaintStyle.Fill);

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
        frameProcessor={
          Platform.OS === "ios" ? iosFrameProcessor : androidFrameProcessor
        }
        fps={format?.maxFps}
        pixelFormat={pixelFormat}
        enableFpsGraph={true}
      />

      {Platform.OS === "android" && (
        <PointsSkia
          points={mouthPoints}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          cameraWidth={format?.videoWidth || 1920}
          cameraHeight={format?.videoHeight || 1080}
        />
      )}

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
