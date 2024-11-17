import React from "react";
import { Canvas, Circle as SkiaCircle, Path } from "@shopify/react-native-skia";

interface Point {
  x: number;
  y: number;
}

interface PointsSkiaProps {
  points: Point[] | undefined;
  screenWidth: number;
  screenHeight: number;
  cameraWidth: number;
  cameraHeight: number;
}

const PointsSkia = ({
  points,
  screenWidth,
  screenHeight,
  cameraWidth,
  cameraHeight,
}: PointsSkiaProps) => {
  if (!points || points.length === 0) return null;

  // Calculate aspect ratio-preserving scaling factor
  const scale = Math.min(
    screenWidth / cameraWidth,
    screenHeight / cameraHeight
  );

  // Calculate offsets to center the image if it doesn't fit perfectly in one dimension
  const offsetX = (screenWidth - cameraWidth * scale) / 2;
  const offsetY = (screenHeight - cameraHeight * scale) / 2;

  // Fine-tuning adjustments for positioning
  const fineTuneX = 2;
  const fineTuneY = 10;

  // Create the path data string
  const pathData = points.reduce((acc, point, index) => {
    const x = screenWidth - point.x;
    const y = point.y + fineTuneY;

    if (index === 0) {
      return `M ${x} ${y}`;
    }
    return `${acc} L ${x} ${y}`;
  }, "");

  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: screenWidth,
        height: screenHeight,
      }}
    >
      <Path
        path={`${pathData} Z`}
        strokeWidth={3}
        style="stroke"
        color="green"
      />
    </Canvas>
  );
};

export default PointsSkia;
