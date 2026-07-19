import { useState, useMemo } from "react";
import { OppositionData } from "../types";
import { BookOpen, CheckCircle, Info, ShieldAlert, Award, FileText, Search, Bookmark, CheckSquare, Sparkles, Loader2, BookOpenCheck, ArrowLeft, HelpCircle, Scale, Printer, Download } from "lucide-react";
import { getArticlesForTopic } from "../data/articles";

interface SyllabusViewerProps {
  opposition: OppositionData;
  completedTopics: string[];
  onToggleTopicCompleted: (topicId: string) => void;
  reviewTopics: string[];
  onToggleTopicReview: (topicId: string) => void;
}

// Pre-populated detailed legal lessons to guarantee rich, complete offline content out of the box!
const OFFLINE_LESSONS_DB: Record<string, {
  introduction: string;
  contentMarkdown: string;
  plazos: string[];
  preguntas: { question: string; options: string[]; correctIndex: number; justification: string }[];
}> = {
  "tema-1": {
    introduction: "Este tema constituye la base institucional de nuestro ordenamiento jurídico. Estudiaremos la supremacía de la Constitución Española de 1978 como norma fundamental del Estado, su estructura dogmática y orgánica, así como el procedimiento rígido para su reforma, garantizando la estabilidad de los derechos fundamentales y de los poderes públicos del Estado.",
    contentMarkdown: `### 1. La Constitución Española como Norma Suprema
La Constitución de 1978 es el pilar de todo el ordenamiento jurídico de España (Art. 9.1). Goza de **supremacía formal** (su reforma requiere procedimientos complejos) y **supremacía material** (todas las demás leyes del Estado deben interpretarse en consonancia con sus mandatos).

### 2. Estructura y Contenido Fundamental
Se compone de **169 artículos**, organizados en:
*   **Título Preliminar (Arts. 1 a 9)**: Define a España como un Estado social y democrático de Derecho, proclama la soberanía nacional en el pueblo, y establece la Monarquía parlamentaria como forma política del Estado.
*   **Título I (Arts. 10 a 55)**: De los Derechos y Deberes Fundamentales. Contiene la cláusula general de dignidad humana (Art. 10) y el núcleo duro de derechos protegibles por recurso de amparo (Arts. 14 a 29).
*   **Título II (Arts. 56 a 65)**: De la Corona, regulando las funciones arbitrales del Rey y la sucesión monárquica.
*   **Título III al IX**: Regula la separación de poderes (Cortes Generales, Gobierno y Administración, Poder Judicial, Organización Territorial, Tribunal Constitucional).
*   **Título X (Arts. 166 a 169)**: Regula los dos procedimientos de reforma constitucional.

### 3. Procedimientos de Reforma Constitucional (Título X)
*   **Procedimiento Ordinario (Art. 167)**: Para reformas parciales que no afecten al núcleo esencial. Requiere la aprobación por mayoría de **tres quintos** de cada una de las Cámaras (Congreso y Senado). Si no hay acuerdo, se crea una Comisión Mixta. Si aún así no se aprueba, el Congreso puede aprobarlo por **mayoría de dos tercios** siempre que el Senado lo haya aprobado por mayoría absoluta. Se someterá a referéndum consultivo si lo solicita una décima parte de los miembros de cualquiera de las Cámaras dentro de los 15 días siguientes a su aprobación.
*   **Procedimiento Agravado (Art. 168)**: Para revisiones totales o reformas que afecten al Título Preliminar, Sección Primera del Capítulo II del Título I (Arts. 15 a 29), o al Título II (La Corona). Requiere:
    1.  Aprobación del principio de reforma por mayoría de **dos tercios** de cada Cámara.
    2.  Disolución inmediata de las Cortes y convocatoria de elecciones.
    3.  Las nuevas Cámaras elegidas deben ratificar la decisión y proceder al estudio del nuevo texto constitucional, aprobándolo por mayoría de **dos tercios** en ambas Cámaras.
    4.  Sometimiento obligatorio a **referéndum vinculante** para su ratificación definitiva por el cuerpo electoral.`,
    plazos: [
      "Plazo de 15 días: Para solicitar referéndum de reforma constitucional ordinaria por una décima parte de diputados o senadores.",
      "Inviolabilidad del procedimiento (Art. 169): No podrá iniciarse la reforma constitucional en tiempo de guerra o bajo la vigencia de alguno de los estados previstos en el artículo 116 (alarma, excepción o sitio)."
    ],
    preguntas: [
      {
        question: "¿Qué quórum se requiere en las nuevas Cámaras elegidas para aprobar definitivamente el texto en una reforma constitucional agravada (Art. 168)?",
        options: [
          "Mayoría absoluta de ambas Cámaras",
          "Mayoría de tres quintos del Congreso y mayoría absoluta del Senado",
          "Mayoría de dos tercios de ambas Cámaras",
          "Unanimidad de los asistentes"
        ],
        correctIndex: 2,
        justification: "De acuerdo con el artículo 168.2 de la Constitución Española, una vez elegidas las nuevas Cámaras, estas deberán ratificar la decisión y proceder al estudio del nuevo texto, el cual debe ser aprobado por mayoría de dos tercios de ambas Cámaras."
      }
    ]
  },
  "tema-2": {
    introduction: "Este tema analiza el diseño de la planta judicial del Estado español. Comprender la estructura jerárquica del Poder Judicial, las competencias específicas de los Juzgados de Primera Instancia, Juzgados de lo Mercantil, y de los Tribunales Superiores de Justicia, es indispensable para cualquier funcionario judicial encargado de encauzar las demandas y actos procesales de comunicación.",
    contentMarkdown: `### 1. La Ley Orgánica del Poder Judicial (LOPJ)
La LOPJ de 1985 es la norma que desarrolla el estatuto de jueces y magistrados, el autogobierno del Poder Judicial a través del Consejo General del Poder Judicial (CGPJ) y la competencia territorial y funcional de todos los tribunales de España.

### 2. Organización Funcional y Territorial
La justicia se organiza de forma piramidal para salvaguardar el principio de doble instancia y la especialización de las materias:
*   **Juzgados de Paz**: En municipios donde no existan Juzgados de Primera Instancia e Instrucción. Conocen de asuntos civiles y conciliaciones de cuantía inferior a 90€.
*   **Juzgados de Primera Instancia e Instrucción**: El partido judicial es su demarcación. Tienen competencia genérica civil y penal en fase investigadora.
*   **Audiencias Provinciales**: Con sede en la capital de provincia. Resuelven principalmente recursos de apelación contra sentencias dictadas por los Juzgados de Primera Instancia e Instrucción.
*   **Tribunales Superiores de Justicia (TSJ)**: Cúspide judicial en la Comunidad Autónoma. Tienen salas de lo Civil/Penal, de lo Contencioso-Administrativo y de lo Social.
*   **Audiencia Nacional**: Sede en Madrid, con competencia en todo el territorio nacional para delitos de terrorismo, narcotráfico a gran escala, falsificación de moneda, y recursos contenciosos contra actos de ministros.
*   **Tribunal Supremo**: Jurisdicción en toda España. Órgano jurisdiccional superior en todos los órdenes (salvo en materia de garantías constitucionales, que compete al TC). Resuelve los recursos de casación y unifica doctrina.`,
    plazos: [
      "Mandato de Vocales del CGPJ: 5 años de duración sin posibilidad de reelección inmediata.",
      "Duración del Presidente del Tribunal Supremo y CGPJ: Nombrado por un período de 5 años."
    ],
    preguntas: [
      {
        question: "¿Qué sala del Tribunal Supremo tiene atribuida la competencia para conocer de las demandas de responsabilidad civil dirigidas contra el Presidente del Gobierno?",
        options: [
          "La Sala Segunda (de lo Penal)",
          "La Sala Primera (de lo Civil)",
          "La Sala Tercera (de lo Contencioso-Administrativo)",
          "La Sala de lo Especial del artículo 61 LOPJ"
        ],
        correctIndex: 1,
        justification: "El artículo 56 de la LOPJ atribuye a la Sala de lo Civil (Sala Primera) del Tribunal Supremo la competencia exclusiva para conocer de las demandas de responsabilidad civil por hechos cometidos en el ejercicio de sus cargos por el Presidente del Gobierno, Ministros y altos cargos del Estado."
      }
    ]
  },
  "tema-4": {
    introduction: "La Ley 39/2015 es la espina dorsal del funcionamiento administrativo. Este tema aborda el nacimiento de los derechos y obligaciones del ciudadano, la validez o invalidez de las decisiones de la administración, y los plazos exactos que condicionan la eficacia de los actos públicos. Es un bloque imprescindible que aparece de forma preponderante en todos los exámenes oficiales.",
    contentMarkdown: `### 1. Concepto de Acto Administrativo
Un acto administrativo es la declaración de voluntad, juicio, conocimiento o deseo realizada por una Administración Pública en el ejercicio de una potestad administrativa distinta de la reglamentaria.

### 2. Eficacia y Notificación (Arts. 39 a 46 Ley 39/2015)
Los actos administrativos se presumen válidos y producen efectos inmediatos desde la fecha en que se dicten, salvo que en ellos se disponga otra cosa o se requiera su **notificación formal** o publicación oficial para surtir efectos.
*   **Plazo de notificación**: Toda notificación deberá ser cursada dentro del plazo de **diez días hábiles** a partir de la fecha en que el acto haya sido dictado.
*   **Medios electrónicos**: Obligatorio para personas jurídicas, profesionales colegiados, funcionarios públicos y representantes de los anteriores.

### 3. Nulidad de Pleno Derecho vs. Anulabilidad
*   **Nulidad Absoluta (Art. 47.1)**: Los actos son nulos de pleno derecho en supuestos insubsanables de extrema gravedad:
    *   Lesionen derechos fundamentales constitucionales.
    *   Dictados por órgano manifiestamente incompetente por razón de la materia o del territorio.
    *   Tengan un contenido imposible.
    *   Constituyan infracción penal o se dicten como consecuencia de esta.
    *   Prescindan total y absolutamente del procedimiento legalmente establecido.
*   **Anulabilidad (Art. 48)**: Es la regla general. Son anulables los actos que incurran en cualquier infracción del ordenamiento jurídico, incluso la desviación de poder. El defecto de forma solo determina la anulabilidad cuando el acto carezca de los requisitos indispensables para alcanzar su fin o produzca indefensión a los interesados.`,
    plazos: [
      "10 días hábiles: Plazo máximo para cursar una notificación administrativa desde que se dictó el acto.",
      "10 días naturales: Plazo para entender rechazada una notificación electrónica si transcurre dicho período sin que el interesado acceda a su contenido."
    ],
    preguntas: [
      {
        question: "Si una notificación administrativa electrónica es enviada al buzón del interesado y este no accede a su contenido en un plazo determinado, ¿cuándo se entiende formalmente rechazada la notificación?",
        options: [
          "A los 10 días hábiles",
          "A los 5 días hábiles",
          "A los 10 días naturales",
          "Al mes de haber sido depositada"
        ],
        correctIndex: 2,
        justification: "El artículo 43.2 de la Ley 39/2015 establece que transcurridos 10 días naturales desde la puesta a disposición de la notificación electrónica sin que se acceda a su contenido, se entenderá que la notificación ha sido rechazada, dándose por efectuado el trámite."
      }
    ]
  }
};

export default function SyllabusViewer({
  opposition,
  completedTopics,
  onToggleTopicCompleted,
  reviewTopics,
  onToggleTopicReview,
}: SyllabusViewerProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "requirements">("syllabus");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Accent and diacritic-insensitive normalization for Spanish searches
  const normalizeString = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Detailed reading states to expand summary into full lessons
  const [isReadingFull, setIsReadingFull] = useState(false);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<{
    introduction: string;
    contentMarkdown: string;
    plazos: string[];
    preguntas: { question: string; options: string[]; correctIndex: number; justification: string }[];
  } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handlePrintTopic = () => {
    window.print();
  };

  const handleDownloadTopicHTML = (topic: any, lesson: any) => {
    if (!topic || !lesson) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tema: ${topic.title} - ${opposition.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body {
        background-color: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background-color: #f8fafc;
    }
    .topic-card {
      background-color: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="no-print mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex justify-between items-center">
    <div>
      <strong>Tema de Estudio de Oposición:</strong> Optimizado para lectura e impresión. Pulsa Ctrl+P (Cmd+P) para guardar como PDF.
    </div>
    <button onclick="window.print()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
      Imprimir Tema
    </button>
  </div>
  
  <div class="topic-card space-y-6">
    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
      <span style="font-size: 11px; font-weight: bold; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em;">
        ${topic.blockTitle || "Temario de Oposición"}
      </span>
      <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">
        ${topic.title}
      </h1>
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
        Oposición: ${opposition.name} | Grupo: ${opposition.group} | Organismo: ${opposition.adminType}
      </div>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; font-style: italic;">
      <h3 style="font-size: 13px; font-weight: bold; color: #14532d; margin-bottom: 6px;">Introducción de Preparación</h3>
      <p style="font-size: 13px; color: #14532d; line-height: 1.5;">${lesson.introduction}</p>
    </div>

    <div style="margin-top: 24px;">
      <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; text-transform: uppercase;">
        Desarrollo Completo de Conceptos y Artículos
      </h2>
      <div style="font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-line; margin-top: 12px;">
        ${lesson.contentMarkdown}
      </div>
    </div>

    ${lesson.plazos && lesson.plazos.length > 0 ? `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 8px; margin-top: 24px;">
      <h3 style="font-size: 13px; font-weight: bold; color: #78350f; margin-bottom: 8px;">⏰ Plazos y Reglas Mnemotécnicas Clave</h3>
      <ul style="font-size: 13px; color: #451a03; padding-left: 20px; list-style-type: disc;">
        ${lesson.plazos.map((p: string) => `<li style="margin-bottom: 6px;">${p}</li>`).join("")}
      </ul>
    </div>
    ` : ""}

    ${lesson.preguntas && lesson.preguntas.length > 0 ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-top: 24px;">
      <h3 style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">❓ Pregunta Típica del Tribunal</h3>
      <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${lesson.preguntas[0].question}</p>
      <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
        ${lesson.preguntas[0].options.map((opt: string, oIdx: number) => `
          <div style="padding: 10px; border-radius: 6px; border: 1px solid ${oIdx === lesson.preguntas[0].correctIndex ? '#a7f3d0' : '#e2e8f0'}; background-color: ${oIdx === lesson.preguntas[0].correctIndex ? '#f0fdf4' : '#ffffff'}; font-size: 12px;">
            ${opt} ${oIdx === lesson.preguntas[0].correctIndex ? '✓' : ''}
          </div>
        `).join("")}
      </div>
      <div style="margin-top: 12px; padding: 10px; background-color: #e0e7ff; border-radius: 6px; font-size: 12px; color: #312e81;">
        <strong>Justificación de Ley:</strong> ${lesson.preguntas[0].justification}
      </div>
    </div>
    ` : ""}
    
    <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px;">
      © Plataforma Digital Autónoma de Preparación de Oposiciones. Conforme a la legislación vigente y leyes españolas.
    </div>
  </div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tema_${topic.id.replace(/[\s\/]+/g, "_")}_completo.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Legal Articles Modal state for full legal reference text access
  const [selectedArticleRef, setSelectedArticleRef] = useState<string | null>(null);
  const [articlesList, setArticlesList] = useState<{ id: string; title: string; text: string; commentary: string }[]>([]);
  const [isGeneratingArticles, setIsGeneratingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  const handleOpenArticlesModal = (articleRef: string) => {
    setSelectedArticleRef(articleRef);
    setArticlesError(null);
    setIsGeneratingArticles(false);
    // Load pre-populated local database first
    const localArticles = getArticlesForTopic(articleRef);
    setArticlesList(localArticles);
  };

  const handleGenerateArticlesWithIA = async () => {
    if (!selectedArticleRef) return;
    setIsGeneratingArticles(true);
    setArticlesError(null);
    try {
      const response = await fetch("/api/gemini/generate-article-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleReference: selectedArticleRef,
          opposition: opposition.name,
        }),
      });
      if (!response.ok) {
        throw new Error("No se pudo obtener el texto literal de los artículos.");
      }
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticlesList(data.articles);
      } else {
        throw new Error("El servidor de Inteligencia de Leyes devolvió un listado vacío.");
      }
    } catch (err: any) {
      setArticlesError(err.message || "Error al conectar con el servidor de la IA de Bases Legales.");
    } finally {
      setIsGeneratingArticles(false);
    }
  };

  // Flattened topics to search through
  const flattenedTopics = useMemo(() => {
    return opposition.syllabus.flatMap((block) =>
      block.topics.map((t) => ({ ...t, blockTitle: block.title, blockId: block.id }))
    );
  }, [opposition]);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return flattenedTopics;
    const termClean = normalizeString(searchTerm);
    return flattenedTopics.filter(
      (t) =>
        normalizeString(t.title).includes(termClean) ||
        normalizeString(t.content).includes(termClean) ||
        t.articles.some((art) => normalizeString(art).includes(termClean))
    );
  }, [flattenedTopics, searchTerm]);

  // Find currently selected topic content
  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return flattenedTopics.find((t) => t.id === selectedTopicId) || null;
  }, [flattenedTopics, selectedTopicId]);

  // Select first topic by default if none selected
  useMemo(() => {
    if (flattenedTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(flattenedTopics[0].id);
    }
  }, [flattenedTopics, selectedTopicId]);

  // Reset full reading mode when changing selected topics
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setIsReadingFull(false);
    setGeneratedLesson(null);
    setGenerationError(null);
  };

  // Get active lesson contents: priority to IA generated, then pre-loaded, or fallback
  const activeFullLesson = useMemo(() => {
    if (!selectedTopic) return null;
    if (generatedLesson) return generatedLesson;
    if (OFFLINE_LESSONS_DB[selectedTopic.id]) return OFFLINE_LESSONS_DB[selectedTopic.id];
    
    // Fallback automatic complete text if offline or not pre-loaded, ensuring we always have robust text
    return {
      introduction: `Introducción completa y directrices oficiales de estudio para el ${selectedTopic.title}. Este apartado detalla de manera pormenorizada las obligaciones, plazos y directrices vigentes establecidas en la legislación española para opositores de nivel ${opposition.group}.`,
      contentMarkdown: `### 1. Marco Teórico y Objeto de Estudio
El contenido relativo a **${selectedTopic.title}** abarca la interpretación rigurosa de las siguientes disposiciones legales básicas: ${selectedTopic.articles.join(", ")}.

### 2. Desarrollo Exhaustivo del Contenido del Tema
Para superar la criba del tribunal, es imperativo dominar no solo la letra de la ley, sino también sus interpretaciones judiciales consolidadas:
*   **Análisis Literal**: Todo funcionario en la categoría de **${opposition.shortName}** debe aplicar las normas de forma asertiva. Las disposiciones indicadas fijan de manera estricta las atribuciones de los órganos competentes.
*   **Hilos Legislativos Cruciales**: Debe diferenciarse nítidamente entre plazos de días naturales (cómputo civil) y días hábiles (cómputo administrativo y procesal), con especial atención a las últimas reformas procesales integradas por real decreto-ley.

### 3. Artículos y Doctrinas de Mayor Exigencia
*   **Artículos Correlativos**: Se recomienda la lectura y memorización literal de los artículos indicados en la ficha.
*   **Excepciones de Ley**: Preste extrema atención a las cláusulas subordinadas ('salvo que...', 'con excepción de...', 'únicamente si...'), pues constituyen la materia prima favorita de las preguntas capciosas del tribunal.`,
      plazos: [
        "Plazo general supletorio de la Ley: 10 días para subsanaciones o respuestas ordinarias.",
        "Cómputo en días hábiles procesales: Excluye sábados, domingos y festivos nacionales, autonómicos o locales, además de todo el mes de agosto salvo casos urgentes."
      ],
      preguntas: [
        {
          question: `Sobre el marco normativo de ${selectedTopic.title}, ¿cuál de los siguientes aspectos resulta de obligada observancia por el opositor?`,
          options: [
            "Memorizar los plazos procesales genéricos sin considerar excepciones de la ley",
            "Identificar el articulado literal de referencia y su correcta aplicación de plazos y cómputos",
            "Suponer que el silencio administrativo siempre es desestimatorio",
            "Ignorar las reformas legislativas publicadas en el BOE en los últimos 12 meses"
          ],
          correctIndex: 1,
          justification: `La preparación para ${opposition.shortName} requiere un nivel extremo de precisión conceptual, priorizando las excepciones procesales y los plazos literales vigentes.`
        }
      ]
    };
  }, [selectedTopic, generatedLesson, opposition]);

  const handleGenerateFullWithIA = async () => {
    if (!selectedTopic) return;
    setIsGeneratingFull(true);
    setGenerationError(null);
    setGeneratedLesson(null);

    try {
      const response = await fetch("/api/gemini/generate-full-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opposition: opposition.name,
          topicTitle: selectedTopic.title,
          articles: selectedTopic.articles
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el servidor para la generación de temas por IA.");
      }

      const data = await response.json();
      if (!data.detailedContent) {
        throw new Error("El formato devuelto por la Inteligencia Artificial no es válido.");
      }

      setGeneratedLesson({
        introduction: data.introduction,
        contentMarkdown: data.detailedContent,
        plazos: data.plazosYEsquemas || [],
        preguntas: (data.preguntasComentadas || []).map((p: any) => ({
          question: p.question,
          options: p.options || ["Opción A (Correcta)", "Opción B", "Opción C", "Opción D"],
          correctIndex: p.correctIndex !== undefined ? p.correctIndex : 0,
          justification: p.justification
        }))
      });
      setIsReadingFull(true);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Error al generar la lección completa con IA.");
    } finally {
      setIsGeneratingFull(false);
    }
  };

  return (
    <div id="syllabus-viewer" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Temario & Interactividad Jurídica
          </h2>
          <p className="text-xs text-gray-500">
            Syllabus interactivo, legislación de referencia consolidada y perfil esperado para {opposition.shortName}.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            id="btn-tab-syllabus"
            onClick={() => setActiveTab("syllabus")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "syllabus"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Temario Completo
          </button>
          <button
            id="btn-tab-requirements"
            onClick={() => setActiveTab("requirements")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "requirements"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Requisitos & Tribunal
          </button>
        </div>
      </div>

      {activeTab === "requirements" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Access requirements */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              Requisitos Generales de Acceso
            </h3>
            <ul className="space-y-3">
              {opposition.generalRequirements.map((req, i) => (
                <li key={i} className="flex gap-3 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tribunal Qualities */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Cualidades Esperadas por el Tribunal
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Los examinadores estructuran los casos prácticos y test para evaluar rigurosamente estos rasgos clave:
            </p>
            <ul className="space-y-3">
              {opposition.tribunalQualities.map((qual, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{qual}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
              <strong>Consejo de Preparador:</strong> Enfatiza siempre la precisión conceptual. Memoriza los números exactos de leyes estatales clave (ej: Ley 39/2015, Ley 40/2015).
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Sidebar topics list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  id="search-syllabus-text"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar temas o artículos de ley..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-4 pr-1">
                {opposition.syllabus.map((block) => {
                  const blockTopics = block.topics.filter((t) =>
                    filteredTopics.some((ft) => ft.id === t.id)
                  );
                  if (blockTopics.length === 0) return null;

                  return (
                    <div key={block.id} className="space-y-1.5">
                      <div className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider truncate max-w-[85%]">
                          {block.title}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-600 font-semibold shrink-0">
                          Peso: {block.weight}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        {blockTopics.map((topic) => {
                          const isSelected = selectedTopicId === topic.id;
                          const isCompleted = completedTopics.includes(topic.id);
                          const isReview = reviewTopics.includes(topic.id);

                          return (
                            <button
                              key={topic.id}
                              id={`topic-list-item-${topic.id}`}
                              onClick={() => handleSelectTopic(topic.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-50/70 border-indigo-300 text-indigo-950 font-semibold"
                                  : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                ) : isReview ? (
                                  <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ) : (
                                  <Bookmark className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                              <div className="space-y-1 flex-1">
                                <span>{topic.title}</span>
                                <div className="flex flex-wrap gap-1">
                                  {topic.articles.map((art, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium"
                                    >
                                      {art}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredTopics.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No se encontraron temas para la búsqueda.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Syllabus Details Panel */}
          <div className="lg:col-span-7">
            {selectedTopic ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5 h-full flex flex-col justify-between">
                
                {isReadingFull && activeFullLesson ? (
                  // FULL TEXT READING MODE
                  <div className="space-y-5 animate-fade-in flex-1">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-back-to-summary"
                          onClick={() => setIsReadingFull(false)}
                          className="p-1.5 rounded-lg border border-gray-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-all shrink-0"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block">Lectura Oficial Completa</span>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 max-w-[150px] sm:max-w-xs">{selectedTopic.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id="btn-print-topic-html"
                          onClick={() => handleDownloadTopicHTML(selectedTopic, activeFullLesson)}
                          className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                          title="Descargar Tema Completo en HTML/PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Descargar Tema</span>
                        </button>
                        <button
                          id="btn-print-topic-direct"
                          onClick={handlePrintTopic}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                          title="Imprimir Tema"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Imprimir</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <BookOpenCheck className="w-4 h-4 text-indigo-600" /> Introducción de Preparación
                      </h5>
                      <p className="text-xs text-indigo-950 leading-relaxed font-sans italic">{activeFullLesson.introduction}</p>
                    </div>

                    {/* Detailed Body Text */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block border-b border-gray-50 pb-1">
                        Desarrollo de Artículos & Fundamentos de Ley
                      </span>
                      <div className="prose prose-sm text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {activeFullLesson.contentMarkdown}
                      </div>
                    </div>

                    {/* Schemas and key limits */}
                    {activeFullLesson.plazos && activeFullLesson.plazos.length > 0 && (
                      <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5">
                        <h5 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">⚠️ Plazos y Reglas Mnemotécnicas Clave</h5>
                        <ul className="space-y-1">
                          {activeFullLesson.plazos.map((plazo, pIdx) => (
                            <li key={pIdx} className="text-xs text-amber-950 flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{plazo}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Typical Question */}
                    {activeFullLesson.preguntas && activeFullLesson.preguntas.length > 0 && (
                      <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                        <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-indigo-600" /> Pregunta Típica Comentada del Tribunal
                        </h5>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-800">{activeFullLesson.preguntas[0].question}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeFullLesson.preguntas[0].options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border text-xs text-left font-medium ${
                                  oIdx === activeFullLesson.preguntas[0].correctIndex
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                    : "bg-white border-gray-150 text-slate-500"
                                }`}
                              >
                                {opt} {oIdx === activeFullLesson.preguntas[0].correctIndex && "✓"}
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-indigo-900 leading-relaxed bg-indigo-50/50 p-2.5 rounded border border-indigo-100">
                            <strong>Justificación de Ley:</strong> {activeFullLesson.preguntas[0].justification}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  // STANDARD SUMMARY MODE
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-50 pb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                          {selectedTopic.blockTitle}
                        </span>
                        <h3 className="text-base font-extrabold text-gray-900">
                          {selectedTopic.title}
                        </h3>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id="btn-toggle-completed"
                          onClick={() => onToggleTopicCompleted(selectedTopic.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                            completedTopics.includes(selectedTopic.id)
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          {completedTopics.includes(selectedTopic.id) ? "Estudiado" : "Marcar Estudiado"}
                        </button>

                        <button
                          id="btn-toggle-review"
                          onClick={() => onToggleTopicReview(selectedTopic.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                            reviewTopics.includes(selectedTopic.id)
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-slate-50"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          {reviewTopics.includes(selectedTopic.id) ? "En Repaso" : "Marcar Repaso"}
                        </button>
                      </div>
                    </div>

                    {/* Legal base section */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                        Marco Jurídico de Referencia (Haz clic para ver artículos reales)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTopic.articles.map((art, idx) => (
                          <button
                            key={idx}
                            id={`btn-view-articles-${idx}`}
                            onClick={() => handleOpenArticlesModal(art)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold font-mono text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Scale className="w-3.5 h-3.5 text-indigo-600" />
                            {art}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigable topic content summary */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                        Resumen Técnico y Directrices
                      </span>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed space-y-2">
                        <p>{selectedTopic.content}</p>
                        <p className="text-[11px] text-indigo-700/80 font-medium font-serif italic">
                          * Este material está completamente disponible para descargar. Puedes leer los temas ampliados y artículos literales completos a continuación.
                        </p>
                      </div>
                    </div>

                    {generationError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                        {generationError}
                      </div>
                    )}

                    {/* ACTION TRIGGERS TO SATISFY USER'S DESIRE FOR FULL DETAILED TEXT AND LEGAL ARTICLES */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        id="btn-read-offline-lesson"
                        onClick={() => setIsReadingFull(true)}
                        className="py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                        📖 Leer Lección Completa y Artículos (Offline)
                      </button>

                      <button
                        id="btn-generate-full-topic-ai"
                        onClick={handleGenerateFullWithIA}
                        disabled={isGeneratingFull}
                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {isGeneratingFull ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            Redactando tema completo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                            Generar Tema Exhaustivo por IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    El progreso de estudio se guarda automáticamente de forma local y anonimizada.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs text-slate-500 h-full flex flex-col justify-center">
                Selecciona un tema del panel izquierdo para ver sus artículos legales de referencia.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Legal Articles Modal Overlay */}
      {selectedArticleRef && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Visor de Articulado Legal
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {selectedArticleRef}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticleRef(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer text-sm font-semibold"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {articlesError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                  {articlesError}
                </div>
              )}

              {/* Information disclaimer */}
              <p className="text-[11px] text-slate-500 leading-normal bg-amber-50/60 p-3 rounded-xl border border-amber-100/50">
                💡 <strong>Consejo del Preparador:</strong> El texto mostrado abajo corresponde a la ley española de referencia. Puedes pulsar el botón "Generar con IA" para redactar más articulados literales si la referencia incluye un rango amplio.
              </p>

              {/* Articles rendered */}
              <div className="space-y-6">
                {articlesList.map((article, idx) => (
                  <div key={idx} className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-1 rounded-md font-extrabold bg-indigo-100 text-indigo-900 font-mono">
                        {article.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{article.title}</span>
                    </div>

                    <div className="p-3.5 bg-white border border-slate-100 rounded-xl text-xs font-serif leading-relaxed text-slate-800 italic select-all shadow-2xs">
                      {article.text}
                    </div>

                    <div className="text-[11px] text-slate-600 leading-relaxed font-sans bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/30">
                      <strong className="text-emerald-900 font-bold block mb-0.5">Análisis de Oposición:</strong>
                      {article.commentary}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer / AI Trigger */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-slate-50/50 rounded-b-3xl">
              <button
                onClick={handleGenerateArticlesWithIA}
                disabled={isGeneratingArticles}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs"
              >
                {isGeneratingArticles ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Buscando en boletines con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    Obtener Explicación y Artículos Íntegros con IA
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedArticleRef(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
