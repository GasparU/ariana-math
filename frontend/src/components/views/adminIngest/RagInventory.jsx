// import React, { useEffect, useState } from "react";
// import { api } from "../../../services/api";
// import {
//   Library,
//   Plus,
//   Trash2,
//   BookOpen,
//   AlertCircle,
//   ChevronDown,
//   ChevronRight,
//   Hash,
//   Check,
// } from "lucide-react";
// import Swal from "sweetalert2";

// export const RagInventory = () => {
//   const [dataView, setDataView] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedId, setExpandedId] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const ragFilesRaw = (await api.rag.getAll()) || [];

//       let dbCoursesRaw = [];
//       try {
//         const res = await api.courses.getAll();
//         dbCoursesRaw = Array.isArray(res) ? res : [];
//       } catch (e) {
//         console.warn(e);
//       }

//       const groupedByName = {};
//       ragFilesRaw.forEach((f) => {
//         let rawName = f.course || f.curso || f.subject || "Sin Asignar";
//         if (typeof rawName === "string") {
//           rawName = rawName.trim();
//           const displayName =
//             rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
//           if (!groupedByName[displayName]) groupedByName[displayName] = [];
//           groupedByName[displayName].push(f);
//         }
//       });

//       const finalView = Object.entries(groupedByName).map(
//         ([courseName, files]) => {
//           const matchInDb = dbCoursesRaw.find(
//             (c) =>
//               c && c.name && c.name.toLowerCase() === courseName.toLowerCase()
//           );
//           return {
//             displayName: courseName,
//             filesCount: files.length,
//             dbId: matchInDb ? matchInDb.id : null,
//             topics:
//               matchInDb && Array.isArray(matchInDb.topics)
//                 ? matchInDb.topics
//                 : [],
//           };
//         }
//       );

//       setDataView(finalView);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleExpand = (name) => {
//     setExpandedId(expandedId === name ? null : name);
//   };

//   // --- AÑADIR TEMA ---
//   const handleAddTopic = async (courseItem) => {
//     let courseId = courseItem.dbId;
//     let currentTopics = courseItem.topics;

//     // Si no existe el curso en BD, lo creamos
//     if (!courseId) {
//       try {
//         const newCourse = await api.courses.create({
//           name: courseItem.displayName,
//           description: "RAG Detectado",
//         });
//         courseId = newCourse.id;
//         currentTopics = [];
//       } catch (e) {
//         return Swal.fire(
//           "Error",
//           "No se pudo registrar el curso base.",
//           "error"
//         );
//       }
//     }

//     const nextNum = currentTopics.length + 1;

//     const { value: newTopic } = await Swal.fire({
//       title: `Nuevo Tema #${nextNum}`,
//       input: "text",
//       inputPlaceholder: `Ej: Productos Notables`,
//       showCancelButton: true,
//       confirmButtonText: "Guardar",
//       confirmButtonColor: "#4f46e5",
//     });

//     if (newTopic) {
//       try {
//         if (
//           currentTopics.some((t) => t.toLowerCase() === newTopic.toLowerCase())
//         )
//           return Swal.fire("Aviso", "El tema ya existe.", "warning");

//         // Añadir al final para mantener orden cronológico
//         const updatedTopics = [...currentTopics, newTopic];

//         await api.courses.update(courseId, {
//           name: courseItem.displayName,
//           topics: updatedTopics,
//         });

//         // Recargar vista inmediatamente
//         await fetchData();

//         const Toast = Swal.mixin({
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//           timer: 1500,
//         });
//         Toast.fire({ icon: "success", title: "Tema Agregado" });
//       } catch (e) {
//         Swal.fire("Error", "No se pudo guardar el tema.", "error");
//       }
//     }
//   };

//   // --- BORRAR TEMA ---
//   const handleDeleteTopic = async (courseItem, topicToDelete) => {
//     if (!courseItem.dbId) return;
//     const confirm = await Swal.fire({
//       title: "¿Borrar tema?",
//       text: "Esto cambiará la numeración de los siguientes temas.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Sí, borrar",
//     });
//     if (confirm.isConfirmed) {
//       try {
//         const updatedTopics = courseItem.topics.filter(
//           (t) => t !== topicToDelete
//         );
//         await api.courses.update(courseItem.dbId, {
//           name: courseItem.displayName,
//           topics: updatedTopics,
//         });
//         await fetchData();
//       } catch (e) {
//         Swal.fire("Error", "No se pudo eliminar", "error");
//       }
//     }
//   };

//   if (loading)
//     return (
//       <div className="p-10 text-center text-slate-400 animate-pulse">
//         Cargando temarios...
//       </div>
//     );

//   if (dataView.length === 0)
//     return (
//       <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/50">
//         <BookOpen size={32} className="mb-2 opacity-30 text-indigo-300" />
//         <p className="text-sm font-bold">RAG Vacío</p>
//       </div>
//     );

//   return (
//     <div className="flex flex-col gap-3 animate-in fade-in">
//       {dataView.map((item, idx) => {
//         const isExpanded = expandedId === item.displayName;
//         const isRegistered = !!item.dbId;
//         const nextTopicNum = item.topics.length + 1;

//         // Clave única para el div principal
//         return (
//           <div
//             key={item.dbId || idx}
//             className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 overflow-hidden ${
//               isExpanded
//                 ? "border-indigo-200 shadow-md ring-1 ring-indigo-100"
//                 : "border-slate-200 shadow-sm hover:border-indigo-300"
//             }`}
//           >
//             {/* CABECERA */}
//             <div
//               onClick={() => toggleExpand(item.displayName)}
//               className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
//             >
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`p-2.5 rounded-lg transition-colors ${
//                     isExpanded
//                       ? "bg-indigo-600 text-white"
//                       : "bg-slate-100 text-slate-500"
//                   }`}
//                 >
//                   <Library size={20} />
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
//                     {item.displayName}
//                   </h3>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-[10px] font-bold text-slate-500">
//                       {item.filesCount} Archivos fuente
//                     </span>

//                     {!isRegistered ? (
//                       <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
//                         <AlertCircle size={10} /> Nuevo
//                       </span>
//                     ) : (
//                       <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
//                         <Check size={10} /> {item.topics.length} Temas
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="text-slate-400">
//                 {isExpanded ? (
//                   <ChevronDown size={20} />
//                 ) : (
//                   <ChevronRight size={20} />
//                 )}
//               </div>
//             </div>

//             {/* CUERPO EXPANDIDO */}
//             {isExpanded && (
//               <div className="border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2">
//                 <div className="p-5">
//                   <div className="flex justify-between items-center mb-4">
//                     <div className="flex items-center gap-2">
//                       <Hash size={14} className="text-indigo-500" />
//                       <h4 className="text-xs font-bold uppercase text-slate-600">
//                         Lista de Temas (Orden Numérico)
//                       </h4>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleAddTopic(item);
//                       }}
//                       className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95"
//                     >
//                       <Plus size={12} /> Añadir Tema #{nextTopicNum}
//                     </button>
//                   </div>

//                   {/* LISTA DE TEMAS */}
//                   <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden shadow-sm">
//                     {item.topics.length > 0 ? (
//                       <div className="divide-y divide-slate-100">
//                         {item.topics.map((topic, i) => (
//                           <div
//                             key={i}
//                             className="group flex items-center justify-between px-4 py-3 hover:bg-indigo-50/30 transition-colors"
//                           >
//                             <div className="flex items-center gap-3">
//                               {/* NÚMERO */}
//                               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
//                                 {i + 1}
//                               </span>
//                               <span className="text-xs font-bold text-slate-700">
//                                 {topic}
//                               </span>
//                             </div>
//                             <button
//                               onClick={() => handleDeleteTopic(item, topic)}
//                               className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
//                               title="Eliminar tema"
//                             >
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center py-8 text-slate-400">
//                         <p className="text-xs italic">Lista vacía.</p>
//                         <p className="text-[10px] mt-1">
//                           Pulsa añadir para empezar.
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import {
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  Type,
  BookOpen, // Nuevo icono para decorar
} from "lucide-react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3000";

export const RagInventory = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de cursos visuales (para auditoría)
  const cursosVisuales = [
    "geometria",
    "fisica",
    "trigonometria",
    "algebra",
    "razonamiento matematico",
    "habilidad matematica",
    "aritmetica",
  ];

  // --- FUNCIÓN DE LIMPIEZA ESTÉTICA (LA MAGIA) ---
  const cleanFileName = (filename) => {
    if (!filename) return "SIN NOMBRE";

    // 1. Quitar extensiones y etiquetas técnicas
    let clean = filename
      .replace(/_compressed/gi, "")
      .replace(/\.pdf$/gi, "")
      .replace(/_/g, " ")
      .replace(/-/g, " ");

    // 2. Quitar símbolos "feos" específicos de libros escolares (6°, 5to, etc.)
    clean = clean
      .replace(/[°º]/g, "") // Quita el símbolo de grado (°)
      .replace(/\d+to/gi, "") // Quita "5to", "4to"
      .replace(/\d+ro/gi, "") // Quita "1ro"
      .replace(/\d+°/g, ""); // Quita números seguidos de grado

    // 3. (Opcional) Si quieres quitar TODOS los números para que solo diga "HISTORIA"
    // Descomenta la siguiente línea si prefieres que no salga "6":
    // clean = clean.replace(/[0-9]/g, "");

    return clean.trim().toUpperCase();
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/rag/files`);
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (course, filename) => {
    const result = await Swal.fire({
      title: "¿Borrar este libro?",
      text: `Se eliminará el contenido de: ${cleanFileName(filename)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const query = `?course=${encodeURIComponent(
          course
        )}&topic=${encodeURIComponent(filename)}`;
        await fetch(`${API_URL}/rag/topic${query}`, { method: "DELETE" });
        Swal.fire("Eliminado", "El libro ha sido borrado.", "success");
        fetchFiles();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  // --- LÓGICA DEL SEMÁFORO INTELIGENTE ---
  const analyzeStatus = (file) => {
    const labels = file.topics || [];
    const isOCR = labels.some((t) => t.includes("OCR") || t.includes("Vision"));
    const isHybrid = labels.some(
      (t) => t.includes("Híbrido") || t.includes("Fusión")
    );
    const isRescue = labels.some((t) => t.includes("Rescate"));

    // Colores y Mensajes
    if (!file.topics || file.topics.length === 0)
      return {
        color: "bg-red-100 text-red-600",
        icon: <XCircle size={18} />,
        msg: "Error",
      };

    if (isHybrid || isOCR)
      return {
        color: "bg-purple-100 text-purple-700",
        icon: <Eye size={18} />,
        msg: "Híbrido (Óptimo)",
      };

    if (isRescue)
      return {
        color: "bg-blue-100 text-blue-700",
        icon: <CheckCircle size={18} />,
        msg: "Texto Completo",
      };

    const curso = file.course ? file.course.toLowerCase() : "";
    const requiereVision = cursosVisuales.some((c) => curso.includes(c));

    if (requiereVision && !isOCR && !isRescue)
      return {
        color: "bg-yellow-100 text-yellow-700",
        icon: <AlertTriangle size={18} />,
        msg: "Revisar Calidad",
      };

    return {
      color: "bg-green-100 text-green-700",
      icon: <Type size={18} />,
      msg: "Texto Digital",
    };
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl mt-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          Biblioteca de Conocimiento
        </h2>
        <button
          onClick={fetchFiles}
          className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition duration-300 shadow-sm"
          title="Actualizar lista"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <th className="py-4 px-6 font-semibold">Estado</th>
              <th className="py-4 px-6 font-semibold">Libro / Curso</th>
              <th className="py-4 px-6 font-semibold text-center">
                Fragmentos (Datos)
              </th>
              <th className="py-4 px-6 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
            {files.map((file, index) => {
              const status = analyzeStatus(file);
              const fragments =
                file.topics
                  ?.find((t) => t.includes("Fragmentos"))
                  ?.split(":")[1] || "0";

              return (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  {/* Columna Estado */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`flex items-center gap-2 font-bold py-1.5 px-3 rounded-full text-xs w-fit shadow-sm ${status.color}`}
                    >
                      {status.icon} {status.msg}
                    </span>
                  </td>

                  {/* Columna Nombre Limpio */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-gray-800">
                        {cleanFileName(file.source_filename)}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5 capitalize">
                        Materia: {file.course}
                      </span>
                    </div>
                  </td>

                  {/* Columna Fragmentos */}
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block bg-gray-100 text-gray-700 font-mono text-xs px-2 py-1 rounded border border-gray-200">
                      {fragments} blocks
                    </span>
                  </td>

                  {/* Columna Acciones */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() =>
                        handleDelete(file.course, file.source_filename)
                      }
                      className="text-gray-400 hover:text-red-500 transform hover:scale-110 transition duration-200"
                      title="Eliminar libro de la memoria"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {files.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-400 italic"
                >
                  No hay libros cargados. Sube un PDF para empezar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};