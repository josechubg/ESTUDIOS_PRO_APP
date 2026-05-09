export const VISUAL_RESOURCES_KEY = "estudiosProVisualResources";

function createId(prefix = "visual") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readVisualResources() {
  try {
    return JSON.parse(localStorage.getItem(VISUAL_RESOURCES_KEY)) || [];
  } catch {
    return [];
  }
}

function writeVisualResources(resources) {
  localStorage.setItem(VISUAL_RESOURCES_KEY, JSON.stringify(resources));
}

function sameContext(resource, context) {
  return (
    resource.studentId === context.studentId &&
    resource.courseId === context.courseId &&
    resource.subjectId === context.subjectId &&
    (resource.blockId || "") === (context.blockId || "")
  );
}

export function createSimulatedVisualResource({
  context,
  topic,
  subtopic = "",
  explanationId = "",
  visualType = "dibujo_generado",
  title = "Aquí se mostrará un dibujo explicativo",
  description = "Placeholder visual preparado para futura IA de visión o generación de esquemas.",
  sourceType = "simulated",
  sourceLabel = "Simulación sin fuente real",
  sourceFileId = "",
  externalUrl = "",
}) {
  return {
    id: createId(),
    ...context,
    topic,
    subtopic,
    explanationId,
    visualType,
    title,
    description,
    sourceType,
    sourceLabel,
    sourceFileId,
    externalUrl,
    createdAt: new Date().toISOString(),
    status: "placeholder_simulado",
  };
}

export function saveVisualResource(resource) {
  writeVisualResources([resource, ...readVisualResources()]);
  return resource;
}

export function getVisualResourcesByContext(context) {
  return readVisualResources().filter((resource) => sameContext(resource, context));
}
