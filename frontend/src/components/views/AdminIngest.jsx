import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { UploadForm } from "./adminIngest/UploadForm";
import { Database, UploadCloud } from "lucide-react";

const AdminIngest = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
            <Database size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Centro de Ingesta IA
            </h2>
            <p className="text-sm text-slate-500">
              Sube material educativo para potenciar el cerebro de Ariana.
            </p>
          </div>
        </div>

        {/* CONTENEDOR DE SUBIDA (SOLO ESTO) */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-xs font-bold text-indigo-500 uppercase tracking-widest border-b border-slate-100 pb-3">
            <UploadCloud size={16} /> Nueva Fuente de Conocimiento
          </div>

          {/* El formulario recuperado con Fuente, Año, etc. */}
          <UploadForm
            onSuccess={() => {
              // Aquí podrías poner una notificación o redirigir a cursos
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminIngest;
