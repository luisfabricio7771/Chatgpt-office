import {
  Component,
  Suspense,
  useEffect,
  useRef,
  type ReactNode,
  type ElementRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei";
import { MathUtils } from "three";
import { Office } from "./Office";
import { Byte } from "./Byte";
import type { ByteState } from "../activity/protocol";
export type WorldProps = {
  state: ByteState;
  night: boolean;
  rain: boolean;
  lamp: boolean;
  pixel: boolean;
  cinematic: boolean;
  reset: number;
  zoom: number;
  onByte: () => void;
  onMonitor: () => void;
  onLamp: () => void;
  onWindow: () => void;
};
function CameraRig({
  reset,
  zoom,
  cinematic,
}: Pick<WorldProps, "reset" | "zoom" | "cinematic">) {
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  const { camera, size } = useThree();
  const zoomTarget = useRef<number | null>(null);
  useEffect(() => {
    camera.position.set(10, 11.5, 12);
    camera.lookAt(0, 1.7, 0);
    controls.current?.target.set(0, 1.7, 0);
    controls.current?.update();
  }, [camera, reset]);
  useEffect(() => {
    if ("isOrthographicCamera" in camera) {
      camera.zoom =
        Math.min(size.width / 12.5, size.height / 9.7) * Math.pow(1.18, zoom);
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, reset]);
  useEffect(() => {
    zoomTarget.current =
      Math.min(size.width / 12.5, size.height / 9.7) * Math.pow(1.18, zoom);
  }, [zoom, size.width, size.height]);
  useFrame(({ clock }, delta) => {
    if (zoomTarget.current !== null && "isOrthographicCamera" in camera) {
      camera.zoom = MathUtils.damp(camera.zoom, zoomTarget.current, 9, delta);
      camera.updateProjectionMatrix();
      if (Math.abs(camera.zoom - zoomTarget.current) < 0.05)
        zoomTarget.current = null;
    }
    if (cinematic && controls.current) {
      const a = 0.7 + Math.sin(clock.elapsedTime * 0.12) * 0.18;
      controls.current.setAzimuthalAngle(a);
      controls.current.update();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      target={[0, 1.7, 0]}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      minZoom={25}
      maxZoom={160}
      minPolarAngle={0.68}
      maxPolarAngle={1.3}
      minAzimuthAngle={0.12}
      maxAzimuthAngle={1.35}
      enabled={!cinematic}
    />
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-error">
        <span>◇</span>
        <h2>Necesitamos un poquito de 3D.</h2>
        <p>
          Activa la aceleración por hardware y vuelve a abrir BYTE HQ en un
          navegador compatible con WebGL.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function World(props: WorldProps) {
  return (
    <SceneBoundary>
      <Canvas
        shadows
        dpr={props.pixel ? 0.8 : 1.25}
        gl={{
          antialias: !props.pixel,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ imageRendering: props.pixel ? "pixelated" : "auto" }}
        fallback={
          <div className="scene-error">
            Tu navegador necesita WebGL para visitar BYTE HQ.
          </div>
        }
      >
        <OrthographicCamera
          makeDefault
          position={[10, 11.5, 12]}
          zoom={60}
          near={0.1}
          far={100}
        />
        <CameraRig
          reset={props.reset}
          zoom={props.zoom}
          cinematic={props.cinematic}
        />
        <ambientLight
          intensity={props.night ? 0.65 : 1.3}
          color={props.night ? "#9daebe" : "#e6eee2"}
        />
        <hemisphereLight
          args={["#b9d4df", "#4b3d31", props.night ? 1.1 : 1.7]}
        />
        <directionalLight
          castShadow
          position={[3, 9, 6]}
          intensity={props.night ? 2.5 : 3.5}
          color="#ffe3b7"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-normalBias={0.035}
        />
        <pointLight
          position={[-1, 4, 3]}
          intensity={8}
          color="#74bacb"
          distance={12}
        />
        <Suspense fallback={null}>
          <Office {...props} />
          <Byte state={props.state} onClick={props.onByte} />
          <ContactShadows
            position={[0, -0.57, 0]}
            opacity={0.3}
            scale={18}
            blur={2.5}
            far={8}
            resolution={256}
            frames={1}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
