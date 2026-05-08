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
- Botones de subir archivos, estudio programado y estudio ultrarrapido.
- Chat educativo simulado.
- Flashcards.
- Simulacros.
- Panel de errores frecuentes.
- Alta manual de nuevos errores por asignatura.
- Creacion simulada de curso personalizado con plan por dias, objetivos, ejercicios, flashcards, errores a vigilar y repaso final.
- Persistencia local con `localStorage`.

## Servicios JS preparados

- `services/storageService.js`: `localStorage`.
- `services/aiService.js`: respuestas simuladas y punto futuro de IA real.
- `services/errorMemoryService.js`: errores frecuentes.
- `services/courseService.js`: cursos personalizados y simulacros.
- `services/flashcardService.js`: flashcards simuladas.
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

El estado local cubre:

- Agente activo.
- Curso seleccionado por agente.
- Asignatura seleccionada por agente.
- Subbloque de Lengua cuando aplica.
- Modo de estudio activo.
- Chat por agente.
- Errores frecuentes por agente.
- Archivos seleccionados en el prototipo.
- Curso personalizado generado.
- Datos operativos de flashcards y simulacros derivados del estado activo.

En terminos de producto, la persistencia esperada para la fase es agente/curso/asignatura/chat/errores/flashcards/cursos/simulacros. Tecnicamente, parte de flashcards y simulacros procede de bancos simulados y se re-renderiza segun agente, curso y asignatura.

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
- Memoria de errores basica apoyada en almacenamiento local.

## Limitaciones actuales

- No hay IA real.
- La subida de archivos solo muestra o registra nombres; no analiza contenido real.
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
