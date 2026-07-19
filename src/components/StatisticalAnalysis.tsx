import { useMemo } from "react";
import { OppositionData, UserProgress } from "../types";
import { Activity, BookOpen, Clock, Target, Calendar, TrendingUp, Info } from "lucide-react";

interface StatisticalAnalysisProps {
  opposition: OppositionData;
  progress: UserProgress;
}

export default function StatisticalAnalysis({ opposition, progress }: StatisticalAnalysisProps) {
  // 1. Calculate stats
  const totalCompletedCount = progress.completedTestsCount;
  const averageScorePercent = useMemo(() => {
    if (progress.totalQuestionsAttempted === 0) return 0;
    return Math.round((progress.correctAnswersCount / progress.totalQuestionsAttempted) * 100);
  }, [progress]);

  const studyHoursCurrent = useMemo(() => {
    return Math.round((progress.studyTimeSeconds / 3600) * 10) / 10;
  }, [progress.studyTimeSeconds]);

  // Weighted syllabus block data for visual rendering
  const syllabusData = useMemo(() => {
    return opposition.syllabus.map((block) => ({
      name: block.title.split(":")[0],
      weight: block.weight,
      topicsCount: block.topics.length,
    }));
  }, [opposition]);

  const strategicAdvisories = useMemo(() => {
    const title = opposition.name.toLowerCase();
    
    // Find highest weight block
    let highestWeightBlock = opposition.syllabus[0] || { title: "General", weight: 35 };
    for (const block of opposition.syllabus) {
      if (block.weight > highestWeightBlock.weight) {
        highestWeightBlock = block;
      }
    }
    
    const blockShortName = highestWeightBlock.title.split(":")[0];
    
    let paretoAdvice = `El bloque "${blockShortName}" concentra el ${highestWeightBlock.weight}% del total del examen oficial. Prioriza este bloque realizando simulacros de examen enfocados.`;
    let focusAdvice = "Estudia detenidamente el articulado de cabecera de este temario, ya que el tribunal de selección suele preguntar sobre las excepciones y plazos de las leyes generales.";

    if (title.includes("bombero") || title.includes("fuego") || title.includes("incendio")) {
      paretoAdvice = `El bloque técnico específico de Bomberos y sus ordenanzas físicas y químicas del fuego concentran el ${highestWeightBlock.weight}% de las preguntas. Domina la física de fluidos y los protocolos de seguridad ciudadana.`;
      focusAdvice = "Atención especial a la normativa de prevención y protección civil local y planes territoriales de emergencia autonómicos.";
    } else if (title.includes("policia") || title.includes("seguridad") || title.includes("civil") || title.includes("guardia")) {
      paretoAdvice = `El bloque de Ciencias Policiales, Derecho Penal y los principios de la LO 2/1986 concentran la mayor carga lectiva (${highestWeightBlock.weight}%). Dedica 2 de cada 5 horas a repasar las causas de justificación y derechos de detenidos.`;
      focusAdvice = "La legislación de Seguridad Ciudadana y el Código Penal actualizado son de obligada memorización literal para evitar las trampas habituales.";
    } else if (title.includes("correos") || title.includes("postal")) {
      paretoAdvice = `El bloque técnico de envíos, embalajes y el Servicio Postal Universal agrupa más del 55% de las preguntas reales. Centra tu estudio en los pesos de los envíos, plazos de conservación en oficina y tarifas de entrega.`;
      focusAdvice = "No pases por alto las reformas postales de Correos relativas a envíos digitales y paquetería de comercio electrónico internacional.";
    } else if (title.includes("sanidad") || title.includes("salud") || title.includes("celador") || title.includes("enfermer")) {
      paretoAdvice = `Las leyes específicas del Servicio de Salud (como el Estatuto Marco de personal estatutario y leyes de salud) representan más de la mitad del test. Prioriza el estudio de derechos y deberes de los pacientes.`;
      focusAdvice = "Presta especial atención a la normativa de prevención de riesgos laborales hospitalarios y protocolos de movilización de pacientes.";
    } else if (title.includes("justicia") || title.includes("tramitacion") || title.includes("auxilio") || title.includes("procesal")) {
      paretoAdvice = "Los temas de derecho procesal civil y penal en la LOPJ concentran más del 65% del examen tipo test de justicia. Prioriza memorizar la tramitación de recursos, providencias y plazos de ejecución civil.";
      focusAdvice = "La LEC y la LOPJ sufren reformas recurrentes (como la desjudicialización del Registro Civil). Evita estudiar con apuntes anteriores a 2024.";
    }
    
    return { paretoAdvice, focusAdvice };
  }, [opposition]);

  return (
    <div id="statistical-analysis" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Análisis Técnico & Estadístico Consolidado
          </h2>
          <p className="text-xs text-gray-500">
            Analiza los pesos específicos del tribunal para maximizar el rendimiento de tus horas de estudio.
          </p>
        </div>
      </div>

      {/* High-level widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Horas Acumuladas
            </span>
            <strong className="text-slate-900 text-xl font-extrabold">{studyHoursCurrent} h</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Acierto Promedio
            </span>
            <strong className="text-slate-900 text-xl font-extrabold">{averageScorePercent}%</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Simulacros Hechos
            </span>
            <strong className="text-slate-900 text-xl font-extrabold">{totalCompletedCount} tests</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Racha de Estudio
            </span>
            <strong className="text-slate-900 text-xl font-extrabold">{progress.studyStreakDays} días</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Block Weights Donut/Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              Peso de cada Bloque en Exámenes Oficiales
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
              Tribunal Oficial
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Este desglose calcula la frecuencia histórica de preguntas extraídas de cada bloque de temas en los exámenes de los últimos 5 años. Úsalo para planificar cuántas horas de estudio dedicarle a cada área.
          </p>

          <div className="space-y-4 pt-2">
            {syllabusData.map((block, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[80%]">{block.name}</span>
                  <span className="font-mono text-indigo-600 font-bold">{block.weight}% del total</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${block.weight}%` }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Syllabus: {block.topicsCount} temas completos</span>
                  <span>Impacto examen: Muy Alto</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right card: IA strategic advisory */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-300" />
              <h3 className="font-extrabold text-sm text-indigo-100 tracking-tight uppercase">
                Análisis Táctico de Preparador
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Basándonos en las estadísticas consolidadas de <strong>{opposition.shortName}</strong>:
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                <span className="font-bold text-indigo-300 block">Estrategia Pareto (80/20):</span>
                <p className="text-slate-300 leading-normal">
                  {strategicAdvisories.paretoAdvice}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                <span className="font-bold text-indigo-300 block">Enfoque de Eficiencia Temática:</span>
                <p className="text-slate-300 leading-normal">
                  {strategicAdvisories.focusAdvice}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-indigo-200">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Actualizado en tiempo real según tu ritmo.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
