export const AI_RUNTIME = {
  provider: "openai",
  model: "gpt-5.5-thinking",
  apiMode: "simulation",
  useLocalSimulation: true,
};

export const AI_MODES = {
  SIMULATION: "simulation",
  REAL_API_READY: "real_api_ready",
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

export async function askAI(input, options = {}) {
  const mode = options.apiMode || AI_RUNTIME.apiMode;

  if (mode === AI_MODES.REAL_API_READY) {
    return askRealAPIReady(input);
  }

  return buildSimulatedAnswer(input);
}

export async function askRealAPIReady(input) {
  const payload = buildAIRequestPayload(input);

  // Punto futuro de conexion:
  // 1. Enviar este payload a un backend propio, por ejemplo POST /api/ai/chat.
  // 2. El backend leera OPENAI_API_KEY desde .env local o variables de entorno.
  // 3. El backend llamara a OpenAI y devolvera una respuesta validada.
  // 4. El frontend nunca debe conocer ni almacenar claves API.
  return {
    mode: AI_MODES.REAL_API_READY,
    payload,
    message: "IA real preparada, pero no conectada. Mantener backend seguro antes de llamar a OpenAI.",
  };
}

export async function askRealAI(input) {
  return askRealAPIReady(input);
}
