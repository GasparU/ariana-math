import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { BookOpen, Sparkles } from "lucide-react";

const uploadOptions = [
  { id: "opt1", title: "Álgebra", desc: "Compendio de Lumbreras" },
  { id: "opt2", title: "Material de Historia", desc: "Compendio de Lumbreras" },
  { id: "opt3", title: "Geometría", desc: "Compendio de Lumbreras" },
  { id: "opt4", title: "Trigonometría", desc: "Compendio de Lumbreras" },
  { id: "opt5", title: "Aritmética", desc: "Compendio de Lumbreras" },
  { id: "opt6", title: "Habilidad Matemática", desc: "Compendio de Lumbreras" },
  { id: "opt7", title: "Lenguaje", desc: "Compendio de Lumbreras" },
];

const AdminIngest = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uploadOptions.map((opt) => (
            <div
              key={opt.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col items-center text-center group hover:border-indigo-500 transition-all"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm mb-1">
                {opt.title}
              </h3>
              <p className="text-xs text-slate-400 mb-6">{opt.desc}</p>

              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles size={14} /> Simular Ingesta RAG
              </button>
            </div>
          ))}
        </div>

        {/* NOTA PARA EL RECLUTADOR */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
            Nota: Para proteger cuotas de API, la subida de archivos está en
            modo simulación. Los vectores ya están disponibles en la base de
            datos.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminIngest;
