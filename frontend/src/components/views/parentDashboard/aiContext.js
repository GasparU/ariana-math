export const getAiContext = (difficulty, subject, topic) => {
  const cleanSubject = subject.toLowerCase();
  const baseTopic = topic.trim() ? `sobre el tema: ${topic}` : "";
  // INSTRUCCIÓN OBLIGATORIA GLOBAL:
  const baseSubject = `Materia: ${subject}. IMPORTANTE: Generar siempre 5 alternativas de respuesta (A, B, C, D, E).`;

  if (cleanSubject.includes("matematica") || cleanSubject.includes("fisica")) {
    switch (difficulty) {
      case "facil":
        return `${baseSubject} Genera problemas introductorios ${baseTopic}. Enfocados en una sola propiedad geométrica básica. Gráficos limpios.`;

      case "medio":
        return `${baseSubject} Genera una colección VARIADA de problemas de nivel intermedio ${baseTopic}.
        
        DISTRIBUCIÓN OBLIGATORIA (No repetir el mismo tipo):
        1. (40%) Problemas de "Zigzag" o "Serrucho" (Suma izquierda = Suma derecha). 
           IMPORTANTE: Para el zigzag, la línea quebrada debe tener AL MENOS 4 PUNTOS (forma de 'M', 'W' o similar). NO generes zigzags simples de 3 puntos (forma de 'V' o triángulo), deben ser complejos.
        2. (30%) Ángulos Conjugados Internos (Forma de 'C').
        3. (30%) Ángulos Alternos Internos (Forma de 'Z') o Correspondientes.

        REGLA DE ORO PARA GRÁFICOS:
        - Para los zigzags, usa coordenadas que visualmente formen picos claros y agudos.
        - Asegúrate de que los textos de los ángulos no se superpongan con las líneas.
        - Usa letras mayúsculas (A, B, C...) para los vértices.`;
      case "dificil":
        return `${baseSubject} Genera problemas de nivel Olimpiada/Concurso ${baseTopic}. Exige trazos auxiliares, congruencia avanzada o propiedades complejas.`;

      default:
        return baseSubject;
    }
  }

  // ... (resto del código para otras materias) ...
};
