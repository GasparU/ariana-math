import React from "react";
import { Target, Clock, Brain, Sparkles, Loader2, Layers } from "lucide-react";

// Componente auxiliar para filas de resumen
const SummaryRow = ({ label, value, color = "dark:text-white" }) => (
  <div className="flex justify-between text-xs items-center">
    <span className="text-slate-500 font-medium">{label}:</span>
    <span className={`font-bold uppercase ${color}`}>{value}</span>
  </div>
);

export const SummaryPanel = ({ values, onGenerate, isLoading }) => {
  const { numQuestions, timeLimit, aiModel, difficulty, course, examStage } =
    values;

  // Helpers para mostrar nombres amigables
  const getDifficultyName = (dif) => {
    const map = {
      easy: "Básico",
      medium: "Medio",
      hard: "Alto",
      progressive: "Progresivo",
      olympic: "Olímpico",
    };
    return map[dif] || dif;
  };

  const getModelName = (model) => {
    if (model.includes("gemini")) return "Google Gemini";
    if (model.includes("gpt")) return "OpenAI GPT-4";
    if (model.includes("deepseek")) return "DeepSeek";
    return model;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center space-x-3 mb-5 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
          <Target size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">
            Resumen de Misión
          </h3>
          <p className="text-xs text-slate-500">Parámetros seleccionados</p>
        </div>
      </div>

      {/* METRICAS */}
      <div className="space-y-3 flex-1">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
          <SummaryRow
            label="Materia"
            value={course}
            color="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryRow label="Cantidad" value={`${numQuestions} Preguntas`} />
          <SummaryRow label="Tiempo" value={`${timeLimit} Minutos`} />
          <SummaryRow
            label="Nivel"
            value={getDifficultyName(difficulty)}
            color="text-emerald-500"
          />
          <SummaryRow label="Motor IA" value={getModelName(aiModel)} />
          {difficulty === "olympic" && (
            <SummaryRow label="Fase" value={examStage} color="text-amber-500" />
          )}
        </div>
      </div>

      {/* BOTÓN GENERAR (Sintaxis arreglada) */}
      <div className="mt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-md ${
            isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Ejecutar Misión
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-3">
          La IA diseñará ejercicios únicos basados en estos parámetros.
        </p>
      </div>
    </div>
  );
};
