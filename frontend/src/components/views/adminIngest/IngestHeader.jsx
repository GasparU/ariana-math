import { Database } from 'lucide-react';


export const IngestHeader = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
        <Database size={28} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Centro de Ingesta
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Entrena a la IA subiendo exámenes y material educativo.
        </p>
      </div>
    </div>
  );
}
