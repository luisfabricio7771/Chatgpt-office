import { describe, expect, it } from "vitest";
import { Euler, Vector3 } from "three";
import { states } from "../activity/protocol";
import { bytePose } from "./bytePose";

describe("BYTE seated posture", () => {
  it("faces the desk with the whole chair during coding and debugging", () => {
    for (const state of ["coding", "debugging"] as const) {
      const pose = bytePose(state, 10, 2);
      const forward = new Vector3(0, 0, 1).applyEuler(
        new Euler(0, pose.chairYaw, 0),
      );
      expect(forward.z).toBeLessThan(-0.95);
    }
  });
  it("keeps neck gestures small in every state throughout the idle cycle", () => {
    for (const state of states)
      for (let t = 0; t < 40; t += 0.1) {
        const pose = bytePose(state, t, t);
        expect(Math.abs(pose.headYaw)).toBeLessThan(0.13);
        expect(Math.abs(pose.headPitch)).toBeLessThan(0.08);
        expect(Math.abs(pose.headRoll)).toBeLessThan(0.08);
      }
  });
  it("places typing hands at keyboard height and in front of the torso", () => {
    for (let t = 0; t < 1; t += 0.05) {
      const p = bytePose("coding", t, t);
      const hand = new Vector3(0, -0.61, 0.025)
        .applyEuler(new Euler(p.leftPitch, 0, p.leftRoll))
        .add(new Vector3(-0.49, 0.2, 0));
      const world = hand
        .applyEuler(new Euler(p.bodyPitch, 0, 0))
        .add(new Vector3(0, p.bodyY, 0))
        .applyEuler(new Euler(0, p.chairYaw, 0))
        .add(new Vector3(-0.35, 0.2, -0.05));
      expect(world.y).toBeGreaterThan(1.8);
      expect(world.y).toBeLessThan(1.95);
      expect(world.z).toBeGreaterThan(-0.9);
      expect(world.z).toBeLessThan(-0.45);
    }
  });
  it("scratches beside the head without crossing through the face", () => {
    for (let t = 0; t < 4; t += 0.1) {
      const p = bytePose("debugging", t, t);
      const hand = new Vector3(0, -0.61, 0.025)
        .applyEuler(new Euler(p.rightPitch, 0, p.rightRoll))
        .add(new Vector3(0.49, 0.2, 0));
      expect(hand.x - 0.115).toBeGreaterThan(0.6);
    }
  });
});
