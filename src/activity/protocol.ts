export const states = [
  "idle",
  "thinking",
  "coding",
  "debugging",
  "success",
  "break",
] as const;
export type ByteState = (typeof states)[number];
export type ActivityEvent = { state: ByteState; message?: string; id?: string };
export function parseEvent(data: unknown): ActivityEvent | null {
  if (!data || typeof data !== "object") return null;
  const e = data as Record<string, unknown>;
  if (!states.includes(e.state as ByteState)) return null;
  if (
    e.message !== undefined &&
    (typeof e.message !== "string" || e.message.length > 280)
  )
    return null;
  if (e.id !== undefined && (typeof e.id !== "string" || e.id.length > 100))
    return null;
  return {
    state: e.state as ByteState,
    message: e.message as string | undefined,
    id: e.id as string | undefined,
  };
}
export const labels: Record<ByteState, string> = {
  idle: "En calma",
  thinking: "Pensando",
  coding: "Programando",
  debugging: "Depurando",
  success: "¡Lo logramos!",
  break: "Pausa de café",
};
export const messages: Record<ByteState, string> = {
  idle: "Todo listo para la próxima idea.",
  thinking: "Las buenas ideas necesitan un poquito de espacio.",
  coding: "Un café, una idea y unas cuantas líneas de código.",
  debugging: "Hasta los pequeños bugs tienen solución.",
  success: "¡Una pequeña victoria merece celebrarse!",
  break: "Recargando creatividad. Y café.",
};
