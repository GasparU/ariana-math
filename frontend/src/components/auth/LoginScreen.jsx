import React, { useState } from "react";
import { User, ShieldCheck, Rocket, Lock, ArrowLeft } from "lucide-react";

const LoginScreen = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState(null);
  const [pin, setPin] = useState("");

  const handleLoginAttempt = (e) => {
    e.preventDefault();
    // TODO: INTEGRACIÓN FUTURA CON SUPABASE AUTH
    // Aquí reemplazaremos la validación de PIN fija por:
    // const { error } = await supabase.auth.signInWithPassword(...)
    if (activeRole === "parent") {
      if (pin === "1234") {
        onLogin("parent");
      } else {
        alert("PIN de Comandante incorrecto.");
        setPin("");
      }
    } else if (activeRole === "student") {
      if (pin === "2015") {
        onLogin("student");
      } else {
        alert("PIN de Cadete incorrecto. (Pista: 2015)");
        setPin("");
      }
    }
  };

  const resetLogin = () => {
    setActiveRole(null);
    setPin("");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-500">
        {/* Logo Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Rocket size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            ARIANA MATH QUEST
          </h2>
          <p className="text-slate-400 mt-2 font-mono text-sm">
            {activeRole
              ? `HOLA, ${activeRole === "parent" ? "COMANDANTE" : "CADETE"}`
              : "IDENTIFÍCATE PARA ACCEDER"}
          </p>
        </div>

        <div className="mt-8">
          {!activeRole && (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setActiveRole("student")}
                className="group relative flex items-center p-4 bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-400">
                  <User size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                    Soy Ariana
                  </h3>
                  <p className="text-xs text-slate-400">Acceso a Misiones</p>
                </div>
              </button>

              <button
                onClick={() => setActiveRole("parent")}
                className="group relative flex items-center p-4 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <div className="h-12 w-12 bg-indigo-500/20 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-400">
                  <ShieldCheck size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400">
                    Soy Papá
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configuración y Reportes
                  </p>
                </div>
              </button>
            </div>
          )}

          {activeRole && (
            <form
              onSubmit={handleLoginAttempt}
              className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50 animate-in fade-in slide-in-from-bottom-4 shadow-2xl relative overflow-hidden"
            >
              {/* --- CAMBIO 1: AGREGAR ESTE INPUT FANTASMA --- */}
              {/* Esto engaña al navegador para que crea que hay un usuario y quite la advertencia */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={activeRole}
                readOnly
                className="hidden"
              />
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  activeRole === "parent" ? "bg-indigo-500" : "bg-emerald-500"
                }`}
              ></div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                  <Lock
                    size={14}
                    className={
                      activeRole === "parent"
                        ? "text-indigo-400"
                        : "text-emerald-400"
                    }
                  />
                  PIN DE SEGURIDAD
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="password"
                  autoFocus
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white font-mono text-center text-3xl tracking-[0.5em] focus:ring-2 focus:ring-opacity-50 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-700 focus:border-transparent"
                  placeholder="••••"
                  // --- CAMBIO 2: ACTUALIZAR ESTOS ATRIBUTOS ---
                  autoComplete="current-password" // Indica que es la contraseña actual
                  name="pin" // Le da un nombre al campo
                  // --------------------------------------------
                />
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest text-white transition-all transform active:scale-[0.98] shadow-lg ${
                    activeRole === "parent"
                      ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  }`}
                >
                  DESBLOQUEAR SISTEMA
                </button>
              </div>

              <button
                type="button"
                onClick={resetLogin}
                className="w-full text-xs text-slate-500 mt-6 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft size={12} />
                Cambiar Usuario
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
