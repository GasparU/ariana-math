import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// Detecta si está en Vercel (Prod) o Localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = {
  exams: {
    // 1. Vista Previa
    preview: async (examData) => {
      const response = await fetch(`${API_BASE_URL}/exams/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error generando vista previa");
      }
      return await response.json();
    },

    // 2. Crear / Guardar
    create: async (examData) => {
      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error guardando examen");
      }
      return await response.json();
    },

    // 3. Listar todos
    list: async () => {
      const response = await fetch(`${API_BASE_URL}/exams`);
      if (!response.ok) throw new Error("Error cargando lista");
      return await response.json();
    },

    // 4. Obtener último (o específico)
    getLatest: async () => {
      const response = await fetch(`${API_BASE_URL}/exams`);
      if (!response.ok) throw new Error("Error cargando exámenes");

      const exams = await response.json();
      if (Array.isArray(exams) && exams.length > 0) {
        return exams[0];
      }
      return null;
    },

    // 5. Borrar Examen
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo borrar");
      return true;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  },

  results: {
    // 6. Guardar Resultado
    save: async (resultData) => {
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });
      if (!response.ok) throw new Error("Error guardando progreso");
      return await response.json();
    },

    // 7. Obtener Estadísticas
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/results/stats`);
      if (!response.ok) throw new Error("Error cargando estadísticas");
      return await response.json();
    },

    // 8. Obtener Historial
    getHistory: async () => {
      const response = await fetch(`${API_BASE_URL}/results/history`);
      if (!response.ok) throw new Error("Error cargando historial");
      return await response.json();
    },
    create: async (resultData) => {
      const { data, error } = await supabase
        .from("exam_results")
        .insert(resultData)
        .select();
      if (error) throw error;
      return data;
    },
    listByStudent: async (studentName = "Ariana") => {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*, exams(topic, subject, difficulty)") // Join con la tabla exams
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    delete: async (resultId) => {
      const { error } = await supabase
        .from("exam_results")
        .delete()
        .eq("id", resultId); // Borra solo ESTE intento por su ID único

      if (error) throw error;
      return true;
    },
  },

  rag: {
    getAll: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/rag/files`);
        if (!res.ok) throw new Error("Error fetching rag files");
        return await res.json();
      } catch (e) {
        console.error("Error en api.rag.getAll:", e);
        return [];
      }
    },
    upload: async (formData) => {
      const res = await fetch(`${API_BASE_URL}/rag/ingest`, {
        method: "POST",
        body: formData, // fetch maneja el boundary del multipart automáticamente
      });
      if (!res.ok) throw new Error("Error uploading file");
      return await res.json();
    },
  },

  courses: {
    // 1. OBTENER (Coincide con @Get('courses'))
    getAll: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/rag/courses`);
        if (!res.ok) return [];
        return await res.json();
      } catch (e) {
        return [];
      }
    },

    // 2. CREAR (Coincide con @Post('courses') body: { name })
    create: async (data) => {
      // El backend solo pide 'name', ignorará description por ahora pero no rompe nada
      const res = await fetch(`${API_BASE_URL}/rag/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (!res.ok) throw new Error("Error al crear");
      return await res.json();
    },

    // 3. ACTUALIZAR (CORREGIDO: Coincide con @Patch('courses') body: { oldName, newName })
    update: async (originalName, data) => {
      const res = await fetch(`${API_BASE_URL}/rag/courses`, {
        method: "PATCH", // Tu backend usa PATCH, no PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldName: originalName, // El nombre viejo para buscar
          newName: data.name, // El nuevo nombre para actualizar
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      return await res.json();
    },

    // 4. ELIMINAR (CORREGIDO: Coincide con @Delete('courses') @Query('name'))
    delete: async (name) => {
      // Usamos encodeURIComponent para cursos con tildes (Álgebra)
      const safeName = encodeURIComponent(name);
      const res = await fetch(`${API_BASE_URL}/rag/courses?name=${safeName}`, {
        method: "DELETE",
      });

      // Validación real para que el frontend no mienta
      if (!res.ok) throw new Error("Error al eliminar");
      return true;
    },
  },
};
