import { CheckCircle, Eye, BookOpen } from "lucide-react";

export const RagInventory = () => {
  // 🔥 PASO 1: Datos estáticos con IDs ÚNICOS para el Portafolio
  // No necesitamos 'cleanFileName' aquí porque ya escribimos los nombres limpios
  const demoBooks = [
    {
      id: 1,
      title: "ÁLGEBRA DE BALDOR",
      subject: "ÁLGEBRA",
      fragments: "1250",
      status: "Óptimo",
    },
    {
      id: 2,
      title: "HISTORIA DEL PERÚ - LUMBRERAS",
      subject: "HISTORIA",
      fragments: "840",
      status: "Texto Digital",
    },
    {
      id: 3,
      title: "GEOMETRÍA MODERNA",
      subject: "GEOMETRÍA",
      fragments: "870",
      status: "Híbrido",
    },
    {
      id: 4,
      title: "TRIGONOMETRÍA PLANA",
      subject: "TRIGONOMETRÍA",
      fragments: "670",
      status: "Híbrido",
    },
    {
      id: 5,
      title: "ARITMÉTICA PRE-U",
      subject: "ARITMÉTICA",
      fragments: "810",
      status: "Híbrido",
    },
    {
      id: 6,
      title: "HABILIDAD MATEMÁTICA",
      subject: "RAZONAMIENTO",
      fragments: "740",
      status: "Híbrido",
    },
    {
      id: 7,
      title: "LENGUAJE Y COMUNICACIÓN",
      subject: "LENGUAJE",
      fragments: "670",
      status: "Híbrido",
    },
  ];

  return (
    // 1. MEJORA: Padding responsive (p-4 en móvil, p-6 en PC) para ganar espacio
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-xl mt-6 border border-gray-100">
      {/* 2. MEJORA: Header en columna para móvil, fila para PC */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
          <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
          Biblioteca RAG
        </h2>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-200 whitespace-nowrap">
          Modo Demo Activo
        </span>
      </div>

      {/* 3. MEJORA: Quitamos 'overflow-hidden' para asegurar que el scroll funcione */}
      <div className="rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <th className="py-4 px-6 font-semibold">Estado AI</th>
              <th className="py-4 px-6 font-semibold">Libro de Muestra</th>
              <th className="py-4 px-6 font-semibold text-center">
                Datos Indexados
              </th>
              <th className="py-4 px-6 font-semibold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
            {demoBooks.map((book) => (
              <tr
                key={book.id}
                className="hover:bg-indigo-50/30 transition duration-150"
              >
                <td className="py-4 px-6">
                  <span className="flex items-center gap-2 font-bold py-1.5 px-3 rounded-full text-[10px] w-fit bg-emerald-100 text-emerald-700 uppercase">
                    <CheckCircle size={14} /> {book.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 uppercase">
                      {book.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {book.subject}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-1 rounded border border-slate-200">
                    {book.fragments} vectors
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button className="text-indigo-400 hover:text-indigo-600 transition-colors p-2 bg-indigo-50 rounded-lg">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
