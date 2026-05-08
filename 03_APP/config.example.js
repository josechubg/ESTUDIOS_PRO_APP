// Configuracion orientativa para Estudios PRO.
// Copia este esquema en una configuracion local cuando exista backend.
// Nunca subas claves reales a GitHub ni las pongas en codigo frontend.

export const AI_PROVIDER = "openai";
export const MODEL_NAME = "gpt-5.5-thinking";

// API_MODE:
// - "simulation": mantiene respuestas simuladas locales. Es el modo actual del MVP.
// - "real_api_ready": deja preparado el flujo para backend + OpenAI, sin llamada real todavia.
export const API_MODE = "simulation";

// Debe ser true mientras no exista backend seguro.
export const USE_LOCAL_SIMULATION = true;

// En modo IA real, la clave OPENAI_API_KEY debe vivir en .env local del backend,
// nunca en config.example.js, app.js ni ningun archivo que vaya a GitHub.
