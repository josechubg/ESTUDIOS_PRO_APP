export const ERROR_MEMORY_KEY = "estudiosProErrorMemory";

export function getAllErrors() {
  try {
    const errors = JSON.parse(localStorage.getItem(ERROR_MEMORY_KEY));
    return Array.isArray(errors) ? errors : [];
  } catch {
    return [];
  }
}

export function saveAllErrors(errors) {
  localStorage.setItem(ERROR_MEMORY_KEY, JSON.stringify(errors));
}

export function getErrorsByContext(context) {
  return getAllErrors().filter((error) => errorBelongsToContext(error, context));
}

export function addError(errorData, context) {
  const error = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${errorData.title}`,
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    blockId: context.blockId || "",
    title: errorData.title,
    description: errorData.description,
    errorType: errorData.errorType || "otro",
    difficulty: errorData.difficulty || "media",
    createdAt: new Date().toISOString(),
    lastReviewedAt: null,
    reviewCount: 0,
    status: "pendiente",
  };
  saveAllErrors([error, ...getAllErrors()]);
  return error;
}

export function updateError(errorId, updates) {
  let updatedError = null;
  const errors = getAllErrors().map((error) => {
    if (error.id !== errorId) return error;
    updatedError = { ...error, ...updates };
    return updatedError;
  });
  saveAllErrors(errors);
  return updatedError;
}

export function deleteError(errorId) {
  saveAllErrors(getAllErrors().filter((error) => error.id !== errorId));
}

export function markAsReviewed(errorId) {
  const error = getAllErrors().find((item) => item.id === errorId);
  if (!error) return null;
  return updateError(errorId, {
    lastReviewedAt: new Date().toISOString(),
    reviewCount: (error.reviewCount || 0) + 1,
    status: error.status === "superado" ? "superado" : "en repaso",
  });
}

export function getWeakAreasByStudent(studentId) {
  const counts = new Map();
  getAllErrors()
    .filter((error) => error.studentId === studentId && error.status !== "superado")
    .forEach((error) => {
      const key = `${error.subjectId || "sin_asignatura"}:${error.blockId || "sin_bloque"}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  return Array.from(counts.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);
}

function errorBelongsToContext(error, context) {
  return (
    error.studentId === context.studentId &&
    error.courseId === context.courseId &&
    error.subjectId === context.subjectId &&
    (error.blockId || "") === (context.blockId || "")
  );
}
