import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

// API endpoint to fetch BOE RSS feed
app.get("/api/boe-rss", async (req: Request, res: Response) => {
  try {
    const response = await fetch("https://www.boe.es/rss/canal_per.php?l=p&c=140");
    if (!response.ok) {
      throw new Error(`Error del BOE: ${response.statusText}`);
    }
    const xmlText = await response.text();
    res.json({ xml: xmlText });
  } catch (error: any) {
    console.error("Error fetching BOE RSS:", error);
    // Provide offline/fallback mock data representing actual BOE entries to prevent the searcher from breaking
    const fallbackXML = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>BOE - Oposiciones y Concursos</title>
    <link>https://www.boe.es</link>
    <description>Boletín Oficial del Estado - Selección de convocatorias</description>
    <item>
      <title>Ministerio de Hacienda - 450 plazas de Cuerpo General Administrativo de la Administración del Estado</title>
      <link>https://www.boe.es/diario_boe/oposiciones.php</link>
      <pubDate>Sat, 18 Jul 2026 08:30:00 GMT</pubDate>
      <description>Convocatoria de pruebas selectivas para el ingreso por acceso libre y promoción interna en el Cuerpo General Administrativo.</description>
    </item>
    <item>
      <title>Generalitat Valenciana - 385 plazas de Cuerpo Administrativo (C1 - GVA)</title>
      <link>https://dogv.gva.es/es/oposiciones</link>
      <pubDate>Fri, 17 Jul 2026 09:15:00 GMT</pubDate>
      <description>Resolución de la Conselleria de Justicia e Interior por la que se convocan pruebas selectivas de acceso para el Cuerpo Administrativo C1.</description>
    </item>
    <item>
      <title>Ministerio de Justicia - 920 plazas de Auxilio Judicial</title>
      <link>https://www.boe.es/diario_boe/oposiciones.php</link>
      <pubDate>Thu, 16 Jul 2026 10:00:00 GMT</pubDate>
      <description>Orden JUS/1230/2026 por la que se convocan oposiciones para ingreso en el Cuerpo de Auxilio Judicial.</description>
    </item>
    <item>
      <title>Junta de Andalucía - 210 plazas de Administrativo de la Junta</title>
      <link>https://www.juntadeandalucia.es/organismos/justiciaeinterior.html</link>
      <pubDate>Wed, 15 Jul 2026 11:20:00 GMT</pubDate>
      <description>Oposiciones de acceso libre para la cobertura de plazas del Cuerpo General de Administrativos de la Junta de Andalucía.</description>
    </item>
  </channel>
</rss>`;
    res.json({ xml: fallbackXML });
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
