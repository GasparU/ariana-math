import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart2,
  LogOut,
  Menu,
  X, // Importamos la X para cerrar el menú móvil
  Library,
} from "lucide-react";
import FeedbackButton from "../common/FeedbackButton";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar si el menú móvil está abierto o cerrado
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      label: "Generador",
      path: "/parent",
      icon: <LayoutDashboard size={16} />,
    },
    {
      label: "Entrenamiento IA",
      path: "/parent/ingest",
      icon: <BookOpen size={16} />,
    },
    { label: "Cursos", path: "/parent/courses", icon: <Library size={16} /> },
    { label: "Historial", path: "/parent/stats", icon: <History size={16} /> },
    {
      label: "Estadísticas",
      path: "/parent/history",
      icon: <BarChart2 size={16} />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("app_user_role");
    window.location.href = "/";
  };

  // Función para navegar y cerrar el menú móvil automáticamente
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Cierra el menú al hacer clic
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans overflow-hidden">
      {/* =========================================
          1. SIDEBAR DE ESCRITORIO (PC / LAPTOP)
          Siempre visible en pantallas medianas hacia arriba (md:flex)
          Oculto en móviles (hidden)
         ========================================= */}
      <aside className="w-56 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col border-r border-slate-800 z-50">
        <div className="h-14 flex items-center px-5 border-b border-slate-800/50 bg-slate-950/30">
          <span className="text-sm font-black tracking-widest text-indigo-400 uppercase">
            Ariana<span className="text-white">Math</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span
                  className={`mr-3 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase bg-slate-800/30 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={14} className="mr-2" />
            Salir
          </button>
        </div>
      </aside>

      {/* =========================================
          2. MENÚ MÓVIL (TABLET / CELULAR)
          Se superpone a todo cuando isMobileMenuOpen es true
         ========================================= */}

      {/* Overlay oscuro de fondo (Solo visible si el menú está abierto) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* El Sidebar Móvil Deslizable */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera del Menú Móvil con Botón Cerrar */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/30">
          <span className="text-sm font-black tracking-widest text-indigo-400 uppercase">
            Ariana<span className="text-white">Math</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X size={24} />
          </button>
        </div>

        {/* Links de Navegación Móvil (Reutilizamos la lógica) */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                // AQUÍ USAMOS handleNavigation PARA QUE SE CIERRE AL HACER CLICK
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span
                  className={`mr-3 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Móvil */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase bg-slate-800/30 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={16} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* =========================================
          3. CONTENIDO PRINCIPAL
         ========================================= */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#F1F5F9] dark:bg-[#0B0F19]">
        {/* Header Móvil (La barra blanca superior con la Hamburguesa) */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            {/* ESTE BOTÓN AHORA ABRE EL MENÚ */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-700 dark:text-white text-sm uppercase tracking-wider">
              Ariana Math Quest
            </span>
          </div>
        </header>

        {/* Área de Scroll del contenido */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>

      <FeedbackButton />
    </div>
  );
};

export default MainLayout;
