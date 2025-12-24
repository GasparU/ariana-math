import React, { useState } from "react";
import { Rocket, Brain, Trophy, History, Play } from "lucide-react";

const MissionControl = ({ onStartMission }) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // Simulación de historial (luego vendrá de la Base de Datos)
  const mockHistory = [
    {
      id: 1,
      date: "02/10",
      topic: "Geometría Básica",
      score: "8/10",
      status: "success",
    },
    {
      id: 2,
      date: "01/10",
      topic: "Fracciones",
      score: "5/10",
      status: "warning",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Aquí es donde en el futuro llamaremos a la API de Gemini
    console.log(`Solicitando misión a la IA: ${topic} - ${difficulty}`);

    // Por ahora, iniciamos la simulación
    onStartMission({ topic, difficulty });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header del Panel */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          CENTRO DE COMANDO
        </h1>
        <p className="text-slate-400 font-mono text-sm">
          SUPERVISOR: PAPÁ | CADETE: ARIANA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TARJETA 1: GENERADOR DE MISIONES (Lo que pediste) */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Brain size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Nueva Simulación</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Objetivo de Aprendizaje (Prompt)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Triángulos rectángulos, Historia del Perú..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nivel de Intensidad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "mixed", "hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`p-2 rounded-lg border text-sm font-bold capitalize transition-all ${
                      difficulty === level
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                    }`}
                  >
                    {level === "hard"
                      ? "Olímpico"
                      : level === "medium"
                      ? "Estándar"
                      : "Básico"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic}
              className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket size={20} />
              <span>INICIAR ENTRENAMIENTO</span>
            </button>
          </form>
        </div>

        {/* TARJETA 2: ANALYTICS (Progreso y Errores) */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Trophy size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">
              Historial de Rendimiento
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "success"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {item.topic}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {item.date}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-300">
                  {item.score}
                </span>
              </div>
            ))}

            <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl mt-4">
              <h3 className="text-xs font-bold text-indigo-300 uppercase mb-1 flex items-center gap-2">
                <Brain size={12} /> Sugerencia IA
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                "Se detectan patrones de error en{" "}
                <strong>Fracciones Homogéneas</strong>. Se recomienda generar
                una sesión de refuerzo enfocada en simplificación."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
