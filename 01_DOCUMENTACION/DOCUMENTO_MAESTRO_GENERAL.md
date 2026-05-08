# DOCUMENTO MAESTRO GENERAL — ESTUDIOS PRO

## Objetivo
Crear una web app educativa con agentes de estudio personalizados para ayudar a estudiar, resolver dudas, practicar examenes y reducir errores repetidos.

La vision final contempla IA real, lectura de archivos, memoria persistente y seguimiento avanzado. La version actual es un MVP multiagente sin IA real: usa datos simulados, chat simulado y almacenamiento local con `localStorage`.

## Estado actual del MVP

- Producto: Estudios PRO App.
- Tipo: prototipo local navegable.
- Stack: HTML, CSS y JavaScript vanilla.
- Backend: no existe.
- IA real: no existe.
- Persistencia: `localStorage`.
- Agentes visibles: Juan, Carlota🥰 y Gonzalo.
- Agente completo simulado: Juan.
- Agentes preparados: Carlota🥰 y Gonzalo.

## Agentes
1. Juan — Bachillerato / PAU Region de Murcia.
2. Carlota🥰 — Medicina UCV.
3. Gonzalo — ESO.

## Prioridad
1. Juan.
2. Carlota🥰.
3. Gonzalo.

## Estructura funcional

Alumno/agente -> Curso -> Asignatura -> Modo foco -> Chat -> Errores -> Flashcards -> Simulacros -> Curso personalizado -> Progreso.

La app debe permitir dos lecturas:

- Vista general: resumen operativo del agente activo, cursos, asignaturas, metricas simuladas, acciones de estudio y seguimiento.
- Modo foco: trabajo concreto por agente, curso y asignatura. En Juan/Lengua, el foco baja a subbloque.

## Alcance por agente

### Juan
- Agente principal del MVP amplio.
- Cursos: 1º y 2º Bachillerato.
- Enfoque: examenes del colegio, PAU Region de Murcia, asignaturas, Lengua por subbloques y refuerzo de errores.
- Estado: completo simulado.
- Funciones actuales: chat simulado, flashcards, simulacros, errores frecuentes, alta manual de errores y curso personalizado simulado.

### Carlota🥰
- Estructura preparada para Medicina en la Universidad Catolica de Valencia.
- Cursos previstos: 1º a 6º.
- Enfoque: test avanzado, apuntes, dificultad alta, simulacros, errores frecuentes y asignaturas simuladas por curso.
- Estado: preparada como estructura de producto, pendiente de desarrollo funcional profundo.

### Gonzalo
- Estructura preparada para ESO.
- Cursos previstos: 1º a 4º.
- Enfoque: aprendizaje guiado, explicaciones paso a paso, ejercicios progresivos, simulacros adaptados y errores frecuentes.
- Estado: preparado como estructura de producto, pendiente de desarrollo funcional profundo.

## Modos de estudio
1. Estudio programado.
2. Estudio ultrarrapido antes del examen.
3. Curso personalizado.
4. Flashcards.
5. Simulacros.

## Persistencia local esperada

El MVP debe conservar en `localStorage` el estado necesario para que el prototipo no se reinicie en cada interaccion:

- Agente activo.
- Curso seleccionado.
- Asignatura seleccionada.
- Chat.
- Errores frecuentes.
- Flashcards.
- Cursos personalizados.
- Simulacros.
- Archivos o referencias de archivos del prototipo.

Esta persistencia es local al navegador. No debe presentarse como memoria real de usuario, base de datos, backup ni sincronizacion.

## Regla de fuentes
1. Archivos subidos por el usuario.
2. Fuentes oficiales del centro/universidad.
3. Normativa oficial.
4. Modelos oficiales de examen.
5. Fuentes fiables.
6. Redes sociales cualificadas solo como orientación secundaria.

## Reglas educativas
- No inventar.
- No dar la razon si el alumno esta equivocado.
- Responder breve, claro y al concepto preguntado.
- Adaptar la respuesta al nivel.
- Guardar errores frecuentes.
- Proponer ejercicios de refuerzo.

## Limitaciones actuales del MVP
- No hay IA real.
- El chat es simulado.
- La subida de archivos no analiza contenido.
- `localStorage` es la persistencia principal del prototipo.
- No hay backend, autenticacion, base de datos remota ni sincronizacion entre dispositivos.
- Carlota🥰 y Gonzalo usan asignaturas simuladas y estructura preparada, no agentes completos.
