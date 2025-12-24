import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as path from 'path';

@Injectable()
export class OcrService {
  private genAI: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileManager = new GoogleAIFileManager(apiKey);
  }

  async processScannedFile(
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    let uploadResponse: any = null;

    try {
      console.log(
        `👁️ [OCR Service] Iniciando lectura IA para: ${path.basename(filePath)}`,
      );

      // 1. Subir archivo
      uploadResponse = await this.fileManager.uploadFile(filePath, {
        mimeType: mimeType,
        displayName: `ocr_${Date.now()}_${path.basename(filePath)}`,
      });

      console.log(
        `   📤 Archivo subido a Gemini. URI: ${uploadResponse.file.uri}`,
      );

      // 2. Esperar procesamiento (Polling)
      let file = await this.fileManager.getFile(uploadResponse.file.name);
      let attempts = 0;
      while (file.state === 'PROCESSING' && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        file = await this.fileManager.getFile(uploadResponse.file.name);
        attempts++;
      }

      if (file.state === 'FAILED') {
        throw new Error('Google AI no pudo procesar el archivo.');
      }

      // 3. INTENTO MULTI-MODELO (Para evitar el error 404)
      // Lista de modelos a probar en orden de preferencia
      const modelsToTry = [
        'gemini-1.5-pro', // <--- EL MEJOR (Lee libros enteros + Gráficos complejos)
        'gemini-1.5-pro-001', // Versión estable del Pro
        'gemini-2.0-flash-exp', // Experimental
        'gemini-1.5-flash', // Respaldo rápido
      ];

      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`   🔄 Intentando con modelo: ${modelName}...`);

          const model = this.genAI.getGenerativeModel({
            model: modelName,
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
            ],
          });

          const prompt = `
            Eres un experto en accesibilidad matemática.
            Tu trabajo NO ES TRANSCRIBIR EL TEXTO (eso ya lo tengo).
            Tu trabajo es DESCRIBIR LAS IMÁGENES y GRÁFICOS de este documento.

            INSTRUCCIONES:
            1. Ignora el texto plano largo.
            2. Busca EJERCICIOS VISUALES (secuencias gráficas, figuras geométricas, planos cartesianos).
            3. Cuando encuentres uno, descríbelo entre corchetes así:
               [Gráfico Pág X: Triángulo rectángulo con hipotenusa 5 y cateto base x]
               [Gráfico Pág X: Sucesión de cuadrados con puntos: 1, 4, 9...]
            4. Si hay FÓRMULAS matemáticas complejas (fracciones grandes, raíces), transcríbelas en LaTeX ($...$).
            
            SALIDA:
            Solo dame la lista de descripciones visuales y fórmulas. Sé conciso.
          `;

          const result = await model.generateContent([
            {
              fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
              },
            },
            { text: prompt },
          ]);

          const text = result.response.text();
          console.log(`   ✅ [OCR Service] Éxito con ${modelName}.`);
          return text; // Si funciona, retornamos y salimos del bucle
        } catch (error) {
          console.warn(`   ⚠️ Falló modelo ${modelName}: ${error.message}`);
          lastError = error;
          // Continuamos al siguiente modelo del bucle...
        }
      }

      // Si llegamos aquí, fallaron todos
      throw lastError || new Error('Ningún modelo de Gemini respondió.');
    } catch (error) {
      console.error('❌ Error FINAL en OcrService:', error);
      throw error;
    } finally {
      // 4. Limpieza
      if (uploadResponse?.file?.name) {
        try {
          await this.fileManager.deleteFile(uploadResponse.file.name);
          console.log('   🧹 Archivo temporal eliminado.');
        } catch (e) {}
      }
    }
  }
}
