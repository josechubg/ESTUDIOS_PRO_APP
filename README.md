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
- Errores frecuentes.
- Memoria avanzada de errores con tipo, dificultad, estado y repasos.
- Flashcards simuladas.
- Simulacros simulados.
- Curso personalizado simulado.
- Persistencia local con `localStorage`.
- Servicios JS preparados para futura conexion de IA.

## Preparacion para IA real

La app mantiene respuestas simuladas, pero ya separa la logica principal en servicios:

- `03_APP/services/storageService.js`: persistencia local.
- `03_APP/services/aiService.js`: chat simulado y payload futuro para GPT.
- `03_APP/services/errorMemoryService.js`: memoria avanzada de errores por bloque en `estudiosProErrorMemory`.
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

## Proximos pasos

1. Conectar IA real mediante backend.
2. Leer y analizar archivos subidos.
3. Convertir Carlota🥰 y Gonzalo en agentes funcionales completos.
4. Añadir autenticacion, base de datos y memoria persistente.
