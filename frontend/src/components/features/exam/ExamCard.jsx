import React, {  useRef } from "react";
import { CheckCircle2, XCircle, Lightbulb, BookOpen } from "lucide-react";
import MathText from "../../common/MathText";


const ExamCard = ({
  question,
  selectedOption,
  onOptionSelect,
  isReviewMode,
  onNext,
}) => {
  const scrollContainerRef = useRef(null);



  if (!question) return <div>Cargando...</div>;

  // Buscamos el texto de la pregunta
  const displayTitle =
    question.question ||
    question.text ||
    question.question_text ||
    question.questionContent ||
    "Sin enunciado";

  const rawSolution =
    question.solution_text ||
    question.explanation ||
    question.explanation_text ||
    "";

  const displaySolution = String(rawSolution)
    .replace(/\\n/g, "\n")
    .replace(/\.\n/g, "\n")
    .trim();

  const options = Array.isArray(question.answerOptions)
    ? question.answerOptions
    : Array.isArray(question.options)
    ? question.options
    : [];

  const isTheoryCard = options.length <= 1;

  return (
    // CAMBIO 1: Aumentamos altura mínima a 600px para dar aire a la explicación y la opción E
    <div className="flex flex-col w-full h-full  bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* --- A. ENCABEZADO --- */}
      <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed">
          <MathText content={displayTitle} />
        </div>
      </div>

      {/* --- B. CUERPO (LAS ALTERNATIVAS) --- */}
      {/* Flex-1 permite que esta zona crezca y tenga scroll si son muchas opciones */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pt-5 ">
        {isTheoryCard ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3 text-center opacity-80">
            <BookOpen size={40} className="text-indigo-400" />
            <p className="text-slate-600 font-medium text-sm">
              Concepto Teórico
            </p>
            <button
              onClick={onNext}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {" "}
            {/* Padding bottom extra para que la última opción respire */}
            {options.map((option, index) => {
              // ... (Lógica de corrección igual que antes) ...
              let isReallyCorrect = false;
              let optionText = "";
              if (typeof option === "object" && option !== null) {
                optionText = option.text || "";
                isReallyCorrect = option.isCorrect === true;
              } else {
                optionText = String(option);
                const correctStr = question.correct_answer || "";
                isReallyCorrect = correctStr.includes(optionText);
              }
              const isSelected =
                selectedOption === optionText || selectedOption === option;
              const letter = String.fromCharCode(65 + index);

              let containerClass =
                "relative w-full flex items-center p-3 rounded-lg border-2 text-left transition-all duration-200 group ";
              let bubbleClass =
                "flex-none w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-3 border ";

              if (isReviewMode) {
                if (isReallyCorrect) {
                  containerClass +=
                    "bg-emerald-50 border-emerald-500 z-10 shadow-sm";
                  bubbleClass += "bg-emerald-500 text-white border-emerald-600";
                } else if (isSelected && !isReallyCorrect) {
                  containerClass += "bg-red-50 border-red-400";
                  bubbleClass += "bg-red-500 text-white border-red-600";
                } else {
                  containerClass += "bg-white border-slate-200 text-slate-700";
                  bubbleClass += "bg-slate-100 text-slate-500 border-slate-200";
                }
              } else {
                if (isSelected) {
                  containerClass +=
                    "bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500";
                  bubbleClass += "bg-indigo-600 text-white border-indigo-700";
                } else {
                  containerClass +=
                    "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                  bubbleClass += "bg-slate-100 text-slate-500 border-slate-200";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !isReviewMode && onOptionSelect(option)}
                  disabled={isReviewMode}
                  className={containerClass}
                >
                  <div className={bubbleClass}>{letter}</div>
                  <div
                    className={`flex-1 font-medium text-sm ${
                      isReviewMode && !isReallyCorrect
                        ? "text-slate-600"
                        : "text-slate-900"
                    }`}
                  >
                    {/* HACK INFINITO + LATEX */}
                    <MathText
                      content={optionText
                        .replace(/infty/g, "\\infty")
                        .replace(/\\+infty/g, "\\infty")
                        .replace(/cup/g, "\\cup")
                        .replace(/cap/g, "\\cap")
                        .replace(/\\s+cup\\s+/g, " \\cup ")
                        .replace(/\\s+cap\\s+/g, " \\cap ")}
                    />
                  </div>
                  {isReviewMode && isReallyCorrect && (
                    <CheckCircle2 className="text-emerald-600 ml-2" size={18} />
                  )}
                  {isReviewMode && isSelected && !isReallyCorrect && (
                    <XCircle className="text-red-500 ml-2" size={18} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- C. SOLUCIONARIO --- */}
      {/* shrink-0 evita que se aplaste */}
      {isReviewMode && displaySolution && (
        <div
          ref={scrollContainerRef}
          className="bg-amber-50/80 p-4 border-t border-amber-200 text-xs shrink-0"
        >
          <div className="flex gap-2 items-start">
            <Lightbulb size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-slate-800 leading-snug whitespace-pre-line">
              <span className="font-bold text-amber-800 uppercase tracking-wider mr-1">
                Explicación:
              </span>
              <MathText content={displaySolution} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCard;
