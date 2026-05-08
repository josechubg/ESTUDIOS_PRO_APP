# DISEÑO FUNCIONAL APP — ESTUDIOS PRO

## Proposito

Definir el MVP multiagente de Estudios PRO como una app educativa local, simulada y sin IA real. La prioridad es validar si la experiencia ayuda a estudiar mejor antes de invertir en backend, modelos de IA, lectura real de archivos y cuentas de usuario.

## Alcance del MVP

El MVP incluye:

- Dashboard multiagente.
- Vista general del agente activo.
- Estructura dinamica de alumnos, cursos, asignaturas y subbloques desde `03_APP/data/studyStructure.js`.
- Modo foco por agente, curso y asignatura.
- Juan completo simulado.
- Carlota🥰 y Gonzalo preparados como estructuras funcionales iniciales.
- Chat educativo simulado.
- Errores frecuentes y memoria avanzada de errores por bloque.
- Flashcards.
- Simulacros.
- Curso personalizado simulado.
- Subida simulada de archivos por alumno, curso, asignatura y subbloque.
- Persistencia local con `localStorage`.

El MVP no incluye:

- IA real.
- Backend.
- Autenticacion.
- Base de datos remota.
- Sincronizacion entre dispositivos.
- Analisis real del contenido de archivos.
- Guardado del contenido completo de archivos.

## Agentes

### Juan

- Nivel: 1º y 2º Bachillerato.
- Centro: Colegio La Inmaculada Franciscanos, Cartagena.
- Foco: examenes del colegio y PAU Region de Murcia.
- Estado MVP: completo simulado.
- Funciones: cursos, asignaturas, subbloques de Lengua, chat, errores, flashcards, simulacros y curso personalizado.

### Carlota🥰

- Nivel: Medicina UCV.
- Cursos: 1º a 6º.
- Foco: test avanzado, alta dificultad, apuntes, simulacros y errores frecuentes.
- Estado MVP: preparada.
- Funciones: cursos, asignaturas y datos simulados iniciales.

### Gonzalo

- Nivel: ESO.
- Cursos: 1º a 4º.
- Foco: aprendizaje guiado, practica progresiva y refuerzo de errores.
- Estado MVP: preparado.
- Funciones: cursos, asignaturas y datos simulados iniciales.

## Vista general

La vista general es el tablero principal del agente activo. Debe permitir entender de un vistazo:

- quien es el agente activo;
- que curso y asignatura estan seleccionados;
- que modo de estudio esta activo;
- que metricas simuladas existen;
- que errores frecuentes hay;
- que flashcards y simulacros se sugieren;
- que progreso y repasos aparecen.

Esta vista no debe prometer inteligencia real. Todos los datos son de validacion y simulacion.

## Estructura de estudio

Los cursos, asignaturas y subbloques se definen en `03_APP/data/studyStructure.js`.

La UI debe leer de esa estructura para:

- actualizar cursos al cambiar de alumno;
- actualizar asignaturas al cambiar de curso;
- actualizar bloques al cambiar de asignatura;
- conservar el ultimo contexto activo en `localStorage` siempre que siga existiendo;
- corregir automaticamente el contexto si una estructura cambia.

## Modo foco

El modo foco es la experiencia de trabajo concreta. Se activa al elegir:

1. Agente.
2. Curso.
3. Asignatura.
4. Subbloque, si aplica.
5. Modo de estudio.

En Juan/Lengua, los subbloques son:

- Literatura.
- Analisis gramatical.
- Comentario de texto.
- Sintaxis.
- Morfologia.
- PAU Lengua.

El foco debe condicionar chat, errores, flashcards, simulacros y curso personalizado.

## Persistencia local

La app debe usar `localStorage` como persistencia del prototipo.

Debe conservar como minimo:

- agente activo;
- curso seleccionado;
- asignatura seleccionada;
- subbloque activo cuando aplique;
- modo de estudio;
- chat;
- errores frecuentes;
- flashcards;
- cursos personalizados;
- simulacros;
- archivos o referencias de archivos del prototipo.

## Archivos de asignatura

La app debe permitir seleccionar archivos desde el ordenador y asociarlos al contexto educativo activo:

- alumno activo;
- curso activo;
- asignatura activa;
- subbloque activo, si existe.

En el MVP solo se guardan metadatos en `localStorage`, en la clave `estudiosProFiles`:

- `id`;
- `fileName`;
- `mimeType`;
- `sizeBytes`;
- `uploadedAt`;
- `studentId`;
- `courseId`;
- `subjectId`;
- `subblockId`;
- `status`.

El listado visible debe filtrarse por el contexto activo. Al cambiar de asignatura o subbloque, no deben mostrarse archivos de otros bloques.

Cada archivo puede eliminarse del listado local. Esta accion solo borra los metadatos guardados en el navegador.

Esta persistencia es solo local al navegador. No debe tratarse como memoria segura, historico definitivo ni informacion sincronizada.

## Memoria de errores

La memoria de errores se guarda en `estudiosProErrorMemory` y queda asociada al contexto activo:

- alumno;
- curso;
- asignatura;
- subbloque.

Cada error conserva titulo, descripcion, tipo, dificultad, fecha de creacion, ultima revision, numero de repasos y estado. La UI permite registrar errores, marcarlos como repasados, marcarlos como superados y eliminarlos sin mezclar datos entre alumnos o bloques.

## Comportamiento simulado

El chat, las recomendaciones, los simulacros, las flashcards, los planes personalizados y las metricas deben entenderse como simulaciones de producto.

Las respuestas no proceden de un modelo de IA real. La subida de archivos no analiza contenido ni guarda el archivo completo. Cualquier texto de "correccion", "plan", "repaso" o "recomendacion" sirve para validar experiencia, tono y flujo.

## Criterios de aceptacion

- La app permite cambiar entre Juan, Carlota🥰 y Gonzalo.
- La app permite seleccionar curso y asignatura segun agente.
- La app alimenta los selectores desde la estructura dinamica de datos.
- Juan ofrece una experiencia completa simulada.
- Carlota🥰 y Gonzalo aparecen preparados, pero no se presentan como completos.
- La vista general resume el estado de estudio.
- El modo foco orienta la experiencia a curso/asignatura.
- `localStorage` conserva el estado principal.
- Los archivos se listan solo en su alumno, curso, asignatura y subbloque.
- No hay mensajes que prometan IA real, analisis real de archivos o sincronizacion.
