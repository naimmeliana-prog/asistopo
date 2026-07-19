import {
  BookOpen,
  Search,
  FileText,
  Activity,
  Award,
  Users,
  Cpu,
  Brain,
  HelpCircle,
  FileCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardIntroProps {
  onNavigate: (tab: string) => void;
  selectedOppositionName: string;
}

export default function DashboardIntro({
  onNavigate,
  selectedOppositionName,
}: DashboardIntroProps) {
  const features = [
    {
      id: "searcher",
      title: "Buscador de Oposiciones",
      description:
        "Filtra por provincia, comunidad autónoma, organismo emisor y estado de convocatoria mediante bases de datos legales abiertas.",
      icon: Search,
      color: "from-blue-50 to-indigo-50 hover:border-indigo-300 border-gray-100",
      iconColor: "text-indigo-600",
    },
    {
      id: "syllabus",
      title: "Temario & Interactividad",
      description:
        "Consulta el temario completo, leyes aplicables, plazos, requisitos de acceso y las cualidades que el tribunal espera de ti.",
      icon: BookOpen,
      color: "from-emerald-50 to-teal-50 hover:border-emerald-300 border-gray-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "cases",
      title: "Supuestos Prácticos",
      description:
        "Repositorio de casos prácticos reales y un generador inteligente por IA para resolver dilemas legales complejos.",
      icon: Cpu,
      color: "from-violet-50 to-purple-50 hover:border-violet-300 border-gray-100",
      iconColor: "text-violet-600",
    },
    {
      id: "material",
      title: "Material Completo & Descargable",
      description:
        "Combina temarios y exámenes oficiales resueltos para exportar un único documento de estudio exhaustivo en PDF o imprimir.",
      icon: FileText,
      color: "from-sky-50 to-blue-50 hover:border-sky-300 border-gray-100",
      iconColor: "text-sky-600",
    },
    {
      id: "stats",
      title: "Análisis Estadístico Global",
      description:
        "Métricas consolidadas de convocatorias pasadas que revelan el peso real de cada bloque en los exámenes oficiales.",
      icon: Activity,
      color: "from-pink-50 to-rose-50 hover:border-rose-300 border-gray-100",
      iconColor: "text-rose-600",
    },
    {
      id: "traps",
      title: "Trampas y Patrones de Examen",
      description:
        "Análisis profundo realizado por IA de las preguntas capciosas habituales y cómo detectarlas según el año escogido.",
      icon: Zap,
      color: "from-amber-50 to-yellow-50 hover:border-amber-300 border-gray-100",
      iconColor: "text-amber-600",
    },
    {
      id: "mnemonics",
      title: "Preguntas y Mnemotecnias",
      description:
        "Técnicas mnemotécnicas eficaces generadas por IA para conceptos difíciles con tasas de acierto inferiores al 10%.",
      icon: Brain,
      color: "from-orange-50 to-red-50 hover:border-orange-300 border-gray-100",
      iconColor: "text-orange-600",
    },
    {
      id: "exams",
      title: "Generador de Exámenes",
      description:
        "Configura test personalizados o simulacros cronometrados a partir de convocatorias oficiales o bancos inteligentes.",
      icon: FileCheck,
      color: "from-cyan-50 to-blue-50 hover:border-cyan-300 border-gray-100",
      iconColor: "text-cyan-600",
    },
    {
      id: "techniques",
      title: "Técnicas de Memorización",
      description:
        "Método Pomodoro, Ley de Pareto y Curva del Olvido integrados para maximizar la retención a largo plazo.",
      icon: Sparkles,
      color: "from-lime-50 to-emerald-50 hover:border-lime-300 border-gray-100",
      iconColor: "text-lime-600",
    },
    {
      id: "forum",
      title: "Foro Comunitario",
      description:
        "Temas de discusión general y específicos de cada grupo para compartir dudas sobre convocatorias oficiales y BOE.",
      icon: Users,
      color: "from-fuchsia-50 to-purple-50 hover:border-fuchsia-300 border-gray-100",
      iconColor: "text-fuchsia-600",
    },
    {
      id: "progress",
      title: "Logros y Progreso",
      description:
        "Gráficos de estudio interactivos, cálculo de racha diaria y medallas de logros desbloqueables en base a tu constancia.",
      icon: Award,
      color: "from-amber-50 to-orange-50 hover:border-amber-300 border-gray-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div id="dashboard-intro" className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Brain className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/30">
            Inteligencia Artificial & Privacidad Garantizada
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Preparación Inteligente y Offline-First
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Bienvenido a la versión mejorada y gratuita de la plataforma de preparación de oposiciones.
            Aquí cuentas con un sistema de inteligencia artificial que personaliza tus planes de estudio en tiempo real basándose en tu desempeño diario, respetando al máximo tu privacidad de datos de forma 100% anonimizada.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-700/60 text-sm">
              <span className="text-slate-400 block text-xs">Oposición Seleccionada</span>
              <strong className="text-indigo-200">{selectedOppositionName}</strong>
            </div>
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-700/60 text-sm">
              <span className="text-slate-400 block text-xs">Conformidad Legal</span>
              <strong className="text-emerald-300">RGPD y BOE Actualizado</strong>
            </div>
            <div className="bg-slate-800/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-700/60 text-sm">
              <span className="text-slate-400 block text-xs">Modo Local</span>
              <strong className="text-amber-300">Totalmente Autónomo</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Explorar Módulos de la Plataforma
          </h2>
          <span className="text-xs text-gray-500 font-mono">11 MÓDULOS DE ESTUDIO DISPONIBLES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={feat.id}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onNavigate(feat.id)}
                className={`group p-5 rounded-2xl border bg-gradient-to-br ${feat.color} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4`}
              >
                <div className={`p-3 rounded-xl bg-white shadow-xs group-hover:scale-110 transition-transform ${feat.iconColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Warning/Tip matching opposition context */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800 flex gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">¿Cómo funciona la personalización por IA?</p>
          <p className="text-xs leading-relaxed text-blue-700">
            A medida que realizas exámenes de prueba o indicas qué temas estás estudiando, nuestro tutor de Inteligencia Artificial calibra el nivel de dificultad de las preguntas, te advierte de las trampas legislativas comunes y asocia mnemotecnias en el bloque de estudio para acelerar la asimilación del contenido. Todo el contenido generado se puede descargar de forma integrada en el generador de documentos.
          </p>
        </div>
      </div>
    </div>
  );
}
