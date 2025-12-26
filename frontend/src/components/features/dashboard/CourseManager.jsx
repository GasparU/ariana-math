import React, { useState, useEffect } from "react";
import {
  Database,
  Trash2,
  Edit2,
  X,
  Loader2,
  Book,
  Settings,
  Save,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

// TUS RUTAS ORIGINALES
import MainLayout from "../../layout/MainLayout";
import { RagInventory } from "../../views/adminIngest/RagInventory";
import { api } from "../../../services/api";

const CourseManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  // editingId guardará el NOMBRE original del curso para poder editarlo/borrarlo
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showModal) loadBaseCourses();
  }, [showModal]);

  const loadBaseCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.courses.getAll();

      const validData = Array.isArray(response)
        ? response
        : response.data || [];

      // Ordenar
      const sortedData = validData.sort((a, b) => {
        const valA = (typeof a === "string" ? a : a.name || "").toLowerCase();
        const valB = (typeof b === "string" ? b : b.name || "").toLowerCase();
        return valA.localeCompare(valB);
      });

      setCourses(sortedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseName.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        // ACTUALIZAR (Enviamos el nombre antiguo 'editingId' como identificador)
        await api.courses.update(editingId, {
          name: courseName,
          description: courseDesc,
        });
      } else {
        // CREAR
        await api.courses.create({ name: courseName, description: courseDesc });
      }
      resetForm();
      await loadBaseCourses();

      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      }).fire({ icon: "success", title: "Guardado correctamente" });
    } catch (e) {
      console.error(e); // Ver error real en consola
      Swal.fire("Error", "No se pudo guardar. Revisa la conexión.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (identifier) => {
    if (!identifier) return;

    const res = await Swal.fire({
      title: `¿Eliminar ${identifier}?`,
      text: "Se borrará del catálogo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
    });

    if (res.isConfirmed) {
      try {
        // Ahora api.js sí validará si el backend dice OK
        await api.courses.delete(identifier);

        await loadBaseCourses();
        Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
        }).fire({ icon: "success", title: "Eliminado" });
      } catch (e) {
        console.error(e);
        // Si falla, ahora sí veremos esta alerta
        Swal.fire(
          "Error",
          "El sistema no permitió borrar este curso.",
          "error"
        );
      }
    }
  };

  const handleEditClick = (c, identifier) => {
    if (!identifier) return;
    setEditingId(identifier); // Guardamos el nombre actual para buscarlo en DB

    const nameToEdit = typeof c === "string" ? c : c.name || "";
    const descToEdit = typeof c === "string" ? "" : c.description || "";

    setCourseName(nameToEdit);
    setCourseDesc(descToEdit);
  };

  const resetForm = () => {
    setEditingId(null);
    setCourseName("");
    setCourseDesc("");
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 pb-20">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
              <Book className="text-indigo-600" /> Biblioteca & Cursos RAG
            </h1>
            <p className="text-sm text-slate-500">
              Visualiza el contenido real que la IA ha aprendido.
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Settings size={16} /> Catálogo de Asignaturas Base
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px]">
          <RagInventory key={showModal ? "refresh" : "static"} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <Database size={16} className="text-indigo-500" /> Catálogo de
                Asignaturas
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className={`p-5 border-b border-slate-100 dark:border-slate-700 transition-colors ${
                editingId ? "bg-amber-50/50" : "bg-white"
              }`}
            >
              <div className="flex flex-col gap-3">
                {editingId && (
                  <span className="text-[10px] font-bold text-amber-600 uppercase">
                    Editando: {editingId}
                  </span>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nombre (ej: Álgebra)"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 text-sm font-bold text-slate-700 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Desc. Opcional"
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full sm:w-1/3 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
                    onClick={handleSaveCourse}
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

            <div className="flex-1 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 custom-scrollbar">
              {loadingCourses ? (
                <div className="py-10 text-center">
                  <Loader2
                    className="animate-spin text-indigo-500 mx-auto"
                    size={24}
                  />
                </div>
              ) : courses.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 m-2 rounded-xl">
                  No hay asignaturas.
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {courses.map((c, index) => {
                    // Lógica para trabajar con Strings (ya que el backend manda strings)
                    let displayName = "Sin Nombre";
                    let identifier = null;

                    if (typeof c === "string") {
                      displayName = c;
                      identifier = c; // Usamos el nombre como ID
                    } else if (c && typeof c === "object") {
                      displayName = c.name || c.nombre || JSON.stringify(c);
                      identifier = c.id || c._id || displayName;
                    }

                    const isEditable = !!identifier;

                    return (
                      <div
                        key={identifier || index}
                        className={`flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all group ${
                          editingId === identifier
                            ? "bg-amber-50 border-amber-300"
                            : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                        }`}
                      >
                        <div className="ml-1 overflow-hidden">
                          <p
                            className="text-sm font-black text-slate-700 uppercase truncate"
                            title={displayName}
                          >
                            {displayName}
                          </p>
                          {typeof c === "object" && c.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {c.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(c, identifier)}
                            disabled={!isEditable}
                            className={`p-1.5 rounded-md transition-colors ${
                              !isEditable
                                ? "text-slate-300 cursor-not-allowed bg-slate-100"
                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            }`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCourse(identifier, displayName)
                            }
                            disabled={!isEditable}
                            className={`p-1.5 rounded-md transition-colors ${
                              !isEditable
                                ? "text-slate-300 cursor-not-allowed bg-slate-100"
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
      )}
    </MainLayout>
  );
};

export default CourseManager;
