import { useEffect, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { Block, Sign } from "./Primitives";
import { bytePose } from "./bytePose";
import type { ByteState } from "../activity/protocol";
export function Byte({
  state,
  onClick,
}: {
  state: ByteState;
  onClick: () => void;
}) {
  const rig = useRef<Group>(null);
  const head = useRef<Group>(null);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const body = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const cup = useRef<Group>(null);
  const initialRotation = useRef<[number, number, number]>([
    0,
    bytePose(state, 0, 0).chairYaw,
    0,
  ]);
  const stateStarted = useRef<number | null>(null);
  useEffect(() => {
    stateStarted.current = null;
  }, [state]);
  useFrame(({ clock }, delta) => {
    if (
      !rig.current ||
      !head.current ||
      !left.current ||
      !right.current ||
      !body.current ||
      !eyes.current
    )
      return;
    const time = clock.elapsedTime;
    if (stateStarted.current === null) stateStarted.current = time;
    const pose = bytePose(state, time, time - stateStarted.current);
    const dt = Math.min(delta, 0.1);
    const blend = 1 - Math.exp(-dt * 8);
    const turn = Math.atan2(
      Math.sin(pose.chairYaw - rig.current.rotation.y),
      Math.cos(pose.chairYaw - rig.current.rotation.y),
    );
    rig.current.rotation.y += turn * (1 - Math.exp(-dt * 4));
    body.current.position.y = MathUtils.lerp(
      body.current.position.y,
      pose.bodyY,
      blend,
    );
    body.current.rotation.x = MathUtils.lerp(
      body.current.rotation.x,
      pose.bodyPitch,
      blend,
    );
    head.current.rotation.x = MathUtils.lerp(
      head.current.rotation.x,
      pose.headPitch,
      blend,
    );
    head.current.rotation.y = MathUtils.lerp(
      head.current.rotation.y,
      pose.headYaw,
      blend,
    );
    head.current.rotation.z = MathUtils.lerp(
      head.current.rotation.z,
      pose.headRoll,
      blend,
    );
    left.current.rotation.x = MathUtils.lerp(
      left.current.rotation.x,
      pose.leftPitch,
      blend,
    );
    right.current.rotation.x = MathUtils.lerp(
      right.current.rotation.x,
      pose.rightPitch,
      blend,
    );
    left.current.rotation.z = MathUtils.lerp(
      left.current.rotation.z,
      pose.leftRoll,
      blend,
    );
    right.current.rotation.z = MathUtils.lerp(
      right.current.rotation.z,
      pose.rightRoll,
      blend,
    );
    eyes.current.scale.y = MathUtils.lerp(
      eyes.current.scale.y,
      pose.eyes,
      Math.min(1, blend * 2),
    );
    // Keep the mug upright as the arm rises toward BYTE's face.
    if (cup.current)
      cup.current.quaternion.copy(left.current.quaternion).invert();
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
      ref={rig}
      name="byte-rig"
      position={[-0.35, 0.2, -0.05]}
      rotation={initialRotation.current}
      onClick={click}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <Seat />
      <Block at={[0, 1.12, 0.05]} size={[0.55, 0.32, 0.43]} color="#203442" />
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
        <Block at={[0, 0.37, 0]} size={[0.24, 0.16, 0.23]} color="#718e91" />
        <Block
          at={[0, 0.16, -0.25]}
          size={[0.49, 0.28, 0.07]}
          color="#2c5b6c"
        />
        <group ref={head} name="byte-head" position={[0, 0.37, 0]}>
          <group position={[0, 0.42, 0]}>
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
            <Block
              at={[0, 0, -0.371]}
              size={[0.57, 0.28, 0.025]}
              color="#7f979a"
            />
            {[-0.18, 0, 0.18].map((x) => (
              <Block
                key={x}
                at={[x, 0, -0.39]}
                size={[0.055, 0.18, 0.015]}
                color="#49626a"
              />
            ))}
            <Block
              at={[0.32, -0.21, -0.38]}
              size={[0.05, 0.04, 0.02]}
              color={cyan}
              emissive={cyan}
            />
            <Block
              at={[-0.54, 0, 0]}
              size={[0.1, 0.27, 0.32]}
              color="#527986"
            />
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
        </group>
        <group ref={left} position={[-0.49, 0.2, 0]}>
          <Block at={[0, -0.17, 0]} size={[0.23, 0.34, 0.26]} color="#23586a" />
          <Block at={[0, -0.43, 0]} size={[0.2, 0.22, 0.23]} color="#2c6172" />
          <Block
            at={[0, -0.61, 0.025]}
            size={[0.23, 0.14, 0.25]}
            color="#a1b7b8"
          />
          <group
            ref={cup}
            position={[0, -0.62, 0.13]}
            visible={state === "break"}
          >
            <Block size={[0.23, 0.25, 0.22]} color="#e7b97e" />
            <Block
              at={[0, 0.13, 0]}
              size={[0.18, 0.015, 0.17]}
              color="#38271f"
            />
          </group>
        </group>
        <group ref={right} position={[0.49, 0.2, 0]}>
          <Block at={[0, -0.17, 0]} size={[0.23, 0.34, 0.26]} color="#23586a" />
          <Block at={[0, -0.43, 0]} size={[0.2, 0.22, 0.23]} color="#2c6172" />
          <Block
            at={[0, -0.61, 0.025]}
            size={[0.23, 0.14, 0.25]}
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
      <Billboard position={[0, 2.95, 0]}>
        {state === "thinking" && (
          <Sign text="· · ·" at={[0, 0, 0]} size={[0.7, 0.28]} bg="#1d3c48" />
        )}
        {state === "debugging" && (
          <Sign text="?!" at={[0, 0, 0]} size={[0.45, 0.28]} color="#ff9a7b" />
        )}
        {state === "success" && (
          <Sign
            text="+1 ✦"
            at={[0, 0, 0]}
            size={[0.65, 0.28]}
            color="#adf6b2"
          />
        )}
      </Billboard>
    </group>
  );
}

function Seat() {
  return (
    <group name="byte-chair">
      <Block at={[0, 0.99, 0]} size={[0.95, 0.17, 0.86]} color="#273843" />
      <Block at={[0, 1.31, -0.38]} size={[0.9, 0.65, 0.16]} color="#243a48" />
      <Block at={[0, 0.4, 0]} size={[0.11, 1, 0.11]} color="#79918e" />
      <Block at={[0, -0.02, 0]} size={[1.1, 0.08, 0.14]} color="#263c47" />
      <Block at={[0, -0.02, 0]} size={[0.14, 0.08, 1.05]} color="#263c47" />
      {[-0.5, 0.5].map((x) => (
        <Block
          key={x}
          at={[x, -0.07, 0]}
          size={[0.14, 0.14, 0.18]}
          color="#152732"
        />
      ))}
      {[-0.48, 0.48].map((z) => (
        <Block
          key={z}
          at={[0, -0.07, z]}
          size={[0.18, 0.14, 0.14]}
          color="#152732"
        />
      ))}
    </group>
  );
}
