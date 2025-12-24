import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart2,
  LogOut,
  Menu,
  Library, // Icono para cursos
} from "lucide-react";
import FeedbackButton from "../common/FeedbackButton";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    { label: "Cursos", path: "/parent/courses", icon: <Library size={16} /> }, // <--- NUEVO
    { label: "Historial", path: "/parent/stats", icon: <History size={16} /> },
    {
      label: "Estadísticas",
      path: "/parent/history",
      icon: <BarChart2 size={16} />,
    },
  ];

  const handleLogout = () => {
    // 1. Borramos la "cookie" de sesión
    localStorage.removeItem("app_user_role");
    // 2. Forzamos la recarga para ir al Login
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans overflow-hidden">
      {/* SIDEBAR IZQUIERDO */}
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

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#F1F5F9] dark:bg-[#0B0F19]">
        {/* Header Móvil */}
        <header className="md:hidden h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0">
          <Menu size={20} className="text-slate-500 mr-3" />
          <span className="font-bold text-slate-700 dark:text-white text-sm">
            Menú
          </span>
        </header>

        {/* Área de Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
      <FeedbackButton />
    </div>
  );
};

export default MainLayout;
