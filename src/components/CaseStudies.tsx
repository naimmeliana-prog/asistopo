import { useState, useMemo } from "react";
import { OppositionData, PracticalCase } from "../types";
import { Cpu, FileText, CheckCircle, HelpCircle, Loader2, Play, Sparkles, BookOpen, AlertTriangle } from "lucide-react";

interface CaseStudiesProps {
  opposition: OppositionData;
  isSimulatedOffline: boolean;
}

export default function CaseStudies({ opposition, isSimulatedOffline }: CaseStudiesProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generated cases state
  const [generatedCases, setGeneratedCases] = useState<PracticalCase[]>([]);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Combine static and generated cases
  const allCases = useMemo(() => {
    return [...opposition.practicalCases, ...generatedCases];
  }, [opposition.practicalCases, generatedCases]);

  // Select first case if none is selected
  useMemo(() => {
    if (allCases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(allCases[0].id);
    }
  }, [allCases, selectedCaseId]);

  const activeCase = useMemo(() => {
    return allCases.find((c) => c.id === selectedCaseId) || null;
  }, [allCases, selectedCaseId]);

  const handleToggleBlock = (blockId: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const handleGenerateCase = async () => {
    if (isSimulatedOffline) {
      setGenerationError("La generación por IA requiere conexión a internet activa. Desactiva el modo offline.");
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/gemini/generate-case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opposition: opposition.name,
          blocks: selectedBlocks,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el motor de Inteligencia Artificial.");
      }

      const data = await response.json();
      if (!data.title || !data.situation) {
        throw new Error("La respuesta de la IA no contenía el formato esperado.");
      }

      const newCase: PracticalCase = {
        id: `gen-case-${Date.now()}`,
        title: data.title,
        year: new Date().getFullYear(),
        situation: data.situation,
        questions: data.questions.map((q: any, i: number) => ({
          question: q.text,
          legalBase: q.legalBase,
          solution: q.idealResponse,
        })),
      };

      setGeneratedCases((prev) => [newCase, ...prev]);
      setSelectedCaseId(newCase.id);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Error al generar el supuesto práctico.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSolution = (index: number) => {
    const key = `${selectedCaseId}-${index}`;
    setRevealedSolutions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div id="case-studies" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Casos Prácticos & IA Generadora
          </h2>
          <p className="text-xs text-gray-500">
            Resuelve dilemas fácticos reales del cuerpo examinador u obtén simulaciones completas por IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: list of cases & Generator options */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Generator module */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300 shrink-0" />
              <h3 className="font-extrabold text-sm tracking-tight text-indigo-100">
                Generador Inteligente por IA
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Genera un supuesto jurídico/administrativo inédito basado en los bloques legislativos que elijas.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400 block">
                Selecciona Bloques del Temario
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                {opposition.syllabus.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-start gap-2 text-xs text-slate-200 cursor-pointer select-none"
                  >
                    <input
                      id={`checkbox-block-${b.id}`}
                      type="checkbox"
                      checked={selectedBlocks.includes(b.id)}
                      onChange={() => handleToggleBlock(b.id)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="truncate max-w-[90%]">{b.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {generationError && (
              <div className="p-2.5 rounded bg-red-950/50 border border-red-800 text-red-200 text-[11px] leading-relaxed flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <button
              id="btn-generate-ai-case"
              onClick={handleGenerateCase}
              disabled={isGenerating}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Redactando supuesto jurídico...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Generar Supuesto con IA
                </>
              )}
            </button>
          </div>

          {/* List of cases */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 block">
              Repositorio de Casos Prácticos ({allCases.length})
            </span>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allCases.map((c) => {
                const isSelected = selectedCaseId === c.id;
                const isAI = c.id.startsWith("gen-case");

                return (
                  <button
                    key={c.id}
                    id={`case-item-btn-${c.id}`}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 font-semibold text-indigo-950"
                        : "bg-white border-gray-100 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isAI ? (
                        <Sparkles className="w-4 h-4 text-violet-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>Examen {c.year}</span>
                        {isAI && <span className="text-violet-600 font-bold uppercase tracking-wider">IA</span>}
                      </div>
                      <span className="line-clamp-1 leading-normal">{c.title}</span>
                    </div>
                  </button>
                );
              })}

              {allCases.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No hay casos prácticos cargados para esta oposición. Selecciona o genera uno con IA.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: case description & questions */}
        <div className="lg:col-span-7">
          {activeCase ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Supuesto Seleccionado
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900">{activeCase.title}</h3>
                </div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600 shrink-0">
                  Año: {activeCase.year}
                </span>
              </div>

              {/* Situation text */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  Planteamiento del Caso (Situación de Hecho)
                </span>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line">
                  {activeCase.situation}
                </div>
              </div>

              {/* Questions items */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  Preguntas Planteadas por el Tribunal
                </span>

                <div className="space-y-4">
                  {activeCase.questions.map((q, idx) => {
                    const isSolved = revealedSolutions[`${activeCase.id}-${idx}`];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 space-y-3 bg-white hover:border-indigo-100 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-800 leading-normal flex-1">
                            <span className="text-indigo-600 mr-1 font-mono">Pregunta {idx + 1}:</span>
                            {q.question}
                          </h4>
                          <button
                            id={`btn-reveal-solution-${activeCase.id}-${idx}`}
                            onClick={() => handleToggleSolution(idx)}
                            className={`px-3 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              isSolved
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            {isSolved ? "Ocultar Solución" : "Ver Solución de Ley"}
                          </button>
                        </div>

                        {isSolved && (
                          <div className="pt-3 border-t border-dashed border-gray-100 text-xs space-y-2 animate-fade-in">
                            <div className="flex gap-1.5 text-[10px] text-indigo-700 font-bold uppercase tracking-wider font-mono">
                              <span>Fundamento de Ley:</span>
                              <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                {q.legalBase}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-lg border border-slate-100/40">
                              {q.solution}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs text-slate-500 h-full flex flex-col justify-center">
              Selecciona un supuesto práctico de la lista o genera uno nuevo con Inteligencia Artificial.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
