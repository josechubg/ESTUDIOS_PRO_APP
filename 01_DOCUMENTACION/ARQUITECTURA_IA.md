# ARQUITECTURA IA - ESTUDIOS PRO

## Estado actual

Estudios PRO no conecta IA real todavia. El MVP mantiene una simulacion local para validar producto, interfaz, memoria de errores, flashcards, simulacros y cursos personalizados sin usar claves API.

La interfaz estable visual v1 no debe cambiarse para esta fase. La preparacion se concentra en servicios JavaScript y documentacion.

## Servicios de la app

- `03_APP/data/studyStructure.js`: estructura dinamica de alumnos, cursos, asignaturas y subbloques.
- `03_APP/services/storageService.js`: lectura, guardado y borrado del estado en `localStorage`.
- `03_APP/services/aiService.js`: punto unico para chat simulado y futura conexion GPT.
- `03_APP/services/errorMemoryService.js`: memoria avanzada de errores por contexto en `estudiosProErrorMemory`.
- `03_APP/services/adaptiveTrainingService.js`: entrenamiento recomendado simulado basado en errores guardados.
- `03_APP/services/courseService.js`: cursos personalizados y simulacros simulados.
- `03_APP/services/flashcardService.js`: generacion de flashcards simuladas.
- `03_APP/services/fileStorageService.js`: metadatos de archivos por bloque en `estudiosProFiles`.
- `03_APP/config.example.js`: ejemplo de configuracion sin claves reales.
- `03_APP/.env.example`: plantilla de variables de entorno sin claves reales.

## Conexion futura con GPT

La app no debe llamar a GPT directamente desde el navegador. El flujo recomendado es:

1. La UI envia a `aiService.js` el alumno, curso, asignatura, bloque, modo, mensaje, archivos disponibles y memoria de errores.
2. `aiService.js` construye un payload limpio con contexto educativo y prioridad de fuentes.
3. Un backend seguro recibe el payload.
4. El backend incorpora prompts internos desde `02_PROMPTS/`.
5. El backend llama al proveedor de IA usando claves en variables de entorno.
6. El backend devuelve respuesta, ejercicios, errores detectados, flashcards sugeridas o plan de estudio.
7. La app guarda los resultados relevantes en `localStorage` durante el MVP y, mas adelante, en base de datos.

## Uso de archivos subidos

En el MVP actual la subida de archivos es simulada. Solo se guardan metadatos en `localStorage`, en la clave `estudiosProFiles`, asociados a:

- alumno;
- curso;
- asignatura;
- subbloque;
- fecha;
- tipo;
- tamaño;
- estado.

No se guarda el contenido completo del archivo y no se procesan PDFs todavia.

Los archivos reales del alumno no deben subirse a GitHub. Cuando exista backend, deberan guardarse en almacenamiento privado y con controles de acceso.

En la version con IA real:

1. El archivo se enviara al backend.
2. El backend guardara el fichero o lo procesara en una zona segura.
3. El backend extraera texto y metadatos.
4. El contenido se fragmentara por asignatura, bloque, fecha, curso y alumno.
5. Los fragmentos quedaran asociados al mismo contexto educativo usado por el MVP.
6. La IA respondera primero con base en esos fragmentos.
7. Si falta informacion, la IA debera decirlo y pedir el archivo o fuente necesaria.

Los archivos del alumno seran la fuente principal para examenes concretos, apuntes del profesor, criterios de correccion y temas dados en clase.

## Prioridad de fuentes

Orden obligatorio:

1. Archivos subidos por el usuario.
2. Fuentes oficiales del centro o universidad.
3. Curriculo oficial, normativa o guias docentes.
4. Modelos oficiales de examen.
5. Fuentes fiables.
6. Redes sociales cualificadas solo como orientacion secundaria.

Si una respuesta depende de una fuente no disponible, la app debe indicarlo con claridad.

## Memoria de errores

La memoria de errores se separa por alumno, curso, asignatura y bloque. En el MVP se guarda en `localStorage` con la clave `estudiosProErrorMemory`.

Debe guardar:

- Titulo y descripcion del error.
- Tipo: conceptual, calculo, comprension lectora, memoria, procedimiento, expresion escrita u otro.
- Dificultad: baja, media o alta.
- Estado: pendiente, en repaso o superado.
- Fecha de deteccion.
- Ultima fecha de repaso.
- Numero de repasos.

Uso previsto:

1. El alumno responde o pregunta.
2. La IA detecta un fallo conceptual, procedimental o de expresion.
3. El error se propone para guardar.
4. El panel de errores prioriza los errores del area activa.
5. Los futuros ejercicios y flashcards atacan esos errores.

## Entrenamiento adaptativo

En modo simulacion, `adaptiveTrainingService.js` analiza errores del bloque activo y genera recomendaciones sin IA real.

Reglas actuales:

- Muchos errores conceptuales: repaso teorico y flashcards.
- Errores de procedimiento: ejercicios paso a paso.
- Errores de memoria: flashcards.
- Errores de comprension lectora: explicacion guiada.
- Errores de calculo: ejercicios cortos repetidos.
- Dificultad alta predominante: mini-simulacro especifico.

## Como evitar inventar respuestas

Reglas de seguridad educativa:

- No afirmar datos no presentes en archivos o fuentes fiables.
- Distinguir entre respuesta segura, inferencia y orientacion.
- Pedir mas informacion si el enunciado o el archivo no bastan.
- Corregir al alumno cuando este equivocado.
- Responder solo al concepto preguntado antes de ampliar.
- No fabricar criterios de un centro, universidad o PAU si no estan disponibles.
- En modo examen, avisar cuando una respuesta sea incompleta o no justificable.

## Estado de configuracion

`03_APP/config.example.js` define la forma futura:

- `AI_PROVIDER`
- `MODEL_NAME`
- `API_MODE`
- `USE_LOCAL_SIMULATION`

No contiene claves reales. Cualquier clave API debe vivir en backend mediante variables de entorno.

La guia de seguridad especifica esta en `01_DOCUMENTACION/SEGURIDAD_API_KEYS.md`.
