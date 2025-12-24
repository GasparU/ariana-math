import { renderPoint } from "./baseRenderer";
import { renderSegment } from "./segments";
import { renderPolygon } from "./polygons";
import { renderAngle } from "./angles";

// Función principal que decide qué dibujar
export const renderGeometryElement = (board, el, createdObjects) => {
  const type = (el.type || "").toLowerCase();

  const resolvePoint = (p) => {
    if (typeof p === "string") return createdObjects[p]; // Busca el punto "A" creado antes
    if (Array.isArray(p))
      return board.create("point", p, { visible: false, fixed: true }); // Crea punto invisible si mandan coords
    return p;
  };

  switch (type) {
    case "point":
      const pt = renderPoint(board, el);
      if (el.name) createdObjects[el.name] = pt;
      break;

    case "segment":
      renderSegment(board, el, createdObjects);
      break;

    case "line":
      renderSegment(board, el, createdObjects);
      break;

    case "polygon":
      renderPolygon(board, el, createdObjects);
      break;

    case "text":
      if (el.coords) {
        const isMeasureLabel =
          !isNaN(Number(el.text.replace(/[^0-9]/g, ""))) ||
          el.text.includes("x");
        board.create("text", [el.coords[0], el.coords[1], el.text], {
          fontSize: el.fontSize || 16,
          color: isMeasureLabel ? "#000000" : el.color || "#000000",
          layer: 10,
          fixed: true,
          anchorX: "middle",
          anchorY: "middle",
          cssStyle:
            "background-color: white; padding: 2px 4px; border-radius: 4px; font-weight: 600",
        });
      }
      break;

    case "circle":
      let center;
      // Usamos la nueva herramienta aquí también para ser consistentes
      center = resolvePoint(el.parents[0]);

      let parents = [center];
      if (typeof el.parents[1] === "number")
        parents.push(el.parents[1]); // Radio fijo
      else parents.push(resolvePoint(el.parents[1])); // Punto borde

      if (center) {
        board.create("circle", parents, {
          strokeColor: el.color || "#000000",
          fillColor: el.fillColor || "none",
          fillOpacity: el.fillOpacity || 0.3,
          layer:
            el.fillColor && el.fillColor.toUpperCase() === "#FFFFFF" ? 5 : 0,
        });
      }
      break;

    case "sector":
      // Un sector necesita 3 puntos: [Centro, Inicio, Fin] en sentido antihorario
      const sCenter = resolvePoint(el.parents[0]);
      const sP1 = resolvePoint(el.parents[1]);
      const sP2 = resolvePoint(el.parents[2]);

      if (sCenter && sP1 && sP2) {
        board.create("sector", [sCenter, sP1, sP2], {
          strokeColor: el.color || "#000000",
          strokeWidth: 2,
          fillColor: el.fillColor || "#FFCE56",
          fillOpacity: el.fillOpacity || 0.4,
          layer: 0, // Fondo
          fixed: true,
        });
      }
      break;

    case "angle":
      // Delegamos al especialista
      const angle = renderAngle(board, el, createdObjects);
      if (el.name && angle) createdObjects[el.name] = angle;
      break;

    default:
      console.warn("Tipo de geometría desconocido:", type);
  }
};
