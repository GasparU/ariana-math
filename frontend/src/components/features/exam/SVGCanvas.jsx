import React, { useMemo } from "react";
import DOMPurify from "dompurify";

const SVGCanvas = ({ svgCode }) => {
  const sanitizedSVG = useMemo(() => {
    if (!svgCode) return null;

    // 1. LIMPIEZA QUIRÚRGICA
    // ¡IMPORTANTE! Ya NO reemplazamos fill="white" ni fill="#ffffff".
    // Necesitamos que el blanco se quede blanco para que las bolitas se vean huecas en el papel.

    let fixedSvg = svgCode
      // Solo convertimos las líneas (stroke) blancas a gris oscuro para que se vean en el papel
      .replace(/stroke="#ffffff"/gi, 'stroke="#334155"')
      .replace(/stroke='white'/gi, "stroke='#334155'")
      // Textos blancos -> Negro (esto sí, para leer)
      .replace(/<text(.*?)fill="white"(.*?)>/gi, '<text$1fill="black"$2>')
      .replace(/<text(.*?)fill='#ffffff'(.*?)>/gi, '<text$1fill="black"$2>')
      // Grosor de línea profesional
      .replace(/stroke-width="1"/g, 'stroke-width="2"');

    return {
      __html: DOMPurify.sanitize(fixedSvg),
    };
  }, [svgCode]);

  if (!svgCode)
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <span className="text-xs uppercase font-bold">Sin gráfico</span>
      </div>
    );

  return (
    // CONTENEDOR TIPO "CUADERNO MATEMÁTICO"
    <div
      className="w-full h-full flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 shadow-sm relative overflow-hidden"
      style={{
        backgroundColor: "#ffffff", // Blanco puro
        // Cuadrícula tipo papel milimetrado
        backgroundImage: `
          linear-gradient(#e2e8f0 1px, transparent 1px), 
          linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* 🎨 PALETA DE COLORES Y TRAMAS (DEFINICIONES)
         La IA usará: fill="url(#hatchBlue)", fill="url(#hatchPink)", etc.
      */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* 1. AZUL (Inclinado Derecha /) */}
          <pattern
            id="hatchBlue"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <path d="M0,0 L0,6" style={{ stroke: "#3b82f6", strokeWidth: 2 }} />
          </pattern>

          {/* 2. ROSA (Inclinado Izquierda \) */}
          <pattern
            id="hatchPink"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(-45)"
          >
            <path d="M0,0 L0,6" style={{ stroke: "#ec4899", strokeWidth: 2 }} />
          </pattern>

          {/* 3. VERDE (Inclinado Derecha /) */}
          <pattern
            id="hatchTeal"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <path d="M0,0 L0,6" style={{ stroke: "#14b8a6", strokeWidth: 2 }} />
          </pattern>

          {/* 4. NARANJA (Inclinado Izquierda \) */}
          <pattern
            id="hatchOrange"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(-45)"
          >
            <path d="M0,0 L0,6" style={{ stroke: "#f97316", strokeWidth: 2 }} />
          </pattern>

          {/* 5. DEFECTO (Gris Oscuro) */}
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
            patternTransform="rotate(45)"
          >
            <path d="M0,0 L0,4" style={{ stroke: "#334155", strokeWidth: 1 }} />
          </pattern>
        </defs>
      </svg>

      {/* Inyectamos el SVG */}
      <div
        className="z-10 w-full h-full flex items-center justify-center [&>svg]:overflow-visible"
        dangerouslySetInnerHTML={sanitizedSVG}
      />
    </div>
  );
};

export default SVGCanvas;
