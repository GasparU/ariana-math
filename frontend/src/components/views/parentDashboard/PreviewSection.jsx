
import { useState } from "react";
import {
  Trash2,
  Save,
  X,
  Edit3,
  Check,
  Maximize2,
  AlertCircle,
  Type,
  List,
} from "lucide-react";
import MathGraph from "../../features/exam/MathGraph";
import MathText from "./../../common/MathText";

export const PreviewSection = ({
  exam,
  onUpdateExam,
  onApprove,
  onDiscard,
  isLoading,
  aiModel,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editorTab, setEditorTab] = useState("text");

  // Helper para actualizar preguntas
  const updateQuestion = (qId, changes) => {
    const updatedQuestions = exam.questions.map((q) =>
      q.id === qId ? { ...q, ...changes } : q
    );
    onUpdateExam({ ...exam, questions: updatedQuestions });
  };

  // 🔥 LIMPIEZA QUIRÚRGICA REFORZADA (SOLUCIÓN A "INFTY" Y "U")
  const cleanDisplay = (text) => {
    if (!text) return "";
    let clean = String(text);

    // 1. Limpieza General
    clean = clean
      .normalize("NFD")
      .replace(/[\u0300-\u036f\u203e\u00af]/g, "")
      .replace(/\\cdot/g, "")
      .replace(/infty/g, "\\infty")
      .replace(/\\+infty/g, "\\infty")
      .replace(/\\s+U\\s+/g, " \\cup ")
      .replace(/<=/g, "\\le")
      .replace(/>=/g, "\\ge")
      .replace(/([^\\])frac\{/g, "$1\\frac{")
      .replace(/^frac\{/g, "\\frac{")
      .replace(/<=/g, "\\le")
      .replace(/>=/g, "\\ge")
      .replace(/\\n/g, " ")
      .replace(/\\n/g, "\n")
      .replace(/\.\n/g, "\n")
      .replace(/[\r\n]+/g, "\n")
      .replace(/\\n/g, "\n")
      .trim();

    // 2. PARCHES DE EMERGENCIA (Aquí arreglamos lo que la IA mande mal)
    clean = clean
      .replace(/\\cdot/g, "") 
      .replace(/infty/g, "\\infty") 
      .replace(/\\+infty/g, "\\infty") 
      .replace(/\\s+U\\s+/g, " \\cup ") 
      .replace(/<=/g, "\\le") 
      .replace(/>=/g, "\\ge") 
      .replace(/([^\\])frac\{/g, "$1\\frac{")
      .replace(/^frac\{/g, "\\frac{")
      .replace(/<=/g, "\\le")
      .replace(/>=/g, "\\ge")
      .replace(/\\n/g, " ")
      .replace(/\\n/g, "\n")
      .replace(/\.\n/g, "\n")
      .replace(/[\r\n]+/g, "\n")
      .replace(/\\n/g, "\n")
      .trim();
      

    // 3. RECONSTRUCCIÓN DE RAÍCES
    clean = clean.replace(
      /\\sqrt\[([\s\S]*?)\]/g,
      (_match, contenidoIndice) => {
        const indiceLimpio = contenidoIndice.replace(/[^0-9a-zA-Z]/g, "");
        if (!indiceLimpio || indiceLimpio === "0" || indiceLimpio === "1") {
          return "\\sqrt";
        }
        return `\\sqrt[${indiceLimpio}]`;
      }
    );

    // 4. Punto final
    clean = clean.trim();
    if (clean.endsWith(".")) clean = clean.slice(0, -1);

    return clean;
  };

  const formatAnswerKey = (text) => {
    if (!text) return "";
    return text.replace(/^[a-zA-Z0-9]+[\.\)\-]\s*/, "").trim();
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 relative animate-in fade-in">
      {/* HEADER FLOTANTE */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Modo Revisión
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            {exam.questions?.length} Misiones • {aiModel}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} /> DESCARTAR
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transform active:scale-95 transition-all"
          >
            {isLoading ? (
              "GUARDANDO..."
            ) : (
              <>
                <Save size={16} /> APROBAR Y ASIGNAR
              </>
            )}
          </button>
        </div>
      </div>

      {/* LISTA DE PREGUNTAS */}
      <div className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
        {exam.questions?.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col mb-8 overflow-hidden relative"
          >
            {/* CABECERA */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 relative pr-16">
              <div className="flex items-start gap-3">
                <span className="flex-none w-6 h-6 bg-indigo-600 text-white font-bold rounded-md flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug mb-1">
                    <MathText
                      content={cleanDisplay(q.question_text || q.text)}
                    />
                  </h3>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-sm">
                      {exam.subject || "Matemática"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTÓN EDITAR */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(q.id);
                  setEditorTab(q.graph_data ? "graph" : "text");
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors border border-indigo-100 shadow-sm"
                title="Editar pregunta"
              >
                <Edit3 size={18} />
              </button>
            </div>

            {/* ZONA GRÁFICA */}
            {(q.graph_data || q.svgCode) && (
              <div className="w-full h-[300px] bg-slate-50 dark:bg-[#0B0F19] relative border-b border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center z-0">
                {q.graph_data &&
                q.graph_data.elements &&
                q.graph_data.elements.length > 0 ? (
                  <div className="w-full max-w-xl h-full p-4">
                    <MathGraph graphData={q.graph_data} />
                  </div>
                ) : q.svgCode ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: q.svgCode }}
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[300px]"
                  />
                ) : (
                  <div className="opacity-50 text-xs">Gráfico SVG estático</div>
                )}
              </div>
            )}

            {/* OPCIONES Y RESPUESTAS */}
            <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-4 z-10">
              {/* 🔥 CAMBIO DE GRILLA PARA EVITAR SALTO DE LÍNEA */}
              {/* Usamos grid-cols-1 (móvil) y md:grid-cols-2 (tablet/pc). NUNCA 5. */}
              {/* Esto da mucho espacio horizontal a cada opción */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.slice(0, 5).map((opt, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-3 ${
                      (typeof opt === "string" ? opt : opt.text).includes(
                        formatAnswerKey(q.correct_answer)
                      )
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
                        : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {/* Letra A, B, C... fija a la izquierda */}
                    <span className="flex-none font-black text-[10px] opacity-60 w-4">
                      {String.fromCharCode(65 + i)}.
                    </span>

                    {/* Contenido Matemático (ocupa el resto) */}
                    <span className="flex-1 text-left">
                      <MathText
                        content={cleanDisplay(
                          typeof opt === "string" ? opt : opt.text
                        )}
                      />
                    </span>

                    {/* Check si es correcta */}
                    {(typeof opt === "string" ? opt : opt.text).includes(
                      formatAnswerKey(q.correct_answer)
                    ) && (
                      <Check
                        size={16}
                        className="flex-none text-emerald-500 ml-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* BARRA DE CLAVE */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-sm">
                  <Check size={16} strokeWidth={3} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <label className="text-[9px] font-black text-emerald-600/70 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                    Respuesta Correcta
                  </label>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
                    <span className="bg-white dark:bg-emerald-900/40 px-3 py-1 rounded border border-emerald-100 dark:border-emerald-800">
                      <MathText
                        content={cleanDisplay(
                          formatAnswerKey(q.correct_answer)
                        )}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN (Se mantiene igual) */}
      {editingId && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setEditingId(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full h-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                    Editor de Misión
                  </h3>
                  <div className="flex gap-2 text-xs text-slate-400 mt-1">
                    <button
                      onClick={() => setEditorTab("text")}
                      className={`hover:text-indigo-500 ${
                        editorTab === "text"
                          ? "text-indigo-600 font-bold underline decoration-2"
                          : ""
                      }`}
                    >
                      Texto y Claves
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => setEditorTab("graph")}
                      className={`hover:text-indigo-500 ${
                        editorTab === "graph"
                          ? "text-indigo-600 font-bold underline decoration-2"
                          : ""
                      }`}
                    >
                      Gráfico
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2"
                >
                  <Check size={16} /> Guardar
                </button>
              </div>
            </div>

            {/* CONTENIDO MODAL */}
            <div className="flex-1 overflow-hidden flex bg-slate-50 dark:bg-slate-900/50">
              {/* PESTAÑA TEXTO */}
              {editorTab === "text" && (
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const q = exam.questions.find((q) => q.id === editingId);
                    if (!q) return null;
                    return (
                      <div className="max-w-2xl mx-auto space-y-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <Type size={14} /> Enunciado
                          </label>
                          <textarea
                            className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-slate-200 min-h-[120px]"
                            value={q.question_text || q.text || ""}
                            onChange={(e) =>
                              updateQuestion(editingId, {
                                question_text: e.target.value,
                                text: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <List size={14} /> Alternativas
                          </label>
                          <div className="grid gap-3">
                            {q.options.map((opt, idx) => {
                              const txt =
                                typeof opt === "string" ? opt : opt.text;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 group"
                                >
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <input
                                    type="text"
                                    className="flex-1 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-sm"
                                    value={txt}
                                    onChange={(e) => {
                                      const newOptions = [...q.options];
                                      if (typeof newOptions[idx] === "string") {
                                        newOptions[idx] = e.target.value;
                                      } else {
                                        newOptions[idx] = {
                                          ...newOptions[idx],
                                          text: e.target.value,
                                        };
                                      }
                                      updateQuestion(editingId, {
                                        options: newOptions,
                                      });
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      updateQuestion(editingId, {
                                        correct_answer: txt,
                                      })
                                    }
                                    className={`p-2 rounded-full transition-all ${
                                      q.correct_answer.includes(txt)
                                        ? "bg-emerald-500 text-white shadow-lg scale-110"
                                        : "bg-slate-100 text-slate-300 hover:bg-slate-200 group-hover:opacity-100 opacity-50"
                                    }`}
                                    title="Marcar como correcta"
                                  >
                                    <Check size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PESTAÑA GRÁFICO */}
              {editorTab === "graph" && (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* ... (Tu código de MathGraph existente se mantiene igual) ... */}
                  {/* Mantenemos tu bloque de edición gráfica tal cual lo tenías */}
                  <div className="flex-1 bg-slate-50 dark:bg-black/20 p-6 relative flex flex-col">
                    <div className="flex-1 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-2xl overflow-hidden bg-white shadow-inner relative">
                      {exam.questions.find((q) => q.id === editingId)
                        ?.graph_data ? (
                        <MathGraph
                          graphData={
                            exam.questions.find((q) => q.id === editingId)
                              .graph_data
                          }
                          isEditable={true}
                          onGraphChange={(newData) =>
                            updateQuestion(editingId, { graph_data: newData })
                          }
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 text-sm flex-col gap-2">
                          <Maximize2 size={32} />
                          <p>
                            Esta pregunta no tiene gráfico editable (SVG
                            estático o texto puro).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Panel propiedades */}
                  {exam.questions.find((q) => q.id === editingId)
                    ?.graph_data && (
                    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-6 overflow-y-auto custom-scrollbar shadow-xl z-10">
                      {/* ... tus inputs de edición gráfica ... */}
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertCircle size={14} /> Editar Etiquetas
                      </h4>
                      <div className="space-y-4">
                        {exam.questions
                          .find((q) => q.id === editingId)
                          .graph_data.elements.map((el, i) => ({
                            ...el,
                            idx: i,
                          }))
                          .filter((el) => ["text", "angle"].includes(el.type))
                          .map((el) => (
                            <div
                              key={el.idx}
                              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                            >
                              <input
                                type="text"
                                className="w-full font-bold bg-transparent border-b border-slate-200 focus:border-indigo-600 outline-none py-1 text-slate-700 dark:text-white"
                                value={el.text || el.label || ""}
                                onChange={(e) => {
                                  const q = exam.questions.find(
                                    (q) => q.id === editingId
                                  );
                                  const newVal = e.target.value;
                                  const newElements = [
                                    ...q.graph_data.elements,
                                  ];
                                  newElements[el.idx] = {
                                    ...newElements[el.idx],
                                    text: newVal,
                                    label: newVal,
                                  };
                                  updateQuestion(editingId, {
                                    graph_data: {
                                      ...q.graph_data,
                                      elements: newElements,
                                    },
                                  });
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};