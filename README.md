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
- Errores frecuentes.
- Flashcards simuladas.
- Simulacros simulados.
- Curso personalizado simulado.
- Persistencia local con `localStorage`.
- Servicios JS preparados para futura conexion de IA.

## Preparacion para IA real

La app mantiene respuestas simuladas, pero ya separa la logica principal en servicios:

- `03_APP/services/storageService.js`: persistencia local.
- `03_APP/services/aiService.js`: chat simulado y payload futuro para GPT.
- `03_APP/services/errorMemoryService.js`: memoria de errores.
- `03_APP/services/courseService.js`: cursos personalizados y simulacros.
- `03_APP/services/flashcardService.js`: flashcards.

Tambien existe `03_APP/config.example.js` como plantilla sin claves reales. La conexion GPT futura debera hacerse mediante backend seguro, no desde el navegador.

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
│   └── services/
├── 04_DATOS_PRUEBA/
├── CHANGELOG.md
└── README.md
```

## Documentacion clave

- `01_DOCUMENTACION/DOCUMENTO_MAESTRO_GENERAL.md`
- `01_DOCUMENTACION/DISEÑO_FUNCIONAL_APP.md`
- `01_DOCUMENTACION/ARQUITECTURA_IA.md`
- `01_DOCUMENTACION/VERSION_ESTABLE_VISUAL_V1.md`
- `01_DOCUMENTACION/ROADMAP.md`
- `01_DOCUMENTACION/JUAN_DOCUMENTO_MAESTRO.md`
- `01_DOCUMENTACION/JUAN_MVP_FUNCIONAL.md`

## Limitaciones actuales

- No hay IA real todavia.
- No hay claves API.
- No hay backend.
- La subida de archivos esta simulada.
- El chat responde con mensajes simulados.
- `localStorage` no es memoria segura ni sincronizada.

## Proximos pasos

1. Conectar IA real mediante backend.
2. Leer y analizar archivos subidos.
3. Convertir Carlota🥰 y Gonzalo en agentes funcionales completos.
4. Añadir autenticacion, base de datos y memoria persistente.
