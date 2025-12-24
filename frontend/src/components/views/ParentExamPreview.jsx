import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, Play, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import Swal from "sweetalert2";
import MathGraph from "../features/exam/MathGraph";
import SVGCanvas from "../features/exam/SVGCanvas"; // Asegúrate de importar esto también si usas gráficos
import ExamCard from "../features/exam/ExamCard";
// IMPORTANTE: Asegúrate de que la ruta sea correcta.
// Si MathGraph está en features/exam, esta ruta relativa debería funcionar:


const ParentExamPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exam, setExam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Si venimos del GENERADOR (Vista Previa en Memoria)
    if (location.state?.examData) {
      setExam({
        topic: location.state.params.topic,
        subject: location.state.params.course,
        content: location.state.examData, // Las preguntas generadas
        isPreview: true, // BANDERA IMPORTANTE
      });
    }
    // 2. Si venimos del HISTORIAL (Examen ya guardado en BD)
    else {
      const fetchLatest = async () => {
        const latest = await api.exams.getLatest();
        if (latest) setExam(latest);
      };
      fetchLatest();
    }
  }, [location.state]);

  const handleApprove = async () => {
    // 1. 🔥 SPINNER DE CARGA (BLOQUEANTE)
    // Esto evita que den click dos veces y muestra que está trabajando
    Swal.fire({
      title: "Guardando Misión...",
      html: "Asignando tarea al tablero de Ariana...",
      allowOutsideClick: false, 
      allowEscapeKey: false, 
      background: "#1e293b", 
      color: "#ffffff", 
      didOpen: () => {
        Swal.showLoading(); 
      },
    });

    try {
      // Recuperamos los datos
      const params = location.state?.params || {};

      const examToSave = {
        subject: exam.subject,
        topic: exam.topic,
        grade_level: params.grade || "General",
        difficulty: params.difficulty || "Medium",
        content: exam.content,
        num_questions: parseInt(
          params.questionCount || exam.content.questions?.length || 5,
          10
        ),
        time_limit: parseInt(params.timeLimit || 45, 10),
        source: params.source || "Generado por IA",
        aiModel: params.iaModel || "Gemini",
      };

      // Guardamos en BD
      await api.exams.create(examToSave);

      // 2. ✅ ÉXITO
      await Swal.fire({
        icon: "success",
        title: "¡Examen Asignado!",
        text: "Listo para que la estudiante lo resuelva.",
        confirmButtonText: "VOLVER AL INICIO",
        confirmButtonColor: "#4f46e5",
        background: "#1e293b",
        color: "#ffffff",
      });

      navigate("/"); // Volver al inicio
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMsg =
        error.response?.data?.message || "No se pudo guardar el examen";

      // 3. ❌ ERROR
      Swal.fire({
        title: "Error al Guardar",
        text: Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg,
        icon: "error",
        background: "#1e293b",
        color: "#ffffff",
      });
    }
  };

  const handleDiscard = async () => {
    if (exam.isPreview) {
      // CASO A: Es vista previa -> Solo volvemos atrás (NO llamamos a la API)
      navigate(-1);
    } else {
      // CASO B: Es examen guardado -> Llamamos a la API para borrar
      try {
        await api.exams.delete(exam.id);
        navigate(-1);
      } catch (e) {
        Swal.fire("Error", "No se pudo eliminar de la base de datos", "error");
      }
    }
  };

  if (!exam)
    return <div className="p-10 text-white text-center">Cargando...</div>;

  const questions = exam.content.questions || [];

  return (
    <div className="min-h-screen bg-slate-900 p-6 pb-24 overflow-y-auto">
      {/* HEADER DE CONTROL */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 sticky top-0 z-50 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">
            {exam.topic}
          </h1>
          <p className="text-xs text-slate-400">
            {exam.isPreview ? "VISTA PREVIA (No Guardado)" : "EXAMEN GUARDADO"}{" "}
            • {questions.length} Preguntas • {exam.subject}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors text-xs font-bold uppercase"
          >
            <Trash2 size={16} /> {exam.isPreview ? "Descartar" : "Eliminar"}
          </button>

          {/* Botón APROBAR solo aparece si es vista previa */}
          {exam.isPreview && (
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-xs font-bold uppercase shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {isSaving ? (
                "Guardando..."
              ) : (
                <>
                  <Save size={16} /> Aprobar y Guardar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE PREGUNTAS */}
      <div className="max-w-5xl mx-auto space-y-6">
        {exam.content.questions.map((q, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6"
          >
            {/* LADO A: La Tarjeta de Examen (Texto + Opciones) */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                  Pregunta {i + 1}
                </span>
              </div>

              {/* 🔥 AQUÍ ESTÁ LA MAGIA: Usamos el componente que ya arreglamos */}
              {/* Le pasamos isReviewMode={true} para que muestre el VERDE y el solucionario */}
              <div className="h-full">
                <ExamCard
                  question={q}
                  selectedOption={null} // En preview no seleccionamos nada
                  onOptionSelect={() => {}}
                  isReviewMode={true} // <--- ¡ESTO ACTIVA LOS COLORES Y EL CHECK VERDE!
                />
              </div>
            </div>

            {/* LADO B: El Gráfico (Si existe) */}
            {/* Mantenemos tu lógica de mostrar el gráfico al costado en el preview */}
            {(q.graph_data || q.svgCode) && (
              <div className="w-full md:w-1/3 shrink-0">
                <div className="sticky top-4 bg-white rounded-xl border-2 border-slate-100 overflow-hidden h-[300px] flex items-center justify-center">
                  {q.graph_data ? (
                    <MathGraph graphData={q.graph_data} />
                  ) : (
                    <SVGCanvas svgCode={q.svgCode} />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    Visualización Generada
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentExamPreview;
