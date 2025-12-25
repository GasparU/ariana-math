<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>



Módulo: EXAM (src/exam)
Encargado de la creación y gestión de pruebas. 

ExamController:

POST /preview: Genera un examen volátil con IA (no guarda en BD) para que el usuario lo revise.

POST /: Guarda el examen aprobado. Dispara el agente "Solver-on-Save".

GET /: Lista el historial de exámenes creados.

ExamService:

preview(): Llama a Gemini para crear JSON estructurado.

create(): Guarda en Supabase. Si detecta edición manual, llama a recalculateSolutions.

recalculateSolutions(): (Privado) Pide a la IA que re-resuelva los ejercicios basándose en los gráficos editados por el usuario.

Módulo: RAG (src/rag)
Encargado de la Memoria y el Conocimiento (Cerebro Documental).

RagController:

POST /upload: Recibe PDFs, extrae metadatos (grado, tema) y los envía a procesar.

RagService:

ingestPdf(): Intenta leer texto plano. Si falla (es escaneado), derivará al OCR. Fragmenta el texto y guarda embeddings (vectores) en Supabase.

searchSimilar(): Busca fragmentos relevantes en la BD vectorial según una consulta.

OcrService (NUEVO):

processScannedFile(): Sube archivos temporales a Google AI para transcribir imágenes matemáticas y texto manuscrito/escaneado.

Módulo: RESULTS (src/results)
Encargado de las Calificaciones y Progreso.

ResultsController:

POST /: Guarda la nota de un alumno tras dar el examen.

GET /stats: Obtiene el dominio por temas (para ver debilidades).

ResultsService:

Conecta con las tablas exam_results y vistas de estadísticas en Supabase.