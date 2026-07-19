import { useMemo, useState } from "react";
import { UserProgress } from "../types";
import { Award, Zap, CheckCircle2, ShieldCheck, Trophy, Flame, TrendingUp, Calendar, AlertCircle, Copy, Check, RefreshCw } from "lucide-react";

interface LogrosProgresoProps {
  progress: UserProgress;
  onImportProgress?: (importedProgress: UserProgress) => void;
}

export default function LogrosProgreso({ progress, onImportProgress }: LogrosProgresoProps) {
  // Sync states
  const [importCode, setImportCode] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportCode = useMemo(() => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(progress))));
    } catch (e) {
      return "";
    }
  }, [progress]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setSyncError("");
    setSyncSuccess(false);
    if (!importCode.trim()) {
      setSyncError("Por favor, introduzca un código de sincronización válido.");
      return;
    }
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(importCode.trim()))));
      if (decoded && typeof decoded === "object" && "studyTimeSeconds" in decoded) {
        if (onImportProgress) {
          onImportProgress(decoded);
          setSyncSuccess(true);
          setImportCode("");
          setSyncError("");
        }
      } else {
        setSyncError("Formato de progreso incompatible. Verifique que sea el código correcto.");
      }
    } catch (e) {
      setSyncError("Código corrupto o inválido. Asegúrese de copiar el código completo.");
    }
  };
  // Badges catalog
  const badges = [
    {
      id: "badge-first",
      name: "Primer Paso",
      description: "Completa tu primer test de preparación o simulacro.",
      unlocked: progress.completedTestsCount >= 1,
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "badge-streak-3",
      name: "Enfoque de Acero",
      description: "Consigue una racha ininterrumpida de estudio de 3 días.",
      unlocked: progress.studyStreakDays >= 3,
      icon: Flame,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "badge-apto-80",
      name: "Apto Sobresaliente",
      description: "Obtén una puntuación del 80% o superior en cualquier test.",
      unlocked: progress.testHistory.some((h) => h.score / h.total >= 0.8),
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "badge-hours-5",
      name: "Templo del Saber",
      description: "Completa tus primeras 5 horas acumuladas de estudio puro.",
      unlocked: progress.studyTimeSeconds >= 18000,
      icon: Trophy,
      color: "text-violet-600 bg-violet-50 border-violet-200",
    },
  ];

  const averageCorrectPercent = useMemo(() => {
    if (progress.totalQuestionsAttempted === 0) return 0;
    return Math.round((progress.correctAnswersCount / progress.totalQuestionsAttempted) * 100);
  }, [progress]);

  return (
    <div id="logros-progreso" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Logros & Progreso Académico
          </h2>
          <p className="text-xs text-gray-500">
            Mantén alta tu motivación diaria coleccionando medallas y haciendo seguimiento de tus simulacros históricos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Streak and general analytics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 p-4 opacity-5">
              <Flame className="w-36 h-36" />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                  Racha de Estudio Activo
                </span>
                <strong className="text-2xl font-black">{progress.studyStreakDays} días seguidos</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Cada día que completas una sesión Pomodoro o realizas un test, alimentas tu racha. Estudiar de forma regular y espaciada activa la memoria profunda a largo plazo.
            </p>

            <div className="border-t border-slate-800/80 pt-4 flex justify-between text-xs text-slate-400">
              <span>Última sesión de estudio:</span>
              <strong className="text-slate-200">{progress.lastStudyDate || "Hoy"}</strong>
            </div>
          </div>

          {/* Core study indices */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 block">
              Métricas Consolidadas de Control
            </span>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-600">Total preguntas contestadas</span>
                <strong className="text-slate-800 font-bold">{progress.totalQuestionsAttempted}</strong>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-600">Respuestas marcadas correctas</span>
                <strong className="text-emerald-700 font-bold">{progress.correctAnswersCount}</strong>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-600">Porcentaje medio de acierto</span>
                <strong className="text-indigo-700 font-bold">{averageCorrectPercent}%</strong>
              </div>
            </div>
          </div>

          {/* Multi-device sync card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wide text-indigo-700 block flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Sincronizar Dispositivos (100% Anónimo)
            </span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Como nuestro sistema es completamente gratuito y protege tu privacidad (sin emails ni servidores), puedes transferir tu racha, exámenes y temas completados entre dispositivos copiando y pegando este código de sincronización:
            </p>

            <div className="space-y-2.5">
              {/* Export Panel */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Exportar tu progreso actual</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={exportCode}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-600 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Import Panel */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Importar progreso de otro dispositivo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pega el código de sincronización aquí..."
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleImport}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-300 animate-spin-hover" />
                    Restaurar
                  </button>
                </div>
              </div>

              {syncError && (
                <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {syncError}
                </p>
              )}

              {syncSuccess && (
                <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  ¡Progreso sincronizado con éxito! El panel se ha actualizado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Gamified Achievements / Badges catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-gray-50 pb-2">
              Insignias y Desafíos del Estudiante
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((b) => {
                const IconComponent = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
                      b.unlocked
                        ? `${b.color} shadow-xs`
                        : "bg-slate-50/50 border-gray-100 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <strong className={`text-xs font-bold ${b.unlocked ? "text-slate-800" : "text-slate-400"}`}>
                        {b.name}
                      </strong>
                      <p className="text-[10px] leading-normal font-normal text-slate-500">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* History of completed tests */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-gray-50 pb-2">
          Historial de Evaluaciones y Simulacros
        </h3>

        {progress.testHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="progress-history-table" className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">Fecha</th>
                  <th className="pb-3 font-semibold">Oposición</th>
                  <th className="pb-3 font-semibold">Tipo de Test</th>
                  <th className="pb-3 font-semibold text-center">Aciertos</th>
                  <th className="pb-3 font-semibold text-center">Porcentaje</th>
                  <th className="pb-3 font-semibold text-right">Tiempo Empleado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {progress.testHistory.map((item, idx) => {
                  const scorePercent = Math.round((item.score / item.total) * 100);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-mono text-slate-500">{item.date}</td>
                      <td className="py-3 font-semibold text-slate-800">{item.oppositionName}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isSimulacro
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-850"
                          }`}
                        >
                          {item.isSimulacro ? "Simulacro" : "Práctica"}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700">
                        {item.score} / {item.total}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`font-bold ${
                            scorePercent >= 50 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {scorePercent}%
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">
                        {Math.floor(item.timeSeconds / 60)} min {item.timeSeconds % 60} s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-slate-400">
            Todavía no has realizado ningún test. Ve a la sección de Generador de Exámenes para empezar tu entrenamiento.
          </div>
        )}
      </div>
    </div>
  );
}
