import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import { OcrService } from './ocr.service';

@Injectable()
export class RagService {
  private supabase: SupabaseClient;
  private embeddings: OpenAIEmbeddings;

  constructor(
    private configService: ConfigService,
    private ocrService: OcrService,
  ) {
    const sbUrl = this.configService.get<string>('SUPABASE_URL');
    const sbKey = this.configService.get<string>('SUPABASE_KEY');
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!sbUrl || !sbKey || !openAiKey)
      throw new Error('Faltan variables de entorno (SUPABASE o OPENAI)');

    this.supabase = createClient(sbUrl, sbKey);
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: openAiKey,
      modelName: 'text-embedding-3-small',
    });
  }

  // =================================================================
  // ESTRATEGIA DE FUSIÓN: TEXTO NATIVO + DESCRIPCIONES VISUALES
  // =================================================================
  async processDocument(filePath: string, metadata: any): Promise<string[]> {
    console.log('🚀 [START] Procesando:', path.basename(filePath));

    try {
      const dataBuffer = fs.readFileSync(filePath);

      // 1. Detectar si necesitamos Ojos (OCR)
      const visualKeywords = [
        'geom',
        'fisic',
        'trigon',
        'algebr',
        'aritm',
        'razonam',
        'habilidad',
        'quimic',
        'cienc',
        'matem',
      ];
      const combinedMeta =
        `${metadata.subject} ${metadata.course} ${metadata.source_filename}`.toLowerCase();
      let needsVision = visualKeywords.some((k) => combinedMeta.includes(k));

      // 2. Obtener el Texto Nativo (La base sólida)
      let nativeText = '';
      try {
        const pdfData = await pdf(dataBuffer);
        nativeText = pdfData.text || '';
      } catch (e) {
        console.warn('⚠️ Falló lectura nativa.');
      }

      // Si no hay texto nativo, forzamos visión completa
      if (nativeText.length < 500) needsVision = true;

      let finalText = '';
      let processingMode = 'Texto Digital';

      // 3. EJECUCIÓN
      if (needsVision) {
        console.log(
          `👁️ ESTRATEGIA VISUAL: Obteniendo descripciones de gráficos...`,
        );

        try {
          // Llamamos al servicio de OCR (que ahora debe tener el prompt de "SOLO DESCRIBE GRÁFICOS")
          const visualDescriptions = await this.ocrService.processScannedFile(
            filePath,
            'application/pdf',
          );

          if (visualDescriptions && visualDescriptions.length > 50) {
            console.log('✅ FUSIÓN EXITOSA: Uniendo Texto + Gráficos.');

            // AQUÍ ESTÁ EL CAMBIO: No comparamos longitudes. SUMAMOS.
            finalText = `
              === CONTENIDO TEXTUAL DEL LIBRO ===
              ${nativeText}
              
              === DESCRIPCIONES VISUALES Y GRÁFICOS (DETECTADOS POR IA) ===
              ${visualDescriptions}
            `;

            processingMode = 'Fusión Híbrida (Texto + Vision)';
          } else {
            console.warn(
              '⚠️ La IA no encontró gráficos o devolvió vacío. Usando solo texto.',
            );
            finalText = nativeText;
            processingMode = 'Texto Digital (Rescate - Sin Gráficos)';
          }
        } catch (err) {
          console.error('❌ Falló la visión IA:', err.message);
          finalText = nativeText;
          processingMode = 'Texto Digital (Rescate por Error)';
        }
      } else {
        console.log('📄 ESTRATEGIA: Texto Puro.');
        finalText = nativeText;
      }

      // Validación final de seguridad
      if (!finalText || finalText.length < 50) {
        if (nativeText.length > 50) {
          finalText = nativeText;
          processingMode = 'Texto Digital (Emergencia)';
        } else {
          throw new Error('Documento ilegible (Vacío).');
        }
      }

      // 4. Guardado (Chunking)
      const cleanText = finalText.replace(/\n\s*\n/g, '\n').trim();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await splitter.createDocuments([cleanText], [metadata]);

      console.log(`💾 Guardando ${docs.length} fragmentos...`);
      await SupabaseVectorStore.fromDocuments(docs, this.embeddings, {
        client: this.supabase,
        tableName: 'documents',
        queryName: 'match_documents',
      });

      // 5. Auditoría
      await this.supabase.from('library_topics').upsert(
        {
          source_filename: metadata.source_filename,
          course: metadata.subject,
          source: metadata.source,
          grade: metadata.grade,
          topic_name: metadata.topic || 'General',
          topics: [
            'Documento Procesado',
            processingMode,
            `Fragmentos: ${docs.length}`,
          ],
          created_at: new Date().toISOString(),
        },
        { onConflict: 'source_filename' },
      );

      return [
        'Procesamiento Exitoso',
        `Fragmentos: ${docs.length}`,
        `Modo: ${processingMode}`,
      ];
    } catch (error) {
      console.error('❌ ERROR CRÍTICO:', error);
      throw error;
    }
  }

  // =================================================================
  // 2. BÚSQUEDA (RAG) - VERSIÓN LIMPIA Y CORREGIDA
  // =================================================================
  async searchSimilar(query: string, filter?: any): Promise<string> {
    try {
      const vectorStore = new SupabaseVectorStore(this.embeddings, {
        client: this.supabase,
        tableName: 'documents',
        queryName: 'match_documents',
      });

      console.log(`🔍 Buscando: "${query}" con filtros:`, filter);

      // CORRECCIÓN: Eliminamos la función 'searchFilter' que no se usaba.
      // LangChain para Supabase acepta el objeto 'filter' directamente si coincide con los metadatos.
      // Ejemplo de filter: { subject: 'matematica', grade: '5to' }

      const results = await vectorStore.similaritySearch(query, 4, filter);

      if (!results.length) {
        console.log('   ⚠️ No se encontraron coincidencias relevantes.');
        return '';
      }

      console.log(`   ✅ Encontrados ${results.length} fragmentos relevantes.`);
      return results.map((r) => r.pageContent).join('\n\n---\n\n');
    } catch (e) {
      console.error('⚠️ Error buscando contexto RAG:', e);
      return '';
    }
  }

  // =================================================================
  // 3. GESTIÓN DE BIBLIOTECA (Métodos auxiliares para el Controller)
  // =================================================================

  async getCustomCourses() {
    const { data } = await this.supabase
      .from('library_topics')
      .select('course')
      .not('course', 'is', null);

    // Filtramos duplicados y nulos para devolver lista limpia
    const courses = [...new Set(data?.map((d) => d.course))].filter(Boolean);
    return courses;
  }

  // Reemplaza esta función en rag.service.ts
  async deleteTopic(course: string, filename: string) {
    console.log(`🗑️ Solicitud de eliminar: ${filename}`);

    // 1. Borrar de la lista visual (library_topics)
    // CAMBIO: Usamos solo el nombre del archivo porque es único.
    // Esto evita errores si el curso tiene mayúsculas/tildes diferentes.
    const { error: errorVisual } = await this.supabase
      .from('library_topics')
      .delete()
      .eq('source_filename', filename); // .eq es más directo que .match

    if (errorVisual) {
      console.error('Error borrando visual:', errorVisual);
    }

    // 2. Borrar la memoria vectorial (documents)
    // Aquí es más complejo porque metadata es un JSON.
    // Usamos filter para buscar dentro del JSON.
    const { error: errorMemoria } = await this.supabase
      .from('documents')
      .delete()
      .filter('metadata->>source_filename', 'eq', filename);

    if (errorMemoria) {
      console.error('Error borrando memoria:', errorMemoria);
      throw new Error(errorMemoria.message);
    }

    console.log('✅ Archivo eliminado correctamente de ambas tablas.');
    return { message: 'Eliminado correctamente' };
  }

  // Stubs para evitar errores si el controller los llama (puedes implementarlos luego)
  async renameTopic(course: string, oldName: string, newName: string) {
    return {};
  }
  // ... dentro de RagService ...

  async addCustomCourse(name: string) {
    if (!name) throw new Error('El nombre del curso es requerido');

    // INSERTAR MARCADOR
    const { error } = await this.supabase.from('library_topics').insert({
      course: name,
      // AGREGADO: La BD exige 'topic_name', así que le ponemos 'General' para cumplir
      topic_name: 'General',
      source_filename: `SYSTEM_COURSE_${name}_${Date.now()}`,
      source: 'Sistema',
      grade: 'General',
      topics: ['Asignatura Base'],
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Error creando curso en BD:', error.message);
      throw new Error(`Error BD: ${error.message}`);
    }

    return { message: 'Curso creado correctamente' };
  }
  async deleteCustomCourse(name: string) {
    // 1. Eliminar de la vista visual (library_topics)
    const { error: libError } = await this.supabase
      .from('library_topics')
      .delete()
      .eq('course', name);

    if (libError) throw new Error(libError.message);

    // 2. OPCIONAL: Eliminar los vectores de memoria asociados a este curso
    // (Ten cuidado, esto borrará el conocimiento de la IA sobre ese curso)
    // await this.supabase
    //   .from('documents')
    //   .delete()
    //   .filter('metadata->>subject', 'eq', name.toLowerCase());

    return { message: `Curso ${name} y sus referencias eliminados` };
  }
  async renameCustomCourse(oldName: string, newName: string) {
    // Actualizamos el nombre en la tabla visual para que se refleje en el Frontend
    const { error } = await this.supabase
      .from('library_topics')
      .update({ course: newName })
      .eq('course', oldName);

    if (error) throw new Error(error.message);

    return { message: 'Curso renombrado correctamente' };
  }

  async getRagInventory() {
    // Consultamos la tabla donde guardamos los metadatos visuales
    const { data, error } = await this.supabase
      .from('library_topics')
      .select('*')
      .not('source_filename', 'like', 'SYSTEM_COURSE_%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
