import React from "react";

const ProgressBar = ({ current, total }) => {
  // Calculamos el porcentaje de avance
  const progressPercentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full max-w-md flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span>Progreso de Misión</span>
        <span>{progressPercentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 dark:bg-cyan-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
