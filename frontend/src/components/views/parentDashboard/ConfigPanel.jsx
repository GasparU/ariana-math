import React, { useEffect, useState } from "react";
import { api } from "../../../services/api";
import {
  BookOpen,
  Clock,
  Search,
  Layers,
  Hash,
  Gauge,
  Cpu,
  Loader2,
} from "lucide-react";

// Estilos
const labelStyle =
  "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";
const inputStyle =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400";
const selectStyle =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none";

export const ConfigPanel = ({ values, setters }) => {
  const {
    course,
    gradeLevel,
    difficulty,
    specificTopic,
    numQuestions,
    timeLimit,
    aiModel,
  } = values;

  const [dbCourses, setDbCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // CARGAR CURSOS DE LA BASE DE DATOS
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await api.courses.getAll();
        setDbCourses(data);

        // Si hay cursos y no hay selección, seleccionar el primero
        if (data.length > 0 && !course) {
          const firstCourseVal =
            typeof data[0] === "object" ? data[0].name : data[0];
          setters.setCourse(firstCourseVal);
        }
      } catch (error) {
        console.error("Error cargando materias:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* FILA 1: MATERIA (DB), NIVEL, DIFICULTAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Materia Dinámica */}
        <div>
          <label className={labelStyle}>Materia</label>
          <div className="relative">
            <BookOpen
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <select
              value={course}
              onChange={(e) => setters.setCourse(e.target.value)}
              className={`${selectStyle} pl-10 font-bold text-indigo-600 dark:text-indigo-400`}
              disabled={loadingCourses}
            >
              {loadingCourses ? (
                <option>Cargando...</option>
              ) : dbCourses.length === 0 ? (
                <option value="matematica">Matemática (Default)</option>
              ) : (
                dbCourses.map((c) => {
                  const val = typeof c === "object" ? c.name : c;
                  const key = typeof c === "object" ? c.id : c;
                  return (
                    <option key={key} value={val}>
                      {val}
                    </option>
                  );
                })
              )}
            </select>
            {loadingCourses && (
              <Loader2
                size={14}
                className="absolute right-3 top-3 animate-spin text-indigo-500"
              />
            )}
          </div>
        </div>

        <div>
          <label className={labelStyle}>Nivel</label>
          <div className="relative">
            <Layers
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <select
              value={gradeLevel}
              onChange={(e) => setters.setGradeLevel(e.target.value)}
              className={`${selectStyle} pl-10`}
            >
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
        </div>

        <div>
          <label className={labelStyle}>Dificultad</label>
          <div className="relative">
            <Gauge size={16} className="absolute left-3 top-3 text-slate-400" />
            <select
              value={difficulty}
              onChange={(e) => setters.setDifficulty(e.target.value)}
              className={`${selectStyle} pl-10`}
            >
              <option value="easy">Básico (Repaso)</option>
              <option value="medium">Medio (Estándar)</option>
              <option value="hard">Alto (Avanzado)</option>
              <option value="progressive">Progresivo (Sube Nivel)</option>
              <option value="olympic">Olímpico (Competencia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* FILA 2: TEMA */}
      <div>
        <label className={labelStyle}>Tema Específico</label>
        <div className="relative group">
          <Search
            size={16}
            className="absolute left-3 top-3 text-indigo-400 group-focus-within:text-indigo-600 transition-colors"
          />
          <input
            type="text"
            value={specificTopic}
            onChange={(e) => setters.setSpecificTopic(e.target.value)}
            placeholder="Ej: Polinomios, Leyes de Newton..."
            className={`${inputStyle} pl-10 font-bold`}
          />
        </div>
      </div>

      {/* FILA 3: MOTOR, PREGUNTAS, TIEMPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className={labelStyle}>Motor IA</label>
          <div className="relative">
            <Cpu size={16} className="absolute left-3 top-3 text-slate-400" />
            <select
              value={aiModel}
              onChange={(e) => setters.setAiModel(e.target.value)}
              className={`${selectStyle} pl-10`}
            >
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-flash">Gemini Flash</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="deepseek-chat">DeepSeek</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelStyle}>Preguntas</label>
          <div className="relative">
            <Hash size={16} className="absolute left-3 top-3 text-slate-400" />
            <select
              value={numQuestions}
              onChange={(e) => setters.setNumQuestions(Number(e.target.value))}
              className={`${selectStyle} pl-10`}
            >
              <option value="5">5 preguntas</option>
              <option value="10">10 preguntas</option>
              <option value="15">15 preguntas</option>
              <option value="20">20 preguntas</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelStyle}>Tiempo (Min)</label>
          <div className="relative">
            <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="number"
              min="10"
              max="180"
              value={timeLimit}
              onChange={(e) => setters.setTimeLimit(Number(e.target.value))}
              className={`${inputStyle} pl-10`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
