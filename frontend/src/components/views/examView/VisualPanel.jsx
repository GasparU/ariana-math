import React, { useState } from "react";
import MathGraph from "../../components/features/exam/MathGraph";
import SVGCanvas from "../../components/features/exam/SVGCanvas";
import { Lightbulb } from "lucide-react";

const VisualPanel = ({
  isVisualSubject,
  question,
  userAnswer,
  isReviewMode,
}) => {
  const [showSolution, setShowSolution] = useState(false);

  // Detección de gráficos
  const hasGeometryData =
    question.graph_data &&
    question.graph_data.elements &&
    question.graph_data.elements.length > 0;

  const svgCode = question.svgCode || question.graph_data?.svg;
  const hasSVG = svgCode && svgCode.length > 20;

  return (
    // 1. CONTENEDOR PRINCIPAL: Vuelve a ser OSCURO en modo dark (bg-white dark:bg-slate-800)
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
      {/* 2. ZONA DE LIENZO (El hueco para el gráfico) */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {hasGeometryData || hasSVG ? (
          // 3. EL LIENZO BLANCO (Solo esto es blanco)
          <div className="w-full h-full bg-white rounded-xl border-2 border-slate-200 shadow-inner flex items-center justify-center overflow-hidden p-2">
            {hasGeometryData ? (
              <MathGraph graphData={question.graph_data} />
            ) : (
              <SVGCanvas svgCode={svgCode} />
            )}
          </div>
        ) : (
          // Caso Texto: Se adapta al modo oscuro
          <div className="text-slate-400 text-sm italic p-10 text-center flex flex-col gap-2">
            <span className="opacity-50 text-4xl">📐</span>
            <span className="dark:text-slate-300">
              {isVisualSubject
                ? "Analiza el enunciado para resolver."
                : "Pregunta teórica."}
            </span>
          </div>
        )}
      </div>

      {/* 4. SOLUCIONARIO (Ajustado para no ocupar tanto espacio) */}
      {(isReviewMode || userAnswer) && question.solution_text && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-900/50 p-3 max-h-[150px] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:underline mb-2"
          >
            <Lightbulb size={14} />
            {showSolution ? "Ocultar Solución" : "Ver Explicación"}
          </button>

          {showSolution && (
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white/50 dark:bg-black/20 p-2 rounded border border-amber-100 dark:border-slate-700">
              {question.solution_text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualPanel;
