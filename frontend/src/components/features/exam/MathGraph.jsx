import { useEffect, useRef } from "react";
import JXG from "jsxgraph";
import { calculateDynamicBoundingBox } from "./geometryEngine/baseRenderer";
import { renderGeometryElement } from './geometryEngine/index';


const MathGraph = ({ graphData, isEditable = false, onGraphChange }) => {
  const boxRef = useRef(null);
  const boardRef = useRef(null);
  const divId = useRef(
    `jxgbox-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  useEffect(() => {
    // Limpieza
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    if (boxRef.current && graphData && graphData.elements) {
      const rawElements = Array.isArray(graphData.elements)
        ? graphData.elements
        : [];
      const bbox = calculateDynamicBoundingBox(rawElements);

      // Inicializar Tablero
      boardRef.current = JXG.JSXGraph.initBoard(divId, {
        boundingbox: bbox,
        axis: false,
        grid: false,
        showCopyright: false,
        showNavigation: false,
        keepAspectRatio: true,
        backgroundColor: "white",
      });

      const board = boardRef.current;
      const createdObjects = {};

      // ORDEN DE DIBUJADO: Primero Puntos, luego el resto
      // Esto asegura que los segmentos encuentren sus puntos padres
      const sortedElements = [...rawElements].sort((a, b) => {
        if (a.type === "point" && b.type !== "point") return -1;
        if (a.type !== "point" && b.type === "point") return 1;
        return 0;
      });

      // BUCLE PRINCIPAL (Delegación)
      sortedElements.forEach((el) => {
        try {
          // Intentamos dibujar
          renderGeometryElement(board, el, createdObjects);
        } catch (err) {
          // Si falla (ej: falta un punto), solo lo reportamos en consola y seguimos
          console.warn("⚠️ Elemento corrupto ignorado:", el, err);
        }
      });

      if (isEditable && boardRef.current) {
        const board = boardRef.current;

        // 1. DESBLOQUEO: Permitimos mover Puntos Y Textos
        Object.values(createdObjects).forEach((obj) => {
          // Ahora desbloqueamos 'point' Y 'text'
          if (obj.elType === "point" || obj.elType === "text") {
            obj.setAttribute({ fixed: false });
          }

          // TRUCO PRO: Si es un ángulo, intentamos desbloquear su etiqueta
          if (obj.elType === "angle" && obj.label) {
            // Esto permite arrastrar la etiqueta del ángulo independientemente del arco
            obj.label.setAttribute({ fixed: false });
          }
        });

        // 2. ESCUCHAR EL SOLTAR (Drag End)
        board.on("up", () => {
          if (!onGraphChange) return;

          // 3. SINCRONIZACIÓN DE COORDENADAS
          const newElements = graphData.elements.map((el) => {
            const visualObj = createdObjects[el.name];

            if (!visualObj) return el;

            // CASO A: PUNTOS (Guardamos coords nuevas)
            if (el.type === "point") {
              return {
                ...el,
                coords: [visualObj.X(), visualObj.Y()],
              };
            }

            // CASO B: TEXTOS (Guardamos coords nuevas)
            if (el.type === "text") {
              // Los textos en JSXGraph también tienen X() y Y()
              return {
                ...el,
                coords: [visualObj.X(), visualObj.Y()],
              };
            }

            // CASO C: ETIQUETAS DE ÁNGULOS (Más complejo, guardamos el offset)
            // Si moviste la etiqueta de un ángulo, JSXGraph cambia su offset relativo.
            // Para simplificar, por ahora confiaremos en mover los PUNTOS del ángulo
            // o los textos independientes.

            return el;
          });

          onGraphChange({ ...graphData, elements: newElements });
        });
      }
    }
  }, [graphData, divId, isEditable]);

  return (
    <div className="w-full h-full min-h-[350px] bg-white rounded-xl overflow-hidden relative border border-slate-200 shadow-sm flex items-center justify-center my-4">
      <div
        id={divId}
        ref={boxRef}
        className="jxgbox"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
};

export default MathGraph;