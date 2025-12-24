import React, { useState, useEffect } from "react";
import {
  Rocket,
  Brain,
  Trophy,
  Eye,
  Play,
} from "lucide-react";
import { api } from "../../services/api"; // Asegúrate de que esta ruta sea correcta
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../layout/StudentLayout";

// Importa aquí tu componente para resolver el examen (si ya lo tienes separado)
// O reutiliza la lógica de renderizado visual que tenías en ParentDashboard
// Por ahora, pondré una vista simple de "Resolución".

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMission, setActiveMission] = useState(null); // El examen que ella elija
  const navigate = useNavigate();

  const fetchMissions = async () => {
    try {
      setLoading(true);

      // 1. Pedimos Exámenes y Resultados en paralelo
      const [examsRes, resultsRes] = await Promise.all([
        api.exams.list(),
        api.results.listByStudent("Ariana"), // Usamos el nombre del estudiante actual
      ]);

      const examsData = examsRes.data || examsRes;
      const resultsData = resultsRes || [];

      // 2. Fusionamos: A cada examen le pegamos su resultado (si existe)
      const mergedExams = examsData.map((exam) => {
        // Buscamos si hay un resultado para este examen
        const myResult = resultsData.find((r) => r.exam_id === exam.id);

        return {
          ...exam,
          isCompleted: !!myResult, // true si encontró resultado
          scoreData: myResult
            ? {
                correct: myResult.correct_count, // Ej: 1
                total: myResult.total_questions, // Ej: 10
                score: myResult.score, // Ej: 02
              }
            : null,
        };
      });

      // 3. Ordenar: Pendientes primero, luego completados (y dentro de eso, por fecha)
      const sortedData = mergedExams.sort((a, b) => {
        // Primero criterio: Completado va al final
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        // Segundo criterio: Fecha más reciente primero
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setExams(sortedData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire("Error", "No se pudo sincronizar el tablero.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // 2. VISTA DE RESOLUCIÓN (CUANDO ELLA ELIGE UNA MISIÓN)
  if (activeMission) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        {/* Header de Misión */}
        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="font-black text-xl">{activeMission.topic}</h2>
            <p className="text-xs opacity-80">
              Misión de {activeMission.difficulty}
            </p>
          </div>
          <button
            onClick={() => setActiveMission(null)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold"
          >
            SALIR / PAUSAR
          </button>
        </div>

        {/* Cuerpo del Examen (Aquí iría tu lógica de preguntas, temporizador, etc.) */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* --- AQUÍ REUTILIZAS TU LÓGICA DE RENDERIZADO DE PREGUNTAS --- */}
          {/* Por simplicidad, muestro solo el título por ahora */}
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
              {activeMission.content.title || "Misión Académica"}
            </h1>

            {/* Renderizar Preguntas */}
            {activeMission.content.questions?.map((q, idx) => (
              <div
                key={idx}
                className="mb-8 p-6 border rounded-2xl shadow-sm bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex gap-4">
                  <span className="flex-none w-8 h-8 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full">
                    {idx + 1}
                  </span>
                  <div className="w-full">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">
                      {q.text}
                    </h3>
                    {q.svgCode && (
                      <div
                        className="mb-4 p-4 bg-white rounded-xl border flex justify-center"
                        dangerouslySetInnerHTML={{ __html: q.svgCode }}
                      />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          className="p-4 text-left border rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <StudentLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <Rocket className="text-emerald-500" size={32} />
          TABLERO DE MISIONES
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium ml-11">
          Hola Cadete Ariana. Tienes{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            {exams.filter((e) => !e.isCompleted).length}
          </span>{" "}
          misiones pendientes.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">
          Cargando datos del satélite...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`group relative rounded-3xl p-6 transition-all border overflow-hidden
      ${
        exam.isCompleted
          ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 grayscale-[0.3]" // Estilo "Ya hecho"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-400 cursor-pointer" // Estilo "Pendiente"
      }`}
            >
              {/* BADGE DE ESTADO */}
              {exam.isCompleted && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest z-10">
                  Prueba Realizada
                </div>
              )}

              <div className="relative z-0">
                {/* Header Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider 
          ${
            exam.difficulty === "Dificil" || exam.difficulty === "Difícil"
              ? "bg-rose-100 text-rose-700"
              : exam.difficulty === "Intermedio"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
                  >
                    {exam.difficulty}
                  </span>

                  {/* Fecha (Solo visible si NO está completada para no saturar, o la dejamos siempre) */}
                  {!exam.isCompleted && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">
                  {exam.topic}
                </h3>

                {/* --- ZONA DINÁMICA: RESULTADO O INFO --- */}
                {exam.isCompleted ? (
                  // VISUALIZACIÓN DE RESULTADO (Si ya lo hizo)
                  <div className="mb-4 mt-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Tu Puntaje
                      </span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {exam.scoreData.correct}{" "}
                        <span className="text-sm text-slate-400">
                          / {exam.scoreData.total}
                        </span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Nota
                      </span>
                      <div
                        className={`text-sm font-black px-2 py-1 rounded ${
                          exam.scoreData.score >= 13
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {exam.scoreData.score} / 20
                      </div>
                    </div>
                  </div>
                ) : (
                  // INFO NORMAL (Si está pendiente)
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                      <Brain size={14} /> {exam.grade || exam.grade_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy size={14} className="text-amber-500" />
                      {exam.content?.questions?.length || 0} Pregs
                    </span>
                  </div>
                )}

                {/* BOTÓN DE ACCIÓN */}
                <button
                  // 🔥 CAMBIO 1: Lógica inteligente (Si terminó -> Revisar / Si no -> Empezar)
                  onClick={
                    () =>
                      exam.isCompleted
                        ? navigate(`/review/${exam.id}`) // Ir a ver corrección
                        : navigate(`/student/exam/${exam.id}`) // Ir a dar examen
                  }
                  // 🔥 CAMBIO 2: Quitamos el 'disabled' para que siempre funcione
                  disabled={false}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors
    ${
      exam.isCompleted
        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer" // Verde activo
        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white"
    }`}
                >
                  {exam.isCompleted ? (
                    <>
                      {/* Cambiamos ícono visualmente */}
                      <Eye size={14} /> VER CORRECCIÓN
                    </>
                  ) : (
                    <>
                      INICIAR MISIÓN <Play size={12} fill="currentColor" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentDashboard;
