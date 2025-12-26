
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Lock as LockIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Play,
  Trophy,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { api } from "../../services/api";
import MathText from "../../components/common/MathText";
import MathGraph from "../../components/features/exam/MathGraph";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";

const StudentExamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const STORAGE_KEY = `exam_progress_${id}`;

  // 1. FUNCIÓN SEGURA PARA TEXTOS
  const getSafeText = (input) => {
    if (!input) return "";
    if (typeof input === "string") return input;
    if (typeof input === "number") return String(input);
    if (typeof input === "object" && input.text) return String(input.text);
    if (typeof input === "object") return JSON.stringify(input);
    return String(input);
  };

  // 2. CARGA INICIAL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await api.exams.getById(id);
        if (!data) throw new Error("Examen no encontrado");

        // Verificar si ya fue completado
        const history = await api.results.listByStudent("Ariana");
        const alreadyTaken = history.some((h) => h.exam_id === id);

        if (alreadyTaken) {
          setExam(data);
          setIsCompleted(true);
          setLoading(false);
          return;
        }
        setExam(data);

        // Recuperar progreso
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setAnswers(parsed.answers || {});
            setTimeLeft(parsed.timeLeft || data.time_limit * 60);
            setCurrentQ(parsed.currentQ || 0);
            setHasStarted(true);
          } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          setTimeLeft((data.time_limit || 45) * 60);
        }
      } catch (error) {
        console.error("Error cargando examen:", error);
        Swal.fire("Error", "No se pudo cargar la misión", "error");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
    return () => clearInterval(timerRef.current);
  }, [id, navigate]);

  // 3. TIMER
  useEffect(() => {
    if (loading || !exam || !hasStarted || isCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newVal = prev - 1;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            answers,
            timeLeft: newVal,
            currentQ,
          })
        );
        if (newVal <= 0) {
          clearInterval(timerRef.current);
          handleFinishExam(true);
          return 0;
        }
        return newVal;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, exam, answers, currentQ, hasStarted, isCompleted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (safeText) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ]: safeText,
    }));
  };

  // --- FUNCIÓN DE LIMPIEZA DE TEXTO ---
  const normalizeText = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/\s+/g, "") // Quita espacios
      .replace(/\$/g, "") // Quita signos de dólar
      .toLowerCase()
      .trim();
  };

  const handleFinishExam = async (isTimeOut = false) => {
    clearInterval(timerRef.current);

    let correctCount = 0;
    const totalQ = exam.content.questions.length;

    console.log("--- INICIANDO CALIFICACIÓN ---");

    exam.content.questions.forEach((q, idx) => {
      const studentAnsRaw = answers[idx];
      const options = q.answerOptions || q.options || [];
      const correctOption = options.find(
        (opt) => opt.isCorrect === true || String(opt.isCorrect) === "true"
      );

      let isCorrect = false;

      if (studentAnsRaw) {
        const studentNorm = normalizeText(studentAnsRaw);
        if (correctOption) {
          const correctNorm = normalizeText(correctOption.text);
          if (studentNorm === correctNorm) isCorrect = true;
        } else if (q.correct_answer) {
          if (studentNorm === normalizeText(q.correct_answer)) isCorrect = true;
        }
      }

      if (isCorrect) correctCount++;
    });

    const score = (correctCount / totalQ) * 20;
    const scoreRounded = Math.round(score);

    try {
      await api.results.create({
        exam_id: exam.id,
        student_name: "Ariana",
        score: scoreRounded,
        correct_count: correctCount,
        total_questions: totalQ,
        answers_json: answers,
        created_at: new Date().toISOString(),
        time_spent: `${Math.floor((exam.time_limit * 60 - timeLeft) / 60)} min`,
      });

      localStorage.removeItem(STORAGE_KEY);
      if (scoreRounded >= 13) confetti();

      await Swal.fire({
        title: isTimeOut ? "¡Tiempo Agotado!" : "¡Misión Cumplida!",
        html: `
            <div class="text-center">
              <div class="text-5xl mb-4">${
                scoreRounded >= 13 ? "🏆" : "📚"
              }</div>
              <p class="text-lg">Tu nota es: <strong>${scoreRounded} / 20</strong></p>
              <p class="text-sm text-slate-500 mt-2">
                Acertaste ${correctCount} de ${totalQ} preguntas.
              </p>
            </div>
          `,
        icon: scoreRounded >= 13 ? "success" : "info",
        confirmButtonText: "Ver Historial",
        confirmButtonColor: "#4f46e5",
        allowOutsideClick: false,
      });

      navigate("/parent/history");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Error al guardar tu nota.", "error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white animate-pulse">
        Cargando datos de la misión...
      </div>
    );

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center border border-slate-700 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
            <LockIcon size={40} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            Misión Completada
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Ya has enviado tus respuestas para <strong>{exam.topic}</strong>. No
            puedes repetir esta evaluación.
          </p>
          <button
            onClick={() => navigate("/student")}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
          >
            Volver al Tablero
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center border border-slate-700 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400 border border-indigo-500/30">
            <Trophy size={40} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
            {exam.topic}
          </h1>
          <div className="flex justify-center gap-4 text-slate-400 text-sm mb-8 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={16} /> {exam.time_limit || exam.timeLimit || 45} min
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle size={16} /> {exam.content.questions.length} preguntas
            </span>
          </div>
          <button
            onClick={() => setHasStarted(true)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all group"
          >
            <Play size={18} fill="currentColor" /> INICIAR AHORA
          </button>
          <button
            onClick={() => navigate("/student")}
            className="mt-6 text-slate-500 text-xs font-bold hover:text-slate-300 transition-colors"
          >
            VOLVER AL TABLERO
          </button>
        </div>
      </div>
    );
  }

  const question = exam.content.questions[currentQ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <div className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur border-b border-slate-700 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-bold text-sm text-slate-200 truncate max-w-[200px]">
                {exam.topic}
              </h2>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Pregunta {currentQ + 1} de {exam.content.questions.length}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-black border-2 transition-colors ${
              timeLeft < 60
                ? "bg-red-500/10 text-red-400 border-red-500/50 animate-pulse"
                : "bg-slate-900 text-emerald-400 border-slate-700"
            }`}
          >
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleFinishExam(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-transform active:scale-95"
          >
            <CheckCircle size={16} />{" "}
            <span className="hidden sm:inline">Terminar</span>
          </button>
        </div>
        <div
          className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300"
          style={{
            width: `${((currentQ + 1) / exam.content.questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-24">
        <div className="bg-white text-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <span className="inline-block px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-3">
                {exam.subject}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
                <MathText
                  content={getSafeText(
                    question.question || question.question_text
                  )}
                />
              </h3>
            </div>
            <div className="flex-1 bg-white p-4 flex items-center justify-center min-h-[200px]">
              {question.graph_data || question.svgCode ? (
                question.graph_data ? (
                  <div className="w-full max-w-md">
                    <MathGraph
                      graphData={question.graph_data}
                      isEditable={false}
                    />
                  </div>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: question.svgCode }}
                    className="w-full flex justify-center [&>svg]:max-h-[250px]"
                  />
                )
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-2">
                  <span className="text-4xl opacity-20">✏️</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                    Pregunta de Texto
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-[40%] bg-slate-50/50 p-4 md:p-6 overflow-y-auto max-h-[60vh] md:max-h-none">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Selecciona tu respuesta:
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {question.options.slice(0, 5).map((opt, idx) => {
                const textLabel = getSafeText(opt);
                const isSelected = answers[currentQ] === textLabel;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(textLabel)}
                    className={`relative group text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600 z-10"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs border shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-slate-100 border-slate-300 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span
                      className={`text-sm font-medium leading-tight ${
                        isSelected ? "text-indigo-900" : "text-slate-600"
                      }`}
                    >
                      <MathText content={textLabel} />
                    </span>
                    {isSelected && (
                      <div className="absolute right-3 text-indigo-600">
                        <CheckCircle
                          size={16}
                          fill="currentColor"
                          className="text-white"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-slate-800 p-3 border-t border-slate-700 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-slate-400 disabled:opacity-30 hover:bg-slate-700 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Anterior
          </button>
          <div className="hidden md:flex gap-1.5 overflow-x-auto max-w-[200px] px-2 py-1">
            {exam.content.questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentQ
                    ? "bg-white scale-125"
                    : answers[i]
                    ? "bg-indigo-500"
                    : "bg-slate-600"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              if (currentQ < exam.content.questions.length - 1) {
                setCurrentQ((prev) => prev + 1);
              } else {
                handleFinishExam();
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-black shadow-lg transition-transform active:scale-95 text-sm uppercase tracking-wider"
          >
            {currentQ === exam.content.questions.length - 1 ? (
              <>
                ¡Finalizar! <CheckCircle size={16} />
              </>
            ) : (
              <>
                Siguiente <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentExamView;