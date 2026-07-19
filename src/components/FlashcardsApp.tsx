import { useState, useMemo, useEffect } from "react";
import { Brain, Bookmark, Check, RefreshCw, Layers, Award, Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { OppositionData } from "../types";

interface Card {
  id: string;
  question: string;
  answer: string;
  box: number; // Leitner Box
}

interface FlashcardsAppProps {
  opposition: OppositionData | null;
}

export default function FlashcardsApp({ opposition }: FlashcardsAppProps) {
  const [cards, setCards] = useState<Card[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const list: Card[] = [];
    if (opposition) {
      let fcIndex = 1;
      
      // 1. From official exams
      if (opposition.officialExams) {
        opposition.officialExams.forEach((exam) => {
          if (exam.questions) {
            exam.questions.forEach((q) => {
              list.push({
                id: `fc-exam-${fcIndex++}`,
                question: q.question,
                answer: `Opción Correcta: "${q.options[q.correctIndex]}". Fundamento Legal: ${q.justification}`,
                box: 1,
              });
            });
          }
        });
      }

      // 2. From practical cases
      if (opposition.practicalCases) {
        opposition.practicalCases.forEach((pc) => {
          if (pc.questions) {
            pc.questions.forEach((q) => {
              list.push({
                id: `fc-case-${fcIndex++}`,
                question: `[Supuesto Práctico] ${q.question}`,
                answer: `Fundamento legal: ${q.legalBase}. Solución: ${q.solution}`,
                box: 1,
              });
            });
          }
        });
      }

      // 3. From syllabus topics
      if (opposition.syllabus) {
        opposition.syllabus.forEach((block) => {
          if (block.topics) {
            block.topics.forEach((topic) => {
              list.push({
                id: `fc-topic-${fcIndex++}`,
                question: `¿Qué disposiciones o materias regula el tema de estudio "${topic.title}"?`,
                answer: `Regulado principalmente en: ${topic.articles ? topic.articles.join(", ") : "normas generales"}. Síntesis: ${topic.content || ""}`,
                box: 1,
              });
            });
          }
        });
      }
    }

    if (list.length === 0) {
      setCards([
        {
          id: "fc-1",
          question: "¿Cuál es el plazo máximo general de que dispone la Administración para dictar y notificar resolución expresa en un procedimiento administrativo común?",
          answer: "3 meses, salvo que una norma con rango de ley o del Derecho de la Unión Europea establezca otro mayor (Art. 21.3 Ley 39/2015).",
          box: 1,
        },
        {
          id: "fc-2",
          question: "¿A partir de qué edad puede un ciudadano español presentarse válidamente como opositor a los Cuerpos Generales de Justicia?",
          answer: "16 años cumplidos, y no exceder de la edad máxima de jubilación forzosa (Art. 475 LOPJ).",
          box: 1,
        },
        {
          id: "fc-3",
          question: "¿Qué mayoría se requiere en el Congreso de los Diputados para la aprobación, modificación o derogación de una Ley Orgánica?",
          answer: "Mayoría absoluta de los miembros del Congreso, en una votación final sobre el conjunto del proyecto (Art. 81.2 Constitución Española).",
          box: 2,
        },
        {
          id: "fc-4",
          question: "¿Qué efecto tiene el silencio administrativo en los procedimientos iniciados a solicitud del interesado por regla general?",
          answer: "Regla general: Silencio positivo (estimatorio), salvo excepciones expresas en leyes estatales, Derecho de la UE o procedimientos de ejercicio de actividades de interés público (Art. 24 Ley 39/2015).",
          box: 1,
        },
      ]);
    } else {
      setCards(list);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [opposition]);

  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleSelfEvaluate = (cardId: string, level: "easy" | "hard") => {
    if (cards.length === 0) return;
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const newBox = level === "easy" ? Math.min(c.box + 1, 5) : Math.max(c.box - 1, 1);
          return { ...c, box: newBox };
        }
        return c;
      })
    );
    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const activeCard = cards[currentIndex];

  // Calculate box counts for a summary view
  const boxCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cards.forEach((c) => {
      counts[c.box as 1 | 2 | 3 | 4 | 5]++;
    });
    return counts;
  }, [cards]);

  if (cards.length === 0 || !activeCard) {
    return (
      <div id="flashcards-app" className="space-y-6 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Iniciando tarjetas de estudio personalizadas...</p>
      </div>
    );
  }

  return (
    <div id="flashcards-app" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Tarjetas de Repaso Activo (Flashcards)
          </h2>
          <p className="text-xs text-gray-500">
            Utiliza el sistema de cajas Leitner para repasar conceptos críticos basándote en tu propia autoevaluación.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Box Leitner overview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 block">
              Algoritmo Leitner (Estado de Cajas)
            </span>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((boxNum) => (
                <div key={boxNum} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                  <span className="text-slate-600">Caja {boxNum} ({boxNum === 1 ? "Repaso Diario" : `Repaso c/ ${boxNum * 2} d.`})</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {boxCounts[boxNum as 1 | 2 | 3 | 4 | 5]} tarjetas
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl text-[11px] leading-relaxed">
              <strong>Consejo de Memorización:</strong> Las tarjetas autoevaluadas como "Fáciles" ascienden a la siguiente caja y se repasan con menor frecuencia, optimizando tu tiempo.
            </div>
          </div>
        </div>

        {/* Dynamic flipping card */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-lg">
            <div
              id="flashcard-flipping-container"
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-64 cursor-pointer select-none relative [perspective:1000px]"
            >
              <div
                className={`w-full h-full duration-500 [transform-style:preserve-3d] relative rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all border-2 ${
                  isFlipped
                    ? "bg-indigo-950 text-white border-amber-400/80 [transform:rotateY(180deg)] shadow-indigo-950/20"
                    : "bg-white text-slate-800 border-indigo-600/80 hover:border-indigo-600 shadow-slate-200"
                }`}
              >
                {/* Front face */}
                <div className={`w-full h-full flex flex-col justify-between [backface-visibility:hidden] ${isFlipped ? "hidden" : "block"}`}>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" />
                      Pregunta de Oposición Oficial
                    </span>
                    <span className="bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider border border-indigo-200">
                      Caja Leitner {activeCard.box}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold leading-relaxed text-slate-900 text-center py-4 px-2 select-text font-sans">
                    {activeCard.question}
                  </p>
                  <div className="text-center pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      Revelar Fundamento Legal
                    </span>
                  </div>
                </div>

                {/* Back face */}
                <div className={`w-full h-full flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${isFlipped ? "block" : "hidden"}`}>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      Fundamento Jurídico Consolidado
                    </span>
                    <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider border border-amber-400/30">
                      Articulado Oficial ✓
                    </span>
                  </div>
                  <div className="py-4 px-2 text-center flex-1 flex items-center justify-center">
                    <p className="text-xs sm:text-sm leading-relaxed font-serif italic text-amber-50">
                      {activeCard.answer}
                    </p>
                  </div>
                  <div className="text-center pt-2 border-t border-indigo-800/50">
                    <span className="text-[10px] text-indigo-200 font-medium">
                      (Haz clic para volver a ver el supuesto práctico)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Self evaluation triggers */}
          <div className="w-full max-w-lg flex justify-between items-center gap-3">
            <button
              id="btn-fc-prev"
              onClick={handlePrev}
              className="p-2 border border-gray-200 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {isFlipped ? (
              <div className="flex gap-2 animate-fade-in">
                <button
                  id="btn-fc-hard"
                  onClick={() => handleSelfEvaluate(activeCard.id, "hard")}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-sm cursor-pointer"
                >
                  No me la sabía (Caja {Math.max(activeCard.box - 1, 1)})
                </button>
                <button
                  id="btn-fc-easy"
                  onClick={() => handleSelfEvaluate(activeCard.id, "easy")}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  ¡Me la sabía! (Caja {Math.min(activeCard.box + 1, 5)})
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium italic">
                Rote la tarjeta para calificar su asimilación.
              </span>
            )}

            <button
              id="btn-fc-next"
              onClick={handleNext}
              className="p-2 border border-gray-200 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
