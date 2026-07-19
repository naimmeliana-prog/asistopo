export interface RealConvocatoria {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export const REAL_CONVOCATORIAS_DATABASE: RealConvocatoria[] = [
  // 1. Sanidad / Salud
  {
    title: "Servicio Madrileño de Salud (SERMAS) - 450 plazas de Celador / Celadora de Instituciones Sanitarias",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-18T14:22:00Z",
    description: "Bases de la convocatoria pública para la cobertura de plazas de personal laboral fijo en la categoría de celadores sanitarios del Servicio Madrileño de Salud (SERMAS)."
  },
  {
    title: "Conselleria de Sanidad (GVA) - 120 plazas de Médico / Médica de Familia de Atención Primaria",
    link: "https://dogv.gva.es/es/oposiciones",
    pubDate: "2026-07-19T12:00:00Z",
    description: "Convocatoria del proceso selectivo para el ingreso en el cuerpo de médicos y facultativos especialistas en medicina familiar y comunitaria para la red de atención primaria valenciana."
  },
  {
    title: "Servicio Andaluz de Salud (SAS) - 850 plazas de Técnico en Cuidados Auxiliares de Enfermería (TCAE)",
    link: "https://www.juntadeandalucia.es/servicioandaluzdesalud/",
    pubDate: "2026-06-14T09:00:00Z",
    description: "Resolución por la que se convoca concurso-oposición para el acceso a plazas de personal estatutario de Auxiliar de Enfermería en los centros hospitalarios de Andalucía."
  },
  {
    title: "Servicio Gallego de Salud (SERGAS) - 230 plazas de Personal de Enfermería de Atención Primaria",
    link: "https://www.xunta.gal/diario-oficial-galicia",
    pubDate: "2026-05-20T10:15:00Z",
    description: "Convocatoria oficial para la cobertura estable de plazas de la categoría de Enfermero/a del Servicio de Salud de Galicia mediante concurso-oposición."
  },
  {
    title: "Servicio Aragonés de Salud - 95 plazas de Auxiliar Administrativo de Servicios de Salud",
    link: "https://www.boa.aragon.es",
    pubDate: "2026-07-02T11:30:00Z",
    description: "Convocatoria pública para la provisión de plazas del cuerpo de Auxiliares Administrativos destinados a la red de centros de salud y hospitales de Aragón."
  },

  // 2. Seguridad / Emergencias
  {
    title: "Dirección General de la Policía - 2.458 plazas de Alumnos de la Escuela Nacional de Policía (Escala Básica)",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-18920",
    pubDate: "2025-09-12T08:00:00Z",
    description: "Convocatoria de la oposición libre para el ingreso en el Cuerpo Nacional de Policía de España en la categoría de Policía (Escala Básica)."
  },
  {
    title: "Dirección General de la Guardia Civil - 1.600 plazas para el ingreso en la Escala de Cabos y Guardias",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-14432",
    pubDate: "2025-06-25T08:30:00Z",
    description: "Bases y convocatoria del proceso selectivo para la incorporación activa al Cuerpo de la Guardia Civil de España en el empleo de Guardia."
  },
  {
    title: "Ayuntamiento de Madrid - 145 plazas de Bombero Especialista de la Escala Técnica",
    link: "https://www.madrid.es/oposiciones",
    pubDate: "2026-04-10T12:00:00Z",
    description: "Convocatoria de pruebas selectivas para el acceso libre a plazas del Cuerpo de Bomberos del Ayuntamiento de Madrid como Bombero Especialista."
  },
  {
    title: "Consorcio Provincial de Bomberos de Valencia - 60 plazas de Bombero/a Conductor/a",
    link: "https://www.bopvalencia.es",
    pubDate: "2026-03-15T09:45:00Z",
    description: "Bases reguladoras del proceso de concurso-oposición de acceso libre para la plantilla de bomberos y conductores del Consorcio de Valencia."
  },
  {
    title: "Ayuntamiento de Barcelona - 120 plazas de Agente de la Guardia Urbana de Barcelona",
    link: "https://www.barcelona.cat/oposicions",
    pubDate: "2026-02-05T10:00:00Z",
    description: "Bases generales de la convocatoria pública para la selección de agentes locales para la Guardia Urbana (Grupo C1)."
  },

  // 3. Oficios / Transportes / Conductores
  {
    title: "Ayuntamiento de Valencia - Bolsa de Empleo Urgente de Conductor / Conductora de Maquinaria y Camiones",
    link: "https://dogv.gva.es/es/oposiciones",
    pubDate: "2026-07-18T11:30:00Z",
    description: "Bases y convocatoria para la creación de una bolsa de trabajo de conductores para el servicio municipal de limpieza, saneamiento y obras del Ayuntamiento de Valencia."
  },
  {
    title: "Correos y Telégrafos - Convocatoria de 7.757 plazas de Personal Laboral Fijo (Reparto, Agente y Atención)",
    link: "https://www.correos.com/personas-y-talento/",
    pubDate: "2024-11-20T08:00:00Z",
    description: "Proceso selectivo consolidado de ingreso para puestos operativos del Grupo Profesional IV (Reparto a pie, reparto en moto, agentes de clasificación y atención al cliente)."
  },
  {
    title: "Ayuntamiento de Sevilla - Bolsa de Trabajo de Peón y Operario de Limpieza Vial",
    link: "https://www.sevilla.org/empleo-publico",
    pubDate: "2026-06-30T13:15:00Z",
    description: "Convocatoria extraordinaria y urgente para la creación de una bolsa de trabajo de peones de limpieza para reforzar los servicios municipales de Sevilla."
  },
  {
    title: "Ayuntamiento de Zaragoza - 35 plazas de Operario de Servicios y Oficios Generales",
    link: "https://www.zaragoza.es/oferta/",
    pubDate: "2026-05-18T09:00:00Z",
    description: "Pruebas de selección de acceso libre (Grupo E / Agrupaciones Profesionales) para labores básicas de mantenimiento, conserjería y oficios varios municipales."
  },
  {
    title: "Consorcio de Transportes de Asturias - 15 plazas de Conductor / Conductora de Autobús Público",
    link: "https://www.bopa.es",
    pubDate: "2026-04-22T11:00:00Z",
    description: "Bases del proceso de selección de personal fijo de plantilla en la categoría de conductor de vehículos de transporte público de pasajeros."
  },

  // 4. Administración / Gestión
  {
    title: "Ministerio de Hacienda - 3.450 plazas de Cuerpo General Administrativo de la Administración del Estado",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-18T08:30:00Z",
    description: "Convocatoria del Instituto Nacional de Administración Pública (INAP) para plazas de acceso libre y promoción interna en el Cuerpo General Administrativo (Grupo C1)."
  },
  {
    title: "Ministerio de Hacienda - 4.500 plazas de Cuerpo General Auxiliar de la Administración del Estado",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-18T08:35:00Z",
    description: "Bases oficiales del proceso selectivo para ingreso libre en el Cuerpo Auxiliar del Estado (Grupo C2), destinado a apoyo en oficinas públicas y atención ciudadana."
  },
  {
    title: "Generalitat Valenciana - 385 plazas de Cuerpo Administrativo de la Generalitat (C1 - GVA)",
    link: "https://dogv.gva.es/es/oposiciones",
    pubDate: "2026-07-17T09:15:00Z",
    description: "Resolución de la Conselleria de Justicia e Interior de la Comunidad Valenciana por la que se convocan pruebas de acceso para la escala administrativa autonómica."
  },
  {
    title: "Comunidad de Madrid - 250 plazas del Cuerpo de Auxiliares Administrativos (Grupo C2)",
    link: "https://www.comunidad.madrid/servicios/empleo/oposiciones",
    pubDate: "2026-06-08T10:00:00Z",
    description: "Convocatoria pública de acceso libre para la consolidación de personal auxiliar administrativo en las consejerías y delegaciones de la Comunidad de Madrid."
  },
  {
    title: "Junta de Andalucía - 210 plazas de Cuerpo de Gestión de la Junta de Andalucía (A2)",
    link: "https://www.juntadeandalucia.es/organismos/justiciaeinterior.html",
    pubDate: "2026-07-15T11:20:00Z",
    description: "Oposiciones de acceso libre para la cobertura de plazas del Cuerpo de Técnicos y Gestores de la Administración de la Junta de Andalucía."
  },

  // 5. Justicia
  {
    title: "Ministerio de Justicia - 920 plazas de Acceso Libre para el Cuerpo de Auxilio Judicial",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-16T10:00:00Z",
    description: "Convocatoria de oposiciones estatales para el ingreso en el Cuerpo de Auxilio Judicial (Grupo C2), con destinos en juzgados y tribunales de toda España."
  },
  {
    title: "Ministerio de Justicia - 1.254 plazas de Cuerpo de Tramitación Procesal y Administrativa",
    link: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8832",
    pubDate: "2026-07-12T09:30:00Z",
    description: "Convocatoria del proceso de selección para personal funcionario judicial del Cuerpo de Tramitación Procesal y Administrativa (Grupo C1)."
  },
  {
    title: "Ministerio de Justicia - 650 plazas de Acceso Libre para el Cuerpo de Gestión Procesal y Administrativa",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-06-28T09:00:00Z",
    description: "Orden ministerial por la que se regulan las bases selectivas para ingresar en el cuerpo de gestores de oficina judicial (Grupo A2) en territorio nacional."
  },

  // 6. Tecnología, Telecomunicaciones e Informática
  {
    title: "Ministerio de Transformación Digital - 85 plazas de Ingeniero / Ingeniera de Telecomunicaciones del Estado",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-17T10:45:00Z",
    description: "Proceso selectivo de acceso libre para el ingreso en la escala de titulados superiores de telecomunicaciones del Ministerio de Transformación Digital (Grupo A1)."
  },
  {
    title: "Ministerio de Transformación Digital - 350 plazas de Técnicos Auxiliares de Informática de la Administración del Estado (TAI)",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-07-10T12:00:00Z",
    description: "Convocatoria para el Cuerpo TAI del Estado (Grupo C1). Funciones de soporte técnico, desarrollo básico de sistemas y mantenimiento de redes en la Administración General del Estado."
  },
  {
    title: "Ministerio de Hacienda - 150 plazas del Cuerpo de Gestión de Sistemas e Informática del Estado",
    link: "https://www.boe.es/diario_boe/oposiciones.php",
    pubDate: "2026-06-18T08:00:00Z",
    description: "Pruebas selectivas para el acceso libre a la escala técnica de informática pública (Grupo A2), encargados de la infraestructura de sistemas de la administración pública central."
  },

  // 7. Educación / Docencia
  {
    title: "Comunidad de Madrid - 1.200 plazas del Cuerpo de Maestros (Educación Infantil y Primaria)",
    link: "https://www.comunidad.madrid/servicios/educacion",
    pubDate: "2026-05-15T09:00:00Z",
    description: "Convocatoria de oposiciones docentes para el ingreso en la escala de maestros con especialidades en Educación Infantil, Primaria, Lengua Extranjera y Educación Física."
  },
  {
    title: "Junta de Andalucía - 950 plazas de Profesores de Enseñanza Secundaria",
    link: "https://www.juntadeandalucia.es/educacion",
    pubDate: "2026-04-12T11:00:00Z",
    description: "Convocatoria de oposiciones públicas de acceso al cuerpo de profesores de secundaria de las materias de Geografía e Historia, Matemáticas y Lengua Castellana."
  },
  {
    title: "Generalitat de Catalunya - 1.100 plazas de Cos de Professors d'Ensenyament Secundari",
    link: "https://dogc.gencat.cat",
    pubDate: "2026-05-02T10:30:00Z",
    description: "Convocatoria de concurso-oposición para plazas docentes fijas de educación secundaria obligatoria y bachillerato en el Departamento de Educación de Cataluña."
  },

  // 8. Especiales / Otros
  {
    title: "Ayuntamiento de Madrid - Bolsa de Empleo de Jardineros / Jardineras de Parques Históricos",
    link: "https://www.madrid.es/empleo",
    pubDate: "2026-07-14T09:15:00Z",
    description: "Convocatoria para bolsa de jardinería dedicada al mantenimiento de los Jardines del Buen Retiro, Casa de Campo y parques históricos municipales."
  },
  {
    title: "Ayuntamiento de Valencia - 12 plazas de Limpiador / Limpiadora de Colegios Públicos y Dependencias Municipales",
    link: "https://www.valencia.es/oposiciones",
    pubDate: "2026-07-01T08:45:00Z",
    description: "Bases del proceso selectivo para la consolidación de personal laboral fijo del servicio de limpieza municipal y centros escolares públicos de Valencia."
  },
  {
    title: "Universidad de Barcelona - 25 plazas de Conserje y Personal de Servicios de Edificios Universitarios",
    link: "https://www.ub.edu/convocatories",
    pubDate: "2026-06-11T12:00:00Z",
    description: "Oposiciones libres de Grupo E para cubrir plazas de personal de servicios auxiliares y conserjería en las facultades del campus universitario."
  },
  {
    title: "Ayuntamiento de Bilbao - Bolsa de Trabajo de Auxiliares de Biblioteca",
    link: "https://www.bilbao.eus",
    pubDate: "2026-06-25T13:00:00Z",
    description: "Bases para la creación de una bolsa regulada de trabajo temporal de auxiliares de archivo y biblioteca pública de Bilbao."
  },
  {
    title: "Comunidad de Madrid - 45 plazas de Trabajador / Trabajadora Social de Centros de Acogida",
    link: "https://www.comunidad.madrid",
    pubDate: "2026-05-30T10:00:00Z",
    description: "Convocatoria de oposiciones para la escala de trabajadores sociales destinados a la red madrileña de residencias infantiles y albergues públicos."
  }
];
