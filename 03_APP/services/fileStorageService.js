export const FILE_STORAGE_KEY = "estudiosProFiles";

export function loadFileMetadata() {
  try {
    const files = JSON.parse(localStorage.getItem(FILE_STORAGE_KEY));
    return Array.isArray(files) ? files : [];
  } catch {
    return [];
  }
}

export function saveFileMetadata(files) {
  localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
}

export function createFileMetadata(file, context, details = {}) {
  const rawTopic = String(details.topicName || "").trim();
  const rawSubtopic = String(details.subtopicName || "").trim();
  const autoDetectTopic = !rawTopic;
  const autoDetectSubtopic = !rawSubtopic;
  const materialKind = details.materialKind || "otro";
  const officialExam = materialKind === "examen_oficial";
  const materialPriority = officialExam ? "alta" : ["examen_no_oficial", "examen"].includes(materialKind) ? "media" : "normal";
  const detectionContext = {
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    blockId: context.subblockId || "",
  };
  const processingNotes = autoDetectTopic
    ? "Tema pendiente de detección por IA futura según imagen y contexto académico."
    : "Metadatos guardados. Pendiente de OCR/visión IA.";

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${file.name}`,
    fileName: file.name,
    mimeType: file.type || "tipo no detectado",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    blockId: context.subblockId || "",
    subblockId: context.subblockId || "",
    topicName: rawTopic || "Pendiente de detectar por IA",
    subtopicName: rawSubtopic || "Pendiente de detectar por IA",
    autoDetectTopic,
    autoDetectSubtopic,
    detectionContext,
    materialKind,
    officialExam,
    materialPriority,
    sourceDevice: details.sourceDevice || "desconocido",
    captureMode: details.captureMode || "file_upload",
    status: "pendiente de procesamiento",
    processingNotes,
    futureAIReady: true,
  };
}

export function fileBelongsToContext(file, context) {
  const courseMatches = file.courseId === context.courseId || file.courseId === context.courseName;
  const subjectMatches = file.subjectId === context.subjectId || file.subjectId === context.subjectName;
  const fileBlockId = file.blockId || file.subblockId || "";
  const blockMatches = fileBlockId === (context.subblockId || "") || fileBlockId === (context.subblockName || "");

  return (
    file.studentId === context.studentId &&
    courseMatches &&
    subjectMatches &&
    blockMatches
  );
}

export function getFilesForContext(context) {
  return loadFileMetadata().filter((file) => fileBelongsToContext(file, context));
}

export function addFilesForContext(fileList, context, details = {}) {
  const newFiles = fileList.map((file) => createFileMetadata(file, context, details));
  saveFileMetadata([...newFiles, ...loadFileMetadata()]);
  return newFiles;
}

export function deleteFileMetadata(fileId) {
  saveFileMetadata(loadFileMetadata().filter((file) => file.id !== fileId));
}
