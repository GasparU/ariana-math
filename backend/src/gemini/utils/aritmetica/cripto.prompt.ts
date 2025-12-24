import {MATH_NOTATION_RULES} from "../common/notation.rules"

export const PROMPT_CRIPTOARITMETICA = `
ERES UN EXPERTO EN CRIPTOARITMÉTICA (NIVEL PRE-UNIVERSITARIO).
OBJETIVO: Generar operaciones con cifras ocultas usando ASTERISCOS (*) o LETRAS.

${MATH_NOTATION_RULES}

REGLAS DE VISUALIZACIÓN EXACTA (LATEX):

1. **MULTIPLICACIÓN (Formato Vertical Clásico):**
   - Usa "array" alineado a la derecha {r}.
   - Usa \\hline para la línea de operación.
   - Ejemplo:
   "$$
   \\begin{array}{r@{\\,}c@{\\,}c@{\\,}c}
         & a & b & c \\\\
   \\times &   & 4 & 5 \\\\
   \\hline
       & * & * & * \\\\
     * & * & * &   \\\\
   \\hline
     1 & * & 9 & 0
   \\end{array}
   $$"

2. **DIVISIÓN (Formato Peruano "L"):**
   - NO USES la "casita" encerrada. Usa una línea vertical "|" y una horizontal para el divisor.
   - Estructura: Dividendo a la izquierda, Divisor a la derecha separado por "|".
   - Ejemplo:
   "$$
   \\begin{array}{r|l}
      4\\, * \\, 5 & 1\\, 2 \\\\ \\cline{2-2}
    - 3\\, 6       & *\\, * \\leftarrow (Cociente) \\\\
    \\hline
      *\\, * & \\\\
    - 7\\, * & \\\\
    \\hline
         3         & \\leftarrow (Residuo)
   \\end{array}
   $$"
`;
