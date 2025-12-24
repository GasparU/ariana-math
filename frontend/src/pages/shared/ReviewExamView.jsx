import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Calculator,
} from "lucide-react";
import { api } from "../../services/api"; // Ajusta la ruta según tu estructura
import MathText from "../../components/common/MathText"; // Ajusta ruta
import MathGraph from "../../components/features/exam/MathGraph"; // Ajusta ruta
import SVGCanvas from "../../components/features/exam/SVGCanvas"; // Ajusta ruta

const ReviewExamView = () => {
  const { id } = useParams(); // ID del examen
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar Examen y Resultados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Traemos el examen (Preguntas)
        const examData = await api.exams.getById(id);

        // B. Traemos el historial de Ariana para encontrar SUS respuestas de este examen
        const history = await api.results.listByStudent("Ariana");
        const myResult = history.find((r) => r.exam_id === id);

        setExam(examData);
        setResult(myResult);
      } catch (error) {
        console.error("Error cargando revisión:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Helper para limpiar texto (mismo que usas en el examen)
  const cleanText = (text) => {
    if (!text) return "";
    return String(text).replace(/\s+/g, "").replace(/\$/g, "").toLowerCase();
  };

  const isCorrectAnswer = (optText, correctTxt, isOptCorrectFlag) => {
    // Si la opción tiene la bandera isCorrect: true, es la correcta
    if (isOptCorrectFlag) return true;
    // Si no, comparamos texto con la respuesta correcta guardada
    return cleanText(optText) === cleanText(correctTxt);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white animate-pulse">
        Cargando revisión...
      </div>
    );

  if (!exam || !result)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        No se encontraron resultados para esta misión.
      </div>
    );

  const questions = exam.content.questions || [];
  const studentAnswers = result.answers_json || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      {/* --- HEADER FIJO --- */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)} // Volver atrás
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                Revisión de Misión
              </h1>
              <span className="text-xs font-bold text-slate-400">
                {exam.topic} • {exam.subject}
              </span>
            </div>
          </div>

          {/* Badge de Nota */}
          <div
            className={`px-4 py-1 rounded-xl border flex flex-col items-center ${
              result.score >= 13
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
            }`}
          >
            <span className="text-[10px] uppercase font-black tracking-widest opacity-70">
              Nota Final
            </span>
            <span className="text-xl font-black">{result.score} / 20</span>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO SCROLLEABLE --- */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
        {questions.map((q, idx) => {
          const userAns = studentAnswers[idx]; // Lo que respondió Ariana
          const correctAnswerText = q.correct_answer; // Texto respuesta correcta (fallback)

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              {/* Encabezado Pregunta */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                <span className="flex-none w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-lg flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    <MathText
                      content={q.question_text || q.question || q.text}
                    />
                  </h3>

                  {/* Gráfico (Si existe) */}
                  {(q.graph_data || q.svgCode) && (
                    <div className="mt-4 mb-2 p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center">
                      {q.graph_data ? (
                        <div className="max-w-md w-full">
                          <MathGraph
                            graphData={q.graph_data}
                            isEditable={false}
                          />
                        </div>
                      ) : (
                        <SVGCanvas svgCode={q.svgCode} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Opciones con Feedback Visual */}
              <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const optText = typeof opt === "string" ? opt : opt.text;
                  const isOptCorrect =
                    typeof opt === "object" ? opt.isCorrect : false;

                  // Lógica de Estado
                  const isSelectedByUser = userAns === optText;
                  const isActuallyCorrect = isCorrectAnswer(
                    optText,
                    correctAnswerText,
                    isOptCorrect
                  );

                  let cardClass =
                    "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
                  let icon = null;

                  if (isSelectedByUser && isActuallyCorrect) {
                    // 1. Marcó la correcta (VERDE)
                    cardClass =
                      "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500";
                    icon = (
                      <CheckCircle size={18} className="text-emerald-600" />
                    );
                  } else if (isSelectedByUser && !isActuallyCorrect) {
                    // 2. Marcó la incorrecta (ROJO)
                    cardClass =
                      "bg-rose-100 dark:bg-rose-900/30 border-rose-500 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500";
                    icon = <XCircle size={18} className="text-rose-600" />;
                  } else if (!isSelectedByUser && isActuallyCorrect) {
                    // 3. Esta era la correcta pero no la marcó (Borde VERDE punteado o sólido)
                    cardClass =
                      "bg-white dark:bg-slate-800 border-emerald-400 border-dashed text-slate-500 opacity-100 ring-1 ring-emerald-400/50";
                    icon = (
                      <CheckCircle
                        size={18}
                        className="text-emerald-400 opacity-50"
                      />
                    );
                  }

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-center justify-between text-sm font-medium transition-all ${cardClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xs opacity-50">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <MathText content={optText} />
                      </div>
                      {icon}
                    </div>
                  );
                })}
              </div>

              {/* --- SOLUCIONARIO (Siempre visible para aprender) --- */}
              <div className="bg-amber-50 dark:bg-slate-900/80 border-t border-amber-100 dark:border-slate-700 p-5">
                <h4 className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3">
                  <BookOpen size={14} /> Solucionario / Desarrollo
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-amber-100/50 dark:border-slate-700">
                  <MathText
                    content={
                      q.solution_text ||
                      "No hay explicación disponible para esta pregunta."
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewExamView;
