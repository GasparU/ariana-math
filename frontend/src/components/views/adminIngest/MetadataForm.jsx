import { AlertCircle, CheckCircle } from "lucide-react";


export const MetadataForm = ({ values, setters, uploading }) => {
    const labelClass =
      "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
    const inputClass =
      "w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* FUENTE */}
        <div>
          <label className={labelClass}>Fuente / Academia</label>
          <select
            value={values.source}
            onChange={(e) => setters.setSource(e.target.value)}
            className={inputClass}
          >
            <option value="Conamat">Conamat</option>
            <option value="Canguro">Canguro Matemático</option>
            <option value="Tesla">Academia Tesla</option>
            <option value="Escolar">Escolar</option>
            <option value="Agustino">San Agustín</option>
            <option value="Preuniversitario">Libro Pre-U</option>
            <option value="Minedu">Minedu / ECE</option>
          </select>
        </div>

        {/* AÑO */}
        <div>
          <label className={labelClass}>Año de Publicación</label>
          <input
            type="number"
            value={values.year}
            onChange={(e) => setters.setYear(e.target.value)}
            className={inputClass}
            placeholder="Ej: 2024"
          />
        </div>

        {/* GRADO */}
        <div>
          <label className={labelClass}>Grado Objetivo</label>
          <select
            value={values.grade}
            onChange={(e) => setters.setGrade(e.target.value)}
            className={inputClass}
          >
            <option value="4to Primaria">4to Primaria</option>
            <option value="5to Primaria">5to Primaria</option>
            <option value="6to Primaria">6to Primaria</option>
            <option value="1ro Secundaria">1ro Secundaria</option>
            <option value="2do Secundaria">2do Secundaria</option>
            <option value="3ro Secundaria">3ro Secundaria</option>
            <option value="4to Secundaria">4to Secundaria</option>
            <option value="5to Secundaria">5to Secundaria</option>
          </select>
        </div>

        {/* MATERIA */}
        <div>
          <label className={labelClass}>Materia</label>
          <select
            value={values.subject}
            onChange={(e) => setters.setSubject(e.target.value)}
            className={inputClass}
          >
            <option value="matematica">Matemática</option>
            <option value="comunicacion">Comunicación</option>
            <option value="historia">Historia</option>
            <option value="ciencia">Ciencia y Tec.</option>
            <option value="fisica">Física</option>
            <option value="quimica">Química</option>
          </select>
        </div>

        {/* FASE / ETAPA */}
        <div className="lg:col-span-2">
          <label className={labelClass}>Etapa de Competencia</label>
          <div className="relative">
            <select
              value={values.stage}
              onChange={(e) => setters.setStage(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="general">📚 General / Práctica de Clase</option>
              <option value="eliminatoria">🏃 Eliminatoria / Selección</option>
              <option value="final">🏆 Gran Final Nacional</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
              <AlertCircle size={14} />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className={`
          w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-2
          ${
            uploading
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 transform active:scale-[0.99]"
          }
        `}
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            Procesando Documento...
          </>
        ) : (
          <>
            Subir a la Memoria <CheckCircle size={18} />
          </>
        )}
      </button>
    </div>
  );
};
