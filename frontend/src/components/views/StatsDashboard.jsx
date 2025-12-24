import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  BookOpen,
  ShieldCheck,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import { api } from "../../services/api";
import MainLayout from "../../components/layout/MainLayout"; // <--- ESTO FALTABA, POR ESO SE BORRÓ EL SIDEBAR

// --- DATOS DUROS DEL PROSPECTO CONAMAT ---
const CONAMAT_SYLLABUS = [
  {
    category: "Aritmética",
    topic: "Conjuntos y Cuantificadores",
    weight: 3,
    status: "Oficial",
    description: "Pertenencia, inclusión, operaciones básicos.",
  },
  {
    category: "Aritmética",
    topic: "Numeración y Valor Posicional",
    weight: 5,
    status: "Oficial",
    description: "Descomposición polinómica, cambios de base.",
  },
  {
    category: "Aritmética",
    topic: "Divisibilidad y Primos",
    weight: 4,
    status: "Oficial",
    description: "Criterios del 2, 3, 5, 7, 11 y MCM/MCD.",
  },
  {
    category: "Aritmética",
    topic: "Fracciones y Decimales",
    weight: 5,
    status: "Oficial",
    description: "Operaciones heterogéneas y generatriz.",
  },
  {
    category: "Álgebra",
    topic: "Teoría de Exponentes",
    weight: 5,
    status: "Oficial",
    description: "Potenciación y radicación en N.",
  },
  {
    category: "Álgebra",
    topic: "Polinomios y Grados",
    weight: 4,
    status: "Oficial",
    description: "Grado relativo, absoluto y valor numérico.",
  },
  {
    category: "Álgebra",
    topic: "Ecuaciones Lineales",
    weight: 5,
    status: "Oficial",
    description: "Planteo de ecuaciones de primer grado.",
  },
  {
    category: "Geometría",
    topic: "Segmentos y Ángulos",
    weight: 5,
    status: "Oficial",
    description: "Operaciones con longitudes y bisectrices.",
  },
  {
    category: "Geometría",
    topic: "Triángulos y Líneas Notables",
    weight: 5,
    status: "Oficial",
    description: "Suma de ángulos, altura, mediana, mediatriz.",
  },
  {
    category: "Geometría",
    topic: "Áreas y Perímetros",
    weight: 4,
    status: "Oficial",
    description: "Regiones sombreadas básicas.",
  },
  {
    category: "Raz. Mat.",
    topic: "Operadores Matemáticos",
    weight: 3,
    status: "Sorpresa",
    description: "Definiciones arbitrarias y tablas.",
  },
  {
    category: "Raz. Mat.",
    topic: "Conteo de Figuras",
    weight: 4,
    status: "Sorpresa",
    description: "Método combinatorio y fórmula.",
  },
  {
    category: "Raz. Mat.",
    topic: "Sucesiones y Series",
    weight: 3,
    status: "Sorpresa",
    description: "Patrones numéricos y gráficos.",
  },
  {
    category: "Raz. Mat.",
    topic: "Planteo de Ecuaciones",
    weight: 5,
    status: "Sorpresa",
    description: "Problemas de edades y móviles.",
  },
];

const StatsDashboard = () => {
  const [realStats, setRealStats] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("matematica");

  const courses = [
    { id: "matematica", label: "Matemática", icon: <TrendingUp size={16} /> },
    { id: "fisica", label: "Física", icon: <Zap size={16} /> },
    { id: "quimica", label: "Química", icon: <Zap size={16} /> },
    { id: "comunicacion", label: "Comunicación", icon: <BookOpen size={16} /> },
    { id: "historia", label: "Historia", icon: <BookOpen size={16} /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.results.getStats();
        setRealStats(data || []);
      } catch (error) {
        console.error("Error cargando stats:", error);
      }
    };
    fetchStats();
  }, []);

  // --- LÓGICA DE FUSIÓN DE DATOS ---
  const getRowsToRender = () => {
    if (selectedCourse === "matematica") {
      return CONAMAT_SYLLABUS.map((staticItem) => {
        // Buscamos si existe un examen real para este tema
        const matches = realStats.filter(
          (r) =>
            r.subject === "matematica" &&
            (staticItem.topic.toLowerCase().includes(r.topic.toLowerCase()) ||
              r.topic.toLowerCase().includes(staticItem.topic.toLowerCase()) ||
              (r.topic.includes("Simulacro") && staticItem.weight >= 4))
        );

        let totalMastery = 0;
        let totalExams = 0;

        if (matches.length > 0) {
          matches.forEach((m) => {
            totalMastery += m.mastery_percentage || 0;
            totalExams += m.exams_taken || 1;
          });
          totalMastery = Math.round(totalMastery / matches.length);
        }

        return {
          ...staticItem,
          mastery: totalExams > 0 ? totalMastery : 0,
          exams_taken: totalExams,
          hasActivity: totalExams > 0,
        };
      });
    }

    // Para otros cursos, solo mostramos lo que hay en BD
    const courseStats = realStats.filter((r) => r.subject === selectedCourse);
    if (courseStats.length === 0) return [];

    return courseStats.map((stat) => ({
      category:
        selectedCourse.charAt(0).toUpperCase() + selectedCourse.slice(1),
      topic: stat.topic,
      status: "Práctica",
      weight: 3,
      description: `Basado en ${stat.exams_taken} evaluaciones`,
      mastery: Math.round(stat.mastery_percentage),
      exams_taken: stat.exams_taken,
      hasActivity: true,
      isOfficial: false,
    }));
  };

  const rows = getRowsToRender();

  const renderStars = (weight) => (
    <div className="flex gap-0.5 justify-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={`${
            i < weight
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-slate-700"
          }`}
        />
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* HEADER DE SECCIÓN */}
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="text-indigo-500" size={24} />
            Historial de Dominio
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Seguimiento del prospecto académico oficial.
          </p>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all border
                ${
                  selectedCourse === course.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }
              `}
            >
              {course.icon}
              {course.label}
            </button>
          ))}
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    <th className="p-4 w-1/4">Categoría / Área</th>
                    <th className="p-4 w-1/3">Tema del Prospecto</th>
                    <th className="p-4 hidden md:table-cell text-center">
                      Tipo
                    </th>
                    <th className="p-4 hidden md:table-cell text-center">
                      Peso
                    </th>
                    <th className="p-4 w-1/4">Progreso Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Categoría */}
                      <td className="p-4 align-middle">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {row.category}
                        </span>
                      </td>

                      {/* Tema */}
                      <td className="p-4 align-middle">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {row.topic}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {row.description}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="p-4 hidden md:table-cell align-middle text-center">
                        {row.status === "Oficial" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                            <ShieldCheck size={10} /> OFICIAL
                          </span>
                        ) : row.status === "Sorpresa" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <Zap size={10} /> SORPRESA
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {row.status}
                          </span>
                        )}
                      </td>

                      {/* Peso */}
                      <td className="p-4 hidden md:table-cell align-middle text-center">
                        {renderStars(row.weight)}
                      </td>

                      {/* Barra de Progreso */}
                      <td className="p-4 align-middle">
                        <div className="w-full max-w-[200px]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[10px] font-black uppercase ${
                                row.mastery > 0
                                  ? "text-slate-700 dark:text-white"
                                  : "text-slate-400"
                              }`}
                            >
                              {row.hasActivity
                                ? `${row.mastery}% Dominado`
                                : "Pendiente"}
                            </span>
                            {row.exams_taken > 0 && (
                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 rounded">
                                {row.exams_taken} intentos
                              </span>
                            )}
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            {row.hasActivity ? (
                              <div
                                className={`h-full transition-all duration-1000 ease-out relative ${
                                  row.mastery >= 80
                                    ? "bg-emerald-500"
                                    : row.mastery >= 50
                                    ? "bg-indigo-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${row.mastery}%` }}
                              >
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                              </div>
                            ) : (
                              // Patrón rayado para indicar pendiente
                              <div className="w-full h-full opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Estado vacío para otros cursos
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                <BookOpen size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Sin datos registrados para{" "}
                {courses.find((c) => c.id === selectedCourse)?.label}
              </p>
              <p className="text-xs mt-1">
                Genera una misión de este curso para ver el progreso.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StatsDashboard;
