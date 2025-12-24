import React from "react";
import { ChevronRight } from "lucide-react";
import ExamCard from "../../features/exam/ExamCard";

const InteractionPanel = ({
  isVisualSubject,
  questions, // Array de preguntas activas (1 o 2)
  currentIndex,
  userAnswers,
  onOptionSelect,
  isReviewMode,
  isAlreadyCompleted,
  isLastPage,
  onNext,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
      {/* ZONA SCROLLABLE DE PREGUNTAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
        {isVisualSubject ? (
          // CASO VISUAL: Pregunta 1 va a la derecha
          <>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Pregunta {currentIndex + 1}
            </div>
            <ExamCard
              question={questions[0]}
              selectedOption={userAnswers[questions[0].id]}
              onOptionSelect={(optId) => onOptionSelect(questions[0].id, optId)}
              isReviewMode={isReviewMode || isAlreadyCompleted}
            />
          </>
        ) : (
          // CASO TEXTO: Pregunta 2 va a la derecha (si existe)
          questions[1] && (
            <>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
                Pregunta {currentIndex + 2}
              </div>
              <ExamCard
                question={questions[1]}
                selectedOption={userAnswers[questions[1].id]}
                onOptionSelect={(optId) =>
                  onOptionSelect(questions[1].id, optId)
                }
                isReviewMode={isReviewMode || isAlreadyCompleted}
              />
            </>
          )
        )}
        <div className="h-4"></div>
      </div>

      {/* BOTÓN INFERIOR FIJO */}
      <div className="p-3 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-700 z-20 shrink-0">
        <button
          onClick={onNext}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 uppercase tracking-widest text-sm"
        >
          <span>
            {isReviewMode || isAlreadyCompleted
              ? isLastPage
                ? "VOLVER A BITÁCORA"
                : "SIGUIENTE"
              : isLastPage
              ? "FINALIZAR MISIÓN"
              : "SIGUIENTE"}
          </span>
          <ChevronRight strokeWidth={3} size={16} />
        </button>
      </div>
    </div>
  );
};

export default InteractionPanel;
