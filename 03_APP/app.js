import { loadAppState, saveAppState } from "./services/storageService.js";
import { buildSimulatedAnswer as buildAIResponse } from "./services/aiService.js";
import { addError, createError, getVisibleErrors } from "./services/errorMemoryService.js";
import {
  buildCoursePlan as buildSimulatedCoursePlan,
  createFlashcardsForArea,
  createMockForArea,
} from "./services/courseService.js";

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
    courses: {
      "1º Bachillerato": {
        "Dibujo Tecnico": ["Sistema diedrico", "Normalizacion", "Geometria plana", "Perspectiva"],
        Matematicas: ["Funciones", "Trigonometria", "Algebra", "Estadistica"],
        "Fisica y Quimica": ["Cinematica", "Dinamica", "Estequiometria", "Enlace quimico"],
        Lengua: ["Literatura", "Analisis gramatical", "Comentario de texto", "Sintaxis", "Morfologia", "PAU Lengua"],
        Ingles: ["Reading", "Writing", "Grammar", "Use of English"],
      },
      "2º Bachillerato": {
        "Dibujo Tecnico": ["Diedrico avanzado", "Axonometria", "Normalizacion", "PAU Dibujo"],
        "Matematicas II": ["Matrices", "Integrales", "Vectores", "Probabilidad"],
        Fisica: ["Campo gravitatorio", "Campo electrico", "Ondas", "Optica"],
        Lengua: ["Literatura", "Analisis gramatical", "Comentario de texto", "Sintaxis", "Morfologia", "PAU Lengua"],
        Ingles: ["PAU Reading", "Writing", "Grammar", "Vocabulary"],
      },
    },
    defaultCourse: "1º Bachillerato",
    defaultSubject: "Dibujo Tecnico",
    defaultBlock: "Sistema diedrico",
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
    courses: {
      "1º Medicina": {
        "Anatomia I": ["Osteologia", "Miembro superior", "Torax", "Neuroanatomia basica"],
        "Biologia Celular": ["Membrana", "Ciclo celular", "Señalizacion", "Apoptosis"],
        Bioquimica: ["Proteinas", "Enzimas", "Metabolismo", "Bioenergetica"],
        Histologia: ["Epitelial", "Conectivo", "Muscular", "Nervioso"],
        "Fisiologia I": ["Homeostasis", "Neurofisiologia", "Sangre", "Cardiovascular basico"],
      },
      "2º Medicina": {
        "Anatomia II": ["Abdomen", "Pelvis", "Cabeza y cuello", "Sistema nervioso"],
        "Fisiologia II": ["Respiratorio", "Renal", "Digestivo", "Endocrino"],
        Genetica: ["Herencia", "Mutaciones", "Citogenetica", "Genomica"],
        Microbiologia: ["Bacterias", "Virus", "Hongos", "Antibioticos"],
        Inmunologia: ["Innata", "Adaptativa", "Hipersensibilidad", "Autoinmunidad"],
      },
      "3º Medicina": {
        Farmacologia: ["Farmacocinetica", "SNA", "Antibioticos", "Cardiofarmacos"],
        "Patologia General": ["Inflamacion", "Neoplasia", "Hemodinamica", "Reparacion"],
        Semiologia: ["Historia clinica", "Exploracion", "Sindromes", "Razonamiento clinico"],
        Radiologia: ["Torax", "Abdomen", "TAC", "RM"],
        Epidemiologia: ["Riesgo", "Sesgos", "Estudios", "Cribado"],
      },
      "4º Medicina": {
        Cardiologia: ["ECG", "Insuficiencia cardiaca", "Valvulopatias", "Cardiopatia isquemica"],
        Neumologia: ["EPOC", "Asma", "TEP", "Neumonia"],
        Digestivo: ["Hepatologia", "EII", "Pancreas", "Hemorragia digestiva"],
        Nefrologia: ["IRA", "ERC", "Electrolitos", "Glomerulopatias"],
        Neurologia: ["Ictus", "Epilepsia", "Cefaleas", "Demencias"],
      },
      "5º Medicina": {
        Pediatria: ["Neonatologia", "Crecimiento", "Infecciones", "Urgencias"],
        Ginecologia: ["Obstetricia", "Gine oncologica", "Anticoncepcion", "Parto"],
        Psiquiatria: ["Depresion", "Psicosis", "Ansiedad", "Adicciones"],
        Traumatologia: ["Fracturas", "Luxaciones", "Columna", "Rodilla"],
        Dermatologia: ["Lesiones elementales", "Melanoma", "Psoriasis", "Infecciones"],
      },
      "6º Medicina": {
        "Rotatorio Clinico": ["Medicina interna", "Cirugia", "Pediatria", "Urgencias"],
        Urgencias: ["ABCDE", "Shock", "Sepsis", "Dolor toracico"],
        ECOE: ["Comunicacion", "Exploracion", "Diagnostico", "Plan terapeutico"],
      },
    },
    defaultCourse: "1º Medicina",
    defaultSubject: "Anatomia I",
    defaultBlock: "Osteologia",
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
    courses: {
      "1º ESO": {
        Matematicas: ["Numeros enteros", "Fracciones", "Proporcionalidad", "Geometria"],
        Lengua: ["Comprension lectora", "Morfologia", "Sintaxis simple", "Redaccion"],
        Ingles: ["Present simple", "Vocabulary", "Reading", "Writing"],
        "Biologia y Geologia": ["Celula", "Seres vivos", "Ecosistemas", "Geosfera"],
        "Geografia e Historia": ["Mapas", "Prehistoria", "Edad Antigua", "Climas"],
      },
      "2º ESO": {
        Matematicas: ["Algebra", "Ecuaciones", "Funciones", "Probabilidad"],
        Lengua: ["Sintaxis", "Literatura", "Texto expositivo", "Ortografia"],
        Ingles: ["Past simple", "Comparatives", "Listening", "Writing"],
        "Fisica y Quimica": ["Materia", "Fuerzas", "Energia", "Cambios quimicos"],
        "Geografia e Historia": ["Edad Media", "Poblacion", "Ciudades", "Arte"],
      },
      "3º ESO": {
        Matematicas: ["Polinomios", "Sistemas", "Funciones", "Estadistica"],
        Lengua: ["Oracion compuesta", "Comentario", "Literatura medieval", "Léxico"],
        Ingles: ["Present perfect", "Conditionals", "Reading", "Writing"],
        "Fisica y Quimica": ["Formulacion", "Movimiento", "Electricidad", "Reacciones"],
        "Biologia y Geologia": ["Cuerpo humano", "Salud", "Relieve", "Rocas"],
      },
      "4º ESO": {
        Matematicas: ["Funciones", "Trigonometria", "Ecuaciones", "Probabilidad"],
        Lengua: ["Sintaxis", "Comentario", "Literatura", "Argumentacion"],
        Ingles: ["Passive", "Reported speech", "Writing", "Use of English"],
        "Fisica y Quimica": ["Cinematica", "Dinamica", "Quimica", "Energia"],
        Historia: ["Siglo XIX", "Guerras mundiales", "España contemporanea", "Democracia"],
      },
    },
    defaultCourse: "1º ESO",
    defaultSubject: "Matematicas",
    defaultBlock: "Numeros enteros",
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

const defaultErrors = {
  juan: [
    { area: "Dibujo Tecnico", text: "No justificar trazas ni cambios de plano en sistema diedrico.", status: "pendiente" },
    { area: "Dibujo Tecnico", text: "Confundir verdadera magnitud con proyeccion abatida.", status: "mejorando" },
    { area: "Lengua · Analisis gramatical", text: "Confundir atributo con complemento directo.", status: "pendiente" },
    { area: "Lengua · Sintaxis", text: "No delimitar la subordinada antes de asignar funcion.", status: "pendiente" },
  ],
  carlota: [
    { area: "Anatomia I", text: "Confundir ramas terminales del plexo braquial.", status: "pendiente" },
    { area: "Bioquimica", text: "Fallar preguntas con doble negacion en test avanzado.", status: "mejorando" },
  ],
  gonzalo: [
    { area: "Matematicas", text: "Cambiar signos al pasar terminos de lado.", status: "pendiente" },
    { area: "Lengua", text: "Responder sin justificar.", status: "mejorando" },
  ],
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
  errorForm: document.querySelector("#error-form"),
  errorInput: document.querySelector("#error-input"),
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

function firstKey(object) {
  return Object.keys(object)[0];
}

function getAgentDefaults(agentKey) {
  const agent = agents[agentKey];
  return {
    course: agent.defaultCourse,
    subject: agent.defaultSubject,
    block: agent.defaultBlock,
    mode: "planned",
    chat: [],
    focusChat: [],
    errors: defaultErrors[agentKey] || [],
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
    next.agents[key] = { ...base.agents[key], ...(rawState?.agents?.[key] || {}) };
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
  const agent = activeAgent();
  const agentState = activeAgentState();
  return agent.courses[agentState.course]?.[agentState.subject] || [];
}

function activeArea() {
  const agentState = activeAgentState();
  if (activeAgentKey() === "juan" && agentState.subject === "Lengua") {
    return `Lengua · ${agentState.block}`;
  }
  return agentState.subject;
}

function getStudyData(area = activeArea()) {
  return defaultsByArea[area] || defaultsByArea[activeAgentState().subject] || defaultsByArea.Matematicas;
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
  elements.metricErrors.textContent = String(agentState.errors.length);
  elements.modePill.textContent = agent.modeNames[agentState.mode];
}

function renderCourses() {
  const agent = activeAgent();
  const agentState = activeAgentState();
  elements.courseList.innerHTML = "";
  elements.courseSelect.innerHTML = "";
  Object.keys(agent.courses).forEach((course) => {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    option.selected = course === agentState.course;
    elements.courseSelect.append(option);

    elements.courseList.append(
      createButton(course, "choice-button", course === agentState.course, () => {
        agentState.course = course;
        agentState.subject = firstKey(agent.courses[course]);
        agentState.block = agent.courses[course][agentState.subject][0];
        addAgentMessage(`Curso cambiado a ${course}. Empezamos por ${agentState.subject}.`);
        saveState();
        render();
      })
    );
  });
}

function renderSubjectsAndBlocks() {
  const agent = activeAgent();
  const agentState = activeAgentState();
  const subjects = agent.courses[agentState.course] || {};
  elements.subjectList.innerHTML = "";
  elements.subjectSelect.innerHTML = "";
  Object.keys(subjects).forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    option.selected = subject === agentState.subject;
    elements.subjectSelect.append(option);

    elements.subjectList.append(
      createButton(subject, "subject-button", subject === agentState.subject, () => {
        agentState.subject = subject;
        agentState.block = subjects[subject][0];
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
  const files = activeAgentState().files;
  elements.fileList.textContent =
    files.length === 0 ? "Todavia no hay archivos subidos." : `Archivos simulados para ${activeAgent().name}: ${files.join(", ")}.`;
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
  const agentState = activeAgentState();
  const area = activeArea();
  const list = getVisibleErrors(agentState.errors, { area, subject: agentState.subject });
  elements.errorsList.innerHTML = "";
  list.forEach((error) => {
    const item = document.createElement("li");
    item.innerHTML = "<strong></strong><span></span><br><small></small>";
    item.querySelector("strong").textContent = error.area;
    item.querySelector("span").textContent = error.text;
    item.querySelector("small").textContent = `Estado: ${error.status}`;
    elements.errorsList.append(item);
  });
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
  const agent = activeAgent();
  const agentState = activeAgentState();
  agentState.course = elements.courseSelect.value;
  agentState.subject = firstKey(agent.courses[agentState.course]);
  agentState.block = agent.courses[agentState.course][agentState.subject][0];
  saveState();
  render();
});
elements.subjectSelect.addEventListener("change", () => {
  const agent = activeAgent();
  const agentState = activeAgentState();
  agentState.subject = elements.subjectSelect.value;
  agentState.block = agent.courses[agentState.course][agentState.subject][0];
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
  document.querySelector("#errors-section").classList.toggle("hidden");
});
elements.plannedMode.addEventListener("click", () => setMode("planned"));
elements.rapidMode.addEventListener("click", () => setMode("rapid"));
elements.customFocusAction.addEventListener("click", () => {
  document.querySelector("#errors-section").classList.add("hidden");
  elements.customCourseForm.closest(".drawer").classList.toggle("hidden");
});
elements.mockExamAction.addEventListener("click", createMock);
elements.flashcardsAction.addEventListener("click", createFlashcards);
elements.exitFocus.addEventListener("click", exitFocusMode);

elements.fileInput.addEventListener("change", (event) => {
  activeAgentState().files = Array.from(event.target.files).map((file) => file.name);
  saveState();
  renderFiles();
  addAgentMessage("Archivos recibidos. En este MVP solo guardo los nombres; el analisis real llegara con IA.");
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
  const text = elements.errorInput.value.trim();
  if (!text) return;
  activeAgentState().errors = addError(activeAgentState().errors, createError({ area: activeArea(), text }));
  elements.errorInput.value = "";
  saveState();
  render();
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
