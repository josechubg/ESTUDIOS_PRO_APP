export const AI_RUNTIME = {
  provider: "simulation",
  apiMode: "local-simulation",
  useLocalSimulation: true,
};

export function buildAIRequestPayload({ agentKey, agent, modeName, area, question, scoped = false, files = [], memory = [] }) {
  return {
    agentKey,
    agentName: agent.name,
    agentProfile: {
      meta: agent.meta,
      focus: agent.focus,
      tone: agent.tone,
    },
    modeName,
    area,
    question,
    scoped,
    uploadedFiles: files,
    errorMemory: memory,
    sourcePriority: [
      "archivos_subidos",
      "fuentes_oficiales_centro_universidad",
      "curriculo_normativa_guias",
      "modelos_oficiales_examen",
      "fuentes_fiables",
      "redes_cualificadas_solo_orientacion",
    ],
  };
}

export function buildSimulatedAnswer(input) {
  const payload = buildAIRequestPayload(input);
  const { agentKey, modeName, area, question, scoped } = payload;
  const sourceRule = "Primero usaria archivos subidos, luego fuentes oficiales y modelos de examen; ahora solo simulo.";

  if (agentKey === "carlota") {
    return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: detectaria la trampa conceptual y propondria test avanzado. ${sourceRule} Pregunta: "${question}".`;
  }

  if (agentKey === "gonzalo") {
    return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: iria paso a paso, con una pista y un ejercicio parecido. ${sourceRule} Pregunta: "${question}".`;
  }

  return `${scoped ? "Modo foco" : "Respuesta"} en ${area}: ${modeName}, breve, claro, exigente y centrado en examen. ${sourceRule} Pregunta: "${question}".`;
}

export async function askRealAI() {
  throw new Error("IA real no conectada todavia. Usa un backend seguro antes de llamar a GPT.");
}
