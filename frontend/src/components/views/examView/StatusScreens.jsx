import React from "react";
import { Lock } from "lucide-react";

export const LoadingScreen = () => (
  <div className="bg-slate-900 h-screen flex items-center justify-center text-white font-bold tracking-widest animate-pulse">
    CARGANDO MISIÓN...
  </div>
);

export const ErrorScreen = () => (
  <div className="bg-slate-900 h-screen flex items-center justify-center text-white">
    No hay datos de la misión.
  </div>
);

export const LockedScreen = ({ onExit }) => (
  <div className="h-screen bg-[#0f172a] flex items-center justify-center p-4">
    <div className="text-center max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <Lock size={48} className="mx-auto text-amber-500 mb-4" />
      <h2 className="text-2xl text-white font-bold mb-2">Misión Completada</h2>
      <p className="text-slate-400 mb-6">
        Ya has realizado esta prueba. Genera una nueva misión o revisa tus
        resultados anteriores.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onExit}
          className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 transition-colors"
        >
          Ver Historial
        </button>
      </div>
    </div>
  </div>
);

export const WelcomeScreen = ({ topic, onStart }) => (
  <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center p-4">
    <div className="text-center max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
      <h1 className="text-3xl text-white font-black mb-4">¿LISTA?</h1>
      <p className="text-indigo-400 font-bold mb-8 uppercase tracking-widest text-sm">
        {topic}
      </p>
      <button
        onClick={onStart}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95"
      >
        ¡INICIAR PRUEBA!
      </button>
    </div>
  </div>
);
