export const PLANNER_KEY = "estudiosProPlanner";

const DEFAULT_DATA = {
  eventos: [],
  planes: [],
};

function createId(prefix = "planner") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readPlanner() {
  try {
    return { ...DEFAULT_DATA, ...(JSON.parse(localStorage.getItem(PLANNER_KEY)) || {}) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writePlanner(data) {
  localStorage.setItem(PLANNER_KEY, JSON.stringify(data));
}

function sameContext(evento, context) {
  return (
    evento.alumno === context.studentId &&
    evento.curso === context.courseId &&
    evento.asignatura === context.subjectId &&
    (evento.bloque || "") === (context.blockId || "")
  );
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function isoLocal(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateOnly(value) {
  return String(value || "").slice(0, 10);
}

function createEvent(data, context) {
  return {
    id: data.id || createId("event"),
    alumno: context.studentId,
    curso: data.curso || context.courseId,
    asignatura: data.asignatura || context.subjectId,
    bloque: data.bloque ?? context.blockId ?? "",
    tipo: data.tipo || "estudio",
    titulo: data.titulo || "Sesión de estudio",
    descripcion: data.descripcion || "",
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin || "",
    durationMinutes: data.durationMinutes || 0,
    allDay: Boolean(data.allDay),
    prioridad: data.prioridad || "media",
    estado: data.estado || "pendiente",
    repeticiones: data.repeticiones || [],
    reflexion: data.reflexion || null,
    planId: data.planId || "",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getPlannerData() {
  return readPlanner();
}

export function getEventsByContext(context) {
  return readPlanner().eventos.filter((evento) => sameContext(evento, context));
}

export function getPlansByContext(context) {
  return readPlanner().planes.filter((plan) => sameContext(plan, context));
}

export function addPlannerEvent(data, context) {
  const planner = readPlanner();
  const evento = createEvent(data, context);
  planner.eventos = [evento, ...planner.eventos];
  writePlanner(planner);
  return evento;
}

export function updatePlannerEvent(eventId, updates) {
  const planner = readPlanner();
  planner.eventos = planner.eventos.map((evento) => (evento.id === eventId ? { ...evento, ...updates, updatedAt: new Date().toISOString() } : evento));
  writePlanner(planner);
  return planner.eventos.find((evento) => evento.id === eventId);
}

export function deletePlannerEvent(eventId) {
  const planner = readPlanner();
  planner.eventos = planner.eventos.filter((evento) => evento.id !== eventId);
  writePlanner(planner);
}

export function movePlannerEvent(eventId, newDate) {
  const planner = readPlanner();
  const target = planner.eventos.find((evento) => evento.id === eventId);
  if (!target) return null;
  const start = new Date(target.fechaInicio);
  const end = target.fechaFin ? new Date(target.fechaFin) : null;
  const duration = Math.max(0, Math.round(((end || start) - start) / 60000) || Number(target.durationMinutes || 0));
  const nextStart = new Date(`${newDate}T${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`);
  const updates = { fechaInicio: isoLocal(nextStart) };
  if (target.fechaFin && duration > 0) updates.fechaFin = isoLocal(addMinutes(nextStart, duration));
  return updatePlannerEvent(eventId, updates);
}

export function completePlannerEvent(eventId, reflection = {}) {
  const planner = readPlanner();
  const event = planner.eventos.find((evento) => evento.id === eventId);
  if (!event) return { event: null, created: [] };
  const completed = {
    ...event,
    estado: "completado",
    reflexion: {
      entendido: reflection.entendido || "",
      repasar: reflection.repasar || "",
      dificultad: reflection.dificultad || "media",
      completedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
  planner.eventos = planner.eventos.map((evento) => (evento.id === eventId ? completed : evento));

  const created = [];
  if (reflection.dificultad === "dificil" || String(reflection.repasar || "").trim()) {
    [1, 3].forEach((days, index) => {
      const base = new Date(completed.fechaInicio);
      base.setDate(base.getDate() + days);
      const start = new Date(base);
      start.setHours(18 + index, 0, 0, 0);
      const extra = createEvent(
        {
          tipo: index === 0 ? "repaso" : "practica",
          titulo: `${index === 0 ? "Repaso extra" : "Práctica extra"} · ${completed.titulo}`,
          descripcion: reflection.repasar || "Refuerzo adaptativo por dificultad percibida.",
          fechaInicio: isoLocal(start),
          fechaFin: isoLocal(addMinutes(start, 30)),
          prioridad: "alta",
          estado: "pendiente",
          planId: completed.planId,
        },
        {
          studentId: completed.alumno,
          courseId: completed.curso,
          subjectId: completed.asignatura,
          blockId: completed.bloque,
        }
      );
      created.push(extra);
    });
    planner.eventos = [...created, ...planner.eventos];
  }

  writePlanner(planner);
  return { event: completed, created };
}

function normalizeBlocks(raw) {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateAutomaticPlan(params, context, options = {}) {
  const shouldSave = options.save !== false;
  const planner = readPlanner();
  const createdAt = new Date().toISOString();
  const planId = createId("plan");
  const today = new Date();
  today.setHours(17, 0, 0, 0);
  const exam = new Date(`${params.fechaExamen}T09:00`);
  const daysAvailable = Math.max(1, Math.ceil((exam - today) / 86400000));
  const dailyMinutes = Number(params.tiempoDiario || 60);
  const sessionMinutes = dailyMinutes >= 60 ? 30 : 20;
  const blocks = normalizeBlocks(params.bloqueTema).length ? normalizeBlocks(params.bloqueTema) : [params.bloqueTema || context.blockName || "bloque activo"];
  const spacing = [0, 2, 6, 13, 20, 27].filter((day) => day < daysAvailable);
  const events = [];

  spacing.forEach((dayOffset, index) => {
    const block = blocks[index % blocks.length];
    const start = new Date(today);
    start.setDate(today.getDate() + dayOffset);
    start.setHours(17 + (index % 3), 0, 0, 0);
    const tipo = index % 3 === 0 ? "estudio" : index % 3 === 1 ? "repaso" : "practica";
    events.push(
      createEvent(
        {
          tipo,
          titulo: `${tipo === "estudio" ? "Estudiar" : tipo === "repaso" ? "Repasar" : "Practicar"} · ${block}`,
          descripcion: `Plan automático con espaciado, recuperación e intercalación. Objetivo: ${params.objetivo}.`,
          fechaInicio: isoLocal(start),
          fechaFin: isoLocal(addMinutes(start, sessionMinutes)),
          prioridad: index < 2 ? "alta" : "media",
          planId,
          repeticiones: spacing.slice(index + 1, index + 3),
        },
        context
      )
    );
  });

  [Math.max(1, daysAvailable - 7), Math.max(1, daysAvailable - 2)].forEach((dayOffset, index) => {
    const start = new Date(today);
    start.setDate(today.getDate() + dayOffset);
    start.setHours(18, 0, 0, 0);
    events.push(
      createEvent(
        {
          tipo: "simulacro",
          titulo: `${index === 0 ? "Simulacro parcial" : "Simulacro final"} · ${params.asignatura}`,
          descripcion: "Práctica de recuperación con formato de examen.",
          fechaInicio: isoLocal(start),
          fechaFin: isoLocal(addMinutes(start, 45)),
          prioridad: "alta",
          planId,
        },
        context
      )
    );
  });

  if (params.incluirDescansos) {
    const start = new Date(today);
    start.setDate(today.getDate() + Math.min(5, daysAvailable));
    start.setHours(19, 30, 0, 0);
    events.push(createEvent({ tipo: "ocio", titulo: "Descanso planificado", descripcion: "Descanso para consolidar y evitar saturación.", fechaInicio: isoLocal(start), fechaFin: isoLocal(addMinutes(start, 40)), prioridad: "normal", planId }, context));
  }

  if (params.incluirEjercicio) {
    const start = new Date(today);
    start.setDate(today.getDate() + Math.min(3, daysAvailable));
    start.setHours(19, 0, 0, 0);
    events.push(createEvent({ tipo: "ejercicio", titulo: "Ejercicio ligero", descripcion: "Hábito saludable para mejorar atención y descanso.", fechaInicio: isoLocal(start), fechaFin: isoLocal(addMinutes(start, 30)), prioridad: "normal", planId }, context));
  }

  events.push(
    createEvent(
      {
        tipo: "examen",
        titulo: `Examen · ${params.asignatura}`,
        descripcion: `Objetivo: ${params.objetivo}. Nivel inicial: ${params.nivelInicial}.`,
        fechaInicio: isoLocal(exam),
        fechaFin: isoLocal(addMinutes(exam, 90)),
        prioridad: "alta",
        planId,
      },
      context
    )
  );

  const plan = {
    id: planId,
    ...context,
    alumno: context.studentId,
    curso: context.courseId,
    asignatura: context.subjectId,
    bloque: context.blockId || "",
    createdAt,
    parametros: params,
    eventos: events.map((event) => event.id),
    descripcion: "Plan automático simulado basado en espaciado, práctica de recuperación, intercalación y metacognición.",
  };

  if (shouldSave) {
    planner.planes = [plan, ...planner.planes];
    planner.eventos = [...events, ...planner.eventos];
    writePlanner(planner);
  }
  return { plan, events };
}

export function saveGeneratedPlan(plan, events) {
  const planner = readPlanner();
  planner.planes = [plan, ...planner.planes];
  planner.eventos = [...events, ...planner.eventos];
  writePlanner(planner);
  return { plan, events };
}

export function getPlannerStats(context) {
  const events = getEventsByContext(context);
  const completed = events.filter((event) => event.estado === "completado");
  const totalMinutes = completed.reduce((sum, event) => {
    const start = new Date(event.fechaInicio);
    const end = event.fechaFin ? new Date(event.fechaFin) : start;
    return sum + Math.max(0, Math.round((end - start) / 60000) || Number(event.durationMinutes || 0));
  }, 0);
  const byType = events.reduce((acc, event) => {
    acc[event.tipo] = (acc[event.tipo] || 0) + 1;
    return acc;
  }, {});
  const weekly = events.reduce((acc, event) => {
    const key = dateOnly(event.fechaInicio);
    acc[key] = (acc[key] || 0) + (event.estado === "completado" ? 1 : 0);
    return acc;
  }, {});
  return {
    total: events.length,
    completed: completed.length,
    completionRate: events.length ? Math.round((completed.length / events.length) * 100) : 0,
    totalMinutes,
    byType,
    weekly,
  };
}
