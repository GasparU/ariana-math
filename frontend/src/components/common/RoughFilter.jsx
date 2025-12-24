import React from "react";

// Este componente inyecta un filtro SVG invisible en la página.
// Luego, cualquier elemento con style={{ filter: 'url(#rough-paper)' }} se verá como dibujado a mano.

export const RoughFilter = () => (
  <svg style={{ width: 0, height: 0, position: "absolute" }}>
    <defs>
      <filter id="rough-paper">
        {/* Genera "ruido" o turbulencia para distorsionar las líneas */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves="3"
          result="noise"
        />
        {/* Desplaza los píxeles usando ese ruido */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="3" // <--- JUEGA CON ESTO: Más alto = Más "tembloroso" (5 es muy chueco, 2 es sutil)
        />
      </filter>
    </defs>
  </svg>
);
