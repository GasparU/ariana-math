// check-models.js
// Script para listar modelos disponibles en tu cuenta
require('dotenv').config(); // Carga las variables del .env

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: No se encontró GEMINI_API_KEY en el archivo .env');
  process.exit(1);
}

// Limpiamos la key de espacios accidentales
const cleanKey = apiKey.trim();

console.log(
  '🔑 Probando con API Key que empieza por:',
  cleanKey.substring(0, 10) + '...',
);
console.log('📡 Consultando a Google...');

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ ERROR DE GOOGLE:', data.error.message);
    } else {
      console.log('\n✅ MODELOS DISPONIBLES PARA TU CUENTA:');
      console.log('=======================================');
      // Filtramos solo los que sirven para generar contenido
      const chatModels = data.models
        .filter((m) => m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => m.name.replace('models/', '')); // Quitamos el prefijo para ver el nombre limpio

      console.log(chatModels.join('\n'));
      console.log('=======================================');
      console.log('💡 COPIA UNO DE ESTOS NOMBRES EXACTOS PARA TU CÓDIGO.');
    }
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN:', error);
  }
}

listModels();
