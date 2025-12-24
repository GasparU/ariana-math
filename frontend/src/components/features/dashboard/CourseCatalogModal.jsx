import React, { useState, useEffect } from "react";
import {
  Database,
  Trash2,
  Edit2,
  X,
  Loader2,
  Save,
  Plus,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { api } from "../../../services/api"; // Ajusta la ruta según donde guardes este archivo

export const CourseCatalogModal = ({ isOpen, onClose, onCourseChange }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulario
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar solo cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadCourses();
      resetForm();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses.getAll();
      const validData = Array.isArray(response)
        ? response
        : response.data || [];

      // Ordenar alfabéticamente
      const sorted = validData.sort((a, b) => {
        const nA = (a.name || a.nombre || "").toLowerCase();
        const nB = (b.name || b.nombre || "").toLowerCase();
        return nA.localeCompare(nB);
      });
      setCourses(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!courseName.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.courses.update(editingId, {
          name: courseName,
          description: courseDesc,
        });
      } else {
        await api.courses.create({ name: courseName, description: courseDesc });
      }

      await loadCourses(); // Recargar lista interna
      if (onCourseChange) onCourseChange(); // Avisar al padre que hubo cambios

      resetForm();
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
      Toast.fire({
        icon: "success",
        title: editingId ? "Actualizado" : "Creado",
      });
    } catch (e) {
      Swal.fire("Error", "No se pudo guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `¿Eliminar ${name}?`,
      text: "Desaparecerá de las opciones de selección.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (confirm.isConfirmed) {
      try {
        await api.courses.delete(id);
        await loadCourses();
        if (onCourseChange) onCourseChange(); // Avisar al padre
        Swal.fire("Eliminado", "", "success");
      } catch (e) {
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    }
  };

  const handleEditClick = (c, id) => {
    setEditingId(id);
    setCourseName(c.name || c.nombre || "");
    setCourseDesc(c.description || "");
  };

  const resetForm = () => {
    setEditingId(null);
    setCourseName("");
    setCourseDesc("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
            <Database size={16} className="text-indigo-500" /> Catálogo de
            Asignaturas
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <div
          className={`p-5 border-b border-slate-100 transition-colors ${
            editingId ? "bg-amber-50/50" : "bg-white"
          }`}
        >
          <div className="flex flex-col gap-3">
            {editingId && (
              <span className="text-[10px] font-bold text-amber-600 uppercase">
                Editando...
              </span>
            )}
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Nombre (ej: Álgebra)"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-bold text-slate-700 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Desc. Opcional"
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                className="w-1/3 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline mr-1"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!courseName.trim() || saving}
                className={`px-6 py-2 rounded-lg font-bold text-xs uppercase text-white shadow-md flex items-center gap-2 transition-all active:scale-95 ${
                  editingId
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : editingId ? (
                  <>
                    <Save size={14} /> Actualizar
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Guardar Nuevo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE CURSOS */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 custom-scrollbar">
          {loading ? (
            <div className="py-10 text-center">
              <Loader2
                className="animate-spin text-indigo-500 mx-auto"
                size={24}
              />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 m-2 rounded-xl">
              No hay asignaturas creadas.
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {courses.map((c, index) => {
                // 1. DETECCIÓN DE NOMBRE
                const displayName = c.name || c.nombre || "Sin Nombre";

                // 2. DETECCIÓN DE ID (CRÍTICO PARA QUE LOS BOTONES FUNCIONEN)
                const currentId = c.id || c._id || c.courseId;
                const isEditable = !!currentId;

                return (
                  <div
                    key={currentId || index}
                    className={`flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all group ${
                      editingId === currentId
                        ? "bg-amber-50 border-amber-300"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                    }`}
                  >
                    <div className="ml-1">
                      <p
                        className="text-sm font-black text-slate-700 uppercase truncate"
                        title={displayName}
                      >
                        {displayName}
                      </p>
                      {c.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Si no hay ID, mostramos alerta en vez de botón deshabilitado para que sepas qué pasa */}
                      {!isEditable && (
                        <AlertCircle
                          size={14}
                          className="text-red-400"
                          title="Error de ID en DB"
                        />
                      )}

                      <button
                        onClick={() => handleEditClick(c, currentId)}
                        disabled={!isEditable}
                        className={`p-1.5 rounded-md transition-colors ${
                          !isEditable
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(currentId, displayName)}
                        disabled={!isEditable}
                        className={`p-1.5 rounded-md transition-colors ${
                          !isEditable
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
