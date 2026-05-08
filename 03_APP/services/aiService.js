export function buildSimulatedAnswer({ agentKey, agent, modeName, area, question, scoped = false }) {
  const sourceRule =
    "Primero usaria archivos subidos, luego fuentes oficiales y modelos de examen; ahora solo simulo.";

  if (agentKey === "carlota") {
    return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: detectaria la trampa conceptual y propondria test avanzado. ${sourceRule} Pregunta: "${question}".`;
  }

  if (agentKey === "gonzalo") {
    return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: iria paso a paso, con una pista y un ejercicio parecido. ${sourceRule} Pregunta: "${question}".`;
  }

  return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: ${modeName}, breve, claro, exigente y centrado en examen. ${sourceRule} Pregunta: "${question}".`;
}

export async function askRealAI() {
  throw new Error("IA real no conectada todavia. Este servicio queda preparado para una API futura.");
}
