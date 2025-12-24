import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- PANTALLAS DE AUTENTICACIÓN ---
import LoginScreen from "./components/auth/LoginScreen";


import ParentDashboard from "./components/views/ParentDashboard";
import AdminIngest from "./components/views/AdminIngest";
import CourseManager from "./components/features/dashboard/CourseManager";
import StatsDashboard from "./components/views/StatsDashboard";
import HistoryView from "./components/views/HistoryView";
import ParentExamPreview from "./components/views/ParentExamPreview";
import StudentExamView from "./pages/student/StudentExamView";
import StudentDashboard from "./components/views/StudentDashboard";
import ReviewExamView from "./pages/shared/ReviewExamView";
import AnalyticsDashboard from "./components/views/AnalyticsDashboard";

const App = () => {
  const [user, setUser] = useState(null); // 'parent' | 'student'

  useEffect(() => {
    // 1. Validar identidad persistente (Visitor ID)
    const existingId = localStorage.getItem("app_visitor_identity");
    if (!existingId) {
      console.warn(
        "⚠️ Crítico: visitor_id no encontrado. El sistema de cuotas fallará."
      );
      // Aquí podrías disparar la lógica de telemetry.js si fuera necesario
    }

    // 2. Gestión de Roles (Tu código original mejorado)
    if (user) {
      localStorage.setItem("app_user_role", user);
      // Evitamos bucles de redirección innecesarios
      if (user === "parent" && window.location.pathname === "/") {
        window.history.replaceState(null, "", "/parent");
      }
    } else {
      // Importante: Solo removemos el rol, NUNCA el visitor_identity
      localStorage.removeItem("app_user_role");
    }
  }, [user]);

  // 3. RENDERIZADO CONDICIONAL: PUERTA DE ENTRADA
  // Si no hay usuario definido, mostramos tu pantalla de PIN
  if (!user) {
    return <LoginScreen onLogin={(role) => setUser(role)} />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* REDIRECCIÓN INICIAL */}
        <Route
          path="/"
          element={
            user === "parent" ? (
              <Navigate to="/parent" replace />
            ) : (
              <Navigate to="/student" replace />
            )
          }
        />

        {/* ========================================================= */}
        {/* RUTAS DEL PADRE / DOCENTE */}
        {/* ========================================================= */}

        {/* 1. Generador */}
        <Route
          path="/parent"
          element={
            user === "parent" ? (
              <ParentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 2. Entrenamiento IA */}
        <Route
          path="/parent/ingest"
          element={
            user === "parent" ? <AdminIngest /> : <Navigate to="/" replace />
          }
        />

        {/* 3. Gestión de Cursos (NUEVO BOTÓN) */}
        <Route
          path="/parent/courses"
          element={
            user === "parent" ? <CourseManager /> : <Navigate to="/" replace />
          }
        />

        {/* 4. Historial (Antes Stats) */}
        <Route
          path="/parent/stats"
          element={
            user === "parent" ? <StatsDashboard /> : <Navigate to="/" replace />
          }
        />

        {/* 5. Estadísticas / Bitácora (Antes History) */}
        <Route
          path="/parent/history"
          element={
            user === "parent" ? (
              <HistoryView userRole="parent" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/radar"
          element={
            user === "parent" ? (
              <AnalyticsDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Vista Previa Auxiliar */}
        <Route
          path="/parent/preview"
          element={
            user === "parent" ? (
              <ParentExamPreview />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ========================================================= */}
        {/* RUTAS DEL ESTUDIANTE */}
        {/* ========================================================= */}
        <Route
          path="/student"
          element={
            user === "student" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/student/exam/:id"
          element={
            user === "student" ? (
              <StudentExamView /> // El componente nuevo que creamos
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/review/:id"
          element={user ? <ReviewExamView /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
