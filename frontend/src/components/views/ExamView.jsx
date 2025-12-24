// import React, { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { useNavigate, useLocation } from "react-router-dom";
// import { api } from "../../services/api";

// // COMPONENTES MODULARES
// import ExamHeader from "./examView/ExamHeader";
// import VisualPanel from "./examView/VisualPanel";
// import InteractionPanel from "./examView/InteractionPanel";
// import {
//   LoadingScreen,
//   ErrorScreen,
//   LockedScreen,
//   WelcomeScreen,
// } from "./examView/StatusScreens";

// const ExamView = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [darkMode, setDarkMode] = useState(true);

//   // ESTADOS
//   const [hasStarted, setHasStarted] = useState(false);
//   const [realExam, setRealExam] = useState(null);
//   const [currentExamId, setCurrentExamId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

//   // JUEGO
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [reviewMode, setReviewMode] = useState(false);

//   useEffect(() => {
//     const loadExam = async () => {
//       try {
//         setLoading(true);

//         if (location.state?.mode === "review") {
//           setReviewMode(true);
//           setHasStarted(true);
//         }

//         const latest = await api.exams.getLatest();

//         if (latest && latest.content && latest.content.questions) {
//           setCurrentExamId(latest.id);

//           if (!location.state?.mode) {
//             const history = await api.results.getHistory();
//             const alreadyDone = history.find((h) => h.exam_id === latest.id);
//             if (alreadyDone) setIsAlreadyCompleted(true);
//           }

//           // --- ADAPTADOR UNIFICADO ---
//           // Usamos la misma lógica que en el Dashboard para no tener errores diferentes.
//           const questions = latest.content.questions.map((q, i) => {
//             // 1. Normalizamos la estructura básica
//             const normalized = normalizeQuestion(q, i);

//             // 2. En ExamView necesitamos lógica extra para las opciones (saber cuál es correcta visualmente)
//             // Re-procesamos las opciones para añadir 'isCorrect' flag visual
//             const optionsWithFlags = normalized.options.map((optText, idx) => {
//               const letter = String.fromCharCode(97 + idx); // a, b, c
//               return {
//                 id: `opt_${letter}`,
//                 text: optText,
//                 // Lógica flexible para detectar la correcta
//                 isCorrect:
//                   optText.includes(normalized.correct_answer) ||
//                   (normalized.correct_answer &&
//                     optText.trim() === normalized.correct_answer.trim()),
//               };
//             });

//             return {
//               ...normalized,
//               options: optionsWithFlags, // Sobrescribimos con las opciones enriquecidas para el juego
//             };
//           });

//           // const finalQuestions = [mockQuestion, ...questions];

//           setRealExam({
//             ...latest.content,
//             id: latest.id,
//             subject: latest.subject,
//             topic: latest.topic,
//             questions: questions,
//           });
//         } else {
//           // Si no hay datos válidos
//           setRealExam(null);
//         }
//       } catch (e) {
//         console.error("Error cargando examen:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadExam();
//   }, [location.state]);

//   // Lógica de visualización
//   const isVisualSubject =
//     realExam &&
//     [
//       "matematica",
//       "fisica",
//       "quimica",
//       "cta",
//       "razonamiento matematico",
//     ].includes(realExam.subject?.toLowerCase());
//   const questionsPerPage = isVisualSubject ? 1 : 2;

//   const activeQuestions = realExam
//     ? realExam.questions.slice(currentIndex, currentIndex + questionsPerPage)
//     : [];

//   const isLastPage =
//     realExam && currentIndex + questionsPerPage >= realExam.questions.length;

//   const handleSelect = (questionId, optionId) => {
//     if (!reviewMode && !isAlreadyCompleted) {
//       setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
//     }
//   };

//   const handleNext = async () => {
//     if (reviewMode || isAlreadyCompleted) {
//       if (!isLastPage) {
//         setCurrentIndex((prev) => prev + questionsPerPage);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       } else {
//         navigate("/history");
//       }
//       return;
//     }

//     // Validar respuesta
//     const unanswered = activeQuestions.some((q) => !userAnswers[q.id]);
//     if (unanswered) {
//       Swal.fire({
//         title: "¡Atención!",
//         text: "Debes marcar una respuesta.",
//         icon: "warning",
//         confirmButtonColor: "#4f46e5",
//       });
//       return;
//     }

//     if (!isLastPage) {
//       setCurrentIndex((prev) => prev + questionsPerPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } else {
//       // CALCULAR PUNTAJE
//       let finalScore = 0;
//       realExam.questions.forEach((q) => {
//         const selected = userAnswers[q.id];
//         const correctOpt = q.options.find((o) => o.isCorrect);
//         if (selected === correctOpt?.id) finalScore++;
//       });

//       const payload = {
//         exam_id: currentExamId || realExam.id,
//         subject: realExam.subject || "general",
//         topic: realExam.topic || "General",
//         score: finalScore,
//         total_questions: realExam.questions.length,
//         answers: userAnswers,
//         details: { date: new Date() },
//       };

//       try {
//         await api.results.save(payload);
//         await Swal.fire({
//           title: "¡MISIÓN CUMPLIDA!",
//           html: `<div class="text-center"><div class="text-6xl mb-4">🏆</div><p>Puntaje: <b>${finalScore}/${realExam.questions.length}</b></p></div>`,
//           confirmButtonText: "VER RESULTADOS",
//         });
//         navigate("/history");
//       } catch (error) {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: "No se pudo guardar.",
//         });
//       }
//     }
//   };

//   if (loading) return <LoadingScreen />;
//   if (!realExam) return <ErrorScreen />;
//   if (isAlreadyCompleted && !reviewMode)
//     return <LockedScreen onExit={() => navigate("/history")} />;
//   if (!hasStarted)
//     return (
//       <WelcomeScreen
//         topic={realExam.topic}
//         onStart={() => setHasStarted(true)}
//       />
//     );

//   return (
//     <div className={darkMode ? "dark" : "light"}>
//       <div className="h-screen w-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden">
//         <ExamHeader
//           subject={realExam.subject}
//           currentIndex={currentIndex}
//           totalQuestions={realExam.questions.length}
//           timeLimit={realExam.timeLimitSeconds}
//           isReviewMode={reviewMode}
//           isAlreadyCompleted={isAlreadyCompleted}
//           onTimeUp={handleNext}
//           darkMode={darkMode}
//           setDarkMode={setDarkMode}
//         />

//         <div className="flex-1 w-full max-w-7xl mx-auto p-2 md:p-4 overflow-hidden flex flex-col justify-center">
//           <div
//             className={`h-5/6 grid gap-4 ${
//               isVisualSubject
//                 ? "grid-cols-1 lg:grid-cols-2"
//                 : "grid-cols-1 lg:grid-cols-2"
//             } min-h-0`}
//           >
//             {/* PANEL VISUAL (DIBUJO) */}
//             <VisualPanel
//               isVisualSubject={isVisualSubject}
//               question={activeQuestions[0]}
//               userAnswer={userAnswers[activeQuestions[0].id]}
//               onOptionSelect={(optId) =>
//                 handleSelect(activeQuestions[0].id, optId)
//               }
//               isReviewMode={reviewMode || isAlreadyCompleted}
//               questionIndex={currentIndex}
//             />

//             {/* PANEL INTERACTIVO (PREGUNTAS) */}
//             <InteractionPanel
//               isVisualSubject={isVisualSubject}
//               questions={activeQuestions}
//               currentIndex={currentIndex}
//               userAnswers={userAnswers}
//               onOptionSelect={handleSelect}
//               isReviewMode={reviewMode}
//               isAlreadyCompleted={isAlreadyCompleted}
//               isLastPage={isLastPage}
//               onNext={handleNext}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExamView;

import { useEffect, useState } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "../../services/api";

const HistoryView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Usamos el método que creamos en el paso anterior
        const data = await api.results.listByStudent("Ariana");
        setResults(data || []);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 17) return "text-emerald-600 bg-emerald-50 border-emerald-200"; // Excelente
    if (score >= 13) return "text-indigo-600 bg-indigo-50 border-indigo-200"; // Bien
    return "text-red-600 bg-red-50 border-red-200"; // Mal
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando notas de Ariana...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER ESTADÍSTICO RAPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Exámenes Completados
            </p>
            <p className="text-2xl font-black text-slate-800">
              {results.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Promedio General
            </p>
            <p className="text-2xl font-black text-slate-800">
              {results.length > 0
                ? (
                    results.reduce((acc, curr) => acc + Number(curr.score), 0) /
                    results.length
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">
        <Calendar size={20} className="text-slate-400" /> Historial de Intentos
      </h2>

      {/* LISTA DE RESULTADOS */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400">Aún no hay exámenes resueltos.</p>
          </div>
        ) : (
          results.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6"
            >
              {/* NOTA CIRCULAR */}
              <div
                className={`flex-none w-16 h-16 rounded-full flex items-center justify-center border-4 text-xl font-black ${getScoreColor(
                  item.score
                )}`}
              >
                {item.score}
              </div>

              {/* DETALLES */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg text-slate-800">
                  {item.exams?.topic || "Tema desconocido"}
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase rounded">
                    {item.exams?.subject}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock size={12} /> {item.time_spent || "N/A"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar size={12} />{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* RESUMEN ACIERTOS */}
              <div className="flex gap-4 text-sm font-medium border-l border-slate-100 pl-6">
                <div className="text-emerald-600 flex flex-col items-center">
                  <CheckCircle size={18} />
                  <span>{item.correct_count} Bien</span>
                </div>
                <div className="text-red-500 flex flex-col items-center">
                  <XCircle size={18} />
                  <span>{item.total_questions - item.correct_count} Mal</span>
                </div>
              </div>

              {/* BOTÓN VER DETALLE (Opcional para el futuro) */}
              <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;