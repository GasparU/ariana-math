import { FileText, UploadCloud } from "lucide-react";


export const FileDropzone = ({ file, onFileChange }) => {

  const isImage = file && file.type.startsWith("image/");

  return (
    <div className="relative group">
      <div
        className={`
      border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer
      ${
        file
          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
          : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }
    `}
      >
        <input
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={onFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />

        {file ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-600 mb-3">
              {/* Mostramos ícono según tipo de archivo */}
              {isImage ? <ImageIcon size={32} /> : <FileText size={32} />}
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">
              {file.name}
            </span>
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">
              {isImage ? "Imagen lista para OCR IA" : "Documento listo"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center group-hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-indigo-500 mb-3">
              <UploadCloud size={32} />
            </div>
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Arrastra PDF o Fotos aquí
            </p>
            {/* 2. CAMBIO DE TEXTO: Informamos que la IA lee todo */}
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Soporta PDFs digitales, escaneados y fotos (OCR Automático)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
