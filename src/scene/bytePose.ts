import type { ByteState } from "../activity/protocol";

/** Local rotations: the chair supplies the large turns, the neck only gestures. */
export function bytePose(state: ByteState, time: number, stateAge: number) {
  const working = state === "coding" || state === "debugging";
  const celebrating = state === "success" && stateAge < 3;
  const sleepy = state === "idle" && time % 32 > 26;
  return {
    chairYaw: working ? Math.PI : state === "thinking" ? Math.PI - 0.24 : 0.55,
    bodyY:
      1.39 +
      Math.sin(time * 1.8) * 0.01 +
      (celebrating ? Math.max(0, Math.sin(time * 7)) * 0.035 : 0),
    bodyPitch: state === "break" ? -0.035 : working ? 0.025 : 0,
    headPitch:
      state === "thinking"
        ? -0.035
        : sleepy
          ? 0.035
          : Math.sin(time * 0.6) * 0.018,
    headYaw: state === "thinking" ? 0.07 : Math.sin(time * 0.55) * 0.055,
    headRoll:
      state === "thinking"
        ? 0.045 + Math.sin(time * 1.2) * 0.015
        : state === "debugging"
          ? -0.035
          : Math.sin(time * 0.8) * 0.018,
    leftPitch: celebrating
      ? -2.65 + Math.sin(time * 8) * 0.08
      : state === "coding"
        ? -1.68 + Math.sin(time * 14) * 0.035
        : state === "break"
          ? -2.1
          : -0.18,
    rightPitch: celebrating
      ? -2.65 - Math.sin(time * 8) * 0.08
      : state === "debugging"
        ? -2.62 + Math.sin(time * 3) * 0.03
        : state === "coding"
          ? -1.68 - Math.sin(time * 14) * 0.035
          : -0.18,
    leftRoll: celebrating ? -0.4 : -0.08,
    rightRoll: state === "debugging" ? 0.5 : celebrating ? 0.4 : 0.08,
    eyes:
      sleepy || time % 4.3 > 4.12
        ? 0.08
        : state === "break"
          ? 0.55
          : celebrating
            ? 0.65
            : 1,
  };
}
