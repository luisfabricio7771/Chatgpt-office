export type Preferences = {
  night: boolean;
  rain: boolean;
  lamp: boolean;
  pixel: boolean;
  auto: boolean;
};
const defaults: Preferences = {
  night: true,
  rain: true,
  lamp: true,
  pixel: true,
  auto: false,
};
export function loadPreferences(): Preferences {
  try {
    const raw = JSON.parse(localStorage.getItem("byte-hq.preferences") || "{}");
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        typeof raw?.[key] === "boolean" ? raw[key] : value,
      ]),
    ) as Preferences;
  } catch {
    return defaults;
  }
}
export function savePreferences(prefs: Preferences) {
  try {
    localStorage.setItem("byte-hq.preferences", JSON.stringify(prefs));
  } catch {
    /* The room also works with browser storage disabled. */
  }
}
