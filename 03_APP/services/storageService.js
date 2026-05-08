export const STORAGE_KEY = "estudiosProMvpStateV3";

export function loadAppState(createDefaultState) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAppState() {
  localStorage.removeItem(STORAGE_KEY);
}
