# Estudios PRO - MVP multiagente

## Stack recomendado para esta fase

- HTML
- CSS
- JavaScript vanilla

Esta version no usa dependencias ni backend. Sirve para validar el flujo principal antes de conectar IA real, lectura de archivos, cuentas de usuario y persistencia remota.

La app funciona como prototipo local: usa datos simulados, chat simulado y `localStorage` para conservar el estado de la experiencia en el navegador.

Cuando el MVP necesite crecer, la evolucion recomendada es React + Vite + TypeScript, con una API separada para IA, subida de archivos y memoria de errores.

## Concepto funcional

El MVP actual tiene dos niveles de uso:

- Pantalla inicial: seleccion simple de Juan, Carlota🥰 o Gonzalo.
- Preparacion: alumno, curso, asignatura, bloque y tres acciones principales.
- Modo foco: chat central y errores a vigilar, sin distracciones.
- Flashcards: generacion desde errores, modo repaso e impresion limpia.
- Generar material: resumen, flashcards y simulacro desde tema, parte concreta, contenido pegado o archivos/fotos del bloque.

Todo el producto sigue siendo una simulacion. No hay IA real ni analisis real de archivos.

## Agentes

### Juan - Bachillerato / PAU

Juan es el agente principal de esta fase:

- 1º Bachillerato.
- 2º Bachillerato.
- Colegio La Inmaculada Franciscanos de Cartagena.
- Enfoque en examenes del colegio y PAU Region de Murcia.
- Estado: completo simulado.
- Incluye chat, errores frecuentes, alta manual de errores, flashcards, simulacros, curso personalizado y subbloques de Lengua.

### Carlota🥰 - Medicina UCV

Carlota🥰 esta preparada a nivel de estructura para una fase posterior:

- Medicina, Universidad Catolica de Valencia.
- Cursos 1º a 6º.
- Asignaturas simuladas por curso.
- Enfoque previsto en test avanzado, alta dificultad, apuntes, simulacros y errores frecuentes.
- Estado: preparada, no completa.

### Gonzalo - ESO

Gonzalo esta preparado a nivel de estructura para una fase posterior:

- ESO.
- Cursos 1º a 4º.
- Asignaturas simuladas por curso.
- Enfoque previsto en aprendizaje guiado, explicaciones claras, practica progresiva y errores frecuentes.
- Estado: preparado, no completo.

## Funcionalidades incluidas en el MVP

- Pantalla inicial limpia de Estudios PRO.
- Tarjetas grandes para Juan, Carlota🥰 y Gonzalo.
- Entrada por alumno/agente.
- Seleccion de curso segun agente.
- Seleccion de asignatura.
- Subbloques especificos para Lengua: Literatura, Analisis gramatical, Comentario de texto, Sintaxis, Morfologia y PAU Lengua.
- Subida simulada de archivos asociada a alumno, curso, asignatura y subbloque.
- Subida simulada de fotos de apuntes, cuaderno, libro, esquemas, ejercicios o examenes con metadatos enriquecidos.
- Opcion `Hacer foto con el móvil` usando una tarjeta `label` nativa conectada a `input accept="image/*"` y `capture="environment"` para mejorar compatibilidad con Safari iOS.
- Botones de subir archivos, estudio programado y estudio ultrarrapido.
- Chat educativo simulado.
- Flashcards con seleccion, modo repaso, resultados guardados e impresion.
- Simulacros.
- Panel de errores frecuentes.
- Alta manual de errores por alumno, curso, asignatura y subbloque.
- Acciones de memoria de errores: repasado, superado y eliminar.
- Entrenamiento recomendado basado en errores del bloque.
- Flashcards y mini-simulacros generados desde la memoria de errores del bloque.
- Generador flexible de material en modo simulacion desde tema, parte concreta, contenido pegado o archivos/fotos subidas.
- Trazabilidad visible de fuente y regla de apoyo visual inteligente: imprescindible, opcional o no necesario.
- Placeholders de apoyo visual sin generacion real de imagen ni llamadas API.
- Creacion simulada de curso personalizado con plan por dias, objetivos, ejercicios, flashcards, errores a vigilar y repaso final.
- Persistencia local con `localStorage`.

## Servicios JS preparados

- `data/studyStructure.js`: fuente de verdad para alumnos, cursos, asignaturas y subbloques.
- `services/storageService.js`: `localStorage`.
- `services/aiService.js`: respuestas simuladas y punto futuro de IA real.
- `services/errorMemoryService.js`: memoria avanzada de errores por contexto.
- `services/adaptiveTrainingService.js`: entrenamiento recomendado simulado desde errores.
- `services/errorTrainingGeneratorService.js`: generador simulado de flashcards y mini-simulacros desde errores.
- `services/flashcardReviewService.js`: resultados de repaso de flashcards por contexto.
- `services/materialGeneratorService.js`: material simulado por tema/subtema/contenido pegado y claves `estudiosProGeneratedMaterials`, `estudiosProTopicSummaries`, `estudiosProTopicFlashcards`, `estudiosProTopicQuizzes`.
- `services/visualResourcesService.js`: recursos visuales simulados en `estudiosProVisualResources`.
- `services/courseService.js`: cursos personalizados y simulacros.
- `services/flashcardService.js`: flashcards simuladas.
- `services/fileStorageService.js`: metadatos de archivos por alumno, curso, asignatura y subbloque.
- `config.example.js`: plantilla de configuracion futura sin claves API.
- `.env.example`: plantilla de variables de entorno sin claves reales.

La conexion con GPT queda preparada a nivel de arquitectura, pero sigue desactivada. Cualquier API real debera llamarse desde backend seguro.

## Modo simulacion

El MVP funciona en modo `simulation`.

- No requiere `.env`.
- No usa claves API.
- No llama a OpenAI.
- Mantiene las respuestas simuladas en `services/aiService.js`.

## Preparar IA real

Cuando exista backend seguro:

1. Copia `03_APP/.env.example` como referencia para las variables necesarias.
2. Crea un `.env` local solo en el entorno que ejecute el backend.
3. Guarda ahi `OPENAI_API_KEY`.
4. Cambia `API_MODE` a `real_api_ready` cuando el backend este preparado.
5. No pongas claves reales en `config.example.js`, `app.js` ni ningun archivo del frontend.

`config.example.js` documenta los modos disponibles:

- `simulation`: modo actual del MVP.
- `real_api_ready`: ruta preparada para backend + OpenAI, todavia sin llamada real.

## Persistencia local

La clave de almacenamiento del MVP es `estudiosProMvpStateV3`.

La memoria avanzada de errores usa `estudiosProErrorMemory`.

Los resultados de repaso de flashcards usan `estudiosProFlashcardReviews`.

El material generado por tema, subtema o contenido pegado usa claves separadas:

- `estudiosProGeneratedMaterials`;
- `estudiosProTopicSummaries`;
- `estudiosProTopicFlashcards`;
- `estudiosProTopicQuizzes`.

En modo simulacion solo se guarda una vista previa del contenido pegado.

El estado local cubre:

- Agente activo.
- Curso seleccionado por agente.
- Asignatura seleccionada por agente.
- Subbloque de Lengua cuando aplica.
- Modo de estudio activo.
- Chat por agente.
- Errores por alumno, curso, asignatura y subbloque.
- Archivos seleccionados en el prototipo.
- Curso personalizado generado.
- Datos operativos de flashcards y simulacros derivados del estado activo.
- Resultados de repaso de flashcards: dominada, duda o no sabida.

Los selectores de curso, asignatura y bloque se alimentan desde `data/studyStructure.js`. Al cargar estado guardado, la app valida el ultimo contexto activo para evitar quedarse en cursos, asignaturas o bloques que ya no existan en la estructura.

En terminos de producto, la persistencia esperada para la fase es agente/curso/asignatura/chat/errores/flashcards/cursos/simulacros/archivos. Tecnicamente, parte de flashcards y simulacros procede de bancos simulados y se re-renderiza segun agente, curso y asignatura.

## Archivos por asignatura

La seccion "Archivos del bloque" permite seleccionar archivos desde el ordenador con `input type=file`.

El MVP no guarda contenido ni procesa PDFs. Solo registra metadatos:

- `id`;
- `fileName`;
- `mimeType`;
- `sizeBytes`;
- `uploadedAt`;
- `studentId`;
- `courseId`;
- `subjectId`;
- `subblockId`;
- `topicName`;
- `subtopicName`;
- `materialKind`;
- `sourceDevice`;
- `status`: pendiente de procesamiento.
- `processingNotes`;
- `futureAIReady`.
- `captureMode`: `file_upload` o `mobile_camera`.

El listado se filtra por el contexto activo. Si cambias de asignatura o subbloque, solo aparecen los archivos de ese bloque concreto.

La clave de almacenamiento separada es `estudiosProFiles`.

No subas a GitHub archivos reales de apuntes, examenes, PDFs privados o documentos personales.

### Fotos desde móvil

La opcion `📱 Hacer foto con el móvil` abre la cámara o selector del dispositivo cuando el navegador lo permite. En iPhone hay que pulsar directamente sobre la tarjeta, no sobre un botón intermedio, para que Safari trate la acción como selección nativa de archivo. En escritorio se muestra un aviso para usar la subida normal o abrir la app desde el móvil.

Limitacion actual: sin backend, la foto solo existe en el dispositivo donde se selecciona. Para sincronizar móvil y ordenador hará falta backend, servidor local accesible por red o una PWA sincronizada. La ruta futura recomendada es QR del bloque activo + subida móvil + procesamiento IA/OCR.

## Estado del MVP Juan

El MVP Juan ya es una version amplia de validacion. Incluye:

- Flujo Alumno -> Curso -> Asignatura -> Herramientas de estudio.
- Lengua por subbloques.
- Chat simulado.
- Flashcards.
- Simulacros.
- Errores frecuentes.
- Alta manual de errores.
- Curso personalizado simulado.
- Memoria avanzada de errores apoyada en almacenamiento local.

## Limitaciones actuales

- No hay IA real.
- La subida de archivos solo muestra o registra nombres; no analiza contenido real.
- La subida de archivos guarda metadatos locales, no contenido completo.
- El chat no consulta modelos de IA ni fuentes externas.
- No hay backend, autenticacion ni sincronizacion entre dispositivos.
- Carlota🥰 y Gonzalo tienen estructura preparada y asignaturas simuladas, pero no la profundidad funcional de Juan.

## Como ejecutar

Usa servidor local porque la app carga modulos ES:

```bash
cd 03_APP
python3 -m http.server 5173
```

Despues abre:

```text
http://localhost:5173
```

## Nota tecnica

La app todavia no conecta IA real. La subida de archivos solo muestra los nombres seleccionados y el chat responde con mensajes simulados. Cualquier comportamiento de memoria o progreso debe considerarse local al navegador mediante `localStorage`.
