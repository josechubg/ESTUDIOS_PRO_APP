import { getErrorsByContext } from "./errorMemoryService.js";

export function generateFlashcardsFromErrors(context, area) {
  return getErrorsByContext(context).map((error) => buildFlashcardFromError(error, area, context));
}

export function generateQuizFromErrors(context, area) {
  const errors = getErrorsByContext(context);
  return {
    title: `Mini-simulacro desde errores · ${area}`,
    description:
      errors.length === 0
        ? "Todavia no hay errores suficientes para generar entrenamiento personalizado. Añade errores o realiza un simulacro."
        : `Mini-simulacro simulado basado en ${errors.length} error(es) reales del bloque activo.`,
    area,
    questions: errors.map(buildQuestionFromError),
    createdAt: new Date().toISOString(),
    context: normalizeContext(context),
    source: "error-memory",
  };
}

export function buildFlashcardFromError(error, area, context = {}) {
  const question = buildPromptFromError(error);
  const answer = buildAnswerFromError(error);
  const explanation = buildExplanationFromError(error);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${error.id}`,
    question,
    answer,
    explanation,
    front: question,
    back: answer,
    area,
    context: normalizeContext(context),
    errorType: error.errorType,
    difficulty: error.difficulty,
    sourceErrorId: error.id,
    status: "desde error",
    createdAt: new Date().toISOString(),
  };
}

export function buildQuestionFromError(error) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${error.id}`,
    prompt: buildPromptFromError(error),
    options: [
      "Aplicar la correccion razonada del error.",
      "Repetir el mismo procedimiento sin comprobar.",
      "Ignorar el contexto del ejercicio.",
      "Responder de memoria sin justificar.",
    ],
    correctAnswer: "Aplicar la correccion razonada del error.",
    explanation: buildAnswerFromError(error),
    sourceErrorTitle: error.title,
    errorType: error.errorType,
    difficulty: error.difficulty,
  };
}

function buildPromptFromError(error) {
  const title = String(error.title || "").toLowerCase();
  if (title.includes("cota") && title.includes("alejamiento")) {
    return "¿Cuál es la diferencia entre cota y alejamiento?";
  }
  if (title.includes("atributo") && title.includes("cd")) {
    return "¿Cómo distingues un atributo de un complemento directo?";
  }
  if (title.includes("tesis")) {
    return "¿Cómo localizas la tesis de un texto sin confundirla con el tema?";
  }
  return `¿Cómo corregirías este error: ${error.title}?`;
}

function buildAnswerFromError(error) {
  const title = String(error.title || "").toLowerCase();
  if (title.includes("cota") && title.includes("alejamiento")) {
    return "La cota es la altura respecto al plano horizontal; el alejamiento es la distancia respecto al plano vertical.";
  }
  if (title.includes("atributo") && title.includes("cd")) {
    return "El atributo aparece con verbos copulativos y puede sustituirse por lo; el complemento directo depende de un verbo predicativo.";
  }
  if (title.includes("tesis")) {
    return "La tesis es la idea que defiende el autor; el tema es el asunto general del texto.";
  }
  return error.description || "Repasa este concepto porque aparece como error frecuente en este bloque.";
}

function buildExplanationFromError(error) {
  const title = String(error.title || "").toLowerCase();
  if (title.includes("cota") && title.includes("alejamiento")) {
    return "En diédrico no son lo mismo: la cota se lee respecto al plano horizontal y el alejamiento respecto al plano vertical.";
  }
  if (error.description) {
    return `${error.description} Revisa el paso, justifica la decision y comprueba antes de avanzar.`;
  }
  return "Repasa este concepto porque aparece como error frecuente en este bloque.";
}

function normalizeContext(context) {
  return {
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    blockId: context.blockId || "",
  };
}
