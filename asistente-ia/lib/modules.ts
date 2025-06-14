export const comandos: Record<string, () => string> = {
  "saluda": () => "¡Hola! ¿Cómo estás?",
  "hora": () => {
    const ahora = new Date();
    return `Son las ${ahora.getHours()} con ${ahora.getMinutes()}`;
  },
  "clima": () => "Hoy hace un clima soleado con 25 grados.",
  "recordatorio": () => "He anotado tu recordatorio (ficticio por ahora)",
};

export function procesarComando(entrada: string): string {
  const lower = entrada.toLowerCase();

  if (lower.includes("hola")) return comandos.saluda();
  if (lower.includes("hora")) return comandos.hora();
  if (lower.includes("clima")) return comandos.clima();
  if (lower.includes("recordatorio")) return comandos.recordatorio();

  return "Lo siento, no entendí ese comando.";
}

// ap2_f59b3aa5-25e3-4f9e-80bc-dacb44aaf8fc