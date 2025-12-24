/**
 * ESTE ES EL CEREBRO DE LIMPIEZA DE DATOS.
 * Su único trabajo es recibir basura de cualquier IA y devolver
 * un objeto PREGUNTA perfecto y estandarizado para tu Frontend.
 */

export const normalizeQuestion = (rawQ, index) => {
  // 1. BUSCADOR DE ENUNCIADO (DeepSeek a veces usa 'statement' o 'description')
  // Buscamos en todas las posibles llaves que la IA pueda inventar.
  const foundText =
    rawQ.question_text ||
    rawQ.question ||
    rawQ.text ||
    rawQ.statement || // Típico de DeepSeek
    rawQ.description || // Típico de GPT
    rawQ.enunciado || // Típico de modelos en español
    "Sin enunciado disponible"; // Fallback final

  // 2. NORMALIZADOR DE OPCIONES
  // Convierte {a: "1", b: "2"} o ["1", "2"] en un array limpio.
  let cleanOptions = [];

  if (Array.isArray(rawQ.options)) {
    cleanOptions = rawQ.options;
  } else if (typeof rawQ.options === "object" && rawQ.options !== null) {
    // Si DeepSeek manda un objeto, lo convertimos a array
    cleanOptions = Object.values(rawQ.options);
  }

  // Aseguramos que cada opción sea texto plano, no objetos complejos
  const finalOptions = cleanOptions.map((opt) => {
    if (typeof opt === "string") return opt;
    if (opt && opt.text) return opt.text; // Si viene {id: 'a', text: '20cm'}
    return String(opt);
  });

  // 3. RETORNO ESTANDARIZADO
  // Este es el único formato que verán tus componentes visuales (ExamCard, MathGraph).
  return {
    id: rawQ.id || `q_${index}`, // ID único siempre
    text: foundText, // El texto que faltaba en DeepSeek
    options: finalOptions, // Las opciones limpias
    correct_answer: rawQ.correct_answer || "",

    // Solucionario: Buscamos explanation o solution_text
    solution_text: rawQ.solution_text || rawQ.explanation || "Sin solución.",

    // Gráfico: Si existe, lo pasamos. Si no, null.
    graph_data: rawQ.graph_data || null,

    // SVG: Por si acaso GPT manda svgCode
    svgCode: rawQ.svgCode || null,
  };
};
