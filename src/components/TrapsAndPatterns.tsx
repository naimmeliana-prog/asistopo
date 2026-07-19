import { useState, useMemo } from "react";
import { OppositionData } from "../types";
import { Zap, AlertCircle, RefreshCw, Sparkles, Loader2, ArrowRight, BookOpen, CheckCircle2, HelpCircle } from "lucide-react";
import { generateClientPatterns } from "../lib/clientAiGenerator";

interface TrapsAndPatternsProps {
  opposition: OppositionData;
  isSimulatedOffline: boolean;
}

interface TrapPattern {
  name: string;
  mechanism: string;
  howToAvoid: string;
}

interface TrapQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface IAData {
  opposition: string;
  typicalTraps: TrapPattern[];
  mockTrapQuestions: TrapQuestion[];
  keyAdvice: string;
}

// Complete offline data for traps & patterns to ensure opositores have rich, immediate resources!
const OFFLINE_TRAPS_DB: Record<number, TrapPattern[]> = {
  2024: [
    {
      name: "Trampa de Días Hábiles vs Naturales (Art. 30 Ley 39/2015)",
      mechanism: "El tribunal confunde intencionadamente plazos en días hábiles (excluyendo sábados, domingos y festivos) con días naturales (cómputo civil continuado), buscando que el alumno cometa errores en el cómputo final.",
      howToAvoid: "Como regla de oro, salvo que una ley de rango estatal disponga otra cosa de forma expresa, los plazos por días en el derecho administrativo y procesal son siempre hábiles."
    },
    {
      name: "Diferenciación de Competencias (Letrado AJ vs Juez o Magistrado)",
      mechanism: "Atribuir decretos resolutorios o diligencias de ordenación al Juez de forma errónea, o autos decisorios de inadmisión al Letrado de la AJ.",
      howToAvoid: "Recuerda que el Letrado de la AJ dicta Diligencias (de ordenación, de constancia, de comunicación) y Decretos. El Juez dicta Providencias, Autos (motivos formales o inadmisión) y Sentencias (fondo)."
    }
  ],
  2023: [
    {
      name: "La trampa de la Conciliación Previa y Plazos de Caducidad",
      mechanism: "En materias de despido o acciones sujetas a caducidad, el tribunal asume que la presentación de la papeleta de conciliación suspende el plazo de forma indefinida, obviando el límite de días hábiles.",
      howToAvoid: "La presentación de la papeleta suspende la caducidad por un máximo de 15 días hábiles, tras los cuales se reanuda el cómputo obligatoriamente (Art. 65 LRJS)."
    },
    {
      name: "Efecto de la Silencio Administrativo en Recursos de Alzada",
      mechanism: "Elaborar preguntas donde el silencio frente a un recurso de alzada interpuesto contra otro silencio se considera desestimatorio.",
      howToAvoid: "¡Cuidado con el doble silencio! Si el recurso de alzada se interpone contra la desestimación por silencio administrativo de una solicitud, el transcurso del plazo sin resolución expresa tiene efecto estimatorio (Art. 24.1 Ley 39/2015)."
    }
  ],
  2021: [
    {
      name: "Las Oficinas Consulares y el Nuevo Registro Civil",
      mechanism: "Formular cuestiones asumiendo que el Registro Civil sigue dependiendo de jueces encargados, omitiendo la reforma estructural de desjudicialización.",
      howToAvoid: "Con la Ley 20/2011, las Oficinas del Registro Civil están a cargo de Letrados de la AJ o funcionarios del subgrupo A1, no de jueces de primera instancia."
    }
  ],
  2018: [
    {
      name: "Mayorías del CGPJ para Nombramientos Discrecionales",
      mechanism: "Preguntar quórums de mayoría simple para designaciones de Magistrados del TS, confundiendo el régimen general con el especial.",
      howToAvoid: "Los nombramientos de Magistrados del TS y Presidentes de Sala requieren de una mayoría cualificada de tres quintos de los vocales del CGPJ."
    }
  ]
};

const OFFLINE_TRAP_QUESTIONS: TrapQuestion[] = [
  {
    question: "En un proceso civil, se interpone recurso de reposición contra una diligencia de ordenación dictada por el Letrado de la AJ. ¿Qué órgano y mediante qué resolución debe resolverse dicho recurso?",
    options: [
      "El propio Letrado de la AJ mediante Decreto",
      "El Juez o Magistrado titular del juzgado mediante Auto",
      "La Audiencia Provincial mediante Auto firme",
      "El Letrado de la AJ mediante Diligencia de Ordenación motivada"
    ],
    correctIndex: 0,
    explanation: "El recurso de reposición contra resoluciones del Letrado de la Administración de Justicia se tramita y resuelve por el propio Letrado de la AJ que dictó la resolución recurrida, mediante Decreto (Art. 452 y ss. LEC)."
  },
  {
    question: "Un opositor recibe una notificación electrónica de la Administración a las 23:30 horas de un viernes. ¿A partir de qué momento procesal se inicia el cómputo de un plazo de 10 días hábiles que le concede el acto administrativo?",
    options: [
      "A partir del día siguiente (sábado), computándose sábados como naturales",
      "A partir del lunes inmediato, que es el primer día hábil",
      "A partir del lunes inmediato posterior, pero el cómputo oficial de los 10 días se inicia el día de la firma electrónica",
      "A partir del día hábil siguiente a aquel en que tenga lugar la notificación (el lunes posterior es el primer día computable)"
    ],
    correctIndex: 3,
    explanation: "Según la Ley 39/2015, las notificaciones surten efecto a partir del día siguiente a su recepción. El primer día hábil computable será el lunes subsiguiente, puesto que sábados y domingos son inhábiles en vía administrativa."
  }
];

export default function TrapsAndPatterns({ opposition, isSimulatedOffline }: TrapsAndPatternsProps) {
  // Multi-year selection states
  const [selectedYears, setSelectedYears] = useState<number[]>([2023, 2024]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<IAData | null>(null);

  // User responses to questions
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAnswerResults, setShowAnswerResults] = useState<Record<number, boolean>>({});

  const handleToggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisData(null);
    setSelectedAnswers({});
    setShowAnswerResults({});

    try {
      if (isSimulatedOffline) {
        throw new Error("Modo offline simulado activo");
      }

      const response = await fetch("/api/gemini/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opposition: opposition.name,
          years: selectedYears,
        }),
      });

      if (!response.ok) {
        throw new Error("Error de red al consultar el analizador de patrones.");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.warn("Using high-fidelity client-side pattern analysis:", err);
      const data = generateClientPatterns(opposition.name, selectedYears);
      setAnalysisData(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleRevealQuestion = (qIdx: number) => {
    setShowAnswerResults((prev) => ({ ...prev, [qIdx]: true }));
  };

  // Compile active traps based on multi-year selected checkboxes
  const activeTraps = useMemo(() => {
    if (analysisData) return analysisData.typicalTraps;
    
    // Fallback: merge offline traps from all selected years
    return selectedYears
      .filter((y) => OFFLINE_TRAPS_DB[y])
      .flatMap((y) => OFFLINE_TRAPS_DB[y]);
  }, [analysisData, selectedYears]);

  const activeQuestions = useMemo(() => {
    if (analysisData) return analysisData.mockTrapQuestions;
    return OFFLINE_TRAP_QUESTIONS;
  }, [analysisData]);

  return (
    <div id="traps-and-patterns" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Trampas & Patrones de Examen
          </h2>
          <p className="text-xs text-gray-500">
            Aprende a decodificar las preguntas capciosas del tribunal según el año legislativo seleccionado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side: configuration selectors */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider block">
              Configuración de Análisis
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Selecciona uno o más años para comparar patrones
              </label>
              
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {[2024, 2023, 2021, 2018].map((y) => {
                  const isChecked = selectedYears.includes(y);
                  return (
                    <label key={y} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        id={`check-trap-year-${y}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleYear(y)}
                        className="rounded border-gray-300 text-indigo-600 w-3.5 h-3.5"
                      />
                      <span>Año {y} {y === 2024 && "(Última Convocatoria)"}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="btn-analyze-traps"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || selectedYears.length === 0}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAnalyzing || selectedYears.length === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Analizando vicios del tribunal...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Actualizar mediante IA
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed space-y-2">
            <span className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              ¿Qué es una \"Pregunta Trampa\"?
            </span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              El tribunal suele diseñar preguntas para examinar si lees con prisa. Cambiar el término \"hábiles\" por \"naturales\", o sustituir \"órgano competente\" por \"Letrado de la Administración de Justicia\" son patrones sistemáticos de descarte.
            </p>
          </div>
        </div>

        {/* Right side: Traps & questions display */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-6">
            
            {/* Patterns found (Preloaded default or IA Generated!) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 animate-fade-in">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-gray-50 pb-2">
                {analysisData ? "Patrones Extraídos por IA" : "Patrones Técnicos Identificados"} (Años: {selectedYears.join(", ")})
              </h3>

              {activeTraps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTraps.map((trap, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                      <span className="text-xs font-bold text-indigo-700 block">{trap.name}</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong>Mecanismo:</strong> {trap.mechanism}
                      </p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                        <strong>Cómo evitarla:</strong> {trap.howToAvoid}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Selecciona al menos un año en el panel lateral para cargar sus patrones legislativos de referencia.
                </div>
              )}
            </div>

            {/* Mock questions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 animate-fade-in">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Simulador de Preguntas Capciosas del Tribunal
              </h3>

              <div className="space-y-6">
                {activeQuestions.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  const isRevealed = showAnswerResults[qIdx];

                  return (
                    <div key={qIdx} className="p-4 rounded-xl border border-gray-100 space-y-3 bg-slate-50/50">
                      <span className="font-bold text-xs text-slate-800 block">
                        Pregunta {qIdx + 1}: {q.question}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let cardStyle = "bg-white border-gray-200 text-slate-700 hover:bg-slate-50";

                          if (isRevealed) {
                            if (oIdx === q.correctIndex) {
                              cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                            } else if (isOptionSelected) {
                              cardStyle = "bg-red-50 border-red-300 text-red-900 font-medium";
                            }
                          } else if (isOptionSelected) {
                            cardStyle = "bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold";
                          }

                          return (
                            <button
                              key={oIdx}
                              id={`trap-opt-${qIdx}-${oIdx}`}
                              onClick={() => !isRevealed && handleSelectOption(qIdx, oIdx)}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${cardStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Elige una opción antes de comprobar la solución.
                        </span>

                        <button
                          id={`btn-check-trap-${qIdx}`}
                          onClick={() => selectedOpt !== undefined && handleRevealQuestion(qIdx)}
                          disabled={selectedOpt === undefined || isRevealed}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            selectedOpt === undefined || isRevealed
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-slate-900 text-white hover:bg-black"
                          }`}
                        >
                          Comprobar Solución
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="mt-3 p-3 rounded-lg bg-indigo-50/60 border border-indigo-150 text-[11px] leading-relaxed text-indigo-900 animate-fade-in font-sans">
                          <strong>Explicación de la Trampa:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
