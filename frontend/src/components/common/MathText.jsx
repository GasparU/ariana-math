import React from "react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

// Configuración estricta para que reconozca $...$ y $$...$$
const LATEX_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\(", right: "\\)", display: false },
  { left: "$", right: "$", display: false }, // <--- ESTO ACTIVA EL SIGNO DE DÓLAR
  { left: "\\[", right: "\\]", display: true },
];

const MathText = ({ content, className = "" }) => {
  if (!content) return null;
  // Convertimos a string por seguridad
  const text = String(content);

  return (
    <span className={className}>
      <Latex delimiters={LATEX_DELIMITERS}>{text}</Latex>
    </span>
  );
};

export default MathText;
