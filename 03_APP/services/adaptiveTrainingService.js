import { getErrorsByContext } from "./errorMemoryService.js";

export function getTrainingSummary(context) {
  const errors = getErrorsByContext(context);
  const pending = errors.filter((error) => error.status === "pendiente");
  const reviewing = errors.filter((error) => error.status === "en repaso");
  return {
    errors,
    pending,
    reviewing,
    dominantErrorType: getDominantErrorType(errors),
    dominantDifficulty: getDominantDifficulty(errors),
  };
}

export function getDominantErrorType(errors) {
  return getDominantValue(errors, "errorType");
}

export function getDominantDifficulty(errors) {
  return getDominantValue(errors, "difficulty");
}

export function getRecommendedActions(context) {
  const summary = getTrainingSummary(context);
  const actions = [];

  if (summary.dominantErrorType === "conceptual") actions.push("Repaso teorico breve y flashcards del bloque.");
  if (summary.dominantErrorType === "procedimiento") actions.push("Ejercicios paso a paso con checklist.");
  if (summary.dominantErrorType === "memoria") actions.push("Flashcards cortas y repeticion espaciada.");
  if (summary.dominantErrorType === "comprension lectora") actions.push("Explicacion guiada y preguntas de control.");
  if (summary.dominantErrorType === "calculo") actions.push("Ejercicios cortos repetidos con correccion inmediata.");
  if (summary.dominantDifficulty === "alta") actions.push("Mini-simulacro especifico antes de cerrar el bloque.");
  if (actions.length === 0) actions.push("Mantener repaso ligero y crear un error si aparece un fallo repetido.");

  return actions;
}

export function generateSimulatedTrainingPlan(context) {
  const summary = getTrainingSummary(context);
  const actions = getRecommendedActions(context);
  const mainRecommendation = buildMainRecommendation(summary);
  return {
    ...summary,
    actions,
    mainRecommendation,
  };
}

function buildMainRecommendation(summary) {
  if (summary.errors.length === 0) {
    return "No hay errores guardados en este bloque. Empieza con una sesion corta y registra los fallos que aparezcan.";
  }
  if (summary.dominantDifficulty === "alta") {
    return "Prioriza correccion profunda: repasa la teoria minima, rehace errores y termina con un mini-simulacro.";
  }
  if (summary.dominantErrorType === "procedimiento") {
    return "Entrena el metodo: pasos visibles, checklist y ejercicios parecidos hasta automatizar.";
  }
  if (summary.dominantErrorType === "memoria") {
    return "Usa flashcards y recuperacion activa antes de hacer ejercicios largos.";
  }
  return "Trabaja los errores activos con una ronda breve: entender, practicar, corregir y repetir.";
}

function getDominantValue(errors, key) {
  if (errors.length === 0) return "sin datos";
  const counts = errors.reduce((acc, error) => {
    acc[error[key]] = (acc[error[key]] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "sin datos";
}
