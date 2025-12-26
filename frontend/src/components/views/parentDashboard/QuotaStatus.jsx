import React from "react";

const QuotaStatus = ({ stats, isAdmin }) => {
  if (isAdmin)
    return (
      <div className="bg-amber-50 border border-amber-200 p-2 rounded-md mb-4 text-center">
        <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
          👑 Modo Administrador: Acceso Ilimitado
        </span>
      </div>
    );

  return (
    <div>
      <p className="text-[12px] text-slate-600 mt-2 leading-tight italic pb-2">
        * Los créditos se consumen al generar una vista previa. Gemini Pro
        ofrece mayor precisión pedagógica.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Cuota Gemini */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
            <span>Gemini Pro</span>
            <span
              className={
                stats.geminiRemaining === 0 ? "text-red-500" : "text-indigo-600"
              }
            >
              {stats.geminiRemaining} / 4
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-1000"
              style={{ width: `${(stats.geminiRemaining / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Cuota DeepSeek */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
            <span>DeepSeek</span>
            <span
              className={
                stats.deepseekRemaining === 0
                  ? "text-red-500"
                  : "text-emerald-600"
              }
            >
              {stats.deepseekRemaining} / 10
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-1000"
              style={{ width: `${(stats.deepseekRemaining / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaStatus;
