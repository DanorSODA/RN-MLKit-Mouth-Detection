/**
 * @file Face Frame Processing Hook for Vision Camera
 * @author Danor S.O.D.A
 * @lastModified 26-11-2024
 *
 * @description
 * Custom hook that handles real-time face detection and mouth contour drawing.
 * Key features:
 * - Real-time face detection using Vision Camera
 * - Mouth contour detection and visualization
 * - Platform-specific camera rotation handling
 * - Green contour drawing using Skia
 */
import { useMemo, useRef } from "react";
import { Platform } from "react-native";
import { useSkiaFrameProcessor } from "react-native-vision-camera";
import {
  FaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Skia, PaintStyle } from "@shopify/react-native-skia";

/**
 * Hook for processing camera frames to detect and visualize mouth contours
 *
 * @returns {Object} Object containing the frameProcessor function
 * @property {Function} frameProcessor - Worklet function that processes each camera frame
 */
export const useFaceFrameProcessing = () => {
  /**
   * Ref for face detection options
   */
  const faceDetectionOptions = useMemo<FaceDetectionOptions>(
    () => ({
      performanceMode: "fast",
      contourMode: "all",
    }),
    []
  );

  /**
   * Hook for face detection
   */
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  /**
   * Frame processor for Skia rendering
   */
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

  return useMemo(() => ({ frameProcessor }), [frameProcessor]);
};
