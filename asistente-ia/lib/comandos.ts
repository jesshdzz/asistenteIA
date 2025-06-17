export async function detectarYEjecutarAccion(texto: string): Promise<string> {
  const lower = texto.toLowerCase();

  if (lower.includes("abrir_youtube")) {
    window.open("https://youtube.com", "_blank");
    return "Abriendo YouTube para ti.";
  }

  if (lower.includes("mostrar_clima")) {
    try {
      const clima = await fetch('http://api.weatherapi.com/v1/current.json?key=72c98c7a147a4904961110427251706&q=Huajuapan&aqi=no')
        .then(response => response.json())
        .then(data => {
          return `El clima en ${data.location.name} es de ${data.current.temp_c} grados Celsius pero con una sensacion de ${data.current.feelslike_c}, con una humedad del ${data.current.humidity} porciento.`;
        });
      return clima;
    } catch (error) {
      console.error("Error al obtener el clima:", error);
      return "No pude obtener el clima en este momento.";
    }
  }

  if (lower.includes("decir_hora")) {
    const ahora = new Date();
    return `Son las ${ahora.getHours()} con ${ahora.getMinutes()}.`;
  }

   if (lower.includes("decir_fecha")) {
    const ahora = new Date();
    return `Hoy es ${ahora.getDate()} de ${ahora.getMonth() + 1} del ${ahora.getFullYear()}.`;
  }

  if (lower.includes("crear_nota")) {
    

  }

  if (lower.includes("crear_pendiente")) {

  }

  return texto; // Si no hay acción, devuelve el texto para hablarlo
}
