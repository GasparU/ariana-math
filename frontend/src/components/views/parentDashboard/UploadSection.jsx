import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const UploadSection = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  // Estados para metadatos
  const [curso, setCurso] = useState("matematica");
  const [grado, setGrado] = useState("5to Primaria");
  const [temasRaw, setTemasRaw] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    try {
      // 1. Convertir el texto del textarea a Array
      // Separa por saltos de línea, quita espacios y vacíos
      const temasArray = temasRaw
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", curso); // Importante: 'algebra', 'geometria'
      formData.append("grade", grado);
      formData.append("source", "Libro Escolar"); // O selector de fuente

      // Enviamos el array de temas como JSON String
      formData.append("topics", JSON.stringify(temasArray));

      // 2. Enviar al Backend (Asegúrate de que la URL sea correcta)
      // Ajusta la URL si tu backend está en otro puerto
      await axios.post(`${API_BASE_URL}/rag/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      setFile(null);
      setTemasRaw(""); // Limpiar campo
    } catch (error) {
      console.error("Error subiendo:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-indigo-600" />
        Cargar Biblioteca (RAG)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: Archivo y Curso */}
        <div className="space-y-4">
          {/* Selector de Curso */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Curso / Asignatura
            </label>
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="matematica">Matemática General</option>
              <option value="aritmetica">Aritmética</option>
              <option value="algebra">Álgebra</option>
              <option value="geometria">Geometría</option>
              <option value="razonamiento">Razonamiento Matemático</option>
            </select>
          </div>

          {/* Selector de Grado */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Grado
            </label>
            <select
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="5to Primaria">5to Primaria</option>
              <option value="6to Primaria">6to Primaria</option>
              <option value="1ro Secundaria">1ro Secundaria</option>
              <option value="5to Secundaria">5to Secundaria</option>
            </select>
          </div>

          {/* Input Archivo */}
          <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl p-6 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
                <FileText size={24} />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="text-slate-400">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="text-xs font-bold">
                  Arrastra tu PDF aquí o haz clic
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Lista de Temas */}
        <div className="flex flex-col h-full">
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Índice de Temas (Copiar y Pegar)
          </label>
          <textarea
            value={temasRaw}
            onChange={(e) => setTemasRaw(e.target.value)}
            placeholder={`Ejemplo:\nSegmentos\nÁngulos\nTriángulos Notables\n...`}
            className="flex-1 w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            * Cada línea será guardada como un tema disponible para este curso.
          </p>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "success" && (
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <CheckCircle size={14} /> ¡Carga Exitosa!
            </span>
          )}
          {status === "error" && (
            <span className="text-red-500 text-xs font-bold flex items-center gap-1">
              <AlertCircle size={14} /> Error al subir
            </span>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all ${
            !file || loading
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30"
          }`}
        >
          {loading ? "Procesando con IA..." : "Subir a la Biblioteca"}
        </button>
      </div>
    </div>
  );
};
