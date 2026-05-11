export const VISUAL_PENDING_KEY = "estudiosProVisualPending";

const DEFAULT_DATA = {
  calendarImports: [],
  chatAttachments: [],
  itemStates: {},
};

function createId(prefix) {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readData() {
  try {
    return { ...DEFAULT_DATA, ...(JSON.parse(localStorage.getItem(VISUAL_PENDING_KEY)) || {}) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeData(data) {
  localStorage.setItem(VISUAL_PENDING_KEY, JSON.stringify(data));
}

function sameContext(item, context) {
  return (
    item.alumno === context.studentId &&
    item.curso === context.courseId &&
    (!item.asignatura || item.asignatura === context.subjectId) &&
    (!item.bloque || item.bloque === (context.blockId || ""))
  );
}

export function addCalendarImport(file, context, notasUsuario = "") {
  const data = readData();
  const item = {
    id: createId("calendar-import"),
    alumno: context.studentId,
    curso: context.courseId,
    nombreArchivo: file.name,
    tipoArchivo: file.type || "tipo no detectado",
    tamano: file.size || 0,
    fechaSubida: new Date().toISOString(),
    origen: "calendario_subido",
    estado: "pendiente_ia_real",
    eventosDetectados: [],
    notasUsuario,
  };
  data.calendarImports = [item, ...data.calendarImports];
  writeData(data);
  return item;
}

export function getCalendarImportsByContext(context) {
  return readData().calendarImports.filter((item) => sameContext(item, context));
}

export function getAllCalendarImports() {
  return readData().calendarImports;
}

export function updateCalendarImport(importId, updates) {
  const data = readData();
  data.calendarImports = data.calendarImports.map((item) => (item.id === importId ? { ...item, ...updates } : item));
  writeData(data);
}

export function deleteCalendarImport(importId) {
  const data = readData();
  data.calendarImports = data.calendarImports.filter((item) => item.id !== importId);
  writeData(data);
}

export function addChatAttachment(file, context, messageId = "", origin = "galeria_chat") {
  const data = readData();
  const item = {
    id: createId("chat-attachment"),
    nombreArchivo: file.name,
    tipoArchivo: file.type || "tipo no detectado",
    tamano: file.size || 0,
    fecha: new Date().toISOString(),
    alumno: context.studentId,
    curso: context.courseId,
    asignatura: context.subjectId,
    bloque: context.blockId || "",
    asociadoAMensajeChat: messageId,
    origen: origin,
    estado: "pendiente_ia_real",
    dudaVisual: false,
    temaAsociado: "",
  };
  data.chatAttachments = [item, ...data.chatAttachments];
  writeData(data);
  return item;
}

export function getChatAttachmentsByContext(context) {
  return readData().chatAttachments.filter((item) => sameContext(item, context));
}

export function getAllChatAttachments() {
  return readData().chatAttachments;
}

export function updateChatAttachment(attachmentId, updates) {
  const data = readData();
  data.chatAttachments = data.chatAttachments.map((item) => (item.id === attachmentId ? { ...item, ...updates } : item));
  writeData(data);
}

export function deleteChatAttachment(attachmentId) {
  const data = readData();
  data.chatAttachments = data.chatAttachments.filter((item) => item.id !== attachmentId);
  writeData(data);
}

export function getVisualPendingItemState(sourceKey) {
  return readData().itemStates[sourceKey] || {};
}

export function updateVisualPendingItemState(sourceKey, updates = {}) {
  const data = readData();
  data.itemStates = {
    ...(data.itemStates || {}),
    [sourceKey]: {
      ...(data.itemStates?.[sourceKey] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  };
  writeData(data);
  return data.itemStates[sourceKey];
}
