export const GENERATED_MATERIALS_KEY = "estudiosProGeneratedMaterials";
export const TOPIC_SUMMARIES_KEY = "estudiosProTopicSummaries";
export const TOPIC_FLASHCARDS_KEY = "estudiosProTopicFlashcards";
export const TOPIC_QUIZZES_KEY = "estudiosProTopicQuizzes";

function createId(prefix = "material") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeList(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function sameContext(item, context) {
  return (
    item.studentId === context.studentId &&
    item.courseId === context.courseId &&
    item.subjectId === context.subjectId &&
    (item.blockId || "") === (context.blockId || "")
  );
}

function sourceOrigin(sourceType) {
  const origins = {
    topic: "generated_from_topic",
    subtopic: "generated_from_subtopic",
    pasted_content: "generated_from_pasted_content",
    uploaded_files: "generated_from_uploaded_files",
  };
  return origins[sourceType] || "generated_from_topic";
}

function sourceLabel(sourceType) {
  const labels = {
    topic: "tema general",
    subtopic: "parte concreta",
    pasted_content: "contenido pegado",
    uploaded_files: "archivos/fotos subidas",
  };
  return labels[sourceType] || "tema general";
}

function baseTitle({ sourceType, topic, subtopic, pastedContentPreview, area }) {
  if (sourceType === "pasted_content") return `Material simulado a partir del contenido pegado · ${area}`;
  if (sourceType === "uploaded_files") return `Material simulado desde archivos/fotos del bloque · ${topic || area}`;
  if (sourceType === "subtopic") return `${subtopic || "Parte concreta"} · ${topic}`;
  return topic || area;
}

function buildConcepts(focus, difficulty) {
  return [
    `Definicion esencial de ${focus}`,
    `Diferencias con conceptos cercanos`,
    `Metodo de aplicacion en nivel ${difficulty}`,
    "Checklist de revision antes de responder",
  ];
}

function buildSummary(config) {
  const focus = config.sourceType === "subtopic" ? config.subtopic : config.topic || config.area;
  const sourceText =
    config.sourceType === "pasted_content"
      ? "Material simulado a partir del contenido pegado. Solo se usa una vista previa local, sin analisis real."
      : config.sourceType === "uploaded_files"
        ? "Material simulado desde archivos/fotos subidas del bloque. Pendiente de OCR/visión IA."
      : `Fuente: ${sourceLabel(config.sourceType)}.`;

  return {
    id: createId("summary"),
    ...config.context,
    title: `Resumen de ${baseTitle(config)}`,
    sourceUsed: sourceText,
    explanation: `Repaso simulado y estructurado sobre ${focus}. Esta version no usa IA real, pero deja preparada la forma del material futuro.`,
    keyConcepts: buildConcepts(focus, config.difficulty),
    outline: [
      "1. Idea principal",
      "2. Pasos o rasgos que hay que dominar",
      "3. Ejemplo tipo examen",
      "4. Comprobacion final",
    ],
    expectedErrors: [
      `Confundir ${focus} con un concepto parecido`,
      "Responder sin justificar",
      "No comprobar el resultado con el enunciado",
    ],
    examTip: `En examen, empieza definiendo ${focus}, aplica un criterio claro y cierra con una comprobacion breve.`,
    sourceType: config.sourceType,
    topic: config.topic,
    subtopic: config.subtopic,
    difficulty: config.difficulty,
    origin: sourceOrigin(config.sourceType),
    sourceBasis: config.sourceBasis,
    sourceLabel: config.sourceLabel,
    sourceFileIds: config.sourceFileIds,
    createdAt: config.createdAt,
  };
}

function buildFlashcards(config) {
  const focus = config.sourceType === "subtopic" ? config.subtopic : config.topic || config.area;
  const origin = sourceOrigin(config.sourceType);
  return [
    {
      question: `¿Que debes recordar sobre ${focus}?`,
      answer: `${focus} es el centro de este repaso simulado. Define el concepto y aplica el metodo paso a paso.`,
      explanation: config.sourceType === "pasted_content" ? "Material simulado a partir del contenido pegado." : `Tarjeta generada desde ${sourceLabel(config.sourceType)}.`,
    },
    {
      question: `¿Cual es el error mas probable al estudiar ${focus}?`,
      answer: "Confundirlo con un concepto cercano o responder sin justificar.",
      explanation: "La tarjeta sirve para activar memoria de errores antes de practicar.",
    },
    {
      question: `¿Como responderias una pregunta de examen sobre ${focus}?`,
      answer: "Empieza con definicion breve, aplica un criterio claro y termina con comprobacion.",
      explanation: "Formato simulado orientado a examen y adaptable a futura IA real.",
    },
  ].map((card) => ({
    id: createId("flashcard"),
    ...config.context,
    question: card.question,
    answer: card.answer,
    explanation: card.explanation,
    front: card.question,
    back: card.answer,
    area: config.area,
    context: config.context,
    errorType: "repaso",
    difficulty: config.difficulty,
    sourceType: config.sourceType,
    topic: config.topic,
    subtopic: config.subtopic,
    origin,
    sourceBasis: config.sourceBasis,
    sourceLabel: config.sourceLabel,
    sourceFileIds: config.sourceFileIds,
    source: "generated-material",
    createdAt: config.createdAt,
  }));
}

function buildQuiz(config) {
  const focus = config.sourceType === "subtopic" ? config.subtopic : config.topic || config.area;
  const origin = sourceOrigin(config.sourceType);
  const questions = [
    {
      statement: `¿Que opcion describe mejor ${focus}?`,
      correctAnswer: "La que define el concepto y lo aplica con criterio.",
      explanation: `Respuesta simulada: en ${focus}, lo importante es definir, aplicar y comprobar.`,
    },
    {
      statement: `¿Que debes evitar al trabajar ${focus}?`,
      correctAnswer: "Responder de memoria sin justificar.",
      explanation: "El simulacro prioriza detectar fallos habituales del bloque activo.",
    },
    {
      statement: `¿Que cierre mejora una respuesta de examen sobre ${focus}?`,
      correctAnswer: "Una comprobacion breve conectada con el enunciado.",
      explanation: "Cerrar con comprobacion reduce errores de procedimiento.",
    },
  ].map((question) => ({
    id: createId("quiz-question"),
    statement: question.statement,
    prompt: question.statement,
    options: [
      question.correctAnswer,
      "Copiar una frase sin comprobar.",
      "Ignorar el contexto del bloque.",
      "Responder solo con una palabra.",
    ],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: config.difficulty,
    sourceType: config.sourceType,
    topic: config.topic,
    subtopic: config.subtopic,
    origin,
    sourceBasis: config.sourceBasis,
    sourceLabel: config.sourceLabel,
    sourceFileIds: config.sourceFileIds,
  }));

  return {
    id: createId("quiz"),
    ...config.context,
    title: `Simulacro de ${baseTitle(config)}`,
    description: `Simulacro generado en modo simulacion desde ${sourceLabel(config.sourceType)}.`,
    area: config.area,
    context: config.context,
    questions,
    difficulty: config.difficulty,
    sourceType: config.sourceType,
    topic: config.topic,
    subtopic: config.subtopic,
    origin,
    sourceBasis: config.sourceBasis,
    sourceLabel: config.sourceLabel,
    sourceFileIds: config.sourceFileIds,
    source: "generated-material",
    createdAt: config.createdAt,
  };
}

function sourceBasisFor(sourceType) {
  const basis = {
    topic: "generated_ai",
    subtopic: "generated_ai",
    pasted_content: "pasted_content",
    uploaded_files: "uploaded_files",
  };
  return basis[sourceType] || "simulated";
}

function visibleSourceLabelFor(sourceType) {
  const labels = {
    topic: "🤖 Generado por IA simulada",
    subtopic: "🤖 Generado por IA simulada",
    pasted_content: "✍️ Basado en contenido pegado simulado",
    uploaded_files: "📎 Basado en archivos subidos — pendiente de IA real",
  };
  return labels[sourceType] || "🧪 Simulado por ahora";
}

export function generateStudyMaterial({ sourceType, topic, subtopic, pastedContent, difficulty, materialType, context, area, sourceFileIds = [] }) {
  const createdAt = new Date().toISOString();
  const pastedContentPreview = String(pastedContent || "").trim().slice(0, 240);
  const normalized = {
    id: createId("material"),
    ...context,
    sourceType,
    topic: topic || area,
    subtopic: subtopic || "",
    pastedContentPreview,
    difficulty,
    materialType,
    createdAt,
    origin: sourceOrigin(sourceType),
    sourceBasis: sourceBasisFor(sourceType),
    sourceLabel: visibleSourceLabelFor(sourceType),
    sourceFileIds,
    area,
    context,
  };

  return {
    base: normalized,
    summary: ["resumen", "todo"].includes(materialType) ? buildSummary(normalized) : null,
    flashcards: ["flashcards", "todo"].includes(materialType) ? buildFlashcards(normalized) : [],
    quiz: ["simulacro", "todo"].includes(materialType) ? buildQuiz(normalized) : null,
  };
}

export function saveGeneratedMaterial(material) {
  writeList(GENERATED_MATERIALS_KEY, [material.base, ...readList(GENERATED_MATERIALS_KEY)]);
  if (material.summary) writeList(TOPIC_SUMMARIES_KEY, [material.summary, ...readList(TOPIC_SUMMARIES_KEY)]);
  if (material.flashcards.length > 0) writeList(TOPIC_FLASHCARDS_KEY, [...material.flashcards, ...readList(TOPIC_FLASHCARDS_KEY)]);
  if (material.quiz) writeList(TOPIC_QUIZZES_KEY, [material.quiz, ...readList(TOPIC_QUIZZES_KEY)]);
}

export function getGeneratedMaterialsByContext(context) {
  return readList(GENERATED_MATERIALS_KEY).filter((item) => sameContext(item, context));
}
