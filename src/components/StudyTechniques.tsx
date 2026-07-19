import { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, RotateCcw, AlertCircle, CheckCircle2, Award, ArrowRight } from "lucide-react";

export default function StudyTechniques() {
  const [activeTab, setActiveTab] = useState<"pomodoro" | "forgetting" | "pareto">("pomodoro");

  // Pomodoro states
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 mins standard
  const [isActive, setIsActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"study" | "break">("study");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleModeSwitch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, secondsLeft, pomodoroMode]);

  const handleModeSwitch = () => {
    setIsActive(false);
    if (pomodoroMode === "study") {
      alert("¡Tiempo de estudio completado! Toma un descanso de 5 minutos.");
      setPomodoroMode("break");
      setSecondsLeft(300); // 5 mins break
    } else {
      alert("El descanso ha terminado. ¡A por otra sesión de enfoque de 25 minutos!");
      setPomodoroMode("study");
      setSecondsLeft(1500); // 25 mins study
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(pomodoroMode === "study" ? 1500 : 300);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div id="study-techniques" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Técnicas de Estudio de Alto Rendimiento
          </h2>
          <p className="text-xs text-gray-500">
            Aplica metodologías cognitivas científicas para duplicar tu retención en menos horas.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            id="tab-btn-pomodoro"
            onClick={() => setActiveTab("pomodoro")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pomodoro"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Método Pomodoro
          </button>
          <button
            id="tab-btn-forgetting"
            onClick={() => setActiveTab("forgetting")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "forgetting"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Curva del Olvido
          </button>
          <button
            id="tab-btn-pareto"
            onClick={() => setActiveTab("pareto")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pareto"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Ley de Pareto (80/20)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content detail panels */}
        <div className="lg:col-span-8">
          {activeTab === "pomodoro" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">El Enfoque Pomodoro</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estudiar oposiciones requiere períodos de concentración pura libres de fatiga mental.
                  Estudia intensamente durante <strong>25 minutos</strong> y descansa de forma absoluta durante <strong>5 minutos</strong>.
                </p>
              </div>

              {/* Pomodoro interactive clock widget */}
              <div className="max-w-xs mx-auto p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 text-center space-y-4">
                <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider block">
                  {pomodoroMode === "study" ? "Intervalo de Enfoque" : "Tiempo de Descanso"}
                </span>

                <strong className="text-slate-900 text-5xl font-extrabold font-mono tracking-tight block">
                  {formatTime(secondsLeft)}
                </strong>

                <div className="flex justify-center gap-3">
                  <button
                    id="btn-pomodoro-toggle"
                    onClick={toggleTimer}
                    className={`p-3 rounded-full text-white cursor-pointer ${
                      isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    id="btn-pomodoro-reset"
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                <strong className="text-slate-800">Reglas clave para oposiciones:</strong>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc leading-relaxed">
                  <li>Apaga las notificaciones de tu móvil por completo.</li>
                  <li>No consultes el correo ni abras el BOE fuera del bloque designado.</li>
                  <li>Al cabo de 4 Pomodoros, haz un descanso extendido de 20-30 minutos.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "forgetting" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">La Curva del Olvido de Ebbinghaus</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tu mente olvida el 50% de lo estudiado a las 24 horas si no realizas repasos programados.
                  Para consolidar a largo plazo, el sistema te forzará repasos estratégicos a intervalos fijos.
                </p>
              </div>

              {/* Memory interval grid visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { name: "Repaso 1", time: "A las 24 horas", retention: "Sube al 90%" },
                  { name: "Repaso 2", time: "A los 7 días", retention: "Sube al 95%" },
                  { name: "Repaso 3", time: "A los 15 días", retention: "Fijación permanente" },
                  { name: "Repaso 4", time: "Al mes", retention: "Consolidación examen" },
                ].map((rep, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">{rep.name}</span>
                    <strong className="text-slate-800 text-xs block">{rep.time}</strong>
                    <p className="text-[10px] text-emerald-800 font-semibold">{rep.retention}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed space-y-1.5">
                <strong>¿Cómo lo aplica la plataforma?:</strong>
                <p className="text-emerald-800">
                  Cuando marcas un tema como "En Repaso" en tu syllabus, el sistema lo coloca en tu algoritmo Leitner de tarjetas de memorización activa, asegurándose de programarlo para tu repaso preventivo del olvido.
                </p>
              </div>
            </div>
          )}

          {activeTab === "pareto" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-slate-900">Ley de Pareto (El Principio 80/20)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El 20% de los temas legislativos generará el 80% de las preguntas reales del examen. No todos los temas se valoran de igual forma por el tribunal examinador.
              </p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <strong>Estrategia en Oposiciones Judiciales:</strong>
                <p className="leading-relaxed">
                  En Tramitación Procesal, los bloques de <strong>procedimientos civiles de ejecución</strong> y los <strong>recursos procesales</strong> concentran más de la mitad de las preguntas capciosas del examen.
                </p>
                <p className="leading-relaxed">
                  Usa nuestro módulo de <strong>Análisis Técnico Consolidado</strong> para ver exactamente la gráfica de peso relativo de cada bloque.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right side suggestions panel */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <Award className="w-4 h-4 text-slate-700" />
            Metodología de Repaso Activo
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Evita la lectura pasiva. Es mucho más eficiente realizar cuestionarios cortos con regularidad y tratar de recordar activamente de memoria antes de abrir las respuestas.
          </p>
          <p className="text-slate-600 leading-relaxed font-semibold text-indigo-700">
            ¡Usa nuestro módulo de Flashcards y el Generador de Exámenes para integrar el Active Recall en tu día a día!
          </p>
        </div>
      </div>
    </div>
  );
}
