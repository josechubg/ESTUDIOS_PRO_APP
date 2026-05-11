export const DIFFICULT_CONCEPTS_KEY = "estudiosProDifficultConcepts";

function createId(prefix = "concept") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readList() {
  try {
    return JSON.parse(localStorage.getItem(DIFFICULT_CONCEPTS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeList(items) {
  localStorage.setItem(DIFFICULT_CONCEPTS_KEY, JSON.stringify(items));
}

function sameContext(item, context) {
  return (
    item.studentId === context.studentId &&
    item.courseId === context.courseId &&
    item.subjectId === context.subjectId &&
    (item.blockId || "") === (context.blockId || "")
  );
}

export function getAllDifficultConcepts() {
  return readList();
}

export function getDifficultConceptsByContext(context) {
  return readList().filter((item) => sameContext(item, context));
}

export function addDifficultConcept(data, context) {
  const concept = {
    id: createId("difficult-concept"),
    ...context,
    title: data.title || "Concepto difícil",
    description: data.description || "",
    sourceText: data.sourceText || data.description || "",
    sourceMessageId: data.sourceMessageId || "",
    source: "chat_ia_simulado",
    type: "concepto_dificil",
    status: "pendiente",
    createdAt: new Date().toISOString(),
    lastReviewedAt: null,
    reviewCount: 0,
  };
  writeList([concept, ...readList()]);
  return concept;
}

export function deleteDifficultConcept(conceptId) {
  writeList(readList().filter((item) => item.id !== conceptId));
}

export function markDifficultConceptReviewed(conceptId) {
  writeList(
    readList().map((item) =>
      item.id === conceptId
        ? {
            ...item,
            status: "en repaso",
            reviewCount: (item.reviewCount || 0) + 1,
            lastReviewedAt: new Date().toISOString(),
          }
        : item
    )
  );
}
