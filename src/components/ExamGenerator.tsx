import { useState, useEffect, useRef, useMemo } from "react";
import { OppositionData } from "../types";
import { FileCheck, Clock, Award, CheckCircle2, XCircle, AlertCircle, RefreshCw, Loader2, Play, Sparkles } from "lucide-react";
import { generateClientTest } from "../lib/clientAiGenerator";

interface ExamGeneratorProps {
  opposition: OppositionData;
  isSimulatedOffline: boolean;
  onLogTestResult: (score: number, total: number, timeSeconds: number, isSimulacro: boolean) => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  justification: string;
}

export default function ExamGenerator({
  opposition,
  isSimulatedOffline,
  onLogTestResult,
}: ExamGeneratorProps) {
  // Config state
  const [examType, setExamType] = useState<"official" | "ai">("official");
  
  // Multi-year selection and baseline selection
  const [selectedOfficialYears, setSelectedOfficialYears] = useState<number[]>(
    opposition.officialExams.map(ex => ex.year)
  );
  const [fromYearThreshold, setFromYearThreshold] = useState<number>(2023);

  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiDifficulty, setAiDifficulty] = useState<"Fácil" | "Medio" | "Difícil">("Medio");
  const [aiSelectedBlocks, setAiSelectedBlocks] = useState<string[]>([]);
  const [testMode, setTestMode] = useState<"practica" | "simulacro">("practica");

  // Running exam state
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examCompleted, setExamCompleted] = useState(false);

  // Timer state for simulation
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes standard for demo
  const [timerActive, setTimerActive] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleBlock = (blockId: string) => {
    setAiSelectedBlocks((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const handleToggleYear = (year: number) => {
    setSelectedOfficialYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleApplyYearThreshold = (threshold: number) => {
    setFromYearThreshold(threshold);
    const validYears = opposition.officialExams
      .map((ex) => ex.year)
      .filter((y) => y >= threshold);
    setSelectedOfficialYears(validYears);
  };

  const handleStartExam = async () => {
    setGenerationError(null);
    setExamCompleted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    if (examType === "official") {
      // Find and consolidate questions from all selected years
      const combinedQuestions = opposition.officialExams
        .filter((e) => selectedOfficialYears.includes(e.year))
        .flatMap((e) => e.questions);

      if (combinedQuestions.length === 0) {
        setGenerationError("Por favor, selecciona al menos un año con preguntas oficiales para iniciar el examen.");
        return;
      }
      
      setQuestions(combinedQuestions);
      launchExam(combinedQuestions.length);
    } else {
      // AI Exam Generation
      setIsGenerating(true);

      try {
        if (isSimulatedOffline) {
          throw new Error("Modo offline simulado activo");
        }

        const response = await fetch("/api/gemini/generate-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opposition: opposition.name,
            blocks: aiSelectedBlocks,
            count: aiQuestionCount,
            difficulty: aiDifficulty,
            isSimulacro: testMode === "simulacro",
          }),
        });

        if (!response.ok) {
          throw new Error("No se pudo conectar con el generador de exámenes de Inteligencia Artificial.");
        }

        const data = await response.json();
        if (!data.questions || data.questions.length === 0) {
          throw new Error("La IA no devolvió preguntas con el formato adecuado.");
        }

        const formattedQuestions: Question[] = data.questions.map((q: any) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          justification: q.justification,
        }));

        setQuestions(formattedQuestions);
        launchExam(formattedQuestions.length);
      } catch (err: any) {
        console.warn("Using offline / local client AI test generation fallback:", err);
        const data = generateClientTest(opposition.name, aiSelectedBlocks, aiQuestionCount, aiDifficulty);
        const formattedQuestions: Question[] = data.questions.map((q: any) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          justification: q.justification,
        }));
        setQuestions(formattedQuestions);
        launchExam(formattedQuestions.length);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const launchExam = (qCount: number) => {
    setIsExamRunning(true);
    startTimeRef.current = Date.now();

    if (testMode === "simulacro") {
      setTimeLeft(qCount * 60); // 1 minute per question
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  };

  // Timer ticker
  useEffect(() => {
    if (timerActive && isExamRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, isExamRunning, timeLeft]);

  const handleSelectAnswer = (optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleCompleteExam = () => {
    setIsExamRunning(false);
    setTimerActive(false);
    setExamCompleted(true);

    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    onLogTestResult(correctCount, questions.length, elapsedSeconds, testMode === "simulacro");
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Calculate score values for rendering
  const scoreMetrics = useMemo(() => {
    if (!examCompleted) return { correct: 0, scorePercent: 0 };
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    return {
      correct,
      scorePercent: Math.round((correct / questions.length) * 100),
    };
  }, [examCompleted, questions, selectedAnswers]);

  return (
    <div id="exam-generator" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Generador de Exámenes & Simulacros
          </h2>
          <p className="text-xs text-gray-500">
            Realiza test interactivos personalizados o simulacros reales del tribunal bajo control de tiempo.
          </p>
        </div>
      </div>

      {!isExamRunning && !examCompleted ? (
        // CONFIGURATION SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Main settings options */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                1. Selecciona Tipo de Examen
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="btn-et-official"
                  onClick={() => setExamType("official")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    examType === "official"
                      ? "bg-indigo-50/50 border-indigo-400 text-indigo-950 font-semibold"
                      : "bg-white border-gray-100 hover:border-gray-200 text-slate-700"
                  }`}
                >
                  <span className="block font-extrabold text-sm text-indigo-900 mb-1">
                    Exámenes Oficiales Resueltos
                  </span>
                  <span className="text-xs text-slate-500 font-normal leading-relaxed">
                    Preguntas reales formuladas por el tribunal oficial de años anteriores.
                  </span>
                </button>

                <button
                  id="btn-et-ai"
                  onClick={() => setExamType("ai")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    examType === "ai"
                      ? "bg-indigo-50/50 border-indigo-400 text-indigo-950 font-semibold"
                      : "bg-white border-gray-100 hover:border-gray-200 text-slate-700"
                  }`}
                >
                  <span className="block font-extrabold text-sm text-indigo-900 mb-1 flex items-center gap-1">
                    Generar Test Inteligente por IA
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                  <span className="text-xs text-slate-500 font-normal leading-relaxed">
                    Cuestionarios inéditos construidos por IA a partir de los bloques temáticos elegidos.
                  </span>
                </button>
              </div>
            </div>

            {examType === "official" ? (
              // Official parameters (Upgraded to multi-year & threshold baseline selection!)
              <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Filtrar por Rango / Año de Inicio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      id="btn-range-all"
                      onClick={() => setSelectedOfficialYears(opposition.officialExams.map(ex => ex.year))}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 cursor-pointer"
                    >
                      Todos los años
                    </button>
                    <button
                      type="button"
                      id="btn-range-2024"
                      onClick={() => handleApplyYearThreshold(2024)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-gray-200 cursor-pointer"
                    >
                      A partir de 2024
                    </button>
                    <button
                      type="button"
                      id="btn-range-2023"
                      onClick={() => handleApplyYearThreshold(2023)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-gray-200 cursor-pointer"
                    >
                      A partir de 2023
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Selecciona uno o más Años de Examen Oficial
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opposition.officialExams.map((ex) => {
                      const isChecked = selectedOfficialYears.includes(ex.year);
                      return (
                        <label
                          key={ex.year}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                            isChecked
                              ? "bg-white border-indigo-400 text-indigo-950 font-semibold shadow-xs"
                              : "bg-white/50 border-gray-200 hover:border-gray-300 text-slate-600"
                          }`}
                        >
                          <input
                            id={`check-official-year-${ex.year}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleYear(ex.year)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="block font-bold">Año {ex.year}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Ámbito {ex.location} • {ex.questionsCount} Preguntas completas
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // AI parameters
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Cantidad de Preguntas
                    </label>
                    <select
                      id="select-ai-questions"
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    >
                      <option value={5}>5 preguntas rápidas</option>
                      <option value={10}>10 preguntas de bloque</option>
                      <option value={20}>20 preguntas (Test completo)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Nivel de Dificultad
                    </label>
                    <select
                      id="select-ai-difficulty"
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    >
                      <option value="Fácil">Fácil (Asimilación básica)</option>
                      <option value="Medio">Medio (Exigencia real)</option>
                      <option value="Difícil">Difícil (Filtro extremo del tribunal)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                    Filtrar por Bloques del Temario
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150 max-h-32 overflow-y-auto">
                    {opposition.syllabus.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          id={`ai-exam-block-${b.id}`}
                          type="checkbox"
                          checked={aiSelectedBlocks.includes(b.id)}
                          onChange={() => handleToggleBlock(b.id)}
                          className="mt-0.5 rounded border-gray-300 text-indigo-600"
                        />
                        <span className="truncate">{b.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                2. Elige Modo de Evaluación
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="btn-tm-practica"
                  onClick={() => setTestMode("practica")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    testMode === "practica"
                      ? "bg-indigo-50/50 border-indigo-400 text-indigo-950 font-semibold"
                      : "bg-white border-gray-100 hover:border-gray-200 text-slate-700"
                  }`}
                >
                  <strong className="block text-slate-800 text-sm mb-1">
                    Modo Práctica (Sin tiempo)
                  </strong>
                  <span className="text-xs text-slate-500 font-normal leading-normal">
                    Recomendado para estudiar. Puedes navegar libremente y ver las explicaciones jurídicas.
                  </span>
                </button>

                <button
                  id="btn-tm-simulacro"
                  onClick={() => setTestMode("simulacro")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    testMode === "simulacro"
                      ? "bg-indigo-50/50 border-indigo-400 text-indigo-950 font-semibold"
                      : "bg-white border-gray-100 hover:border-gray-200 text-slate-700"
                  }`}
                >
                  <strong className="block text-slate-800 text-sm mb-1">
                    Modo Simulacro Real (Con tiempo)
                  </strong>
                  <span className="text-xs text-slate-500 font-normal leading-normal">
                    Recomendado antes del examen. Cronometrado, las soluciones se revelan al finalizar el test.
                  </span>
                </button>
              </div>
            </div>

            {generationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{generationError}</span>
              </div>
            )}

            <button
              id="btn-mg-launch-exam"
              onClick={handleStartExam}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isGenerating
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Fabricando test técnico por IA...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white" />
                  Iniciar Cuestionario Seleccionado
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-600" />
                Dinámica de los Tribunales
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Los exámenes tipo test restan puntuación en base a las respuestas incorrectas (típicamente -0.33 por error).
              </p>
              <p className="text-slate-600 leading-relaxed font-semibold">
                Nuestra plataforma replica este filtro psicológico para que aprendas a omitir respuestas si no estás 100% seguro durante un Simulacro.
              </p>
            </div>
          </div>
        </div>
      ) : isExamRunning ? (
        // ACTIVE EXAM SESSION
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">
                Evaluación en Curso ({testMode === "simulacro" ? "Simulacro" : "Modo Estudio"})
              </span>
              <h3 className="font-extrabold text-sm text-slate-800">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </h3>
            </div>

            {testMode === "simulacro" && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg text-amber-800 font-bold font-mono text-sm border border-amber-200">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            />
          </div>

          {/* Question text */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
              {questions[currentQuestionIndex].question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {questions[currentQuestionIndex].options.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;

              return (
                <button
                  key={oIdx}
                  id={`opt-btn-${oIdx}`}
                  onClick={() => handleSelectAnswer(oIdx)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-bold"
                      : "bg-white border-gray-150 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 border text-slate-600 flex items-center justify-center font-mono font-bold shrink-0">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="leading-normal">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigations inside exam */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <button
              id="btn-prev-question"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentQuestionIndex === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Anterior
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                id="btn-finish-test"
                onClick={handleCompleteExam}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
              >
                Finalizar Examen
              </button>
            ) : (
              <button
                id="btn-next-question"
                onClick={handleNextQuestion}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black shadow-sm cursor-pointer"
              >
                Siguiente Pregunta
              </button>
            )}
          </div>
        </div>
      ) : (
        // EXAM SUMMARY/REPORT SCREEN
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <Award className="w-12 h-12 text-indigo-600 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">¡Cuestionario Completado!</h3>
            <p className="text-xs text-slate-500">
              El informe de resultados se ha registrado localmente de forma privada en tu panel de control.
            </p>
          </div>

          {/* Scores details widgets */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-b border-gray-50 py-4 text-center">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Aciertos
              </span>
              <strong className="text-emerald-600 text-lg font-extrabold">
                {scoreMetrics.correct} / {questions.length}
              </strong>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Puntuación
              </span>
              <strong className="text-indigo-600 text-lg font-extrabold">{scoreMetrics.scorePercent}%</strong>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Resultado
              </span>
              <strong
                className={`text-lg font-extrabold ${
                  scoreMetrics.scorePercent >= 50 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {scoreMetrics.scorePercent >= 50 ? "APTO" : "NO APTO"}
              </strong>
            </div>
          </div>

          {/* Detailed answers list with rationales */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Revisión y Fundamentos Jurídicos
            </h4>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 space-y-3">
                    <div className="flex gap-2 items-start justify-between">
                      <span className="font-bold text-xs text-slate-800 leading-normal flex-1">
                        Pregunta {idx + 1}: {q.question}
                      </span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </div>

                    <div className="text-xs space-y-1 bg-white p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tu respuesta:</span>
                        <strong className={isCorrect ? "text-emerald-700" : "text-rose-700"}>
                          {userAns !== undefined ? q.options[userAns] : "Omitida"}
                        </strong>
                      </div>
                      {!isCorrect && (
                        <div className="flex justify-between pt-1 border-t border-dashed border-gray-100">
                          <span className="text-slate-500">Opción Correcta:</span>
                          <strong className="text-emerald-700">{q.options[q.correctIndex]}</strong>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/60 text-[11px] text-indigo-900 leading-relaxed">
                      <strong>Fundamento Legal:</strong> {q.justification}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            id="btn-restart-exam-config"
            onClick={() => {
              setExamCompleted(false);
              setIsExamRunning(false);
            }}
            className="w-full py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer text-center"
          >
            Volver a Configurar Examen
          </button>
        </div>
      )}
    </div>
  );
}
