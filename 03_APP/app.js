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
  generateFlashcardsFromErrors,
  generateQuizFromErrors,
} from "./services/errorTrainingGeneratorService.js";
import {
  getReviewForFlashcard,
  getReviewStats,
  saveFlashcardReview,
} from "./services/flashcardReviewService.js";
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
  generateStudyMaterial,
  getGeneratedMaterialsByContext,
  saveGeneratedMaterial,
} from "./services/materialGeneratorService.js";
import {
  createSimulatedVisualResource,
  getVisualResourcesByContext,
  saveVisualResource,
} from "./services/visualResourcesService.js";
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
  setupCard: document.querySelector(".setup-card"),
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
  showMaterialGenerator: document.querySelector("#show-material-generator"),
  sidebarAgentName: document.querySelector("#sidebar-agent-name"),
  sidebarAgentMeta: document.querySelector("#sidebar-agent-meta"),
  sidebarAgentFocus: document.querySelector("#sidebar-agent-focus"),
  agentLabel: document.querySelector("#agent-label"),
  agentStatus: document.querySelector("#agent-status"),
  welcomeTitle: document.querySelector("#welcome-title"),
  welcomeCopy: document.querySelector("#welcome-copy"),
  mainStats: document.querySelector("#main-stats"),
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
  fileInput: document.querySelector("#desktop-file-input"),
  fileList: document.querySelector("#file-list"),
  fileContext: document.querySelector("#file-context"),
  fileTopicName: document.querySelector("#file-topic-name"),
  fileSubtopicName: document.querySelector("#file-subtopic-name"),
  fileMaterialKind: document.querySelector("#file-material-kind"),
  fileSourceDevice: document.querySelector("#file-source-device"),
  mobileCameraInput: document.querySelector("#mobile-camera-input"),
  mobileCameraNotice: document.querySelector("#mobile-camera-notice"),
  pendingPhotoList: document.querySelector("#pending-photo-list"),
  saveMobilePhotos: document.querySelector("#save-mobile-photos"),
  uploadStatus: document.querySelector("#upload-status"),
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
  materialGeneratorSection: document.querySelector("#material-generator-section"),
  materialGeneratorForm: document.querySelector("#material-generator-form"),
  materialSourceType: document.querySelector("#material-source-type"),
  materialTopic: document.querySelector("#material-topic"),
  materialSubtopicLabel: document.querySelector("#material-subtopic-label"),
  materialSubtopic: document.querySelector("#material-subtopic"),
  materialPastedLabel: document.querySelector("#material-pasted-label"),
  materialPastedContent: document.querySelector("#material-pasted-content"),
  materialFilesLabel: document.querySelector("#material-files-label"),
  materialFileOptions: document.querySelector("#material-file-options"),
  materialDifficulty: document.querySelector("#material-difficulty"),
  materialType: document.querySelector("#material-type"),
  materialGeneratorResult: document.querySelector("#material-generator-result"),
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
  focusCreateFlashcardsErrors: document.querySelector("#focus-create-flashcards-errors"),
  focusCreateMockErrors: document.querySelector("#focus-create-mock-errors"),
  focusReviewMode: document.querySelector("#focus-review-mode"),
  focusSelectAllFlashcards: document.querySelector("#focus-select-all-flashcards"),
  focusDeselectFlashcards: document.querySelector("#focus-deselect-flashcards"),
  focusPrintSelected: document.querySelector("#focus-print-selected"),
  focusPrintAll: document.querySelector("#focus-print-all"),
  focusPrintQa: document.querySelector("#focus-print-qa"),
  flashcardReviewPanel: document.querySelector("#flashcard-review-panel"),
  reviewCounter: document.querySelector("#review-counter"),
  reviewProgressBar: document.querySelector("#review-progress-bar"),
  reviewCard: document.querySelector("#review-card"),
  reviewFront: document.querySelector("#review-front"),
  reviewBack: document.querySelector("#review-back"),
  reviewFlip: document.querySelector("#review-flip"),
  reviewKnown: document.querySelector("#review-known"),
  reviewDoubt: document.querySelector("#review-doubt"),
  reviewUnknown: document.querySelector("#review-unknown"),
  reviewPrev: document.querySelector("#review-prev"),
  reviewNext: document.querySelector("#review-next"),
  reviewExit: document.querySelector("#review-exit"),
  reviewSummary: document.querySelector("#review-summary"),
  printArea: document.querySelector("#print-area"),
  focusChatTitle: document.querySelector("#focus-chat-title"),
  focusChatMessages: document.querySelector("#focus-chat-messages"),
  focusChatForm: document.querySelector("#focus-chat-form"),
  focusChatInput: document.querySelector("#focus-chat-input"),
  toolBackButtons: document.querySelectorAll("[data-back-main]"),
  helpModal: document.querySelector("#help-modal"),
  helpModalTitle: document.querySelector("#help-modal-title"),
  helpModalText: document.querySelector("#help-modal-text"),
  helpModalClose: document.querySelector("#help-modal-close"),
};

const selectedFlashcards = new Set();
let pendingMobilePhotos = [];
const reviewSession = {
  active: false,
  cards: [],
  context: null,
  index: 0,
  flipped: false,
  counts: { known: 0, doubt: 0, unknown: 0 },
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
    visualSupport: {},
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
let activeView = "main";

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

function toolDrawers() {
  return Object.values(toolViews()).filter(Boolean);
}

function toolViews() {
  return {
    generateMaterial: elements.materialGeneratorSection,
    course: elements.customCourseForm.closest(".drawer"),
    errors: document.querySelector("#errors-section"),
    files: document.querySelector("#files-section"),
    adaptive: elements.trainingSection,
  };
}

function applyActiveView() {
  const views = toolViews();
  toolDrawers().forEach((drawer) => drawer.classList.add("hidden"));
  elements.setupScreen.classList.toggle("tool-open", activeView !== "main");
  elements.setupCard.dataset.activeView = activeView;
  elements.setupCard.classList.toggle("tool-open", activeView !== "main");
  if (views[activeView]) views[activeView].classList.remove("hidden");
}

function closeToolScreens() {
  activeView = "main";
  applyActiveView();
  hideUploadStatus();
}

function openToolScreen(viewName) {
  activeView = viewName;
  applyActiveView();
  elements.setupCard.scrollIntoView({ block: "start" });
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
  pendingMobilePhotos = [];
  saveState();
  closeToolScreens();
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
  const context = activeFileContext();
  document.body.dataset.agentTheme = activeAgentKey();
  elements.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.agent === activeAgentKey()));
  elements.agentCards.forEach((button) => button.classList.toggle("active", button.dataset.agentCard === activeAgentKey()));
  elements.sidebarAgentName.textContent = agent.name;
  elements.sidebarAgentMeta.textContent = `${agent.meta} · ${agent.age}`;
  elements.sidebarAgentFocus.textContent = agent.focus;
  elements.agentLabel.textContent = agent.label;
  elements.agentStatus.textContent = agent.status;
  elements.welcomeTitle.textContent = agent.title;
  elements.welcomeCopy.textContent = `${agent.name} · ${context.courseName} · ${context.subjectName}${context.subblockName ? ` · ${context.subblockName}` : ""}`;
  elements.chatTitle.textContent = agent.chatName;
  elements.metricProgress.textContent = `${agent.metrics.progress}%`;
  elements.metricReviews.textContent = String(agent.metrics.reviews);
  elements.metricErrors.textContent = String(getAllErrors().filter((error) => error.studentId === activeAgentKey()).length);
  elements.modePill.textContent = agent.modeNames[agentState.mode];
  renderMainStats();
}

function renderMainStats() {
  const context = activeFileContext();
  const errors = getErrorsByContext(activeErrorContext());
  const files = getFilesForContext(context);
  const generatedCards = activeAgentState().flashcards.filter((card) => resourceBelongsToActiveContext(card, activeErrorContext()));
  const progress = Math.min(96, 35 + files.length * 8 + generatedCards.length * 4 + errors.filter((error) => error.status === "superado").length * 10);
  elements.mainStats.innerHTML = `
    <article class="stat-card progress-stat">
      <span>Bloque</span>
      <strong>${progress}%</strong>
      <div class="progress-track"><i style="width:${progress}%"></i></div>
    </article>
    <article class="stat-card">
      <span>Materiales</span>
      <strong>${files.length}</strong>
      <em>En este bloque</em>
    </article>
    <article class="stat-card">
      <span>Errores pendientes</span>
      <strong>${errors.filter((error) => error.status !== "superado").length}</strong>
      <em>Para entrenar</em>
    </article>
    <article class="stat-card">
      <span>Flashcards</span>
      <strong>${generatedCards.length}</strong>
      <em>Repaso activo</em>
    </article>
  `;
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function slugify(value) {
  return String(value || "sin-dato")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function contextSuffix() {
  const context = activeErrorContext();
  return [context.studentId, context.courseId, context.subjectId, context.blockId].filter(Boolean).map(slugify).join("-");
}

function normalizeFlashcard(card, index = 0, origin = "generada") {
  const context = activeErrorContext();
  const question = card.question || card.front || "Repasa este concepto clave.";
  const answer = card.answer || card.back || "Repasa este concepto porque aparece como error frecuente en este bloque.";
  const explanation =
    card.explanation ||
    (card.sourceErrorId
      ? "Esta tarjeta nace de un error guardado en la memoria del bloque. Revisa el concepto y comprueba el paso antes de avanzar."
      : "Tarjeta simulada de repaso para reforzar el bloque activo.");
  return {
    id: card.id || `${origin}-${contextSuffix()}-${index}`,
    question,
    answer,
    explanation,
    front: question,
    back: answer,
    area: card.area || activeArea(),
    context: card.context || context,
    errorType: card.errorType || (origin === "base" ? "repaso" : "conceptual"),
    difficulty: card.difficulty || "media",
    source: card.source || "",
    sourceErrorId: card.sourceErrorId || "",
    sourceType: card.sourceType || "",
    topic: card.topic || "",
    subtopic: card.subtopic || "",
    sourceBasis: card.sourceBasis || (card.sourceErrorId ? "simulated" : "simulated"),
    sourceLabel: card.sourceLabel || (card.sourceErrorId ? "🧪 Simulado desde errores" : "🧪 Simulado por ahora"),
    sourceFileIds: card.sourceFileIds || [],
    origin,
  };
}

function sourceBadge(label) {
  const badge = document.createElement("span");
  badge.className = "source-badge";
  badge.textContent = label || "🧪 Simulado por ahora";
  return badge;
}

function visualSupportKey() {
  return contextSuffix();
}

function visualSupportLevelForArea(area = activeArea()) {
  const value = `${area} ${activeAgentState().subject} ${activeAgentState().block}`.toLowerCase();
  if (/(dibujo|di[eé]drico|geometr|anatom|bioqu|metabol|ciclo|plano|recta|traza)/i.test(value)) return "required";
  if (/(sintaxis|comentario|morfolog|lengua|matem|funcion|probabilidad|procedimiento)/i.test(value)) return "optional";
  return "none";
}

function getVisualSupportStatus() {
  return activeAgentState().visualSupport?.[visualSupportKey()] || "not_requested";
}

function setVisualSupportStatus(status) {
  activeAgentState().visualSupport = {
    ...(activeAgentState().visualSupport || {}),
    [visualSupportKey()]: status,
  };
  saveState();
  renderFocus();
}

function renderVisualSupportBlock(visual, level, status) {
  if (level === "none") return "";
  const intro =
    level === "required"
      ? "Este concepto se entiende mejor con un dibujo."
      : "¿Quieres ver un dibujo o esquema de apoyo?";
  const controls =
    status === "shown"
      ? ""
      : level === "required"
        ? '<button class="secondary-button" type="button" data-visual-action="shown">Ver dibujo explicativo</button>'
        : '<div class="visual-actions"><button class="secondary-button" type="button" data-visual-action="shown">Sí, mostrar apoyo visual</button><button class="secondary-button" type="button" data-visual-action="skipped">No, seguir sin imagen</button></div>';
  const placeholder =
    status === "shown"
      ? `<div class="visual-placeholder">
          <strong>${escapeHtml(visual.title)}</strong>
          <span>${escapeHtml(visual.description)}</span>
        </div>
        <p><strong>Nivel:</strong> ${level} · <strong>Estado:</strong> mostrado · <strong>Fuente:</strong> ${escapeHtml(visual.sourceLabel)}</p>`
      : status === "skipped"
        ? "<p class=\"visual-muted\">Apoyo visual omitido por ahora.</p>"
        : "";

  return `
    <section class="visual-support visual-support-card" data-visual-level="${level}" data-visual-status="${status}">
      <div class="visual-support-head">
        <h3>Apoyo visual</h3>
        <span class="progress-pill">${level === "required" ? "Imprescindible" : "Opcional"}</span>
      </div>
      <p>${intro}</p>
      ${controls}
      ${placeholder}
    </section>
  `;
}

function renderStudyData() {
  const agentState = activeAgentState();
  const data = getStudyData();
  elements.sessionTitle.textContent = `${agentState.course} · ${activeArea()} · ${agentState.block}`;
  elements.insightTitle.textContent = activeArea();
  elements.subjectInsights.innerHTML = "";
  data.insights.forEach(([title, text]) => addItemCard(elements.subjectInsights, title, text));

  const context = activeErrorContext();
  const flashcards = [
    ...data.flashcards,
    ...agentState.flashcards.filter((card) => resourceBelongsToActiveContext(card, context)).map((card) => [card.front, card.back]),
  ];
  elements.flashcardsList.innerHTML = "";
  flashcards.forEach(([front, back]) => addItemCard(elements.flashcardsList, front, back));
  elements.flashcardsCount.textContent = String(flashcards.length);

  const mocks = [
    ...data.mocks,
    ...agentState.mocks.filter((mock) => resourceBelongsToActiveContext(mock, context)).map((mock) => [mock.title, mock.description]),
  ];
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
  renderPendingMobilePhotos();

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
        <div class="file-meta file-topic-meta">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p class="drawer-copy"></p>
      </div>
      <button class="secondary-button" type="button" data-delete-file="">Eliminar</button>
    `;
    item.querySelector("strong").textContent = file.fileName;
    item.querySelector(".file-meta span:nth-child(1)").textContent = file.mimeType;
    item.querySelector(".file-meta span:nth-child(2)").textContent = `${formatFileSize(file.sizeBytes)} · ${new Date(file.uploadedAt).toLocaleDateString("es-ES")}`;
    item.querySelector(".status-pill").textContent = file.status;
    item.querySelector(".file-topic-meta span:nth-child(1)").textContent = file.autoDetectTopic ? "🤖 Tema pendiente de detección por IA" : `Tema: ${file.topicName || "Pendiente"}`;
    item.querySelector(".file-topic-meta span:nth-child(2)").textContent = file.autoDetectSubtopic ? "🤖 Parte pendiente de detección por IA" : `Parte: ${file.subtopicName || "Sin parte concreta"}`;
    item.querySelector(".file-topic-meta span:nth-child(3)").textContent = `${materialKindLabel(file.materialKind)} · prioridad ${file.materialPriority || "normal"} · ${file.sourceDevice || "desconocido"} · ${file.captureMode || "file_upload"}`;
    item.querySelector("p").textContent = file.processingNotes || "Imagen guardada como metadato. Pendiente de OCR/visión IA.";
    item.querySelector("[data-delete-file]").dataset.deleteFile = file.id;
    elements.fileList.append(item);
  });
}

function materialKindLabel(kind = "otro") {
  const labels = {
    apunte: "apunte",
    foto_cuaderno: "foto de cuaderno",
    foto_libro: "foto de libro",
    esquema: "esquema",
    ejercicio: "ejercicio",
    examen: "examen no oficial",
    examen_oficial: "Examen oficial",
    examen_no_oficial: "Examen no oficial",
    otro: "otro",
  };
  return labels[kind] || kind;
}

function deleteFile(fileId) {
  deleteFileMetadata(fileId);
  renderFiles();
  addAgentMessage("Archivo eliminado del listado local. No habia contenido guardado.");
}

function collectFileDetails(captureMode) {
  return {
    topicName: elements.fileTopicName.value.trim(),
    subtopicName: elements.fileSubtopicName.value.trim(),
    materialKind: elements.fileMaterialKind.value,
    sourceDevice: captureMode === "mobile_camera" ? "movil" : elements.fileSourceDevice.value === "desconocido" ? "ordenador" : elements.fileSourceDevice.value,
    captureMode,
  };
}

function handleSelectedFiles(fileList, captureMode) {
  const filesToSave = Array.from(fileList);
  if (filesToSave.length === 0) return;
  const files = addFilesForContext(filesToSave, activeFileContext(), collectFileDetails(captureMode));
  renderFiles();
  renderMaterialFileOptions();
  showUploadStatus(files.length === 1 ? "✅ Archivo subido correctamente" : `✅ ${files.length} archivos subidos correctamente`);
  addAgentMessage(`${files.length} archivo(s) asociados a ${activeArea()}. Solo guardo metadatos; el analisis real llegara con IA.`);
}

function queueMobilePhotos(fileList) {
  const photos = Array.from(fileList).map((file, index) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `pending-photo-${Date.now()}-${index}`,
    name: file.name || `foto-${pendingMobilePhotos.length + index + 1}.jpg`,
    type: file.type || "image/jpeg",
    size: file.size || 0,
    selected: true,
  }));
  if (photos.length === 0) return;
  pendingMobilePhotos = [...pendingMobilePhotos, ...photos];
  renderPendingMobilePhotos();
  showUploadStatus(photos.length === 1 ? "Foto añadida. Puedes hacer otra o guardar." : `${photos.length} fotos añadidas. Puedes guardar cuando termines.`, "info");
}

function renderPendingMobilePhotos() {
  if (!elements.pendingPhotoList) return;
  elements.pendingPhotoList.innerHTML = "";
  if (pendingMobilePhotos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "drawer-copy";
    empty.textContent = "Aún no has añadido fotos.";
    elements.pendingPhotoList.append(empty);
    elements.saveMobilePhotos.disabled = true;
    return;
  }
  elements.saveMobilePhotos.disabled = false;
  pendingMobilePhotos.forEach((photo, index) => {
    const item = document.createElement("article");
    item.className = "pending-photo-item";
    item.innerHTML = `
      <div class="pending-photo-placeholder" aria-hidden="true">📷 Foto añadida</div>
      <div>
        <strong></strong>
        <span class="pending-photo-meta"></span>
      </div>
      <label class="pending-photo-check">
        <input type="checkbox" data-select-pending-photo="" checked />
        <span>Seleccionada</span>
      </label>
      <button class="secondary-button" type="button" data-remove-pending-photo="">Quitar</button>
    `;
    item.querySelector("strong").textContent = `Foto ${index + 1}`;
    item.querySelector(".pending-photo-meta").textContent = `${photo.name} · ${formatFileSize(photo.size)} · ${photo.type || "image/jpeg"}`;
    item.querySelector("[data-select-pending-photo]").dataset.selectPendingPhoto = photo.id;
    item.querySelector("[data-select-pending-photo]").checked = photo.selected !== false;
    item.querySelector("[data-remove-pending-photo]").dataset.removePendingPhoto = photo.id;
    elements.pendingPhotoList.append(item);
  });
}

function savePendingMobilePhotos() {
  if (pendingMobilePhotos.length === 0) {
    showUploadStatus("No hay fotos pendientes para guardar.", "info");
    return;
  }
  const selectedPhotos = pendingMobilePhotos.filter((photo) => photo.selected !== false);
  if (selectedPhotos.length === 0) {
    showUploadStatus("Selecciona al menos una foto antes de guardar.", "info");
    return;
  }
  const files = addFilesForContext(selectedPhotos, activeFileContext(), collectFileDetails("mobile_camera"));
  pendingMobilePhotos = [];
  renderFiles();
  renderMaterialFileOptions();
  showUploadStatus(files.length === 1 ? "✅ Foto subida correctamente" : `✅ ${files.length} fotos subidas correctamente`);
  addAgentMessage(`${files.length} foto(s) guardadas como metadatos en ${activeArea()}. Pendientes de OCR/IA futura.`);
}

function removePendingMobilePhoto(photoId) {
  pendingMobilePhotos = pendingMobilePhotos.filter((photo) => photo.id !== photoId);
  renderPendingMobilePhotos();
}

function togglePendingMobilePhoto(photoId, selected) {
  pendingMobilePhotos = pendingMobilePhotos.map((photo) => (photo.id === photoId ? { ...photo, selected } : photo));
}

function showUploadStatus(text, tone = "success") {
  elements.uploadStatus.textContent = text;
  elements.uploadStatus.className = `upload-status ${tone}`;
}

function hideUploadStatus() {
  if (!elements.uploadStatus) return;
  elements.uploadStatus.textContent = "";
  elements.uploadStatus.className = "upload-status hidden";
}

function showHelpModal(title, text) {
  elements.helpModalTitle.textContent = title || "Ayuda";
  elements.helpModalText.textContent = text || "";
  if (typeof elements.helpModal.showModal === "function") {
    elements.helpModal.showModal();
  } else {
    elements.helpModal.classList.add("open");
  }
}

function closeHelpModal() {
  if (typeof elements.helpModal.close === "function") {
    elements.helpModal.close();
  } else {
    elements.helpModal.classList.remove("open");
  }
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

function renderMaterialGeneratorFields() {
  const sourceType = elements.materialSourceType.value;
  elements.materialSubtopicLabel.classList.toggle("hidden", sourceType !== "subtopic");
  elements.materialPastedLabel.classList.toggle("hidden", sourceType !== "pasted_content");
  elements.materialFilesLabel.classList.toggle("hidden", sourceType !== "uploaded_files");
  elements.materialTopic.required = !["pasted_content", "uploaded_files"].includes(sourceType);
  elements.materialSubtopic.required = sourceType === "subtopic";
  elements.materialPastedContent.required = sourceType === "pasted_content";
  renderMaterialFileOptions();
}

function renderMaterialFileOptions() {
  const files = getFilesForContext(activeFileContext());
  elements.materialFileOptions.innerHTML = "";
  if (files.length === 0) {
    const empty = document.createElement("p");
    empty.className = "drawer-copy";
    empty.textContent = "Todavia no hay archivos/fotos en este bloque.";
    elements.materialFileOptions.append(empty);
    return;
  }

  files.forEach((file) => {
    const label = document.createElement("label");
    label.className = "material-file-option";
    label.innerHTML = `
      <input type="checkbox" value="" data-material-file-id="" />
      <span></span>
    `;
    label.querySelector("input").value = file.id;
    label.querySelector("input").dataset.materialFileId = file.id;
    label.querySelector("span").textContent = `${file.fileName} · ${file.topicName || "sin tema"} · ${file.materialKind || "otro"} · ${file.status}`;
    elements.materialFileOptions.append(label);
  });
}

function renderMaterialResult(material = null) {
  const saved = getGeneratedMaterialsByContext(activeErrorContext());
  elements.materialGeneratorResult.innerHTML = "";

  if (!material && saved.length === 0) {
    addItemCard(elements.materialGeneratorResult, "Sin material generado", "Crea un resumen, flashcards o simulacro para este bloque.");
    return;
  }

  if (material?.summary) {
    const summary = document.createElement("article");
    summary.className = "course-summary material-summary";
    summary.innerHTML = `
      <div class="source-row"></div>
      <strong>${escapeHtml(material.summary.title)}</strong>
      <p>${escapeHtml(material.summary.sourceUsed)}</p>
      <p>${escapeHtml(material.summary.explanation)}</p>
      <div class="material-columns">
        <div><h4>Conceptos clave</h4><ul>${material.summary.keyConcepts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        <div><h4>Esquema rapido</h4><ul>${material.summary.outline.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        <div><h4>Errores esperables</h4><ul>${material.summary.expectedErrors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      </div>
      <p><strong>Consejo de examen:</strong> ${escapeHtml(material.summary.examTip)}</p>
    `;
    summary.querySelector(".source-row").append(sourceBadge(material.summary.sourceLabel));
    elements.materialGeneratorResult.append(summary);
  }

  if (material) {
    const counts = document.createElement("div");
    counts.className = "training-grid material-counts";
    counts.innerHTML = `
      <article class="mini-card"><strong>Flashcards</strong><span>${material.flashcards.length}</span></article>
      <article class="mini-card"><strong>Simulacro</strong><span>${material.quiz ? material.quiz.questions.length : 0} preguntas</span></article>
      <article class="mini-card"><strong>Origen</strong><span>${material.base.origin}</span></article>
      <article class="mini-card"><strong>Nivel</strong><span>${material.base.difficulty}</span></article>
    `;
    elements.materialGeneratorResult.append(counts);
  }

  const history = document.createElement("div");
  history.className = "material-history";
  const latest = saved.slice(0, 4);
  history.innerHTML = "<h4>Ultimos materiales de este bloque</h4>";
  latest.forEach((item) => {
    addItemCard(history, item.topic || activeArea(), `${item.origin} · ${item.materialType} · ${new Date(item.createdAt).toLocaleDateString("es-ES")}`);
  });
  elements.materialGeneratorResult.append(history);
}

function createGeneratedMaterial(event) {
  event.preventDefault();
  const sourceType = elements.materialSourceType.value;
  const topic = elements.materialTopic.value.trim();
  const subtopic = elements.materialSubtopic.value.trim();
  const pastedContent = elements.materialPastedContent.value.trim();

  if (!["pasted_content", "uploaded_files"].includes(sourceType) && !topic) {
    renderMaterialResult();
    addItemCard(elements.materialGeneratorResult, "Falta tema principal", "Introduce un tema para generar material simulado.");
    return;
  }
  if (sourceType === "subtopic" && !subtopic) {
    renderMaterialResult();
    addItemCard(elements.materialGeneratorResult, "Falta parte concreta", "Indica la parte del tema que quieres trabajar.");
    return;
  }
  if (sourceType === "pasted_content" && !pastedContent) {
    renderMaterialResult();
    addItemCard(elements.materialGeneratorResult, "Falta contenido", "Pega un texto corto de prueba para generar material simulado.");
    return;
  }
  const selectedFileIds = Array.from(elements.materialFileOptions.querySelectorAll("[data-material-file-id]:checked")).map((input) => input.value);
  if (sourceType === "uploaded_files" && selectedFileIds.length === 0) {
    renderMaterialResult();
    addItemCard(elements.materialGeneratorResult, "Selecciona archivos", "Elige una o varias fotos/archivos del bloque para generar material simulado.");
    return;
  }

  const material = generateStudyMaterial({
    sourceType,
    topic,
    subtopic,
    pastedContent,
    difficulty: elements.materialDifficulty.value,
    materialType: elements.materialType.value,
    context: activeErrorContext(),
    area: activeArea(),
    sourceFileIds: selectedFileIds,
  });

  saveGeneratedMaterial(material);
  if (material.flashcards.length > 0) {
    activeAgentState().flashcards = [...material.flashcards.map((card, index) => normalizeFlashcard(card, index, "material")), ...activeAgentState().flashcards].slice(0, 60);
    material.flashcards.forEach((card) => selectedFlashcards.add(card.id));
  }
  if (material.quiz) {
    activeAgentState().mocks.unshift(material.quiz);
  }

  saveState();
  renderStudyData();
  renderMaterialResult(material);
  addAgentMessage(`Material generado para ${activeArea()}: ${material.base.materialType} desde ${material.base.origin}.`);
}

function createFlashcardsFromErrors() {
  const cards = generateFlashcardsFromErrors(activeErrorContext(), activeArea());
  if (cards.length === 0) {
    showFocusResult(elements.focusFlashcards, "Sin errores suficientes", "Todavia no hay errores suficientes para generar entrenamiento personalizado. Añade errores o realiza un simulacro.");
    showTrainingFeedback("Todavia no hay errores suficientes para generar entrenamiento personalizado. Añade errores o realiza un simulacro.");
    addAgentMessage("Todavia no hay errores suficientes para generar entrenamiento personalizado. Añade errores o realiza un simulacro.");
    return;
  }
  cards.forEach((card) => selectedFlashcards.add(card.id));
  activeAgentState().flashcards = [...cards, ...activeAgentState().flashcards].slice(0, 60);
  addAgentMessage(`Flashcards adaptativas creadas desde ${cards.length} error(es) de ${activeArea()}.`);
  saveState();
  render();
  enterFocusMode("flashcards");
}

function createMockFromErrors() {
  const quiz = generateQuizFromErrors(activeErrorContext(), activeArea());
  if (quiz.questions.length === 0) {
    showFocusResult(elements.focusExercises, "Sin errores suficientes", quiz.description);
    showTrainingFeedback(quiz.description);
    addAgentMessage(quiz.description);
    return;
  }
  activeAgentState().mocks.unshift(quiz);
  addAgentMessage(`Mini-simulacro desde errores creado con ${quiz.questions.length} pregunta(s).`);
  saveState();
  render();
  enterFocusMode("mock");
}

function activeGeneratedFlashcards() {
  const context = activeErrorContext();
  return activeAgentState().flashcards.filter((card) => card.area === state.focus?.area && resourceBelongsToActiveContext(card, context));
}

function activeGeneratedMock() {
  const context = activeErrorContext();
  return activeAgentState().mocks.find((mock) => mock.area === state.focus?.area && Array.isArray(mock.questions) && resourceBelongsToActiveContext(mock, context));
}

function activeBaseFlashcards() {
  if (state.focus?.type === "mock") return [];
  const data = getStudyData(state.focus?.area || activeArea());
  return data.flashcards.map(([front, back], index) =>
    normalizeFlashcard(
      {
        id: `base-${contextSuffix()}-${slugify(front)}-${index}`,
        front,
        back,
        errorType: "repaso",
        difficulty: "media",
      },
      index,
      "base"
    )
  );
}

function activeVisibleFlashcards() {
  if (!state.focus || state.focus.type === "mock") return [];
  const generated = activeGeneratedFlashcards().map((card, index) => normalizeFlashcard(card, index, "generada"));
  return [...generated, ...activeBaseFlashcards()];
}

function renderFocusFlashcards() {
  elements.focusFlashcards.innerHTML = "";
  const cards = activeVisibleFlashcards();
  updateReviewModeVisibility();

  if (cards.length === 0) {
    showFocusResult(elements.focusFlashcards, "Sin flashcards", "No hay flashcards para repasar. Crea flashcards desde errores primero.");
    return;
  }

  cards.forEach((card) => {
    const review = getReviewForFlashcard(card.id, activeErrorContext());
    const item = document.createElement("article");
    item.className = `flashcard-study-card origin-${slugify(card.origin || card.source || "base")}`;
    item.dataset.flashcardId = card.id;
    item.innerHTML = `
      <label class="flashcard-select-row">
        <input type="checkbox" data-flashcard-select="" />
        <span>${flashcardOriginLabel(card)}</span>
      </label>
      <div class="source-row"></div>
      <div class="flashcard-question"></div>
      <p class="flashcard-answer"></p>
      <p class="flashcard-explanation"></p>
      <div class="flashcard-meta">
        <span class="status-pill type-${slugify(card.errorType)}"></span>
        <span class="status-pill difficulty-${slugify(card.difficulty)}"></span>
        <span class="status-pill review-${review?.result || "new"}"></span>
      </div>
      <button class="secondary-button" type="button" data-review-card="">Repasar</button>
    `;
    item.querySelector("[data-flashcard-select]").checked = selectedFlashcards.has(card.id);
    item.querySelector("[data-flashcard-select]").dataset.flashcardSelect = card.id;
    item.querySelector("[data-review-card]").dataset.reviewCard = card.id;
    item.querySelector(".source-row").append(sourceBadge(card.sourceLabel));
    item.querySelector(".flashcard-question").textContent = card.question;
    item.querySelector(".flashcard-answer").textContent = card.answer;
    item.querySelector(".flashcard-explanation").textContent = card.explanation;
    item.querySelector(`.type-${slugify(card.errorType)}`).textContent = card.errorType;
    item.querySelector(`.difficulty-${slugify(card.difficulty)}`).textContent = card.difficulty;
    item.querySelector(`.review-${review?.result || "new"}`).textContent = review ? reviewLabel(review.result) : "sin repasar";
    elements.focusFlashcards.append(item);
  });

  updateReviewSummary(cards);
}

function updateReviewModeVisibility() {
  const isReviewing = state.focus?.type === "flashcards" && reviewSession.active;
  elements.flashcardReviewPanel.classList.toggle("hidden", !isReviewing);
  elements.focusView.classList.toggle("review-active", isReviewing);
}

function reviewLabel(result) {
  const labels = {
    known: "dominada",
    doubt: "en duda",
    unknown: "prioritaria",
  };
  return labels[result] || "sin repasar";
}

function flashcardOriginLabel(card) {
  if (card.origin === "base") return "Flashcard base";
  if (card.source === "error-memory" || card.sourceErrorId) return "Flashcard desde errores";
  if (card.source === "generated-material") {
    if (card.sourceType === "uploaded_files") return "Flashcard desde archivos/fotos";
    if (card.sourceType === "subtopic") return "Flashcard de parte concreta";
    if (card.sourceType === "pasted_content") return "Flashcard de contenido pegado";
    return "Flashcard de tema";
  }
  return "Flashcard simulada";
}

function updateReviewSummary(cards = activeVisibleFlashcards()) {
  const storedStats = getReviewStats(cards, reviewSession.context || activeErrorContext());
  elements.reviewSummary.textContent = `Dominadas ${storedStats.known} · Dudosas ${storedStats.doubt} · No sabidas ${storedStats.unknown}`;
}

function startReviewMode(startFlashcardId = "") {
  const cards = activeVisibleFlashcards();
  if (cards.length === 0) {
    showFocusResult(elements.focusFlashcards, "Sin flashcards para repasar", "No hay flashcards para repasar. Crea flashcards desde errores primero.");
    return;
  }
  reviewSession.active = true;
  reviewSession.cards = cards;
  reviewSession.context = activeErrorContext();
  reviewSession.index = Math.max(0, cards.findIndex((card) => card.id === startFlashcardId));
  reviewSession.flipped = false;
  reviewSession.counts = { known: 0, doubt: 0, unknown: 0 };
  elements.flashcardReviewPanel.classList.remove("hidden");
  updateReviewModeVisibility();
  renderReviewCard();
}

function currentReviewCard() {
  return reviewSession.cards[reviewSession.index];
}

function renderReviewCard() {
  const card = currentReviewCard();
  if (!card) return;
  const total = reviewSession.cards.length;
  elements.reviewCounter.textContent = `Tarjeta ${reviewSession.index + 1} de ${total}`;
  elements.reviewProgressBar.style.width = `${((reviewSession.index + 1) / total) * 100}%`;
  elements.reviewFront.innerHTML = `
    <span class="review-label">Pregunta</span>
    <strong>${escapeHtml(card.question)}</strong>
    <span class="review-badges">
      <em>${escapeHtml(card.errorType)}</em>
      <em>dificultad ${escapeHtml(card.difficulty)}</em>
    </span>
  `;
  elements.reviewBack.innerHTML = `
    <span class="review-label">Respuesta</span>
    <strong>${escapeHtml(card.answer)}</strong>
    <span>${escapeHtml(card.explanation)}</span>
    <span class="review-badges">
      <em>relacionada con error ${escapeHtml(card.sourceErrorId || "simulado")}</em>
    </span>
  `;
  elements.reviewCard.classList.toggle("is-flipped", reviewSession.flipped);
  elements.reviewFront.classList.toggle("hidden", reviewSession.flipped);
  elements.reviewBack.classList.toggle("hidden", !reviewSession.flipped);
  elements.reviewFlip.textContent = reviewSession.flipped ? "Ver pregunta" : "Ver respuesta";
  updateReviewSummary(reviewSession.cards);
}

function exitReviewMode() {
  reviewSession.active = false;
  reviewSession.flipped = false;
  reviewSession.context = null;
  updateReviewModeVisibility();
}

function toggleReviewAnswer() {
  if (!currentReviewCard()) return;
  reviewSession.flipped = !reviewSession.flipped;
  renderReviewCard();
}

function moveReview(delta) {
  if (reviewSession.cards.length === 0) return;
  reviewSession.index = Math.min(reviewSession.cards.length - 1, Math.max(0, reviewSession.index + delta));
  reviewSession.flipped = false;
  renderReviewCard();
}

function recordReview(result) {
  const card = currentReviewCard();
  if (!card) return;
  saveFlashcardReview(card, reviewSession.context || activeErrorContext(), result);
  reviewSession.counts[result] = (reviewSession.counts[result] || 0) + 1;
  renderFocusFlashcards();
  if (reviewSession.index < reviewSession.cards.length - 1) {
    moveReview(1);
  } else {
    renderReviewCard();
  }
}

function selectAllFlashcards() {
  activeVisibleFlashcards().forEach((card) => selectedFlashcards.add(card.id));
  renderFocusFlashcards();
}

function deselectFlashcards() {
  activeVisibleFlashcards().forEach((card) => selectedFlashcards.delete(card.id));
  renderFocusFlashcards();
}

function selectedVisibleFlashcards() {
  return activeVisibleFlashcards().filter((card) => selectedFlashcards.has(card.id));
}

function buildPrintHeader() {
  const context = activeFileContext();
  return `
    <header class="print-header">
      <p>Estudios PRO — Flashcards de repaso</p>
      <h1>${escapeHtml(activeAgent().name)} · ${escapeHtml(context.subjectName)}</h1>
      <span>${escapeHtml(context.courseName)} · ${escapeHtml(context.subblockName || "Sin bloque")} · ${new Date().toLocaleDateString("es-ES")}</span>
    </header>
  `;
}

function printFlashcards(cards, requireSelection = false) {
  if (cards.length === 0) {
    const notice = document.createElement("div");
    notice.className = "mini-card flashcard-notice";
    notice.innerHTML = "<strong></strong><span></span>";
    notice.querySelector("strong").textContent = requireSelection ? "Selecciona alguna flashcard" : "Sin flashcards para imprimir";
    notice.querySelector("span").textContent = requireSelection ? "Marca una o varias tarjetas antes de imprimir seleccionadas." : "Genera flashcards antes de imprimir.";
    elements.focusFlashcards.prepend(notice);
    return;
  }

  elements.printArea.innerHTML = `
    ${buildPrintHeader()}
    <div class="print-card-grid">
      ${cards
        .map(
          (card) => `
          <article class="print-card">
            <h2>Pregunta</h2>
            <p>${escapeHtml(card.question)}</p>
            <h2>Respuesta</h2>
            <p>${escapeHtml(card.answer)}</p>
            <h2>Explicacion</h2>
            <p>${escapeHtml(card.explanation)}</p>
            <div>
              <span>Tipo: ${escapeHtml(card.errorType)}</span>
              <span>Dificultad: ${escapeHtml(card.difficulty)}</span>
              <span>Fuente: ${escapeHtml(card.sourceLabel || "🧪 Simulado por ahora")}</span>
            </div>
          </article>
        `
        )
        .join("")}
    </div>
  `;
  window.print();
}

function resourceBelongsToActiveContext(resource, context) {
  if (!resource.context) return false;
  return (
    resource.context.studentId === context.studentId &&
    resource.context.courseId === context.courseId &&
    resource.context.subjectId === context.subjectId &&
    (resource.context.blockId || "") === (context.blockId || "")
  );
}

function markActiveBlockAsReviewed() {
  const errors = getErrorsByContext(activeErrorContext());
  errors.forEach((error) => markAsReviewed(error.id));
  addAgentMessage(`Bloque repasado: ${errors.length} error(es) actualizados.`);
  render();
  renderTraining();
}

function showFocusResult(container, title, text) {
  if (!container) return;
  container.innerHTML = "";
  addItemCard(container, title, text);
}

function showTrainingFeedback(text) {
  if (elements.trainingSection.classList.contains("hidden")) return;
  elements.trainingContent.innerHTML = "";
  addItemCard(elements.trainingContent, "Sin errores suficientes", text);
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
  if (enterFocus) {
    activeView = mode === "rapid" ? "rapid" : "study";
    enterFocusMode(mode);
  }
}

function createFlashcards() {
  const agentState = activeAgentState();
  const context = activeErrorContext();
  const cards = createFlashcardsForArea({ area: activeArea(), studyData: getStudyData() }).map((card, index) =>
    normalizeFlashcard({ ...card, context, id: card.id || `flashcard-${contextSuffix()}-${Date.now()}-${index}` }, index, "simulada")
  );
  agentState.flashcards = [...cards, ...agentState.flashcards].slice(0, 60);
  cards.forEach((card) => selectedFlashcards.add(card.id));
  addAgentMessage(`Flashcards creadas para ${activeArea()}: ${cards.map((card) => card.front).join(", ")}.`);
  saveState();
  render();
  activeView = "flashcards";
  enterFocusMode("flashcards");
}

function createMock() {
  const agentState = activeAgentState();
  const created = createMockForArea({ area: activeArea(), studyData: getStudyData() });
  agentState.mocks.unshift(created);
  addAgentMessage(`Simulacro creado: ${created.title}.`);
  saveState();
  render();
  activeView = "quiz";
  enterFocusMode("mock");
}

function enterFocusMode(type) {
  state.focus = { type, area: activeArea(), progress: type === "rapid" ? 35 : 20 };
  reviewSession.active = false;
  reviewSession.context = null;
  applyActiveView();
  saveState();
  renderFocus();
  elements.focusView.classList.remove("hidden");
  document.body.classList.add("focus-active");
}

function exitFocusMode() {
  state.focus = null;
  reviewSession.active = false;
  activeView = "main";
  updateReviewModeVisibility();
  saveState();
  applyActiveView();
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
  elements.exitFocus.textContent = "← Volver al panel principal";
  elements.focusKicker.textContent = `${activeAgent().name} · ${state.focus.area}`;
  elements.focusTitle.textContent = focusTitle;
  elements.focusSubtitle.textContent = "Modo foco activo.";
  elements.focusProgressPill.textContent = `${state.focus.progress}%`;
  elements.focusTaskTitle.textContent = `${focusTitle} · ${state.focus.area}`;
  const visual = getVisualResourcesByContext(activeErrorContext())[0] || createSimulatedVisualResource({
    context: activeErrorContext(),
    topic: state.focus.area,
    explanationId: `focus-${slugify(state.focus.area)}`,
  });
  if (!getVisualResourcesByContext(activeErrorContext()).length) saveVisualResource(visual);
  const visualSupportLevel = visualSupportLevelForArea(state.focus.area);
  const visualSupportStatus = getVisualSupportStatus();
  elements.focusExplanation.innerHTML = `
    <div class="source-row"><span class="source-badge">🧪 Simulado por ahora</span></div>
    <p>${escapeHtml(data.theory)}</p>
    ${renderVisualSupportBlock(visual, visualSupportLevel, visualSupportStatus)}
  `;
  elements.focusExercises.innerHTML = "";
  const generatedMock = state.focus.type === "mock" ? activeGeneratedMock() : null;
  if (generatedMock) {
    generatedMock.questions.forEach((question) => {
      addItemCard(
        elements.focusExercises,
        question.prompt || question.statement,
        `${question.options.map((option, index) => `${index + 1}. ${option}`).join(" ")} Correcta: ${question.correctAnswer}. ${question.explanation}`
      );
    });
  } else {
    const exercisesToShow = state.focus.type === "flashcards" ? [] : data.exercises;
    exercisesToShow.forEach((exercise) => addItemCard(elements.focusExercises, "Ejercicio relacionado", exercise));
  }
  elements.focusErrors.innerHTML = "";
  data.insights.filter(([title]) => title.includes("Errores")).forEach(([, text]) => addItemCard(elements.focusErrors, "Vigila", text));
  renderFocusFlashcards();
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
  renderMaterialGeneratorFields();
  applyActiveView();
  if (state.focus) {
    renderFocus();
    elements.focusView.classList.remove("hidden");
    document.body.classList.add("focus-active");
  }
}

elements.navButtons.forEach((button) => button.addEventListener("click", () => setAgent(button.dataset.agent)));
elements.agentCards.forEach((button) => button.addEventListener("click", () => setAgent(button.dataset.agentCard)));
elements.changeStudent.addEventListener("click", () => {
  closeToolScreens();
  showHome();
});
elements.courseSelect.addEventListener("change", () => {
  const agentState = activeAgentState();
  agentState.course = elements.courseSelect.value;
  agentState.subject = firstSubjectName(agentState.course);
  agentState.block = firstBlockName(agentState.course, agentState.subject);
  pendingMobilePhotos = [];
  saveState();
  closeToolScreens();
  render();
});
elements.subjectSelect.addEventListener("change", () => {
  const agentState = activeAgentState();
  agentState.subject = elements.subjectSelect.value;
  agentState.block = firstBlockName(agentState.course, agentState.subject);
  pendingMobilePhotos = [];
  saveState();
  closeToolScreens();
  render();
});
elements.blockSelect.addEventListener("change", () => {
  activeAgentState().block = elements.blockSelect.value;
  pendingMobilePhotos = [];
  saveState();
  closeToolScreens();
  render();
});
elements.startStudy.addEventListener("click", () => setMode("planned"));
elements.showErrors.addEventListener("click", () => {
  openToolScreen("errors");
  renderErrors();
});
elements.showFiles.addEventListener("click", () => {
  openToolScreen("files");
  renderFiles();
});
elements.showTraining.addEventListener("click", () => {
  openToolScreen("adaptive");
  renderTraining();
});
elements.showMaterialGenerator.addEventListener("click", () => {
  openToolScreen("generateMaterial");
  renderMaterialGeneratorFields();
  renderMaterialResult();
});
elements.plannedMode.addEventListener("click", () => setMode("planned"));
elements.rapidMode.addEventListener("click", () => setMode("rapid"));
elements.customFocusAction.addEventListener("click", () => {
  openToolScreen("course");
});
elements.mockExamAction.addEventListener("click", createMock);
elements.flashcardsAction.addEventListener("click", createFlashcards);
elements.exitFocus.addEventListener("click", exitFocusMode);

elements.fileInput.addEventListener("change", (event) => {
  handleSelectedFiles(event.target.files, "file_upload");
  event.target.value = "";
});

elements.mobileCameraInput.addEventListener("change", (event) => {
  queueMobilePhotos(event.target.files);
  event.target.value = "";
});

elements.fileList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-file]");
  if (!button) return;
  deleteFile(button.dataset.deleteFile);
});

elements.pendingPhotoList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-pending-photo]");
  if (!button) return;
  removePendingMobilePhoto(button.dataset.removePendingPhoto);
});

elements.pendingPhotoList.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-select-pending-photo]");
  if (!checkbox) return;
  togglePendingMobilePhoto(checkbox.dataset.selectPendingPhoto, checkbox.checked);
});

elements.saveMobilePhotos.addEventListener("click", savePendingMobilePhotos);

elements.toolBackButtons.forEach((button) => button.addEventListener("click", closeToolScreens));

document.addEventListener("click", (event) => {
  const helpButton = event.target.closest("[data-help-text]");
  if (!helpButton) return;
  event.preventDefault();
  event.stopPropagation();
  showHelpModal(helpButton.dataset.helpTitle, helpButton.dataset.helpText);
});

elements.helpModalClose.addEventListener("click", closeHelpModal);
elements.helpModal.addEventListener("click", (event) => {
  if (event.target === elements.helpModal) closeHelpModal();
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

elements.focusExplanation.addEventListener("click", (event) => {
  const button = event.target.closest("[data-visual-action]");
  if (!button) return;
  setVisualSupportStatus(button.dataset.visualAction);
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
elements.trainingBack.addEventListener("click", closeToolScreens);
elements.materialSourceType.addEventListener("change", renderMaterialGeneratorFields);
elements.materialGeneratorForm.addEventListener("submit", createGeneratedMaterial);
elements.focusCreateFlashcardsErrors.addEventListener("click", createFlashcardsFromErrors);
elements.focusCreateMockErrors.addEventListener("click", createMockFromErrors);
elements.focusReviewMode.addEventListener("click", () => startReviewMode());
elements.focusSelectAllFlashcards.addEventListener("click", selectAllFlashcards);
elements.focusDeselectFlashcards.addEventListener("click", deselectFlashcards);
elements.focusPrintSelected.addEventListener("click", () => printFlashcards(selectedVisibleFlashcards(), true));
elements.focusPrintAll.addEventListener("click", () => printFlashcards(activeVisibleFlashcards()));
elements.focusPrintQa.addEventListener("click", () => printFlashcards(activeVisibleFlashcards()));
elements.reviewCard.addEventListener("click", toggleReviewAnswer);
elements.reviewFlip.addEventListener("click", toggleReviewAnswer);
elements.reviewKnown.addEventListener("click", () => recordReview("known"));
elements.reviewDoubt.addEventListener("click", () => recordReview("doubt"));
elements.reviewUnknown.addEventListener("click", () => recordReview("unknown"));
elements.reviewPrev.addEventListener("click", () => moveReview(-1));
elements.reviewNext.addEventListener("click", () => moveReview(1));
elements.reviewExit.addEventListener("click", exitReviewMode);

elements.focusFlashcards.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-flashcard-select]");
  if (!checkbox) return;
  if (checkbox.checked) {
    selectedFlashcards.add(checkbox.dataset.flashcardSelect);
  } else {
    selectedFlashcards.delete(checkbox.dataset.flashcardSelect);
  }
});

elements.focusFlashcards.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-card]");
  if (!button) return;
  startReviewMode(button.dataset.reviewCard);
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
