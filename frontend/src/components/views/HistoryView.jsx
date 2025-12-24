
import React, { useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  FileText,
  Calendar,
  BarChart2,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HistoryView = ({ userRole }) => {
  const [items, setItems] = useState([]); // Lista unificada (Exámenes + Resultados)
  const [statsData, setStatsData] = useState([]); // Solo para la gráfica
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Cargamos TODO: Exámenes (asignados) y Resultados (hechos)
      const [examsRes, resultsRes] = await Promise.all([
        api.exams.list(),
        api.results.listByStudent("Ariana"), // O getHistory() si es admin general
      ]);

      const allExams = examsRes.data || examsRes || [];
      const allResults = resultsRes || [];

      // 2. Fusionamos inteligentemente
      const mergedList = allExams.map((exam) => {
       
        const result = allResults.find((r) => r.exam_id === exam.id);
        const masterTime = exam.time_limit || exam.timeLimit || 45; // Rescatamos el tiempo
      

        if (result) {
          return {
            ...result, 
            uniqueId: `res-${result.id}`, 
            type: "completed",
            originalExamId: exam.id, 
            displayDate: result.created_at,
            time_limit: masterTime,
            total_questions:
              exam.num_questions || exam.content?.questions?.length || 0,
            topic: result.exams?.topic || exam.topic,
            subject: result.exams?.subject || exam.subject,
          };
        } else {
          return {
            ...exam, 
            uniqueId: `exam-${exam.id}`,
            type: "pending",
            score: null, 
            total_questions:
              exam.num_questions || exam.content?.questions?.length || 0,
            displayDate: exam.created_at,
            time_limit: masterTime,
          };
        }
      });

      // 3. Ordenamos por fecha (lo más reciente primero)
      const sorted = mergedList.sort(
        (a, b) => new Date(b.displayDate) - new Date(a.displayDate)
      );
      setItems(sorted);

      // 4. Preparamos datos SOLO para la gráfica (filtramos solo los completados)
      const chartData = sorted.filter((i) => i.type === "completed").reverse(); // Para que la gráfica vaya de izquierda (viejo) a derecha (nuevo)
      setStatsData(chartData);
    } catch (e) {
      console.error("Error cargando bitácora:", e);
    }
  };

  const handleDelete = async (item) => {
    const isPending = item.type === "pending";

    const result = await Swal.fire({
      title: isPending ? "¿Retirar Misión?" : "¿Borrar Resultado?",
      text: isPending
        ? "La misión desaparecerá del tablero del estudiante. No podrá resolverla."
        : "Se eliminará la calificación y el registro de este intento.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1e293b",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (isPending) {
          // Si está pendiente, borramos el EXAMEN (la asignación)
          await api.exams.delete(item.id);
        } else {
          // Si está completo, borramos el RESULTADO (el intento)
          // Nota: Si quieres borrar también el examen base, tendrías que llamar a ambas APIs,
          // pero usualmente solo se borra el intento para que lo den de nuevo.
          await api.results.delete(item.id);
        }

        await Swal.fire({
          title: "Eliminado",
          text: "Registro actualizado correctamente.",
          icon: "success",
          background: "#1e293b",
          color: "#fff",
        });
        loadData(); // Recargar tabla
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "No se pudo realizar la acción.", "error");
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 pb-10">
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <BarChart2 className="text-indigo-500" size={24} />
            Bitácora de Misiones
          </h2>
          <p className="text-sm text-slate-500">
            Gestión de tareas asignadas y resultados obtenidos.
          </p>
        </div>

        {/* TABLA DE GESTIÓN */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="p-4">Estado</th>
                  <th className="p-4">Tema</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-center">Nota</th>
                  <th className="p-4">Tiempo</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item) => (
                  <tr
                    key={item.uniqueId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* COLUMNA ESTADO (NUEVO) */}
                    <td className="p-4 w-32">
                      {item.type === "completed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 tracking-wide">
                          <CheckCircle size={10} strokeWidth={3} /> Resuelto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200 tracking-wide">
                          <Clock size={10} strokeWidth={3} /> Pendiente
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            item.type === "completed"
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-white text-sm line-clamp-1">
                            {item.topic}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {item.subject} • {item.difficulty || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Calendar size={14} />
                        {new Date(item.displayDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {item.type === "completed" ? (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            item.score / item.total_questions > 0.7
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {item.score} / 20
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold">
                          -- / 20
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> {item.time_limit} min
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botón Ver: Solo si está completo lleva al review. Si no, no hace nada (o podría llevar al preview) */}
                        {item.type === "completed" && (
                          <button
                            onClick={() => navigate(`/review/${item.exam_id}`)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="Ver corrección y respuestas"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        {/* Botón Eliminar: Funciona para ambos casos */}
                        {userRole === "parent" && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title={
                              item.type === "pending"
                                ? "Retirar asignación"
                                : "Borrar intento"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* GRÁFICO DE RENDIMIENTO */}
            {statsData.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm m-6 mt-0">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 size={16} className="text-indigo-500" />{" "}
                      Tendencia de Notas
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Esta gráfica muestra la evolución del rendimiento
                      académico. La línea azul traza las notas obtenidas (0-20)
                      a lo largo del tiempo.
                      <br />
                      <strong>Objetivo:</strong> Mantener la tendencia
                      ascendente.
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="created_at"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 20]}
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#1e293b",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#818cf8" }}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Nota"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{
                          fill: "#6366f1",
                          r: 4,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 6, fill: "#4f46e5" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryView;