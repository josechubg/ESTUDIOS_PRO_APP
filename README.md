# ESTUDIOS PRO APP

Estudios PRO es una web app educativa multiagente para estudiar mejor, resolver dudas, practicar examenes, crear cursos personalizados y reducir errores repetidos.

La idea del producto no es ser una app generica: debe funcionar como profesor experto, entrenador academico, memoria de errores y apoyo rapido al estudio.

## Version actual

**MVP visual v1**.

Esta version es un prototipo local sin backend y sin IA real. Usa:

- HTML
- CSS
- JavaScript vanilla
- datos simulados
- `localStorage`
- servicios JS preparados para conectar GPT mas adelante sin exponer claves

La interfaz estable v1 prioriza claridad visual:

1. Pantalla inicial simple.
2. Seleccion de alumno.
3. Seleccion de curso, asignatura y bloque.
4. Modo foco para estudiar sin distracciones.

## Como abrir la app

La app usa modulos ES, asi que debe abrirse con servidor local:

```bash
cd 03_APP
python3 -m http.server 5173
```

Despues abre:

```text
http://localhost:5173
```

## Funciones del MVP

- Seleccion de agente: Juan, Carlota🥰 y Gonzalo.
- Seleccion de curso.
- Seleccion de asignatura.
- Seleccion de bloque o subbloque.
- Modo foco con chat central.
- Chat simulado.
- Subida simulada de archivos por alumno, curso, asignatura y bloque.
- Subida de fotos de apuntes/cuaderno/libro con metadatos de tema, parte, tipo y dispositivo.
- Subida directa de fotos desde móvil con label nativo + input `capture="environment"` compatible con Safari iOS y metadato `captureMode`.
- Errores frecuentes.
- Memoria avanzada de errores con tipo, dificultad, estado y repasos.
- Entrenamiento recomendado simulado basado en errores del bloque.
- Flashcards y mini-simulacros generados desde errores guardados.
- Generador flexible de material desde tema, parte concreta, contenido pegado o archivos/fotos del bloque.
- Tipos de material simulados: resumen, flashcards, simulacro, conceptos clave, errores frecuentes y pack completo.
- Impresión del material generado con vista limpia para usar "Guardar como PDF" desde el navegador.
- Historial de materiales generados por bloque con filtro por tipo, abrir, imprimir/PDF y eliminar.
- Preparacion para generar material desde archivos/fotos subidas del bloque, todavia sin OCR ni vision real.
- Regla de apoyo visual inteligente: imprescindible, opcional o no necesario, siempre en modo placeholder sin generar imagen real.
- Placeholders de apoyo visual y trazabilidad de fuente en explicaciones/materiales.
- Planificador de Estudio Adaptativo con eventos manuales, calendario, planes automáticos, reflexión y estadísticas locales.
- Calendario visual con resumen del periodo, eventos multiday, duración opcional y lista de eventos del periodo.
- Planificación flexible bajo demanda: modo express, programado, periodos especiales y recomendación "Qué estudio ahora".
- Subida de calendario por foto/PDF como metadato pendiente de IA real, con creación manual de eventos desde esa referencia.
- Adjuntar foto al chat desde cámara o galería como metadato, material visual pendiente y duda visual para futura IA con visión.
- Bandeja de material para agrupar fotos, archivos, PDFs, calendarios, respuestas del chat, materiales generados y conceptos difíciles.
- Flashcards simuladas con modo repaso, seleccion, resultados en `localStorage` e impresion limpia.
- Simulacros simulados.
- Curso personalizado simulado.
- Persistencia local con `localStorage`.
- Servicios JS preparados para futura conexion de IA.

## Preparacion para IA real

La app mantiene respuestas simuladas, pero ya separa la logica principal en servicios:

- `03_APP/services/storageService.js`: persistencia local.
- `03_APP/services/aiService.js`: chat simulado y payload futuro para GPT.
- `03_APP/services/errorMemoryService.js`: memoria avanzada de errores por bloque en `estudiosProErrorMemory`.
- `03_APP/services/adaptiveTrainingService.js`: resumen y recomendaciones simuladas desde la memoria de errores.
- `03_APP/services/errorTrainingGeneratorService.js`: genera flashcards y mini-simulacros simulados desde errores.
- `03_APP/services/flashcardReviewService.js`: guarda resultados de repaso de flashcards en `estudiosProFlashcardReviews`.
- `03_APP/services/materialGeneratorService.js`: genera y guarda material simulado por tema, subtema o contenido pegado.
- `03_APP/services/plannerService.js`: eventos, planes automáticos, adaptación y estadísticas del planificador en `estudiosProPlanner`.
- `03_APP/services/visualResourcesService.js`: placeholders de dibujos/esquemas y recursos visuales con trazabilidad.
- `03_APP/services/courseService.js`: cursos personalizados y simulacros.
- `03_APP/services/flashcardService.js`: flashcards.
- `03_APP/services/fileStorageService.js`: metadatos de archivos por bloque en `estudiosProFiles`.
- `03_APP/data/studyStructure.js`: estructura dinamica de alumnos, cursos, asignaturas y subbloques.

Tambien existe `03_APP/config.example.js` como plantilla sin claves reales. La conexion GPT futura debera hacerse mediante backend seguro, no desde el navegador.

### Modo simulacion

El modo actual es `simulation`. No usa claves API, no llama a OpenAI y mantiene las respuestas simuladas dentro de `03_APP/services/aiService.js`.

Para probar el MVP no hace falta crear `.env`.

### Preparar IA real mas adelante

Cuando se construya el backend, usa `03_APP/.env.example` como plantilla local:

```env
OPENAI_API_KEY=tu_clave_aqui
AI_PROVIDER=openai
AI_MODEL=gpt-5.5-thinking
API_MODE=simulation
```

La clave real debe ir solo en un `.env` local o en variables de entorno del servidor. Nunca debe subirse a GitHub ni ponerse en archivos frontend.

Consulta `01_DOCUMENTACION/SEGURIDAD_API_KEYS.md` antes de conectar una API real.

## Planificador de Estudio Adaptativo

El planificador permite crear eventos manuales y planes automáticos por alumno, curso, asignatura y bloque. Todo se guarda en `localStorage` con la clave `estudiosProPlanner`.

El uso principal sigue siendo el Modo Dudas: el alumno puede entrar, preguntar al profesor IA y salir sin crear ningún plan. La planificación aparece bajo demanda desde `Planificar estudio`, chips del chat o el calendario.

Incluye:

- Calendario en vistas mes, semana y día.
- Eventos de estudio, repaso, práctica, simulacro, ocio, ejercicio, examen y personal.
- Generación automática de sesiones de 20-30 minutos hasta la fecha de examen.
- Espaciado: sesiones en intervalos crecientes.
- Práctica de recuperación: repasos, flashcards y simulacros.
- Intercalación: alterna bloques o temas separados por coma.
- Metacognición: reflexión al completar cada sesión.
- Adaptación: si una sesión fue difícil o hay contenido para repasar, añade sesiones extra.
- Estadísticas: cumplimiento, tiempo dedicado y distribución por tipo.
- Propuestas no invasivas: un plan breve se previsualiza y solo se guarda al pulsar `Guardar en calendario`.
- Modos flexibles: express, programado, Navidad, Semana Santa, reorganización por evento y "Qué estudio ahora".
- Importación de calendarios foto/PDF solo como metadatos en `estudiosProVisualPending`, pendiente de IA real.
- Material visual pendiente: fotos del chat, calendarios y PDFs quedan listados para asociar tema, marcar duda visual o crear eventos manuales.

Fundamentos usados en modo simulación: práctica de recuperación, repetición espaciada, intercalación, reflexión metacognitiva y hábitos saludables. En esta fase no hay IA real ni sincronización externa.

Referencias de diseño educativo: Roediger y Karpicke sobre práctica de recuperación; Cepeda et al. sobre efecto de espaciado; Kornell y Bjork sobre intercalación; Dunlosky et al. sobre técnicas de estudio eficaces; Zimmerman sobre autorregulación del aprendizaje.

Uso básico:

1. Entra en un alumno y contexto.
2. Abre `Planificador`.
3. Crea un evento manual o genera un plan automático con fecha de examen.
4. Marca sesiones como completadas y responde la reflexión.
5. Revisa estadísticas y sesiones adaptativas nuevas.

## Agentes principales

### Juan — Bachillerato / PAU

- Alumno de 16 años.
- 1º y 2º Bachillerato.
- Colegio La Inmaculada Franciscanos, Cartagena.
- Enfoque: examenes del colegio y PAU Region de Murcia.
- Estado: agente funcional simulado principal.

### Carlota🥰 — Medicina UCV

- Estudiante universitaria de Medicina.
- Cursos 1º a 6º.
- Enfoque futuro: apuntes, test avanzado, alta dificultad y maxima nota.
- Estado: estructura preparada con datos simulados.

### Gonzalo — ESO

- Alumno de ESO.
- Cursos 1º a 4º.
- Enfoque futuro: comprension clara, ejercicios guiados y refuerzo progresivo.
- Estado: estructura preparada con datos simulados.

## Estructura del proyecto

```text
ESTUDIOS_PRO_APP/
├── 01_DOCUMENTACION/
├── 02_PROMPTS/
├── 03_APP/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── data/
│   └── services/
├── 04_DATOS_PRUEBA/
├── CHANGELOG.md
└── README.md
```

## Documentacion clave

- `01_DOCUMENTACION/DOCUMENTO_MAESTRO_GENERAL.md`
- `01_DOCUMENTACION/DISEÑO_FUNCIONAL_APP.md`
- `01_DOCUMENTACION/ARQUITECTURA_IA.md`
- `01_DOCUMENTACION/SEGURIDAD_API_KEYS.md`
- `01_DOCUMENTACION/VERSION_ESTABLE_VISUAL_V1.md`
- `01_DOCUMENTACION/ROADMAP.md`
- `01_DOCUMENTACION/JUAN_DOCUMENTO_MAESTRO.md`
- `01_DOCUMENTACION/JUAN_MVP_FUNCIONAL.md`

## Limitaciones actuales

- No hay IA real todavia.
- No hay claves API.
- No hay backend.
- La subida de archivos esta simulada.
- Solo se guardan metadatos de archivos en `localStorage`; no se guarda el contenido completo.
- No deben subirse a GitHub archivos reales de apuntes, examenes o documentos privados.
- El chat responde con mensajes simulados.
- `localStorage` no es memoria segura ni sincronizada.

### Fotos desde móvil

En modo local sin backend, la foto solo se selecciona desde el dispositivo donde está abierta la web. En iPhone, pulsa directamente sobre la tarjeta `📱 Hacer foto con el móvil`; Safari abrirá cámara o galería si lo permite. Para subir desde móvil al ordenador de forma sincronizada hará falta backend, servidor local accesible desde la red o PWA con almacenamiento sincronizado.

Flujo futuro recomendado: QR del bloque activo, subida móvil, asociación automática al contexto y procesamiento IA/OCR seguro en backend.

## Proximos pasos

1. Conectar IA real mediante backend.
2. Leer y analizar archivos subidos.
3. Convertir Carlota🥰 y Gonzalo en agentes funcionales completos.
4. Añadir autenticacion, base de datos y memoria persistente.
