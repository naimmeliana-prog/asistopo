import { useState, useMemo } from "react";
import { OppositionData } from "../types";
import { Brain, HelpCircle, RefreshCw, Loader2, BookOpen, Sparkles, CheckCircle2, ChevronRight, MessageSquareCode } from "lucide-react";

interface MnemonicsStudyProps {
  opposition: OppositionData;
  isSimulatedOffline: boolean;
}

interface MnemonicItem {
  type: string;
  formula: string;
  explanation: string;
}

interface MnemonicResult {
  concept: string;
  difficultyWhy: string;
  mnemonics: MnemonicItem[];
  mentalAssociationImage: string;
  retentionTestQuestion: string;
}

// Rich pre-loaded offline database of high-yield mnemonic guides for legal opposition topics
const OFFLINE_MNEMONICS_DB: Record<string, MnemonicResult> = {
  "Plazos del Recurso de Queja": {
    concept: "Plazos del Recurso de Queja",
    difficultyWhy: "La queja procesal tiene plazos muy estrictos y varía según si se trata de recurrir la inadmisión de apelación o de casación, confundiéndose fácilmente con la queja administrativa de 1 mes.",
    mnemonics: [
      {
        type: "Acrónimo Procesal",
        formula: "QUE-DI-CIN",
        explanation: "QUEja - DIctado de inadmisión - CINco días. El plazo general para interponer el recurso de queja contra el auto que deniega la tramitación de una apelación es de 5 días."
      }
    ],
    mentalAssociationImage: "Imagina un juez que grita '¡QUE se canse de CINco saltos!' mientras rechaza tu recurso con cara de pocos amigos.",
    retentionTestQuestion: "¿De cuántos días dispones para interponer el recurso de queja general ante el órgano superior? (Solución: 5 días hábiles)."
  },
  "Competencia de las Oficinas del Registro Civil": {
    concept: "Competencia de las Oficinas del Registro Civil",
    difficultyWhy: "La reforma total de la Ley 20/2011 desjudicializó por completo el sistema, distribuyendo competencias entre Oficinas Generales, Consulares y la Central, sustituyendo al Juez por Letrados de la AJ.",
    mnemonics: [
      {
        type: "Fórmula de Roles",
        formula: "GE-CON-CE",
        explanation: "GEnerales (tramitación ordinaria local), CONsulares (españoles en el extranjero), CEntral (inscripciones especiales, duplicidades e incidencias)."
      }
    ],
    mentalAssociationImage: "Visualiza un mapa mundi donde la oficina Central está en el polo norte con un oso polar resolviendo expedientes de consulados calurosos.",
    retentionTestQuestion: "¿A qué oficina corresponde la inscripción de los nacimientos ocurridos en el extranjero? (Solución: Oficinas Consulares o la Oficina Central)."
  },
  "Excepciones al Despacho de Ejecución Civil": {
    concept: "Excepciones al Despacho de Ejecución Civil",
    difficultyWhy: "Distinguir de forma nítida las causas de oposición a la ejecución de títulos judiciales (pago, caducidad, pacto o transacción) de los títulos no judiciales.",
    mnemonics: [
      {
        type: "Palabra Clave",
        formula: "PA-CA-TRAnsa",
        explanation: "PAgo acreditado de manera documental, CAducidad de la acción ejecutiva, o pacto o TRANSAcción acordado en documento público."
      }
    ],
    mentalAssociationImage: "Imagina un camión de caudales que choca contra un PA-quete de CArbón TRANSparente.",
    retentionTestQuestion: "¿Cuáles son las tres únicas causas de oposición admisibles frente a un título judicial? (Solución: Pago, Caducidad de la acción y Pacto o transacción documentada)."
  }
};

export default function MnemonicsStudy({ opposition, isSimulatedOffline }: MnemonicsStudyProps) {
  const [customConcept, setCustomConcept] = useState("Plazos del Recurso de Queja");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MnemonicResult | null>(null);

  // Prepopulated complex concepts (<10% success rates)
  const difficultConcepts = [
    {
      concept: "Plazos del Recurso de Queja",
      why: "Se confunde recurrentemente con la queja administrativa y sus plazos varían según la jurisdicción.",
    },
    {
      concept: "Competencia de las Oficinas del Registro Civil",
      why: "La desjudicialización total de 2021 redistribuyó competencias de forma compleja entre consulados y oficinas generales.",
    },
    {
      concept: "Excepciones al Despacho de Ejecución Civil",
      why: "Requiere citar artículos correlativos de la LEC y diferenciar plazos de oposición de fondo vs. forma.",
    },
  ];

  const handleFetchMnemonic = async (concept: string) => {
    if (isSimulatedOffline) {
      setError("La generación de mnemotecnias por IA requiere conexión activa a internet. Se muestra la regla de respaldo.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/gemini/generate-mnemonic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          context: opposition.name,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el generador de mnemotecnias por IA.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al generar la regla mnemotécnica.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Compile the current active mnemonic, prioritizing dynamically generated ones, falling back to OFFLINE_MNEMONICS_DB
  const activeMnemonic = useMemo<MnemonicResult | null>(() => {
    if (result) return result;
    if (OFFLINE_MNEMONICS_DB[customConcept]) {
      return OFFLINE_MNEMONICS_DB[customConcept];
    }
    return OFFLINE_MNEMONICS_DB["Plazos del Recurso de Queja"];
  }, [result, customConcept]);

  return (
    <div id="mnemonics-study" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Preguntas Complejas & Mnemotecnia IA
          </h2>
          <p className="text-xs text-gray-500">
            Estudia los conceptos jurídicos con menos del 10% de aciertos utilizando reglas mnemotécnicas de alto rendimiento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel: list of complex topics */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 block">
              Conceptos Críticos (&lt;10% Tasa de Acierto)
            </span>

            <div className="space-y-2">
              {difficultConcepts.map((item, idx) => {
                const isSelected = customConcept === item.concept;
                return (
                  <button
                    key={idx}
                    id={`btn-mnemonic-concept-${idx}`}
                    onClick={() => {
                      setCustomConcept(item.concept);
                      setResult(null); // Clear dynamic result to let fallback load instantly
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs space-y-1 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50 border-indigo-500 shadow-xs"
                        : "border-rose-100 hover:border-indigo-300 hover:bg-slate-50 bg-rose-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 uppercase">
                      <span>Nivel: Ultra Complejo</span>
                      <span>Tasa acierto: 8%</span>
                    </div>
                    <strong className="text-slate-800 font-extrabold">{item.concept}</strong>
                    <p className="text-[10px] text-slate-500 font-normal leading-normal">{item.why}</p>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                O introduce cualquier artículo o concepto difícil:
              </label>
              <div className="flex gap-2">
                <input
                  id="input-custom-mnemonic"
                  type="text"
                  value={customConcept}
                  onChange={(e) => setCustomConcept(e.target.value)}
                  placeholder="Ej: Artículo 149.1 Constitución..."
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  id="btn-custom-mnemonic"
                  onClick={() => customConcept && handleFetchMnemonic(customConcept)}
                  disabled={!customConcept || isGenerating}
                  className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: IA generated mnemonics details */}
        <div className="lg:col-span-8">
          {isGenerating ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center space-y-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <div className="space-y-1.5">
                <p className="font-extrabold text-sm text-slate-700">Diseñando regla mnemotécnica...</p>
                <p className="text-xs text-slate-400">
                  La IA está asociando acrónimos y creando mapas de superaprendizaje procesal.
                </p>
              </div>
            </div>
          ) : activeMnemonic ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {result ? "Regla Generada con Inteligencia Artificial" : "Guía de Memorización Rápida"}
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900">{activeMnemonic.concept}</h3>
                </div>
                <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  Concepto Crítico
                </span>
              </div>

              {/* Dificulty explain */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wide">
                  ¿Por qué falla el 90% de los estudiantes?
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {activeMnemonic.difficultyWhy}
                </p>
              </div>

              {/* Acronyms & Formulas */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wide">
                  Fórmulas Mnemotécnicas de Alto Rendimiento
                </span>

                <div className="space-y-3">
                  {activeMnemonic.mnemonics.map((mn, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                          Regla {idx + 1}: {mn.type}
                        </span>
                        <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-mono font-bold tracking-widest uppercase">
                          {mn.formula}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{mn.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Absurd Image Association */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wide flex items-center gap-1.5">
                  <MessageSquareCode className="w-4 h-4 text-violet-500" />
                  Asociación Mental Ridícula (Fijación de Memoria)
                </span>
                <p className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 text-xs text-slate-700 leading-relaxed font-serif italic">
                  "{activeMnemonic.mentalAssociationImage}"
                </p>
              </div>

              {/* Retention mini question */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Test Rápido de Retención Inmediata
                </span>
                <p className="text-xs text-slate-700 leading-normal">{activeMnemonic.retentionTestQuestion}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-xs text-slate-500 h-full flex flex-col justify-center items-center gap-3">
              <Brain className="w-10 h-10 text-slate-300" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700">Ningún Concepto Cargado</p>
                <p className="text-slate-500 max-w-sm">
                  Haz clic en cualquiera de los conceptos críticos del panel izquierdo o redacta uno propio para fabricar un mnemónico exclusivo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
