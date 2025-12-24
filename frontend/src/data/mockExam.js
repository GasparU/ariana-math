// Exportación nombrada (para cuando usas { mockExam })
export const mockExam = {
  examTitle: "Entrenamiento Olímpico - Nivel 5",
  timeLimitSeconds: 1200, // 20 minutos
  questions: [
    {
      id: "geo_01",
      type: "geometry",
      difficulty: "medium",
      topic: "Áreas en Triángulos Rectángulos",
      questionText:
        "En la figura, el triángulo ABC es rectángulo en B. Se sabe que AB = 8u y BC = 6u. Si M es el punto medio de AB, calcula el área de la región sombreada (Triángulo AMC).",
      svgCode: `
      <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
        <path d="M 60 50 L 60 200 L 260 200 Z" fill="none" stroke="#94a3b8" stroke-width="2"/>
        <path d="M 60 50 L 260 200 L 60 125 Z" fill="rgba(99, 102, 241, 0.4)" stroke="#818cf8" stroke-width="2"/>
        <circle cx="60" cy="50" r="4" fill="#cbd5e1"/> <text x="45" y="50" fill="#cbd5e1" font-family="monospace">A</text>
        <circle cx="60" cy="200" r="4" fill="#cbd5e1"/> <text x="45" y="215" fill="#cbd5e1" font-family="monospace">B</text>
        <circle cx="260" cy="200" r="4" fill="#cbd5e1"/> <text x="270" y="215" fill="#cbd5e1" font-family="monospace">C</text>
        <circle cx="60" cy="125" r="4" fill="#fbbf24"/> <text x="40" y="130" fill="#fbbf24" font-weight="bold">M</text>
        <line x1="60" y1="230" x2="260" y2="230" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
        <text x="160" y="245" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="sans-serif">6u</text>
        <line x1="20" y1="50" x2="20" y2="200" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
        <text x="15" y="125" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="sans-serif" transform="rotate(-90 15 125)">8u</text>
      </svg>`,
      explanation:
        "El área sombreada es el triángulo AMC. Su base es el segmento AM. Como M es punto medio y AB=8u, entonces AM=4u. La altura del triángulo AMC respecto a la base AM es el segmento BC (6u). Área = (Base × Altura) / 2 = (4 × 6) / 2 = 12 u².",
      options: [
        { id: "opt_a", text: "12 u²", isCorrect: true },
        { id: "opt_b", text: "24 u²", isCorrect: false },
        { id: "opt_c", text: "16 u²", isCorrect: false },
        { id: "opt_d", text: "8 u²", isCorrect: false },
      ],
    },
    {
      id: "log_01",
      type: "logic",
      difficulty: "hard",
      topic: "Ordenamiento Circular",
      questionText:
        "Cuatro amigos (Ana, Beto, Carla y Daniel) se sientan alrededor de una mesa circular. Se sabe que: Ana no está frente a Beto. Carla se sienta a la izquierda de Ana. ¿Quién está frente a Carla?",
      svgCode: `
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
         <circle cx="150" cy="150" r="90" fill="none" stroke="#3b82f6" stroke-width="4"/>
         <circle cx="150" cy="150" r="85" fill="#1e293b" opacity="0.5"/>
         <circle cx="150" cy="40" r="25" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
         <text x="150" y="45" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="20">?</text>
         <circle cx="150" cy="260" r="25" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
         <text x="150" y="265" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="20">?</text>
         <circle cx="260" cy="150" r="25" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
         <text x="260" y="155" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="20">?</text>
         <circle cx="40" cy="150" r="25" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
         <text x="40" y="155" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="20">?</text>
         <path d="M 200 80 Q 250 120 250 180" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="5,5" marker-end="url(#arrow)"/>
      </svg>`,
      explanation:
        "Si Carla está a la izquierda de Ana, y Ana no está frente a Beto, entonces Ana y Beto deben ser vecinos. Si ubicamos a Ana en el Norte, Carla (izquierda) estaría en el Oeste. Beto no puede estar al Sur (frente), así que debe estar al Este. Por tanto, Daniel está al Sur. Frente a Carla (Oeste) está Beto (Este).",
      options: [
        { id: "opt_1", text: "Ana", isCorrect: false },
        { id: "opt_2", text: "Beto", isCorrect: true },
        { id: "opt_3", text: "Daniel", isCorrect: false },
        { id: "opt_4", text: "Faltan datos", isCorrect: false },
      ],
    },
  ],
};

// Exportación por defecto (ESTO SOLUCIONA EL ERROR "does not provide an export named default")
export default mockExam;
