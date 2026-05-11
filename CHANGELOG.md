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
- Módulo `Generar material` ampliado con fuentes por tema, subtema, contenido pegado o archivos/fotos del bloque y tipos: resumen, flashcards, simulacro, conceptos clave, errores frecuentes o pack completo.
- Impresión del material generado mediante `window.print()`, con vista limpia para guardar como PDF desde el navegador.
- Historial de materiales generados por bloque con filtro por tipo, abrir, imprimir/PDF y eliminar.
- Jerarquia visual por niveles con paleta adolescente elegante: azul-violeta para secciones, lavanda para apartados y azul palido para tarjetas internas.
- Pantalla principal replanteada con el chat del profesor IA como centro y herramientas agrupadas por Material, Entrenamiento, Seguimiento y Organizacion.
- Dashboard principal ajustado para dar mas protagonismo al chat IA, con herramientas compactas y chips rapidos bajo la conversacion.
- Chat principal ampliable a pantalla completa con acciones simuladas por respuesta: guardar, resumir, crear flashcards, crear preguntas, marcar concepto difícil y apoyo visual.
- Nueva memoria local de conceptos difíciles por bloque, con creación de flashcards y preguntas desde esos conceptos.
- Planificador de Estudio Adaptativo con calendario mes/semana/día, eventos manuales, planes automáticos, reflexión, adaptación dinámica y estadísticas en `localStorage`.
- Calendario del planificador mejorado con resumen del periodo, lista de eventos visibles, eventos multiday, duración opcional y colores por tipo.
- Planificación bajo demanda: modo dudas por defecto, próximos eventos secundarios y propuestas de planificación que solo se guardan al confirmar.
- Planificador flexible con modos express, programado, periodos especiales y "Qué estudio ahora".
- Subida de calendario foto/PDF como metadato pendiente de IA real y creación manual de eventos desde esa referencia.
- Chat con foto adjunta desde cámara o galería como metadato y sección de material visual pendiente para dudas visuales.
- Bandeja de material para centralizar fotos, archivos, PDFs, calendarios, respuestas del chat, materiales generados y conceptos difíciles.
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
