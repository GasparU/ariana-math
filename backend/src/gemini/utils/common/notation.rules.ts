export const MATH_NOTATION_RULES = `
REGLAS ESTRICTAS DE SINTAXIS LATEX:
1. **NUMERALES:** Usa \\overline{abc} SOLO cuando representes un número de múltiples cifras desconocidas.
   - CORRECTO: "Si el numeral $\\overline{ab}$ es..."
   - INCORRECTO: $\\bar{a}$ (sobre una sola letra), $\\bar{5}$ (sobre un número solo).

2. **DECIMALES PERIÓDICOS:**
   - Usa \\overline{...} solo sobre la parte decimal que se repite.
   - CORRECTO: $0.\\overline{3}$ o $0.1\\overline{6}$.
   - OPCIONAL: Si el usuario pide "arco", usa \\wideparen{3} (ej: $0.\\wideparen{3}$), pero la barra es estándar.

3. **MULTIPLICACIÓN vs NUMERAL:**
   - Multiplicación de variables: Usa punto medio ($a \\cdot b$).
   - Numeral de dos cifras: Usa barra ($\\\\overline{ab}$).
   - NUNCA escribas "ab" para multiplicar, es ambiguo.

4. **CRIPTOGRAMAS:** Si hay espacios vacíos, usa asteriscos ($*$) o cajas ($\\square$).
`;
