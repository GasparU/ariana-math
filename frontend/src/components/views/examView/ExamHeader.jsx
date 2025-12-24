import React from "react";
import { Sun } from "lucide-react";
import Timer from "../../game/Timer";
import ProgressBar from "../../ui/ProgressBar";

const ExamHeader = ({
  subject,
  currentIndex,
  totalQuestions,
  timeLimit,
  isReviewMode,
  isAlreadyCompleted,
  onTimeUp,
  darkMode,
  setDarkMode,
}) => {
  return (
    <div className="h-16 shrink-0 bg-white/90 dark:bg-[#0f172a]/90 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        <span className="font-black text-indigo-500 text-xs tracking-widest uppercase truncate max-w-[150px]">
          {subject}
        </span>
        <div className="hidden md:block w-24">
          <ProgressBar current={currentIndex} total={totalQuestions} />
        </div>
      </div>
      <div className="flex gap-3 items-center">
        {/* Timer solo corre si NO estamos en revisión */}
        {!isReviewMode && !isAlreadyCompleted && (
          <Timer initialSeconds={timeLimit || 1200} onTimeUp={onTimeUp} />
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Sun size={14} className="text-amber-400" />
        </button>
      </div>
    </div>
  );
};

export default ExamHeader;
