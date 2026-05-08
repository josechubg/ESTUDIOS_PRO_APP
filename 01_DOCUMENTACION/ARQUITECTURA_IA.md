# ARQUITECTURA IA — ESTUDIOS PRO

## Estado actual
La app no conecta IA real todavia. La interfaz usa datos simulados y servicios JavaScript preparados para sustituir la simulacion por llamadas reales cuando llegue la fase de API.

## Servicios JS
- `services/storageService.js`: lectura, guardado y borrado de estado local en `localStorage`.
- `services/aiService.js`: punto de entrada futuro para IA real. Ahora devuelve respuestas simuladas.
- `services/errorMemoryService.js`: creacion, filtrado y alta de errores frecuentes.
- `services/courseService.js`: generacion simulada de cursos, flashcards y simulacros.

## Punto futuro de conexion
La conexion real debe entrar por `aiService.js`.

Flujo previsto:
1. UI envia agente, curso, asignatura, bloque, modo y mensaje.
2. `aiService.js` construye payload con prompts internos.
3. Backend recibe payload y llama al proveedor de IA.
4. Backend devuelve respuesta, errores detectados, flashcards o ejercicios.
5. La app guarda resultado en memoria local o persistencia remota.

## Prompts internos
- `02_PROMPTS/PROMPT_SISTEMA_ESTUDIOS_PRO.md`
- `02_PROMPTS/PROMPT_JUAN.md`
- `02_PROMPTS/PROMPT_CARLOTA.md`
- `02_PROMPTS/PROMPT_GONZALO.md`

## Reglas
- No incluir claves API en frontend.
- No llamar IA directamente desde el navegador en produccion.
- Priorizar archivos subidos antes que fuentes externas.
- Mantener memoria de errores separada por alumno.
