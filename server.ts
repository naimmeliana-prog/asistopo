import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { REAL_CONVOCATORIAS_DATABASE } from "./src/data/realConvocatorias";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google GenAI
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Ensure the endpoints are registered before Vite middleware
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Serve the favicon placed in the root of the workspace
app.get("/favicon.ico", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "favicon.ico"));
});

// API endpoint to fetch BOE RSS feed
app.get("/api/boe-rss", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || "").trim();
    
    // Normalization helper for diacritics / accents in Spanish
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    let results = [...REAL_CONVOCATORIAS_DATABASE];

    if (query && query.length > 1) {
      const cleanQuery = normalize(query);
      
      // 1. Filter local real convocatorias database
      const localMatches = REAL_CONVOCATORIAS_DATABASE.filter((item) =>
        normalize(item.title).includes(cleanQuery) ||
        normalize(item.description).includes(cleanQuery)
      );

      // 2. Query Gemini for actual, authentic historical/active Spanish public convocatorias (no fakes!)
      let geminiMatches: any[] = [];
      try {
        const ai = getAI();
        const prompt = `La persona está buscando convocatorias de oposiciones o empleo público en España (BOE y diarios autonómicos) relacionadas con la palabra clave: "${query}".
Como experto oficial e histórico, devuelve una lista de convocatorias de empleo público REALES que hayan existido o estén vigentes en España.

REGLAS CRÍTICAS:
1. NO inventes, NO simules, NO generes convocatorias ficticias ni "altamente realistas". Todo lo que devuelvas debe ser una convocatoria real de la historia reciente de España o actual.
2. Si para el término de búsqueda "${query}" no existe ninguna convocatoria pública real en España, devuelve un listado vacío.
3. Asegúrate de incluir el organismo oficial real (ej: Ministerio del Interior, Ayuntamiento de Sevilla, etc.), número de plazas real u oficial aproximado, y el nombre de la escala/cuerpo real.
4. Devuelve los resultados únicamente en este formato JSON exacto:
{
  "items": [
    {
      "title": "Nombre Oficial Formal Completo de la Convocatoria",
      "link": "https://www.boe.es/diario_boe/oposiciones.php",
      "pubDate": "Fecha oficial aproximada o real en formato ISO (ej: 2025-06-12T00:00:00Z)",
      "description": "Explicación rigurosa y real del anuncio detallando plazas, grupo de titulación, sistema selectivo y fecha de bases oficiales."
    }
  ]
}

No agregues explicaciones fuera del JSON. Devuelve únicamente el objeto JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un motor de búsqueda e índice de convocatorias de empleo público REALES de España. No inventas datos ni respondes con hipótesis ficticias.",
          },
        });

        const text = response.text || "{}";
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.items)) {
          geminiMatches = parsed.items;
        }
      } catch (err) {
        console.error("Error querying Gemini for historical convocatorias:", err);
      }

      // Combine matches: priority to local exact matches, then Gemini matches
      const combined = [...localMatches, ...geminiMatches];
      
      // Deduplicate by title
      const seen = new Set<string>();
      results = [];
      for (const item of combined) {
        const titleClean = normalize(item.title);
        if (!seen.has(titleClean)) {
          seen.add(titleClean);
          results.push(item);
        }
      }

      // If we got absolute zero matches, fall back to showing a few relevant items from database
      if (results.length === 0) {
        results = REAL_CONVOCATORIAS_DATABASE.slice(0, 5);
      }
    } else {
      // If no query, return the top 12 curated real convocatorias
      results = REAL_CONVOCATORIAS_DATABASE.slice(0, 12);
    }

    res.json({ items: results });
  } catch (error: any) {
    console.error("Error in /api/boe-rss:", error);
    // Secure fallback from local curated database
    res.json({ items: REAL_CONVOCATORIAS_DATABASE.slice(0, 6) });
  }
});

// API endpoint to generate personalized study plan
app.post("/api/gemini/generate-plan", async (req: Request, res: Response) => {
  try {
    const { opposition, profile, progress } = req.body;
    if (!opposition) {
      res.status(400).json({ error: "Oposición no especificada." });
      return;
    }

    const ai = getAI();
    const prompt = `Actúa como un tutor experto de oposiciones en España. Genera un Plan de Estudio Personalizado y Dinámico para la oposición "${opposition}".
Datos del Opositor:
- Perfil: ${JSON.stringify(profile)}
- Progreso actual: ${JSON.stringify(progress)}

Genera una respuesta en formato JSON con la siguiente estructura exacta:
{
  "weeklyHoursRecommended": 30,
  "focusStrategy": "Una explicación breve de la estrategia de enfoque adaptada al opositor.",
  "weeklyTasks": [
    {
      "day": "Lunes",
      "topic": "Nombre del bloque o tema",
      "activity": "Detalle de qué estudiar o repasar",
      "duration": "2h",
      "priority": "Alta"
    }
  ],
  "personalizedAdvice": [
    "Consejo 1 adaptado a su ritmo",
    "Consejo 2 para optimizar memoria"
  ],
  "milestones": [
    {
      "name": "Hito 1",
      "targetDate": "Dentro de 2 semanas",
      "description": "Repaso del bloque 1 y primer simulacro"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un asesor pedagógico de oposiciones españolas altamente cualificado. Proporcionas respuestas estructuradas en estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-plan:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
  }
});

// API endpoint to generate complete opposition metadata and syllabus structure from a BOE title
app.post("/api/gemini/generate-custom-opposition", async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: "Título de la oposición no especificado." });
      return;
    }

    const ai = getAI();
    const prompt = `Actúa como un preparador experto de oposiciones en España.
A partir del siguiente anuncio oficial de empleo público del BOE:
Título: "${title}"
Descripción: "${description || ""}"

Genera una estructura de datos de oposición completa y rigurosa en formato JSON, para que el usuario pueda empezar a estudiar de inmediato.
Debe tener la siguiente estructura exacta:
{
  "id": "slug-unico-basado-en-el-titulo",
  "name": "Nombre oficial formal largo de la oposición",
  "shortName": "Nombre corto descriptivo (ej: Conductor Ayto. Valencia, Médico de Familia GVA, Celador SERMAS, Ingeniero Telecom. Estado)",
  "group": "A1, A2, C1, C2 o E (elige según la categoría del anuncio)",
  "adminType": "Estatal, Autonómica o Local (elige según corresponda)",
  "region": "Comunidad Autónoma o provincia de origen (ej: Comunidad Valenciana, Comunidad de Madrid, Andalucía, etc.)",
  "status": "Abierto",
  "generalRequirements": [
    "Tener nacionalidad española o de un estado miembro de la UE",
    "Poseer la titulación mínima requerida",
    "No haber sido separado del servicio de las administraciones públicas",
    "Poseer la capacidad funcional necesaria para el desempeño de las tareas"
  ],
  "tribunalQualities": [
    "Valora la claridad de exposición técnica y fundamentación legal",
    "Puntúa positivamente la resolución lógica de supuestos prácticos"
  ],
  "card": {
    "vacancies": 12,
    "scale": "Escala de Administración Especial o General",
    "deadline": "20 días hábiles a partir del día siguiente a la publicación",
    "referenceBOE": "BOE-A-2026-NUEVO",
    "officialLink": "https://www.boe.es",
    "place": "Online y Presencial",
    "examType": "Oposición o Concurso-Oposición",
    "minDegree": "Titulación académica requerida (ej: Graduado Escolar, Bachillerato, Grado en Medicina, etc.)",
    "legislativeWarning": "Recuerda repasar de manera complementaria las ordenanzas, reglamentos o decretos específicos que publique el organismo emisor."
  },
  "syllabus": [
    {
      "id": "bloque-comun",
      "title": "Bloque I: Derecho Constitucional y Procedimiento Administrativo",
      "weight": 30,
      "topics": [
        {
          "id": "tema-comun-1",
          "title": "La Constitución Española de 1978: Estructura, principios constitucionales y derechos fundamentales.",
          "articles": ["Constitución Española (Artículos 1 a 29)"],
          "content": "Estudio pormenorizado de los derechos fundamentales y libertades públicas, la Corona y el poder legislativo."
        },
        {
          "id": "tema-comun-2",
          "title": "Ley 39/2015 de Procedimiento Administrativo Común: Fases, términos y plazos procesales.",
          "articles": ["Ley 39/2015 (Artículos 21, 29 a 32, 53 a 85)"],
          "content": "Análisis exhaustivo del procedimiento administrativo común, las notificaciones y los plazos aplicables."
        }
      ]
    },
    {
      "id": "bloque-especifico",
      "title": "Bloque II: Temas de la Especialidad y Competencias del Puesto",
      "weight": 70,
      "topics": [
        {
          "id": "tema-especifico-1",
          "title": "Temas específicos de la profesión convocada (ej: conducción, mecánica básica, seguridad vial si es Conductor; atención primaria, urgencias, farmacología si es Médico; movilización, transporte interno, higiene si es Celador; redes, transmisión, espectro si es Telecomunicaciones).",
          "articles": ["Normativa específica de la materia convocada"],
          "content": "Desarrollo técnico, protocolos y marco de actuación especializado para el ejercicio del puesto."
        },
        {
          "id": "tema-especifico-2",
          "title": "Seguridad y Salud en el Trabajo, Prevención de Riesgos Laborales y Políticas de Igualdad.",
          "articles": ["Ley 31/1995 de Prevención de Riesgos Laborales", "Ley Orgánica 3/2007 para la Igualdad Efectiva"],
          "content": "Protocolos de prevención de riesgos específicos y marco legal de no discriminación en el sector público."
        }
      ]
    }
  ],
  "officialExams": [],
  "practicalCases": [
    {
      "id": "caso-generico-1",
      "title": "Supuesto Práctico de la Especialidad I",
      "year": 2026,
      "situation": "Planteamiento situacional habitual en las funciones del puesto convocado, con dilemas operativos y organizativos de relevancia real para el tribunal.",
      "questions": [
        {
          "question": "Enunciado del dilema principal y procedimiento a seguir ante la situación planteada.",
          "legalBase": "Leyes o decretos específicos que regulan la actuación para esta situación.",
          "solution": "La resolución correcta argumentada paso a paso detallando la fundamentación técnica o legal pertinente."
        }
      ]
    }
  ]
}

IMPORTANTE: El temario específico (temas y títulos), los requisitos y el supuesto práctico deben estar adaptados y personalizados de manera directa a la profesión del título proporcionado. Por ejemplo:
- Si es de Conductor/a, incluye conducción eficiente, mecánica, seguridad vial y leyes de tráfico.
- Si es de Médico, incluye salud de atención primaria, protocolos médicos, urgencias y legislación sanitaria.
- Si es de Celador, incluye movilización de pacientes, higiene hospitalaria, traslados y ética del celador.
- Si es de Telecomunicaciones, incluye redes de datos, telecomunicaciones, espectro electromagnético y ley general de telecomunicaciones.
- Si es de cualquier otro puesto, genera el temario específico y técnico idóneo para ese puesto en España.

Responde ÚNICAMENTE con el objeto JSON estructurado sin envoltorios extra de markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un preparador experto y administrador oficial de temarios para oposiciones en España. Generas temarios rigurosos y personalizados en estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-custom-opposition:", error);
    res.status(500).json({ error: error.message || "Error al crear la oposición con IA." });
  }
});

// API endpoint to generate custom case study (casos prácticos)
app.post("/api/gemini/generate-case-study", async (req: Request, res: Response) => {
  try {
    const { opposition, blocks } = req.body;
    if (!opposition) {
      res.status(400).json({ error: "Oposición no especificada." });
      return;
    }

    const ai = getAI();
    const prompt = `Actúa como el Tribunal de Oposiciones de "${opposition}". Genera un Supuesto Práctico Realista basado en los siguientes bloques/temas: ${blocks ? blocks.join(", ") : "Temario general"}.
El supuesto debe incluir una situación de hecho detallada, 3 preguntas complejas de desarrollo o respuesta múltiple que el tribunal plantearía, y sus respectivas soluciones justificadas legalmente (con mención a leyes como Ley 39/2015, Ley 40/2015, Constitución, etc. según corresponda).

Genera una respuesta en formato JSON con la siguiente estructura exacta:
{
  "title": "Caso Práctico: Título Descriptivo",
  "situation": "Texto detallado planteando la situación jurídica, administrativa o fáctica real.",
  "questions": [
    {
      "questionNumber": 1,
      "text": "Planteamiento de la pregunta o dilema técnico.",
      "idealResponse": "La respuesta ideal estructurada.",
      "legalBase": "Mención expresa de los artículos de ley aplicables."
    }
  ],
  "tipsForTribunal": "Qué valora especialmente el tribunal en este caso (precisión terminológica, etc.)."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un miembro de un tribunal de oposiciones en España. Diseñas supuestos prácticos de alta exigencia legal y técnica. Estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-case-study:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
  }
});

// API endpoint to generate mnemonic patterns
app.post("/api/gemini/generate-mnemonic", async (req: Request, res: Response) => {
  try {
    const { concept, context } = req.body;
    if (!concept) {
      res.status(400).json({ error: "Concepto o artículo no especificado." });
      return;
    }

    const ai = getAI();
    const prompt = `Genera técnicas de mnemotecnia ultra-efectivas para retener el siguiente concepto complejo en oposiciones: "${concept}".
Contexto de la oposición: ${context || "Leyes generales del Estado"}.

Proporciona acrónimos, historias absurdas, palacios de memoria o reglas de asociación visual que faciliten la retención a largo plazo.

Genera una respuesta en formato JSON con la siguiente estructura exacta:
{
  "concept": "Concepto analizado",
  "difficultyWhy": "Por qué es difícil de recordar (fechas, plazos, excepciones...)",
  "mnemonics": [
    {
      "type": "Acrónimo / Asociación visual / Historia",
      "formula": "Fórmula mnemotécnica (ej: SILO, COPO)",
      "explanation": "Explicación de cómo usar la técnica."
    }
  ],
  "mentalAssociationImage": "Descripción detallada de una imagen mental absurda y memorable para fijar el concepto.",
  "retentionTestQuestion": "Una pregunta rápida de autoevaluación para verificar que se ha memorizado."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un experto en memorización de alto rendimiento para opositores (técnicas de supermemoria y mnemotecnia). Estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-mnemonic:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
  }
});

// API endpoint to analyze patterns & trap questions (trampas y patrones)
app.post("/api/gemini/analyze-patterns", async (req: Request, res: Response) => {
  try {
    const { opposition, startYear } = req.body;
    if (!opposition) {
      res.status(400).json({ error: "Oposición no especificada." });
      return;
    }

    const ai = getAI();
    const prompt = `Analiza patrones de preguntas difíciles, confusas o "trampa" en los exámenes de la oposición "${opposition}" desde el año ${startYear || 2020}.
Determina qué tipo de trucos utiliza el tribunal (modificar plazos ligeramente, cambiar palabras como 'podrá' por 'deberá', falsas excepciones, etc.) y aporta 3 ejemplos prácticos con explicaciones detalladas.

Genera una respuesta en formato JSON con la siguiente estructura exacta:
{
  "opposition": "Oposición analizada",
  "typicalTraps": [
    {
      "name": "Tipo de trampa (ej: El cambio del verbo imperativo)",
      "mechanism": "Cómo funciona el truco para engañar al opositor.",
      "howToAvoid": "Estrategia para detectarlo al leer el examen."
    }
  ],
  "mockTrapQuestions": [
    {
      "question": "Pregunta de test formulada exactamente como lo haría el tribunal con la trampa incluida.",
      "options": ["Opción A (incorrecta)", "Opción B (la trampa lógica)", "Opción C (la correcta legalmente)", "Opción D (incorrecta)"],
      "correctIndex": 2,
      "explanation": "Explicación jurídica de por qué cae en la trampa y cómo resolverlo."
    }
  ],
  "keyAdvice": "Consejo maestro para enfrentarse al test del tribunal sin caer en el pánico."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un preparador de oposiciones especializado en detectar los vicios, sesgos y trampas habituales de los tribunales examinadores. Estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in analyze-patterns:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
  }
});

// API endpoint to generate complete custom mock test
app.post("/api/gemini/generate-test", async (req: Request, res: Response) => {
  try {
    const { opposition, blocks, count, difficulty, isSimulacro } = req.body;
    if (!opposition) {
      res.status(400).json({ error: "Oposición no especificada." });
      return;
    }

    const ai = getAI();
    const prompt = `Genera un cuestionario de test de nivel ${difficulty || "Medio"} para la oposición de "${opposition}".
Temas/Bloques seleccionados: ${blocks ? blocks.join(", ") : "Todo el temario"}.
Cantidad de preguntas: ${count || 5}.
¿Es simulacro con tiempo real?: ${isSimulacro ? "Sí" : "No"}.

Genera una respuesta en formato JSON con la siguiente estructura exacta de lista de preguntas:
{
  "questions": [
    {
      "question": "Enunciado preciso de la pregunta con fundamento legal.",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "justification": "Explicación de la opción correcta detallando el artículo de la ley, Real Decreto, Constitución, etc."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un generador oficial de cuestionarios técnicos para oposiciones del estado, comunidades autónomas y locales de España. Estricto formato JSON.",
      },
    });

    const text = response.text || '{"questions": []}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-test:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor." });
  }
});

// API endpoint to generate complete detailed legal topic / lesson
app.post("/api/gemini/generate-full-topic", async (req: Request, res: Response) => {
  try {
    const { opposition, topicTitle, articles } = req.body;
    if (!topicTitle) {
      res.status(400).json({ error: "Título del tema no especificado." });
      return;
    }

    const ai = getAI();
    const prompt = `Actúa como un catedrático de Derecho y preparador de alto nivel para la oposición de "${opposition || "Administración Pública"}".
Genera una lección de estudio EXHAUSTIVA y COMPLETA para el tema: "${topicTitle}".
Leyes y artículos de referencia obligatoria: ${articles ? articles.join(", ") : "Leyes conexas"}.

El tema debe estar perfectamente estructurado para estudiar directamente, conteniendo:
1. Una introducción general del tema con enfoque en oposiciones.
2. Desarrollo riguroso, extenso e individual de cada uno de los artículos jurídicos mencionados (mencionando su texto literal, interpretación técnico-jurídica, plazos exactos y excepciones críticas).
3. Resumen de esquemas y plazos procesales/administrativos claves en formato de lista para facilitar la memorización.
4. Dos preguntas típicas de examen comentadas que el tribunal suele preguntar sobre este tema exacto.

Genera la respuesta como un objeto JSON con la estructura exacta descrita a continuación (usa formato Markdown para las secciones detalladas):
{
  "title": "${topicTitle}",
  "introduction": "Introducción amplia...",
  "detailedContent": "# Desarrollo Jurídico Completo \\n\\nAquí va el texto completo y detallado del tema, con explicaciones muy extensas y el contenido de los artículos...\\n\\n## Análisis de los Artículos Clave\\n\\nDesarrolla detalladamente los artículos...",
  "plazosYEsquemas": [
    "Plazo 1: Explicación del plazo...",
    "Plazo 2: Explicación del plazo..."
  ],
  "preguntasComentadas": [
    {
      "question": "Pregunta de examen 1...",
      "justification": "Comentario de la respuesta con fundamentación legal extensa..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un preparador de élite y jurista experto que redacta temas de oposición completos, rigurosos y muy detallados. El formato del contenido detallado es Markdown limpio. Estricto formato JSON.",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-full-topic:", error);
    res.status(500).json({ error: error.message || "Error al generar el tema completo." });
  }
});

// API endpoint to generate complete official legal article texts and expert commentaries
app.post("/api/gemini/generate-article-text", async (req: Request, res: Response) => {
  try {
    const { articleReference, opposition } = req.body;
    if (!articleReference) {
      res.status(400).json({ error: "Referencia de artículo no especificada." });
      return;
    }

    const ai = getAI();
    const prompt = `Actúa como un preparador experto en oposiciones en España y jurista de élite.
Genera el texto literal oficial y un comentario técnico profundo para el articulado de referencia: "${articleReference}".
Oposición de destino: "${opposition || "Administración Pública"}".

Deberás estructurar la respuesta y para cada artículo de ley cubierto por "${articleReference}" proporcionar su texto literal real (Constitución Española, Ley 39/2015, LOPJ, etc.) y un comentario específico sobre lo que suele preguntar el tribunal (plazos exactos, trampas terminológicas comunes, excepciones).

Genera la respuesta como un objeto JSON con la estructura exacta descrita a continuación:
{
  "articles": [
    {
      "id": "Art. X [Abreviatura Ley]",
      "title": "Artículo X: Título del Artículo...",
      "text": "Texto íntegro literal de la ley española vigente...",
      "commentary": "Comentario experto detallado indicando trucos del tribunal, plazos y mnemotecnias..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres un jurista experto y preparador de oposiciones que redacta los textos oficiales de las leyes españolas con precisión quirúrgica y añade comentarios formativos de alta calidad. Estricto formato JSON.",
      },
    });

    const text = response.text || '{"articles": []}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in generate-article-text:", error);
    res.status(500).json({ error: error.message || "Error al generar el texto de los artículos." });
  }
});

// API endpoint to search and generate an external opposition in Spain using Gemini & Google Search Grounding
app.post("/api/gemini/search-external", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "No se ha especificado ninguna búsqueda." });
      return;
    }

    const ai = getAI();
    const prompt = `Localiza o genera información real y actualizada sobre la oposición en España correspondiente a la consulta: "${query}".
Utiliza Google Search para fundamentar las plazas, el boletín (BOE/DOGV/BOCM/etc.), los requisitos oficiales, plazos y el temario oficial del cuerpo.

Devuelve la información estrictamente en formato JSON que represente una oposición completa según la interfaz descrita abajo. No incluyas ningún texto de explicación fuera de este objeto JSON. El JSON debe cumplir con la siguiente estructura:

{
  "id": "Un identificador único en minúsculas y con guiones basado en el nombre, por ejemplo: 'bombero-madrid' o 'auxiliar-junta-andalucia'",
  "name": "Nombre oficial completo de la oposición, ej. 'Bombero del Ayuntamiento de Madrid'",
  "shortName": "Nombre corto común o siglas, ej. 'Bombero Madrid' o 'Auxiliar JJA'",
  "group": "Grupo funcionarial correspondiente: 'A1', 'A2', 'C1' o 'C2'",
  "adminType": "Una de las siguientes: 'Estatal', 'Autonómica', 'Local' o 'Universitaria'",
  "region": "Comunidad Autónoma o provincia/localidad de España (ej. 'Madrid', 'Andalucía', 'Comunidad Valenciana', 'Nacional' si es estatal)",
  "status": "Estado de la convocatoria: 'Abierto', 'Cerrado' o 'Próxima Convocatoria'",
  "generalRequirements": [
    "Requisito de nacionalidad...",
    "Requisito de edad...",
    "Requisito de titulación académica..."
  ],
  "tribunalQualities": [
    "Valoración de la literalidad de la ley",
    "Exigencia de precisión en los plazos"
  ],
  "card": {
    "vacancies": 45,
    "scale": "Cuerpo o Escala de la oposición",
    "deadline": "Plazo de presentación o 'Próximamente' o 'Cerrado'",
    "referenceBOE": "Referencia del boletín oficial (BOE/DOGV/BOCM/etc.) real",
    "officialLink": "Un enlace oficial real o el del portal de empleo correspondiente",
    "place": "Provincia o localidad de celebración",
    "examType": "Breve descripción del examen (ej. 'Oposición: Test + Supuesto práctico')",
    "minDegree": "Titulación mínima requerida",
    "legislativeWarning": "Aviso legislativo breve para el opositor sobre la normativa aplicable"
  },
  "syllabus": [
    {
      "id": "bloque-1",
      "title": "Bloque I: Derecho Constitucional y Administrativo",
      "weight": 40,
      "topics": [
        {
          "id": "tema-1",
          "title": "La Constitución Española de 1978: Estructura y principios generales",
          "articles": ["Constitución Española (CE) Art. 1 a 9"],
          "content": "Resumen conceptual amplio del tema, incluyendo principios de soberanía, estado social y democrático de derecho, jerarquía normativa, etc."
        },
        {
          "id": "tema-2",
          "title": "El Procedimiento Administrativo Común de las Administraciones Públicas",
          "articles": ["Ley 39/2015 Art. 30, 31, 32"],
          "content": "Resumen amplio del procedimiento común, plazos administrativos, días hábiles e inhábiles, de conformidad con la normativa de régimen jurídico común."
        }
      ]
    },
    {
      "id": "bloque-2",
      "title": "Bloque II: Temario Específico del Cuerpo",
      "weight": 60,
      "topics": [
        {
          "id": "tema-3",
          "title": "Tema específico y técnico de la oposición (desarrollar de forma muy profesional)",
          "articles": ["Normativa específica aplicable"],
          "content": "Resumen técnico detallado y adaptado a lo que se pregunta en esta oposición en particular."
        }
      ]
    }
  ],
  "officialExams": [],
  "practicalCases": []
}

Asegúrate de que la respuesta sea un JSON perfectamente válido y que el syllabus tenga al menos 2 bloques con temas estructurados que el usuario pueda navegar y estudiar directamente en la app.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        systemInstruction: "Eres un buscador y preparador de oposiciones oficiales en España de última generación. Empleas herramientas de búsqueda web para recopilar datos auténticos sobre plazas, requisitos, BOEs y temarios, y los formateas exactamente como un objeto JSON según el esquema de OppositionData.",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error searching external opposition:", error);
    res.status(500).json({ error: error.message || "No se pudo buscar la oposición externa." });
  }
});

// Start backend and handle frontend mounting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route for production
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();

export default app;
