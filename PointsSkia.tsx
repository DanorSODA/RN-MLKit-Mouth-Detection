import React from "react";
import { Canvas, Circle as SkiaCircle } from "@shopify/react-native-skia";

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
  if (!points) return null;

  // Calculate aspect ratio-preserving scaling factor
  const scale = Math.min(
    screenWidth / cameraWidth,
    screenHeight / cameraHeight
  );

  // Calculate offsets to center the image if it doesn't fit perfectly in one dimension
  const offsetX = (screenWidth - cameraWidth * scale) / 2;
  const offsetY = (screenHeight - cameraHeight * scale) / 2;

  // Fine-tuning adjustments for positioning
  const fineTuneX = 2; // Adjust as needed for horizontal alignment
  const fineTuneY = 10; // Adjust as needed for vertical alignment

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
      {points.map((point, index) => (
        <SkiaCircle
          key={`point-${point.x}-${point.y}-${index}`}
          cx={screenWidth - point.x} // Mirror horizontally
          cy={point.y + fineTuneY} // Apply vertical scaling and offset
          r={3} // Radius for visibility
          color={"green"}
        />
      ))}
    </Canvas>
  );
};

export default PointsSkia;
