import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut, Moon, Sun, Award, Menu, X } from "lucide-react";

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lógica de Modo Oscuro
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const menuItems = [
    { label: "Misiones", path: "/student", icon: <LayoutGrid size={20} /> },
    // Podríamos agregar una vista de logros o perfil futuro aquí
    // { label: "Mis Logros", path: "/student/achievements", icon: <Award size={20} /> },
  ];

  const handleLogout = () => {
    // Aquí podrías limpiar sesión si usaras Auth real
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex font-sans transition-colors duration-300">
      {/* SIDEBAR DESKTOP */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 uppercase">
              Ariana<span className="text-slate-800 dark:text-white">Math</span>
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center transition-colors duration-300 shadow-inner group"
              title={
                darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"
              }
            >
              {/* Icono Sol (Fondo) */}
              <div className="absolute left-1.5 text-amber-500 opacity-70">
                <Sun size={12} strokeWidth={3} />
              </div>

              {/* Icono Luna (Fondo) */}
              <div className="absolute right-1.5 text-indigo-400 opacity-70">
                <Moon size={12} strokeWidth={3} />
              </div>

              {/* La Bolita (Knob) que se mueve */}
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  darkMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              >
                {/* Icono activo dentro de la bolita */}
                {darkMode ? (
                  <Moon
                    size={10}
                    className="text-indigo-600"
                    fill="currentColor"
                  />
                ) : (
                  <Sun
                    size={10}
                    className="text-amber-500"
                    fill="currentColor"
                  />
                )}
              </div>
            </button>

            {/* Botón cerrar menú (Solo móvil) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden ml-2 text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">


            {/* Salir */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Header Móvil */}
        <div className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between sticky top-0 z-40">
          <span className="font-black text-slate-800 dark:text-white">
            ArianaMath
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default StudentLayout;
