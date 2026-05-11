export const MATERIAL_INBOX_KEY = "estudiosProMaterialInbox";

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
  return updateInboxItemState(sourceKey, { status });
}

