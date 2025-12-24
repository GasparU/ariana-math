import JXG from "jsxgraph";

// =========================================================
// CONFIGURACIÓN DE ESTILOS
// =========================================================
export const STYLES = {
  MAIN_LINE: "#000000", // Negro (Segmento base)
  DIMENSION_PINK: "#FF6384", // Rosado (Incógnitas)
  DIMENSION_GREY: "#666666", // Gris (Datos)
  POINT_ORANGE: "#FF9F40", // Puntos destacados

  isDimensionColor: (color) => {
    if (!color) return false;
    const c = color.toUpperCase();
    return c.includes("FF6384") || c.includes("666666");
  },
};

// =========================================================
// ALGORITMO DE ZOOM (BoundingBox)
// =========================================================
export const calculateDynamicBoundingBox = (elements) => {
  if (!elements || elements.length === 0) return [-2, 4, 12, -2];
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  let hasData = false;

  elements.forEach((el) => {
    if (el.coords && Array.isArray(el.coords)) {
      const x = Number(el.coords[0]);
      const y = Number(el.coords[1]);
      if (!isNaN(x) && !isNaN(y)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        hasData = true;
      }
    }
  });

  if (!hasData) return [-2, 4, 12, -2];
  const paddingX = 2;
  const paddingYTop = 2.0;
  const paddingYBottom = 3.0;
  return [
    minX - paddingX,
    maxY + paddingYTop,
    maxX + paddingX,
    minY - paddingYBottom,
  ];
};

// =========================================================
// RENDERIZADOR DE PUNTOS
// =========================================================
export const renderPoint = (board, el) => {
  const coords = el.coords ? el.coords.map(Number) : [0, 0];
  const isMainPoint = el.color === STYLES.POINT_ORANGE || !el.color;
  const finalColor = isMainPoint ? STYLES.POINT_ORANGE : el.color;
  const labelOffset = isMainPoint ? [0, -25] : [5, 5];

  return board.create("point", coords, {
    name: el.label || "",
    size: el.size || 4,
    color: finalColor,
    fixed: true,
    withLabel: !!el.label,
    label: {
      offset: labelOffset,
      anchorX: "middle",
      anchorY: "top",
      fontSize: 18,
      cssStyle: "font-weight: bold; font-family: Arial;",
      color: "#1e293b",
    },
    layer: 9,
  });
};
