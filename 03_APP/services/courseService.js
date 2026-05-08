export function buildCoursePlan({ agentName, area, topic, duration, dailyTime, level, goal, nearExam }) {
  const examText = nearExam === "Si" ? "con repaso final de examen cercano" : "con refuerzo progresivo";
  const days = [
    ["Dia 1", "Diagnosticar nivel", "Teoria minima del bloque", "Mini prueba inicial", "Conceptos base", "Errores de partida"],
    ["Dia 2", "Entender lo imprescindible", "Reglas y ejemplos clave", "Ejercicios guiados", "Definiciones", "Confundir conceptos parecidos"],
    ["Dia 3", "Practicar aplicacion", "Metodo paso a paso", "Serie tipo examen", "Procedimiento", "Saltarse justificacion"],
    ["Dia 4", "Corregir fallos", "Criterios de correccion", "Rehacer errores", "Errores personales", "Responder sin comprobar"],
    ["Dia 5", "Subir dificultad", "Casos dudosos", "Simulacro parcial", "Preguntas probables", "Mala gestion del tiempo"],
    ["Dia 6", "Consolidar memoria", "Resumen activo", "Flashcards y mixtos", "Checklist", "Olvidar pasos clave"],
    ["Dia 7", "Repaso final", "Mapa final", "Simulacro breve", "Ultimas tarjetas", "Repetir fallos ya vistos"],
  ];

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: `Curso de ${duration}, ${dailyTime}, de ${topic.toLowerCase()} adaptado al nivel del alumno.`,
    summary: `Alumno: ${agentName}. Area: ${area}. Nivel: ${level}. Objetivo: ${goal}. Plan simulado ${examText}.`,
    days: days.map(([day, objective, theory, exercises, flashcards, errors]) => ({
      day,
      objective,
      theory,
      exercises,
      flashcards,
      errors,
    })),
    review: ["Releer errores frecuentes.", "Repetir ejercicios fallados.", "Cerrar con checklist y simulacro breve."],
  };
}

export function createMockForArea({ area, studyData }) {
  const mock = studyData.mocks[0];
  return {
    title: mock[0],
    description: mock[1],
    area,
    createdAt: new Date().toISOString(),
  };
}
