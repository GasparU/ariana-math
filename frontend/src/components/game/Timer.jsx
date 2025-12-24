import React, { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";

const Timer = ({ initialSeconds = 60, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    // Validación de seguridad: Si ya acabó, no hacer nada
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp(); // Ejecutar callback del padre si existe
      return;
    }

    // Intervalo independiente
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    // Limpieza de memoria (Cleanup function)
    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  // Formateo MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Lógica visual de urgencia (últimos 5 minutos o cuando queda poco)
  const isUrgent = timeLeft < 300;

  return (
    <div
      className={`
      flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300
      ${
        isUrgent
          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900 animate-pulse"
          : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      }
    `}
    >
      <TimerIcon size={18} className={isUrgent ? "animate-bounce" : ""} />
      <span className="font-mono text-sm md:text-base font-bold tabular-nums">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;
