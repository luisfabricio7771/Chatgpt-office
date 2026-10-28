import { useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { Block, Sign } from "./Primitives";
import type { ByteState } from "../activity/protocol";
export function Byte({
  state,
  onClick,
}: {
  state: ByteState;
  onClick: () => void;
}) {
  const head = useRef<Group>(null),
    left = useRef<Group>(null),
    right = useRef<Group>(null),
    body = useRef<Group>(null),
    eyes = useRef<Group>(null);
  const stateStarted = useRef<number | null>(null);
  useEffect(() => {
    stateStarted.current = null;
  }, [state]);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime,
      blend = 1 - Math.exp(-delta * 7);
    if (
      !head.current ||
      !left.current ||
      !right.current ||
      !body.current ||
      !eyes.current
    )
      return;
    if (stateStarted.current === null) stateStarted.current = t;
    const sleepy = state === "idle" && t % 32 > 26;
    const coding = state === "coding",
      thinking = state === "thinking",
      debugging = state === "debugging",
      success = state === "success" && t - stateStarted.current < 3,
      rest = state === "break";
    body.current.position.y = MathUtils.lerp(
      body.current.position.y,
      1.39 +
        Math.sin(t * 1.8) * 0.018 +
        (success ? Math.max(0, Math.sin(t * 7)) * 0.09 : 0),
      blend,
    );
    body.current.rotation.x = MathUtils.lerp(
      body.current.rotation.x,
      rest ? -0.15 : coding ? 0.07 : 0,
      blend,
    );
    head.current.rotation.z = MathUtils.lerp(
      head.current.rotation.z,
      thinking
        ? 0.18 + Math.sin(t * 1.6) * 0.07
        : debugging
          ? -0.13
          : Math.sin(t * 0.8) * 0.035,
      blend,
    );
    head.current.rotation.y = MathUtils.lerp(
      head.current.rotation.y,
      rest
        ? -0.22
        : state === "idle"
          ? Math.sin(t * 0.23) * 0.4
          : Math.sin(t * 0.55) * 0.14,
      blend,
    );
    left.current.rotation.x = MathUtils.lerp(
      left.current.rotation.x,
      success
        ? -2.6 + Math.sin(t * 8) * 0.2
        : coding
          ? 1.5 + Math.sin(t * 14) * 0.08
          : rest
            ? -1.3
            : -0.25,
      blend,
    );
    right.current.rotation.x = MathUtils.lerp(
      right.current.rotation.x,
      success
        ? -2.6 - Math.sin(t * 8) * 0.2
        : debugging
          ? -2.15
          : coding
            ? 1.5 - Math.sin(t * 14) * 0.08
            : -0.25,
      blend,
    );
    right.current.rotation.z = MathUtils.lerp(
      right.current.rotation.z,
      debugging ? -0.55 : success ? -0.35 : -0.1,
      blend,
    );
    left.current.rotation.z = MathUtils.lerp(
      left.current.rotation.z,
      success ? 0.35 : 0.1,
      blend,
    );
    eyes.current.scale.y = MathUtils.lerp(
      eyes.current.scale.y,
      sleepy ? 0.08 : t % 4.3 > 4.12 ? 0.08 : rest ? 0.45 : success ? 0.55 : 1,
      Math.min(1, blend * 2),
    );
  });
  const cyan =
    state === "debugging"
      ? "#ff9a7b"
      : state === "success"
        ? "#9ff5ab"
        : "#70f8e0";
  function click(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onClick();
  }
  return (
    <group
      position={[0.25, 0.2, -0.05]}
      onClick={click}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={body} position={[0, 1.39, 0]}>
        <Block size={[0.68, 0.62, 0.48]} color="#1b4b60" />
        <Block at={[0, 0.27, 0]} size={[0.77, 0.17, 0.55]} color="#285f71" />
        <Block
          at={[0, -0.12, 0.25]}
          size={[0.42, 0.15, 0.025]}
          color="#316979"
        />
        <Block
          at={[-0.12, 0.13, 0.25]}
          size={[0.025, 0.23, 0.025]}
          color="#8eb8b6"
        />
        <Block
          at={[0.12, 0.13, 0.25]}
          size={[0.025, 0.23, 0.025]}
          color="#8eb8b6"
        />
        <group ref={head} position={[0, 0.65, 0]}>
          <Block size={[0.99, 0.78, 0.72]} color="#9daeb1" />
          <Block
            at={[0, 0.08, -0.015]}
            size={[1.04, 0.55, 0.69]}
            color="#bbc6bf"
          />
          <Block
            at={[0, -0.01, 0.371]}
            size={[0.87, 0.57, 0.035]}
            color="#0b202b"
          />
          <Block
            at={[0, -0.04, 0.393]}
            size={[0.77, 0.43, 0.012]}
            color="#102c39"
          />
          <group ref={eyes} position={[0, 0, 0.41]}>
            <Block
              at={[-0.21, 0.035, 0]}
              size={[0.115, 0.18, 0.02]}
              color={cyan}
              emissive={cyan}
            />
            <Block
              at={[0.21, 0.035, 0]}
              size={[0.115, 0.18, 0.02]}
              color={cyan}
              emissive={cyan}
            />
          </group>
          <Block
            at={[0, -0.155, 0.41]}
            size={[0.13, 0.025, 0.02]}
            color={cyan}
            emissive={cyan}
          />
          <Block at={[-0.54, 0, 0]} size={[0.1, 0.27, 0.32]} color="#527986" />
          <Block at={[0.54, 0, 0]} size={[0.1, 0.27, 0.32]} color="#527986" />
          <Block
            at={[0.35, 0.5, 0]}
            size={[0.035, 0.22, 0.035]}
            color="#66898c"
          />
          <Block
            at={[0.35, 0.63, 0]}
            size={[0.09, 0.09, 0.09]}
            color={cyan}
            emissive={cyan}
          />
        </group>
        <group ref={left} position={[-0.45, 0.15, 0]}>
          <Block at={[0, -0.22, 0]} size={[0.23, 0.45, 0.26]} color="#23586a" />
          <Block
            at={[0, -0.48, 0.025]}
            size={[0.23, 0.18, 0.25]}
            color="#a1b7b8"
          />
          {state === "break" && (
            <group position={[0, -0.47, 0.2]}>
              <Block size={[0.23, 0.25, 0.22]} color="#e7b97e" />
            </group>
          )}
        </group>
        <group ref={right} position={[0.45, 0.15, 0]}>
          <Block at={[0, -0.22, 0]} size={[0.23, 0.45, 0.26]} color="#23586a" />
          <Block
            at={[0, -0.48, 0.025]}
            size={[0.23, 0.18, 0.25]}
            color="#a1b7b8"
          />
        </group>
      </group>
      <Block at={[-0.2, 0.9, 0.25]} size={[0.26, 0.22, 0.45]} color="#203442" />
      <Block at={[0.2, 0.9, 0.25]} size={[0.26, 0.22, 0.45]} color="#203442" />
      <Block
        at={[-0.2, 0.72, 0.48]}
        size={[0.28, 0.22, 0.37]}
        color="#a8b8b8"
      />
      <Block at={[0.2, 0.72, 0.48]} size={[0.28, 0.22, 0.37]} color="#a8b8b8" />
      {state === "thinking" && (
        <Sign text="· · ·" at={[0, 2.95, 0]} size={[0.7, 0.28]} bg="#1d3c48" />
      )}
      {state === "debugging" && (
        <Sign text="?!" at={[0, 2.95, 0]} size={[0.45, 0.28]} color="#ff9a7b" />
      )}
      {state === "success" && (
        <Sign
          text="+1 ✦"
          at={[0, 2.95, 0]}
          size={[0.65, 0.28]}
          color="#adf6b2"
        />
      )}
    </group>
  );
}
