import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Calendar,
  Loader2,
  BookOpen,
  GraduationCap,
  Layers,
  Bookmark,
  File, // Icono para el botón de auditoría
} from "lucide-react";

// URL base (Mantenemos tu configuración original)
const API_URL = "http://localhost:3000";

export const UploadForm = ({ onSuccess }) => {
  // --- ESTADOS ---
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Metadatos
  const [cursoSelect, setCursoSelect] = useState("");
  const [grado, setGrade] = useState("5to Primaria");
  const [source, setSource] = useState("Libro Escolar");
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [temasRaw, setTemasRaw] = useState("");

  // Lista de cursos dinámica
  const [customCourses, setCustomCourses] = useState([]);

  // Generador de años
  const years = Array.from({ length: 20 }, (_, i) => currentYear + 1 - i);

  // --- 1. CARGAR CURSOS DESDE BASE DE DATOS ---
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/rag/courses`);
        if (res.ok) {
          const data = await res.json();
          setCustomCourses(data || []);
          if (data.length > 0 && !cursoSelect) {
            const val = typeof data[0] === "object" ? data[0].name : data[0];
            setCursoSelect(val);
          }
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
      }
    };
    loadCourses();
  }, []);

  // --- 2. FUNCION DEL SEMÁFORO (AUDITORÍA) --- ¡INTACTA! ---
  const handleManageFiles = async () => {
    Swal.fire({
      title: "Auditando integridad...",
      didOpen: () => Swal.showLoading(),
    });

    let files = [];
    try {
      // IMPORTANTE: Esto usa el endpoint que devuelve los archivos crudos
      const res = await fetch(`${API_URL}/rag/files`);
      if (res.ok) files = await res.json();
      Swal.close();
    } catch (e) {
      Swal.close();
      return Swal.fire("Error", "No se pudo conectar con el RAG.", "error");
    }

    if (files.length === 0)
      return Swal.fire("Vacio", "No hay archivos en el RAG.", "info");

    await Swal.fire({
      title: "Auditoría de Archivos RAG",
      html: `
        <div class="text-left max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div class="mb-3 text-xs bg-slate-50 p-2 rounded border border-slate-100 flex gap-3">
             <p class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> OK</p>
             <p class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> ERROR (Borrar)</p>
          </div>
          ${files
            .map((f) => {
              // Asumimos que el backend manda un status 'ok' o similar si se procesó bien
              const isOk = f.status === "ok" || f.vector_count > 0;
              return `
             <div class="flex justify-between items-center p-2 border-b border-slate-100 mb-2 rounded hover:bg-slate-50 transition-colors ${
               !isOk ? "bg-red-50" : ""
             }">
                <div class="flex items-center gap-3 overflow-hidden">
                   <span class="w-3 h-3 rounded-full flex-shrink-0 ${
                     isOk
                       ? "bg-emerald-500"
                       : "bg-red-500 animate-pulse shadow-sm shadow-red-500/50"
                   }"></span>
                   <div class="flex flex-col overflow-hidden">
                      <span class="text-xs font-bold text-slate-700 truncate" title="${
                        f.source_filename
                      }">${f.source_filename}</span>
                      <span class="text-[10px] text-slate-400 flex gap-2">
                          <span>${f.course}</span> • <span>${
                f.source || "N/A"
              }</span>
                      </span>
                   </div>
                </div>
                <button id="del-${
                  f.id
                }" class="p-1.5 text-slate-300 hover:text-white hover:bg-red-500 rounded transition-all" title="Eliminar del RAG">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c0-1-1-2-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
             </div>
             `;
            })
            .join("")}
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: { popup: "rounded-2xl" },
      didRender: (popup) => {
        files.forEach((f) => {
          const btn = popup.querySelector(`#del-${f.id}`);
          if (btn) {
            btn.onclick = async () => {
              Swal.close();
              const confirm = await Swal.fire({
                title: `¿Borrar "${f.source_filename}"?`,
                text: "Se eliminará permanentemente de la memoria de la IA.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Sí, borrar",
              });
              if (confirm.isConfirmed) {
                // Ajusta el endpoint según tu backend (query param o ID en ruta)
                await fetch(
                  `${API_URL}/rag/files?filename=${encodeURIComponent(
                    f.source_filename
                  )}`,
                  { method: "DELETE" }
                );
                handleManageFiles(); // Recargar la lista
              }
            };
          }
        });
      },
    });
  };

  // --- 3. SUBIDA DE ARCHIVO ---
  const handleUpload = async () => {
    if (!file)
      return Swal.fire("Falta archivo", "Selecciona un PDF.", "warning");
    if (!cursoSelect)
      return Swal.fire("Falta curso", "Selecciona una asignatura.", "warning");

    setLoading(true);
    try {
      const temasArray = temasRaw
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const formData = new FormData();
      formData.append("file", file);

      const selectedCourseObj = customCourses.find(
        (c) => c.name === cursoSelect || c === cursoSelect
      );
      const courseIdToSend = selectedCourseObj?.id || cursoSelect;

      formData.append("courseId", courseIdToSend);
      formData.append("grade", grado);
      formData.append("source", source);
      formData.append("year", year);
      formData.append("temas", JSON.stringify(temasArray));

      const res = await fetch(`${API_URL}/rag/ingest`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error en el servidor");

      Swal.fire({
        title: "¡Ingesta Completada!",
        text: `Se ha indexado: ${file.name} como ${source}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setFile(null);
      setTemasRaw("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo procesar el archivo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 h-full relative">
      {/* --- BOTÓN DEL SEMÁFORO RESTAURADO (Esquina superior derecha) --- */}
      <div className="absolute -top-12 right-0">
        <button
          onClick={handleManageFiles}
          className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:shadow-md"
          title="Ver estado de archivos en el RAG"
        >
          <File size={12} /> Auditoría RAG
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- COLUMNA IZQUIERDA: METADATOS Y ARCHIVO --- */}
        <div className="space-y-4 pt-4">
          {/* FILA 1: ASIGNATURA */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Layers size={12} /> Asignatura
            </label>
            <select
              value={cursoSelect}
              onChange={(e) => setCursoSelect(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {customCourses.length === 0 ? (
                <option value="">Cargando cursos...</option>
              ) : (
                customCourses.map((c) => {
                  const val = typeof c === "object" ? c.name : c;
                  return (
                    <option key={c.id || val} value={val}>
                      {val}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* FILA 2: GRADO Y AÑO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                <GraduationCap size={12} /> Grado
              </label>
              <select
                value={grado}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none"
              >
                {[
                  "3ro Primaria",
                  "4to Primaria",
                  "5to Primaria",
                  "6to Primaria",
                  "1ro Secundaria",
                  "2do Secundaria",
                  "3ro Secundaria",
                  "4to Secundaria",
                  "5to Secundaria",
                ].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Año
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FILA 3: FUENTE / ORIGEN (DISEÑO UNIFICADO - Color corregido) */}
          {/* Antes era bg-indigo-50, ahora es simple div para que coincida con los demás */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Bookmark size={12} /> Fuente de Conocimiento
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Libro Escolar">
                📚 Libro Escolar (Minedu/Santillana)
              </option>
              <option value="Preuniversitario">
                🎓 Preuniversitario (Aduni/César Vallejo)
              </option>
              <option value="CONAMAT">🏆 CONAMAT / Olimpiadas</option>
              <option value="Canguro Matemático">🦘 Canguro Matemático</option>
              <option value="Material Docente">
                📝 Material Docente Propio
              </option>
              <option value="Otro">📂 Otro</option>
            </select>
          </div>

          {/* DROPZONE */}
          <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center hover:bg-indigo-50 transition-all cursor-pointer relative group h-28 flex flex-col items-center justify-center bg-white">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="text-indigo-600 font-bold text-sm flex flex-col items-center animate-in zoom-in">
                <FileText size={28} className="mb-1" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            ) : (
              <div className="text-slate-400 font-bold text-xs flex flex-col items-center">
                <UploadCloud
                  size={28}
                  className="mb-1 group-hover:text-indigo-500 transition-colors"
                />
                Arrastra PDF aquí
              </div>
            )}
          </div>
        </div>

        {/* --- COLUMNA DERECHA: ÍNDICE --- */}
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-4 lg:mt-0">
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">
            Índice de Temas (Opcional)
          </label>
          <textarea
            value={temasRaw}
            onChange={(e) => setTemasRaw(e.target.value)}
            className="flex-1 w-full p-4 rounded-xl border border-slate-200 text-xs font-mono resize-none outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all bg-white"
            placeholder={`Ejemplo:\n- Números Naturales\n- Ecuaciones de 1er Grado\n- Ángulos...`}
          />

          <div className="mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full py-3 rounded-xl font-black text-xs text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                !file
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30"
              }`}
            >
              {loading ? (
                <>
                  {" "}
                  <Loader2
                    className="animate-spin"
                    size={16}
                  /> PROCESANDO...{" "}
                </>
              ) : (
                <>
                  {" "}
                  <CheckCircle size={16} /> INICIAR INGESTA{" "}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
