import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Group, Mesh, MathUtils } from "three";
import { Block, makeTexture, Sign } from "./Primitives";
import type { ByteState } from "../activity/protocol";
const wood = ["#554333", "#604b37", "#69513b", "#594631", "#735940"];
function Screen({
  at,
  state,
  onClick,
}: {
  at: [number, number, number];
  state: ByteState;
  onClick: () => void;
}) {
  const tex = useMemo(() => makeTexture(() => {}, 256, 160), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const lastDraw = useRef(-1);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastDraw.current < 0.12) return;
    lastDraw.current = clock.elapsedTime;
    const ctx = (tex.image as HTMLCanvasElement).getContext("2d")!,
      t = clock.elapsedTime;
    const accent =
      state === "debugging"
        ? "#e57f76"
        : state === "success"
          ? "#91dca0"
          : "#68cfcc";
    ctx.fillStyle = "#102532";
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = "#1b3947";
    ctx.fillRect(0, 0, 256, 17);
    ctx.fillStyle = accent;
    ctx.font = "9px monospace";
    ctx.fillText("● ● ●   byte / workspace", 8, 12);
    if (state === "success") {
      ctx.font = "bold 24px monospace";
      ctx.fillText("BUILD OK", 57, 77);
      ctx.font = "10px monospace";
      ctx.fillText("all systems feeling cozy", 29, 102);
    } else
      for (let i = 0; i < 13; i++) {
        const y = 30 + i * 10,
          offset = state === "coding" ? Math.floor(t * 2) % 8 : 0;
        ctx.fillStyle = "#39505d";
        ctx.fillText(String(i + offset + 1).padStart(2, "0"), 6, y);
        ctx.fillStyle =
          i % 4 === 0 ? "#bc9bd0" : i % 3 === 0 ? "#dda86c" : accent;
        ctx.fillText(
          [
            "const idea = await dream();",
            "  byte.create(somethingNice);",
            "  // a little world of possibility",
            "  return { curiosity: true };",
            "  if (coffee.ready) { code(); }",
          ][(i + offset) % 5],
          26 + (i % 3) * 5,
          y,
        );
      }
    tex.needsUpdate = true;
  });
  return (
    <group
      position={at}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <Block at={[0, -0.48, 0]} size={[0.1, 0.35, 0.1]} color="#344b55" />
      <Block at={[0, -0.66, 0.04]} size={[0.54, 0.055, 0.32]} color="#344b55" />
      <Block size={[1.6, 1.04, 0.13]} color="#152834" />
      <mesh position={[0, 0.005, 0.071]}>
        <planeGeometry args={[1.44, 0.9]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Block
        at={[0.67, -0.47, 0.075]}
        size={[0.025, 0.025, 0.01]}
        color="#70eadc"
        emissive="#70eadc"
      />
    </group>
  );
}
function Plant({
  at,
  scale = 1,
}: {
  at: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={at} scale={scale}>
      <Block at={[0, 0.2, 0]} size={[0.45, 0.4, 0.44]} color="#b28060" />
      <Block at={[0, 0.42, 0]} size={[0.49, 0.09, 0.48]} color="#d2a580" />
      <Block at={[0, 0.43, 0]} size={[0.38, 0.04, 0.38]} color="#3a332a" />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, i * 1.3, 0]}>
          <Block
            at={[0.12, 0.63 + i * 0.07, 0]}
            size={[0.13, 0.53, 0.12]}
            color={i % 2 ? "#668f67" : "#3b786b"}
            rotation={[0, 0, -0.45]}
          />
          <Block
            at={[0.24, 0.85 + i * 0.06, 0]}
            size={[0.23, 0.16, 0.13]}
            color="#77a07b"
          />
        </group>
      ))}
    </group>
  );
}
function Coffee() {
  const steam = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (steam.current) {
      steam.current.position.y =
        0.18 + Math.sin(clock.elapsedTime * 1.8) * 0.045;
      steam.current.rotation.y = clock.elapsedTime * 0.25;
    }
  });
  return (
    <group position={[1.72, 1.89, -0.55]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.24, 8]} />
        <meshStandardMaterial color="#e2b987" />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.006, 8]} />
        <meshStandardMaterial color="#38271f" />
      </mesh>
      <mesh position={[0.14, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.075, 0.025, 4, 8]} />
        <meshStandardMaterial color="#e2b987" />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <Block
            key={i}
            at={[Math.sin(i * 2) * 0.04, i * 0.09, 0]}
            size={[0.025, 0.07, 0.025]}
            color="#b7b6ac"
          />
        ))}
      </group>
    </group>
  );
}
function Rain({ enabled }: { enabled: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    group.current?.children.forEach((c, i) => {
      c.position.y =
        2.37 +
        ((((i * 0.27 - clock.elapsedTime * (0.8 + (i % 3) * 0.15)) % 1.6) +
          1.6) %
          1.6);
    });
  });
  return (
    <group visible={enabled} ref={group}>
      {Array.from({ length: 26 }, (_, i) => (
        <Block
          key={i}
          at={[0.47 + ((i * 0.173) % 2.05), 3, -3.285]}
          size={[0.012, 0.09, 0.012]}
          color="#87b6c8"
          emissive="#456d84"
        />
      ))}
    </group>
  );
}
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <Sign
      text={now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
      at={[-0.28, 3.95, -3.275]}
      size={[0.65, 0.25]}
      color="#d9d7be"
      bg="#243943"
    />
  );
}
export function Office({
  state,
  night,
  rain,
  lamp,
  onLamp,
  onWindow,
  onMonitor,
}: {
  state: ByteState;
  night: boolean;
  rain: boolean;
  lamp: boolean;
  onLamp: () => void;
  onWindow: () => void;
  onMonitor: () => void;
}) {
  const lampHead = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (lampHead.current) {
      const m = lampHead.current
        .material as import("three").MeshStandardMaterial;
      m.emissive.lerp(
        new Color(lamp ? "#ffc477" : "#192b32"),
        MathUtils.damp(0, 1, 8, dt),
      );
    }
  });
  return (
    <group>
      <Block at={[0, -0.22, 0]} size={[7.6, 0.42, 7]} color="#142b37" />
      <Block at={[0, -0.44, 0]} size={[7.3, 0.08, 6.7]} color="#0e1c29" />
      {Array.from({ length: 14 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <Block
            key={`${row}-${col}`}
            at={[-3.03 + col * 1.515, 0.015, -3.22 + row * 0.49]}
            size={[1.49, 0.07, 0.465]}
            color={wood[(row * 7 + col * 3) % wood.length]}
          />
        )),
      )}
      {/* Two open walls preserve the miniature dollhouse silhouette. */}
      <Block
        at={[0, 2.27, -3.47]}
        size={[7.5, 4.55, 0.18]}
        color={night ? "#34454d" : "#52636a"}
      />
      <Block
        at={[-3.73, 2.27, 0]}
        size={[0.18, 4.55, 7]}
        color={night ? "#2a3c45" : "#475b61"}
      />
      <Block at={[0, 4.58, -3.46]} size={[7.7, 0.14, 0.27]} color="#738080" />
      <Block at={[-3.73, 4.58, 0]} size={[0.27, 0.14, 7.15]} color="#738080" />
      <Block at={[0, 0.19, -3.32]} size={[7.3, 0.28, 0.12]} color="#1c3039" />
      <Block at={[-3.58, 0.19, 0]} size={[0.12, 0.28, 6.8]} color="#1c3039" />
      {Array.from({ length: 12 }, (_, i) => (
        <Block
          key={i}
          at={[-3.61, 2.3, -3.1 + i * 0.55]}
          size={[0.03, 4.25, 0.022]}
          color="#354a51"
        />
      ))}
      <Block at={[0, 0.082, 0.65]} size={[4.3, 0.025, 3.35]} color="#243f48" />
      <Block at={[0, 0.098, 0.65]} size={[4.08, 0.01, 3.13]} color="#476268" />
      <Block at={[0, 0.11, 0.65]} size={[3.93, 0.01, 2.98]} color="#2c444c" />
      {[-1, 0, 1].map((i) => (
        <Block
          key={i}
          at={[i * 1.1, 0.12, 1.6]}
          size={[0.45, 0.005, 0.025]}
          color="#597474"
        />
      ))}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onWindow();
        }}
      >
        <Block
          at={[1.45, 3.28, -3.32]}
          size={[2.55, 2.07, 0.18]}
          color="#152b36"
        />
        <Block
          at={[1.45, 3.28, -3.215]}
          size={[2.35, 1.87, 0.04]}
          color={night ? "#14233f" : "#80a9ae"}
          emissive={night ? "#142644" : "#86b8be"}
        />
        {/* Each building and illuminated window is actual voxel geometry. */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <group key={i}>
            <Block
              at={[0.46 + i * 0.33, 2.72 + (i % 3) * 0.12, -3.175]}
              size={[0.29, 0.7 + (i % 3) * 0.24, 0.025]}
              color={["#233c55", "#294862", "#1c334c"][i % 3]}
            />
            {Array.from({ length: 6 }, (_, j) => (
              <Block
                key={j}
                at={[
                  0.39 + i * 0.33 + (j % 2) * 0.12,
                  2.47 + Math.floor(j / 2) * 0.19,
                  -3.15,
                ]}
                size={[0.045, 0.065, 0.012]}
                color={(i + j) % 3 ? "#d7b67b" : "#618999"}
                emissive={(i + j) % 3 ? "#af864f" : undefined}
              />
            ))}
          </group>
        ))}
        <Block
          at={[2.14, 3.82, -3.16]}
          size={[0.22, 0.22, 0.02]}
          color={night ? "#dee6c7" : "#ffe1a1"}
          emissive={night ? "#b8d3cf" : "#ffe1a1"}
        />
        <Block
          at={[1.45, 3.28, -3.12]}
          size={[0.065, 1.9, 0.12]}
          color="#7f8f89"
        />
        <Block
          at={[1.45, 3.28, -3.11]}
          size={[2.45, 0.065, 0.12]}
          color="#7f8f89"
        />
        <Block
          at={[1.45, 2.25, -3.12]}
          size={[2.75, 0.12, 0.4]}
          color="#a29275"
        />
      </group>
      <Rain enabled={rain} />
      <Block
        at={[-1.83, 3.65, -3.29]}
        size={[2.15, 0.66, 0.1]}
        color="#1b303a"
      />
      <Sign
        text="BYTE HQ"
        at={[-1.83, 3.66, -3.22]}
        size={[1.92, 0.44]}
        color="#6fe5d0"
        bg="#1b303a"
      />
      <pointLight
        position={[-1.8, 3.5, -2.9]}
        color="#54f5cf"
        intensity={4}
        distance={3}
      />
      <Sign
        text="MAKE GOOD THINGS."
        at={[-1.83, 3.12, -3.29]}
        size={[1.48, 0.18]}
        color="#9cb5ad"
        bg="#34454d"
      />
      <Clock />
      {/* Walnut desk, drawers, keyboard, desk pad and a second workstation. */}
      <Block
        at={[-0.25, 1.69, -1.3]}
        size={[5.4, 0.18, 1.65]}
        color="#a07a51"
      />
      <Block
        at={[-0.25, 1.59, -0.47]}
        size={[5.4, 0.07, 0.04]}
        color="#c69e6c"
      />
      <Block
        at={[-2.5, 0.84, -1.3]}
        size={[0.65, 1.55, 1.35]}
        color="#574c40"
      />
      {[0.45, 0.86, 1.27].map((y) => (
        <group key={y}>
          <Block
            at={[-2.5, y, -0.605]}
            size={[0.56, 0.34, 0.04]}
            color="#776047"
          />
          <Block
            at={[-2.5, y + 0.06, -0.57]}
            size={[0.17, 0.035, 0.025]}
            color="#c0ac83"
          />
        </group>
      ))}
      {[
        [-1.8, -1.85],
        [2.15, -1.85],
        [2.15, -0.65],
      ].map(([x, z], i) => (
        <Block
          key={i}
          at={[x, 0.83, z]}
          size={[0.1, 1.6, 0.1]}
          color="#22343d"
        />
      ))}
      <Block at={[0.0, 1.79, -0.98]} size={[2.8, 0.025, 1]} color="#243b43" />
      <Screen at={[-1.05, 2.45, -1.87]} state={state} onClick={onMonitor} />
      <Screen at={[0.77, 2.45, -1.87]} state={state} onClick={onMonitor} />
      <Block
        at={[-0.35, 1.84, -0.67]}
        size={[1.17, 0.07, 0.39]}
        color="#c1bda1"
      />
      {Array.from({ length: 36 }, (_, i) => (
        <Block
          key={i}
          at={[
            -0.84 + (i % 12) * 0.09,
            1.89,
            -0.79 + Math.floor(i / 12) * 0.105,
          ]}
          size={[0.065, 0.025, 0.065]}
          color={i % 11 === 0 ? "#b98b68" : i % 7 === 0 ? "#719b99" : "#d9d2b6"}
        />
      ))}
      <Block
        at={[0.52, 1.84, -0.67]}
        size={[0.19, 0.09, 0.29]}
        color="#a9bab7"
      />
      <Coffee />
      <group
        onClick={(e) => {
          e.stopPropagation();
          onLamp();
        }}
      >
        <Block
          at={[2.04, 1.84, -1.62]}
          size={[0.45, 0.09, 0.37]}
          color="#d4b471"
        />
        <Block
          at={[2.04, 2.18, -1.62]}
          size={[0.055, 0.7, 0.055]}
          color="#aa9f7c"
          rotation={[0, 0, -0.18]}
        />
        <Block
          at={[1.93, 2.6, -1.62]}
          size={[0.055, 0.42, 0.055]}
          color="#aa9f7c"
          rotation={[0, 0, 0.7]}
        />
        <mesh
          ref={lampHead}
          position={[1.77, 2.78, -1.62]}
          rotation={[0, 0, 0.3]}
          castShadow
        >
          <coneGeometry args={[0.29, 0.29, 4]} />
          <meshStandardMaterial
            color="#dfbf7d"
            emissive={lamp ? "#ffc477" : "#192b32"}
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight
          position={[1.7, 2.59, -1.5]}
          color="#ffbf75"
          intensity={lamp ? 9 : 0}
          distance={4}
          decay={2}
        />
      </group>
      {/* Comfortable chair, deliberately lower than BYTE's silhouette. */}
      <Block at={[0.25, 1.19, 0]} size={[0.95, 0.17, 0.86]} color="#273843" />
      <Block at={[0.25, 1.51, 0.38]} size={[0.9, 0.65, 0.16]} color="#243a48" />
      <Block at={[0.25, 0.6, 0]} size={[0.11, 1, 0.11]} color="#79918e" />
      <Block at={[0.25, 0.18, 0]} size={[1.1, 0.08, 0.14]} color="#263c47" />
      <Block at={[0.25, 0.18, 0]} size={[0.14, 0.08, 1.05]} color="#263c47" />
      {[-0.3, 0.8].map((x) => (
        <Block
          key={x}
          at={[x, 0.13, 0]}
          size={[0.14, 0.14, 0.18]}
          color="#152732"
        />
      ))}
      {/* Left wall shelving with books, tiny console and RPG relic. */}
      <group position={[-3.22, 0, -1.75]}>
        {[1.95, 2.88, 3.76].map((y) => (
          <Block
            key={y}
            at={[0, y, 0]}
            size={[0.75, 0.12, 2.05]}
            color="#997955"
          />
        ))}
        <Block
          at={[-0.28, 2.85, 0]}
          size={[0.12, 1.85, 2.02]}
          color="#5c5343"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <Block
            key={i}
            at={[0.05, 2.28, -0.87 + i * 0.15]}
            size={[0.47, 0.55 + (i % 3) * 0.04, 0.11]}
            color={
              ["#6f9994", "#d0ae77", "#a06e69", "#717d99", "#c4b69a"][i % 5]
            }
            rotation={[i === 8 ? 0.12 : 0, 0, 0]}
          />
        ))}
        <Block
          at={[0.05, 3.15, -0.55]}
          size={[0.5, 0.43, 0.68]}
          color="#b5b9a8"
        />
        <Block
          at={[0.31, 3.17, -0.55]}
          size={[0.01, 0.25, 0.45]}
          color="#253c43"
        />
        <Sign
          text=":)"
          at={[0.322, 3.17, -0.55]}
          size={[0.34, 0.2]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Block
          at={[0.05, 3.25, 0.53]}
          size={[0.22, 0.62, 0.15]}
          color="#d3c69f"
          rotation={[0.2, 0, 0.3]}
        />
        <Block
          at={[0.05, 3.06, 0.53]}
          size={[0.42, 0.08, 0.21]}
          color="#a99560"
        />
        <Plant at={[0, 3.82, 0.55]} scale={0.45} />
      </group>
      <Plant at={[2.9, 0.08, -2.61]} scale={1.1} />
      {/* Server and its heartbeat lights. */}
      <Block
        at={[2.85, 0.64, -0.3]}
        size={[0.63, 1.16, 0.89]}
        color="#1b303d"
      />
      {[0.38, 0.64, 0.9].map((y, i) => (
        <group key={y}>
          <Block
            at={[2.85, y, 0.153]}
            size={[0.53, 0.2, 0.02]}
            color="#2f4652"
          />
          <Block
            at={[3.04, y, 0.17]}
            size={[0.035, 0.035, 0.025]}
            color={state === "debugging" ? "#f28e79" : "#7ce0b7"}
            emissive={state === "debugging" ? "#f28e79" : "#7ce0b7"}
          />
          {[0, 1, 2].map((k) => (
            <Block
              key={k}
              at={[2.65 + k * 0.07, y, 0.17]}
              size={[0.025, 0.07, 0.02]}
              color="#102634"
            />
          ))}
          <Block
            at={[2.73, 0.9 + i * 0.07, 0.17]}
            size={[0.01, 0.01, 0.01]}
            color="#385360"
          />
        </group>
      ))}
      {/* Front-left side table, sketchbook, mini cactus and floor cables. */}
      <Block
        at={[-2.87, 0.62, 1.8]}
        size={[1.04, 0.11, 0.85]}
        color="#98724e"
      />
      {[-3.25, -2.5].map((x) => (
        <Block
          key={x}
          at={[x, 0.33, 1.8]}
          size={[0.08, 0.58, 0.62]}
          color="#4b4b40"
        />
      ))}
      <Block
        at={[-2.94, 0.73, 1.75]}
        size={[0.54, 0.08, 0.46]}
        color="#ba8b6a"
      />
      <Block
        at={[-2.94, 0.78, 1.75]}
        size={[0.47, 0.025, 0.42]}
        color="#d9d2b7"
      />
      <Plant at={[-2.58, 0.69, 1.67]} scale={0.35} />
      <Block
        at={[2.42, 0.09, -0.3]}
        size={[0.03, 0.018, 1.85]}
        color="#172b33"
      />
      <Block
        at={[1.8, 0.09, 0.62]}
        size={[1.28, 0.018, 0.03]}
        color="#172b33"
      />
      <Sign
        text="01 / THE LITTLE OFFICE"
        at={[0, -0.25, 3.512]}
        size={[2.4, 0.22]}
        color="#8daca7"
        bg="#142b37"
      />
    </group>
  );
}
