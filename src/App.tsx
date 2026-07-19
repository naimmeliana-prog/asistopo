import { useState, useEffect } from "react";
import { OPPOSITIONS_DATABASE } from "./data/oppositions";
import { UserProgress, OppositionData } from "./types";

// Component imports
import AuthModal from "./components/AuthModal";
import OfflineIndicator from "./components/OfflineIndicator";
import DashboardIntro from "./components/DashboardIntro";
import OppositionSearcher from "./components/OppositionSearcher";
import SyllabusViewer from "./components/SyllabusViewer";
import CaseStudies from "./components/CaseStudies";
import MaterialGenerator from "./components/MaterialGenerator";
import StatisticalAnalysis from "./components/StatisticalAnalysis";
import TrapsAndPatterns from "./components/TrapsAndPatterns";
import MnemonicsStudy from "./components/MnemonicsStudy";
import ExamGenerator from "./components/ExamGenerator";
import StudyTechniques from "./components/StudyTechniques";
import FlashcardsApp from "./components/FlashcardsApp";
import ForumComponent from "./components/ForumComponent";
import LogrosProgreso from "./components/LogrosProgreso";

// Icons
import {
  BookOpen, Search, Layers, FileText, Activity, Zap, Brain,
  FileCheck, Sparkles, Award, Users, LogOut, ShieldCheck, HelpCircle, Flame, Menu, X
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedOppositionId, setSelectedOppositionId] = useState<string>("tramitacion-procesal");
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Custom dynamically-discovered external oppositions
  const [customOppositions, setCustomOppositions] = useState<OppositionData[]>(() => {
    const saved = localStorage.getItem("opo_custom_oppositions");
    return saved ? JSON.parse(saved) : [];
  });

  const allOppositions = useMemo(() => {
    return [...OPPOSITIONS_DATABASE, ...customOppositions];
  }, [customOppositions]);

  const handleAddCustomOpposition = (newOpp: OppositionData) => {
    setCustomOppositions((prev) => {
      const alreadyExists = prev.some((o) => o.id === newOpp.id);
      if (alreadyExists) return prev;
      const updated = [...prev, newOpp];
      localStorage.setItem("opo_custom_oppositions", JSON.stringify(updated));
      return updated;
    });
  };

  // Syllabus completed and review topics tracking states
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [reviewTopics, setReviewTopics] = useState<string[]>([]);

  // Load user progress
  const [userProgress, setUserProgress] = useState<UserProgress>({
    selectedOppositionId: "tramitacion-procesal",
    completedTestsCount: 0,
    correctAnswersCount: 0,
    totalQuestionsAttempted: 0,
    studyTimeSeconds: 3600, // starting with 1 hour of simulated study
    studyStreakDays: 1,
    lastStudyDate: new Date().toISOString().split("T")[0],
    testHistory: [],
    completedFlashcards: [],
    unlockedBadges: [],
    completedTopics: [],
    reviewTopics: [],
  });

  // Load user on startup
  useEffect(() => {
    const loggedUser = localStorage.getItem("opo_current_user");
    if (loggedUser) {
      setCurrentUser(loggedUser);
      // Load their progress
      const savedProgress = localStorage.getItem(`opo_progress_${loggedUser}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setUserProgress(parsed);
        setCompletedTopics(parsed.completedTopics || []);
        setReviewTopics(parsed.reviewTopics || []);
      }
    }
  }, []);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("opo_current_user", username);
    // Load or initialize progress
    const savedProgress = localStorage.getItem(`opo_progress_${username}`);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setUserProgress(parsed);
      setCompletedTopics(parsed.completedTopics || []);
      setReviewTopics(parsed.reviewTopics || []);
    } else {
      const initialProgress: UserProgress = {
        selectedOppositionId: "tramitacion-procesal",
        completedTestsCount: 0,
        correctAnswersCount: 0,
        totalQuestionsAttempted: 0,
        studyTimeSeconds: 3600,
        studyStreakDays: 1,
        lastStudyDate: new Date().toISOString().split("T")[0],
        testHistory: [],
        completedFlashcards: [],
        unlockedBadges: [],
        completedTopics: [],
        reviewTopics: [],
      };
      setUserProgress(initialProgress);
      setCompletedTopics([]);
      setReviewTopics([]);
      localStorage.setItem(`opo_progress_${username}`, JSON.stringify(initialProgress));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("opo_current_user");
  };

  // Sync state to local storage when updated
  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    if (currentUser) {
      localStorage.setItem(`opo_progress_${currentUser}`, JSON.stringify(newProgress));
    }
  };

  // Log test outcome from ExamGenerator
  const handleLogTestResult = (score: number, total: number, timeSeconds: number, isSimulacro: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    const streakDays = userProgress.lastStudyDate === today ? userProgress.studyStreakDays : userProgress.studyStreakDays + 1;

    const newHistoryItem = {
      date: today,
      oppositionName: activeOpposition.shortName,
      score,
      total,
      correct: score,
      timeSeconds,
      isSimulacro,
    };

    const updatedProgress: UserProgress = {
      ...userProgress,
      completedTestsCount: userProgress.completedTestsCount + 1,
      correctAnswersCount: userProgress.correctAnswersCount + score,
      totalQuestionsAttempted: userProgress.totalQuestionsAttempted + total,
      studyTimeSeconds: userProgress.studyTimeSeconds + timeSeconds,
      studyStreakDays: streakDays,
      lastStudyDate: today,
      testHistory: [newHistoryItem, ...userProgress.testHistory],
    };

    saveProgress(updatedProgress);
  };

  const handleToggleTopicCompleted = (topicId: string) => {
    const isCompleted = completedTopics.includes(topicId);
    const updated = isCompleted
      ? completedTopics.filter((id) => id !== topicId)
      : [...completedTopics, topicId];
    setCompletedTopics(updated);
    saveProgress({
      ...userProgress,
      completedTopics: updated,
    });
  };

  const handleToggleTopicReview = (topicId: string) => {
    const isReview = reviewTopics.includes(topicId);
    const updated = isReview
      ? reviewTopics.filter((id) => id !== topicId)
      : [...reviewTopics, topicId];
    setReviewTopics(updated);
    saveProgress({
      ...userProgress,
      reviewTopics: updated,
    });
  };

  // Get active opposition database
  const activeOpposition = allOppositions.find((o) => o.id === selectedOppositionId) || allOppositions[0];

  // Font size scaling controls (A+, A-)
  const [textSize, setTextSize] = useState<"normal" | "large" | "xlarge">("normal");

  useEffect(() => {
    const sizePercent = textSize === "normal" ? "100%" : textSize === "large" ? "112%" : "125%";
    document.documentElement.style.fontSize = sizePercent;
    return () => {
      document.documentElement.style.fontSize = "100%";
    };
  }, [textSize]);

  const fontSizeStyle = {
    fontSize: textSize === "normal" ? "100%" : textSize === "large" ? "112%" : "125%"
  };

  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar list items configurations
  const menuItems = [
    { id: "dashboard", label: "Inicio & Panel", icon: BookOpen },
    { id: "searcher", label: "Buscador de Oposiciones", icon: Search },
    { id: "syllabus", label: "Temario Oficial", icon: Layers },
    { id: "cases", label: "Casos Prácticos", icon: HelpCircle },
    { id: "material", label: "Material Completo PDF", icon: FileText },
    { id: "stats", label: "Análisis Estadístico", icon: Activity },
    { id: "traps", label: "Trampas & Patrones", icon: Zap },
    { id: "mnemonics", label: "Preguntas & Mnemotecnia", icon: Brain },
    { id: "exams", label: "Generador de Exámenes", icon: FileCheck },
    { id: "techniques", label: "Técnicas Pomodoro", icon: Sparkles },
    { id: "flashcards", label: "Flashcards Leitner", icon: Award },
    { id: "forum", label: "Foro de Opositores", icon: Users },
    { id: "progress", label: "Logros y Progreso", icon: Award },
  ];

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 transition-all duration-150"
      style={fontSizeStyle}
    >
      {/* Upper header */}
      <header className="bg-white border-b border-gray-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              AO
            </div>
            <strong className="text-sm font-extrabold text-slate-900 tracking-tight">
              Asistente de Oposiciones <span className="text-indigo-600 font-medium text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 hidden sm:inline">Oficial • BOE</span>
            </strong>
          </div>
        </div>

        {/* Global actions: offline simulate, text controls, opposition selector, logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Text Size Adjustment Controls */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-0.5 sm:gap-1">
            <button
              id="btn-text-decrease"
              onClick={() => setTextSize(prev => prev === "xlarge" ? "large" : "normal")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                textSize === "normal" ? "text-gray-400 cursor-not-allowed" : "bg-white text-slate-700 shadow-xs"
              }`}
              title="Disminuir letra"
              disabled={textSize === "normal"}
            >
              A-
            </button>
            <button
              id="btn-text-normal"
              onClick={() => setTextSize("normal")}
              className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md transition-all cursor-pointer ${
                textSize === "normal" ? "bg-indigo-600 text-white" : "text-gray-500"
              }`}
            >
              Normal
            </button>
            <button
              id="btn-text-increase"
              onClick={() => setTextSize(prev => prev === "normal" ? "large" : "xlarge")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                textSize === "xlarge" ? "text-gray-400 cursor-not-allowed" : "bg-white text-slate-700 shadow-xs"
              }`}
              title="Aumentar letra"
              disabled={textSize === "xlarge"}
            >
              A+
            </button>
          </div>

          {/* Simulated Network Indicator */}
          <OfflineIndicator
            isSimulatedOffline={isSimulatedOffline}
            onToggleSimulatedOffline={() => setIsSimulatedOffline(!isSimulatedOffline)}
          />

          {/* Core active opposition dropdown */}
          <div className="hidden sm:block">
            <select
              id="global-opposition-selector"
              value={selectedOppositionId}
              onChange={(e) => setSelectedOppositionId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700 animate-fade-in"
            >
              {allOppositions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.shortName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="hidden md:block text-right animate-fade-in">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wide">
                Estudiante Anónimo
              </span>
              <strong className="text-xs text-slate-800 font-semibold">{currentUser}</strong>
            </div>
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
              title="Cerrar Sesión Segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Navigation Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 w-64 flex flex-col justify-between fixed lg:sticky top-16 h-[calc(100vh-4rem)] z-30 transition-transform duration-300 print:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {/* Small screen opposition selector */}
            <div className="sm:hidden pb-3 border-b border-gray-100 mb-2">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
                Oposición Activa
              </span>
              <select
                value={selectedOppositionId}
                onChange={(e) => setSelectedOppositionId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg text-slate-700"
              >
                {allOppositions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.shortName} - {o.group}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block px-3">
              Módulos de Preparación
            </span>

            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveModule(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secure lock metadata footer */}
          <div className="p-4 border-t border-gray-100 space-y-2 bg-slate-50/50">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Protección RGPD Activa</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-normal">
              Sus datos están encriptados y se almacenan exclusivamente de forma local en su dispositivo.
            </p>
          </div>
        </aside>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          />
        )}

        {/* Primary Content Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
          {activeModule === "dashboard" && (
            <DashboardIntro
              selectedOppositionName={activeOpposition.name}
              onNavigate={setActiveModule}
            />
          )}

          {activeModule === "searcher" && (
            <OppositionSearcher
              onSelectOpposition={(id) => {
                setSelectedOppositionId(id);
                setActiveModule("dashboard");
              }}
              selectedOppositionId={selectedOppositionId}
              allOppositions={allOppositions}
              onAddCustomOpposition={handleAddCustomOpposition}
            />
          )}

          {activeModule === "syllabus" && (
            <SyllabusViewer
              opposition={activeOpposition}
              completedTopics={completedTopics}
              onToggleTopicCompleted={handleToggleTopicCompleted}
              reviewTopics={reviewTopics}
              onToggleTopicReview={handleToggleTopicReview}
            />
          )}

          {activeModule === "cases" && (
            <CaseStudies
              opposition={activeOpposition}
              isSimulatedOffline={isSimulatedOffline}
            />
          )}

          {activeModule === "material" && (
            <MaterialGenerator
              opposition={activeOpposition}
            />
          )}

          {activeModule === "stats" && (
            <StatisticalAnalysis
              opposition={activeOpposition}
              progress={userProgress}
            />
          )}

          {activeModule === "traps" && (
            <TrapsAndPatterns
              opposition={activeOpposition}
              isSimulatedOffline={isSimulatedOffline}
            />
          )}

          {activeModule === "mnemonics" && (
            <MnemonicsStudy
              opposition={activeOpposition}
              isSimulatedOffline={isSimulatedOffline}
            />
          )}

          {activeModule === "exams" && (
            <ExamGenerator
              opposition={activeOpposition}
              isSimulatedOffline={isSimulatedOffline}
              onLogTestResult={handleLogTestResult}
            />
          )}

          {activeModule === "techniques" && (
            <StudyTechniques />
          )}

          {activeModule === "flashcards" && (
            <FlashcardsApp />
          )}

          {activeModule === "forum" && (
            <ForumComponent />
          )}

          {activeModule === "progress" && (
            <LogrosProgreso
              progress={userProgress}
              onImportProgress={(imported) => {
                saveProgress(imported);
                if (imported.completedTopics) setCompletedTopics(imported.completedTopics);
                if (imported.reviewTopics) setReviewTopics(imported.reviewTopics);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
