// Este archivo maneja Áreas y Polígonos usando JSXGraph

export const renderPolygon = (board, el, createdObjects) => {
  // Mapeamos los nombres de los padres ("A", "B", "C") a los objetos Punto reales
  const polyPoints = el.parents
    .map((pName) => {
      // Si el padre es una coordenada directa [x,y] (caso raro pero posible)
      if (Array.isArray(pName))
        return board.create("point", pName, { visible: false });

      // Lo normal: buscamos el punto en el mapa de objetos ya creados
      return createdObjects[pName];
    })
    .filter(Boolean); // Filtramos nulos por seguridad

  if (polyPoints.length >= 3) {
    board.create("polygon", polyPoints, {
      borders: {
        strokeColor: el.color || "#000000",
        strokeWidth: 2,
      },
      fillColor: el.fillColor || "#e0f2fe", // Azul suave por defecto
      fillOpacity: el.fillOpacity || 0.3,
      layer: 0, // Al fondo para no tapar textos ni líneas
      hasInnerPoints: true,
    });
  }
};
