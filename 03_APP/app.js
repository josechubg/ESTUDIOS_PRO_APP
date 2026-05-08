import { loadAppState, saveAppState } from "./services/storageService.js";
import { buildSimulatedAnswer as buildAIResponse } from "./services/aiService.js";
import {
  addError,
  deleteError,
  getAllErrors,
  getErrorsByContext,
  markAsReviewed,
  updateError,
} from "./services/errorMemoryService.js";
import { generateSimulatedTrainingPlan } from "./services/adaptiveTrainingService.js";
import {
  buildCoursePlan as buildSimulatedCoursePlan,
  createMockForArea,
} from "./services/courseService.js";
import { createFlashcardsForArea } from "./services/flashcardService.js";
import {
  addFilesForContext,
  deleteFileMetadata,
  getFilesForContext,
} from "./services/fileStorageService.js";
import {
  ensureValidContext,
  getBlocksForSubject,
  getContextIds,
  getCoursesForAgent,
  getDefaultContext,
  getSubjectsForCourse,
} from "./data/studyStructure.js";

const agents = {
  juan: {
    name: "Juan",
    age: "16 años",
    label: "Agente prioritario",
    status: "Juan funcional",
    meta: "1º-2º Bachillerato",
    focus: "Colegio La Inmaculada Franciscanos · PAU Murcia",
    title: "Juan · Bachillerato con foco PAU",
    copy:
      "Profesor experto y entrenador academico para examenes del colegio, problemas, comentarios y PAU Region de Murcia.",
    chatName: "Juan · profesor simulado",
    modeNames: { planned: "Estudio programado", rapid: "Estudio ultrarrapido" },
    metrics: { progress: 72, reviews: 3 },
    progress: [
      ["Dibujo Tecnico", 78],
      ["Lengua", 64],
      ["Errores superados", 56],
    ],
    reviews: [
      ["Hoy", "Sistema diedrico: cambios de plano"],
      ["Mañana", "Sintaxis: subordinadas sustantivas"],
      ["Viernes", "Comentario PAU: tesis y estructura"],
    ],
    tone: "breve, claro, exigente y orientado a examen",
  },
  carlota: {
    name: "Carlota🥰",
    age: "18-19 años",
    label: "Estructura premium",
    status: "Carlota preparada",
    meta: "Medicina UCV",
    focus: "Test avanzado · alta dificultad · maxima nota",
    title: "Carlota🥰 · Medicina UCV",
    copy:
      "Entrenadora universitaria para apuntes, test avanzado, trampas conceptuales, simulacros y alto rendimiento.",
    chatName: "Carlota · tutora medica simulada",
    modeNames: { planned: "Estudio por bloques", rapid: "Test avanzado express" },
    metrics: { progress: 58, reviews: 5 },
    progress: [
      ["Anatomia", 61],
      ["Test avanzado", 46],
      ["Errores revisados", 38],
    ],
    reviews: [
      ["Hoy", "Plexo braquial y relaciones anatomicas"],
      ["Mañana", "Bioquimica con distractores"],
      ["Domingo", "Repaso de histologia"],
    ],
    tone: "exigente, premium, clinico y de alto rendimiento",
  },
  gonzalo: {
    name: "Gonzalo",
    age: "13 años",
    label: "Aprendizaje guiado",
    status: "Gonzalo preparado",
    meta: "1º-4º ESO",
    focus: "Colegio Miralmonte · refuerzo progresivo",
    title: "Gonzalo · ESO con aprendizaje guiado",
    copy:
      "Apoyo claro y dinamico para comprender, practicar paso a paso y reforzar sin infantilizar.",
    chatName: "Gonzalo · apoyo guiado simulado",
    modeNames: { planned: "Aprendizaje guiado", rapid: "Repaso rapido" },
    metrics: { progress: 66, reviews: 2 },
    progress: [
      ["Ejercicios guiados", 70],
      ["Comprension", 62],
      ["Errores corregidos", 44],
    ],
    reviews: [
      ["Hoy", "Ecuaciones paso a paso"],
      ["Mañana", "Resumen de lectura"],
      ["Jueves", "Proporcionalidad"],
    ],
    tone: "claro, motivador, guiado y maduro",
  },
};

const defaultsByArea = {
  "Dibujo Tecnico": {
    theory: "Antes de resolver, identifica datos, plano de trabajo y resultado que te piden. En dibujo tecnico se puntua metodo, limpieza y justificacion.",
    insights: [
      ["Tema prioritario", "Sistema diedrico, trazas, verdadera magnitud y cambios de plano."],
      ["Ejercicio recomendado", "Resolver una recta oblicua y comprobar trazas, visibilidad y verdadera magnitud."],
      ["Errores a vigilar", "No justificar trazas, confundir abatimiento con giro y olvidar unidades graficas."],
    ],
    flashcards: [
      ["Traza horizontal", "Punto donde una recta corta el plano horizontal."],
      ["Verdadera magnitud", "Longitud real cuando el segmento queda paralelo al plano de proyeccion."],
      ["Abatimiento", "Giro de un plano para verlo en verdadera forma."],
    ],
    exercises: ["Dibuja trazas de una recta oblicua.", "Calcula verdadera magnitud con cambio de plano.", "Explica cada paso como si fuera PAU."],
    mocks: [["Mini simulacro diedrico", "20 minutos: trazas, pertenencia a plano y verdadera magnitud."]],
  },
  "Lengua · Analisis gramatical": {
    theory: "Analiza forma y funcion. No etiquetes por intuicion: comprueba sustitucion, concordancia y relacion con el verbo.",
    insights: [
      ["Tema prioritario", "Categorias gramaticales, funciones sintacticas y justificacion breve."],
      ["Ejercicio recomendado", "Analizar cinco oraciones y explicar por que cada complemento cumple su funcion."],
      ["Errores a vigilar", "Confundir atributo con CD y etiquetar palabras sin comprobar su funcion."],
    ],
    flashcards: [
      ["Atributo", "Complemento de verbo copulativo sustituible por lo."],
      ["Complemento directo", "Argumento verbal sustituible por lo, la, los o las."],
      ["Sujeto omitido", "Sujeto recuperable por persona y numero del verbo."],
    ],
    exercises: ["Analiza una oracion simple completa.", "Localiza sujeto y predicado en 5 frases.", "Justifica CD, CI y atributo con pruebas."],
    mocks: [["Analisis gramatical express", "15 minutos: 6 oraciones simples con correccion inmediata."]],
  },
  "Lengua · Sintaxis": {
    theory: "Primero separa proposiciones, despues localiza nexos y por ultimo asigna funcion. Si saltas el orden, fallas mas.",
    insights: [
      ["Tema prioritario", "Subordinadas sustantivas, adjetivas y adverbiales con funcion completa."],
      ["Ejercicio recomendado", "Separar proposiciones, localizar nexos y sustituir para comprobar funcion."],
      ["Errores a vigilar", "No delimitar proposiciones antes de analizar y olvidar antecedente."],
    ],
    flashcards: [
      ["Nexo", "Elemento que introduce o conecta proposiciones."],
      ["Subordinada sustantiva", "Proposicion que funciona como un sintagma nominal."],
      ["Antecedente", "Nombre al que se refiere una subordinada adjetiva."],
    ],
    exercises: ["Separa proposiciones en 4 oraciones.", "Subraya nexos y di su funcion.", "Convierte una subordinada sustantiva en un SN."],
    mocks: [["Simulacro sintaxis", "25 minutos: 4 oraciones compuestas y checklist final."]],
  },
  "Lengua · Literatura": {
    theory: "Memoriza con ejes: epoca, autor, obra, rasgo y ejemplo. Sin ejemplo, la respuesta queda floja.",
    insights: [
      ["Tema prioritario", "Autores, obras, rasgos de movimientos y cronologia PAU."],
      ["Ejercicio recomendado", "Tabla de epoca, autor, obra, tema, estilo y posible pregunta."],
      ["Errores a vigilar", "Mezclar generaciones o citar rasgos sin ejemplo."],
    ],
    flashcards: [
      ["Generacion del 98", "Preocupacion por España, sobriedad y reflexion existencial."],
      ["Lorca", "Simbolismo, deseo frente a norma y fuerza dramatica."],
      ["Novecentismo", "Intelectualismo, europeismo y arte depurado."],
    ],
    exercises: ["Haz una linea temporal.", "Relaciona autor-obra-rasgo.", "Redacta una respuesta PAU de 8 lineas."],
    mocks: [["Repaso literatura PAU", "20 minutos: autores, obras y rasgos en pregunta corta."]],
  },
  "Lengua · Comentario de texto": {
    theory: "Distingue tema, tesis y estructura. El resumen no opina y no copia frases enteras.",
    insights: [
      ["Tema prioritario", "Tema, tesis, estructura, resumen y cohesion textual."],
      ["Ejercicio recomendado", "Subrayar tesis y redactar un resumen de seis lineas sin opinion."],
      ["Errores a vigilar", "Resumir copiando frases o confundir tema con argumento."],
    ],
    flashcards: [
      ["Tesis", "Idea principal defendida por el autor."],
      ["Cohesion", "Mecanismos que conectan partes del texto."],
      ["Adecuacion", "Ajuste a situacion, receptor y finalidad."],
    ],
    exercises: ["Subraya tesis y argumentos.", "Resume en 6 lineas.", "Divide estructura externa e interna."],
    mocks: [["Comentario PAU", "40 minutos: resumen, tema, estructura y rasgos linguisticos."]],
  },
  "Lengua · Morfologia": {
    theory: "Separa lexema y morfemas. Justifica si hay derivacion, composicion o parasintesis.",
    insights: [
      ["Tema prioritario", "Lexemas, morfemas, derivacion, composicion y parasintesis."],
      ["Ejercicio recomendado", "Descomponer diez palabras y justificar su formacion."],
      ["Errores a vigilar", "Confundir sufijo derivativo con morfema flexivo."],
    ],
    flashcards: [
      ["Lexema", "Base que aporta significado principal."],
      ["Morfema derivativo", "Elemento que crea una palabra nueva."],
      ["Parasintesis", "Prefijo y sufijo simultaneos o composicion + derivacion."],
    ],
    exercises: ["Descompón 10 palabras.", "Clasifica morfemas.", "Justifica 3 casos dudosos."],
    mocks: [["Mini morfologia", "12 minutos: diez palabras y clasificacion razonada."]],
  },
  "Lengua · PAU Lengua": {
    theory: "Controla tiempo: comentario, sintaxis, literatura y revision. No dejes preguntas sin justificar.",
    insights: [
      ["Tema prioritario", "Comentario, sintaxis, literatura y expresion escrita con tiempo controlado."],
      ["Ejercicio recomendado", "Hacer un bloque PAU de 45 minutos y corregir con rubrica."],
      ["Errores a vigilar", "No repartir tiempo y dejar preguntas sin justificar."],
    ],
    flashcards: [
      ["Checklist PAU", "Tema, resumen, estructura, sintaxis, literatura y revision."],
      ["Conectores", "Ordenan ideas y mejoran coherencia argumentativa."],
      ["Registro", "Nivel de formalidad adecuado al contexto."],
    ],
    exercises: ["Haz un comentario cronometrado.", "Analiza una oracion PAU.", "Redacta una respuesta literaria."],
    mocks: [["Simulacro PAU Lengua", "60 minutos: comentario, sintaxis y literatura."]],
  },
  "Anatomia I": {
    theory: "En Medicina, no basta con reconocer: hay que diferenciar distractores cercanos y relaciones anatomicas.",
    insights: [
      ["Tema prioritario", "Osteologia, articulaciones, plexos y relaciones anatomicas."],
      ["Ejercicio recomendado", "Test de 25 preguntas con distractores anatomicos cercanos."],
      ["Errores a vigilar", "Confundir origen/insercion con accion muscular."],
    ],
    flashcards: [
      ["Plexo braquial", "Red nerviosa C5-T1 del miembro superior."],
      ["Plano sagital", "Divide el cuerpo en derecha e izquierda."],
      ["Insercion", "Punto movil o distal donde termina un musculo."],
    ],
    exercises: ["Haz 15 preguntas tipo test.", "Explica una relacion anatomica.", "Detecta dos distractores."],
    mocks: [["Test avanzado anatomia", "30 preguntas con cinco opciones y penalizacion simulada."]],
  },
  Matematicas: {
    theory: "Escribe datos, operacion y comprobacion. La mayoria de fallos vienen de saltarse un paso.",
    insights: [
      ["Tema prioritario", "Ecuaciones, proporcionalidad y problemas con pasos claros."],
      ["Ejercicio recomendado", "Resolver tres problemas guiados escribiendo datos, operacion y respuesta."],
      ["Errores a vigilar", "Saltarse unidades o cambiar de signo al despejar."],
    ],
    flashcards: [
      ["Ecuacion", "Igualdad con una incognita que hay que encontrar."],
      ["Proporcionalidad", "Relacion constante entre dos magnitudes."],
      ["Comprobacion", "Sustituir el resultado para ver si cumple."],
    ],
    exercises: ["Resuelve 3 ecuaciones.", "Haz un problema de proporcionalidad.", "Comprueba cada resultado."],
    mocks: [["Practica guiada ESO", "15 minutos: cinco ejercicios con pistas progresivas."]],
  },
};

const elements = {
  shell: document.querySelector("#app-shell"),
  homeScreen: document.querySelector("#home-screen"),
  setupScreen: document.querySelector("#setup-screen"),
  generalView: document.querySelector("#general-view"),
  focusView: document.querySelector("#focus-view"),
  navButtons: document.querySelectorAll("[data-agent]"),
  agentCards: document.querySelectorAll("[data-agent-card]"),
  changeStudent: document.querySelector("#change-student"),
  courseSelect: document.querySelector("#course-select"),
  subjectSelect: document.querySelector("#subject-select"),
  blockSelect: document.querySelector("#block-select"),
  blockSelectLabel: document.querySelector("#block-select-label"),
  startStudy: document.querySelector("#start-study"),
  showErrors: document.querySelector("#show-errors"),
  showFiles: document.querySelector("#show-files"),
  showTraining: document.querySelector("#show-training"),
  sidebarAgentName: document.querySelector("#sidebar-agent-name"),
  sidebarAgentMeta: document.querySelector("#sidebar-agent-meta"),
  sidebarAgentFocus: document.querySelector("#sidebar-agent-focus"),
  agentLabel: document.querySelector("#agent-label"),
  agentStatus: document.querySelector("#agent-status"),
  welcomeTitle: document.querySelector("#welcome-title"),
  welcomeCopy: document.querySelector("#welcome-copy"),
  metricProgress: document.querySelector("#metric-progress"),
  metricReviews: document.querySelector("#metric-reviews"),
  metricErrors: document.querySelector("#metric-errors"),
  courseList: document.querySelector("#course-list"),
  subjectList: document.querySelector("#subject-list"),
  blockPanel: document.querySelector("#block-panel"),
  blockTitle: document.querySelector("#block-title"),
  blockList: document.querySelector("#block-list"),
  sessionTitle: document.querySelector("#session-title"),
  plannedMode: document.querySelector("#planned-mode"),
  rapidMode: document.querySelector("#rapid-mode"),
  customFocusAction: document.querySelector("#custom-focus-action"),
  fileInput: document.querySelector("#file-input"),
  fileList: document.querySelector("#file-list"),
  fileContext: document.querySelector("#file-context"),
  mockExamAction: document.querySelector("#mock-exam-action"),
  flashcardsAction: document.querySelector("#flashcards-action"),
  chatTitle: document.querySelector("#chat-title"),
  chatMessages: document.querySelector("#chat-messages"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  modePill: document.querySelector("#mode-pill"),
  insightTitle: document.querySelector("#insight-title"),
  subjectInsights: document.querySelector("#subject-insights"),
  flashcardsList: document.querySelector("#flashcards-list"),
  flashcardsCount: document.querySelector("#flashcards-count"),
  mockList: document.querySelector("#mock-list"),
  mocksCount: document.querySelector("#mocks-count"),
  errorsList: document.querySelector("#errors-list"),
  errorsSummary: document.querySelector("#errors-summary"),
  trainingSection: document.querySelector("#training-section"),
  trainingContent: document.querySelector("#training-content"),
  trainingFlashcards: document.querySelector("#training-flashcards"),
  trainingMock: document.querySelector("#training-mock"),
  trainingReviewBlock: document.querySelector("#training-review-block"),
  trainingBack: document.querySelector("#training-back"),
  errorForm: document.querySelector("#error-form"),
  errorTitle: document.querySelector("#error-title"),
  errorDescription: document.querySelector("#error-description"),
  errorType: document.querySelector("#error-type"),
  errorDifficulty: document.querySelector("#error-difficulty"),
  progressList: document.querySelector("#progress-list"),
  reviewList: document.querySelector("#review-list"),
  customCourseForm: document.querySelector("#custom-course-form"),
  customCourseResult: document.querySelector("#custom-course-result"),
  courseTopic: document.querySelector("#course-topic"),
  courseDuration: document.querySelector("#course-duration"),
  dailyTime: document.querySelector("#daily-time"),
  currentLevel: document.querySelector("#current-level"),
  courseGoal: document.querySelector("#course-goal"),
  nearExam: document.querySelector("#near-exam"),
  exitFocus: document.querySelector("#exit-focus"),
  focusKicker: document.querySelector("#focus-kicker"),
  focusTitle: document.querySelector("#focus-title"),
  focusSubtitle: document.querySelector("#focus-subtitle"),
  focusProgressPill: document.querySelector("#focus-progress-pill"),
  focusTaskTitle: document.querySelector("#focus-task-title"),
  focusExplanation: document.querySelector("#focus-explanation"),
  focusExercises: document.querySelector("#focus-exercises"),
  focusErrors: document.querySelector("#focus-errors"),
  focusFlashcards: document.querySelector("#focus-flashcards"),
  focusChatTitle: document.querySelector("#focus-chat-title"),
  focusChatMessages: document.querySelector("#focus-chat-messages"),
  focusChatForm: document.querySelector("#focus-chat-form"),
  focusChatInput: document.querySelector("#focus-chat-input"),
};

function getAgentDefaults(agentKey) {
  const defaults = getDefaultContext(agentKey);
  return {
    course: defaults.defaultCourse,
    subject: defaults.defaultSubject,
    block: defaults.defaultBlock,
    mode: "planned",
    chat: [],
    focusChat: [],
    flashcards: [],
    customCourses: [],
    mocks: [],
    files: [],
  };
}

function getInitialState() {
  return {
    activeAgent: "juan",
    focus: null,
    agents: Object.fromEntries(Object.keys(agents).map((key) => [key, getAgentDefaults(key)])),
  };
}

function normalizeState(rawState) {
  const base = getInitialState();
  const next = { ...base, ...rawState, agents: { ...base.agents } };
  Object.keys(agents).forEach((key) => {
    const merged = { ...base.agents[key], ...(rawState?.agents?.[key] || {}) };
    next.agents[key] = { ...merged, ...ensureValidContext(key, merged) };
  });
  return next;
}

function loadState() {
  return normalizeState(loadAppState(getInitialState));
}

let state = loadState();
state.focus = null;

function saveState() {
  saveAppState(state);
}

function showHome() {
  elements.homeScreen.classList.remove("hidden");
  elements.setupScreen.classList.add("hidden");
  elements.focusView.classList.add("hidden");
  document.body.classList.remove("focus-active");
}

function showSetup() {
  elements.homeScreen.classList.add("hidden");
  elements.setupScreen.classList.remove("hidden");
  elements.focusView.classList.add("hidden");
  document.body.classList.remove("focus-active");
}

function activeAgentKey() {
  return state.activeAgent;
}

function activeAgent() {
  return agents[activeAgentKey()];
}

function activeAgentState() {
  return state.agents[activeAgentKey()];
}

function currentBlocks() {
  const agentState = activeAgentState();
  return getBlocksForSubject(activeAgentKey(), agentState.course, agentState.subject).map((block) => block.name);
}

function activeArea() {
  const agentState = activeAgentState();
  if (activeAgentKey() === "juan" && agentState.subject === "Lengua") {
    return `Lengua · ${agentState.block}`;
  }
  return agentState.subject;
}

function getStudyData(area = activeArea()) {
  const subjectFallbacks = {
    Anatomia: "Anatomia I",
  };
  const subject = activeAgentState().subject;
  return defaultsByArea[area] || defaultsByArea[subject] || defaultsByArea[subjectFallbacks[subject]] || defaultsByArea.Matematicas;
}

function firstSubjectName(course) {
  return getSubjectsForCourse(activeAgentKey(), course)[0]?.name || "";
}

function firstBlockName(course, subject) {
  return getBlocksForSubject(activeAgentKey(), course, subject)[0]?.name || "";
}

function activeFileContext() {
  const agentState = activeAgentState();
  const blocks = currentBlocks();
  const contextIds = getContextIds(activeAgentKey(), agentState);
  return {
    studentId: activeAgentKey(),
    studentName: activeAgent().name,
    courseId: contextIds.courseId,
    subjectId: contextIds.subjectId,
    subblockId: blocks.length > 0 ? contextIds.subblockId : "",
    courseName: agentState.course,
    subjectName: agentState.subject,
    subblockName: blocks.length > 0 ? agentState.block : "",
  };
}

function activeErrorContext() {
  const context = activeFileContext();
  return {
    studentId: context.studentId,
    courseId: context.courseId,
    subjectId: context.subjectId,
    blockId: context.subblockId,
  };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setAgent(agentKey) {
  state.activeAgent = agentKey;
  state.focus = null;
  saveState();
  render();
  showSetup();
}

function createButton(label, className, active, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${className}${active ? " active" : ""}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderShell() {
  const agent = activeAgent();
  const agentState = activeAgentState();
  document.body.dataset.agentTheme = activeAgentKey();
  elements.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.agent === activeAgentKey()));
  elements.agentCards.forEach((button) => button.classList.toggle("active", button.dataset.agentCard === activeAgentKey()));
  elements.sidebarAgentName.textContent = agent.name;
  elements.sidebarAgentMeta.textContent = `${agent.meta} · ${agent.age}`;
  elements.sidebarAgentFocus.textContent = agent.focus;
  elements.agentLabel.textContent = agent.label;
  elements.agentStatus.textContent = agent.status;
  elements.welcomeTitle.textContent = agent.title;
  elements.welcomeCopy.textContent = agent.copy;
  elements.chatTitle.textContent = agent.chatName;
  elements.metricProgress.textContent = `${agent.metrics.progress}%`;
  elements.metricReviews.textContent = String(agent.metrics.reviews);
  elements.metricErrors.textContent = String(getAllErrors().filter((error) => error.studentId === activeAgentKey()).length);
  elements.modePill.textContent = agent.modeNames[agentState.mode];
}

function renderCourses() {
  const agentState = activeAgentState();
  elements.courseList.innerHTML = "";
  elements.courseSelect.innerHTML = "";
  getCoursesForAgent(activeAgentKey()).forEach((courseItem) => {
    const course = courseItem.name;
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    option.selected = course === agentState.course;
    elements.courseSelect.append(option);

    elements.courseList.append(
      createButton(course, "choice-button", course === agentState.course, () => {
        agentState.course = course;
        agentState.subject = firstSubjectName(course);
        agentState.block = firstBlockName(agentState.course, agentState.subject);
        addAgentMessage(`Curso cambiado a ${course}. Empezamos por ${agentState.subject}.`);
        saveState();
        render();
      })
    );
  });
}

function renderSubjectsAndBlocks() {
  const agentState = activeAgentState();
  const subjects = getSubjectsForCourse(activeAgentKey(), agentState.course);
  elements.subjectList.innerHTML = "";
  elements.subjectSelect.innerHTML = "";
  subjects.forEach((subjectItem) => {
    const subject = subjectItem.name;
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    option.selected = subject === agentState.subject;
    elements.subjectSelect.append(option);

    elements.subjectList.append(
      createButton(subject, "subject-button", subject === agentState.subject, () => {
        agentState.subject = subject;
        agentState.block = firstBlockName(agentState.course, subject);
        addAgentMessage(`Asignatura activa: ${activeArea()}. Elige modo o entra en foco.`);
        saveState();
        render();
      })
    );
  });

  const blocks = currentBlocks();
  elements.blockPanel.classList.toggle("hidden", blocks.length === 0);
  elements.blockSelectLabel.classList.toggle("hidden", blocks.length === 0);
  elements.blockTitle.textContent = activeAgentKey() === "juan" && agentState.subject === "Lengua" ? "Subbloques de Lengua" : "Bloques de la asignatura";
  elements.blockList.innerHTML = "";
  elements.blockSelect.innerHTML = "";
  blocks.forEach((block) => {
    const option = document.createElement("option");
    option.value = block;
    option.textContent = block;
    option.selected = block === agentState.block;
    elements.blockSelect.append(option);

    elements.blockList.append(
      createButton(block, "subject-button", block === agentState.block, () => {
        agentState.block = block;
        addAgentMessage(`Bloque activo: ${activeArea()}.`);
        saveState();
        render();
      })
    );
  });
}

function addItemCard(container, title, text) {
  const item = document.createElement("div");
  item.className = "mini-card";
  const strong = document.createElement("strong");
  const span = document.createElement("span");
  strong.textContent = title;
  span.textContent = text;
  item.append(strong, span);
  container.append(item);
}

function renderStudyData() {
  const agentState = activeAgentState();
  const data = getStudyData();
  elements.sessionTitle.textContent = `${agentState.course} · ${activeArea()} · ${agentState.block}`;
  elements.insightTitle.textContent = activeArea();
  elements.subjectInsights.innerHTML = "";
  data.insights.forEach(([title, text]) => addItemCard(elements.subjectInsights, title, text));

  const flashcards = [...data.flashcards, ...agentState.flashcards.map((card) => [card.front, card.back])];
  elements.flashcardsList.innerHTML = "";
  flashcards.forEach(([front, back]) => addItemCard(elements.flashcardsList, front, back));
  elements.flashcardsCount.textContent = String(flashcards.length);

  const mocks = [...data.mocks, ...agentState.mocks.map((mock) => [mock.title, mock.description])];
  elements.mockList.innerHTML = "";
  mocks.forEach(([title, text]) => addItemCard(elements.mockList, title, text));
  elements.mocksCount.textContent = String(mocks.length);
}

function renderModeButtons() {
  const agent = activeAgent();
  const mode = activeAgentState().mode;
  elements.plannedMode.classList.toggle("active", mode === "planned");
  elements.rapidMode.classList.toggle("active", mode === "rapid");
  elements.plannedMode.querySelector("span").textContent = agent.modeNames.planned;
  elements.rapidMode.querySelector("span").textContent = agent.modeNames.rapid;
}

function renderFiles() {
  const context = activeFileContext();
  const files = getFilesForContext(context);
  const contextText = [context.studentName, context.courseName, context.subjectName, context.subblockName].filter(Boolean).join(" · ");
  elements.fileContext.textContent = `${contextText}. Solo se guardan metadatos; el contenido no se procesa todavia.`;
  elements.fileList.innerHTML = "";

  if (files.length === 0) {
    const empty = document.createElement("p");
    empty.className = "drawer-copy";
    empty.textContent = "Todavia no hay archivos para este bloque.";
    elements.fileList.append(empty);
    return;
  }

  files.forEach((file) => {
    const item = document.createElement("article");
    item.className = "file-item";
    item.innerHTML = `
      <div>
        <strong></strong>
        <div class="file-meta">
          <span></span>
          <span></span>
          <span class="status-pill"></span>
        </div>
      </div>
      <button class="secondary-button" type="button" data-delete-file="">Eliminar</button>
    `;
    item.querySelector("strong").textContent = file.fileName;
    item.querySelector(".file-meta span:nth-child(1)").textContent = file.mimeType;
    item.querySelector(".file-meta span:nth-child(2)").textContent = `${formatFileSize(file.sizeBytes)} · ${new Date(file.uploadedAt).toLocaleDateString("es-ES")}`;
    item.querySelector(".status-pill").textContent = file.status;
    item.querySelector("[data-delete-file]").dataset.deleteFile = file.id;
    elements.fileList.append(item);
  });
}

function deleteFile(fileId) {
  deleteFileMetadata(fileId);
  renderFiles();
  addAgentMessage("Archivo eliminado del listado local. No habia contenido guardado.");
}

function renderChat() {
  const chat = activeAgentState().chat;
  elements.chatMessages.innerHTML = "";
  if (chat.length === 0) {
    addMessageToDom(elements.chatMessages, activeAgent().chatName, `Hola. Soy una simulacion para ${activeArea()}. Pregunta algo o entra en modo foco.`, "agent");
    return;
  }
  chat.forEach((message) => addMessageToDom(elements.chatMessages, message.author, message.text, message.type));
}

function addMessageToDom(container, author, text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  const strong = document.createElement("strong");
  const span = document.createElement("span");
  strong.textContent = author;
  span.textContent = text;
  message.append(strong, span);
  container.append(message);
  container.scrollTop = container.scrollHeight;
}

function addChatMessage(author, text, type) {
  activeAgentState().chat.push({ author, text, type });
  saveState();
  addMessageToDom(elements.chatMessages, author, text, type);
}

function addAgentMessage(text) {
  addChatMessage(activeAgent().chatName, text, "agent");
}

function renderErrors() {
  const list = getErrorsByContext(activeErrorContext());
  elements.errorsList.innerHTML = "";
  renderErrorSummary(list);

  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.className = "error-card";
    empty.textContent = "Todavia no hay errores guardados para este bloque.";
    elements.errorsList.append(empty);
    return;
  }

  list.forEach((error) => {
    const item = document.createElement("li");
    item.className = "error-card";
    item.innerHTML = `
      <div>
        <strong></strong>
        <p></p>
        <div class="file-meta">
          <span class="status-pill"></span>
          <span class="status-pill"></span>
          <span></span>
        </div>
      </div>
      <div class="error-actions">
        <button class="secondary-button" type="button" data-error-action="review">Repasado</button>
        <button class="secondary-button" type="button" data-error-action="solved">Superado</button>
        <button class="secondary-button" type="button" data-error-action="delete">Eliminar</button>
      </div>
    `;
    item.querySelector("strong").textContent = error.title;
    item.querySelector("p").textContent = error.description;
    item.querySelector(".file-meta .status-pill:nth-child(1)").textContent = error.status;
    item.querySelector(".file-meta .status-pill:nth-child(2)").textContent = error.difficulty;
    item.querySelector(".file-meta span:nth-child(3)").textContent = `${error.errorType} · repasos: ${error.reviewCount || 0}`;
    item.querySelectorAll("[data-error-action]").forEach((button) => {
      button.dataset.errorId = error.id;
    });
    elements.errorsList.append(item);
  });
}

function renderTraining() {
  const plan = generateSimulatedTrainingPlan(activeErrorContext());
  elements.trainingContent.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "training-grid";
  summary.innerHTML = `
    <article class="mini-card"><strong>Errores pendientes</strong><span>${plan.pending.length}</span></article>
    <article class="mini-card"><strong>Errores en repaso</strong><span>${plan.reviewing.length}</span></article>
    <article class="mini-card"><strong>Tipo mas frecuente</strong><span>${plan.dominantErrorType}</span></article>
    <article class="mini-card"><strong>Dificultad predominante</strong><span>${plan.dominantDifficulty}</span></article>
  `;

  const recommendation = document.createElement("article");
  recommendation.className = "course-summary";
  recommendation.innerHTML = "<strong>Recomendacion simulada</strong><p></p><ul></ul>";
  recommendation.querySelector("p").textContent = plan.mainRecommendation;
  const list = recommendation.querySelector("ul");
  plan.actions.forEach((action) => {
    const item = document.createElement("li");
    item.textContent = action;
    list.append(item);
  });

  elements.trainingContent.append(summary, recommendation);
}

function createFlashcardsFromErrors() {
  const errors = getErrorsByContext(activeErrorContext());
  if (errors.length === 0) {
    addAgentMessage("No hay errores en este bloque para crear flashcards adaptativas.");
    return;
  }
  const cards = errors.slice(0, 8).map((error) => ({
    front: error.title,
    back: `${error.description} Tipo: ${error.errorType}. Dificultad: ${error.difficulty}.`,
    area: activeArea(),
    status: "desde error",
    createdAt: new Date().toISOString(),
  }));
  activeAgentState().flashcards = [...cards, ...activeAgentState().flashcards].slice(0, 20);
  addAgentMessage(`Flashcards adaptativas creadas desde ${cards.length} error(es) de ${activeArea()}.`);
  saveState();
  render();
  enterFocusMode("flashcards");
}

function createMockFromErrors() {
  const errors = getErrorsByContext(activeErrorContext());
  const title = `Mini-simulacro adaptativo · ${activeArea()}`;
  const description =
    errors.length === 0
      ? "Simulacro simulado general: no hay errores guardados en este bloque."
      : `Simulacro simulado centrado en ${errors.length} error(es): ${errors.map((error) => error.title).slice(0, 3).join(", ")}.`;
  activeAgentState().mocks.unshift({
    title,
    description,
    area: activeArea(),
    createdAt: new Date().toISOString(),
  });
  addAgentMessage(`Mini-simulacro adaptativo creado para ${activeArea()}.`);
  saveState();
  render();
  enterFocusMode("mock");
}

function markActiveBlockAsReviewed() {
  const errors = getErrorsByContext(activeErrorContext());
  errors.forEach((error) => markAsReviewed(error.id));
  addAgentMessage(`Bloque repasado: ${errors.length} error(es) actualizados.`);
  render();
  renderTraining();
}

function renderErrorSummary(errors) {
  const counts = {
    total: errors.length,
    pendiente: errors.filter((error) => error.status === "pendiente").length,
    repaso: errors.filter((error) => error.status === "en repaso").length,
    superado: errors.filter((error) => error.status === "superado").length,
  };
  const typeCounts = errors.reduce((acc, error) => {
    acc[error.errorType] = (acc[error.errorType] || 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "sin datos";
  elements.errorsSummary.innerHTML = `
    <span>Total: ${counts.total}</span>
    <span>Pendientes: ${counts.pendiente}</span>
    <span>En repaso: ${counts.repaso}</span>
    <span>Superados: ${counts.superado}</span>
    <span>Tipo mas frecuente: ${topType}</span>
  `;
}

function renderProgress() {
  elements.progressList.innerHTML = "";
  activeAgent().progress.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "progress-item";
    item.innerHTML = `
      <div class="progress-row"><span></span><strong></strong></div>
      <div class="progress-track"><span></span></div>
    `;
    item.querySelector(".progress-row span").textContent = label;
    item.querySelector("strong").textContent = `${value}%`;
    item.querySelector(".progress-track span").style.width = `${value}%`;
    elements.progressList.append(item);
  });
}

function renderReviews() {
  elements.reviewList.innerHTML = "";
  activeAgent().reviews.forEach(([date, text]) => {
    const item = document.createElement("li");
    item.innerHTML = "<strong></strong><span></span>";
    item.querySelector("strong").textContent = date;
    item.querySelector("span").textContent = text;
    elements.reviewList.append(item);
  });
}

function buildSimulatedAnswer(question, scoped = false) {
  const agentState = activeAgentState();
  return buildAIResponse({
    agentKey: activeAgentKey(),
    agent: activeAgent(),
    modeName: activeAgent().modeNames[agentState.mode],
    area: activeArea(),
    question,
    scoped,
  });
}

function buildCoursePlan(config) {
  return buildSimulatedCoursePlan({
    agentName: activeAgent().name,
    area: activeArea(),
    ...config,
  });
}

function renderCoursePlan(plan) {
  const safe = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  elements.customCourseResult.innerHTML = `
    <div class="course-summary"><strong>${safe(plan.title)}</strong><br>${safe(plan.summary)}</div>
    <div class="plan-grid">
      ${plan.days
        .map(
          (day) => `
        <article class="plan-day">
          <h3>${safe(day.day)}</h3>
          <p><strong>Objetivo:</strong> ${safe(day.objective)}</p>
          <p><strong>Teoria minima:</strong> ${safe(day.theory)}</p>
          <p><strong>Ejercicios:</strong> ${safe(day.exercises)}</p>
          <p><strong>Flashcards:</strong> ${safe(day.flashcards)}</p>
          <p><strong>Errores a vigilar:</strong> ${safe(day.errors)}</p>
        </article>`
        )
        .join("")}
    </div>
    <div class="review-block"><h3>Repaso final</h3><ul>${plan.review.map((item) => `<li>${safe(item)}</li>`).join("")}</ul></div>
  `;
}

function setMode(mode, enterFocus = true) {
  activeAgentState().mode = mode;
  saveState();
  render();
  if (enterFocus) enterFocusMode(mode);
}

function createFlashcards() {
  const agentState = activeAgentState();
  const cards = createFlashcardsForArea({ area: activeArea(), studyData: getStudyData() });
  agentState.flashcards = [...cards, ...agentState.flashcards].slice(0, 20);
  addAgentMessage(`Flashcards creadas para ${activeArea()}: ${cards.map((card) => card.front).join(", ")}.`);
  saveState();
  render();
  enterFocusMode("flashcards");
}

function createMock() {
  const agentState = activeAgentState();
  const created = createMockForArea({ area: activeArea(), studyData: getStudyData() });
  agentState.mocks.unshift(created);
  addAgentMessage(`Simulacro creado: ${created.title}.`);
  saveState();
  render();
  enterFocusMode("mock");
}

function enterFocusMode(type) {
  state.focus = { type, area: activeArea(), progress: type === "rapid" ? 35 : 20 };
  saveState();
  renderFocus();
  elements.focusView.classList.remove("hidden");
  document.body.classList.add("focus-active");
}

function exitFocusMode() {
  state.focus = null;
  saveState();
  elements.focusView.classList.add("hidden");
  document.body.classList.remove("focus-active");
}

function renderFocus() {
  if (!state.focus) return;
  const data = getStudyData(state.focus.area);
  const typeLabels = {
    planned: activeAgent().modeNames.planned,
    rapid: activeAgent().modeNames.rapid,
    course: "Curso personalizado",
    mock: "Simulacro",
    flashcards: "Flashcards",
  };
  const focusTitle = typeLabels[state.focus.type] || "Modo foco";
  elements.focusKicker.textContent = `${activeAgent().name} · ${state.focus.area}`;
  elements.focusTitle.textContent = focusTitle;
  elements.focusSubtitle.textContent = "Ocultamos distracciones: tarea, chat, explicacion, ejercicios, errores y progreso.";
  elements.focusProgressPill.textContent = `${state.focus.progress}%`;
  elements.focusTaskTitle.textContent = `${focusTitle} · ${state.focus.area}`;
  elements.focusExplanation.innerHTML = `<p>${data.theory}</p>`;
  elements.focusExercises.innerHTML = "";
  data.exercises.forEach((exercise) => addItemCard(elements.focusExercises, "Ejercicio relacionado", exercise));
  elements.focusErrors.innerHTML = "";
  data.insights.filter(([title]) => title.includes("Errores")).forEach(([, text]) => addItemCard(elements.focusErrors, "Vigila", text));
  elements.focusFlashcards.innerHTML = "";
  data.flashcards.forEach(([front, back]) => addItemCard(elements.focusFlashcards, front, back));
  elements.focusChatTitle.textContent = activeAgent().chatName;
  elements.focusChatMessages.innerHTML = "";
  const focusChat = activeAgentState().focusChat;
  if (focusChat.length === 0) {
    addMessageToDom(elements.focusChatMessages, activeAgent().chatName, `Estamos en foco: ${state.focus.area}. Pregunta solo sobre esta tarea.`, "agent");
  } else {
    focusChat.forEach((message) => addMessageToDom(elements.focusChatMessages, message.author, message.text, message.type));
  }
}

function render() {
  renderShell();
  renderCourses();
  renderSubjectsAndBlocks();
  renderModeButtons();
  renderFiles();
  renderChat();
  renderStudyData();
  renderErrors();
  renderProgress();
  renderReviews();
  const lastPlan = activeAgentState().customCourses[0];
  if (lastPlan) renderCoursePlan(lastPlan);
  if (state.focus) {
    renderFocus();
    elements.focusView.classList.remove("hidden");
    document.body.classList.add("focus-active");
  }
}

elements.navButtons.forEach((button) => button.addEventListener("click", () => setAgent(button.dataset.agent)));
elements.agentCards.forEach((button) => button.addEventListener("click", () => setAgent(button.dataset.agentCard)));
elements.changeStudent.addEventListener("click", showHome);
elements.courseSelect.addEventListener("change", () => {
  const agentState = activeAgentState();
  agentState.course = elements.courseSelect.value;
  agentState.subject = firstSubjectName(agentState.course);
  agentState.block = firstBlockName(agentState.course, agentState.subject);
  saveState();
  render();
});
elements.subjectSelect.addEventListener("change", () => {
  const agentState = activeAgentState();
  agentState.subject = elements.subjectSelect.value;
  agentState.block = firstBlockName(agentState.course, agentState.subject);
  saveState();
  render();
});
elements.blockSelect.addEventListener("change", () => {
  activeAgentState().block = elements.blockSelect.value;
  saveState();
  render();
});
elements.startStudy.addEventListener("click", () => setMode("planned"));
elements.showErrors.addEventListener("click", () => {
  elements.customCourseForm.closest(".drawer").classList.add("hidden");
  document.querySelector("#files-section").classList.add("hidden");
  elements.trainingSection.classList.add("hidden");
  document.querySelector("#errors-section").classList.toggle("hidden");
});
elements.showFiles.addEventListener("click", () => {
  elements.customCourseForm.closest(".drawer").classList.add("hidden");
  document.querySelector("#errors-section").classList.add("hidden");
  elements.trainingSection.classList.add("hidden");
  document.querySelector("#files-section").classList.toggle("hidden");
  renderFiles();
});
elements.showTraining.addEventListener("click", () => {
  elements.customCourseForm.closest(".drawer").classList.add("hidden");
  document.querySelector("#errors-section").classList.add("hidden");
  document.querySelector("#files-section").classList.add("hidden");
  elements.trainingSection.classList.remove("hidden");
  renderTraining();
});
elements.plannedMode.addEventListener("click", () => setMode("planned"));
elements.rapidMode.addEventListener("click", () => setMode("rapid"));
elements.customFocusAction.addEventListener("click", () => {
  document.querySelector("#errors-section").classList.add("hidden");
  document.querySelector("#files-section").classList.add("hidden");
  elements.trainingSection.classList.add("hidden");
  elements.customCourseForm.closest(".drawer").classList.toggle("hidden");
});
elements.mockExamAction.addEventListener("click", createMock);
elements.flashcardsAction.addEventListener("click", createFlashcards);
elements.exitFocus.addEventListener("click", exitFocusMode);

elements.fileInput.addEventListener("change", (event) => {
  const files = addFilesForContext(Array.from(event.target.files), activeFileContext());
  event.target.value = "";
  renderFiles();
  addAgentMessage(`${files.length} archivo(s) asociados a ${activeArea()}. Solo guardo metadatos; el analisis real llegara con IA.`);
});

elements.fileList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-file]");
  if (!button) return;
  deleteFile(button.dataset.deleteFile);
});

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = elements.chatInput.value.trim();
  if (!question) return;
  addChatMessage(activeAgent().name, question, "user");
  addAgentMessage(buildSimulatedAnswer(question));
  elements.chatInput.value = "";
});

elements.focusChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = elements.focusChatInput.value.trim();
  if (!question) return;
  const agentState = activeAgentState();
  const answer = buildSimulatedAnswer(question, true);
  agentState.focusChat.push({ author: activeAgent().name, text: question, type: "user" });
  agentState.focusChat.push({ author: activeAgent().chatName, text: answer, type: "agent" });
  state.focus.progress = Math.min(100, (state.focus?.progress || 0) + 15);
  elements.focusChatInput.value = "";
  saveState();
  renderFocus();
});

elements.errorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.errorTitle.value.trim();
  const description = elements.errorDescription.value.trim();
  if (!title || !description) return;
  addError(
    {
      title,
      description,
      errorType: elements.errorType.value,
      difficulty: elements.errorDifficulty.value,
    },
    activeErrorContext()
  );
  elements.errorTitle.value = "";
  elements.errorDescription.value = "";
  render();
});

elements.errorsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-error-action]");
  if (!button) return;
  if (button.dataset.errorAction === "review") markAsReviewed(button.dataset.errorId);
  if (button.dataset.errorAction === "solved") updateError(button.dataset.errorId, { status: "superado", lastReviewedAt: new Date().toISOString() });
  if (button.dataset.errorAction === "delete") deleteError(button.dataset.errorId);
  render();
});

elements.trainingFlashcards.addEventListener("click", createFlashcardsFromErrors);
elements.trainingMock.addEventListener("click", createMockFromErrors);
elements.trainingReviewBlock.addEventListener("click", markActiveBlockAsReviewed);
elements.trainingBack.addEventListener("click", () => {
  elements.trainingSection.classList.add("hidden");
});

elements.customCourseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const plan = buildCoursePlan({
    topic: elements.courseTopic.value.trim() || activeArea(),
    duration: elements.courseDuration.value.trim() || "1 semana",
    dailyTime: elements.dailyTime.value.trim() || "1 hora al dia",
    level: elements.currentLevel.value,
    goal: elements.courseGoal.value.trim() || "Mejorar rendimiento",
    nearExam: elements.nearExam.value,
  });
  activeAgentState().customCourses.unshift(plan);
  saveState();
  renderCoursePlan(plan);
  addAgentMessage(`Curso personalizado creado: ${plan.title}`);
  enterFocusMode("course");
});

render();
showHome();
