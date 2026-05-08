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

export function createFileMetadata(file, context) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${file.name}`,
    fileName: file.name,
    mimeType: file.type || "tipo no detectado",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    subblockId: context.subblockId || "",
    status: "pendiente de procesamiento",
  };
}

export function fileBelongsToContext(file, context) {
  const courseMatches = file.courseId === context.courseId || file.courseId === context.courseName;
  const subjectMatches = file.subjectId === context.subjectId || file.subjectId === context.subjectName;
  const blockMatches = (file.subblockId || "") === (context.subblockId || "") || (file.subblockId || "") === (context.subblockName || "");

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

export function addFilesForContext(fileList, context) {
  const newFiles = fileList.map((file) => createFileMetadata(file, context));
  saveFileMetadata([...newFiles, ...loadFileMetadata()]);
  return newFiles;
}

export function deleteFileMetadata(fileId) {
  saveFileMetadata(loadFileMetadata().filter((file) => file.id !== fileId));
}
