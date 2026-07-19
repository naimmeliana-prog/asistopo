import { OppositionData } from "../types";

export const OPPOSITIONS_DATABASE: OppositionData[] = [
  {
    id: "tramitacion-procesal",
    name: "Tramitación Procesal y Administrativa",
    shortName: "Tramitación Procesal",
    group: "C1",
    adminType: "Estatal",
    region: "Nacional (Ministerio de Justicia)",
    status: "Abierto",
    generalRequirements: [
      "Nacionalidad española.",
      "Tener cumplidos los 16 años y no exceder la edad máxima de jubilación forzosa.",
      "Título de Bachiller o equivalente.",
      "Poseer la capacidad funcional necesaria para el desempeño de las tareas del cuerpo.",
      "No haber sido condenado por delito doloso a penas privativas de libertad mayores de tres años."
    ],
    tribunalQualities: [
      "Rigurosidad técnica en las respuestas de plazos procesales.",
      "Dominio de las reformas digitales introducidas por el RDL 6/2023.",
      "Exactitud en la terminología jurídica empleada (Ley Orgánica del Poder Judicial).",
      "Comprensión de la tramitación de los distintos tipos de procedimientos civiles y penales."
    ],
    card: {
      vacancies: 1254,
      scale: "Cuerpo de Tramitación Procesal y Administrativa (Grupo C1)",
      deadline: "2026-09-15",
      referenceBOE: "BOE-A-2026-8832",
      officialLink: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8832",
      place: "Ámbito del Ministerio de Justicia y Comunidades Autónomas con competencias transferidas.",
      examType: "Oposición (Cuestionario teórico + Caso práctico + Ejercicio de ofimática/mecanografía)",
      minDegree: "Bachillerato, FP de Grado Medio o equivalente.",
      legislativeWarning: "Se recomienda centrar el estudio en convocatorias del año 2023 en adelante. El temario judicial fue afectado por la plena entrada en vigor de la Ley 20/2011 del Registro Civil en abril de 2021, y múltiples regulaciones de Eficiencia Digital (RDL 6/2023) y Procesal introducidas en Reales Decretos-leyes recientes."
    },
    syllabus: [
      {
        id: "bloque-i-constitucional",
        title: "Bloque I: Constitución Española y Organización Judicial",
        weight: 25,
        topics: [
          {
            id: "tema-1",
            title: "Tema 1: La Constitución Española de 1978",
            articles: ["Art. 1 a 55 CE", "Art. 117 a 127 CE (Poder Judicial)"],
            content: "La Constitución Española de 1978. Estructura y caracteres. Valores superiores. Derechos fundamentales y libertades públicas. Sus garantías y suspensión. La Corona. Las Cortes Generales."
          },
          {
            id: "tema-2",
            title: "Tema 2: El Tribunal Constitucional y de la Unión Europea",
            articles: ["Ley Orgánica 2/1979 del TC", "Tratado de la Unión Europea (TUE)"],
            content: "El Tribunal Constitucional: Composición y atribuciones. El recurso de amparo. La Unión Europea: Instituciones, fuentes del Derecho de la Unión y su aplicación en España."
          }
        ]
      },
      {
        id: "bloque-ii-organizacion-personal",
        title: "Bloque II: Oficina Judicial y Estatuto del Personal",
        weight: 35,
        topics: [
          {
            id: "tema-3",
            title: "Tema 3: La Oficina Judicial",
            articles: ["Art. 435 LOPJ", "Ley Orgánica del Poder Judicial"],
            content: "La Oficina Judicial: Nuevo modelo organizativo. Unidades Procesales de Apoyo Directo (UPAD) y Servicios Comunes Procesales (SCP). El Letrado de la Administración de Justicia."
          },
          {
            id: "tema-4",
            title: "Tema 4: Personal al servicio de la Administración de Justicia",
            articles: ["Art. 470 a 540 LOPJ"],
            content: "Cuerpos de Funcionarios de la Administración de Justicia: Cuerpos Generales y Especiales. Derechos, deberes, adquisición y pérdida de la condición de funcionario. Régimen disciplinario."
          }
        ]
      },
      {
        id: "bloque-iii-procedimientos",
        title: "Bloque III: Procedimientos Civiles y Penales",
        weight: 40,
        topics: [
          {
            id: "tema-5",
            title: "Tema 5: El Procedimiento Declarativo Civil Ordinario",
            articles: ["Art. 248 a 436 LEC (Ley Enjuiciamiento Civil)"],
            content: "Reglas generales de los juicios civiles. El juicio ordinario: Demanda, contestación, audiencia previa, juicio y sentencia. Tramitación detallada por el funcionario de auxilio y tramitación."
          },
          {
            id: "tema-6",
            title: "Tema 6: El Juicio Verbal y Procesos de Ejecución",
            articles: ["Art. 437 a 447 LEC", "Art. 538 a 720 LEC (Ejecución Civil)"],
            content: "El juicio verbal civil: Especialidades de inicio por demanda sucinta y citación para vista. Procesos ejecutivos: Despacho de ejecución, embargos de bienes, plazos de oposición y subastas."
          }
        ]
      }
    ],
    officialExams: [
      {
        year: 2024,
        location: "Nacional",
        questionsCount: 100,
        questions: [
          {
            question: "¿De qué plazo dispone el demandado para contestar a la demanda en un Juicio Ordinario Civil?",
            options: [
              "10 días hábiles",
              "15 días hábiles",
              "20 días hábiles",
              "30 días hábiles"
            ],
            correctIndex: 2,
            justification: "De conformidad con el artículo 404 de la Ley de Enjuiciamiento Civil (LEC), el Letrado de la Administración de Justicia emplazará al demandado para que la conteste en el plazo de 20 días."
          },
          {
            question: "Según el RDL 6/2023, ¿cuál es el medio preferente para la realización de actos procesales de comunicación?",
            options: [
              "Notificación por correo postal certificado con acuse de recibo",
              "Medios electrónicos directos, salvo personas no obligadas a relacionarse digitalmente",
              "Entrega en mano por el Funcionario de Auxilio Judicial únicamente",
              "Publicación directa en el Tablón de Anuncios del Juzgado"
            ],
            correctIndex: 1,
            justification: "El RDL 6/2023 de Eficiencia Digital impone la vía telemática/electrónica como el canal de comunicación preferencial y obligatorio para profesionales y personas jurídicas obligadas."
          },
          {
            question: "¿Qué artículo de la Constitución Española consagra la independencia del Poder Judicial y el sometimiento de jueces y magistrados únicamente al imperio de la ley?",
            options: [
              "Artículo 103.1",
              "Artículo 117.1",
              "Artículo 122.2",
              "Artículo 9.3"
            ],
            correctIndex: 1,
            justification: "El artículo 117.1 de la Constitución Española de 1978 establece expresamente que la justicia emana del pueblo y se administra en nombre del Rey por Jueces y Magistrados independientes, inamovibles, responsables y sometidos únicamente al imperio de la ley."
          },
          {
            question: "¿Qué recurso cabe interponer contra los Decretos del Letrado de la Administración de Justicia que pongan fin al procedimiento?",
            options: [
              "Recurso de Alza",
              "Recurso de Revisión ante el Juez",
              "Recurso de Reposición",
              "Recurso de Queja procesal"
            ],
            correctIndex: 1,
            justification: "Según el artículo 454 bis de la Ley de Enjuiciamiento Civil (LEC), cabe recurso de revisión ante el Tribunal/Juez del procedimiento contra los decretos por los que el Letrado de la AJ ponga fin al proceso o resuelva la reposición."
          },
          {
            question: "¿En qué plazo debe interponerse el Recurso de Apelación civil contra sentencias dictadas en primera instancia?",
            options: [
              "5 días hábiles",
              "10 días hábiles",
              "20 días hábiles",
              "30 días hábiles"
            ],
            correctIndex: 2,
            justification: "De acuerdo con el artículo 458.1 de la Ley de Enjuiciamiento Civil, el recurso de apelación se interpondrá ante el tribunal que haya dictado la resolución que se impugne dentro del plazo de 20 días."
          },
          {
            question: "En el procedimiento penal español, ¿cuál es el plazo máximo de detención policial preventiva ordinaria antes de poner al detenido a disposición judicial?",
            options: [
              "24 horas",
              "48 horas",
              "72 horas",
              "96 horas"
            ],
            correctIndex: 2,
            justification: "El artículo 17.2 de la Constitución y el artículo 520 de la LECrim disponen que la detención preventiva no podrá durar más del tiempo estrictamente necesario, con un límite máximo absoluto de 72 horas."
          },
          {
            question: "¿A qué órgano corresponde conocer de los recursos de casación civil en el ámbito judicial español?",
            options: [
              "A la Sala de lo Civil del Tribunal Supremo (Sala Primera)",
              "Al Pleno del Consejo General del Poder Judicial",
              "A la Sala de lo Civil y Penal de los Tribunales Superiores de Justicia únicamente",
              "A la Audiencia Nacional"
            ],
            correctIndex: 0,
            justification: "Conforme a la Ley Orgánica del Poder Judicial, corresponde a la Sala Primera (de lo Civil) del Tribunal Supremo el conocimiento de los recursos de casación, revisión y otros extraordinarios en materia civil."
          },
          {
            question: "En el marco del procedimiento administrativo, según la Ley 39/2015, ¿cómo se computan los plazos señalados por días hábiles?",
            options: [
              "Excluyendo los sábados, domingos y los declarados festivos",
              "Excluyendo solo domingos y festivos oficiales estatales",
              "Incluyendo todos los días naturales excepto el día de la Constitución",
              "Excluyendo solo sábados y domingos de agosto"
            ],
            correctIndex: 0,
            justification: "El artículo 30.2 de la Ley 39/2015 establece que siempre que por Ley o en el Derecho de la Unión Europea no se exprese otro cómputo, cuando los plazos se señalen por días, se entiende que estos son hábiles, excluyéndose del cómputo los sábados, los domingos y los declarados festivos."
          },
          {
            question: "¿Cuál es el quórum necesario para declarar aprobada una reforma constitucional ordinaria según el artículo 167 de la Constitución Española?",
            options: [
              "Mayoría simple de ambas Cámaras",
              "Mayoría de tres quintos de cada una de las Cámaras",
              "Mayoría absoluta de ambas Cámaras",
              "Unanimidad del Congreso y mayoría de dos tercios del Senado"
            ],
            correctIndex: 1,
            justification: "El artículo 167.1 de la Constitución Española indica que los proyectos de reforma constitucional deberán ser aprobados por una mayoría de tres quintos de cada una de las Cámaras."
          },
          {
            question: "¿Qué tipo de declaración judicial formal pone fin a la fase de instrucción del sumario ordinario penal?",
            options: [
              "Auto de sobreseimiento provisional",
              "Auto de conclusión del sumario",
              "Sentencia absolutoria parcial",
              "Providencia de apertura de juicio"
            ],
            correctIndex: 1,
            justification: "De acuerdo con la Ley de Enjuiciamiento Criminal (LECrim), el Juez de Instrucción dará por concluida la instrucción mediante el dictado del 'Auto de conclusión del sumario', remitiendo las actuaciones a la Audiencia Provincial competente."
          }
        ]
      },
      {
        year: 2023,
        location: "Nacional",
        questionsCount: 100,
        questions: [
          {
            question: "Con la entrada en vigor total de la Ley 20/2011 del Registro Civil en abril de 2021, ¿quién ostenta la condición de Encargado de la Oficina General del Registro Civil?",
            options: [
              "Un Juez de Primera Instancia e Instrucción obligatoriamente",
              "Un Letrado de la Administración de Justicia o un funcionario del subgrupo A1 especializado",
              "Un Notario del municipio seleccionado",
              "El Alcalde de la localidad correspondiente"
            ],
            correctIndex: 1,
            justification: "La Ley 20/2011 desjudicializa el Registro Civil y establece que las oficinas estarán a cargo de Letrados de la Administración de Justicia o personal del subgrupo A1."
          },
          {
            question: "¿Quién es el órgano competente para acordar el nombramiento de los Magistrados del Tribunal Supremo de España?",
            options: [
              "El Ministro de Justicia de forma directa",
              "El Rey, a propuesta del Consejo General del Poder Judicial mediante Real Decreto",
              "El Congreso de los Diputados por mayoría de dos tercios",
              "El Presidente del Tribunal Supremo de forma autónoma"
            ],
            correctIndex: 1,
            justification: "Conforme al artículo 343 de la LOPJ, los Magistrados del Tribunal Supremo son nombrados por Real Decreto del Rey, expedido a propuesta y previa elección del Consejo General del Poder Judicial (CGPJ)."
          },
          {
            question: "¿Qué recurso cabe interponer ante un órgano administrativo superior contra las resoluciones que no ponen fin a la vía administrativa?",
            options: [
              "Recurso de Alzada",
              "Recurso potestativo de Reposición",
              "Recurso extraordinario de Revisión",
              "Recurso Contencioso-Administrativo"
            ],
            correctIndex: 0,
            justification: "El artículo 121 de la Ley 39/2015 regula el Recurso de Alzada, que se interpone contra actos que no pongan fin a la vía administrativa ante el órgano superior jerárquico del que los dictó."
          },
          {
            question: "¿Cuál es el plazo para interponer un recurso potestativo de reposición administrativo contra un acto expreso?",
            options: [
              "10 días hábiles",
              "15 días hábiles",
              "1 mes",
              "3 meses"
            ],
            correctIndex: 2,
            justification: "Según el artículo 124.1 de la Ley 39/2015, el plazo para la interposición del recurso potestativo de reposición será de un mes si el acto fuera expreso."
          },
          {
            question: "¿A partir de qué momento surten efecto, con carácter general, las resoluciones y actos administrativos?",
            options: [
              "Desde la fecha en que se firman por el órgano emisor",
              "Desde el momento en que se publican en el BOE únicamente",
              "Desde la fecha en que se practique la notificación formal o publicación oficial",
              "A los 20 días de su inserción en el tablón del Ayuntamiento"
            ],
            correctIndex: 2,
            justification: "El artículo 39.1 de la Ley 39/2015 prescribe que los actos de las Administraciones Públicas sujetos al Derecho Administrativo se presumirán válidos y producirán efectos desde la fecha en que se dicten, salvo que en ellos se disponga otra cosa o surtan efecto desde su notificación o publicación."
          },
          {
            question: "¿Qué mayoría se requiere para la adopción de acuerdos del Consejo General del Poder Judicial (CGPJ) con carácter general?",
            options: [
              "Mayoría simple",
              "Mayoría absoluta de sus miembros en todo caso",
              "Mayoría de tres quintos de los vocales asistentes",
              "Unanimidad"
            ],
            correctIndex: 0,
            justification: "Según la LOPJ, salvo en los casos en que la ley requiera de forma excepcional una mayoría cualificada superior (como el nombramiento de ciertos cargos), los acuerdos del Pleno del CGPJ se adoptan por mayoría simple de los asistentes."
          },
          {
            question: "En el procedimiento penal ordinario, ¿a quién corresponde resolver el recurso de queja contra la denegación de una apelación civil o de una apelación penal?",
            options: [
              "Al Tribunal Superior que sea competente para conocer del recurso principal denegado",
              "Al Consejo General del Poder Judicial en funciones disciplinarias",
              "Al Tribunal Constitucional por vía de amparo directo",
              "Al mismo Juez de Instrucción que denegó la resolución"
            ],
            correctIndex: 0,
            justification: "El recurso de queja penal o procesal se interpone de forma instrumental ante el tribunal ad quem (el tribunal jerárquicamente superior que resolvería el recurso de apelación principal si hubiese sido admitido) para que ordene la admisión."
          },
          {
            question: "¿Qué título de la Constitución Española de 1978 está dedicado monográficamente al Poder Judicial?",
            options: [
              "Título III",
              "Título IV",
              "Título V",
              "Título VI"
            ],
            correctIndex: 3,
            justification: "El Título VI de la Constitución Española abarca los artículos 117 al 127 y se titula expresamente 'Del Poder Judicial'."
          },
          {
            question: "¿Qué ley regula las bases del Régimen Local en el ordenamiento jurídico de España?",
            options: [
              "Ley 7/1985, de 2 de abril",
              "Ley 39/2015, de 1 de octubre",
              "Ley 40/2015, de 1 de octubre",
              "Ley Orgánica 2/1986, de 13 de marzo"
            ],
            correctIndex: 0,
            justification: "La Ley 7/1985, de 2 de abril, Reguladora de las Bases del Régimen Local (LRBRL), constituye la norma estatal de referencia sobre el régimen jurídico y competencias del Municipio y la Provincia."
          },
          {
            question: "En un procedimiento de juicio verbal civil, ¿cuál es el plazo que tiene el demandado para contestar a la demanda por escrito?",
            options: [
              "5 días hábiles",
              "10 días hábiles",
              "20 días hábiles",
              "30 días hábiles"
            ],
            correctIndex: 1,
            justification: "Tras las reformas legislativas de modernización procesal, el artículo 438.1 de la Ley de Enjuiciamiento Civil establece que el demandado dispondrá de 10 días hábiles para contestar a la demanda de juicio verbal."
          }
        ]
      }
    ],
    practicalCases: [
      {
        id: "caso-1",
        title: "Ejecución Forzosa sobre Bienes Inmuebles en Demanda de Cantidad",
        year: 2024,
        situation: "Don Juan presenta demanda ejecutiva de cantidad de 15.000€ derivada de un título judicial firme contra Don Luis. Se despacha ejecución y el ejecutado no formula oposición dentro del plazo. Se procede a investigar el patrimonio del ejecutado resultando que es propietario de una vivienda urbana libre de cargas en Madrid valorada en 180.000€.",
        questions: [
          {
            question: "¿Cuál es el plazo del ejecutado para oponerse a la ejecución civil por motivos de fondo?",
            legalBase: "Art. 556.1 de la LEC",
            solution: "El ejecutado tiene un plazo improrrogable de 10 días siguientes a la notificación del auto de despacho de ejecución para oponerse por escrito."
          },
          {
            question: "¿Puede el funcionario judicial acordar el embargo directo del inmueble sin requerimiento previo de pago?",
            legalBase: "Art. 581 de la LEC",
            solution: "Sí, cuando la demanda ejecutiva vaya acompañada del requerimiento de pago efectuado notarial o judicialmente con anterioridad, o bien cuando no sea posible localizar al ejecutado tras el despacho."
          }
        ]
      }
    ]
  },
  {
    id: "auxilio-judicial",
    name: "Auxilio Judicial",
    shortName: "Auxilio Judicial",
    group: "C2",
    adminType: "Estatal",
    region: "Nacional (Ministerio de Justicia)",
    status: "Abierto",
    generalRequirements: [
      "Nacionalidad española.",
      "Tener cumplidos los 16 años.",
      "Título de Graduado en ESO o equivalente.",
      "Capacidad funcional plena.",
      "No estar inhabilitado para el ejercicio de funciones públicas."
    ],
    tribunalQualities: [
      "Destreza y precisión en la realización de actos de comunicación (notificaciones, citaciones, emplazamientos, requerimientos).",
      "Conocimiento riguroso del protocolo de lanzamientos, embargos y ejecuciones de desahucios.",
      "Cumplimiento exacto de los plazos procesales urgentes.",
      "Excelente trato con el ciudadano y tacto procesal."
    ],
    card: {
      vacancies: 950,
      scale: "Cuerpo de Auxilio Judicial (Grupo C2)",
      deadline: "2026-09-15",
      referenceBOE: "BOE-A-2026-8833",
      officialLink: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8833",
      place: "Todo el territorio del Estado Español.",
      examType: "Oposición (Examen tipo test teórico + Examen tipo test sobre supuesto práctico)",
      minDegree: "Educación Secundaria Obligatoria (ESO).",
      legislativeWarning: "Atención: La Ley 20/2011 de Registro Civil transformó las Oficinas de Registro Civil y las funciones de Auxilio en los juzgados de paz. Los lanzamientos procesales se han adaptado recientemente a las exigencias habitacionales de la Ley de Vivienda de 2023, introduciendo filtros de vulnerabilidad esenciales."
    },
    syllabus: [
      {
        id: "bloque-aux-i",
        title: "Bloque I: Organización del Estado y Órganos Judiciales",
        weight: 30,
        topics: [
          {
            id: "aux-tema-1",
            title: "Tema 1: La Corona y el Gobierno de España",
            articles: ["Art. 56 a 65 CE", "Art. 97 a 107 CE"],
            content: "La Corona: funciones, sucesión. El Gobierno y la Administración. Relaciones entre el Gobierno y las Cortes Generales. Designación del Presidente del Gobierno."
          },
          {
            id: "aux-tema-2",
            title: "Tema 2: Organización Territorial del Estado",
            articles: ["Art. 137 a 158 CE"],
            content: "Las Comunidades Autónomas. Los Estatutos de Autonomía. Competencias del Estado y de las CC.AA. La Administración Local: El Municipio, la Provincia y la Isla."
          }
        ]
      },
      {
        id: "bloque-aux-ii",
        title: "Bloque II: Actos de Comunicación y Auxilio Judicial",
        weight: 70,
        topics: [
          {
            id: "aux-tema-3",
            title: "Tema 3: Los Actos de Comunicación Procesal",
            articles: ["Art. 149 a 168 LEC"],
            content: "Tipos de actos: Notificaciones, emplazamientos, citaciones y requerimientos. Práctica de la comunicación por el Funcionario de Auxilio Judicial. Formas de comunicación telemática y física."
          },
          {
            id: "aux-tema-4",
            title: "Tema 4: Los Lanzamientos y Embargos",
            articles: ["Art. 703 LEC", "Art. 150 a 160 de la Ley de Enjuiciamiento Criminal"],
            content: "La ejecución forzosa en lanzamientos de desahucio. Trámites, plazos, auxilio de la fuerza pública y protección de personas vulnerables. El depósito de bienes embargados."
          }
        ]
      }
    ],
    officialExams: [
      {
        year: 2024,
        location: "Nacional",
        questionsCount: 100,
        questions: [
          {
            question: "Cuando un acto de comunicación se practica en el domicilio del destinatario y este se niega a firmar el recibí, ¿qué debe hacer el funcionario de Auxilio Judicial?",
            options: [
              "Volver al juzgado sin entregar la documentación y declararlo rebelde",
              "Hacer constar en el acta la negativa del destinatario y entregar la copia de la resolución, surtiendo todos los efectos",
              "Llamar a dos vecinos para que actúen como testigos y firmen en su lugar obligatoriamente",
              "Dejar el documento por debajo de la puerta del domicilio"
            ],
            correctIndex: 1,
            justification: "El artículo 161.2 de la Ley de Enjuiciamiento Civil dispone que si el destinatario se niega a recibir la copia o a firmar el acta, el funcionario le hará saber que queda a su disposición en la oficina judicial, haciendo constar este extremo, y el acto de comunicación producirá plenos efectos."
          }
        ]
      }
    ],
    practicalCases: [
      {
        id: "caso-aux-1",
        title: "Desahucio por Falta de Pago y Lanzamiento Judicial",
        year: 2023,
        situation: "El juzgado dicta decreto de lanzamiento en un proceso de desahucio por impago de alquiler. El funcionario de Auxilio Judicial acude en la fecha acordada acompañado del procurador de la parte actora para ejecutar el lanzamiento de la vivienda habitual de los inquilinos.",
        questions: [
          {
            question: "¿Qué ocurre si en el acto del lanzamiento el ocupante del inmueble se niega a desalojar y alega no tener alternativa habitacional?",
            legalBase: "Art. 703 LEC y Ley 12/2023 de Vivienda",
            solution: "El funcionario debe documentar detalladamente la situación y, si existe resolución judicial firme previa de vulnerabilidad, el Letrado de la Administración de Justicia podrá acordar la suspensión temporal del lanzamiento para dar intervención a los servicios sociales."
          }
        ]
      }
    ]
  },
  {
    id: "administrativos-estado",
    name: "Cuerpo General Administrativo de la Administración del Estado",
    shortName: "Administrativos del Estado",
    group: "C1",
    adminType: "Estatal",
    region: "Nacional (INAP)",
    status: "Abierto",
    generalRequirements: [
      "Nacionalidad española o de un estado miembro de la UE.",
      "Tener cumplidos los 16 años.",
      "Título de Bachiller o equivalente técnico.",
      "No haber sido separado mediante expediente disciplinario del servicio de las administraciones públicas."
    ],
    tribunalQualities: [
      "Riguroso dominio de las Leyes 39/2015 del Procedimiento Administrativo y 40/2015 de Régimen Jurídico.",
      "Competencias ofimáticas avanzadas aplicadas a la gestión documental pública.",
      "Conocimiento de presupuestos públicos y contratación administrativa.",
      "Enfoque en políticas de igualdad y transparencia."
    ],
    card: {
      vacancies: 3450,
      scale: "Cuerpo General Administrativo (Grupo C1 - Estado)",
      deadline: "2026-10-30",
      referenceBOE: "BOE-A-2026-9912",
      officialLink: "https://www.boe.es/diario_boe/oposiciones.php",
      place: "Ministerios, delegaciones del Gobierno y organismos públicos estatales.",
      examType: "Oposición (Examen de cuestionario de 90 preguntas teórico-prácticas)",
      minDegree: "Bachillerato o equivalente.",
      legislativeWarning: "Nota legal: Es imprescindible estudiar las últimas modificaciones de la Ley 39/2015 relativas al Registro Electrónico Único de Apoderamientos y los nuevos sistemas de firma Cl@ve Permanente."
    },
    syllabus: [
      {
        id: "age-bloque-1",
        title: "Bloque I: Organización del Estado y Administración Pública",
        weight: 40,
        topics: [
          {
            id: "age-tema-1",
            title: "Tema 1: La Administración Pública y las Leyes de Procedimiento",
            articles: ["Ley 39/2015 del Procedimiento Administrativo Común"],
            content: "La Ley 39/2015: El interesado en el procedimiento. Capacidad de obrar y representación. Identificación y firma electrónica. El acto administrativo: Requisitos, eficacia, nulidad y anulabilidad."
          }
        ]
      }
    ],
    officialExams: [
      {
        year: 2024,
        location: "Nacional",
        questionsCount: 90,
        questions: [
          {
            question: "¿Cuál es el plazo general para la notificación de un acto administrativo desde que fue dictado?",
            options: [
              "5 días hábiles",
              "10 días hábiles",
              "15 días hábiles",
              "20 días hábiles"
            ],
            correctIndex: 1,
            justification: "El artículo 40.2 de la Ley 39/2015 dispone que toda notificación deberá ser cursada dentro del plazo de diez días hábiles a partir de la fecha en que el acto haya sido dictado."
          }
        ]
      }
    ],
    practicalCases: []
  },
  {
    id: "gva-administrativo",
    name: "Cuerpo Administrativo de la Generalitat Valenciana (GVA)",
    shortName: "Administrativo GVA",
    group: "C1",
    adminType: "Autonómica",
    region: "Comunidad Valenciana",
    status: "Abierto",
    generalRequirements: [
      "Nacionalidad española o de un estado miembro de la UE.",
      "Tener cumplidos los 16 años.",
      "Título de Bachiller o equivalente.",
      "Poseer la capacidad funcional necesaria para las tareas encomendadas.",
      "Conocimiento del valenciano en nivel adecuado (requisito lingüístico según convocatoria)."
    ],
    tribunalQualities: [
      "Dominio completo de la Ley de la Generalitat 1/2015 de Hacienda Pública Instrumental.",
      "Exigencia en el Estatuto de Autonomía de la Comunidad Valenciana (Ley Orgánica 1/2006).",
      "Rigurosidad en la Ley 4/2021 de la Función Pública Valenciana.",
      "Enfoque en políticas de igualdad y simplificación administrativa autonómica."
    ],
    card: {
      vacancies: 385,
      scale: "Cuerpo Administrativo de la Administración de la Generalitat (Grupo C1 - GVA)",
      deadline: "2026-11-20",
      referenceBOE: "DOGV-9876/2026",
      officialLink: "https://dogv.gva.es/es/oposiciones",
      place: "Dependencias administrativas y consellerias de la Generalitat Valenciana.",
      examType: "Oposición (Cuestionario teórico de 80 preguntas + Caso práctico estructurado)",
      minDegree: "Bachillerato o equivalente.",
      legislativeWarning: "Nota legal de GVA: Debe prestarse especial atención a las estructuras del Consell y de Les Corts reformadas en el Estatuto de Autonomía de 2006, así como al régimen jurídico de la Ley 4/2021 de la Función Pública Valenciana."
    },
    syllabus: [
      {
        id: "gva-bloque-1",
        title: "Bloque I: Derecho Constitucional y Estatuto de la C. Valenciana",
        weight: 35,
        topics: [
          {
            id: "gva-tema-1",
            title: "Tema 1: Estatuto de Autonomía de la Comunidad Valenciana",
            articles: ["Ley Orgánica 1/2006 (Estatuto CV)"],
            content: "El Estatuto de Autonomía de la Comunidad Valenciana de 2006: Orígenes históricos. Derechos, deberes y libertades de los valencianos. Las instituciones de la Generalitat Valenciana: Les Corts, el President y el Consell de la Generalitat. Competencias de la Generalitat."
          }
        ]
      },
      {
        id: "gva-bloque-2",
        title: "Bloque II: Función Pública y Hacienda de la Generalitat",
        weight: 65,
        topics: [
          {
            id: "gva-tema-2",
            title: "Tema 2: Ordenación de la Función Pública Valenciana",
            articles: ["Ley 4/2021 de la Función Pública Valenciana"],
            content: "Estructura y clases de personal empleado público al servicio de la Generalitat Valenciana. Adquisición y pérdida de la relación de servicio. Derechos y deberes. Selección de personal, carrera profesional e incompatibilidades."
          }
        ]
      }
    ],
    officialExams: [
      {
        year: 2024,
        location: "Valencia",
        questionsCount: 80,
        questions: [
          {
            question: "¿De qué institución emana la potestad legislativa de la Generalitat Valenciana según el Estatuto de Autonomía de 2006?",
            options: [
              "El Consell de la Generalitat",
              "Les Corts",
              "El President de la Generalitat Valenciana",
              "La Sindicatura de Comptes"
            ],
            correctIndex: 1,
            justification: "De acuerdo con el artículo 21 del Estatuto de Autonomía de la Comunidad Valenciana de 2006, la potestad legislativa de la Generalitat Valenciana corresponde de forma exclusiva a Les Corts."
          },
          {
            question: "Según la Ley 4/2021 de la Función Pública Valenciana, ¿cuál de los siguientes es un tipo de personal empleado público de la Generalitat?",
            options: [
              "Únicamente el personal directivo del sector privado",
              "Personal funcionario de carrera, funcionario interino, laboral y eventual",
              "Únicamente el personal laboral indefinido no fijo judicial",
              "Personal estatutario de apoyo corporativo voluntario"
            ],
            correctIndex: 1,
            justification: "El artículo 17 de la Ley 4/2021 clasifica al personal empleado público valenciano en: personal funcionario de carrera, personal funcionario interino, personal laboral y personal eventual."
          }
        ]
      }
    ],
    practicalCases: [
      {
        id: "caso-gva-1",
        title: "Procedimiento de Excedencia e Incompatibilidades en la Generalitat Valenciana",
        year: 2024,
        situation: "Una funcionaria de carrera de la GVA del Cuerpo Administrativo con 6 años de antigüedad solicita una excedencia voluntaria por interés particular para prestar servicios en el sector privado valenciano. Asimismo, un compañero solicita compatibilidad para ejercer la abogacía de forma complementaria.",
        questions: [
          {
            question: "¿Cuál es el período mínimo de permanencia en activo requerido para poder solicitar la excedencia voluntaria por interés particular en la GVA?",
            legalBase: "Art. 138 de la Ley 4/2021 de Función Pública Valenciana",
            solution: "Para solicitar la excedencia voluntaria por interés particular, se requiere haber prestado servicios efectivos en cualquiera de las administraciones públicas durante un período mínimo de dos años inmediatamente anteriores."
          }
        ]
      }
    ]
  }
];
