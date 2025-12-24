import React, { useState, useEffect } from "react";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  Layers,
  Zap,
  Sparkles,
  FileText,
  Bookmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import QuotaStatus from "./parentDashboard/QuotaStatus";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const [quotas, setQuotas] = useState({
    geminiRemaining: 4,
    deepseekRemaining: 10,
    isAdmin: false,
  });

  // Lista dinámica de cursos
  const [coursesList, setCoursesList] = useState([]);

  // Estado del formulario
  const [missionParams, setMissionParams] = useState({
    course: "",
    grade: "5to Primaria",
    difficulty: "Medio",
    source: "Libro Escolar",
    topic: "",
    iaModel: "Gemini Pro",
    questionCount: 5,
    timeLimit: 45,
  });

  // Cargar cursos
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (window.history.state?.idx > 0) {
          window.history.replaceState(null, "", "/parent");
        }

        const data = await api.courses.getAll();
        const rawList = Array.isArray(data) ? data : [];

        // Mapeamos y normalizamos a strings
        const cleanList = rawList.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item.name || item.title || item.course || "";
          }
          return String(item);
        });

        let validList = cleanList
          .filter((c) => c !== "")
          .sort((a, b) => a.localeCompare(b));

        // 🔥 CAMBIO CRÍTICO: Si la lista está vacía (backend desconectado/modo demo)
        // Inyectamos cursos por defecto para que el selector sea funcional.
        if (validList.length === 0) {
          validList = ["Matemática", "Comunicación", "Historia", "Ciencias"];
        }

        setCoursesList(validList);

        if (validList.length > 0) {
          setMissionParams((prev) => ({ ...prev, course: validList[0] }));
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
        // 🔥 Respaldo en caso de error de red
        const fallback = ["Matemática", "Comunicación"];
        setCoursesList(fallback);
        setMissionParams((prev) => ({ ...prev, course: fallback[0] }));
      }
    };
    fetchCourses();
    const syncQuotas = async () => {
      try {
        const data = await api.exams.list();
        const exams = Array.isArray(data) ? data : [];

        const geminiUsed = exams.filter((e) =>
          e.content?.usedModel?.toLowerCase().includes("gemini")
        ).length;

        const deepseekUsed = exams.filter((e) =>
          e.content?.usedModel?.toLowerCase().includes("deepseek")
        ).length;

        const currentVisitor = localStorage.getItem("app_visitor_identity");

        setQuotas({
          geminiRemaining: Math.max(0, 4 - geminiUsed),
          deepseekRemaining: Math.max(0, 10 - deepseekUsed),
          // 🔥 CAMBIO AQUÍ: Verifica tu ID de Admin dinámicamente
          isAdmin: currentVisitor === "02e393ce-f956-442b-910e-bcef69bffa1d",
        });
      } catch (error) {
        console.error("Error sincronizando cuotas:", error);
      }
    };

    fetchCourses();
    syncQuotas();
  }, []);

  const handleChange = (field, value) => {
    setMissionParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!missionParams.topic.trim()) {
      return Swal.fire(
        "Falta el tema",
        "Por favor escribe un tema específico.",
        "warning"
      );
    }

    if (!missionParams.course) {
      return Swal.fire("Falta curso", "No hay cursos disponibles.", "warning");
    }

    setLoading(true);
    try {
      // Mapeo de Dificultad
      const difficultyMap = {
        "Básico (Repaso)": "easy",
        "Medio (Estándar)": "medium",
        "Avanzado (Reto)": "hard",
        "Progresivo (Adaptable)": "mixed",
        "Olimpiada (Concurso)": "olympiad",
      };

      const backendDifficulty =
        difficultyMap[missionParams.difficulty] || "medium";

      // ---------------------------------------------------------
      // CONSTRUCCIÓN DEL PAYLOAD SEGÚN TU 'create-exam.dto.ts'
      // ---------------------------------------------------------
      const examPayload = {
        subject: missionParams.course,
        topic: missionParams.topic,
        difficulty: backendDifficulty,

        // DTO: @IsString() grade_level
        grade_level: missionParams.grade,

        // DTO: @IsString() source
        source: missionParams.source,

        // DTO: @IsString() aiModel (NO 'model', el backend pide 'aiModel')
        aiModel: missionParams.iaModel,

        // DTO: @IsInt() num_questions (NO 'config.questions')
        num_questions: parseInt(missionParams.questionCount, 10),

        // DTO: @IsInt() time_limit (NO 'config.time')
        time_limit: parseInt(missionParams.timeLimit, 10),
      };

      // Llamada a la API
      const response = await api.exams.preview(examPayload);

      if (response.stats) {
        setQuotas(response.stats);
      }

      navigate("/parent/preview", {
        state: { examData: response, params: missionParams },
      });
    } catch (error) {
      console.error(error);

      let msg = "No se pudo generar la misión.";
      // Si el backend devuelve mensajes de validación (class-validator), los mostramos
      if (
        error.message &&
        (error.message.includes("must be") ||
          error.message.includes("should not"))
      ) {
        msg = `Error de Datos: ${error.message}`;
      }

      Swal.fire("Error del Servidor", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const commonSelectClasses =
    "w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <Sparkles className="text-indigo-600" /> Generador de Misiones
          </h1>
          <p className="text-slate-500 text-sm">
            Diseña una evaluación personalizada para Ariana usando Inteligencia
            Artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* MATERIA */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <BookOpen size={12} /> Materia
                  </label>
                  <select
                    value={missionParams.course}
                    onChange={(e) => handleChange("course", e.target.value)}
                    className={commonSelectClasses}
                  >
                    {coursesList.length === 0 ? (
                      <option value="">Cargando cursos...</option>
                    ) : (
                      coursesList.map((c, idx) => (
                        <option key={idx} value={c}>
                          {c}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* NIVEL */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Layers size={12} /> Nivel
                  </label>
                  <select
                    value={missionParams.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                    className={commonSelectClasses}
                  >
                    <option>3ro Primaria</option>
                    <option>4to Primaria</option>
                    <option>5to Primaria</option>
                    <option>6to Primaria</option>
                    <option>1ro Secundaria</option>
                    <option>2do Secundaria</option>
                    <option>3ro Secundaria</option>
                    <option>4to Secundaria</option>
                    <option>5to Secundaria</option>
                  </select>
                </div>

                {/* DIFICULTAD */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Zap size={12} /> Dificultad
                  </label>
                  <select
                    value={missionParams.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className={commonSelectClasses}
                  >
                    <option>Básico (Repaso)</option>
                    <option>Medio (Estándar)</option>
                    <option>Avanzado (Reto)</option>
                    <option>Progresivo (Adaptable)</option>
                    <option>Olimpiada (Concurso)</option>
                  </select>
                </div>

                {/* FUENTE DE CONOCIMIENTO */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Bookmark size={12} /> Fuente de Conocimiento
                  </label>
                  <select
                    value={missionParams.source}
                    onChange={(e) => handleChange("source", e.target.value)}
                    className={commonSelectClasses}
                  >
                    <option value="Libro Escolar">
                      📚 Libro Escolar (Minedu/Santillana)
                    </option>
                    <option value="Preuniversitario">
                      🎓 Preuniversitario (Aduni/César Vallejo)
                    </option>
                    <option value="CONAMAT">🏆 CONAMAT / Olimpiadas</option>
                    <option value="Canguro Matemático">
                      🦘 Canguro Matemático
                    </option>
                    <option value="Material Docente">
                      📝 Material Docente Propio
                    </option>
                    <option value="Otro">📂 Otro</option>
                  </select>
                </div>
              </div>

              {/* TEMA ESPECÍFICO */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Tema Específico
                </label>
                <input
                  type="text"
                  value={missionParams.topic}
                  onChange={(e) => handleChange("topic", e.target.value)}
                  placeholder="Ej: Polinomios, Leyes de Newton, La Guerra del Pacífico..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* CARD 2: PARÁMETROS IA */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* MOTOR IA */}
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <BrainCircuit size={12} /> Motor IA
                  </label>
                  <select
                    value={missionParams.iaModel}
                    onChange={(e) => handleChange("iaModel", e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Gemini 1.5 Flash</option>
                    <option>Gemini Pro</option>
                    <option>GPT-4o</option>
                    <option>DeepSeek</option>
                  </select>
                </div>

                {/* PREGUNTAS */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <FileText size={12} /> Preguntas
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <span className="text-slate-400 text-xs font-bold mr-2">
                      #
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={missionParams.questionCount}
                      onChange={(e) =>
                        handleChange("questionCount", e.target.value)
                      }
                      className="w-full p-3 bg-transparent outline-none text-sm font-bold text-slate-700"
                    />
                  </div>
                </div>

                {/* TIEMPO */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Clock size={12} /> Tiempo (Min)
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <Clock size={14} className="text-slate-400 mr-2" />
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={missionParams.timeLimit}
                      onChange={(e) =>
                        handleChange("timeLimit", e.target.value)
                      }
                      className="w-full p-3 bg-transparent outline-none text-sm font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: RESUMEN --- */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                    Resumen de Misión
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Parámetros seleccionados
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <SummaryRow
                  label="Materia"
                  value={missionParams.course || "-"}
                  color="text-indigo-600"
                />
                <SummaryRow label="Nivel" value={missionParams.grade} />
                <SummaryRow
                  label="Fuente"
                  value={missionParams.source}
                  color="text-indigo-600 font-black"
                />
                <SummaryRow
                  label="Dificultad"
                  value={missionParams.difficulty}
                  color="text-amber-600"
                />
                <SummaryRow
                  label="Cantidad"
                  value={`${missionParams.questionCount} preguntas`}
                />
                <SummaryRow
                  label="Tiempo"
                  value={`${missionParams.timeLimit} minutos`}
                />
                <SummaryRow
                  label="Motor IA"
                  value={missionParams.iaModel.split(" ")[0]}
                />
              </div>
              <div className="mb-6 px-1">
                <QuotaStatus stats={quotas} isAdmin={quotas.isAdmin} />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || coursesList.length === 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    {" "}
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    GENERANDO...{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <Sparkles size={18} fill="currentColor" /> EJECUTAR MISIÓN{" "}
                  </>
                )}
              </button>

              <p className="text-[9px] text-center text-slate-400 mt-4 px-4">
                La IA diseñará ejercicios únicos basados en la fuente{" "}
                <strong>{missionParams.source}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Componente auxiliar
const SummaryRow = ({
  label,
  value,
  color = "text-slate-800 dark:text-white",
}) => (
  <div className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-700 pb-2 last:border-0">
    <span className="text-slate-400 font-medium">{label}:</span>
    <span className={`font-bold uppercase text-right ${color}`}>{value}</span>
  </div>
);

export default ParentDashboard;
