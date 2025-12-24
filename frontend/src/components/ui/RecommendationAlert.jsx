import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

const RecommendationAlert = ({ topic, onActivate }) => {
  return (
    <div className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm md:text-base">
            Refuerzo Recomendado Detectado
          </h4>
          <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200/70">
            Detectamos dificultades recurrentes en <strong>{topic}</strong>.
          </p>
        </div>
      </div>

      <button
        onClick={onActivate}
        className="px-4 py-2 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
      >
        Iniciar Repaso
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default RecommendationAlert;
