import { generateSimulatedTrainingPlan } from "./adaptiveTrainingService.js";
import { createMockForArea } from "./courseService.js";
import { generateFlashcardsFromErrors, generateQuizFromErrors } from "./errorTrainingGeneratorService.js";
import { createFlashcardsForArea } from "./flashcardService.js";
import { generateStudyMaterial } from "./materialGeneratorService.js";

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

export function isSimulationMode() {
  return AI_RUNTIME.useLocalSimulation || AI_RUNTIME.apiMode === AI_MODES.SIMULATION;
}

export function setSimulationMode(enabled) {
  AI_RUNTIME.useLocalSimulation = Boolean(enabled);
  AI_RUNTIME.apiMode = enabled ? AI_MODES.SIMULATION : AI_MODES.REAL_API_READY;
}

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

export function responderChat(input) {
  if (!isSimulationMode()) {
    // TODO IA real: enviar el payload a un backend propio. Nunca llamar a OpenAI desde el frontend.
    return "IA real preparada, pero no conectada. Mantener backend seguro antes de llamar a OpenAI.";
  }

  return buildSimulatedAnswer(input);
}

export function generarMaterial(config) {
  if (!isSimulationMode()) {
    // TODO IA real: delegar la generacion en un backend con fuentes, archivos procesados y validacion.
    return {
      base: {
        id: `real-api-ready-${Date.now()}`,
        ...config.context,
        topic: config.topic || config.area,
        materialType: config.materialType,
        sourceLabel: "IA real preparada, no conectada",
        createdAt: new Date().toISOString(),
      },
      summary: null,
      flashcards: [],
      quiz: null,
      keyConcepts: [],
      expectedErrors: [],
    };
  }

  return generateStudyMaterial(config);
}

export function generarFlashcards({ context, area, source = "errors" }) {
  if (!isSimulationMode()) {
    // TODO IA real: generar tarjetas desde apuntes, errores, chat o archivos procesados en backend.
    return [];
  }

  const cardsFromErrors = source === "errors" ? generateFlashcardsFromErrors(context, area) : [];
  if (cardsFromErrors.length > 0) return cardsFromErrors;

  return createFlashcardsForArea(area).map((card, index) => ({
    id: `flashcard-ai-sim-${Date.now()}-${index}`,
    ...context,
    question: card.front,
    answer: card.back,
    explanation: "Flashcard simulada desde el servicio central de IA.",
    front: card.front,
    back: card.back,
    area,
    context,
    errorType: "repaso",
    difficulty: "media",
    source: "ai-service-simulation",
    createdAt: new Date().toISOString(),
  }));
}

export function generarSimulacro({ context, area, studentId = "juan", source = "errors" }) {
  if (!isSimulationMode()) {
    // TODO IA real: generar simulacros con criterios de correccion y dificultad desde backend.
    return null;
  }

  const quizFromErrors = source === "errors" ? generateQuizFromErrors(context, area) : null;
  if (quizFromErrors?.questions?.length > 0) return quizFromErrors;

  const mock = createMockForArea({ area, studyData: { mocks: [[`Simulacro de examen · ${area}`, `5 preguntas simuladas para ${area}.`]] } });
  const profile = {
    juan: "Bachillerato/PAU",
    carlota: "Medicina UCV",
    gonzalo: "ESO",
  }[studentId] || "Estudios PRO";
  const isDrawing = /dibujo|di[eé]drico|geometr|plano|recta|traza/i.test(area);
  const isCarlota = studentId === "carlota";
  const baseStatements = isDrawing
    ? [
        "Diferencia entre cota y alejamiento en el sistema diédrico.",
        "Identifica qué dato necesitas para situar una recta en diédrico.",
        "Explica para qué sirven las trazas de una recta.",
        "Elige el paso correcto antes de hallar verdadera magnitud.",
        "Revisa qué comprobarías al terminar una construcción diédrica.",
      ]
    : [
        `Define el concepto central de ${area}.`,
        `Aplica ${area} a un ejemplo de examen.`,
        `Detecta el error más probable al trabajar ${area}.`,
        `Elige la respuesta mejor justificada sobre ${area}.`,
        `Cierra una respuesta de ${area} con una comprobación correcta.`,
      ];

  return {
    id: `quiz-ai-sim-${Date.now()}`,
    ...context,
    title: mock.title,
    description: mock.description,
    area,
    context,
    questions: baseStatements.map((statement, index) => {
      const correctAnswer = isCarlota ? "Opción precisa con matiz conceptual." : index % 2 === 0 ? "Respuesta razonada y comprobada." : "Procedimiento paso a paso con justificación.";
      return {
        id: `quiz-ai-sim-question-${Date.now()}-${index}`,
        statement: `${statement} (${profile})`,
        prompt: `${statement} (${profile})`,
        options: [
          correctAnswer,
          "Respuesta de memoria sin justificar.",
          "Procedimiento incompleto.",
          "Dato correcto pero aplicado fuera de contexto.",
        ],
        correctAnswer,
        explanation: `Corrección simulada: en ${area}, la clave es justificar el criterio y comprobar el resultado.`,
        difficulty: index > 2 ? "alta" : "media",
      };
    }),
    source: "ai-service-simulation",
    createdAt: new Date().toISOString(),
  };
}

export function recomendarQueEstudioAhora({ upcomingEvents = [], errors = [], concepts = [], materials = [], agentState = {}, area = "" }) {
  const nextEvent = upcomingEvents[0];
  if (nextEvent) {
    return {
      title: `Prepara: ${nextEvent.titulo}`,
      reason: `Tienes un evento próximo el ${new Date(nextEvent.fechaInicio).toLocaleString("es-ES")}.`,
      action: `Dedica 25 minutos a repasar ${nextEvent.asignatura || agentState.subject || area}${nextEvent.bloque ? ` · ${nextEvent.bloque}` : ""} y termina con 5 preguntas rápidas.`,
      focus: "planner",
      source: "ai-service-simulation",
    };
  }

  if (errors.length > 0) {
    return {
      title: `Repasa ${errors.length} error(es) frecuente(s)`,
      reason: "La memoria de errores del bloque tiene fallos pendientes.",
      action: "Haz 10 minutos de corrección activa y crea flashcards desde los errores más repetidos.",
      focus: "errors",
      source: "ai-service-simulation",
    };
  }

  if (concepts.length > 0) {
    return {
      title: "Vuelve a un concepto difícil",
      reason: `Hay ${concepts.length} concepto(s) marcado(s) para seguimiento.`,
      action: `Pide al profesor IA una explicación corta de "${concepts[0].title}" y genera 3 preguntas de comprobación.`,
      focus: "chat",
      source: "ai-service-simulation",
    };
  }

  if (materials.length > 0) {
    return {
      title: "Repasa material reciente",
      reason: `El último material guardado es "${materials[0].topic || materials[0].materialTypeLabel || "material generado"}".`,
      action: "Haz una lectura rápida y conviértelo en flashcards o mini-simulacro.",
      focus: "material",
      source: "ai-service-simulation",
    };
  }

  return {
    title: "Crea un plan corto de estudio",
    reason: "Todavía no hay eventos, errores o materiales suficientes en este bloque.",
    action: "Empieza con un plan de hoy: 25 minutos de estudio, 5 minutos de descanso y 5 preguntas de comprobación.",
    focus: "planner",
    source: "ai-service-simulation",
  };
}

export function analizarMaterialVisual({ item = {}, context = {}, area = "" }) {
  const type = String(item.tipoArchivo || item.mimeType || item.type || "").toLowerCase();
  const isPdf = type.includes("pdf") || String(item.nombreArchivo || item.fileName || "").toLowerCase().endsWith(".pdf");
  const isImage = type.startsWith("image/");
  const title = item.nombreArchivo || item.fileName || "material visual";

  return {
    id: `visual-analysis-sim-${Date.now()}`,
    ...context,
    title,
    area,
    detectedType: isPdf ? "pdf" : isImage ? "imagen" : "visual",
    status: "pendiente_ia_real",
    sourceLabel: "🧪 Análisis visual simulado",
    summary: `Metadatos recibidos para ${title}. En IA real se analizará el contenido con OCR/visión desde backend seguro.`,
    suggestedAction: isPdf ? "Preparar lectura y extracción futura." : "Pedir al alumno que indique qué parte quiere revisar.",
    createdAt: new Date().toISOString(),
  };
}

export function resumirErrores({ errors = [], context = {}, area = "" }) {
  const pending = errors.filter((error) => error.status !== "superado");
  const byType = pending.reduce((acc, error) => {
    const type = error.errorType || "otro";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const dominantType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "sin patrón claro";

  return {
    ...context,
    area,
    total: errors.length,
    pending: pending.length,
    dominantType,
    summary:
      pending.length === 0
        ? `No hay errores pendientes en ${area}.`
        : `Hay ${pending.length} error(es) pendientes en ${area}. Patrón principal: ${dominantType}.`,
    recommendation:
      pending.length === 0
        ? "Mantén el repaso con una pregunta corta."
        : "Haz recuperación activa, corrige el patrón dominante y termina con flashcards.",
    source: "ai-service-simulation",
  };
}

export function generarPlanEstudioSimulado(config) {
  if (!isSimulationMode()) {
    // TODO IA real: crear planes adaptativos con calendario, errores y restricciones reales desde backend.
    return null;
  }

  return generateSimulatedTrainingPlan(config);
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
