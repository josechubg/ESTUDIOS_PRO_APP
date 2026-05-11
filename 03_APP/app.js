import { loadAppState, saveAppState } from "./services/storageService.js";
import {
  generarMaterial as generarMaterialIA,
  generarSimulacro,
  recomendarQueEstudioAhora,
  responderChat,
} from "./services/aiService.js?v=ia-architecture";
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
} from "./services/courseService.js";
import { createFlashcardsForArea } from "./services/flashcardService.js";
import {
  addFilesForContext,
  deleteFileMetadata,
  getFilesForContext,
  loadFileMetadata,
} from "./services/fileStorageService.js";
import {
  deleteGeneratedMaterial,
  getAllGeneratedMaterials,
  getGeneratedMaterialsByContext,
  saveGeneratedMaterial,
} from "./services/materialGeneratorService.js";
import {
  createSimulatedVisualResource,
  getVisualResourcesByContext,
  saveVisualResource,
} from "./services/visualResourcesService.js";
import {
  addDifficultConcept,
  deleteDifficultConcept,
  getAllDifficultConcepts,
  getDifficultConceptsByContext,
  markDifficultConceptReviewed,
} from "./services/difficultConceptService.js";
import {
  addPlannerEvent,
  completePlannerEvent,
  deletePlannerEvent,
  generateAutomaticPlan,
  getEventsByContext as getPlannerEventsByContext,
  getPlannerStats,
  movePlannerEvent,
  saveGeneratedPlan,
  updatePlannerEvent,
} from "./services/plannerService.js";
import {
  addCalendarImport,
  addChatAttachment,
  deleteCalendarImport,
  deleteChatAttachment,
  getAllCalendarImports,
  getAllChatAttachments,
  getCalendarImportsByContext,
  getChatAttachmentsByContext,
  getVisualPendingItemState,
  updateCalendarImport,
  updateChatAttachment,
  updateVisualPendingItemState,
} from "./services/visualPendingService.js";
import {
  getInboxItemState,
  MATERIAL_INBOX_STATUSES,
  MATERIAL_INBOX_TYPES,
  setInboxItemStatus,
  updateInboxItemState,
} from "./services/materialInboxService.js";
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
  nextActionTitle: document.querySelector("#next-action-title"),
  nextActionReason: document.querySelector("#next-action-reason"),
  whatStudyNow: document.querySelector("#what-study-now"),
  dashboardSummary: document.querySelector("#dashboard-summary"),
  nextActionResult: document.querySelector("#next-action-result"),
  dashboardQuickAccess: document.querySelector(".dashboard-quick-access"),
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
  materialHistoryFilter: document.querySelector("#material-history-filter"),
  materialHistoryList: document.querySelector("#material-history-list"),
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
  focusScheduleFlashcards: document.querySelector("#focus-schedule-flashcards"),
  focusScheduleMock: document.querySelector("#focus-schedule-mock"),
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
  quickChatChips: document.querySelector(".quick-chat-chips"),
  chatPhotoToggle: document.querySelector("#chat-photo-toggle"),
  chatPhotoOptions: document.querySelector("#chat-photo-options"),
  chatCameraTrigger: document.querySelector("#chat-camera-trigger"),
  chatGalleryTrigger: document.querySelector("#chat-gallery-trigger"),
  chatCameraInput: document.querySelector("#chatCameraInput"),
  chatGalleryInput: document.querySelector("#chatGalleryInput"),
  chatAttachmentStatus: document.querySelector("#chat-attachment-status"),
  historyShortcut: document.querySelector("[data-open-history-shortcut]"),
  expandChat: document.querySelector("#expand-chat"),
  collapseChat: document.querySelector("#collapse-chat"),
  showDifficultConcepts: document.querySelector("#show-difficult-concepts"),
  difficultConceptsSection: document.querySelector("#difficult-concepts-section"),
  difficultConceptsList: document.querySelector("#difficult-concepts-list"),
  conceptsCreateFlashcards: document.querySelector("#concepts-create-flashcards"),
  conceptsCreateMock: document.querySelector("#concepts-create-mock"),
  conceptsScheduleReview: document.querySelector("#concepts-schedule-review"),
  showPlanner: document.querySelector("#show-planner"),
  showPlanningAssistant: document.querySelector("#show-planning-assistant"),
  showMaterialInbox: document.querySelector("#show-material-inbox"),
  materialInboxSection: document.querySelector("#material-inbox-section"),
  inboxTypeFilter: document.querySelector("#inbox-type-filter"),
  inboxSubjectFilter: document.querySelector("#inbox-subject-filter"),
  inboxBlockFilter: document.querySelector("#inbox-block-filter"),
  inboxDateFilter: document.querySelector("#inbox-date-filter"),
  materialInboxList: document.querySelector("#material-inbox-list"),
  materialInboxDetail: document.querySelector("#material-inbox-detail"),
  showVisualPending: document.querySelector("#show-visual-pending"),
  visualPendingSection: document.querySelector("#visual-pending-section"),
  visualPendingList: document.querySelector("#visual-pending-list"),
  visualPendingDetail: document.querySelector("#visual-pending-detail"),
  planningAssistantSection: document.querySelector("#planning-assistant-section"),
  upcomingEventsList: document.querySelector("#upcoming-events-list"),
  quickPlanForm: document.querySelector("#quick-plan-form"),
  quickPlanKind: document.querySelector("#quick-plan-kind"),
  quickPlanTime: document.querySelector("#quick-plan-time"),
  quickPlanPriority: document.querySelector("#quick-plan-priority"),
  quickPlanExtra: document.querySelector("#quick-plan-extra"),
  quickPlanTimeLabel: document.querySelector("#quick-plan-time-label"),
  quickPlanPriorityLabel: document.querySelector("#quick-plan-priority-label"),
  quickPlanExtraLabel: document.querySelector("#quick-plan-extra-label"),
  quickPlanResult: document.querySelector("#quick-plan-result"),
  plannerSection: document.querySelector("#planner-section"),
  plannerCalendar: document.querySelector("#planner-calendar"),
  plannerPeriodSummary: document.querySelector("#planner-period-summary"),
  plannerPeriodEventList: document.querySelector("#planner-period-event-list"),
  plannerCurrentLabel: document.querySelector("#planner-current-label"),
  plannerPrev: document.querySelector("#planner-prev"),
  plannerToday: document.querySelector("#planner-today"),
  plannerNext: document.querySelector("#planner-next"),
  plannerEventForm: document.querySelector("#planner-event-form"),
  plannerEventId: document.querySelector("#planner-event-id"),
  plannerEventType: document.querySelector("#planner-event-type"),
  plannerEventTitle: document.querySelector("#planner-event-title"),
  plannerEventDescription: document.querySelector("#planner-event-description"),
  plannerEventDate: document.querySelector("#planner-event-date"),
  plannerEventStartTime: document.querySelector("#planner-event-start-time"),
  plannerEventEndDate: document.querySelector("#planner-event-end-date"),
  plannerEventEndTime: document.querySelector("#planner-event-end-time"),
  plannerEventDuration: document.querySelector("#planner-event-duration"),
  plannerEventPriority: document.querySelector("#planner-event-priority"),
  plannerPlanForm: document.querySelector("#planner-plan-form"),
  plannerPlanSubject: document.querySelector("#planner-plan-subject"),
  plannerPlanTopic: document.querySelector("#planner-plan-topic"),
  plannerExamDate: document.querySelector("#planner-exam-date"),
  plannerInitialLevel: document.querySelector("#planner-initial-level"),
  plannerDailyTime: document.querySelector("#planner-daily-time"),
  plannerDaysWeek: document.querySelector("#planner-days-week"),
  plannerGoal: document.querySelector("#planner-goal"),
  plannerIncludeBreaks: document.querySelector("#planner-include-breaks"),
  plannerIncludeExercise: document.querySelector("#planner-include-exercise"),
  plannerEventList: document.querySelector("#planner-period-event-list"),
  plannerStatsContent: document.querySelector("#planner-stats-content"),
  plannerReflectionModal: document.querySelector("#planner-reflection-modal"),
  plannerReflectionClose: document.querySelector("#planner-reflection-close"),
  plannerReflectionForm: document.querySelector("#planner-reflection-form"),
  plannerReflectionEventId: document.querySelector("#planner-reflection-event-id"),
  plannerUnderstood: document.querySelector("#planner-understood"),
  plannerReviewNeeded: document.querySelector("#planner-review-needed"),
  plannerDifficulty: document.querySelector("#planner-difficulty"),
  calendarImportInput: document.querySelector("#calendar-import-input"),
  calendarManualEvent: document.querySelector("#calendar-manual-event"),
  calendarImportStatus: document.querySelector("#calendar-import-status"),
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
    mockAttempts: [],
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
let chatExpanded = false;
let plannerView = "month";
let plannerDate = new Date();
let pendingQuickPlan = null;
let selectedInboxItemKey = "";

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
    concepts: elements.difficultConceptsSection,
    planner: elements.plannerSection,
    planningAssistant: elements.planningAssistantSection,
    materialInbox: elements.materialInboxSection,
    visualPending: elements.visualPendingSection,
  };
}

function applyActiveView() {
  const views = toolViews();
  toolDrawers().forEach((drawer) => drawer.classList.add("hidden"));
  elements.setupScreen.classList.toggle("tool-open", activeView !== "main");
  elements.setupCard.dataset.activeView = activeView;
  elements.setupCard.classList.toggle("tool-open", activeView !== "main");
  elements.setupCard.classList.toggle("chat-expanded", chatExpanded && activeView === "main");
  elements.expandChat.classList.toggle("hidden", chatExpanded);
  elements.collapseChat.classList.toggle("hidden", !chatExpanded);
  if (views[activeView]) views[activeView].classList.remove("hidden");
}

function closeToolScreens() {
  activeView = "main";
  applyActiveView();
  hideUploadStatus();
}

function openToolScreen(viewName) {
  chatExpanded = false;
  activeView = viewName;
  applyActiveView();
  elements.setupCard.scrollIntoView({ block: "start" });
}

function setChatExpanded(expanded) {
  chatExpanded = expanded;
  activeView = "main";
  applyActiveView();
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
  elements.chatTitle.textContent = `${agent.name} · ${context.courseName} · ${context.subjectName}${context.subblockName ? ` · ${context.subblockName}` : ""}`;
  elements.metricProgress.textContent = `${agent.metrics.progress}%`;
  elements.metricReviews.textContent = String(agent.metrics.reviews);
  elements.metricErrors.textContent = String(getAllErrors().filter((error) => error.studentId === activeAgentKey()).length);
  elements.modePill.textContent = agent.modeNames[agentState.mode];
  renderMainStats();
  renderDashboardSummary();
}

function renderMainStats() {
  const context = activeFileContext();
  const errors = getErrorsByContext(activeErrorContext());
  const files = getFilesForContext(context);
  const generatedCards = activeAgentState().flashcards.filter((card) => resourceBelongsToActiveContext(card, activeErrorContext()));
  const progress = Math.min(96, 35 + files.length * 8 + generatedCards.length * 4 + errors.filter((error) => error.status === "superado").length * 10);
  elements.mainStats.innerHTML = `
    <article class="stat-card ui-level-3 progress-stat">
      <span>Bloque</span>
      <strong>${progress}%</strong>
      <div class="progress-track"><i style="width:${progress}%"></i></div>
    </article>
    <article class="stat-card ui-level-3">
      <span>Materiales</span>
      <strong>${files.length}</strong>
      <em>En este bloque</em>
    </article>
    <article class="stat-card ui-level-3">
      <span>Errores pendientes</span>
      <strong>${errors.filter((error) => error.status !== "superado").length}</strong>
      <em>Para entrenar</em>
    </article>
    <article class="stat-card ui-level-3">
      <span>Flashcards</span>
      <strong>${generatedCards.length}</strong>
      <em>Repaso activo</em>
    </article>
  `;
}

function activeDashboardData() {
  const now = new Date();
  const plannerEvents = getPlannerEventsByContext(activePlannerContext());
  const upcomingEvents = plannerEvents
    .filter((event) => new Date(event.fechaInicio) >= now && event.estado !== "completado")
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
  const errors = getErrorsByContext(activeErrorContext()).filter((error) => error.status !== "superado");
  const concepts = getDifficultConceptsByContext(activeErrorContext()).filter((concept) => concept.status !== "superado");
  const materials = getGeneratedMaterialsByContext(activeErrorContext()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { upcomingEvents, errors, concepts, materials };
}

function buildWhatStudyNowRecommendation() {
  const { upcomingEvents, errors, concepts, materials } = activeDashboardData();
  return recomendarQueEstudioAhora({
    upcomingEvents,
    errors,
    concepts,
    materials,
    agentState: activeAgentState(),
    area: activeArea(),
  });
}

function renderDashboardSummary() {
  const { upcomingEvents, errors, concepts, materials } = activeDashboardData();
  const latestMaterial = materials[0];
  elements.dashboardSummary.innerHTML = `
    <article class="summary-chip ui-level-3"><strong>${upcomingEvents.length}</strong><span>eventos próximos</span></article>
    <article class="summary-chip ui-level-3"><strong>${latestMaterial ? "1" : "0"}</strong><span>material reciente</span></article>
    <article class="summary-chip ui-level-3"><strong>${concepts.length}</strong><span>conceptos difíciles</span></article>
    <article class="summary-chip ui-level-3"><strong>${errors.length}</strong><span>errores frecuentes</span></article>
  `;
  const recommendation = buildWhatStudyNowRecommendation();
  elements.nextActionTitle.textContent = recommendation.title;
  elements.nextActionReason.textContent = recommendation.reason;
}

function renderWhatStudyNowResult() {
  const recommendation = buildWhatStudyNowRecommendation();
  elements.nextActionResult.classList.remove("hidden");
  elements.nextActionResult.innerHTML = `
    <article class="recommendation-card ui-level-3">
      <div>
        <span class="source-badge">🎯 Recomendación simulada</span>
        <h4>${escapeHtml(recommendation.title)}</h4>
        <p><strong>Motivo:</strong> ${escapeHtml(recommendation.reason)}</p>
        <p><strong>Acción recomendada:</strong> ${escapeHtml(recommendation.action)}</p>
      </div>
      <div class="recommendation-actions">
        <button class="secondary-button" type="button" data-dashboard-action="chat">Ir al chat</button>
        <button class="secondary-button" type="button" data-dashboard-action="material">Crear material</button>
        <button class="secondary-button" type="button" data-dashboard-action="planner">Ver planificación</button>
        <button class="secondary-button" type="button" data-dashboard-action="flashcards">Hacer flashcards</button>
      </div>
    </article>
  `;
}

function handleDashboardAction(action) {
  if (action === "chat") {
    setChatExpanded(true);
    elements.chatInput.focus();
    return;
  }
  if (action === "material") {
    openToolScreen("generateMaterial");
    renderMaterialGeneratorFields();
    renderMaterialResult();
    return;
  }
  if (action === "planner") {
    openToolScreen("planner");
    renderPlanner();
    return;
  }
  if (action === "flashcards") {
    createFlashcards();
    return;
  }
  if (action === "mock") {
    createMock();
    return;
  }
  if (action === "errors") {
    openToolScreen("errors");
    renderErrors();
  }
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
  item.className = "mini-card ui-level-3";
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
    <section class="visual-support visual-support-card ui-level-2" data-visual-level="${level}" data-visual-status="${status}">
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
    item.className = "file-item ui-level-3";
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
    item.className = "pending-photo-item ui-level-3";
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
    addMessageToDom(elements.chatMessages, activeAgent().chatName, `Hola. Soy una simulacion para ${activeArea()}. Pregunta algo o entra en modo foco.`, "agent", null);
    return;
  }
  chat.forEach((message) => addMessageToDom(elements.chatMessages, message.author, message.text, message.type, message));
}

function addMessageToDom(container, author, text, type, messageData = null) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  if (messageData?.id) message.dataset.messageId = messageData.id;
  const strong = document.createElement("strong");
  const span = document.createElement("span");
  strong.textContent = author;
  span.textContent = text;
  message.append(strong, span);
  if (type === "agent" && messageData?.id && container === elements.chatMessages) {
    message.append(renderChatResponseActions(messageData.id));
  }
  container.append(message);
  if (type === "user" && messageData?.id && container === elements.chatMessages) {
    const attachments = getChatAttachmentsByContext(activeVisualContext()).filter((item) => item.asociadoAMensajeChat === messageData.id);
    attachments.forEach((attachment) => container.append(renderChatAttachmentCard(attachment)));
  }
  container.scrollTop = container.scrollHeight;
}

function renderChatAttachmentCard(attachment) {
  const card = document.createElement("article");
  card.className = "chat-attachment-card ui-level-3";
  card.dataset.chatAttachmentId = attachment.id;
  const originLabel = attachment.origen === "camara_chat" ? "cámara del chat" : "galería del chat";
  card.innerHTML = `
    <div>
      <span class="source-badge">Imagen adjuntada como referencia — pendiente de IA real</span>
      <strong></strong>
      <p></p>
    </div>
    <div class="chat-attachment-actions">
      <button class="secondary-button" type="button" data-chat-attachment-action="archive">Archivar</button>
      <button class="secondary-button" type="button" data-chat-attachment-action="doubt">Duda visual</button>
      <button class="secondary-button" type="button" data-chat-attachment-action="topic">Asociar tema</button>
      <button class="secondary-button" type="button" data-chat-attachment-action="event">Programar repaso</button>
      <button class="secondary-button" type="button" data-chat-attachment-action="delete">Eliminar</button>
    </div>
  `;
  card.querySelector("strong").textContent = attachment.nombreArchivo;
  card.querySelector("p").textContent = `${originLabel} · ${attachment.tipoArchivo} · ${formatFileSize(attachment.tamano || 0)}${attachment.temaAsociado ? ` · tema: ${attachment.temaAsociado}` : ""}${attachment.dudaVisual ? " · duda visual" : ""}`;
  return card;
}

function addChatMessage(author, text, type) {
  const message = {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    author,
    text,
    type,
    createdAt: new Date().toISOString(),
  };
  activeAgentState().chat.push(message);
  saveState();
  addMessageToDom(elements.chatMessages, author, text, type, message);
  return message;
}

function addAgentMessage(text) {
  addChatMessage(activeAgent().chatName, text, "agent");
}

function renderChatResponseActions(messageId) {
  const actions = document.createElement("div");
  actions.className = "chat-response-actions";
  actions.innerHTML = `
    <button type="button" data-chat-response-action="save">Guardar respuesta</button>
    <button type="button" data-chat-response-action="inbox">Enviar a bandeja</button>
    <button type="button" data-chat-response-action="summary">Crear resumen</button>
    <button type="button" data-chat-response-action="flashcards">Crear flashcards</button>
    <button type="button" data-chat-response-action="questions">Crear preguntas</button>
    <button type="button" data-chat-response-action="calendar">Añadir al calendario</button>
    <button type="button" data-chat-response-action="difficult">Marcar como concepto difícil</button>
    <button type="button" data-chat-response-action="visual">Generar apoyo visual</button>
  `;
  actions.querySelectorAll("button").forEach((button) => {
    button.dataset.messageId = messageId;
  });
  return actions;
}

function findChatMessage(messageId) {
  return activeAgentState().chat.find((message) => message.id === messageId);
}

function chatMaterialBase(message, materialType, label) {
  const context = activeErrorContext();
  const visual = visualSupportLevelForArea(activeArea());
  const createdAt = new Date().toISOString();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `chat-material-${Date.now()}`,
    ...context,
    sourceType: "chat_response",
    topic: activeArea(),
    subtopic: activeAgentState().block || "",
    difficulty: "medio",
    materialType,
    tipoMaterial: materialType,
    materialTypeLabel: label,
    createdAt,
    origin: "generated_from_chat_response",
    source: "chat_ia_simulado",
    sourceBasis: "simulated",
    sourceLabel: "💬 Chat IA simulado",
    sourceMessageId: message.id,
    sourceText: message.text,
    area: activeArea(),
    context,
    visualSupportLevel: visual,
    visualSupportStatus: "not_requested",
    visualRecommendation: visual === "required" ? "Imagen imprescindible" : visual === "optional" ? "Imagen opcional" : "Imagen no necesaria",
    visualReason: visual === "none" ? "La respuesta puede estudiarse sin apoyo visual." : "La respuesta puede reforzarse con un esquema en una futura IA visual.",
  };
}

function materialFromChatResponse(message, materialType = "respuesta_chat") {
  const base = chatMaterialBase(message, materialType, materialTypeName(materialType));
  const summary =
    materialType === "resumen"
      ? {
          id: `${base.id}-summary`,
          ...base.context,
          title: `Resumen de respuesta · ${activeArea()}`,
          sourceUsed: "Respuesta del chat IA simulado.",
          explanation: `Resumen simulado: ${message.text.slice(0, 220)}${message.text.length > 220 ? "..." : ""}`,
          keyConcepts: [`Idea central de ${activeArea()}`, "Paso que hay que justificar", "Comprobación final"],
          outline: ["1. Idea clave", "2. Aplicación", "3. Error que conviene evitar"],
          expectedErrors: ["Quedarse en una definición sin ejemplo", "No conectar con el bloque activo"],
          examTip: studentExamTip(),
          sourceLabel: base.sourceLabel,
          createdAt: base.createdAt,
        }
      : null;

  return {
    base,
    summary,
    flashcards: materialType === "flashcards" ? buildChatFlashcards(message) : [],
    quiz: materialType === "simulacro" ? buildChatQuiz(message) : null,
    keyConcepts: [],
    expectedErrors: [],
  };
}

function studentExamTip() {
  const tips = {
    juan: "Practica una respuesta breve, justificada y orientada a PAU/colegio.",
    carlota: "Busca el matiz que diferencia la opción correcta del distractor.",
    gonzalo: "Explica el concepto con tus palabras y comprueba con un ejemplo.",
  };
  return tips[activeAgentKey()] || tips.juan;
}

function buildChatFlashcards(message) {
  const context = activeErrorContext();
  const base = [
    {
      question: `¿Cuál es la idea principal de esta explicación sobre ${activeArea()}?`,
      answer: message.text.slice(0, 180) || "Repasa la explicación del chat.",
      explanation: "Flashcard simulada creada desde una respuesta del profesor IA.",
    },
    {
      question: `¿Qué deberías comprobar al estudiar ${activeArea()}?`,
      answer: "Que puedes explicarlo con tus palabras y aplicarlo sin repetir el error.",
      explanation: "Sirve para transformar la respuesta en repaso activo.",
    },
  ];
  return base.map((card, index) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `chat-flashcard-${Date.now()}-${index}`,
    ...context,
    ...card,
    front: card.question,
    back: card.answer,
    area: activeArea(),
    context,
    errorType: "concepto dificil",
    difficulty: "media",
    source: "chat-response",
    sourceType: "chat_response",
    sourceLabel: "💬 Chat IA simulado",
    origin: "generated_from_chat_response",
    sourceMessageId: message.id,
    createdAt: new Date().toISOString(),
  }));
}

function buildChatQuiz(message) {
  const context = activeErrorContext();
  const isCarlota = activeAgentKey() === "carlota";
  const options = isCarlota
    ? ["La opción que mantiene precisión conceptual.", "Un distractor parcialmente correcto.", "Una generalización excesiva.", "Una afirmación fuera de contexto."]
    : ["Explicarlo y justificarlo.", "Responder de memoria.", "Omitir el ejemplo.", "Ignorar el enunciado."];
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `chat-quiz-${Date.now()}`,
    ...context,
    title: `Preguntas desde chat · ${activeArea()}`,
    description: `Preguntas simuladas generadas desde una respuesta del profesor IA para ${activeAgent().name}.`,
    area: activeArea(),
    context,
    questions: [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `chat-question-${Date.now()}`,
        prompt: activeAgentKey() === "gonzalo" ? `¿Cómo explicarías esto con tus palabras?` : `¿Qué idea sostiene mejor la respuesta anterior?`,
        statement: activeAgentKey() === "gonzalo" ? `¿Cómo explicarías esto con tus palabras?` : `¿Qué idea sostiene mejor la respuesta anterior?`,
        options,
        correctAnswer: options[0],
        explanation: message.text.slice(0, 220) || "Pregunta simulada desde chat.",
        sourceMessageId: message.id,
        difficulty: "media",
      },
    ],
    source: "chat-response",
    createdAt: new Date().toISOString(),
  };
}

function handleChatResponseAction(action, messageId) {
  const message = findChatMessage(messageId);
  if (!message) return;
  const labels = {
    save: "Respuesta guardada en historial.",
    inbox: "Respuesta enviada a Bandeja de material.",
    summary: "Resumen simulado creado desde la respuesta.",
    flashcards: "Flashcards creadas desde la respuesta.",
    questions: "Preguntas creadas desde la respuesta.",
    calendar: "Respuesta añadida al calendario como repaso.",
    difficult: "Concepto difícil guardado.",
    visual: "Apoyo visual recomendado en modo simulación.",
  };

  if (action === "save") {
    saveGeneratedMaterial(materialFromChatResponse(message, "respuesta_chat"));
  }
  if (action === "inbox") {
    const material = materialFromChatResponse(message, "respuesta_chat");
    saveGeneratedMaterial(material);
    updateInboxItemState(inboxSourceKey("generated-material", material.base.id), {
      status: "pendiente_clasificar",
      estado: "pendiente_clasificar",
      relacionadoConMaterialId: material.base.id,
    });
    renderMaterialInbox();
  }
  if (action === "summary") {
    saveGeneratedMaterial(materialFromChatResponse(message, "resumen"));
  }
  if (action === "flashcards") {
    const material = materialFromChatResponse(message, "flashcards");
    saveGeneratedMaterial(material);
    activeAgentState().flashcards = [...material.flashcards.map((card, index) => normalizeFlashcard(card, index, "chat")), ...activeAgentState().flashcards].slice(0, 60);
    material.flashcards.forEach((card) => selectedFlashcards.add(card.id));
    saveState();
  }
  if (action === "questions") {
    const material = materialFromChatResponse(message, "simulacro");
    saveGeneratedMaterial(material);
    if (material.quiz) activeAgentState().mocks.unshift(material.quiz);
    saveState();
  }
  if (action === "difficult") {
    addDifficultConcept(
      {
        title: `Concepto difícil · ${activeArea()}`,
        description: message.text.slice(0, 260),
        sourceText: message.text,
        sourceMessageId: message.id,
      },
      activeErrorContext()
    );
    renderDifficultConcepts();
  }
  if (action === "calendar") {
    schedulePlannerEvent({
      tipo: "repaso",
      titulo: `Repaso desde chat · ${activeArea()}`,
      descripcion: message.text.slice(0, 260),
      minutesFromNow: 60,
    });
  }
  if (action === "visual") {
    const visual = createSimulatedVisualResource({
      context: activeErrorContext(),
      topic: activeArea(),
      explanationId: `chat-${message.id}`,
    });
    saveVisualResource({
      ...visual,
      status: visualSupportLevelForArea(activeArea()) === "none" ? "Imagen no necesaria" : "Apoyo visual recomendado",
    });
    addAgentMessage("Cuando conectemos IA visual, aquí se generará o buscará una imagen explicativa.");
  }
  renderMaterialHistory();
  renderMainStats();
  showChatActionFeedback(messageId, labels[action] || "Acción realizada.");
}

function showChatActionFeedback(messageId, text) {
  const message = Array.from(elements.chatMessages.querySelectorAll("[data-message-id]")).find((item) => item.dataset.messageId === messageId);
  if (!message) return;
  let feedback = message.querySelector(".chat-action-feedback");
  if (!feedback) {
    feedback = document.createElement("span");
    feedback.className = "chat-action-feedback";
    message.append(feedback);
  }
  feedback.textContent = text;
}

function renderErrors() {
  const list = getErrorsByContext(activeErrorContext());
  elements.errorsList.innerHTML = "";
  renderErrorSummary(list);

  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.className = "error-card ui-level-3";
    empty.textContent = "Todavia no hay errores guardados para este bloque.";
    elements.errorsList.append(empty);
    return;
  }

  list.forEach((error) => {
    const item = document.createElement("li");
    item.className = "error-card ui-level-3";
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
        <button class="secondary-button" type="button" data-error-action="schedule">Programar repaso</button>
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
  const concepts = getDifficultConceptsByContext(activeErrorContext());
  elements.trainingContent.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "training-grid";
  summary.innerHTML = `
    <article class="mini-card ui-level-3"><strong>Errores pendientes</strong><span>${plan.pending.length}</span></article>
    <article class="mini-card ui-level-3"><strong>Errores en repaso</strong><span>${plan.reviewing.length}</span></article>
    <article class="mini-card ui-level-3"><strong>Tipo mas frecuente</strong><span>${plan.dominantErrorType}</span></article>
    <article class="mini-card ui-level-3"><strong>Dificultad predominante</strong><span>${plan.dominantDifficulty}</span></article>
  `;

  const recommendation = document.createElement("article");
  recommendation.className = "course-summary ui-level-2";
  recommendation.innerHTML = "<strong>Recomendacion simulada</strong><p></p><ul></ul>";
  recommendation.querySelector("p").textContent = plan.mainRecommendation;
  const list = recommendation.querySelector("ul");
  plan.actions.forEach((action) => {
    const item = document.createElement("li");
    item.textContent = action;
    list.append(item);
  });
  if (concepts.length > 0) {
    const item = document.createElement("li");
    item.textContent = `Repasar ${concepts.length} concepto(s) difícil(es) guardado(s) desde el chat.`;
    list.append(item);
  }

  elements.trainingContent.append(summary, recommendation);
}

function renderDifficultConcepts() {
  const concepts = getDifficultConceptsByContext(activeErrorContext());
  elements.difficultConceptsList.innerHTML = "";
  if (concepts.length === 0) {
    addItemCard(elements.difficultConceptsList, "Sin conceptos difíciles", "Marca una respuesta del chat para guardarla aquí.");
    return;
  }
  concepts.forEach((concept) => {
    const item = document.createElement("article");
    item.className = "concept-card ui-level-3";
    item.innerHTML = `
      <div>
        <strong></strong>
        <p></p>
        <div class="file-meta">
          <span class="status-pill"></span>
          <span></span>
        </div>
      </div>
      <div class="concept-actions">
        <button class="secondary-button" type="button" data-concept-action="inbox">Enviar a bandeja</button>
        <button class="secondary-button" type="button" data-concept-action="review">Repasado</button>
        <button class="secondary-button" type="button" data-concept-action="flashcards">Flashcards</button>
        <button class="secondary-button" type="button" data-concept-action="questions">Preguntas</button>
        <button class="secondary-button" type="button" data-concept-action="delete">Eliminar</button>
      </div>
    `;
    item.querySelector("strong").textContent = concept.title;
    item.querySelector("p").textContent = concept.description || concept.sourceText;
    item.querySelector(".status-pill").textContent = concept.status || "pendiente";
    item.querySelector(".file-meta span:nth-child(2)").textContent = `${new Date(concept.createdAt).toLocaleDateString("es-ES")} · repasos: ${concept.reviewCount || 0}`;
    item.querySelectorAll("[data-concept-action]").forEach((button) => {
      button.dataset.conceptId = concept.id;
    });
    elements.difficultConceptsList.append(item);
  });
}

function flashcardFromDifficultConcept(concept, index = 0) {
  const question = `¿Cómo explicarías este concepto difícil: ${concept.title}?`;
  const answer = concept.description || concept.sourceText || "Repasa el concepto guardado desde el chat.";
  return normalizeFlashcard(
    {
      id: `concept-flashcard-${concept.id}-${index}`,
      question,
      answer,
      explanation: "Flashcard simulada creada desde un concepto difícil guardado.",
      context: activeErrorContext(),
      area: activeArea(),
      errorType: "concepto dificil",
      difficulty: "media",
      source: "difficult-concept",
      sourceLabel: "📌 Concepto difícil",
      sourceErrorId: concept.id,
    },
    index,
    "concepto-dificil"
  );
}

function createFlashcardsFromDifficultConcepts(conceptIds = []) {
  const concepts = getDifficultConceptsByContext(activeErrorContext()).filter((concept) => conceptIds.length === 0 || conceptIds.includes(concept.id));
  if (concepts.length === 0) {
    addAgentMessage("Todavía no hay conceptos difíciles para convertir en flashcards.");
    return;
  }
  const cards = concepts.map(flashcardFromDifficultConcept);
  activeAgentState().flashcards = [...cards, ...activeAgentState().flashcards].slice(0, 60);
  cards.forEach((card) => selectedFlashcards.add(card.id));
  saveState();
  render();
  enterFocusMode("flashcards");
}

function createMockFromDifficultConcepts(conceptIds = []) {
  const concepts = getDifficultConceptsByContext(activeErrorContext()).filter((concept) => conceptIds.length === 0 || conceptIds.includes(concept.id));
  if (concepts.length === 0) {
    addAgentMessage("Todavía no hay conceptos difíciles para crear preguntas.");
    return;
  }
  const mock = {
    id: crypto.randomUUID ? crypto.randomUUID() : `concept-mock-${Date.now()}`,
    title: `Mini-simulacro desde conceptos difíciles · ${activeArea()}`,
    description: `Simulacro con ${concepts.length} concepto(s) difícil(es) guardado(s) desde el chat.`,
    area: activeArea(),
    context: activeErrorContext(),
    source: "difficult-concept",
    createdAt: new Date().toISOString(),
    questions: concepts.map((concept, index) => ({
      id: `concept-question-${concept.id}-${index}`,
      prompt: activeAgentKey() === "carlota" ? `Tipo test: ¿qué afirmación encaja mejor con ${concept.title}?` : `Explica y aplica: ${concept.title}`,
      statement: activeAgentKey() === "carlota" ? `Tipo test: ¿qué afirmación encaja mejor con ${concept.title}?` : `Explica y aplica: ${concept.title}`,
      options: ["La explicación correcta y contextualizada.", "Una respuesta de memoria sin justificar.", "Una idea relacionada pero incompleta.", "Una respuesta fuera del bloque."],
      correctAnswer: "La explicación correcta y contextualizada.",
      explanation: concept.description || concept.sourceText,
      sourceConceptId: concept.id,
      difficulty: "media",
    })),
  };
  activeAgentState().mocks.unshift(mock);
  saveState();
  render();
  enterFocusMode("mock");
}

function isoInput(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function activePlannerContext() {
  const context = activeErrorContext();
  return {
    ...context,
    blockName: activeAgentState().block || "",
  };
}

function schedulePlannerEvent({ tipo = "repaso", titulo = "Repaso programado", descripcion = "", minutesFromNow = 60, duration = 30 }) {
  const start = new Date(Date.now() + minutesFromNow * 60000);
  const end = new Date(start.getTime() + duration * 60000);
  addPlannerEvent(
    {
      tipo,
      titulo,
      descripcion,
      fechaInicio: isoInput(start),
      fechaFin: isoInput(end),
      prioridad: tipo === "examen" ? "alta" : "media",
    },
    activePlannerContext()
  );
  renderPlanner();
  renderUpcomingEvents();
  addAgentMessage(`Añadido al planificador: ${titulo}.`);
}

function plannerRange() {
  const base = new Date(plannerDate);
  const start = new Date(base);
  const end = new Date(base);
  if (plannerView === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (plannerView === "week") {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

function eventDateKey(event) {
  return String(event.fechaInicio || "").slice(0, 10);
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function eventStart(event) {
  return new Date(event.fechaInicio);
}

function eventEnd(event) {
  if (event.fechaFin) return new Date(event.fechaFin);
  return event.allDay ? endOfDay(eventStart(event)) : eventStart(event);
}

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function eventOverlapsRange(event, start, end) {
  const eventStartDate = eventStart(event);
  const eventEndDate = eventEnd(event);
  return eventStartDate <= end && eventEndDate >= start;
}

function eventOccursOnDate(event, dateKey) {
  const dayStart = new Date(`${dateKey}T00:00`);
  const dayEnd = new Date(`${dateKey}T23:59:59`);
  return eventOverlapsRange(event, dayStart, dayEnd);
}

function eventHasTime(event) {
  return !event.allDay && String(event.fechaInicio || "").includes("T") && !String(event.fechaInicio || "").endsWith("T00:00");
}

function formatEventTime(event) {
  const start = eventStart(event);
  const end = eventEnd(event);
  if (event.allDay) {
    if (!sameDay(start, end)) return `Del ${start.toLocaleDateString("es-ES")} al ${end.toLocaleDateString("es-ES")}`;
    return start.toLocaleDateString("es-ES");
  }
  const startLabel = start.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  if (!event.fechaFin) return start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const endOptions = sameDay(start, end) ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" };
  return `${startLabel} → ${end.toLocaleString("es-ES", endOptions)}`;
}

function eventDurationMinutes(event) {
  if (event.durationMinutes) return Number(event.durationMinutes);
  if (!event.fechaFin) return 0;
  return Math.max(0, Math.round((eventEnd(event) - eventStart(event)) / 60000));
}

function eventTypeIcon(type) {
  const icons = {
    estudio: "📘",
    repaso: "🔁",
    practica: "✍️",
    simulacro: "📝",
    examen: "⚠️",
    ocio: "🎧",
    ejercicio: "🏃",
    deporte: "🏃",
    familia: "🏡",
    cumpleaños: "🎂",
    cumpleanos: "🎂",
    comunion: "☀️",
    descanso: "🌙",
    personal: "•",
  };
  return icons[type] || "•";
}

function plannerLabel() {
  const formatter = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
  if (plannerView === "month") return formatter.format(plannerDate);
  if (plannerView === "day") return new Intl.DateTimeFormat("es-ES", { dateStyle: "full" }).format(plannerDate);
  const { start, end } = plannerRange();
  return `${start.toLocaleDateString("es-ES")} - ${end.toLocaleDateString("es-ES")}`;
}

function eventsInPlannerRange(events) {
  const { start, end } = plannerRange();
  return events.filter((event) => eventOverlapsRange(event, start, end));
}

function renderPlanner() {
  renderPlannerPeriodSummary();
  renderPlannerCalendar();
  renderPlannerEventList();
  renderPlannerStats();
  renderUpcomingEvents();
}

function renderUpcomingEvents() {
  if (!elements.upcomingEventsList) return;
  const now = new Date();
  const events = getPlannerEventsByContext(activePlannerContext())
    .filter((event) => new Date(event.fechaInicio) >= now && event.estado !== "completado")
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 3);
  elements.upcomingEventsList.innerHTML = "";
  if (events.length === 0) {
    const empty = document.createElement("span");
    empty.textContent = "Sin eventos próximos.";
    elements.upcomingEventsList.append(empty);
    return;
  }
  events.forEach((event) => {
    const item = document.createElement("span");
    item.className = `upcoming-event event-${event.tipo}`;
    item.textContent = `${new Date(event.fechaInicio).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} · ${event.titulo}`;
    elements.upcomingEventsList.append(item);
  });
}

function renderPlannerPeriodSummary() {
  const events = eventsInPlannerRange(getPlannerEventsByContext(activePlannerContext()));
  const studyMinutes = events
    .filter((event) => ["estudio", "repaso", "practica", "simulacro"].includes(event.tipo))
    .reduce((sum, event) => sum + eventDurationMinutes(event), 0);
  const exams = events.filter((event) => event.tipo === "examen");
  const completed = events.filter((event) => event.estado === "completado").length;
  const pending = events.length - completed;
  elements.plannerPeriodSummary.innerHTML = `
    <article class="planner-summary-card ui-level-3">
      <span>Resumen del periodo</span>
      <strong>${events.length}</strong>
      <em>eventos</em>
    </article>
    <article class="planner-summary-card ui-level-3">
      <span>Estudio</span>
      <strong>${Math.floor(studyMinutes / 60)} h ${studyMinutes % 60} min</strong>
      <em>programados</em>
    </article>
    <article class="planner-summary-card ui-level-3">
      <span>Exámenes</span>
      <strong>${exams.length}</strong>
      <em>${exams[0]?.titulo || "sin próximos"}</em>
    </article>
    <article class="planner-summary-card ui-level-3">
      <span>Estado</span>
      <strong>${completed}/${events.length}</strong>
      <em>${pending} pendiente(s)</em>
    </article>
  `;
}

function renderPlannerCalendar() {
  const events = getPlannerEventsByContext(activePlannerContext());
  elements.plannerCurrentLabel.textContent = plannerLabel();
  elements.plannerCalendar.className = `planner-calendar planner-${plannerView}`;
  elements.plannerCalendar.innerHTML = "";
  const rangeEvents = eventsInPlannerRange(events);

  if (plannerView === "month") {
    const first = new Date(plannerDate.getFullYear(), plannerDate.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const days = new Date(plannerDate.getFullYear(), plannerDate.getMonth() + 1, 0).getDate();
    for (let i = 0; i < startOffset + days; i += 1) {
      const cell = document.createElement("div");
      cell.className = "planner-day-cell";
      if (i >= startOffset) {
        const day = i - startOffset + 1;
        const key = `${plannerDate.getFullYear()}-${String(plannerDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cell.dataset.date = key;
        const dayEvents = rangeEvents.filter((event) => eventOccursOnDate(event, key));
        if (sameDay(new Date(`${key}T00:00`), new Date())) cell.classList.add("is-today");
        if (dayEvents.some((event) => event.tipo === "examen")) cell.classList.add("has-exam");
        cell.innerHTML = `<strong>${day}</strong><div class="planner-day-events"></div>`;
        dayEvents.slice(0, 3).forEach((event) => cell.querySelector(".planner-day-events").append(renderPlannerEventPill(event)));
        if (dayEvents.length > 3) {
          const more = document.createElement("span");
          more.className = "planner-more";
          more.textContent = `+${dayEvents.length - 3} más`;
          cell.querySelector(".planner-day-events").append(more);
        }
      } else {
        cell.classList.add("is-empty");
      }
      elements.plannerCalendar.append(cell);
    }
    return;
  }

  const { start, end } = plannerRange();
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const key = date.toISOString().slice(0, 10);
    const dayEvents = rangeEvents.filter((event) => eventOccursOnDate(event, key));
    const cell = document.createElement("div");
    cell.className = "planner-day-cell";
    if (sameDay(date, new Date())) cell.classList.add("is-today");
    if (dayEvents.some((event) => event.tipo === "examen")) cell.classList.add("has-exam");
    cell.dataset.date = key;
    cell.innerHTML = `<strong>${date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}</strong><div class="planner-day-events"></div>`;
    dayEvents.slice(0, plannerView === "day" ? 24 : 6).forEach((event) => cell.querySelector(".planner-day-events").append(renderPlannerEventPill(event)));
    elements.plannerCalendar.append(cell);
  }
}

function renderPlannerEventPill(event) {
  const pill = document.createElement("button");
  pill.className = `planner-event event-${event.tipo} state-${event.estado}`;
  pill.type = "button";
  pill.draggable = true;
  pill.dataset.eventId = event.id;
  pill.textContent = `${eventTypeIcon(event.tipo)} ${eventHasTime(event) ? `${new Date(event.fechaInicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · ` : ""}${event.titulo}`;
  return pill;
}

function renderPlannerEventList() {
  const events = eventsInPlannerRange(getPlannerEventsByContext(activePlannerContext())).sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
  elements.plannerEventList.innerHTML = "";
  if (events.length === 0) {
    addItemCard(elements.plannerEventList, "No hay eventos en este periodo.", "Crea un evento manual o cambia de vista.");
    return;
  }
  events.forEach((event) => {
    const item = document.createElement("article");
    item.className = `planner-list-item ui-level-3 event-${event.tipo}`;
    item.innerHTML = `
      <div>
        <div class="planner-list-title"><span class="event-dot"></span><strong></strong></div>
        <p></p>
        <span class="status-pill"></span>
      </div>
      <div class="planner-list-actions">
        <button class="secondary-button" type="button" data-planner-action="edit">Editar</button>
        <button class="secondary-button" type="button" data-planner-action="complete">Completar</button>
        <button class="secondary-button" type="button" data-planner-action="delete">Eliminar</button>
      </div>
    `;
    item.querySelector("strong").textContent = event.titulo;
    const duration = eventDurationMinutes(event);
    const contextText = [event.asignatura, event.bloque].filter(Boolean).join(" · ");
    item.querySelector("p").textContent = `${event.tipo} · ${formatEventTime(event)}${duration ? ` · ${duration} min` : ""}${contextText ? ` · ${contextText}` : ""}${event.descripcion ? ` · ${event.descripcion}` : ""}`;
    item.querySelector(".status-pill").textContent = `${event.estado} · prioridad ${event.prioridad}`;
    item.querySelectorAll("[data-planner-action]").forEach((button) => {
      button.dataset.eventId = event.id;
    });
    elements.plannerEventList.append(item);
  });
}

function renderPlannerStats() {
  const stats = getPlannerStats(activePlannerContext());
  const typeRows = Object.entries(stats.byType)
    .map(([type, count]) => {
      const width = stats.total ? Math.max(8, Math.round((count / stats.total) * 100)) : 0;
      return `<div class="planner-stat-row"><span>${type}</span><div><i style="width:${width}%"></i></div><strong>${count}</strong></div>`;
    })
    .join("");
  elements.plannerStatsContent.innerHTML = `
    <div class="training-grid">
      <article class="mini-card ui-level-3"><strong>Cumplimiento</strong><span>${stats.completionRate}%</span></article>
      <article class="mini-card ui-level-3"><strong>Eventos</strong><span>${stats.completed}/${stats.total}</span></article>
      <article class="mini-card ui-level-3"><strong>Tiempo</strong><span>${Math.round(stats.totalMinutes / 60)} h ${stats.totalMinutes % 60} min</span></article>
    </div>
    <div class="planner-bars">${typeRows || "<p class='drawer-copy'>Sin datos todavía.</p>"}</div>
  `;
}

function fillPlannerEventForm(event) {
  const start = eventStart(event);
  const end = event.fechaFin ? eventEnd(event) : null;
  elements.plannerEventId.value = event.id;
  elements.plannerEventType.value = event.tipo;
  elements.plannerEventTitle.value = event.titulo;
  elements.plannerEventDescription.value = event.descripcion || "";
  elements.plannerEventDate.value = event.fechaInicio ? event.fechaInicio.slice(0, 10) : "";
  elements.plannerEventStartTime.value = event.allDay ? "" : `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  elements.plannerEventEndDate.value = end && !sameDay(start, end) ? event.fechaFin.slice(0, 10) : "";
  elements.plannerEventEndTime.value = end && !event.allDay ? `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}` : "";
  elements.plannerEventDuration.value = event.durationMinutes || "";
  elements.plannerEventPriority.value = event.prioridad;
}

function openReflection(eventId) {
  elements.plannerReflectionEventId.value = eventId;
  elements.plannerUnderstood.value = "";
  elements.plannerReviewNeeded.value = "";
  elements.plannerDifficulty.value = "media";
  if (typeof elements.plannerReflectionModal.showModal === "function") {
    elements.plannerReflectionModal.showModal();
  } else {
    elements.plannerReflectionModal.classList.add("open");
  }
}

function closeReflection() {
  if (typeof elements.plannerReflectionModal.close === "function") {
    elements.plannerReflectionModal.close();
  } else {
    elements.plannerReflectionModal.classList.remove("open");
  }
}

function quickPlanLabels(kind) {
  const labels = {
    today: ["¿Cuánto tiempo tienes hoy?", "¿Qué asignatura o tema quieres priorizar?", "¿Tienes algún evento hoy?"],
    week: ["¿Cuánto tiempo aproximado al día?", "¿Qué exámenes o asignaturas son prioritarios?", "¿Qué días puedes estudiar?"],
    subject: ["¿Cuánto tiempo aproximado al día?", "Asignatura y temas/bloques", "Fecha de examen si existe, nivel y objetivo"],
    exam: ["¿Cuánto tiempo tienes al día?", "¿Qué temas entran?", "¿Cuándo es el examen?"],
    express: ["¿Cuándo es el examen?", "¿Qué asignatura y temas entran?", "¿Qué llevas peor y cuánto tiempo tienes?"],
    programmed: ["Asignatura y fecha aproximada", "Días disponibles y tiempo diario", "Nivel actual y objetivo"],
    christmas: ["Fechas de Navidad disponibles", "Asignaturas prioritarias", "Eventos familiares, ocio y objetivo"],
    easter: ["Fechas de Semana Santa disponibles", "Asignaturas prioritarias", "Eventos familiares, ocio y objetivo"],
    reviews: ["¿Cuánto tiempo tienes?", "¿Qué errores o conceptos quieres repasar?", "¿Quieres flashcards o simulacro?"],
    reorganize: ["¿Cuánto tiempo queda libre?", "¿Qué se ha movido o cancelado?", "¿Qué hay que proteger sí o sí?"],
    emergency: ["¿Cuánto tiempo real tienes?", "¿Qué temas entran?", "¿Qué llevas peor y cuándo es el examen?"],
    now: ["¿Cuánto tiempo tienes ahora?", "¿Quieres priorizar algo concreto?", "¿Hay examen cercano o energía baja?"],
  };
  return labels[kind] || labels.today;
}

function setQuickPlanKind(kind) {
  const [time, priority, extra] = quickPlanLabels(kind);
  elements.quickPlanKind.value = kind;
  elements.quickPlanTimeLabel.textContent = time;
  elements.quickPlanPriorityLabel.textContent = priority;
  elements.quickPlanExtraLabel.textContent = extra;
  elements.quickPlanResult.innerHTML = "";
  pendingQuickPlan = null;
}

function quickPlanPreset(kind) {
  const presets = {
    today: { days: 1, title: "Plan de hoy", minutes: 45 },
    week: { days: 7, title: "Plan semanal", minutes: 60 },
    subject: { days: 14, title: "Plan por asignatura", minutes: 60 },
    exam: { days: 21, title: "Plan hasta examen", minutes: 60 },
    express: { days: 3, title: "Modo express", minutes: 50 },
    programmed: { days: 28, title: "Estudio programado", minutes: 60 },
    christmas: { days: 14, title: "Plan de Navidad", minutes: 55 },
    easter: { days: 10, title: "Plan de Semana Santa", minutes: 55 },
    reviews: { days: 7, title: "Organización de repasos", minutes: 40 },
    reorganize: { days: 5, title: "Reorganización del calendario", minutes: 45 },
    emergency: { days: 3, title: "Plan rápido de emergencia", minutes: 50 },
    now: { days: 1, title: "Qué estudiar ahora", minutes: 25 },
  };
  return presets[kind] || presets.today;
}

function futureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createQuickPlanPreview(event) {
  event.preventDefault();
  const kind = elements.quickPlanKind.value;
  const preset = quickPlanPreset(kind);
  const priority = elements.quickPlanPriority.value.trim() || activeArea();
  const time = elements.quickPlanTime.value.trim();
  const extra = elements.quickPlanExtra.value.trim();
  const minutes = Number(String(time).match(/\d+/)?.[0] || preset.minutes);
  pendingQuickPlan = generateAutomaticPlan(
    {
      asignatura: activeAgentState().subject,
      bloqueTema: priority,
      fechaExamen: kind === "today" ? futureDate(2) : kind === "emergency" ? futureDate(3) : futureDate(preset.days),
      nivelInicial: kind === "emergency" ? "bajo" : "medio",
      tiempoDiario: minutes,
      diasSemana: kind === "today" ? 1 : 5,
      objetivo: kind === "emergency" ? "aprobar" : "buena nota",
      incluirDescansos: !["today", "emergency", "express", "now"].includes(kind),
      incluirEjercicio: ["week", "subject", "exam", "programmed", "christmas", "easter"].includes(kind),
    },
    activePlannerContext(),
    { save: false }
  );
  pendingQuickPlan.plan.descripcion = `${preset.title}. ${extra ? `Contexto: ${extra}` : "Propuesta simulada bajo demanda."}`;
  renderQuickPlanPreview();
}

function renderQuickPlanPreview() {
  if (!pendingQuickPlan) return;
  const expressNote = ["express", "emergency"].includes(elements.quickPlanKind.value)
    ? '<p class="ai-detection-note ui-level-3">Modo express: prioriza rendimiento rápido, no aprendizaje profundo completo.</p>'
    : "";
  elements.quickPlanResult.innerHTML = `
    <article class="generated-material-card ui-level-2">
      <div class="generated-material-head">
        <div>
          <span class="source-badge">🗓️ Propuesta no guardada</span>
          <h4>${pendingQuickPlan.plan.descripcion}</h4>
          <p>Se guardará solo si confirmas.</p>
        </div>
        <button id="save-quick-plan" class="primary-button ui-action-primary" type="button">Guardar en calendario</button>
      </div>
      ${expressNote}
      <div class="generated-material-content">
        ${pendingQuickPlan.events
          .slice(0, 8)
          .map((event) => `<section class="generated-list ui-level-3"><h5>${escapeHtml(event.titulo)}</h5><ul><li>${escapeHtml(event.tipo)} · ${escapeHtml(new Date(event.fechaInicio).toLocaleString("es-ES"))}</li><li>${escapeHtml(event.descripcion)}</li></ul></section>`)
          .join("")}
      </div>
    </article>
  `;
}

function saveQuickPlan() {
  if (!pendingQuickPlan) return;
  saveGeneratedPlan(pendingQuickPlan.plan, pendingQuickPlan.events);
  addAgentMessage(`Plan guardado en calendario: ${pendingQuickPlan.events.length} evento(s).`);
  pendingQuickPlan = null;
  elements.quickPlanResult.innerHTML = "<p class=\"upload-status success\">✅ Plan guardado en calendario.</p>";
  renderPlanner();
  renderUpcomingEvents();
}

function activeVisualContext() {
  return activeErrorContext();
}

function visualSourceKey(kind, id) {
  return `${kind}:${id}`;
}

function visualFileItems() {
  return getFilesForContext(activeFileContext()).filter((file) => {
    const mime = String(file.mimeType || "").toLowerCase();
    const name = String(file.fileName || "").toLowerCase();
    const kind = String(file.materialKind || "").toLowerCase();
    return mime.startsWith("image/") || mime.includes("pdf") || name.endsWith(".pdf") || ["foto_cuaderno", "foto_libro", "esquema"].includes(kind);
  });
}

function renderVisualPending() {
  const calendars = getCalendarImportsByContext(activeVisualContext());
  const attachments = getChatAttachmentsByContext(activeVisualContext());
  const files = visualFileItems().filter((item) => getVisualPendingItemState(visualSourceKey("file", item.id)).estado !== "eliminado");
  elements.visualPendingList.innerHTML = "";
  if (calendars.length + attachments.length + files.length === 0) {
    addItemCard(elements.visualPendingList, "No tienes material visual pendiente en este bloque.", "Adjunta una foto al chat o sube un calendario, imagen o PDF.");
    elements.visualPendingDetail.innerHTML = `<p class="drawer-copy">No tienes material visual pendiente en este bloque.</p>`;
    return;
  }
  calendars.forEach((item) => elements.visualPendingList.append(renderPendingVisualCard(item, "calendar")));
  attachments.forEach((item) => elements.visualPendingList.append(renderPendingVisualCard(item, "chat")));
  files.forEach((item) => elements.visualPendingList.append(renderPendingVisualCard(item, "file")));
}

function renderPendingVisualCard(item, kind) {
  const card = document.createElement("article");
  card.className = "visual-pending-card ui-level-3";
  const sourceKey = visualSourceKey(kind, item.id);
  const state = getVisualPendingItemState(sourceKey);
  const context = activeFileContext();
  const originLabel =
    kind === "file"
      ? item.mimeType?.includes("pdf") || item.fileName?.toLowerCase().endsWith(".pdf")
        ? "PDF subido"
        : item.materialKind === "esquema"
          ? "esquema visual"
          : "imagen subida"
      : item.origen === "camara_chat"
      ? "cámara del chat"
      : item.origen === "galeria_chat"
        ? "galería del chat"
        : item.origen === "calendario_subido"
          ? "calendario subido"
          : "foto del chat";
  card.innerHTML = `
    <div>
      <span class="source-badge"></span>
      <strong></strong>
      <p></p>
    </div>
    <div class="concept-actions">
      <button class="secondary-button" type="button" data-visual-pending-action="view">Ver elemento</button>
      <button class="secondary-button" type="button" data-visual-pending-action="review">Marcar revisado</button>
      <button class="secondary-button" type="button" data-visual-pending-action="material">Usar para generar material</button>
      <button class="secondary-button" type="button" data-visual-pending-action="chat">Enviar al chat IA</button>
      <button class="secondary-button" type="button" data-visual-pending-action="delete">Eliminar</button>
    </div>
  `;
  card.dataset.pendingKind = kind;
  card.dataset.pendingId = item.id;
  const title = item.nombreArchivo || item.fileName || "Material visual";
  const type = item.tipoArchivo || item.mimeType || "tipo no detectado";
  const size = item.tamano || item.sizeBytes || 0;
  const status = state.estado || item.estado || item.status || "pendiente";
  const subject = kind === "calendar" ? context.courseName : context.subjectName;
  const block = kind === "calendar" ? "Calendario" : context.subblockName || context.subjectName;
  const uploadedAt = item.fecha || item.fechaSubida || item.uploadedAt || "";
  card.querySelector(".source-badge").textContent = `${kind === "calendar" ? "📅" : "🖼️"} ${originLabel} · ${statusLabelVisual(status)}`;
  card.querySelector("strong").textContent = title;
  card.querySelector("p").textContent = `${subject} · ${block} · ${type} · ${formatFileSize(size)} · ${uploadedAt ? new Date(uploadedAt).toLocaleDateString("es-ES") : "sin fecha"}${item.temaAsociado || state.tema ? ` · tema: ${item.temaAsociado || state.tema}` : ""}${item.dudaVisual ? " · duda visual" : ""}`;
  return card;
}

function statusLabelVisual(status) {
  const labels = {
    pendiente_ia_real: "pendiente",
    "pendiente de procesamiento": "pendiente",
    pendiente: "pendiente",
    revisado: "revisado",
    usado_material: "usado para material",
  };
  return labels[status] || status;
}

function findVisualPendingItem(kind, id) {
  if (kind === "calendar") return getCalendarImportsByContext(activeVisualContext()).find((item) => item.id === id);
  if (kind === "chat") return getChatAttachmentsByContext(activeVisualContext()).find((item) => item.id === id);
  if (kind === "file") return visualFileItems().find((item) => item.id === id);
  return null;
}

function renderVisualPendingDetail(item, kind) {
  if (!item) return;
  const state = getVisualPendingItemState(visualSourceKey(kind, item.id));
  const context = activeFileContext();
  const title = item.nombreArchivo || item.fileName || "Material visual";
  const uploadedAt = item.fecha || item.fechaSubida || item.uploadedAt || "";
  elements.visualPendingDetail.innerHTML = `
    <div class="visual-detail-card">
      <span class="source-badge">${escapeHtml(statusLabelVisual(state.estado || item.estado || item.status || "pendiente"))}</span>
      <h4>${escapeHtml(title)}</h4>
      <dl class="inbox-meta">
        <div><dt>Asignatura</dt><dd>${escapeHtml(context.subjectName)}</dd></div>
        <div><dt>Bloque</dt><dd>${escapeHtml(context.subblockName || context.subjectName)}</dd></div>
        <div><dt>Fecha</dt><dd>${uploadedAt ? escapeHtml(new Date(uploadedAt).toLocaleString("es-ES")) : "Sin fecha"}</dd></div>
        <div><dt>Tipo</dt><dd>${escapeHtml(item.tipoArchivo || item.mimeType || "tipo no detectado")}</dd></div>
      </dl>
      <p class="drawer-copy">Vista simulada: no se almacena ni se muestra el archivo real. Solo metadatos para futura IA visual/OCR.</p>
    </div>
  `;
}

function handleVisualPendingAction(action, kind, id) {
  const item = findVisualPendingItem(kind, id);
  if (!item) return;
  const sourceKey = visualSourceKey(kind, id);
  if (action === "view") {
    renderVisualPendingDetail(item, kind);
    return;
  }
  if (action === "delete") {
    if (kind === "calendar") deleteCalendarImport(id);
    if (kind === "chat") deleteChatAttachment(id);
    if (kind === "file") updateVisualPendingItemState(sourceKey, { estado: "eliminado" });
  }
  if (action === "review") {
    if (kind === "calendar") updateCalendarImport(id, { estado: "revisado" });
    if (kind === "chat") updateChatAttachment(id, { estado: "revisado" });
    updateVisualPendingItemState(sourceKey, { estado: "revisado" });
  }
  if (action === "material") {
    const title = item.nombreArchivo || item.fileName || activeArea();
    const material = generarMaterialIA({
      sourceType: "uploaded_files",
      topic: title,
      subtopic: activeAgentState().block || "",
      pastedContent: "",
      difficulty: "medio",
      materialType: "pack_completo",
      context: activeErrorContext(),
      area: activeArea(),
      sourceFileIds: [id],
    });
    saveGeneratedMaterial(material);
    updateVisualPendingItemState(sourceKey, { estado: "usado_material" });
    addAgentMessage(`Material simulado creado desde ${title}. Pendiente de IA real para leer el archivo completo.`);
  }
  if (action === "chat") {
    const title = item.nombreArchivo || item.fileName || "material visual";
    addChatMessage(activeAgent().name, `Quiero trabajar este material visual pendiente: ${title}`, "user");
    addAgentMessage("Lo tengo como referencia simulada. Cuando conectemos IA visual/OCR podré analizarlo; de momento dime qué parte quieres revisar.");
    setChatExpanded(true);
  }
  renderVisualPending();
}

function handleChatAttachmentAction(action, attachmentId) {
  if (action === "archive") {
    elements.chatAttachmentStatus.textContent = "La foto ya está archivada en Material visual pendiente.";
    elements.chatAttachmentStatus.classList.remove("hidden");
    openToolScreen("visualPending");
    renderVisualPending();
    return;
  }
  if (action === "topic") {
    const topic = window.prompt("Tema o parte asociada:", activeArea());
    if (topic) updateChatAttachment(attachmentId, { temaAsociado: topic });
  }
  if (action === "doubt") {
    updateChatAttachment(attachmentId, { dudaVisual: true });
    addAgentMessage("Foto marcada como duda visual. En IA real podré analizarla directamente.");
  }
  if (action === "event") {
    schedulePlannerEvent({
      tipo: "repaso",
      titulo: `Repaso de foto del chat · ${activeArea()}`,
      descripcion: "Repaso programado desde una imagen adjunta al chat.",
      minutesFromNow: 120,
    });
  }
  if (action === "delete") {
    deleteChatAttachment(attachmentId);
    elements.chatAttachmentStatus.textContent = "Adjunto eliminado. Solo se ha borrado su metadato.";
    elements.chatAttachmentStatus.classList.remove("hidden");
  }
  renderChat();
  renderVisualPending();
}

function inboxContextLabels(item) {
  return {
    student: agents[item.studentId]?.name || item.alumno || item.studentId || "Alumno",
    course: item.courseName || item.courseId || item.curso || "Curso",
    subject: item.subjectName || item.subjectId || item.asignatura || "Asignatura",
    block: item.blockName || item.blockId || item.bloque || "",
  };
}

function normalizeInboxDate(value) {
  return value ? new Date(value).toLocaleDateString("es-ES") : "Sin fecha";
}

function inboxSourceKey(source, id) {
  return `${source}:${id}`;
}

function inboxStatus(baseStatus, sourceKey) {
  const override = getInboxItemState(sourceKey);
  const status = override.status || override.estado || baseStatus;
  return MATERIAL_INBOX_STATUSES.includes(status) ? status : "pendiente_clasificar";
}

function buildInboxItem(base) {
  const override = getInboxItemState(base.sourceKey);
  const materialType = MATERIAL_INBOX_TYPES.includes(override.tipo || base.materialType) ? override.tipo || base.materialType : "archivo";
  const status = inboxStatus(override.status || override.estado || base.status, base.sourceKey);
  const note = override.notaUsuario ?? override.observations ?? base.notaUsuario ?? "";
  return {
    ...base,
    ...override,
    title: override.titulo || base.titulo || base.title,
    titulo: override.titulo || base.titulo || base.title,
    materialType,
    tipo: materialType,
    origin: override.origen || base.origen || base.origin,
    origen: override.origen || base.origen || base.origin,
    studentId: override.alumno || base.alumno || base.studentId,
    alumno: override.alumno || base.alumno || base.studentId,
    courseId: override.curso || base.curso || base.courseId,
    curso: override.curso || base.curso || base.courseId,
    subjectId: override.asignatura || base.asignatura || base.subjectId || "",
    asignatura: override.asignatura || base.asignatura || base.subjectId || "",
    blockId: override.bloque || base.bloque || base.blockId || "",
    bloque: override.bloque || base.bloque || base.blockId || "",
    date: override.fecha || base.fecha || base.date,
    fecha: override.fecha || base.fecha || base.date,
    status,
    estado: status,
    notaUsuario: note,
    observations: note,
    associatedTopic: override.associatedTopic || base.associatedTopic || "",
    relacionadoConEventoId: override.relacionadoConEventoId || base.relacionadoConEventoId || "",
    relacionadoConMaterialId: override.relacionadoConMaterialId || base.relacionadoConMaterialId || "",
  };
}

function chatAttachmentInboxType(attachment) {
  if (attachment.dudaVisual) return "duda_visual";
  if (attachment.origen === "camara_chat") return "foto_camara";
  if (attachment.origen === "galeria_chat") return "foto_galeria";
  return "foto_chat";
}

function fileInboxType(file) {
  const name = String(file.fileName || "").toLowerCase();
  const mime = String(file.mimeType || "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  return "archivo";
}

function buildMaterialInboxItems() {
  const fileItems = loadFileMetadata().map((file) => {
    const type = fileInboxType(file);
    const sourceKey = inboxSourceKey("file", file.id);
    const baseStatus = file.autoDetectTopic ? "pendiente_ia_real" : "asociado_a_tema";
    return buildInboxItem({
      id: file.id,
      source: "file",
      sourceKey,
      title: file.fileName,
      titulo: file.fileName,
      materialType: type,
      tipo: type,
      origin: file.captureMode === "mobile_camera" ? "escáner móvil" : "archivo subido",
      origen: file.captureMode === "mobile_camera" ? "escáner móvil" : "archivo subido",
      studentId: file.studentId,
      courseId: file.courseId,
      subjectId: file.subjectId,
      blockId: file.blockId || file.subblockId || "",
      alumno: file.studentId,
      curso: file.courseId,
      asignatura: file.subjectId,
      bloque: file.blockId || file.subblockId || "",
      date: file.uploadedAt,
      fecha: file.uploadedAt,
      status: inboxStatus(baseStatus, sourceKey),
      badge: type === "pdf" ? "PDF" : "Archivo",
      description: `${file.materialKind || "material"} · ${file.topicName || "sin tema"} · ${file.status}`,
      raw: file,
    });
  });

  const chatItems = getAllChatAttachments().map((attachment) => {
    const sourceKey = inboxSourceKey("chat-attachment", attachment.id);
    const type = chatAttachmentInboxType(attachment);
    return buildInboxItem({
      id: attachment.id,
      source: "chat-attachment",
      sourceKey,
      title: attachment.nombreArchivo,
      titulo: attachment.nombreArchivo,
      materialType: type,
      tipo: type,
      origin: attachment.origen === "camara_chat" ? "cámara del chat" : "galería del chat",
      origen: attachment.origen === "camara_chat" ? "cámara del chat" : "galería del chat",
      studentId: attachment.alumno,
      courseId: attachment.curso,
      subjectId: attachment.asignatura,
      blockId: attachment.bloque || "",
      alumno: attachment.alumno,
      curso: attachment.curso,
      asignatura: attachment.asignatura,
      bloque: attachment.bloque || "",
      date: attachment.fecha,
      fecha: attachment.fecha,
      status: inboxStatus(attachment.temaAsociado ? "asociado_a_tema" : "pendiente_ia_real", sourceKey),
      badge: attachment.dudaVisual ? "Duda visual" : "Foto chat",
      associatedTopic: attachment.temaAsociado,
      description: `${attachment.tipoArchivo} · ${formatFileSize(attachment.tamano || 0)} · pendiente de IA real`,
      raw: attachment,
    });
  });

  const calendarItems = getAllCalendarImports().map((calendar) => {
    const sourceKey = inboxSourceKey("calendar", calendar.id);
    return buildInboxItem({
      id: calendar.id,
      source: "calendar",
      sourceKey,
      title: calendar.nombreArchivo,
      titulo: calendar.nombreArchivo,
      materialType: "calendario",
      tipo: "calendario",
      origin: "calendario subido",
      origen: "calendario subido",
      studentId: calendar.alumno,
      courseId: calendar.curso,
      subjectId: "",
      blockId: "",
      alumno: calendar.alumno,
      curso: calendar.curso,
      asignatura: "",
      bloque: "",
      date: calendar.fechaSubida,
      fecha: calendar.fechaSubida,
      status: inboxStatus("pendiente_ia_real", sourceKey),
      badge: "Calendario",
      description: `${calendar.tipoArchivo} · ${formatFileSize(calendar.tamano || 0)} · pendiente de IA real`,
      raw: calendar,
    });
  });

  const generatedItems = getAllGeneratedMaterials().map((material) => {
    const sourceKey = inboxSourceKey("generated-material", material.id);
    const isChatResponse = (material.materialType || material.tipoMaterial) === "respuesta_chat";
    return buildInboxItem({
      id: material.id,
      source: "generated-material",
      sourceKey,
      title: material.topic || material.materialTypeLabel || "Material generado",
      titulo: material.topic || material.materialTypeLabel || "Material generado",
      materialType: isChatResponse ? "respuesta_chat" : "material_generado",
      tipo: isChatResponse ? "respuesta_chat" : "material_generado",
      origin: material.origin || material.sourceType || "material generado",
      origen: material.origin || material.sourceType || "material generado",
      studentId: material.studentId,
      courseId: material.courseId,
      subjectId: material.subjectId,
      blockId: material.blockId || "",
      alumno: material.studentId,
      curso: material.courseId,
      asignatura: material.subjectId,
      bloque: material.blockId || "",
      date: material.createdAt,
      fecha: material.createdAt,
      status: inboxStatus("convertido_en_material", sourceKey),
      badge: isChatResponse ? "Respuesta chat" : "Material generado",
      relacionadoConMaterialId: material.id,
      description: `${material.materialTypeLabel || materialTypeName(material.tipoMaterial || material.materialType)} · ${material.sourceLabel || "simulado"}`,
      raw: material,
    });
  });

  const conceptItems = getAllDifficultConcepts().map((concept) => {
    const sourceKey = inboxSourceKey("difficult-concept", concept.id);
    return buildInboxItem({
      id: concept.id,
      source: "difficult-concept",
      sourceKey,
      title: concept.title,
      titulo: concept.title,
      materialType: "concepto_dificil",
      tipo: "concepto_dificil",
      origin: concept.source || "concepto difícil",
      origen: concept.source || "concepto difícil",
      studentId: concept.studentId,
      courseId: concept.courseId,
      subjectId: concept.subjectId,
      blockId: concept.blockId || "",
      alumno: concept.studentId,
      curso: concept.courseId,
      asignatura: concept.subjectId,
      bloque: concept.blockId || "",
      date: concept.createdAt,
      fecha: concept.createdAt,
      status: inboxStatus("pendiente_clasificar", sourceKey),
      badge: "Concepto difícil",
      description: concept.description || concept.sourceText || "",
      raw: concept,
    });
  });

  return [...fileItems, ...chatItems, ...calendarItems, ...generatedItems, ...conceptItems].filter((item) => item.status !== "eliminado");
}

function inboxTypeMatches(item, filter) {
  if (filter === "todos") return item.status !== "archivado";
  if (filter === "archivado") return item.status === "archivado";
  if (["pendiente_clasificar", "pendiente_ia_real"].includes(filter)) return item.status === filter;
  if (filter === "fotos") return ["foto_chat", "foto_camara", "foto_galeria", "duda_visual"].includes(item.materialType);
  if (filter === "pdf") return item.materialType === "pdf";
  if (filter === "calendario") return item.materialType === "calendario";
  if (filter === "concepto_dificil") return item.materialType === "concepto_dificil";
  if (filter === "material_generado") return ["material_generado", "respuesta_chat"].includes(item.materialType);
  return true;
}

function filteredInboxItems() {
  const type = elements.inboxTypeFilter.value;
  const subject = elements.inboxSubjectFilter.value;
  const block = elements.inboxBlockFilter.value;
  const date = elements.inboxDateFilter.value;
  return buildMaterialInboxItems()
    .filter((item) => inboxTypeMatches(item, type))
    .filter((item) => !subject || item.subjectId === subject)
    .filter((item) => !block || item.blockId === block)
    .filter((item) => !date || String(item.date || "").slice(0, 10) === date)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderInboxFilters(items) {
  const selectedSubject = elements.inboxSubjectFilter.value;
  const selectedBlock = elements.inboxBlockFilter.value;
  const subjects = [...new Set(items.map((item) => item.subjectId).filter(Boolean))];
  const blocks = [...new Set(items.map((item) => item.blockId).filter(Boolean))];
  elements.inboxSubjectFilter.innerHTML = `<option value="">Todas</option>${subjects.map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join("")}`;
  elements.inboxBlockFilter.innerHTML = `<option value="">Todos</option>${blocks.map((block) => `<option value="${escapeHtml(block)}">${escapeHtml(block)}</option>`).join("")}`;
  elements.inboxSubjectFilter.value = subjects.includes(selectedSubject) ? selectedSubject : "";
  elements.inboxBlockFilter.value = blocks.includes(selectedBlock) ? selectedBlock : "";
}

function renderMaterialInbox() {
  const allItems = buildMaterialInboxItems();
  renderInboxFilters(allItems);
  const items = filteredInboxItems();
  elements.materialInboxList.innerHTML = "";
  if (!items.length) {
    addItemCard(elements.materialInboxList, "Sin materiales en esta vista", "Cambia filtros o añade fotos, archivos, conceptos o materiales.");
    renderInboxDetail(null);
    return;
  }
  if (!items.some((item) => item.sourceKey === selectedInboxItemKey)) selectedInboxItemKey = items[0].sourceKey;
  items.forEach((item) => elements.materialInboxList.append(renderInboxListItem(item)));
  renderInboxDetail(items.find((item) => item.sourceKey === selectedInboxItemKey) || items[0]);
}

function renderInboxListItem(item) {
  const card = document.createElement("button");
  card.className = `material-inbox-item ui-level-3${item.sourceKey === selectedInboxItemKey ? " is-active" : ""}`;
  card.type = "button";
  card.dataset.inboxItem = item.sourceKey;
  const labels = inboxContextLabels(item);
  card.innerHTML = `
    <span class="source-badge"></span>
    <strong></strong>
    <small class="inbox-list-context"></small>
    <small class="inbox-list-origin"></small>
  `;
  card.querySelector(".source-badge").textContent = `${item.badge} · ${statusLabel(item.status)}`;
  card.querySelector("strong").textContent = item.title;
  card.querySelector(".inbox-list-context").textContent = `${labels.subject}${labels.block ? ` · ${labels.block}` : ""} · ${normalizeInboxDate(item.date)}`;
  card.querySelector(".inbox-list-origin").textContent = `Origen: ${item.origin}`;
  return card;
}

function statusLabel(status) {
  const labels = {
    pendiente_clasificar: "Pendiente",
    pendiente_ia_real: "IA real pendiente",
    asociado_a_tema: "Asociado a tema",
    convertido_en_material: "Convertido",
    programado_en_calendario: "Programado",
    archivado: "Archivado",
    eliminado: "Eliminado",
  };
  return labels[status] || status || "Pendiente";
}

function renderInboxDetail(item) {
  if (!item) {
    elements.materialInboxDetail.innerHTML = `<p class="drawer-copy">Selecciona un item para ver detalle y acciones.</p>`;
    return;
  }
  const labels = inboxContextLabels(item);
  elements.materialInboxDetail.innerHTML = `
    <div class="inbox-detail-head">
      <span class="source-badge">${escapeHtml(item.badge)} · ${escapeHtml(statusLabel(item.status))}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.description || "Material pendiente de organizar.")}</p>
    </div>
    <dl class="inbox-meta">
      <div><dt>Alumno</dt><dd>${escapeHtml(labels.student)}</dd></div>
      <div><dt>Curso</dt><dd>${escapeHtml(labels.course)}</dd></div>
      <div><dt>Asignatura</dt><dd>${escapeHtml(labels.subject)}</dd></div>
      <div><dt>Bloque</dt><dd>${escapeHtml(labels.block || "Sin bloque")}</dd></div>
      <div><dt>Tipo</dt><dd>${escapeHtml(item.materialType)}</dd></div>
      <div><dt>Estado</dt><dd>${escapeHtml(item.status)}</dd></div>
      <div><dt>Origen</dt><dd>${escapeHtml(item.origin)}</dd></div>
      <div><dt>Fecha</dt><dd>${escapeHtml(normalizeInboxDate(item.date))}</dd></div>
      <div><dt>Evento relacionado</dt><dd>${escapeHtml(item.relacionadoConEventoId || "No")}</dd></div>
      <div><dt>Material relacionado</dt><dd>${escapeHtml(item.relacionadoConMaterialId || "No")}</dd></div>
    </dl>
    <label class="inbox-notes-label">
      Nota de usuario
      <textarea id="inbox-observations" rows="4" placeholder="Ej. Esta foto corresponde al ejercicio 4 de metabolismo.">${escapeHtml(item.notaUsuario || "")}</textarea>
    </label>
    <div class="inbox-actions">
      <button class="secondary-button" type="button" data-inbox-action="save-notes">Guardar nota</button>
      <button class="secondary-button" type="button" data-inbox-action="topic">Asociar a tema</button>
      <button class="secondary-button" type="button" data-inbox-action="difficult">Concepto difícil</button>
      <button class="secondary-button" type="button" data-inbox-action="summary">Crear resumen</button>
      <button class="secondary-button" type="button" data-inbox-action="flashcards">Crear flashcards</button>
      <button class="secondary-button" type="button" data-inbox-action="questions">Crear preguntas</button>
      <button class="secondary-button" type="button" data-inbox-action="mock">Crear simulacro</button>
      <button class="secondary-button" type="button" data-inbox-action="schedule">Programar repaso</button>
      <button class="secondary-button" type="button" data-inbox-action="calendar">${item.materialType === "calendario" ? "Crear eventos manualmente desde este calendario" : "Añadir al calendario"}</button>
      <button class="secondary-button" type="button" data-inbox-action="archive">Archivar</button>
      <button class="secondary-button" type="button" data-inbox-action="delete">Eliminar</button>
    </div>
  `;
}

function inboxItemContext(item) {
  return {
    studentId: item.studentId || activeAgentKey(),
    courseId: item.courseId || activeErrorContext().courseId,
    subjectId: item.subjectId || activeErrorContext().subjectId,
    blockId: item.blockId || activeErrorContext().blockId,
  };
}

function createMaterialFromInboxItem(item, materialType) {
  const material = generarMaterialIA({
    sourceType: "topic",
    topic: item.associatedTopic || item.title || activeArea(),
    subtopic: "",
    pastedContent: item.description || "",
    difficulty: "medio",
    materialType,
    context: inboxItemContext(item),
    area: item.title || activeArea(),
    sourceFileIds: [item.id],
  });
  saveGeneratedMaterial(material);
  if (material.flashcards.length > 0 && item.studentId === activeAgentKey()) {
    activeAgentState().flashcards = [...material.flashcards.map((card, index) => normalizeFlashcard(card, index, "bandeja")), ...activeAgentState().flashcards].slice(0, 60);
    material.flashcards.forEach((card) => selectedFlashcards.add(card.id));
    saveState();
  }
  if (material.quiz && item.studentId === activeAgentKey()) {
    activeAgentState().mocks.unshift(material.quiz);
    saveState();
  }
  updateInboxItemState(item.sourceKey, {
    status: "convertido_en_material",
    estado: "convertido_en_material",
    relacionadoConMaterialId: material.base.id,
  });
  addAgentMessage(`Material simulado creado desde la bandeja: ${materialTypeName(materialType)}.`);
}

function handleInboxAction(action) {
  const item = buildMaterialInboxItems().find((entry) => entry.sourceKey === selectedInboxItemKey);
  if (!item) return;
  if (action === "save-notes") {
    const note = document.querySelector("#inbox-observations")?.value || "";
    updateInboxItemState(item.sourceKey, { notaUsuario: note, observations: note });
  }
  if (action === "topic") {
    const topic = window.prompt("Tema o parte asociada:", item.associatedTopic || activeArea());
    if (topic) {
      updateInboxItemState(item.sourceKey, { associatedTopic: topic, status: "asociado_a_tema" });
      if (item.source === "chat-attachment") updateChatAttachment(item.id, { temaAsociado: topic });
    }
  }
  if (action === "difficult") {
    addDifficultConcept(
      {
        title: `Concepto difícil · ${item.title}`,
        description: item.description || item.title,
        sourceText: item.description || item.title,
        sourceMessageId: item.raw?.sourceMessageId || item.raw?.asociadoAMensajeChat || "",
      },
      inboxItemContext(item)
    );
    updateInboxItemState(item.sourceKey, { status: "convertido_en_material", estado: "convertido_en_material" });
  }
  if (action === "summary") createMaterialFromInboxItem(item, "resumen");
  if (action === "flashcards") createMaterialFromInboxItem(item, "flashcards");
  if (action === "questions" || action === "mock") createMaterialFromInboxItem(item, "simulacro");
  if (action === "schedule" || action === "calendar") {
    const start = new Date(Date.now() + 120 * 60000);
    const end = new Date(start.getTime() + 30 * 60000);
    const plannerEvent = addPlannerEvent(
      {
        tipo: item.materialType === "calendario" ? "personal" : "repaso",
        titulo: item.materialType === "calendario" ? `Evento desde calendario · ${item.title}` : `Repaso de bandeja · ${item.title}`,
        descripcion: item.description || "Evento creado desde Bandeja de material.",
        fechaInicio: isoInput(start),
        fechaFin: isoInput(end),
        prioridad: "media",
      },
      { ...inboxItemContext(item), blockName: item.blockId || "" }
    );
    updateInboxItemState(item.sourceKey, {
      status: "programado_en_calendario",
      estado: "programado_en_calendario",
      relacionadoConEventoId: plannerEvent?.id || "",
    });
    addAgentMessage(`Añadido al calendario desde Bandeja de material: ${item.title}.`);
    renderPlanner();
    renderUpcomingEvents();
  }
  if (action === "archive") setInboxItemStatus(item.sourceKey, "archivado");
  if (action === "delete") setInboxItemStatus(item.sourceKey, "eliminado");
  renderMaterialInbox();
  renderVisualPending();
  renderDifficultConcepts();
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
    label.className = "material-file-option ui-level-3";
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
    renderMaterialHistory();
    return;
  }

  if (material?.summary) {
    const summary = document.createElement("article");
    summary.className = "course-summary material-summary ui-level-2";
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
    elements.materialGeneratorResult.prepend(renderGeneratedMaterialCard(material));
  }

  renderMaterialHistory();
}

function renderMaterialHistory() {
  const filter = elements.materialHistoryFilter.value;
  const allItems = getGeneratedMaterialsByContext(activeErrorContext());
  const items = filter === "todos" ? allItems : allItems.filter((item) => (item.tipoMaterial || item.materialType) === filter);
  elements.materialHistoryList.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "drawer-copy";
    empty.textContent = allItems.length === 0 ? "Aún no hay materiales generados en este bloque." : "No hay materiales de este tipo en el bloque.";
    elements.materialHistoryList.append(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "material-history-card ui-level-3";
    card.innerHTML = `
      <div>
        <span class="source-badge"></span>
        <strong></strong>
        <p></p>
      </div>
      <div class="material-history-actions">
        <button class="secondary-button" type="button" data-open-material="">Abrir</button>
        <button class="secondary-button" type="button" data-send-history-material-inbox="">Enviar a bandeja</button>
        <button class="secondary-button" type="button" data-print-history-material="">Imprimir / PDF</button>
        <button class="secondary-button" type="button" data-delete-material="">Eliminar</button>
      </div>
    `;
    card.querySelector(".source-badge").textContent = item.sourceLabel || "🧪 Simulado por ahora";
    card.querySelector("strong").textContent = item.topic || activeArea();
    card.querySelector("p").textContent = `${item.materialTypeLabel || materialTypeName(item.tipoMaterial || item.materialType)} · ${item.origin || item.sourceType} · ${new Date(item.createdAt).toLocaleDateString("es-ES")}`;
    card.querySelector("[data-open-material]").dataset.openMaterial = item.id;
    card.querySelector("[data-send-history-material-inbox]").dataset.sendHistoryMaterialInbox = item.id;
    card.querySelector("[data-print-history-material]").dataset.printHistoryMaterial = item.id;
    card.querySelector("[data-delete-material]").dataset.deleteMaterial = item.id;
    elements.materialHistoryList.append(card);
  });
}

function materialTypeName(type) {
  const names = {
    resumen: "Resumen",
    flashcards: "Flashcards",
    simulacro: "Simulacro",
    conceptos_clave: "Conceptos clave",
    errores_frecuentes: "Errores frecuentes",
    pack_completo: "Pack completo",
    todo: "Pack completo",
    respuesta_chat: "Respuesta del chat",
    concepto_dificil: "Concepto difícil",
  };
  return names[type] || type || "Material";
}

function materialFromHistoryRecord(item) {
  if (item.printableMaterial) return item.printableMaterial;
  return {
    base: {
      ...item,
      materialTypeLabel: materialTypeName(item.tipoMaterial || item.materialType),
      visualRecommendation: item.visualRecommendation || "Imagen no necesaria",
      visualReason: item.visualReason || "Material histórico guardado antes de la ampliación del historial.",
      sourceLabel: item.sourceLabel || "🧪 Simulado por ahora",
    },
    summary: null,
    flashcards: [],
    quiz: null,
    keyConcepts: [],
    expectedErrors: [],
  };
}

function openMaterialFromHistory(materialId) {
  const item = getGeneratedMaterialsByContext(activeErrorContext()).find((material) => material.id === materialId);
  if (!item) return;
  renderMaterialResult(materialFromHistoryRecord(item));
}

function printMaterialFromHistory(materialId) {
  const item = getGeneratedMaterialsByContext(activeErrorContext()).find((material) => material.id === materialId);
  if (!item) return;
  printGeneratedMaterial(materialFromHistoryRecord(item));
}

function deleteMaterialFromHistory(materialId) {
  const ok = window.confirm("¿Eliminar este material del historial?");
  if (!ok) return;
  deleteGeneratedMaterial(materialId);
  renderMaterialResult();
}

function sendGeneratedMaterialToInbox(materialId) {
  updateInboxItemState(inboxSourceKey("generated-material", materialId), {
    status: "pendiente_clasificar",
    estado: "pendiente_clasificar",
    relacionadoConMaterialId: materialId,
  });
  selectedInboxItemKey = inboxSourceKey("generated-material", materialId);
  renderMaterialInbox();
  addAgentMessage("Material enviado a Bandeja de material para clasificar o reutilizar.");
}

function renderGeneratedMaterialCard(material) {
  const context = activeFileContext();
  const card = document.createElement("article");
  card.className = "generated-material-card ui-level-2";
  card.innerHTML = `
    <div class="generated-material-head">
      <div>
        <span class="source-badge"></span>
        <h4>${escapeHtml(material.base.topic || activeArea())}</h4>
        <p>${escapeHtml(context.studentName)} · ${escapeHtml(context.courseName)} · ${escapeHtml(context.subjectName)}${context.subblockName ? ` · ${escapeHtml(context.subblockName)}` : ""}</p>
      </div>
      <div class="generated-material-actions no-print">
        <span class="progress-pill">${escapeHtml(material.base.materialTypeLabel || material.base.materialType)}</span>
        <button class="secondary-button" type="button" data-send-material-inbox="">Enviar a bandeja</button>
        <button class="secondary-button" type="button" data-print-material="">Imprimir / Guardar PDF</button>
      </div>
    </div>
    <div class="training-grid material-counts">
      <article class="mini-card ui-level-3"><strong>Conceptos</strong><span>${material.keyConcepts?.length || material.summary?.keyConcepts?.length || 0}</span></article>
      <article class="mini-card ui-level-3"><strong>Flashcards</strong><span>${material.flashcards.length}</span></article>
      <article class="mini-card ui-level-3"><strong>Simulacro</strong><span>${material.quiz ? material.quiz.questions.length : 0} preguntas</span></article>
      <article class="mini-card ui-level-3"><strong>Visual</strong><span>${escapeHtml(material.base.visualRecommendation)}</span></article>
    </div>
    <div class="generated-material-content"></div>
  `;
  card.querySelector("[data-send-material-inbox]").addEventListener("click", () => sendGeneratedMaterialToInbox(material.base.id));
  card.querySelector("[data-print-material]").addEventListener("click", () => printGeneratedMaterial(material));
  card.querySelector(".source-badge").textContent = material.base.sourceLabel;
  const content = card.querySelector(".generated-material-content");

  if (material.base.sourceText && material.base.materialType === "respuesta_chat") {
    content.append(renderGeneratedList("Respuesta archivada", [material.base.sourceText]));
  }
  if (material.keyConcepts?.length) {
    content.append(renderGeneratedList("Conceptos clave", material.keyConcepts.map((item) => item.text)));
  }
  if (material.expectedErrors?.length) {
    content.append(renderGeneratedList("Errores frecuentes", material.expectedErrors.map((item) => item.text)));
  }
  if (material.flashcards.length) {
    content.append(renderGeneratedList("Flashcards generadas", material.flashcards.map((cardItem) => `${cardItem.question} · ${cardItem.answer}`)));
  }
  if (material.quiz) {
    content.append(renderGeneratedList("Simulacro generado", material.quiz.questions.map((question) => `${question.statement} · Correcta: ${question.correctAnswer}`)));
  }

  const visual = document.createElement("div");
  visual.className = "visual-recommendation";
  visual.innerHTML = `<strong>${escapeHtml(material.base.visualRecommendation)}</strong><span>${escapeHtml(material.base.visualReason)}</span>`;
  content.append(visual);

  return card;
}

function printGeneratedMaterial(material) {
  elements.printArea.innerHTML = buildPrintableMaterial(material);
  window.print();
}

function buildPrintableMaterial(material) {
  const context = activeFileContext();
  const generatedAt = new Date(material.base.createdAt).toLocaleString("es-ES");
  const sections = [];
  if (material.summary) {
    sections.push(`
      <section class="print-material-section">
        <h2>Resumen</h2>
        <p>${escapeHtml(material.summary.explanation)}</p>
        ${printList("Conceptos clave", material.summary.keyConcepts)}
        ${printList("Esquema rápido", material.summary.outline)}
        ${printList("Errores esperables", material.summary.expectedErrors)}
        <p><strong>Consejo:</strong> ${escapeHtml(material.summary.examTip)}</p>
      </section>
    `);
  }
  if (material.base.sourceText && material.base.materialType === "respuesta_chat") {
    sections.push(`<section class="print-material-section"><h2>Respuesta archivada</h2><p>${escapeHtml(material.base.sourceText)}</p></section>`);
  }
  if (material.keyConcepts?.length) {
    sections.push(`<section class="print-material-section"><h2>Conceptos clave</h2>${printList("", material.keyConcepts.map((item) => item.text))}</section>`);
  }
  if (material.expectedErrors?.length) {
    sections.push(`<section class="print-material-section"><h2>Errores frecuentes</h2>${printList("", material.expectedErrors.map((item) => item.text))}</section>`);
  }
  if (material.flashcards.length) {
    sections.push(`<section class="print-material-section"><h2>Flashcards</h2>${printList("", material.flashcards.map((card) => `${card.question} — ${card.answer}`))}</section>`);
  }
  if (material.quiz) {
    sections.push(`<section class="print-material-section"><h2>Simulacro</h2>${printList("", material.quiz.questions.map((question) => `${question.statement} Respuesta: ${question.correctAnswer}. ${question.explanation}`))}</section>`);
  }

  return `
    <article class="printable-material">
      <header class="print-header">
        <p>Estudios PRO — Material generado</p>
        <h1>${escapeHtml(material.base.topic || activeArea())}</h1>
        <span>${escapeHtml(context.studentName)} · ${escapeHtml(context.courseName)} · ${escapeHtml(context.subjectName)}${context.subblockName ? ` · ${escapeHtml(context.subblockName)}` : ""}</span>
      </header>
      <dl class="print-material-meta">
        <div><dt>Fuente</dt><dd>${escapeHtml(material.base.sourceLabel)}</dd></div>
        <div><dt>Tipo</dt><dd>${escapeHtml(material.base.materialTypeLabel || material.base.materialType)}</dd></div>
        <div><dt>Fecha</dt><dd>${escapeHtml(generatedAt)}</dd></div>
        <div><dt>Apoyo visual</dt><dd>${escapeHtml(material.base.visualRecommendation || "Imagen no necesaria")}</dd></div>
      </dl>
      ${sections.join("")}
      <section class="print-material-section">
        <h2>Recomendación visual</h2>
        <p><strong>${escapeHtml(material.base.visualRecommendation || "Imagen no necesaria")}:</strong> ${escapeHtml(material.base.visualReason || "Sin apoyo visual adicional.")}</p>
      </section>
    </article>
  `;
}

function printList(title, items = []) {
  if (!items.length) return "";
  return `
    ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
    <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
  `;
}

function renderGeneratedList(title, items) {
  const section = document.createElement("section");
  section.className = "generated-list ui-level-3";
  section.innerHTML = `<h5>${escapeHtml(title)}</h5><ul></ul>`;
  const list = section.querySelector("ul");
  items.slice(0, 6).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
  return section;
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

  const material = generarMaterialIA({
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

function currentMockExam() {
  if (state.focus?.type !== "mock") return null;
  let mock = activeGeneratedMock();
  if (!mock) {
    mock = generarSimulacro({
      context: activeErrorContext(),
      area: state.focus.area,
      studentId: activeAgentKey(),
      source: "manual",
    });
    activeAgentState().mocks.unshift(mock);
    saveState();
  }
  return {
    ...mock,
    questions: (mock.questions || []).slice(0, 5),
  };
}

function renderMockExam(mock) {
  const context = activeFileContext();
  const questions = mock?.questions || [];
  elements.focusExplanation.innerHTML = `
    <div class="mock-exam-panel">
      <div class="mock-exam-intro ui-level-2">
        <span class="source-badge">🧪 Simulacro en modo simulación</span>
        <h2>Simulacro de examen</h2>
        <p>${escapeHtml(context.courseName)} · ${escapeHtml(context.subjectName)} · ${escapeHtml(context.subblockName || "Bloque general")}</p>
        <p>Responde como si fuera una prueba corta. Al corregir verás aciertos, fallos, explicación breve y conceptos a repasar.</p>
      </div>
      <form id="mock-exam-form" class="mock-exam-form">
        ${questions
          .map(
            (question, questionIndex) => `
              <fieldset class="mock-question ui-level-3">
                <legend>${questionIndex + 1}. ${escapeHtml(question.statement || question.prompt || "Pregunta simulada")}</legend>
                <div class="mock-options">
                  ${(question.options || ["Respuesta breve razonada", "No lo sé"])
                    .map(
                      (option, optionIndex) => `
                        <label class="exam-option">
                          <input type="radio" name="question-${questionIndex}" value="${String.fromCharCode(65 + optionIndex)}" data-answer="${escapeHtml(option)}" />
                          <span class="exam-option-letter">${String.fromCharCode(65 + optionIndex)}.</span>
                          <span class="exam-option-text">${escapeHtml(option)}</span>
                        </label>
                      `
                    )
                    .join("")}
                </div>
              </fieldset>
            `
          )
          .join("")}
      </form>
      <div class="mock-exam-actions">
        <button class="primary-button ui-action-primary" type="button" data-mock-action="correct">Corregir simulacro</button>
        <button class="secondary-button ui-action-secondary" type="button" data-mock-action="save">Guardar intento</button>
        <button class="secondary-button ui-action-secondary" type="button" data-mock-action="calendar">Añadir repaso al calendario</button>
      </div>
      <div id="mock-exam-result" class="mock-exam-result" aria-live="polite"></div>
    </div>
  `;
}

function readMockExamAnswers() {
  return Array.from(elements.focusExplanation.querySelectorAll(".mock-question")).map((questionNode, index) => {
    const selected = questionNode.querySelector(`input[name="question-${index}"]:checked`);
    return selected?.dataset.answer || "";
  });
}

function correctMockExam({ saveAttempt = false } = {}) {
  const mock = currentMockExam();
  if (!mock) return null;
  const answers = readMockExamAnswers();
  const corrections = mock.questions.map((question, index) => {
    const selected = answers[index];
    const correct = selected === question.correctAnswer;
    return {
      question: question.statement || question.prompt,
      selected,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "Corrección simulada.",
      correct,
      concept: question.errorType || question.topic || activeArea(),
    };
  });
  const hits = corrections.filter((item) => item.correct).length;
  const misses = corrections.length - hits;
  const attempt = {
    id: crypto.randomUUID ? crypto.randomUUID() : `mock-attempt-${Date.now()}`,
    mockId: mock.id || mock.title,
    area: activeArea(),
    context: activeErrorContext(),
    answers,
    hits,
    misses,
    total: corrections.length,
    createdAt: new Date().toISOString(),
  };
  if (saveAttempt) {
    activeAgentState().mockAttempts.unshift(attempt);
    saveState();
  }
  renderMockExamCorrection(corrections, attempt, saveAttempt);
  return attempt;
}

function renderMockExamCorrection(corrections, attempt, saved = false) {
  const result = elements.focusExplanation.querySelector("#mock-exam-result");
  if (!result) return;
  const concepts = corrections.filter((item) => !item.correct).map((item) => item.concept || activeArea());
  result.innerHTML = `
    <article class="mock-correction ui-level-2">
      <span class="source-badge">${saved ? "Intento guardado" : "Corrección simulada"}</span>
      <h3>Resultado: ${attempt.hits}/${attempt.total} aciertos</h3>
      <p><strong>Fallos:</strong> ${attempt.misses}. ${attempt.misses ? "Repasa los conceptos marcados antes de repetir el simulacro." : "Buen intento: consolida con un repaso breve."}</p>
      <div class="mock-correction-list">
        ${corrections
          .map(
            (item, index) => `
              <section class="ui-level-3">
                <strong>${index + 1}. ${item.correct ? "Correcta" : "A revisar"}</strong>
                <p>Tu respuesta: ${escapeHtml(item.selected || "sin responder")}</p>
                <p>Correcta: ${escapeHtml(item.correctAnswer || "respuesta razonada")}</p>
                <p>${escapeHtml(item.explanation)}</p>
              </section>
            `
          )
          .join("")}
      </div>
      <p><strong>Conceptos a repasar:</strong> ${escapeHtml(concepts.length ? [...new Set(concepts)].join(", ") : activeArea())}</p>
      <button class="secondary-button ui-action-secondary" type="button" data-mock-action="flashcards-errors">Crear flashcards desde errores</button>
    </article>
  `;
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
    item.className = `flashcard-study-card ui-level-3 origin-${slugify(card.origin || card.source || "base")}`;
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
    notice.className = "mini-card ui-level-3 flashcard-notice";
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
    <span class="ui-level-3">Total: ${counts.total}</span>
    <span class="ui-level-3">Pendientes: ${counts.pendiente}</span>
    <span class="ui-level-3">En repaso: ${counts.repaso}</span>
    <span class="ui-level-3">Superados: ${counts.superado}</span>
    <span class="ui-level-3">Tipo mas frecuente: ${topType}</span>
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
  return responderChat({
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
    <div class="course-summary ui-level-2"><strong>${safe(plan.title)}</strong><br>${safe(plan.summary)}</div>
    <div class="plan-grid">
      ${plan.days
        .map(
          (day) => `
      <article class="plan-day ui-level-3">
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
    <div class="review-block ui-level-2"><h3>Repaso final</h3><ul>${plan.review.map((item) => `<li>${safe(item)}</li>`).join("")}</ul></div>
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
  const created = generarSimulacro({
    context: activeErrorContext(),
    area: activeArea(),
    studentId: activeAgentKey(),
    source: "manual",
  });
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
  const isMockMode = state.focus.type === "mock";
  const typeLabels = {
    planned: activeAgent().modeNames.planned,
    rapid: activeAgent().modeNames.rapid,
    course: "Curso personalizado",
    mock: "Simulacro de examen",
    flashcards: "Flashcards",
  };
  const focusTitle = typeLabels[state.focus.type] || "Modo foco";
  elements.focusView.classList.toggle("mock-exam-mode", isMockMode);
  const focusLevelLabel = elements.focusView.querySelector(".focus-header .ui-level-label");
  if (focusLevelLabel) focusLevelLabel.textContent = isMockMode ? "Nivel 1 · Simulacro" : "Nivel 1 · Modo foco";
  elements.exitFocus.textContent = "← Volver al panel principal";
  elements.focusKicker.textContent = `${activeAgent().name} · ${state.focus.area}`;
  elements.focusTitle.textContent = focusTitle;
  elements.focusSubtitle.textContent = isMockMode ? "Examen simulado, sin chat ni ayuda del profesor." : "Modo foco activo.";
  elements.focusProgressPill.textContent = `${state.focus.progress}%`;
  elements.focusTaskTitle.textContent = `${focusTitle} · ${state.focus.area}`;
  if (isMockMode) {
    renderMockExam(currentMockExam());
    elements.focusExercises.innerHTML = "";
    elements.focusErrors.innerHTML = "";
    data.insights.filter(([title]) => title.includes("Errores")).forEach(([, text]) => addItemCard(elements.focusErrors, "Vigila", text));
    renderFocusFlashcards();
    elements.focusChatMessages.innerHTML = "";
    return;
  }
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
  renderDifficultConcepts();
  renderPlanner();
  renderUpcomingEvents();
  renderVisualPending();
  renderMaterialInbox();
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
elements.showDifficultConcepts.addEventListener("click", () => {
  openToolScreen("concepts");
  renderDifficultConcepts();
});
elements.showPlanner.addEventListener("click", () => {
  openToolScreen("planner");
  renderPlanner();
});
elements.showVisualPending.addEventListener("click", () => {
  openToolScreen("visualPending");
  renderVisualPending();
});
elements.showPlanningAssistant.addEventListener("click", () => {
  openToolScreen("planningAssistant");
  setQuickPlanKind("today");
});
elements.showMaterialInbox.addEventListener("click", () => {
  openToolScreen("materialInbox");
  renderMaterialInbox();
});
elements.showMaterialGenerator.addEventListener("click", () => {
  openToolScreen("generateMaterial");
  renderMaterialGeneratorFields();
  renderMaterialResult();
});
elements.whatStudyNow.addEventListener("click", renderWhatStudyNowResult);
elements.dashboardQuickAccess.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dashboard-action]");
  if (!button) return;
  handleDashboardAction(button.dataset.dashboardAction);
});
elements.nextActionResult.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dashboard-action]");
  if (!button) return;
  handleDashboardAction(button.dataset.dashboardAction);
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
elements.expandChat.addEventListener("click", () => setChatExpanded(true));
elements.collapseChat.addEventListener("click", () => setChatExpanded(false));

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

function handleChatPhotoSelected(event, origin) {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;
  const userMessage = addChatMessage(activeAgent().name, `Foto adjunta: ${file.name}`, "user");
  const attachment = addChatAttachment(file, activeVisualContext(), userMessage.id, origin);
  const originLabel = origin === "camara_chat" ? "cámara" : "galería";
  elements.chatAttachmentStatus.textContent = `Foto adjunta como metadato: ${attachment.nombreArchivo}. Pendiente de IA real.`;
  elements.chatAttachmentStatus.classList.remove("hidden");
  elements.chatPhotoOptions.classList.add("hidden");
  elements.chatPhotoToggle.setAttribute("aria-expanded", "false");
  addAgentMessage(`He recibido la imagen desde ${originLabel} como referencia. Cuando conectemos IA visual podré analizarla directamente. De momento, escribe qué parte quieres que te explique.`);
  renderChat();
  renderVisualPending();
  event.target.value = "";
}

elements.chatPhotoToggle.addEventListener("click", () => {
  const isHidden = elements.chatPhotoOptions.classList.toggle("hidden");
  elements.chatPhotoToggle.setAttribute("aria-expanded", String(!isHidden));
});

elements.chatCameraTrigger.addEventListener("click", () => {
  elements.chatCameraInput.click();
});

elements.chatGalleryTrigger.addEventListener("click", () => {
  elements.chatGalleryInput.click();
});

elements.chatCameraInput.addEventListener("change", (event) => handleChatPhotoSelected(event, "camara_chat"));
elements.chatGalleryInput.addEventListener("change", (event) => handleChatPhotoSelected(event, "galeria_chat"));

elements.chatMessages.addEventListener("click", (event) => {
  const attachmentButton = event.target.closest("[data-chat-attachment-action]");
  if (attachmentButton) {
    const card = attachmentButton.closest("[data-chat-attachment-id]");
    if (card) handleChatAttachmentAction(attachmentButton.dataset.chatAttachmentAction, card.dataset.chatAttachmentId);
    return;
  }
  const button = event.target.closest("[data-chat-response-action]");
  if (!button) return;
  handleChatResponseAction(button.dataset.chatResponseAction, button.dataset.messageId);
});

elements.quickChatChips.addEventListener("click", (event) => {
  const planChip = event.target.closest("[data-plan-kind]");
  if (planChip) {
    openToolScreen("planningAssistant");
    setQuickPlanKind(planChip.dataset.planKind);
    return;
  }
  const chip = event.target.closest("[data-chat-prompt]");
  if (!chip) return;
  elements.chatInput.value = chip.dataset.chatPrompt;
  if (typeof elements.chatForm.requestSubmit === "function") {
    elements.chatForm.requestSubmit();
  } else {
    elements.chatForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }
});

elements.historyShortcut.addEventListener("click", () => {
  openToolScreen("generateMaterial");
  renderMaterialGeneratorFields();
  renderMaterialResult();
  elements.materialHistoryList.scrollIntoView({ block: "start" });
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
  if (button.dataset.errorAction === "schedule") {
    const error = getErrorsByContext(activeErrorContext()).find((item) => item.id === button.dataset.errorId);
    schedulePlannerEvent({
      tipo: "repaso",
      titulo: `Repaso de error · ${error?.title || activeArea()}`,
      descripcion: error?.description || "Repaso programado desde memoria de errores.",
      minutesFromNow: 120,
    });
  }
  if (button.dataset.errorAction === "delete") deleteError(button.dataset.errorId);
  render();
});

elements.trainingFlashcards.addEventListener("click", createFlashcardsFromErrors);
elements.trainingMock.addEventListener("click", createMockFromErrors);
elements.trainingReviewBlock.addEventListener("click", markActiveBlockAsReviewed);
elements.trainingBack.addEventListener("click", closeToolScreens);
elements.conceptsCreateFlashcards.addEventListener("click", () => createFlashcardsFromDifficultConcepts());
elements.conceptsCreateMock.addEventListener("click", () => createMockFromDifficultConcepts());
elements.conceptsScheduleReview.addEventListener("click", () => {
  const count = getDifficultConceptsByContext(activeErrorContext()).length;
  schedulePlannerEvent({
    tipo: "repaso",
    titulo: `Repaso de conceptos difíciles · ${activeArea()}`,
    descripcion: `${count} concepto(s) difícil(es) guardado(s) para revisar.`,
    minutesFromNow: 90,
  });
  openToolScreen("planner");
});
elements.difficultConceptsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-concept-action]");
  if (!button) return;
  const conceptId = button.dataset.conceptId;
  if (button.dataset.conceptAction === "inbox") {
    updateInboxItemState(inboxSourceKey("difficult-concept", conceptId), {
      status: "pendiente_clasificar",
      estado: "pendiente_clasificar",
    });
    selectedInboxItemKey = inboxSourceKey("difficult-concept", conceptId);
    openToolScreen("materialInbox");
    renderMaterialInbox();
  }
  if (button.dataset.conceptAction === "review") markDifficultConceptReviewed(conceptId);
  if (button.dataset.conceptAction === "flashcards") createFlashcardsFromDifficultConcepts([conceptId]);
  if (button.dataset.conceptAction === "questions") createMockFromDifficultConcepts([conceptId]);
  if (button.dataset.conceptAction === "delete") deleteDifficultConcept(conceptId);
  renderDifficultConcepts();
});
document.querySelectorAll("[data-planner-view]").forEach((button) =>
  button.addEventListener("click", () => {
    plannerView = button.dataset.plannerView;
    renderPlanner();
  })
);
elements.plannerPrev.addEventListener("click", () => {
  if (plannerView === "month") plannerDate.setMonth(plannerDate.getMonth() - 1);
  if (plannerView === "week") plannerDate.setDate(plannerDate.getDate() - 7);
  if (plannerView === "day") plannerDate.setDate(plannerDate.getDate() - 1);
  renderPlanner();
});
elements.plannerNext.addEventListener("click", () => {
  if (plannerView === "month") plannerDate.setMonth(plannerDate.getMonth() + 1);
  if (plannerView === "week") plannerDate.setDate(plannerDate.getDate() + 7);
  if (plannerView === "day") plannerDate.setDate(plannerDate.getDate() + 1);
  renderPlanner();
});
elements.plannerToday.addEventListener("click", () => {
  plannerDate = new Date();
  renderPlanner();
});
elements.plannerEventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const eventDate = elements.plannerEventDate.value;
  const startTime = elements.plannerEventStartTime.value;
  const endDate = elements.plannerEventEndDate.value || eventDate;
  const endTime = elements.plannerEventEndTime.value;
  const durationMinutes = Number(elements.plannerEventDuration.value || 0);
  if (!eventDate) return;
  const startDateTime = `${eventDate}T${startTime || "00:00"}`;
  let endDateTime = "";
  if (endTime || elements.plannerEventEndDate.value) {
    endDateTime = `${endDate}T${endTime || (startTime || "23:59")}`;
  } else if (durationMinutes && startTime) {
    endDateTime = isoInput(new Date(new Date(startDateTime).getTime() + durationMinutes * 60000));
  }
  const data = {
    tipo: elements.plannerEventType.value,
    titulo: elements.plannerEventTitle.value.trim(),
    descripcion: elements.plannerEventDescription.value.trim(),
    fechaInicio: startDateTime,
    fechaFin: endDateTime,
    durationMinutes,
    allDay: !startTime,
    prioridad: elements.plannerEventPriority.value,
  };
  if (elements.plannerEventId.value) {
    updatePlannerEvent(elements.plannerEventId.value, data);
  } else {
    addPlannerEvent(data, activePlannerContext());
  }
  elements.plannerEventForm.reset();
  elements.plannerEventId.value = "";
  renderPlanner();
});
elements.calendarImportInput.addEventListener("change", (event) => {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;
  const calendarImport = addCalendarImport(file, activeVisualContext());
  elements.calendarImportStatus.textContent = `Calendario guardado como referencia: ${calendarImport.nombreArchivo}. Pendiente de IA real.`;
  elements.calendarImportStatus.className = "upload-status success";
  renderVisualPending();
  event.target.value = "";
});
elements.calendarManualEvent.addEventListener("click", () => {
  const start = new Date(Date.now() + 60 * 60000);
  const end = new Date(start.getTime() + 45 * 60000);
  elements.plannerEventId.value = "";
  elements.plannerEventType.value = "personal";
  elements.plannerEventTitle.value = "Evento desde calendario subido";
  elements.plannerEventDescription.value = "Añadido manualmente mirando el calendario subido como referencia.";
  elements.plannerEventDate.value = isoInput(start).slice(0, 10);
  elements.plannerEventStartTime.value = isoInput(start).slice(11, 16);
  elements.plannerEventEndDate.value = "";
  elements.plannerEventEndTime.value = isoInput(end).slice(11, 16);
  elements.plannerEventDuration.value = 45;
  elements.plannerEventPriority.value = "media";
  elements.plannerEventTitle.focus();
});
elements.plannerPlanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generateAutomaticPlan(
    {
      asignatura: elements.plannerPlanSubject.value.trim() || activeAgentState().subject,
      bloqueTema: elements.plannerPlanTopic.value.trim() || activeAgentState().block,
      fechaExamen: elements.plannerExamDate.value,
      nivelInicial: elements.plannerInitialLevel.value,
      tiempoDiario: elements.plannerDailyTime.value,
      diasSemana: elements.plannerDaysWeek.value,
      objetivo: elements.plannerGoal.value,
      incluirDescansos: elements.plannerIncludeBreaks.checked,
      incluirEjercicio: elements.plannerIncludeExercise.checked,
    },
    activePlannerContext()
  );
  renderPlanner();
});
elements.plannerCalendar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-id]");
  if (!button) return;
  const plannerEvent = getPlannerEventsByContext(activePlannerContext()).find((item) => item.id === button.dataset.eventId);
  if (plannerEvent) fillPlannerEventForm(plannerEvent);
});
elements.plannerCalendar.addEventListener("dragstart", (event) => {
  const button = event.target.closest("[data-event-id]");
  if (!button) return;
  event.dataTransfer.setData("text/plain", button.dataset.eventId);
});
elements.plannerCalendar.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-date]")) event.preventDefault();
});
elements.plannerCalendar.addEventListener("drop", (event) => {
  const cell = event.target.closest("[data-date]");
  if (!cell) return;
  event.preventDefault();
  movePlannerEvent(event.dataTransfer.getData("text/plain"), cell.dataset.date);
  renderPlanner();
});
elements.plannerEventList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-planner-action]");
  if (!button) return;
  const plannerEvent = getPlannerEventsByContext(activePlannerContext()).find((item) => item.id === button.dataset.eventId);
  if (!plannerEvent) return;
  if (button.dataset.plannerAction === "edit") fillPlannerEventForm(plannerEvent);
  if (button.dataset.plannerAction === "complete") openReflection(plannerEvent.id);
  if (button.dataset.plannerAction === "delete") {
    deletePlannerEvent(plannerEvent.id);
    renderPlanner();
  }
});
elements.plannerReflectionClose.addEventListener("click", closeReflection);
elements.plannerReflectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  completePlannerEvent(elements.plannerReflectionEventId.value, {
    entendido: elements.plannerUnderstood.value.trim(),
    repasar: elements.plannerReviewNeeded.value.trim(),
    dificultad: elements.plannerDifficulty.value,
  });
  closeReflection();
  renderPlanner();
});
document.querySelectorAll("[data-plan-kind]").forEach((button) => button.addEventListener("click", () => setQuickPlanKind(button.dataset.planKind)));
elements.quickPlanForm.addEventListener("submit", createQuickPlanPreview);
elements.quickPlanResult.addEventListener("click", (event) => {
  if (event.target.closest("#save-quick-plan")) saveQuickPlan();
});
elements.visualPendingList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-visual-pending-action]");
  const card = button?.closest("[data-pending-id]");
  if (!button || !card) return;
  handleVisualPendingAction(button.dataset.visualPendingAction, card.dataset.pendingKind, card.dataset.pendingId);
});
elements.materialInboxList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-inbox-item]");
  if (!card) return;
  selectedInboxItemKey = card.dataset.inboxItem;
  renderMaterialInbox();
});
elements.materialInboxDetail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-inbox-action]");
  if (!button) return;
  handleInboxAction(button.dataset.inboxAction);
});
[elements.inboxTypeFilter, elements.inboxSubjectFilter, elements.inboxBlockFilter, elements.inboxDateFilter].forEach((control) => {
  control.addEventListener("change", () => {
    selectedInboxItemKey = "";
    renderMaterialInbox();
  });
});
elements.materialSourceType.addEventListener("change", renderMaterialGeneratorFields);
elements.materialGeneratorForm.addEventListener("submit", createGeneratedMaterial);
elements.materialHistoryFilter.addEventListener("change", renderMaterialHistory);
elements.materialHistoryList.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-material]");
  const sendButton = event.target.closest("[data-send-history-material-inbox]");
  const printButton = event.target.closest("[data-print-history-material]");
  const deleteButton = event.target.closest("[data-delete-material]");
  if (openButton) openMaterialFromHistory(openButton.dataset.openMaterial);
  if (sendButton) sendGeneratedMaterialToInbox(sendButton.dataset.sendHistoryMaterialInbox);
  if (printButton) printMaterialFromHistory(printButton.dataset.printHistoryMaterial);
  if (deleteButton) deleteMaterialFromHistory(deleteButton.dataset.deleteMaterial);
});
elements.focusCreateFlashcardsErrors.addEventListener("click", createFlashcardsFromErrors);
elements.focusCreateMockErrors.addEventListener("click", createMockFromErrors);
elements.focusReviewMode.addEventListener("click", () => startReviewMode());
elements.focusSelectAllFlashcards.addEventListener("click", selectAllFlashcards);
elements.focusDeselectFlashcards.addEventListener("click", deselectFlashcards);
elements.focusPrintSelected.addEventListener("click", () => printFlashcards(selectedVisibleFlashcards(), true));
elements.focusPrintAll.addEventListener("click", () => printFlashcards(activeVisibleFlashcards()));
elements.focusPrintQa.addEventListener("click", () => printFlashcards(activeVisibleFlashcards()));
elements.focusScheduleFlashcards.addEventListener("click", () =>
  schedulePlannerEvent({
    tipo: "repaso",
    titulo: `Repaso de flashcards · ${activeArea()}`,
    descripcion: "Sesión programada desde el módulo de flashcards.",
    minutesFromNow: 180,
  })
);
elements.focusScheduleMock.addEventListener("click", () =>
  schedulePlannerEvent({
    tipo: "simulacro",
    titulo: `Simulacro · ${activeArea()}`,
    descripcion: "Simulacro añadido desde modo foco.",
    minutesFromNow: 240,
    duration: 45,
  })
);
elements.focusView.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mock-action]");
  if (!button) return;
  const action = button.dataset.mockAction;
  if (action === "correct") correctMockExam();
  if (action === "save") correctMockExam({ saveAttempt: true });
  if (action === "calendar") {
    schedulePlannerEvent({
      tipo: "simulacro",
      titulo: `Repaso de simulacro · ${activeArea()}`,
      descripcion: "Repaso programado desde el simulacro de examen.",
      minutesFromNow: 240,
      duration: 30,
    });
  }
  if (action === "flashcards-errors") createFlashcardsFromErrors();
});
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
