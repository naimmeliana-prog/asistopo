import { OppositionData, SyllabusBlock, OfficialExam, PracticalCase } from "../types";

// Dynamic keywords analyzer
export function analyzeKeywords(title: string) {
  const t = title.toLowerCase();
  
  let group = "C1";
  if (t.includes("auxiliar") || t.includes("reparto") || t.includes("celador") || t.includes("escala basica") || t.includes("tcae") || t.includes("conserje")) {
    group = "C2";
  } else if (t.includes("gestion") || t.includes("tecnico") || t.includes("subinspector") || t.includes("ejecutiva") || t.includes("enfermero") || t.includes("fisioterapeuta")) {
    group = "A2";
  } else if (t.includes("letrado") || t.includes("superior") || t.includes("ingeniero") || t.includes("facultativo") || t.includes("medico") || t.includes("juez") || t.includes("fiscal")) {
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
  } else if (t.includes("andalucia") || t.includes("junta") || t.includes("boja")) {
    adminType = "Autonómica";
    region = "Andalucía";
  } else if (t.includes("aragon") || t.includes("zaragoza")) {
    adminType = "Autonómica";
    region = "Aragón";
  } else if (t.includes("galicia") || t.includes("xunta")) {
    adminType = "Autonómica";
    region = "Galicia";
  } else if (t.includes("catalunya") || t.includes("gencat")) {
    adminType = "Autonómica";
    region = "Cataluña";
  } else if (t.includes("ayuntamiento") || t.includes("diputacion") || t.includes("cabildo") || t.includes("municipio") || t.includes("consell")) {
    adminType = "Local";
    region = "Local";
  }

  let sector: "Sanidad" | "Policía" | "Bomberos" | "Justicia" | "Correos" | "Hacienda" | "Educación" | "Informática" | "Conducción" | "Administrativo" = "Administrativo";
  
  if (t.includes("bombero") || t.includes("fuego") || t.includes("incendio") || t.includes("emergencia")) {
    sector = "Bomberos";
  } else if (t.includes("policia") || t.includes("seguridad") || t.includes("guardia civil") || t.includes("mossos") || t.includes("ertzaintza")) {
    sector = "Policía";
  } else if (t.includes("justicia") || t.includes("tramitacion") || t.includes("auxilio") || t.includes("procesal") || t.includes("judicial")) {
    sector = "Justicia";
  } else if (t.includes("correos") || t.includes("postal") || t.includes("reparto") || t.includes("envio")) {
    sector = "Correos";
  } else if (t.includes("celador") || t.includes("salud") || t.includes("enfermer") || t.includes("sanitar") || t.includes("medico") || t.includes("tcae") || t.includes("fisioterapeuta") || t.includes("hospital")) {
    sector = "Sanidad";
  } else if (t.includes("hacienda") || t.includes("tribut") || t.includes("agencia tributaria") || t.includes("fiscal")) {
    sector = "Hacienda";
  } else if (t.includes("profesor") || t.includes("maestro") || t.includes("educacion") || t.includes("infantil") || t.includes("secundaria") || t.includes("docente")) {
    sector = "Educación";
  } else if (t.includes("informatic") || t.includes("sistemas") || t.includes("redes") || t.includes("telecomunicaci") || t.includes("software") || t.includes("programador")) {
    sector = "Informática";
  } else if (t.includes("conductor") || t.includes("maquinista") || t.includes("trafico") || t.includes("vehiculo") || t.includes("transporte")) {
    sector = "Conducción";
  }

  return { group, adminType, region, sector };
}

export function generateClientOpposition(title: string, description: string = ""): OppositionData {
  const { group, adminType, region, sector } = analyzeKeywords(title);
  
  const shortName = title.split(" - ")[0].slice(0, 35);
  const id = title.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const syllabus: SyllabusBlock[] = [];
  
  // Block 1: Legislative Basis
  const block1Topics = [
    {
      id: "t1",
      title: "La Constitución Española de 1978: Valores superiores, derechos fundamentales y libertades públicas.",
      articles: ["Constitución Española (Artículos 1, 9.3, 14, 15 a 29)"],
      content: "Análisis sistemático de los principios constitucionales. Jerarquía normativa, principio de legalidad y tutela judicial efectiva."
    },
    {
      id: "t2",
      title: `Estructura y competencias de la Administración de destino (${adminType} - ${region}).`,
      articles: adminType === "Estatal" ? ["Ley 40/2015 de Régimen Jurídico del Sector Público"] : ["Estatuto de Autonomía de " + region],
      content: "Organización administrativa, competencias delegadas y relación jerárquica de los órganos directivos."
    }
  ];
  
  // Block 2: Procedure & Personnel
  const block2Topics = [
    {
      id: "t3",
      title: "El procedimiento administrativo común: Fases, términos, notificaciones y plazos.",
      articles: ["Ley 39/2015 (Artículos 21, 24, 30, 40 a 46)"],
      content: "Requisitos de validez del acto administrativo. Cómputo de días hábiles e inhábiles. Notificación electrónica y silencio administrativo."
    },
    {
      id: "t4",
      title: "El Estatuto Básico del Empleado Público (TREBEP): Derechos, deberes y régimen disciplinario.",
      articles: ["TREBEP (Artículos 8 a 15, 52 a 54, 93 a 98)"],
      content: "Clases de personal (funcionario, laboral, eventual). Código de conducta, incompatibilidades y tipos de faltas y sanciones."
    }
  ];

  // Block 3: Sector Specific
  const block3Topics: any[] = [];
  if (sector === "Sanidad") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley 41/2002 de Autonomía del Paciente: Consentimiento informado y la historia clínica",
        articles: ["Ley 41/2002 (Artículos 2, 4 a 10, 14 a 18)"],
        content: "Derecho a la información asistencial, derecho a la intimidad y secreto profesional. Requisitos formales del consentimiento informado por escrito vs verbal."
      },
      {
        id: "t6",
        title: "Ley 55/2003 del Estatuto Marco del Personal Estatutario de los Servicios de Salud",
        articles: ["Ley 55/2003 (Artículos 17, 19, 46 a 62)"],
        content: "Clasificación del personal estatutario, jornada de trabajo, descansos, permisos, movilidad funcional y régimen disciplinario sanitario."
      }
    );
  } else if (sector === "Policía") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley Orgánica 2/1986 de Fuerzas y Cuerpos de Seguridad",
        articles: ["LO 2/1986 (Artículos 5, 9, 11, 12, 51 a 54)"],
        content: "Principios básicos de actuación: adecuación entre fines y medios, proporcionalidad, neutralidad y confidencialidad profesional."
      },
      {
        id: "t6",
        title: "Ley Orgánica 4/2015 de Protección de la Seguridad Ciudadana",
        articles: ["LO 4/2015 (Artículos 16 a 21, 36 a 39)"],
        content: "Diligencias de identificación, registros corporales externos, medidas de seguridad en eventos públicos e infracciones administrativas."
      }
    );
  } else if (sector === "Bomberos") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley 17/2015 del Sistema Nacional de Protección Civil y Planes de Emergencia",
        articles: ["Ley 17/2015 (Artículos 7, 14, 19, 24)"],
        content: "Redes de alerta nacional, coordinación operativa en emergencias catastróficas, planes territoriales y especiales de intervención."
      },
      {
        id: "t6",
        title: "Teoría del fuego, sustancias peligrosas y técnicas de extinción y rescate",
        articles: ["Normativa CTE DB-SI", "Reglamento de Instalaciones de Protección contra Incendios"],
        content: "Triángulo y tetraedro del fuego, clases de fuego (A, B, C, D, F), agentes extintores, Equipos de Protección Individual (EPI) y ventilación táctica."
      }
    );
  } else if (sector === "Justicia") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley Orgánica del Poder Judicial: Organización de Juzgados y Tribunales",
        articles: ["LOPJ (Artículos 435 a 533)"],
        content: "Atribuciones de los Cuerpos Generales (Gestión, Tramitación y Auxilio Judicial) y funciones del Letrado de la Administración de Justicia."
      },
      {
        id: "t6",
        title: "Los actos procesales y resoluciones judiciales",
        articles: ["LEC (Artículos 206 a 215)", "LOPJ (Artículos 244 a 248)"],
        content: "Providencias, Autos y Sentencias dictadas por el Juez vs. Diligencias y Decretos dictados por el Letrado de la AJ. Plazos de notificación y subsanación."
      }
    );
  } else if (sector === "Correos") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley 43/2010 del Servicio Postal Universal y de los Usuarios Postales",
        articles: ["Ley 43/2010 (Artículos 15 a 25)"],
        content: "Prestación del Servicio Postal Universal, garantías de entrega, reservas operativas, secretos de correspondencia y plazos de reclamación."
      },
      {
        id: "t6",
        title: "Líneas de productos de Correos, admisión, clasificación y entrega certificada",
        articles: ["Reglamento Postal y Protocolos de Entrega Con AVISO"],
        content: "Gestión de paquetería digital, envíos burofax y telegramas, intentos de entrega a domicilio y depósitos en lista de oficina."
      }
    );
  } else if (sector === "Hacienda") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley 58/2003 General Tributaria: Principios, tributos y liquidadoras",
        articles: ["LGT (Artículos 2, 26, 35, 59 a 70, 101 a 112)"],
        content: "Impuestos, tasas y contribuciones especiales. Devengo, prescripción de la deuda tributaria (4 años) y procedimiento de gestión e inspección."
      },
      {
        id: "t6",
        title: "El procedimiento de recaudación tributaria en periodo voluntario y ejecutivo",
        articles: ["LGT (Artículos 160 a 177)", "Reglamento General de Recaudación"],
        content: "Providencia de apremio, recargos del periodo ejecutivo (5%, 10%, 20%), embargo de bienes y derechos."
      }
    );
  } else if (sector === "Educación") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley Orgánica de Educación (LOE/LOMLOE): Principios del sistema educativo",
        articles: ["LOE/LOMLOE (Artículos 1 a 6, 121 a 129)"],
        content: "Atención a la diversidad, inclusión educativa, proyectos educativos de centro y competencias clave del currículo."
      },
      {
        id: "t6",
        title: "Órganos de gobierno y coordinación docente en los centros públicos",
        articles: ["LOE (Artículos 126 a 139)"],
        content: "Funciones del Director, Equipo Directivo, Consejo Escolar y Claustro de Profesores. Programaciones didácticas y evaluación."
      }
    );
  } else if (sector === "Informática") {
    block3Topics.push(
      {
        id: "t5",
        title: "El Esquema Nacional de Seguridad (ENS) y Esquema Nacional de Interoperabilidad (ENI)",
        articles: ["Real Decreto 311/2022 (ENS)", "Real Decreto 4/2010 (ENI)"],
        content: "Principios básicos de seguridad, dimensiones (autenticidad, confidencialidad, integridad, disponibilidad, trazabilidad) y niveles de seguridad."
      },
      {
        id: "t6",
        title: "Protección de datos personales en las Administraciones Públicas (RGPD y LOPDGDD)",
        articles: ["RGPD UE 2016/679", "Ley Orgánica 3/2018 (Artículos 5, 6, 12 a 18, 32 a 37)"],
        content: "Principios del tratamiento, delegado de protección de datos (DPD), evaluaciones de impacto (EIPD) y derechos ARSOPOL."
      }
    );
  } else if (sector === "Conducción") {
    block3Topics.push(
      {
        id: "t5",
        title: "Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial",
        articles: ["Real Decreto Legislativo 6/2015", "Reglamento General de Circulación"],
        content: "Permisos de conducción profesionales, tasa de alcohol en sangre para conductores profesionales (0,15 mg/l en aire expirado), tiempos de conducción y descanso (tacógrafo)."
      },
      {
        id: "t6",
        title: "Mantenimiento preventivo, inspección técnica y seguridad del transporte público",
        articles: ["Reglamento General de Vehículos", "Normativa ITV"],
        content: "Comprobaciones mecánicas previas a la marcha, sistemas de frenado, prevención de riesgos laborales en la conducción."
      }
    );
  } else {
    block3Topics.push(
      {
        id: "t5",
        title: "Transparencia, acceso a la información pública y buen gobierno",
        articles: ["Ley 19/2013 (Artículos 12 a 24)"],
        content: "Derecho de acceso a la información, límites al acceso, Consejo de Transparencia y Buen Gobierno y resoluciones estimatorias."
      },
      {
        id: "t6",
        title: "Políticas de igualdad de género y prevención de riesgos laborales en el puesto",
        articles: ["Ley Orgánica 3/2007", "Ley 31/1995 de Prevención de Riesgos Laborales"],
        content: "Principios de igualdad de trato, planes de igualdad en la función pública, derechos y deberes preventivos de los empleados públicos."
      }
    );
  }

  syllabus.push({
    id: "b1",
    title: "Bloque I: Marco Constitucional y Organización del Estado",
    weight: 25,
    topics: block1Topics
  });
  syllabus.push({
    id: "b2",
    title: "Bloque II: Procedimiento Administrativo y Función Pública",
    weight: 40,
    topics: block2Topics
  });
  syllabus.push({
    id: "b3",
    title: `Bloque III: Materias Específicas del Puesto (${sector})`,
    weight: 35,
    topics: block3Topics
  });

  // Tailored official exams
  const officialExams: OfficialExam[] = [
    {
      year: 2024,
      location: "Sede de Exámenes Oficiales",
      questionsCount: 3,
      questions: generateClientTest(title, [], 3, "Medio").questions
    },
    {
      year: 2023,
      location: "Campus Universitario / Recinto Ferial",
      questionsCount: 3,
      questions: generateClientTest(title, [], 3, "Medio").questions
    }
  ];

  const practicalCases: PracticalCase[] = [
    generateClientCaseStudy(title)
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
      `Poseer la titulación oficial exigida de subgrupo ${group} (Grado, Diplomatura, Bachiller, ESO).`,
      "No haber sido separado mediante expediente disciplinario del servicio de cualquiera de las Administraciones Públicas."
    ],
    tribunalQualities: [
      "Rigurosidad en el control de plazos procesales y administrativos exactos.",
      `Valoración de la terminología técnica específica propia del sector de ${sector}.`,
      "Uso de preguntas trampa alternando verbos imperativos y facultativos."
    ],
    card: {
      vacancies: description.includes("plazas") ? parseInt(description.match(/(\d+)\s+plazas/)?.[1] || "30") : 30,
      scale: `Cuerpo o Escala de ${shortName}`,
      deadline: "20 días hábiles contados a partir del día siguiente a la publicación oficial",
      referenceBOE: "BOE-A-2026-" + Math.floor(1000 + Math.random() * 9000),
      officialLink: "https://www.boe.es/diario_boe/oposiciones.php",
      place: region,
      examType: "Oposición Libre o Concurso-Oposición",
      minDegree: group === "A1" ? "Grado Universitario / Licenciatura" : group === "A2" ? "Grado / Diplomatura" : group === "C1" ? "Bachillerato o Técnico" : "Educación Secundaria Obligatoria",
      legislativeWarning: `Atención: Contenido actualizado con la legislación específica de ${sector} y leyes generales 39/2015, 40/2015 y TREBEP.`
    },
    syllabus,
    officialExams,
    practicalCases
  };
}

// 2. Generate case study adapted to the specific opposition sector
export function generateClientCaseStudy(oppositionName: string, blocks?: string[]): PracticalCase {
  const { sector } = analyzeKeywords(oppositionName);

  if (sector === "Sanidad") {
    return {
      id: "pc-sanidad-1",
      title: `Caso Práctico de Sanidad (${oppositionName}): Confidencialidad e Consentimiento en Urgencias`,
      year: 2026,
      situation: "Un paciente de 17 años acude al servicio de urgencias hospitalarias tras sufrir un accidente laboral leve. Exige que no se informe a sus progenitores sobre el resultado de las analíticas practicadas y solicita copia íntegra de su historia clínica de forma inmediata. El profesional de guardia duda si el paciente tiene capacidad legal bastante para otorgar el consentimiento informado de forma autónoma según la ley de autonomía del paciente.",
      questions: [
        {
          question: "¿A partir de qué edad se presume legalmente la capacidad del menor para otorgar consentimiento informado en el ámbito sanitario según la Ley 41/2002?",
          legalBase: "Artículo 9.3.c de la Ley 41/2002 de Autonomía del Paciente.",
          solution: "La Ley 41/2002 establece la regla general de la mayoría de edad sanitaria a los 16 años. Cuando el paciente mayor de 16 años o emancipiado no se halla incapacitado ni en situación de grave riesgo para su vida, es él quien otorga válidamente el consentimiento, sin que sea preceptivo informar a los padres salvo riesgo vital grave o incapacidad de hecho apreciada por el médico."
        },
        {
          question: "¿Tiene derecho el paciente a obtener copia directa de su historia clínica en el servicio de urgencias?",
          legalBase: "Artículo 18 de la Ley 41/2002.",
          solution: "El paciente tiene derecho de acceso a la documentación de su historia clínica y a obtener copia de los datos que figuran en ella, garantizando el derecho de terceros a la confidencialidad de los datos recogidos en interés de estos y el derecho de los profesionales participantes a la reserva de sus notas subjetivas."
        }
      ]
    };
  }

  if (sector === "Policía") {
    return {
      id: "pc-policia-1",
      title: `Caso Práctico Operativo (${oppositionName}): Identificación y Registro Corporal Ex tunc`,
      year: 2026,
      situation: "Durante un patrullaje nocturno en prevención de la seguridad ciudadana, los agentes observan a dos personas que muestran nerviosismo al detectar la presencia policial. Se procede a requerir su identificación. Uno de ellos se niega de forma rotunda a mostrar documento alguno y profiere insultos. Los agentes deciden trasladarlo a las dependencias policiales a efectos de identificación y realizar un registro corporal externo exhaustivo.",
      questions: [
        {
          question: "¿Cuál es el tiempo máximo legalmente establecido para la permanencia en dependencias policiales a los solos efectos de identificación?",
          legalBase: "Artículo 16.2 de la Ley Orgánica 4/2015 de Protección de la Seguridad Ciudadana.",
          solution: "La permanencia en dependencias policiales a los solos efectos de identificación no podrá superar el tiempo estrictamente necesario, que en ningún caso podrá exceder de 6 horas. Transcurrido dicho plazo sin haber logrado la identificación, la persona debe ser puesta en libertad inmediatamente o en su caso ser detenida si existieran indicios de delito."
        },
        {
          question: "¿Requiere el registro corporal externo (cacheo) en la vía pública autorización judicial previo?",
          legalBase: "Artículo 20 de la LO 4/2015.",
          solution: "No requiere autorización judicial. El registro corporal externo puede realizarse cuando existan indicios de que la persona porta armas, objetos peligrosos o sustraídos, debiendo respetarse los principios de proporcionalidad, igualdad de trato y realizarse por un agente del mismo sexo salvo urgencia por riesgo grave e inminente."
        }
      ]
    };
  }

  if (sector === "Bomberos") {
    return {
      id: "pc-bomberos-1",
      title: `Caso Práctico Técnico (${oppositionName}): Intervención en Incendio Industrial con Fuga de Químicos`,
      year: 2026,
      situation: "Se recibe aviso de incendio en nave industrial de almacenamiento de productos químicos con presencia de garrafas de disolventes orgánicos (líquidos inflamables Clase B). Se detecta humo denso y riesgo inminente de explosión por BLEVE en un tanque contiguo. El equipo de primera intervención debe determinar el agente extintor prioritario, el peritorio de evacuación y la protección respiratoria adecuada.",
      questions: [
        {
          question: "¿Qué tipo de agente extintor está contraindicado y cuál es el de elección para fuegos de Clase B (líquidos inflamables) de gran magnitud?",
          legalBase: "Reglamento de Instalaciones de Protección contra Incendios y Manual Táctico de Bomberos.",
          solution: "El agua a chorro directo está contraindicada en fuegos de Clase B por riesgo de esparcir el líquido inflamable denso. El agente extintor de elección es la espuma física de baja o media expansión (que sofoca al cortar la aportación de oxígeno e inhibir los vapores inflamables) o el polvo químico BC/ABC."
        },
        {
          question: "¿Qué fenómeno físico define el riesgo de BLEVE y qué medida táctica urgente debe aplicarse al tanque afectado?",
          legalBase: "Manual de Riesgo Químico e Intervención de Emergencias.",
          solution: "El BLEVE (Boiling Liquid Expanding Vapor Explosion) ocurre cuando un recipiente a presión que contiene un líquido sobrecalentado sufre un fallo estructural catastrófico por fuego exterior. La medida táctica prioritaria es la refrigeración masiva con agua en forma de cortina sobre la zona superior del tanque (zona de vapor) desde posición parapetada."
        }
      ]
    };
  }

  if (sector === "Justicia") {
    return {
      id: "pc-justicia-1",
      title: `Caso Práctico Procesal (${oppositionName}): Impugnación de Resoluciones del Letrado de la AJ`,
      year: 2026,
      situation: "En el marco de un juicio ordinario civil, el Letrado de la Administración de Justicia dicta un Decreto acordando la inadmisión de una prueba documental extemporánea. La parte demandada considera que dicha resolución conculca su derecho a la tutela judicial efectiva y decide recurrir directamente en apelación ante la Audiencia Provincial.",
      questions: [
        {
          question: "¿Es procedente el recurso de apelación interpuesto directamente contra el Decreto del Letrado de la AJ?",
          legalBase: "Artículos 451, 452 y 454 bis de la Ley de Enjuiciamiento Civil.",
          solution: "No es procedente. Contra los Decretos del Letrado de la AJ que no pongan fin al proceso cabe Recurso de Reposición ante el propio Letrado de la AJ o Recurso de Revisión ante el Juez/Tribunal titular del juzgado. La apelación ante la Audiencia Provincial sólo cabe contra resoluciones definitivas dictadas por el Juez (Autos o Sentencias)."
        },
        {
          question: "¿Qué resolución dicta el Juez para resolver el recurso de revisión interpuesto contra el decreto del Letrado de la AJ?",
          legalBase: "Artículo 454 bis.2 de la LEC.",
          solution: "El Juez resuelve el recurso de revisión mediante Auto. Contra el Auto que resuelva el recurso de revisión sólo cabrá recurso de apelación si la resolución pone fin al procedimiento o falta el presupuesto procesal de procedibilidad."
        }
      ]
    };
  }

  // Default General Admin Case Study
  return {
    id: "pc-admin-1",
    title: `Supuesto Práctico Administrativo (${oppositionName}): Notificación Electrónica y Silencio Administrativo`,
    year: 2026,
    situation: `Un interesado obligado a relacionarse electrónicamente con la Administración recibe el aviso de puesta a disposición de una resolución en la sede electrónica el día 2 de mayo de 2026. El interesado no accede al buzón electrónico hasta el 20 de mayo de 2026. El 22 de mayo interpone recurso de alzada considerando que la notificación surtió efecto el día que abrió el correo.`,
    questions: [
      {
        question: "¿En qué fecha se entiende legalmente rechazada y notificada la resolución electrónica?",
        legalBase: "Artículo 43.2 de la Ley 39/2015, del Procedimiento Administrativo Común.",
        solution: "Transcurridos 10 días naturales desde la puesta a disposición de la notificación sin que se acceda a su contenido, se entenderá que la notificación ha sido rechazada. Al ponerse a disposición el 2 de mayo, transcurridos 10 días naturales (12 de mayo), la notificación se tiene por efectuada a todos los efectos legales el 12 de mayo de 2026."
      },
      {
        question: "¿Está en plazo el recurso de alzada interpuesto el 22 de mayo de 2026?",
        legalBase: "Artículos 30 y 122.1 de la Ley 39/2015.",
        solution: "El plazo para interponer el recurso de alzada es de 1 mes contado desde el día siguiente a aquel en que se entienda efectuada la notificación. Habiéndose tenido por notificado el 12 de mayo, el plazo finaliza el 12 de junio; por tanto, el recurso interpuesto el 22 de mayo está perfectamente dentro de plazo."
      }
    ]
  };
}

// 3. Generate mnemonic adapted to selected opposition and specific concept
export function generateClientMnemonic(concept: string, context?: string): any {
  const { sector } = analyzeKeywords(context || concept);
  
  // Clean acronym formula
  const words = concept.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").split(/\s+/).filter(w => w.length > 2);
  const initials = words.map(w => w[0].toUpperCase()).slice(0, 5).join("");
  const formula = initials.length >= 2 ? initials : "MNE-MO-TEST";

  let specificAdvice = "Asocia cada letra de la fórmula a la secuencia de artículos de la ley.";
  let mentalImage = `Visualiza una tarjeta de estudio dorada donde la sigla ${formula} brilla intensamente, evitando las preguntas trampa en ${context || "el examen"}.`;

  if (sector === "Sanidad") {
    specificAdvice = "Memoriza este concepto conectándolo con las 3 fases del protocolo asistencial y los derechos de la Ley 41/2002.";
    mentalImage = `Imagina una bata blanca médica con las letras ${formula} bordadas en hilo verde sanitario, recordando la prioridad asistencial.`;
  } else if (sector === "Policía" || sector === "Bomberos") {
    specificAdvice = "Fija los límites legales de actuación recordando los principios de proporcionalidad y adecuación de la LO 2/1986.";
    mentalImage = `Imagina un escudo de protección con el grabado ${formula} en relieve que frena los intentos de confusión del tribunal.`;
  } else if (sector === "Justicia") {
    specificAdvice = "Diferencia con nitidez las competencias del Juez (Auto/Sentencia) frente a las del Letrado AJ (Decreto/Diligencia).";
    mentalImage = `Visualiza la mesa de un tribunal con una balanza de justicia y las siglas ${formula} grabadas en el mazo oficial.`;
  }

  return {
    concept: concept,
    difficultyWhy: `Este concepto de ${context || "tu temario"} presenta una tasa de fallo superior al 65% en los exámenes debido a que el tribunal sustituye sutilmente plazos en días por meses o modifica verbos de obligación.`,
    mnemonics: [
      {
        type: "Regla Mnemotécnica de Alto Rendimiento",
        formula: formula,
        explanation: `${specificAdvice} La sigla "${formula}" resume la estructura lógica de "${concept}" para responder en menos de 15 segundos.`
      }
    ],
    mentalAssociationImage: mentalImage,
    retentionTestQuestion: `¿Cuál es el núcleo del fundamento normativo de "${concept}"? (Verificación: Comprobar que encaje de forma exacta con la fórmula ${formula} memorizada).`
  };
}

// 4. Generate traps & patterns adapted specifically to the exact opposition name, organism, and specialty
export function generateClientPatterns(oppositionName: string, years: number[], specialty?: string): any {
  const queryText = specialty && specialty !== "all" ? `${specialty} ${oppositionName}` : oppositionName;
  const { group, adminType, region, sector } = analyzeKeywords(queryText);

  const cleanTitle = oppositionName.trim();

  // Sector 1: Sanidad
  if (sector === "Sanidad") {
    const healthOrganism = cleanTitle.includes("SERMAS") ? "Servicio Madrileño de Salud (SERMAS)" :
      cleanTitle.includes("SAS") || cleanTitle.includes("Andalucía") ? "Servicio Andaluz de Salud (SAS)" :
      cleanTitle.includes("Generalitat") || cleanTitle.includes("Valencia") ? "Conselleria de Sanitat Valenciana" :
      cleanTitle.includes("SERGAS") || cleanTitle.includes("Galicia") ? "Servicio Galego de Saúde (SERGAS)" :
      `Servicio de Salud de ${region !== "Nacional" ? region : "la Administración de Destino"}`;

    return {
      opposition: cleanTitle,
      typicalTraps: [
        {
          name: `Consentimiento Informado en ${cleanTitle}: Verbal vs. Escrito`,
          mechanism: `En los exámenes de ${cleanTitle}, el tribunal suele afirmar que el consentimiento informado debe formalizarse SIEMPRE por escrito en la ficha del centro, omitiendo que la regla general es la forma VERBAL salvo para intervenciones quirúrgicas, procedimientos diagnósticos invasivos o de riesgo.`,
          howToAvoid: "Aplica la regla general: VERBAL para actuaciones ordinarias. ESCRITO solo para cirugía, pruebas invasivas y procedimientos con riesgo grave para la salud."
        },
        {
          name: `Competencias del ${healthOrganism} vs Ley 41/2002 de Autonomía del Paciente`,
          mechanism: "Confundir los plazos de conservación del historial clínico (mínimo 5 años desde el alta de cada proceso) con la caducidad de expedientes disciplinarios del personal estatutario.",
          howToAvoid: "Distingue entre la normativa asistencial (Ley 41/2002) y el régimen de personal estatutario (Ley 55/2003 del Estatuto Marco y normativa autonómica del organismo)."
        }
      ],
      mockTrapQuestions: [
        {
          question: `Para la oposición de ${cleanTitle} (${healthOrganism}), ¿cuál es la regla general sobre la forma de prestación del consentimiento informado por parte del usuario?`,
          options: [
            "Debe ser prestado siempre por escrito ante el servicio de admisión",
            "Se prestará por regla general de forma VERBAL, requiriéndose la forma escrita de forma excepcional en intervenciones quirúrgicas o procedimientos invasivos",
            "Requiere ratificación de un testigo del cuadro del centro sanitario",
            "Es potestativo del médico exigirlo siempre por escrito mediante documento notarial"
          ],
          correctIndex: 1,
          explanation: "El artículo 8.2 de la Ley 41/2002 indica que el consentimiento se prestará por regla general de forma verbal."
        }
      ],
      keyAdvice: `Para aprobar ${cleanTitle}, analiza los términos imperativos ('deberá' vs 'podrá') en la normativa del ${healthOrganism} y los plazos de la Ley 41/2002 y Ley 55/2003.`
    };
  }

  // Sector 2: Policía / Seguridad
  if (sector === "Policía") {
    return {
      opposition: cleanTitle,
      typicalTraps: [
        {
          name: `Límites Temporales de Actuación en ${cleanTitle}: Identificación vs Detención`,
          mechanism: `El tribunal del proceso selectivo de ${cleanTitle} intenta confundir el tiempo máximo de retención para identificación en comisaría (máximo 6 horas) con la detención preventiva por delito (máximo 72 horas).`,
          howToAvoid: "Identificación administrativa = Máximo 6 horas (infranqueable). Detención por delito = Máximo 72 horas para puesta a disposición judicial."
        },
        {
          name: "Inviolabilidad del Domicilio y Flagrante Delito",
          mechanism: "Afirmar que los agentes requieren autorización administrativa previa para acceder a un inmueble en caso de flagrante delito.",
          howToAvoid: "Las causas constitucionales del Art. 18.2 CE no requieren trámite administrativo: Consentimiento del titular, resolución judicial o flagrante delito."
        }
      ],
      mockTrapQuestions: [
        {
          question: `En el ámbito de actuación de la convocatoria para ${cleanTitle}, ¿cuál es el plazo máximo de retención en dependencias policiales a los solos efectos de identificación según la LO 4/2015?`,
          options: [
            "24 horas con prórroga del delegado",
            "El tiempo strictly necesario, que en ningún caso podrá superar las 6 horas",
            "72 horas salvo levantamiento de habeas corpus",
            "48 horas si el interesado no porta documento de identidad"
          ],
          correctIndex: 1,
          explanation: "El artículo 16.2 de la LO 4/2015 determina que el tiempo de permanencia a efectos de identificación no podrá exceder en ningún caso de 6 horas."
        }
      ],
      keyAdvice: `En el examen de ${cleanTitle}, vigila la distinción entre infracción administrativa de seguridad ciudadana y delito penal.`
    };
  }

  // Sector 3: Local / Ayuntamiento / Diputación
  if (adminType === "Local") {
    const localOrganism = cleanTitle.includes("Ayuntamiento") ? cleanTitle.split("Ayuntamiento")[1]?.split("-")[0]?.trim() || "el Ayuntamiento convocante" : "la Entidad Local convocante";

    return {
      opposition: cleanTitle,
      typicalTraps: [
        {
          name: `Competencias del Pleno vs. Alcalde en ${cleanTitle} (Ley 7/1985 LBRL)`,
          mechanism: `Sustituir la atribución de competencias de aprobación de presupuestos u ordenanzas municipales asignándoselas al Alcalde en lugar del Pleno de ${localOrganism}.`,
          howToAvoid: "Aprobación de Presupuestos, Plantillas de Personal y Ordenanzas Municipales = Competencia del PLENO (Art. 22 LBRL). Dirección del gobierno local y jefatura de personal = Competencia del ALCALDE (Art. 21 LBRL)."
        },
        {
          name: "Régimen de Mayorías en los Órganos Colegiados Locales",
          mechanism: "Exigir mayoría absoluta para acuerdos que únicamente requieren mayoría simple de los miembros presentes.",
          howToAvoid: "Regla general en régimen local: Mayoría SIMPLE. Mayoría ABSOLUTA solo para asuntos tasados (Art. 47.2 LBRL: reglamentos, deslindes, concesiones mayores)."
        }
      ],
      mockTrapQuestions: [
        {
          question: `En el marco de la organización de ${cleanTitle}, ¿a qué órgano municipal corresponde la aprobación definitiva de las Ordenanzas y del Presupuesto General conforme a la Ley 7/1985 (LBRL)?`,
          options: [
            "A la Junta de Gobierno Local previa delegación",
            "Al Pleno de la Corporación Municipal",
            "Al Alcalde mediante Decreto de Alcaldía",
            "Al Secretario General del Ayuntamiento"
          ],
          correctIndex: 1,
          explanation: "El artículo 22.2 de la Ley 7/1985 (LBRL) atribuye en exclusiva al Pleno la aprobación del presupuesto y las ordenanzas."
        }
      ],
      keyAdvice: `En ${cleanTitle}, domina la Ley 7/1985 (LBRL) y el Reglamento de Organización y Funcionamiento (ROF) aplicable a ${localOrganism}.`
    };
  }

  // Sector 4: Autonómico
  if (adminType === "Autonómica") {
    return {
      opposition: cleanTitle,
      typicalTraps: [
        {
          name: `Legislación Autonómica de ${region} vs. Normativa Estatal Básica`,
          mechanism: `Presentar como norma básica estatal un artículo específico del Estatuto de Autonomía o ley de la función pública de ${region}.`,
          howToAvoid: "Identifica qué materias son competencia exclusiva estatal (Art. 149.1 CE: bases del régimen jurídico de AAPP, procedimiento administrativo) y cuáles son de desarrollo estatutario de " + region + "."
        },
        {
          name: "Plazos de Recursos Administrativos Autonómicos",
          mechanism: "Modificar el plazo del recurso de alzada o reposición en la ley del procedimiento de la Comunidad Autónoma.",
          howToAvoid: "Los plazos de recursos administrativos los fija de forma homogénea e imperativa la Ley 39/2015 (1 mes para alzada y reposición expresos)."
        }
      ],
      mockTrapQuestions: [
        {
          question: `En el proceso selectivo de ${cleanTitle}, ¿qué norma autonómica ostenta el rango de norma institucional básica en el ámbito territorial de ${region}?`,
          options: [
            "El Reglamento Orgánico del Consejo de Gobierno",
            "El Estatuto de Autonomía de " + region,
            "La Ley del Procedimiento Administrativo Común",
            "El Real Decreto Legislativo 5/2015 (TREBEP)"
          ],
          correctIndex: 1,
          explanation: "El Estatuto de Autonomía es la norma institucional básica de la Comunidad Autónoma según el artículo 147 de la Constitución Española."
        }
      ],
      keyAdvice: `Atención en ${cleanTitle}: diferencia la legislación básica del Estado de las especialidades de la administración autonómica de ${region}.`
    };
  }

  // Default: Custom Opposition Traps
  return {
    opposition: cleanTitle,
    typicalTraps: [
      {
        name: `Cómputo de Plazos en la Convocatoria de ${cleanTitle} (Ley 39/2015)`,
        mechanism: `En el examen de ${cleanTitle}, el tribunal suele formular supuestos considerando los sábados como días hábiles o dando por sentadas notificaciones en días festivos.`,
        howToAvoid: "Desde la Ley 39/2015, los sábados son INHÁBILES en toda la Administración Pública. Los plazos en días se presumen siempre hábiles excluyendo sábados, domingos y festivos."
      },
      {
        name: `Régimen Disciplinario del Personal en ${cleanTitle} (TREBEP)`,
        mechanism: "Intercambiar los plazos de prescripción de faltas graves (2 años) y muy graves (3 años) o de las sanciones impuestas.",
        howToAvoid: "Prescripción de faltas (Art. 97 TREBEP): Muy graves = 3 años; Graves = 2 años; Leves = 6 meses. ¡Aprende el trienio 3-2-6!"
      }
    ],
    mockTrapQuestions: [
      {
        question: `Respecto al proceso selectivo y régimen jurídico aplicable en ${cleanTitle}, ¿cómo se computan los plazos señalados por días según el artículo 30 de la Ley 39/2015?`,
        options: [
          "Se entienden siempre como días naturales salvo que expresamente se indique lo contrario",
          "Se entienden como días hábiles, excluyéndose del cómputo los sábados, los domingos y los declarados festivos",
          "Se computan incluyendo los sábados pero excluyendo los festivos locales",
          "Depende de la fecha del boletín de publicación"
        ],
        correctIndex: 1,
        explanation: "El artículo 30.2 de la Ley 39/2015 dictamina que salvo que por ley se disponga otra cosa, los plazos por días se entienden hábiles, excluyendo sábados, domingos y festivos."
      }
    ],
    keyAdvice: `Para la oposición de ${cleanTitle}, repasa exhaustivamente los plazos exactos del TREBEP y la Ley 39/2015 para evitar errores habituales del examen.`
  };
}

// 5. Generate test questions adapted to selected opposition sector and topics
export function generateClientTest(oppositionName: string, blocks?: string[], count: number = 5, difficulty: string = "Medio"): any {
  const { sector } = analyzeKeywords(oppositionName);
  
  let pool: any[] = [];

  if (sector === "Sanidad") {
    pool = [
      {
        question: `En relación con la Ley 41/2002 de Autonomía del Paciente, ¿a quién pertenece la titularidad del derecho a la información asistencial?`,
        options: [
          "Al médico responsable de la unidad obligatoriamente",
          "Al paciente, y también se informará a las personas vinculadas a él por razones familiares o de hecho en la medida en que el paciente lo permita de manera expresa o tácita",
          "Únicamente al cónyuge o familiar más cercano firmado en la ficha de ingreso",
          "Al director del centro sanitario público"
        ],
        correctIndex: 1,
        justification: "El artículo 5.1 de la Ley 41/2002 establece que el titular del derecho a la información es el paciente."
      },
      {
        question: `De acuerdo con el Estatuto Marco (Ley 55/2003), el personal estatutario de los servicios de salud que sea nombrado para la realización de funciones de carácter temporal o coyuntural se clasifica como:`,
        options: [
          "Personal estatutario fijo de carrera",
          "Personal estatutario temporal (interino, eventual o de sustitución)",
          "Personal laboral indefinido no fijo",
          "Personal funcionario eventual del ministerio"
        ],
        correctIndex: 1,
        justification: "El artículo 9 de la Ley 55/2003 clasifica al personal estatutario temporal en interino, eventual y de sustitución."
      },
      {
        question: `Según la Ley 41/2002, ¿cuál de los siguientes documentos es un requisito formal indispensable para otorgar la representación en las Instrucciones Previas (testamento vital)?`,
        options: [
          "Declaración verbal ante dos enfermeros de planta",
          "Formalización ante Notario o mediante documento público ante tres testigos (dos de los cuales no tengan relación de parentesco)",
          "Simple nota manuscrita guardada en el historial asistencial",
          "Autorización expresa de la Consejería de Sanidad"
        ],
        correctIndex: 1,
        justification: "El artículo 11 de la Ley 41/2002 exige formalización ante Notario o ante tres testigos sin vinculación de parentesco."
      },
      {
        question: `¿Qué plazo de conservación de la documentación clínica garantiza la Ley 41/2002 como mínimo legal a partir de la fecha del alta de cada proceso asistencial?`,
        options: [
          "Como mínimo 1 año desde la fecha de alta",
          "Como mínimo 5 años contados desde la fecha del alta de cada proceso asistencial",
          "Como mínimo 10 años en el archivo central",
          "Indefinidamente sin posibilidad de expurgo"
        ],
        correctIndex: 1,
        justification: "El artículo 17.1 de la Ley 41/2002 fija en 5 años el plazo mínimo de conservación de la historia clínica desde la fecha del alta."
      },
      {
        question: `Conforme a la Ley 55/2003 del Estatuto Marco, la sanción de separación del servicio del personal estatutario solo podrá imponerse por la comisión de:`,
        options: [
          "Faltas leves reiteradas en un trimestre",
          "Faltas graves de puntualidad",
          "Faltas muy graves tipificadas en el artículo 72",
          "Incumplimiento de horario de guardia no continuada"
        ],
        correctIndex: 2,
        justification: "El artículo 73.1.a de la Ley 55/2003 determina que la separación del servicio solo procede ante la comisión de faltas muy graves."
      }
    ];
  } else if (sector === "Policía") {
    pool = [
      {
        question: `Conforme al artículo 18.2 de la Constitución Española, el domicilio es inviolable. ¿En qué casos se autoriza la entrada o registro en él sin consentimiento del titular?`,
        options: [
          "Por decisión motivada del Comisario de Policía",
          "Únicamente mediante resolución judicial o en caso de flagrante delito",
          "Por orden verbal del Alcalde del municipio",
          "En cualquier inspección administrativa ordinaria"
        ],
        correctIndex: 1,
        justification: "El artículo 18.2 de la CE consagra que ninguna entrada o registro podrá hacerse en el domicilio sin consentimiento del titular o resolución judicial, salvo en caso de flagrante delito."
      },
      {
        question: `Según la LO 2/1986 de Fuerzas y Cuerpos de Seguridad, los principios básicos de actuación imponen que los miembros de las FCS deben actuar con:`,
        options: [
          "Absoluta neutralidad política e imparcialidad, y bajo los principios de jerarquía y subordinación",
          "Autonomía decisoria al margen del mando",
          "Prioridad de uso de la fuerza sobre la negociación verbal",
          "Criterios de oportunidad comercial"
        ],
        correctIndex: 0,
        justification: "El artículo 5 de la LO 2/1986 fija como principios básicos la neutralidad política, imparcialidad y jerarquía."
      },
      {
        question: `De acuerdo con la LO 4/2015 de Protección de la Seguridad Ciudadana, la negativa a identificarse a requerimiento de los agentes de la autoridad constituye:`,
        options: [
          "Una falta leve penal de injurias",
          "Una infracción administrativa GRAVE contra la seguridad ciudadana",
          "Una falta administrativa de carácter superflua",
          "Un delito de desobediencia que exige prisión inmediata"
        ],
        correctIndex: 1,
        justification: "El artículo 36.6 de la LO 4/2015 tipifica la negativa a identificarse como infracción grave."
      },
      {
        question: `En la diligencia de identificación en dependencias policiales regulada en el artículo 16 de la LO 4/2015, los agentes expedirán al interesado al finalizar la misma:`,
        options: [
          "Un carné provisional de residencia",
          "Un volante acreditativo del tiempo de permanencia en el que consten los motivos de la identificación",
          "Una sanción pecuniaria directa de 100 euros",
          "Una citación para el juzgado de lo penal"
        ],
        correctIndex: 1,
        justification: "El artículo 16.2 de la LO 4/2015 exige expedir a la persona identificada un volante acreditativo del tiempo de permanencia."
      }
    ];
  } else if (sector === "Justicia") {
    pool = [
      {
        question: `En un procedimiento civil ordinario, ¿cuál es el plazo general para contestar a la demanda a contar desde el día siguiente a la citación o emplazamiento?`,
        options: [
          "10 días hábiles",
          "20 días hábiles",
          "15 días naturales",
          "1 mes natural"
        ],
        correctIndex: 1,
        justification: "El artículo 404 de la LEC estipula el plazo de 20 días hábiles para contestar a la demanda en el juicio ordinario."
      },
      {
        question: `¿A qué Cuerpo de la Administración de Justicia corresponde la ejecución de los embargos, lanzamientos y demás actos de auxilio judicial?`,
        options: [
          "Al Cuerpo de Gestores Procesales únicamente",
          "Al Cuerpo de Auxilio Judicial",
          "Al Cuerpo de Tramitación Procesal",
          "A la Policía Local encargada del término"
        ],
        correctIndex: 1,
        justification: "El artículo 478 de la LOPJ atribuye al Cuerpo de Auxilio Judicial la práctica de notificaciones, citaciones, emplazamientos, embargos y lanzamientos."
      },
      {
        question: `Las resoluciones del Letrado de la Administración de Justicia mediante las cuales se pone fin a un procedimiento del que tenga atribuida competencia exclusiva se denominan:`,
        options: [
          "Providencias",
          "Decretos",
          "Diligencias de ordenación",
          "Autos de archivo"
        ],
        correctIndex: 1,
        justification: "El artículo 206.2 de la LEC establece que el Letrado de la AJ dictará Decreto cuando se ponga fin al procedimiento o se resuelva la admisión de demandas."
      }
    ];
  } else {
    // General Admin / Hacienda / Educación Pool
    pool = [
      {
        question: `En relación con la Ley 39/2015, ¿cuál de los siguientes actos administrativos es NULO de pleno derecho?`,
        options: [
          "El dictado con defecto de forma que no produce indefensión",
          "El dictado por un órgano manifiestamente incompetente por razón de la materia o del territorio",
          "El notificado con retraso de 3 días sobre el plazo legal",
          "El expedido sin firma electrónica delegada"
        ],
        correctIndex: 1,
        justification: "Según el artículo 47.1.b de la Ley 39/2015, son nulos de pleno derecho los actos dictados por órganos manifiestamente incompetentes por razón de la materia o del territorio."
      },
      {
        question: `Conforme al artículo 21.2 de la Ley 39/2015, cuando la norma reguladora del procedimiento no fije el plazo máximo para resolver y notificar, dicho plazo será de:`,
        options: [
          "1 mes",
          "3 meses",
          "6 meses",
          "20 días hábiles"
        ],
        correctIndex: 1,
        justification: "El artículo 21.2 de la Ley 39/2015 señala que cuando la norma no fije un plazo explícito, este no podrá exceder de 3 meses."
      },
      {
        question: `De acuerdo con el Estatuto Básico del Empleado Público (TREBEP), las faltas disciplinarias prescriben:`,
        options: [
          "Las muy graves a los 3 años, las graves a los 2 años y las leves a los 6 meses",
          "Todas prescriben al año de su comisión",
          "Las muy graves a los 5 años y las leves a los 3 meses",
          "No prescriben nunca si afectan al presupuesto público"
        ],
        correctIndex: 0,
        justification: "El artículo 97 del TREBEP establece que las faltas muy graves prescriben a los 3 años, las graves a los 2 años y las leves a los 6 meses."
      },
      {
        question: `Frente a una resolución expresa que pone fin a la vía administrativa, ¿qué recurso administrativo cabe interponer de forma POTESTATIVA antes de acudir a la vía contencioso-administrativa?`,
        options: [
          "Recurso de Alzada en el plazo de 1 mes",
          "Recurso Potestativo de Reposición en el plazo de 1 mes",
          "Recurso Extraordinario de Revisión en 3 meses",
          "Reclamación previa civil en 20 días"
        ],
        correctIndex: 1,
        justification: "El artículo 123 de la Ley 39/2015 regula el recurso potestativo de reposición ante el mismo órgano que dictó el acto en el plazo de un mes."
      },
      {
        question: `Según el artículo 30.5 de la Ley 39/2015, cuando un día fuese hábil en el municipio de residencia del interesado e inhábil en la sede del órgano administrativo:`,
        options: [
          "Se considerará hábil a todos los efectos",
          "Se considerará inhábil en todo caso",
          "Se computará como medio día hábil",
          "Exige solicitar prórroga de plazo expresamente"
        ],
        correctIndex: 1,
        justification: "El artículo 30.5 de la Ley 39/2015 dicta que cuando un día sea inhábil en el municipio del interesado o en el del órgano competente, se considerará inhábil en todo caso."
      }
    ];
  }

  // Slice or multiply to return desired count
  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    const q = pool[i % pool.length];
    result.push({
      ...q,
      question: count > pool.length ? `[Pregunta ${i + 1}] ${q.question}` : q.question
    });
  }

  return { questions: result };
}
