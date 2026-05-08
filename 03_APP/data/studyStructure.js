export const STUDY_STRUCTURE = {
  juan: {
    name: "Juan",
    priority: true,
    defaultCourseId: "1_bachillerato",
    defaultSubjectId: "dibujo_tecnico",
    defaultBlockId: "sistema_diedrico",
    courses: {
      "1_bachillerato": {
        name: "1º Bachillerato",
        subjects: {
          dibujo_tecnico: {
            name: "Dibujo Tecnico",
            blocks: {
              sistema_diedrico: { name: "Sistema diedrico" },
              normalizacion: { name: "Normalizacion" },
              geometria_plana: { name: "Geometria plana" },
              perspectiva: { name: "Perspectiva" },
            },
          },
          lengua: {
            name: "Lengua",
            blocks: {
              literatura: { name: "Literatura" },
              analisis_gramatical: { name: "Analisis gramatical" },
              comentario_texto: { name: "Comentario de texto" },
              sintaxis: { name: "Sintaxis" },
              morfologia: { name: "Morfologia" },
              pau_lengua: { name: "PAU Lengua" },
            },
          },
          matematicas: {
            name: "Matematicas",
            blocks: {
              funciones: { name: "Funciones" },
              trigonometria: { name: "Trigonometria" },
              probabilidad: { name: "Probabilidad" },
              algebra: { name: "Algebra" },
            },
          },
          fisica_quimica: {
            name: "Fisica y Quimica",
            blocks: {
              cinematica: { name: "Cinematica" },
              dinamica: { name: "Dinamica" },
              estequiometria: { name: "Estequiometria" },
              enlace_quimico: { name: "Enlace quimico" },
            },
          },
          ingles: {
            name: "Ingles",
            blocks: {
              reading: { name: "Reading" },
              writing: { name: "Writing" },
              grammar: { name: "Grammar" },
              use_of_english: { name: "Use of English" },
            },
          },
        },
      },
      "2_bachillerato": {
        name: "2º Bachillerato",
        subjects: {
          dibujo_tecnico: {
            name: "Dibujo Tecnico",
            blocks: {
              diedrico_avanzado: { name: "Diedrico avanzado" },
              axonometria: { name: "Axonometria" },
              normalizacion: { name: "Normalizacion" },
              pau_dibujo: { name: "PAU Dibujo" },
            },
          },
          lengua: {
            name: "Lengua",
            blocks: {
              literatura: { name: "Literatura" },
              analisis_gramatical: { name: "Analisis gramatical" },
              comentario_texto: { name: "Comentario de texto" },
              sintaxis: { name: "Sintaxis" },
              morfologia: { name: "Morfologia" },
              pau_lengua: { name: "PAU Lengua" },
            },
          },
          matematicas_ii: {
            name: "Matematicas II",
            blocks: {
              matrices: { name: "Matrices" },
              integrales: { name: "Integrales" },
              vectores: { name: "Vectores" },
              probabilidad: { name: "Probabilidad" },
            },
          },
          fisica: {
            name: "Fisica",
            blocks: {
              campo_gravitatorio: { name: "Campo gravitatorio" },
              campo_electrico: { name: "Campo electrico" },
              ondas: { name: "Ondas" },
              optica: { name: "Optica" },
            },
          },
          ingles: {
            name: "Ingles",
            blocks: {
              pau_reading: { name: "PAU Reading" },
              writing: { name: "Writing" },
              grammar: { name: "Grammar" },
              vocabulary: { name: "Vocabulary" },
            },
          },
        },
      },
    },
  },
  carlota: {
    name: "Carlota🥰",
    defaultCourseId: "1_medicina_ucv",
    defaultSubjectId: "anatomia",
    defaultBlockId: "generalidades",
    courses: {
      "1_medicina_ucv": {
        name: "1º Medicina UCV",
        subjects: {
          anatomia: {
            name: "Anatomia",
            blocks: {
              generalidades: { name: "Generalidades" },
              craneo: { name: "Craneo" },
              miembro_superior: { name: "Miembro superior" },
              miembro_inferior: { name: "Miembro inferior" },
            },
          },
          bioquimica: {
            name: "Bioquimica",
            blocks: {
              proteinas: { name: "Proteinas" },
              enzimas: { name: "Enzimas" },
              metabolismo: { name: "Metabolismo" },
            },
          },
        },
      },
      "2_medicina_ucv": {
        name: "2º Medicina UCV",
        subjects: {
          fisiologia: {
            name: "Fisiologia",
            blocks: {
              respiratorio: { name: "Respiratorio" },
              renal: { name: "Renal" },
              digestivo: { name: "Digestivo" },
              endocrino: { name: "Endocrino" },
            },
          },
          microbiologia: {
            name: "Microbiologia",
            blocks: {
              bacterias: { name: "Bacterias" },
              virus: { name: "Virus" },
              hongos: { name: "Hongos" },
              antibioticos: { name: "Antibioticos" },
            },
          },
        },
      },
      "3_medicina_ucv": {
        name: "3º Medicina UCV",
        subjects: {
          farmacologia: {
            name: "Farmacologia",
            blocks: {
              farmacocinetica: { name: "Farmacocinetica" },
              sna: { name: "SNA" },
              antibioticos: { name: "Antibioticos" },
              cardiofarmacos: { name: "Cardiofarmacos" },
            },
          },
          patologia_general: {
            name: "Patologia General",
            blocks: {
              inflamacion: { name: "Inflamacion" },
              neoplasia: { name: "Neoplasia" },
              hemodinamica: { name: "Hemodinamica" },
              reparacion: { name: "Reparacion" },
            },
          },
        },
      },
      "4_medicina_ucv": {
        name: "4º Medicina UCV",
        subjects: {
          cardiologia: {
            name: "Cardiologia",
            blocks: {
              ecg: { name: "ECG" },
              insuficiencia_cardiaca: { name: "Insuficiencia cardiaca" },
              valvulopatias: { name: "Valvulopatias" },
              cardiopatia_isquemica: { name: "Cardiopatia isquemica" },
            },
          },
          neumologia: {
            name: "Neumologia",
            blocks: {
              epoc: { name: "EPOC" },
              asma: { name: "Asma" },
              tep: { name: "TEP" },
              neumonia: { name: "Neumonia" },
            },
          },
        },
      },
      "5_medicina_ucv": {
        name: "5º Medicina UCV",
        subjects: {
          pediatria: {
            name: "Pediatria",
            blocks: {
              neonatologia: { name: "Neonatologia" },
              crecimiento: { name: "Crecimiento" },
              infecciones: { name: "Infecciones" },
              urgencias: { name: "Urgencias" },
            },
          },
          ginecologia: {
            name: "Ginecologia",
            blocks: {
              obstetricia: { name: "Obstetricia" },
              gine_oncologica: { name: "Gine oncologica" },
              anticoncepcion: { name: "Anticoncepcion" },
              parto: { name: "Parto" },
            },
          },
        },
      },
      "6_medicina_ucv": {
        name: "6º Medicina UCV",
        subjects: {
          rotatorio_clinico: {
            name: "Rotatorio Clinico",
            blocks: {
              medicina_interna: { name: "Medicina interna" },
              cirugia: { name: "Cirugia" },
              pediatria: { name: "Pediatria" },
              urgencias: { name: "Urgencias" },
            },
          },
          ecoe: {
            name: "ECOE",
            blocks: {
              comunicacion: { name: "Comunicacion" },
              exploracion: { name: "Exploracion" },
              diagnostico: { name: "Diagnostico" },
              plan_terapeutico: { name: "Plan terapeutico" },
            },
          },
        },
      },
    },
  },
  gonzalo: {
    name: "Gonzalo",
    defaultCourseId: "1_eso",
    defaultSubjectId: "matematicas",
    defaultBlockId: "numeros_enteros",
    courses: {
      "1_eso": {
        name: "1º ESO",
        subjects: {
          matematicas: {
            name: "Matematicas",
            blocks: {
              numeros_enteros: { name: "Numeros enteros" },
              fracciones: { name: "Fracciones" },
              proporcionalidad: { name: "Proporcionalidad" },
              geometria: { name: "Geometria" },
            },
          },
          lengua: {
            name: "Lengua",
            blocks: {
              comprension_lectora: { name: "Comprension lectora" },
              morfologia: { name: "Morfologia" },
              sintaxis_simple: { name: "Sintaxis simple" },
              redaccion: { name: "Redaccion" },
            },
          },
          biologia: {
            name: "Biologia",
            blocks: {
              celula: { name: "Celula" },
              seres_vivos: { name: "Seres vivos" },
              ecosistemas: { name: "Ecosistemas" },
            },
          },
        },
      },
      "2_eso": {
        name: "2º ESO",
        subjects: {
          matematicas: {
            name: "Matematicas",
            blocks: {
              algebra: { name: "Algebra" },
              ecuaciones: { name: "Ecuaciones" },
              funciones: { name: "Funciones" },
              probabilidad: { name: "Probabilidad" },
            },
          },
          fisica_quimica: {
            name: "Fisica y Quimica",
            blocks: {
              materia: { name: "Materia" },
              fuerzas: { name: "Fuerzas" },
              energia: { name: "Energia" },
              cambios_quimicos: { name: "Cambios quimicos" },
            },
          },
        },
      },
      "3_eso": {
        name: "3º ESO",
        subjects: {
          matematicas: {
            name: "Matematicas",
            blocks: {
              polinomios: { name: "Polinomios" },
              sistemas: { name: "Sistemas" },
              funciones: { name: "Funciones" },
              estadistica: { name: "Estadistica" },
            },
          },
          fisica_quimica: {
            name: "Fisica y Quimica",
            blocks: {
              formulacion: { name: "Formulacion" },
              movimiento: { name: "Movimiento" },
              electricidad: { name: "Electricidad" },
              reacciones: { name: "Reacciones" },
            },
          },
        },
      },
      "4_eso": {
        name: "4º ESO",
        subjects: {
          matematicas: {
            name: "Matematicas",
            blocks: {
              funciones: { name: "Funciones" },
              trigonometria: { name: "Trigonometria" },
              ecuaciones: { name: "Ecuaciones" },
              probabilidad: { name: "Probabilidad" },
            },
          },
          fisica_quimica: {
            name: "Fisica y Quimica",
            blocks: {
              cinematica: { name: "Cinematica" },
              dinamica: { name: "Dinamica" },
              quimica: { name: "Quimica" },
              energia: { name: "Energia" },
            },
          },
        },
      },
    },
  },
};

function entriesToList(collection = {}) {
  return Object.entries(collection).map(([id, item]) => ({ id, name: item.name, ...item }));
}

function findByIdOrName(collection = {}, value) {
  return Object.entries(collection).find(([id, item]) => id === value || item.name === value);
}

export function getCoursesForAgent(agentKey) {
  return entriesToList(STUDY_STRUCTURE[agentKey]?.courses);
}

export function getSubjectsForCourse(agentKey, courseValue) {
  const course = findByIdOrName(STUDY_STRUCTURE[agentKey]?.courses, courseValue)?.[1];
  return entriesToList(course?.subjects);
}

export function getBlocksForSubject(agentKey, courseValue, subjectValue) {
  const subject = getSubjectsForCourse(agentKey, courseValue).find((item) => item.id === subjectValue || item.name === subjectValue);
  return entriesToList(subject?.blocks);
}

export function getDefaultContext(agentKey) {
  const structure = STUDY_STRUCTURE[agentKey];
  const course = structure.courses[structure.defaultCourseId];
  const subject = course.subjects[structure.defaultSubjectId];
  const block = subject.blocks[structure.defaultBlockId];
  return {
    defaultCourse: course.name,
    defaultSubject: subject.name,
    defaultBlock: block.name,
  };
}

export function getContextIds(agentKey, context) {
  const courseEntry = findByIdOrName(STUDY_STRUCTURE[agentKey]?.courses, context.course);
  const subjectEntry = findByIdOrName(courseEntry?.[1]?.subjects, context.subject);
  const blockEntry = findByIdOrName(subjectEntry?.[1]?.blocks, context.block);
  return {
    courseId: courseEntry?.[0] || "",
    subjectId: subjectEntry?.[0] || "",
    subblockId: blockEntry?.[0] || "",
  };
}

export function ensureValidContext(agentKey, context) {
  const courses = getCoursesForAgent(agentKey);
  const course = courses.find((item) => item.name === context.course || item.id === context.course) || courses[0];
  const subjects = getSubjectsForCourse(agentKey, course?.name);
  const subject = subjects.find((item) => item.name === context.subject || item.id === context.subject) || subjects[0];
  const blocks = getBlocksForSubject(agentKey, course?.name, subject?.name);
  const block = blocks.find((item) => item.name === context.block || item.id === context.block) || blocks[0];
  return {
    course: course?.name || "",
    subject: subject?.name || "",
    block: block?.name || "",
  };
}
