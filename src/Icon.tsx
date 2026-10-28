export type IconName =
  | "office"
  | "activity"
  | "sun"
  | "moon"
  | "rain"
  | "lamp"
  | "expand"
  | "reset"
  | "plus"
  | "minus"
  | "code"
  | "think"
  | "bug"
  | "check"
  | "coffee"
  | "idle"
  | "chevron"
  | "close"
  | "settings"
  | "link"
  | "play"
  | "pause"
  | "info"
  | "volume";
const paths: Record<IconName, string> = {
  office: "M4 21V5h16v16M8 21v-5h8v5M8 9h2m4 0h2M8 12h2m4 0h2M2 21h20",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  sun: "M12 3V1m0 22v-2M3 12H1m22 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4m-12.8 0-1.4 1.4M19.8 4.2l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20.5 13.5A8.5 8.5 0 0 1 10.5 3a8.5 8.5 0 1 0 10 10.5Z",
  rain: "M7 15H6a4 4 0 0 1-.5-8A6 6 0 0 1 17 6a4.5 4.5 0 0 1 1 9h-1M8 18l-1 3m6-3-1 3m6-3-1 3",
  lamp: "M6 21h12M12 21v-8M5 13h14L15 3H9L5 13Z",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18",
  think: "M9 18h6m-6 3h6M8 14a7 7 0 1 1 8 0l-1 2H9l-1-2Z",
  bug: "M8 9h8v7a4 4 0 0 1-8 0V9Zm1 0V7a3 3 0 0 1 6 0v2M4 10l4 2m8 0 4-2M4 18l4-2m8 0 4 2M12 10v9",
  check: "m5 12 4 4L19 6",
  coffee:
    "M4 8h13v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v2m5-2v2",
  idle: "M8 12h.01M16 12h.01M8 16q4 3 8 0M6 5h12l3 3v12H3V8l3-3ZM12 2v3",
  chevron: "m9 5 7 7-7 7",
  close: "m6 6 12 12M6 18 18 6",
  settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6",
  link: "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1",
  play: "m8 4 12 8-12 8V4Z",
  pause: "M8 5v14M16 5v14",
  info: "M12 10v7m0-11v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  volume: "M4 9h4l5-4v14l-5-4H4V9Zm12-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
};
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
