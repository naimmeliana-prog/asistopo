import { OppositionData, SyllabusBlock, OfficialExam, PracticalCase } from "../types";

// Dynamic keywords analyzer
function analyzeKeywords(title: string) {
  const t = title.toLowerCase();
  
  let group = "C1";
  if (t.includes("auxiliar") || t.includes("reparto") || t.includes("celador") || t.includes("escala basica")) {
    group = "C2";
  } else if (t.includes("gestion") || t.includes("tecnico") || t.includes("subinspector") || t.includes("ejecutiva")) {
    group = "A2";
  } else if (t.includes("letrado") || t.includes("superior") || t.includes("ingeniero") || t.includes("facultativo")) {
    group = "A1";
  }

  let adminType: "Estatal" | "Autonómica" | "Local" | "Universitaria" = "Estatal";
  let region = "Nacional";
  
  if (t.includes("valencia") || t.includes("generalitat") || t.includes("dogv") || t.includes("valenciana")) {
    adminType = "Autonómica";
    region = "Comunidad Valenciana";
  } else if (t.includes("madrid") || t.includes("bocm")) {
    adminType = "Autonómica";
    region = "Comunidad de Madrid";
  } else if (t.includes("andalucia") || t.includes("junta")) {
    adminType = "Autonómica";
    region = "Andalucía";
  } else if (t.includes("aragon") || t.includes("zaragoza")) {
    adminType = "Autonómica";
    region = "Aragón";
  } else if (t.includes("galicia") || t.includes("xunta")) {
    adminType = "Autonómica";
    region = "Galicia";
  } else if (t.includes("ayuntamiento") || t.includes("diputacion") || t.includes("cabildo") || t.includes("municipio")) {
    adminType = "Local";
    region = "Local";
  }

  let sector = "Administrativo";
  if (t.includes("bombero") || t.includes("fuego") || t.includes("incendio")) {
    sector = "Bomberos";
  } else if (t.includes("policia") || t.includes("seguridad") || t.includes("civil") || t.includes("guardia")) {
    sector = "Policía";
  } else if (t.includes("justicia") || t.includes("tramitacion") || t.includes("auxilio") || t.includes("procesal")) {
    sector = "Justicia";
  } else if (t.includes("correos") || t.includes("postal") || t.includes("reparto")) {
    sector = "Correos";
  } else if (t.includes("celador") || t.includes("salud") || t.includes("enfermero") || t.includes("sanitario")) {
    sector = "Sanidad";
  }

  return { group, adminType, region, sector };
}

export function generateClientOpposition(title: string, description: string = ""): OppositionData {
  const { group, adminType, region, sector } = analyzeKeywords(title);
  
  const shortName = title.split(" - ")[0].slice(0, 30);
  const id = title.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Generate customized syllabus based on the sector and region
  const syllabus: SyllabusBlock[] = [];
  
  // Block 1: Derecho Constitucional y Organización del Estado
  const block1Topics = [
    {
      id: "t1",
      title: "La Constitución Española de 1978: Estructura, valores superiores y derechos fundamentales",
      articles: ["Art. 1 CE", "Art. 2 CE", "Art. 9 CE", "Art. 14 CE", "Art. 15 a 29 CE"],
      content: "La Constitución Española como norma suprema. Valores superiores: libertad, justicia, igualdad, pluralismo político. El principio de legalidad y la jerarquía normativa. Análisis pormenorizado de los derechos fundamentales y libertades públicas."
    },
    {
      id: "t2",
      title: `Organización de la Administración Pública de destino (${adminType}) y su marco estatutario`,
      articles: adminType === "Estatal" ? ["Art. 97 a 107 CE", "Ley 40/2015"] : ["Estatuto de Autonomía", "Ley del Gobierno Regional"],
      content: "Estudio de las instituciones de gobierno. El consejo de ministros o consejo de gobierno autonómico. Las delegaciones de competencias, régimen de funcionamiento y órganos colegiados de control técnico."
    }
  ];
  
  // Block 2: Derecho Administrativo y Procedimiento
  const block2Topics = [
    {
      id: "t3",
      title: "El acto administrativo: Concepto, clases, validez, nulidad y anulabilidad",
      articles: ["Art. 34 a 48 Ley 39/2015", "Art. 47 Ley 39/2015", "Art. 48 Ley 39/2015"],
      content: "Concepto de acto administrativo. Requisitos de validez de las resoluciones. Eficiencia inmediata y demorada. El artículo 47 regula las causas tasadas de nulidad de pleno derecho, mientras que el 48 regula los vicios de anulabilidad."
    },
    {
      id: "t4",
      title: "El procedimiento administrativo común: Fases de iniciación, ordenación, instrucción y terminación",
      articles: ["Art. 54 a 95 Ley 39/2015", "Art. 21 Ley 39/2015", "Art. 24 Ley 39/2015"],
      content: "El derecho a un procedimiento con plazos ciertos. Iniciación de oficio o a instancia de parte. Reglas de cómputo de plazos por días hábiles, meses o años. Silencio administrativo positivo y negativo, y su acreditación formal."
    }
  ];

  // Block 3: Sector Specific Block
  const block3Topics: any[] = [];
  if (sector === "Justicia") {
    block3Topics.push(
      {
        id: "t5",
        title: "El personal de la Administración de Justicia: Cuerpos Generales y Letrados de la AJ",
        articles: ["Art. 470 a 485 LOPJ", "Art. 452 LOPJ"],
        content: "Organización de los Cuerpos Generales de funcionarios judiciales. Derechos, deberes y acceso a los puestos de Auxilio Judicial, Tramitación y Gestión Procesal."
      },
      {
        id: "t6",
        title: "Los actos procesales: Resoluciones del Juez y resoluciones del Letrado de la AJ",
        articles: ["Art. 206 LEC", "Art. 452 LEC", "Art. 456 LOPJ"],
        content: "Diferenciación estricta entre providencias, autos y sentencias (dictadas por Jueces) y actas, diligencias y decretos (competencia exclusiva de los Letrados de la AJ)."
      }
    );
  } else if (sector === "Correos") {
    block3Topics.push(
      {
        id: "t5",
        title: "El Servicio Postal Universal: Ámbito, condiciones de prestación y régimen de reserva",
        articles: ["Ley 43/2010 del Servicio Postal Universal", "Directiva 97/67/CE"],
        content: "Régimen del servicio postal universal encomendado a la Sociedad Estatal Correos y Telégrafos. Derechos de los usuarios postales, plazos de entrega ordinarios y certificados de correos."
      },
      {
        id: "t6",
        title: "Procesos de admisión, clasificación, transporte y distribución postal",
        articles: ["Reglamento de Correos 2024", "Normativa de Envíos Certificados"],
        content: "Admisión masiva y de red. Criterios técnicos de clasificación automatizada de correspondencia. Distribución final a domicilio y plazos legales para avisos de entrega certificada."
      }
    );
  } else if (sector === "Policía" || sector === "Bomberos") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley Orgánica de Fuerzas y Cuerpos de Seguridad: Principios básicos de actuación",
        articles: ["LO 2/1986", "Constitución Española Art. 104"],
        content: "Principios de jerarquía, proporcionalidad, oportunidad, congruencia y neutralidad política de los agentes del Estado en el mantenimiento del orden público."
      },
      {
        id: "t6",
        title: "Prevención, protección ciudadana y gestión de emergencias",
        articles: ["Ley 17/2015 del Sistema Nacional de Protección Civil"],
        content: "Estructura de mando operativo en situaciones de siniestro o riesgo catastrófico. Coordinación interadministrativa del 112 y planes territoriales de emergencia."
      }
    );
  } else {
    // General Admin / Sanidad / etc
    block3Topics.push(
      {
        id: "t5",
        title: "El Estatuto Básico del Empleado Público: Clases de personal y derechos fundamentales",
        articles: ["Art. 8 a 13 TREBEP", "Art. 14 a 15 TREBEP"],
        content: "Régimen jurídico del personal funcionario de carrera, interino, laboral y eventual. Derechos retributivos, carrera profesional y principios de mérito y capacidad en el acceso."
      },
      {
        id: "t6",
        title: "Régimen disciplinario y pérdida de la condición de funcionario",
        articles: ["Art. 93 a 98 TREBEP", "Ley de Incompatibilidades 53/1984"],
        content: "Tipificación de faltas disciplinarias muy graves, graves y leves. Sanciones aplicables, procedimiento sancionador preferente y causas tasadas de jubilación o renuncia."
      }
    );
  }

  syllabus.push({
    id: "b1",
    title: "Bloque I: Derecho Constitucional y Organización Administrativa",
    weight: 25,
    topics: block1Topics
  });
  syllabus.push({
    id: "b2",
    title: "Bloque II: Procedimiento Administrativo y Función Pública",
    weight: 45,
    topics: block2Topics
  });
  syllabus.push({
    id: "b3",
    title: `Bloque III: Temas Específicos de ${sector}`,
    weight: 30,
    topics: block3Topics
  });

  // Generate realistic official exams for testing
  const officialExams: OfficialExam[] = [
    {
      year: 2024,
      location: "Sede Central de Exámenes",
      questionsCount: 3,
      questions: [
        {
          question: `Según la Constitución Española de 1978, ¿cuál de las siguientes opciones define la forma política del Estado español?`,
          options: [
            "La República representativa y parlamentaria",
            "La Monarquía parlamentaria",
            "La Monarquía federal constitucional",
            "La Democracia directa de asambleas"
          ],
          correctIndex: 1,
          justification: "El artículo 1.3 de la Constitución Española de 1978 dispone literalmente que 'La forma política del Estado español es la Monarquía parlamentaria'."
        },
        {
          question: `Conforme al artículo 40 de la Ley 39/2015, ¿cuál es el plazo de días hábiles obligatorio dentro del cual el órgano debe cursar la notificación del acto a los interesados?`,
          options: [
            "Dentro de los 5 días hábiles siguientes",
            "Dentro de los 10 días hábiles siguientes a la fecha en que el acto haya sido dictado",
            "Dentro de los 15 días naturales posteriores",
            "De forma inmediata en el mismo día del dictamen"
          ],
          correctIndex: 1,
          justification: "El artículo 40.2 de la Ley 39/2015 estipula que toda notificación deberá ser cursada dentro del plazo de diez días hábiles a partir de la fecha en que el acto haya sido dictado."
        },
        {
          question: `De acuerdo con el Estatuto del Empleado Público, ¿cuál de los siguientes es un ejemplo de personal eventual?`,
          options: [
            "El funcionario nombrado para suplir una baja temporal de larga duración",
            "El personal contratado laboral fijo por concurso-oposición",
            "El que, en virtud de nombramiento y con carácter no permanente, realiza funciones expresamente calificadas como de confianza o asesoramiento especial",
            "Aquel que realiza trabajos auxiliares de secretaría de forma permanente"
          ],
          correctIndex: 2,
          justification: "El artículo 12 del TREBEP define al personal eventual como aquel que, en virtud de nombramiento y con carácter no permanente, realiza únicamente funciones de confianza o asesoramiento especial, siendo retribuido con cargo a créditos específicos."
        }
      ]
    },
    {
      year: 2023,
      location: "Recinto Ferial de Oposiciones",
      questionsCount: 2,
      questions: [
        {
          question: `¿Cuál de las siguientes causas se considera un vicio que produce la nulidad de pleno derecho del acto administrativo?`,
          options: [
            "Cualquier infracción del ordenamiento jurídico, incluso la desviación de poder",
            "Los dictados por órganos manifiestamente incompetentes por razón de la materia o del territorio",
            "El retraso formal en la notificación del acto al interesado",
            "La falta de firma digital por un funcionario del subgrupo C2"
          ],
          correctIndex: 1,
          justification: "Según el artículo 47.1.b de la Ley 39/2015, son nulos de pleno derecho los actos dictados por órganos manifiestamente incompetentes por razón de la materia o del territorio."
        },
        {
          question: `¿Qué efecto general tiene el transcurso del plazo máximo legal sin que la administración dicte resolución expresa en procedimientos iniciados a solicitud del interesado?`,
          options: [
            "Siempre se considera desestimado por silencio negativo",
            "Por regla general, el silencio administrativo tiene efecto estimatorio (positivo), salvo las excepciones previstas por ley o derecho comunitario",
            "Se archiva el expediente de forma definitiva sin posibilidad de recurso",
            "Se impone una multa automática al funcionario instructor"
          ],
          correctIndex: 1,
          justification: "El artículo 24.1 de la Ley 39/2015 consagra el principio del silencio administrativo estimatorio como regla general para solicitudes de interesados, con las excepciones tasadas fijadas por norma con rango de ley."
        }
      ]
    }
  ];

  // Generate realistic case studies
  const practicalCases: PracticalCase[] = [
    {
      id: "pc-1",
      title: `Supuesto Práctico Oficial de ${shortName}: Silencio y Acto Administrativo`,
      year: 2024,
      situation: `Un ciudadano presenta una solicitud formal de licencia o autorización de actividad económica ante la delegación administrativa competente el 15 de marzo de 2026. Transcurren 3 meses completos sin recibir notificación alguna. El interesado considera que, aplicando la regla general de silencio administrativo, cuenta con la autorización y abre el negocio. Sin embargo, el 5 de julio de 2026, la delegación notifica una resolución expresa de inadmisión por falta de documentación obligatoria. El interesado interpone recurso administrativo alegando la firmeza de la estimación presunta por silencio.`,
      questions: [
        {
          question: "¿Se ha producido silencio administrativo de efectos estimatorios en este supuesto?",
          legalBase: "Artículos 21 y 24 de la Ley 39/2015, del Procedimiento Administrativo Común.",
          solution: "No se ha producido un silencio estimatorio que otorgue válidamente la licencia si esta requería la transferencia de facultades de dominio público o contravenía leyes estatales vigentes. Además, si la documentación estaba incompleta, el plazo pudo haber sido suspendido legalmente para la subsanación. No obstante, si no se suspendió formalmente, la resolución expresa tardía posterior al vencimiento del plazo solo puede ser confirmatoria de la estimación si esta procedía, o desestimatoria únicamente en los casos tasados por ley."
        },
        {
          question: "¿Es válida la notificación recibida el 5 de julio siendo dictada extemporáneamente por la delegación?",
          legalBase: "Artículo 21.1 y 24.3 de la Ley 39/2015.",
          solution: "La Administración está obligada a dictar resolución expresa en todos los procedimientos, sin que la extemporaneidad exima de dicha obligación. Sin embargo, el sentido de esta resolución tardía está limitado: en los casos de silencio positivo previo, la resolución expresa posterior solo puede ser de carácter confirmatorio del sentido estimatorio del silencio."
        }
      ]
    }
  ];

  return {
    id,
    name: title,
    shortName,
    group,
    adminType,
    region,
    status: "Abierto",
    generalRequirements: [
      "Tener nacionalidad española o de los estados miembros de la Unión Europea.",
      `Poseer la titulación exigida de Grado, Bachiller o ESO aplicable al subgrupo de plazas ${group}.`,
      "No haber sido separado del servicio de las Administraciones Públicas mediante expediente disciplinario."
    ],
    tribunalQualities: [
      "Sometimiento riguroso al imperio de la ley en el diseño de los enunciados de examen.",
      "Valoración exhaustiva de la precisión léxica y de la cita literal de los artículos del código civil y leyes de cabecera.",
      "Uso habitual de plazos cruzados (días hábiles vs. naturales, meses naturales vs. procesales) para descartar opositores con vacíos memorísticos."
    ],
    card: {
      vacancies: description.includes("plazas") ? parseInt(description.match(/(\d+)\s+plazas/)?.[1] || "45") : 45,
      scale: `Cuerpo de la Administración de ${region}`,
      deadline: "20 días hábiles desde el día siguiente a su publicación oficial",
      referenceBOE: "BOE-A-2026-" + Math.floor(1000 + Math.random() * 9000),
      officialLink: "https://www.boe.es",
      place: region,
      examType: "Oposición Libre con Examen Tipo Test de Respuestas Múltiples",
      minDegree: group === "A1" ? "Grado Universitario / Licenciatura" : group === "A2" ? "Grado / Diplomatura" : group === "C1" ? "Bachillerato" : "Educación Secundaria Obligatoria",
      legislativeWarning: "Atención: Este temario incorpora plenamente la jurisprudencia y reformas legislativas de las leyes 39/2015 y 40/2015 vigentes."
    },
    syllabus,
    officialExams,
    practicalCases
  };
}

// 2. Generate case study adapted to the selected opposition
export function generateClientCaseStudy(oppositionName: string, blocks?: string[]): any {
  return {
    title: `Supuesto Práctico Complejo de Oposición: ${oppositionName}`,
    situation: `El órgano instructor técnico ha incoado de oficio un expediente sancionador contra un particular o funcionario por presuntas infracciones graves. Durante el periodo de instrucción se han omitido las fases de alegaciones iniciales, reduciendo a la mitad los plazos aduciendo urgencia operativa de la dirección general. El interesado presenta alegaciones manifestando indefensión procesal y vulneración del principio de contradicción y debido proceso.`,
    questions: [
      {
        question: `Considerando la situación para la oposición de ${oppositionName}, ¿existe vulneración formal determinante de la nulidad de pleno derecho en el expediente sancionador?`,
        justification: "El artículo 47.1.e de la Ley 39/2015 determina que son nulos de pleno derecho los actos dictados prescindiendo total y absolutamente del procedimiento legalmente establecido. Reducir plazos de alegaciones a la mitad sin la debida declaración motivada de urgencia o saltarse la audiencia provoca indefensión constitucional evidente, lo que encaja en causas de nulidad tasadas de acuerdo con la jurisprudencia del Tribunal Supremo."
      },
      {
        question: "¿Qué recursos administrativos proceden contra un acto de trámite cualificado como este?",
        justification: "Los actos de trámite que determinen la imposibilidad de continuar el procedimiento o produzcan indefensión (actos de trámite cualificados) pueden ser recurridos de manera independiente en alzada o reposición de conformidad con el artículo 112.1 de la Ley 39/2015, abriendo la vía para evitar que el vicio contamine el acto final definitivo."
      }
    ],
    tipsForTribunal: `Para la oposición de ${oppositionName}, el tribunal valorará muy positivamente que menciones con precisión quirúrgica el artículo 47.1.e (nulidad radical por prescindir del procedimiento) y lo distingas de la mera anulabilidad por defectos de forma del artículo 48 de la Ley 39/2015. Cita siempre la doctrina del Tribunal Supremo sobre el concepto de 'indefensión material de carácter constitucional'.`
  };
}

// 3. Generate mnemonic adapted to selected opposition
export function generateClientMnemonic(concept: string, context?: string): any {
  // Generate customized mnemonic formula
  const titleWords = concept.split(" ");
  const abbreviation = titleWords.map(w => w[0] || "").join("").toUpperCase().slice(0, 5);
  
  return {
    concept: concept,
    difficultyWhy: `Este concepto para ${context || "Oposiciones"} resulta complejo debido a que el tribunal suele formular preguntas que confunden los supuestos ordinarios con los excepcionales, alterando palabras clave como 'podrá' y 'deberá'.`,
    mnemonics: [
      {
        type: "Fórmula de Regla de Oro",
        formula: abbreviation ? `L-E-Y - ${abbreviation}` : "MNE-MO-TEG",
        explanation: `Regla nemotécnica adaptada: Asocia cada parte del concepto "${concept}" con una sigla memorable para consolidar la secuencia jerárquica en los exámenes tipo test.`
      }
    ],
    mentalAssociationImage: `Visualiza un archivador gigante de color azul índigo en el que guardas una caja fuerte marcada con las letras doradas de la regla de oro, protegiendo este concepto de los vicios del tribunal de ${context || "Oposiciones"}.`,
    retentionTestQuestion: `¿Cuál es el núcleo del fundamento legal de "${concept}"? (Respuesta: Comprobar que encaje de forma exacta con la regla nemotécnica memorizada, descartando las falsas excepciones del test).`
  };
}

// 4. Generate traps & patterns adapted to selected opposition
export function generateClientPatterns(oppositionName: string, years: number[]): any {
  return {
    opposition: oppositionName,
    typicalTraps: [
      {
        name: `Intercambio de Plazos por Días Hábiles e Inhábiles`,
        mechanism: `El tribunal de la oposición de ${oppositionName} manipula plazos en días. Colocan distractores con cómputos en días naturales cuando la norma general indica expresamente días hábiles.`,
        howToAvoid: "Recuerda que en el cómputo administrativo regulado por la Ley 39/2015, los días son hábiles de forma presunta (excluyendo sábados, domingos y festivos), a menos que la ley disponga expresamente lo contrario."
      },
      {
        name: "Abuso de los Verbos de Facultad vs. Obligación",
        mechanism: "Cambiar sistemáticamente palabras como 'podrá' (facultad de la Administración) por 'deberá' o 'tendrá' (obligación reglamentaria) en los enunciados normativos oficiales para descartar opositores.",
        howToAvoid: "Repasa los artículos identificando si la potestad de la Administración es discrecional ('podrá') o reglada ('deberá'), ya que el tribunal construye distractores falsos intercambiando estos términos."
      }
    ],
    mockTrapQuestions: [
      {
        question: `En relación con el temario oficial de ${oppositionName}, un órgano administrativo recibe una solicitud formal. Si un artículo estipula que la delegación 'podrá suspender el procedimiento', ¿cuál es el carácter de esta potestad?`,
        options: [
          "Es una obligación reglada e inexcusable que debe aplicarse de forma automática",
          "Es una facultad de libre apreciación (discrecional) que el órgano puede o no aplicar justificadamente",
          "Produce la nulidad inmediata de las actuaciones si no se suspende",
          "Requiere previa autorización del órgano superior jerárquico obligatoriamente"
        ],
        correctIndex: 1,
        explanation: "La palabra 'podrá' atribuye una potestad discrecional o facultad, no una obligación reglada. El tribunal suele cambiarla por 'deberá' para crear distractores que simulen mandatos imperativos."
      }
    ],
    keyAdvice: `Para superar el test de ${oppositionName} con éxito, tómate al menos 30 segundos por pregunta para leer la frase completa. El 80% de los opositores fallan por leer apresuradamente y no detectar la sutil sustitución de palabras trampa como 'podrá' o la inclusión de sábados en el cálculo.`
  };
}

// 5. Generate test questions adapted to selected opposition
export function generateClientTest(oppositionName: string, blocks?: string[], count: number = 5, difficulty: string = "Medio"): any {
  const { sector } = analyzeKeywords(oppositionName);
  const questions: any[] = [];
  
  const questionPool = [
    {
      question: `En la oposición de ${oppositionName}, ¿cuál de los siguientes plazos se computa a partir del día siguiente al de la publicación oficial de la convocatoria?`,
      options: [
        "El plazo de subsanación de errores en las listas provisionales",
        "El plazo general de presentación de instancias de participación, que es de 20 días hábiles",
        "El plazo para resolver la oposición por parte del tribunal examinador",
        "El plazo para la realización del primer ejercicio práctico"
      ],
      correctIndex: 1,
      justification: "Por regla general en el derecho de la función pública, la presentación de solicitudes de participación es de 20 días hábiles contados a partir del día siguiente al de la publicación de la convocatoria oficial en el diario correspondiente."
    },
    {
      question: `De acuerdo con la legislación administrativa básica aplicable a ${oppositionName}, la recusación de un miembro del tribunal de selección:`,
      options: [
        "Solo puede proponerse por escrito en el mismo día del examen ante el presidente",
        "Podrá promoverse por los interesados en cualquier momento de la tramitación del procedimiento, debiendo resolverse en el plazo de 3 días",
        "Carece de efectos suspensivos sobre la marcha de las pruebas selectivas en todo caso",
        "No es admisible si el miembro del tribunal es un funcionario del subgrupo superior A1"
      ],
      correctIndex: 1,
      justification: "El artículo 24 de la Ley 40/2015 regula la recusación, la cual puede promoverse en cualquier momento por escrito alegando causas tasadas (amistad, parentesco, interés directo), debiendo el recusado manifestar si se da o no la causa en el día siguiente."
    },
    {
      question: `Frente a las resoluciones dictadas por el tribunal de selección en la oposición de ${oppositionName}, al no agotar la vía administrativa de forma directa, ¿qué recurso cabe interponer?`,
      options: [
        "Recurso de reposición potestativo en el plazo de un mes",
        "Recurso extraordinario de revisión de forma obligatoria",
        "Recurso de alzada ante el órgano de la Administración pública que nombró al tribunal examinador",
        "Reclamación de queja judicial inmediata en los 5 días hábiles"
      ],
      correctIndex: 2,
      justification: "Las resoluciones de los tribunales de selección de personal se consideran actos de trámite cualificados que no ponen fin a la vía administrativa; por tanto, cabe recurso de alzada ante el órgano administrativo que dispuso su nombramiento."
    },
    {
      question: `En el ámbito de la preparación de ${oppositionName}, ¿cuál de las siguientes opciones constituye un principio constitucional rector del acceso a la función pública española?`,
      options: [
        "Principio de antigüedad preferente para interinos de larga duración",
        "Principios de igualdad, mérito y capacidad regulados en los artículos 14, 23.2 y 103.3 de la CE",
        "Principio de territorialidad preferente según la provincia de nacimiento",
        "Principio de exención total de pruebas prácticas para titulados con alta nota académica"
      ],
      correctIndex: 1,
      justification: "La Constitución Española consagra en sus artículos 14 (igualdad), 23.2 (acceso a cargos públicos en condiciones de igualdad) y 103.3 (principios de mérito y capacidad para el acceso a la función pública) los pilares de la selección del empleo público."
    },
    {
      question: `De acuerdo con la Ley 39/2015 aplicable a las pruebas de ${oppositionName}, si el último día de un plazo expresado en días hábiles coincide con un sábado declarado festivo local en el municipio de destino, dicho día se considera:`,
      options: [
        "Inhábil a efectos de cómputo, trasladándose el vencimiento al siguiente día hábil",
        "Habilísimo, debiendo registrarse la instancia de forma electrónica obligatoriamente ese día",
        "Natural computable, finalizando el plazo a las 14:00 horas del sábado",
        "Día de prórroga automática de 5 días adicionales concedidos por ley"
      ],
      correctIndex: 0,
      justification: "Según el artículo 30 de la Ley 39/2015, si un día es inhábil en el municipio de residencia del interesado o en el del órgano administrativo competente, se considerará inhábil en todo caso, prorrogándose el vencimiento al primer día hábil siguiente."
    }
  ];

  // Return the desired number of questions from pool
  return {
    questions: questionPool.slice(0, Math.min(count, questionPool.length))
  };
}
