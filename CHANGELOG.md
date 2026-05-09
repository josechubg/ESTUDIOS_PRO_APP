# CHANGELOG

## MVP visual v1

Primera version estable visual de Estudios PRO como app educativa local, clara y centrada en foco de estudio.

### Funciones incluidas

- Pantalla inicial simple con tres alumnos: Juan, Carlota🥰 y Gonzalo.
- Seleccion de curso, asignatura y bloque.
- Modo foco con chat central y errores a vigilar.
- Juan preparado como agente funcional simulado para Bachillerato / PAU.
- Lengua de Juan dividida en Literatura, Analisis gramatical, Comentario de texto, Sintaxis, Morfologia y PAU Lengua.
- Carlota🥰 preparada como estructura para Medicina UCV.
- Gonzalo preparado como estructura para ESO.
- Chat simulado, sin IA real.
- Memoria avanzada de errores por bloque con tipo, dificultad, estado y repasos.
- Entrenamiento recomendado simulado basado en la memoria de errores.
- Flashcards y mini-simulacros simulados generados desde errores reales guardados en el bloque.
- Resultado visible en modo foco para flashcards y mini-simulacros creados desde errores.
- Modo repaso de flashcards con tarjeta grande, vuelta de respuesta y registro de resultados en `localStorage`.
- Seleccion e impresion limpia de flashcards por bloque.
- Interfaz visual mas motivadora con tarjetas de accion, badges por tipo de error y paleta educativa suave.
- Generador flexible de material desde tema general, parte concreta o contenido pegado.
- Material generado asociado a alumno, curso, asignatura y bloque, con resumen, flashcards y simulacro simulados.
- Subida de fotos/apuntes con metadatos de tema, parte del tema, tipo de material, dispositivo, notas de procesamiento y estado futuro IA.
- Subida directa desde cámara móvil preparada con label nativo compatible con Safari iOS, `capture="environment"` y metadato `captureMode`.
- Flujo de archivos como pantalla independiente y modo escáner con lista temporal, selección por checkbox y guardado conjunto de fotos en el bloque.
- Metadatos preparados para detección futura por IA de tema/subtema cuando el alumno los deja vacíos.
- Tipos de material separados para `examen_oficial` y `examen_no_oficial`, con prioridad de entrenamiento futura.
- Estado `activeView` reforzado para que cada submenú se abra como vista propia y oculte por completo el panel principal.
- Interfaz más limpia: textos largos movidos a ayudas contextuales con modal `ℹ️`.
- Rediseño visual premium con fondo suave, tarjetas de acción más atractivas, resumen del bloque y gamificación ligera.
- Regla de apoyo visual inteligente: `required`, `optional` o `none`, con estado guardado en simulación sin generar imágenes reales.
- Opcion preparada para generar material desde archivos/fotos subidas del bloque, sin OCR ni analisis real.
- Placeholders visuales para dibujos/esquemas y badges de trazabilidad de fuente.
- Curso personalizado simulado.
- Flashcards y simulacros simulados.
- Accesos visibles restaurados para Flashcards y Simulacro en la pantalla principal.
- Persistencia local con `localStorage`.
- Servicios JS preparados para futura IA real.
- Prompts internos para Estudios PRO, Juan, Carlota🥰 y Gonzalo.

### Pendientes

- Conectar IA real mediante backend.
- Leer y analizar archivos subidos.
- Sustituir `localStorage` por persistencia segura con usuarios.
- Convertir Carlota🥰 en agente funcional completo.
- Convertir Gonzalo en agente funcional completo.
- Añadir tests automatizados.
- Preparar despliegue web.

### Nota de desarrollo

- Tras cambios en JavaScript o modulos ES, puede ser necesaria una recarga completa del navegador para evitar cache local.
