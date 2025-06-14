export function detectarYEjecutarAccion(texto: string): string {
  const lower = texto.toLowerCase();

  if (lower.includes("abre youtube")) {
    window.open("https://youtube.com", "_blank");
    return "Abriendo YouTube para ti.";
  }
  if (lower.includes("muéstrame el clima")) {
    alert("El clima está soleado y hace 25 grados.");
    return "Te mostré el clima.";
  }
  if (lower.includes("dime la hora")) {
    const ahora = new Date();
    return `Son las ${ahora.getHours()} con ${ahora.getMinutes()}.`;
  }

  // Aquí puedes agregar más comandos...

  return texto; // Si no hay acción, devuelve el texto para hablarlo
}