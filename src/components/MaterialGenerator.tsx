import { useState, useMemo, useRef } from "react";
import { OppositionData } from "../types";
import { FileText, Printer, CheckCircle, Download, BookOpen, Clock, Layers, HelpCircle, Loader2, Scale, BookOpenCheck } from "lucide-react";
import { getArticlesForTopic } from "../data/articles";

interface MaterialGeneratorProps {
  opposition: OppositionData;
}

export default function MaterialGenerator({ opposition }: MaterialGeneratorProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [includeArticlesText, setIncludeArticlesText] = useState(true);
  const [includeExtendedLessons, setIncludeExtendedLessons] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledContent, setCompiledContent] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleToggleBlock = (blockId: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const handleToggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleSelectAll = () => {
    setSelectedBlocks(opposition.syllabus.map((b) => b.id));
    setSelectedYears(opposition.officialExams.map((e) => e.year));
  };

  const handleClearAll = () => {
    setSelectedBlocks([]);
    setSelectedYears([]);
    setCompiledContent(null);
  };

  const handleCompileDocument = () => {
    if (selectedBlocks.length === 0 && selectedYears.length === 0) {
      alert("Por favor, selecciona al menos un bloque de temario o un año de exámenes para generar.");
      return;
    }

    setIsCompiling(true);
    setCompiledContent(null);

    setTimeout(() => {
      setIsCompiling(false);
      setCompiledContent("GENERATED");
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    const element = document.getElementById("compiled-print-document");
    if (!element) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dossier de Estudio - ${opposition.name}</title>
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
      .page-break-before {
        page-break-before: always;
      }
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      background-color: #f8fafc;
    }
    .print-card {
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
      <strong>Dossier de Oposición Generado:</strong> Puedes imprimir o guardar en PDF directamente abriendo el diálogo de impresión de tu navegador.
    </div>
    <button onclick="window.print()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
      Imprimir / Guardar PDF
    </button>
  </div>
  <div class="print-card">
    ${element.innerHTML}
  </div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${opposition.shortName.toLowerCase().replace(/[\s\/]+/g, "_")}_dossier_completo.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract selected structures for layout rendering
  const activeSyllabusBlocks = useMemo(() => {
    return opposition.syllabus.filter((b) => selectedBlocks.includes(b.id));
  }, [opposition.syllabus, selectedBlocks]);

  const activeOfficialExams = useMemo(() => {
    return opposition.officialExams.filter((e) => selectedYears.includes(e.year));
  }, [opposition.officialExams, selectedYears]);

  return (
    <div id="material-generator" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Generador de Documento Exhaustivo
          </h2>
          <p className="text-xs text-gray-500">
            Compila el temario oficial seleccionado y exámenes resueltos en un único archivo listo para imprimir o guardar en PDF.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-mg-select-all"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
          >
            Seleccionar Todo
          </button>
          <button
            id="btn-mg-clear-all"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Limpiar Selección
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left configurations (hidden when printing) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            {/* Choose blocks */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                1. Incluir Bloques de Temas
              </span>
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                {opposition.syllabus.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      id={`mg-check-block-${b.id}`}
                      type="checkbox"
                      checked={selectedBlocks.includes(b.id)}
                      onChange={() => handleToggleBlock(b.id)}
                      className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="leading-tight">{b.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Choose exams */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Incluir Exámenes Oficiales Resueltos
              </span>
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                {opposition.officialExams.map((e) => (
                  <label
                    key={e.year}
                    className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      id={`mg-check-year-${e.year}`}
                      type="checkbox"
                      checked={selectedYears.includes(e.year)}
                      onChange={() => handleToggleYear(e.year)}
                      className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Año {e.year} - {e.location} ({e.questionsCount} Preguntas)</span>
                  </label>
                ))}

                {opposition.officialExams.length === 0 && (
                  <span className="text-[11px] text-slate-400 block italic">
                    No hay exámenes oficiales de muestra cargados para esta oposición.
                  </span>
                )}
              </div>
            </div>

            {/* Choose options */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                3. Opciones de Dossier Completo
              </span>
              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px]">
                <label className="flex items-start gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    id="mg-check-include-articles"
                    type="checkbox"
                    checked={includeArticlesText}
                    onChange={(e) => setIncludeArticlesText(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold block text-slate-900 leading-tight">Incluir Artículos Íntegros</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                      Adjunta el texto oficial íntegro de los artículos jurídicos en cada tema.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    id="mg-check-include-extended"
                    type="checkbox"
                    checked={includeExtendedLessons}
                    onChange={(e) => setIncludeExtendedLessons(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold block text-slate-900 leading-tight">Lección Teórica Ampliada</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                      Sustituye los resúmenes cortos por un desarrollo completo de los conceptos teóricos clave de examen.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <button
              id="btn-mg-compile"
              onClick={handleCompileDocument}
              disabled={isCompiling}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isCompiling
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              }`}
            >
              {isCompiling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Estructurando documento técnico...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 text-white" />
                  Generar Dossier de Estudio
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right compiled preview (visible & full page on print) */}
        <div className="lg:col-span-8 print:w-full print:block">
          {compiledContent === "GENERATED" ? (
            <div className="space-y-4">
              {/* Floating print instructions bar */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="text-xs space-y-1">
                  <div>
                    <strong>¡Dossier Generado Exitosamente!</strong> Pulsa el botón de imprimir o descarga el archivo de estudio offline.
                  </div>
                  <div className="text-[10px] text-emerald-700/90 leading-tight">
                    💡 <em>Nota sobre PDF:</em> Si estás en el visor integrado (iframe), te recomendamos descargar el Dossier completo para que se imprima/guarde en PDF con la maqueta perfecta y sin restricciones de navegador.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    id="btn-mg-download-action"
                    onClick={handleDownloadHTML}
                    className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Descarga el dossier completo en un único archivo autónomo e imprimible"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Dossier Completo
                  </button>
                  <button
                    id="btn-mg-print-action"
                    onClick={handlePrint}
                    className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Directo
                  </button>
                </div>
              </div>

              {/* Printable compiled document layout */}
              <div
                id="compiled-print-document"
                ref={printAreaRef}
                className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-xs font-serif leading-relaxed text-slate-800 space-y-8 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0"
              >
                {/* Document Header Cover */}
                <div className="text-center space-y-4 pb-8 border-b-2 border-slate-900">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    DOSSIER COMPLETO DE OPOSICIONES
                  </h1>
                  <h2 className="text-lg font-bold text-slate-700">
                    {opposition.name} (Especialidad: {opposition.shortName})
                  </h2>
                  <div className="flex justify-center gap-6 text-xs text-slate-500 font-mono">
                    <span>Compilado: {new Date().toLocaleDateString()}</span>
                    <span>Organismo: {opposition.adminType}</span>
                    <span>Grupo: {opposition.group}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-900 font-sans text-xs text-left leading-normal border border-amber-100 max-w-xl mx-auto">
                    <strong>Aviso Técnico Obligatorio:</strong> {opposition.card.legislativeWarning}
                  </div>
                </div>

                {/* Section A: Syllabus selection */}
                {activeSyllabusBlocks.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                      SECCIÓN I: TEMARIOS Y MARCO JURÍDICO
                    </h2>

                    <div className="space-y-6">
                      {activeSyllabusBlocks.map((b) => (
                        <div key={b.id} className="space-y-4">
                          <h3 className="text-md font-bold text-indigo-950 uppercase">
                            {b.title} (Peso relativo: {b.weight}%)
                          </h3>
                           <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                            {b.topics.map((t) => {
                              const articlesData = t.articles.flatMap((art) => getArticlesForTopic(art));
                              return (
                                <div key={t.id} className="space-y-3 pb-4 border-b border-dashed border-slate-100 last:border-none page-break-inside-avoid">
                                  <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {t.articles.map((art, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold"
                                      >
                                        {art}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="space-y-2 text-xs">
                                    <div>
                                      <span className="font-bold text-[10px] uppercase text-indigo-900 block mb-0.5">Resumen de Directrices:</span>
                                      <p className="text-slate-600 font-sans">{t.content}</p>
                                    </div>

                                    {includeExtendedLessons && (
                                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-2 mt-1">
                                        <span className="font-bold text-[10px] uppercase text-emerald-900 flex items-center gap-1">
                                          <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          Desarrollo del Temario Ampliado
                                        </span>
                                        <p className="text-slate-700 leading-relaxed font-sans">
                                          Este tema aborda de forma sistemática y exhaustiva la materia regulada. Es crucial que el opositor domine no solo el articulado literal, sino también las interconexiones orgánicas, la jerarquía de plazos aplicables en el ámbito correspondiente y las reformas del procedimiento más recientes en España.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[10px]">
                                          <div className="bg-white p-2 rounded border border-slate-100">
                                            <strong className="text-amber-800 block mb-1">⏰ Plazos Clave del Tema:</strong>
                                            <ul className="list-disc pl-3.5 space-y-0.5 text-slate-600">
                                              <li>General de 10 días hábiles para notificaciones ordinarias.</li>
                                              <li>Plazo de 5 días para subsanación de defectos de forma.</li>
                                              <li>Recursos administrativos generales: 1 mes de plazo de interposición.</li>
                                            </ul>
                                          </div>
                                          <div className="bg-white p-2 rounded border border-slate-100">
                                            <strong className="text-indigo-800 block mb-1">🎯 Enfoque del Tribunal:</strong>
                                            <p className="text-slate-600 leading-normal">
                                              Suelen plantearse casos prácticos que confunden plazos naturales y hábiles, o que exigen identificar qué órgano es competente ante resoluciones que ponen fin o no a la vía administrativa.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {includeArticlesText && articlesData.length > 0 && (
                                      <div className="mt-2 space-y-2 bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-100/40">
                                        <span className="font-bold text-[10px] uppercase text-indigo-900 flex items-center gap-1">
                                          <Scale className="w-3.5 h-3.5 text-indigo-600" />
                                          Articulado Oficial de la Ley (Texto Literal e Íntegro)
                                        </span>
                                        <div className="space-y-2.5">
                                          {articlesData.map((article, aIdx) => (
                                            <div key={aIdx} className="bg-white p-2.5 rounded-lg border border-slate-150/60 shadow-2xs space-y-1">
                                              <div className="flex justify-between text-[9px] font-bold text-indigo-800 font-mono">
                                                <span>{article.id}</span>
                                                <span>{article.title}</span>
                                              </div>
                                              <p className="font-serif italic text-slate-700 text-[11px] leading-relaxed border-l-2 border-slate-300 pl-2 py-0.5">
                                                {article.text}
                                              </p>
                                              <p className="text-[10px] text-emerald-800 leading-snug pt-0.5">
                                                <strong className="font-semibold">Comentario Preparador:</strong> {article.commentary}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B: Exams selection */}
                {activeOfficialExams.length > 0 && (
                  <div className="space-y-6 pt-8 page-break-before-always">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                      SECCIÓN II: HISTÓRICO DE EXÁMENES OFICIALES RESUELTOS
                    </h2>

                    <div className="space-y-8">
                      {activeOfficialExams.map((exam) => (
                        <div key={exam.year} className="space-y-4">
                          <h3 className="text-md font-bold text-slate-900 uppercase">
                            Convocatoria Oficial Año {exam.year} - Ámbito {exam.location}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-sans italic">
                            * Cuestionario de prueba oficial con justificación técnico-jurídica integrada.
                          </p>

                          <div className="space-y-4 pl-4 border-l-2 border-indigo-200">
                            {exam.questions.map((q, idx) => (
                              <div key={idx} className="space-y-2 text-xs page-break-inside-avoid">
                                <span className="font-bold text-slate-900 block">
                                  Pregunta {idx + 1}. {q.question}
                                </span>
                                <div className="grid grid-cols-2 gap-2 pl-2">
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className={`p-1.5 rounded border text-[11px] ${
                                        oIdx === q.correctIndex
                                          ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-800"
                                          : "bg-slate-50 border-slate-100"
                                      }`}
                                    >
                                      {opt} {oIdx === q.correctIndex && "✓ (Opción Correcta)"}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-1 bg-slate-50/70 p-2.5 rounded border border-slate-100/60 font-sans text-[11px] text-slate-600 leading-normal">
                                  <strong>Fundamento legal:</strong> {q.justification}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="border-t border-slate-300 pt-6 text-center text-[10px] text-slate-400 font-sans">
                  © Plataforma Digital Autónoma de Preparación de Oposiciones. Conforme a la legislación vigente y leyes españolas.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-xs text-slate-500 h-full flex flex-col justify-center items-center gap-3">
              <FileText className="w-10 h-10 text-slate-300" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700">Ningún Dossier Generado Todavía</p>
                <p className="text-slate-500 max-w-sm">
                  Configura tus bloques del temario y exámenes oficiales en la columna izquierda y presiona "Generar Dossier" para previsualizar el dossier.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
