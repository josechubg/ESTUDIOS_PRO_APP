export const MATERIAL_INBOX_KEY = "estudiosProMaterialInbox";

export const MATERIAL_INBOX_TYPES = [
  "foto_chat",
  "foto_camara",
  "foto_galeria",
  "archivo",
  "pdf",
  "calendario",
  "respuesta_chat",
  "material_generado",
  "concepto_dificil",
  "duda_visual",
];

export const MATERIAL_INBOX_STATUSES = [
  "pendiente_clasificar",
  "pendiente_ia_real",
  "asociado_a_tema",
  "convertido_en_material",
  "programado_en_calendario",
  "archivado",
  "eliminado",
];

function readInboxState() {
  try {
    return JSON.parse(localStorage.getItem(MATERIAL_INBOX_KEY)) || {};
  } catch {
    return {};
  }
}

function writeInboxState(state) {
  localStorage.setItem(MATERIAL_INBOX_KEY, JSON.stringify(state));
}

export function getInboxItemState(sourceKey) {
  return readInboxState()[sourceKey] || {};
}

export function updateInboxItemState(sourceKey, updates = {}) {
  const state = readInboxState();
  state[sourceKey] = {
    ...(state[sourceKey] || {}),
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeInboxState(state);
  return state[sourceKey];
}

export function setInboxItemStatus(sourceKey, status) {
  return updateInboxItemState(sourceKey, { status, estado: status });
}
