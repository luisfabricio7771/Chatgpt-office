import { useEffect, useMemo } from "react";
import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";
import type { ThreeEvent } from "@react-three/fiber";
export type Vec = [number, number, number];
export function Block({
  at = [0, 0, 0],
  size,
  color,
  emissive,
  rotation,
  onClick,
  roughness = 0.8,
}: {
  at?: Vec;
  size: Vec;
  color: string;
  emissive?: string;
  rotation?: Vec;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  roughness?: number;
}) {
  return (
    <mesh
      position={at}
      rotation={rotation}
      castShadow
      receiveShadow
      onClick={onClick}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        emissive={emissive || "#000000"}
        emissiveIntensity={emissive ? 0.7 : 0}
      />
    </mesh>
  );
}
export function makeTexture(
  draw: (ctx: CanvasRenderingContext2D) => void,
  width = 512,
  height = 256,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const t = new CanvasTexture(canvas);
  t.magFilter = NearestFilter;
  t.minFilter = NearestFilter;
  t.colorSpace = SRGBColorSpace;
  return t;
}
export function Sign({
  text,
  at,
  size = [1, 0.35],
  color = "#70eadc",
  bg = "#152833",
  rotation = [0, 0, 0],
}: {
  text: string;
  at: Vec;
  size?: [number, number];
  color?: string;
  bg?: string;
  rotation?: Vec;
}) {
  const texture = useMemo(
    () =>
      makeTexture(
        (ctx) => {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, 512, 128);
          ctx.fillStyle = color;
          ctx.font = "bold 64px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, 256, 68);
        },
        512,
        128,
      ),
    [text, color, bg],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
