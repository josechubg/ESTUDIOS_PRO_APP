# MVP JUAN — DISEÑO FUNCIONAL

## Objetivo
Crear una version MVP completa simulada del agente Juan para Bachillerato y PAU, suficientemente completa para validar la experiencia de estudio antes de conectar IA real, backend y lectura avanzada de archivos.

Juan vive dentro del MVP multiagente de Estudios PRO. Es el agente prioritario y el unico que debe considerarse completo en esta fase, aunque todo su comportamiento sigue siendo simulado.

## Flujo principal
1. Entrar en Juan.
2. Elegir curso: 1º Bachillerato o 2º Bachillerato.
3. Elegir asignatura.
4. Subir archivos.
5. Elegir modo de estudio:
   - Estudio programado.
   - Estudio ultrarrápido.
6. Chatear con el agente.
7. Generar ejercicios.
8. Corregir respuestas.
9. Guardar errores frecuentes.
10. Proponer refuerzo.
11. Crear flashcards.
12. Lanzar simulacros.
13. Crear curso personalizado.

## Vista general y modo foco

### Vista general

Debe mostrar el estado global de Juan:

- metricas simuladas;
- curso activo;
- asignatura activa;
- acciones de estudio;
- chat;
- errores frecuentes;
- flashcards;
- simulacros;
- progreso;
- agenda de repasos.

### Modo foco

Debe permitir trabajar en un contexto concreto:

- Juan -> curso -> asignatura.
- Si la asignatura es Lengua: Juan -> curso -> Lengua -> subbloque.
- Todo chat, error, flashcard, simulacro o curso personalizado debe entenderse dentro de ese foco.

## Pantallas o bloques necesarios

### 1. Selector multiagente

- Juan.
- Carlota🥰.
- Gonzalo.

Aunque Juan sea el foco funcional, debe convivir con los otros agentes dentro del dashboard general.

### 2. Panel de Juan

- 1º Bachillerato.
- 2º Bachillerato.
- Modo PAU como orientacion academica.

### 3. Asignaturas
Cada curso tendrá asignaturas activables.

Ejemplo inicial:
- Dibujo Técnico
- Matemáticas
- Física y Química
- Lengua
- Inglés

#### Lengua por subbloques
Lengua se divide en subbloques para trabajar de forma más específica:
- Literatura
- Análisis gramatical
- Comentario de texto
- Sintaxis
- Morfología
- PAU Lengua

### 4. Bloque de asignatura
Dentro de cada asignatura:
- Subir archivos
- Chat de estudio
- Ejercicios
- Corrección
- Flashcards
- Simulacros
- Errores frecuentes
- Progreso
- Curso personalizado

### 5. Chat educativo
El agente debe responder:
- breve
- claro
- exigente
- centrado en lo preguntado
- usando primero archivos subidos

En el MVP actual, el chat es simulado y no consulta IA real ni analiza archivos. Sirve para validar tono, flujo y utilidad educativa.

### 6. Memoria de errores
Guardar:
- asignatura
- tema
- pregunta
- respuesta del alumno
- error detectado
- explicación correcta
- ejercicio de refuerzo
- estado: pendiente / mejorando / superado

La memoria de errores del MVP es basica y se apoya en `localStorage`. En fases futuras debe evolucionar a memoria persistente por usuario.

### 7. Crear curso personalizado
Función global para generar un curso de estudio simulado adaptado al alumno.

Debe permitir introducir:
- tema
- duración
- tiempo diario
- nivel actual
- objetivo
- examen cercano sí/no

El curso personalizado debe generar:
- plan por días
- objetivos diarios
- ejercicios
- flashcards
- errores a vigilar
- repaso final

### 8. Flashcards
Las flashcards deben ayudar a repasar conceptos clave:
- pregunta breve
- respuesta clara
- asignatura o subbloque
- dificultad
- estado de repaso

En el MVP pueden ser simuladas o generadas desde datos predefinidos.

### 9. Simulacros
Los simulacros deben servir para practicar bajo formato de examen:
- seleccion de asignatura
- tipo de prueba
- preguntas o ejercicios
- correccion orientativa
- errores detectados
- recomendaciones de repaso

En el MVP son simulados y orientados a validar la experiencia.

## MVP actual
La version actual debe considerarse un MVP Juan completo simulado dentro de una app multiagente:

- Permitir elegir Juan desde el menu multiagente.
- Elegir asignatura.
- Subir archivos.
- Chat simulado.
- Guardar errores manualmente o semiautomático.
- Lengua por subbloques.
- Curso personalizado simulado.
- Memoria de errores básica.
- Flashcards.
- Simulacros.
- Persistencia local con `localStorage`.

## Estado local minimo

Juan debe conservar localmente:

- agente activo;
- curso;
- asignatura;
- subbloque de Lengua;
- chat;
- errores frecuentes;
- flashcards visibles o derivadas del foco;
- cursos personalizados generados;
- simulacros visibles o derivados del foco;
- archivos seleccionados en el prototipo.

## Limitaciones
- No hay IA real.
- La subida de archivos no lee ni interpreta contenido.
- El chat responde con mensajes simulados.
- La memoria no esta sincronizada entre dispositivos.
- No hay backend ni autenticacion.
