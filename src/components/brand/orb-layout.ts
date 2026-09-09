export const INSTANCE_COUNT = 2;
export const ORB_VIEWBOX = 100;
export const ORB_CENTER = 50;

export type OrbVisualState = "idle" | "attend" | "working" | "listen" | "speak";

export const ORB_EMOTIONS = [
  "calm",
  "alert",
  "happy",
  "thinking",
  "listening",
  "speaking",
  "sleepy",
  "surprised",
] as const;

export const ORB_CYCLE_EMOTIONS = [
  "calm",
  "alert",
  "happy",
  "thinking",
  "listening",
] as const;

export type OrbEmotion = (typeof ORB_EMOTIONS)[number];

export interface OrbEye {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  holeRx: number;
  holeRy: number;
  rotate: number;
  opacity: number;
}

export interface OrbPose {
  os: readonly [OrbEye, OrbEye];
}

export interface OrbInstance {
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  opacity: number;
}

function ring(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotate = 0,
): OrbEye {
  const holeRx = rx * 0.46;
  const holeRy = ry * 0.46;
  return { cx, cy, rx, ry, holeRx, holeRy, rotate, opacity: 1 };
}

const POSES: Record<OrbEmotion, OrbPose> = {
  calm: {
    os: [ring(30, 50, 22, 22), ring(70, 50, 22, 22)],
  },
  alert: {
    os: [ring(26, 48, 24, 24), ring(74, 48, 24, 24)],
  },
  happy: {
    os: [ring(29, 52, 22, 17, -10), ring(71, 52, 22, 17, 10)],
  },
  thinking: {
    os: [ring(34, 44, 20, 20), ring(74, 42, 20, 20)],
  },
  listening: {
    os: [ring(28, 50, 23, 23, -6), ring(72, 50, 23, 23, 6)],
  },
  speaking: {
    os: [ring(30, 50, 22, 18), ring(70, 50, 22, 18)],
  },
  sleepy: {
    os: [ring(30, 52, 22, 5.5), ring(70, 52, 22, 5.5)],
  },
  surprised: {
    os: [ring(24, 50, 26, 26), ring(76, 50, 26, 26)],
  },
};

export function layoutOrbPose(emotion: OrbEmotion): OrbPose {
  const pose = POSES[emotion];
  return {
    os: [{ ...pose.os[0] }, { ...pose.os[1] }],
  };
}

export function layoutOrbEyes(emotion: OrbEmotion): OrbEye[] {
  return layoutOrbPose(emotion).os.map((o) => ({ ...o }));
}

export function emotionForState(state: OrbVisualState): OrbEmotion {
  switch (state) {
    case "attend":
      return "alert";
    case "working":
      return "thinking";
    case "listen":
      return "listening";
    case "speak":
      return "speaking";
    default:
      return "calm";
  }
}

export function layoutOrbInstances(state: OrbVisualState): OrbInstance[] {
  return layoutOrbEyes(emotionForState(state)).map((eye) => ({
    x: eye.cx,
    y: eye.cy,
    scale: eye.rx / 10,
    scaleX: eye.rx / 10,
    scaleY: eye.ry / 10,
    rotate: eye.rotate,
    opacity: eye.opacity,
  }));
}

export function nextOrbEmotion(current: OrbEmotion): OrbEmotion {
  const pool = ORB_CYCLE_EMOTIONS.filter((emotion) => emotion !== current);
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? "calm";
}
