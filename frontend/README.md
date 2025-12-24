# Ariana Math Quest 🚀 - Intelligent AI Learning Platform

[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini IA](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

## 🌟 Overview
Plataforma educativa de alto rendimiento diseñada para la optimización del aprendizaje matemático. El sistema utiliza **IA Generativa** y **RAG (Retrieval-Augmented Generation)** para crear evaluaciones personalizadas basadas en material bibliográfico real.

## 🧠 Key Engineering Features

### 1. Motor RAG (Retrieval-Augmented Generation)
Implementación de un pipeline de ingesta de documentos (PDF/Imágenes) que convierte libros escolares en una **Base de Datos Vectorial**.
- **IA Vision:** Uso de Gemini 1.5 Pro para describir gráficos y figuras geométricas complejas, permitiendo que la IA "entienda" las imágenes del libro.
- **LangChain:** Procesamiento y segmentación de texto (Chunking) para una recuperación semántica precisa.

### 2. Arquitectura de Prompts Polimórficos
El backend en **NestJS** aplica el patrón *Strategy* para modularizar la generación de contenido:
- **Estrategia Ciencias:** Generación de soluciones paso a paso con renderizado **LaTeX** ($...$) para rigor matemático.
- **Estrategia Letras:** Justificaciones narrativas y didácticas adaptadas al nivel escolar.

### 3. Telemetría y Observabilidad
Diseño de un sistema de **Telemetría Silenciosa** que rastrea el acceso geográfico de usuarios (Reclutadores) mediante integración de APIs de Geolocalización, almacenando métricas de comportamiento en tiempo real.

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend:** NestJS (Node.js framework), TypeScript.
- **AI Stack:** Google Gemini API (Pro & Flash), LangChain, OpenAI Embeddings.
- **Infrastructure:** Supabase (PostgreSQL + Vector Store), JWT Auth.

## 🚀 How to Explore
1. **Acceso Demo:** El login cuenta con un modo de acceso rápido para reclutadores sin necesidad de registro.
2. **Biblioteca RAG:** Explora la sección de "Cursos" para ver cómo la IA ha indexado libros de Álgebra y Geometría.
3. **Generación:** Crea una misión y observa cómo el agente de IA construye ejercicios únicos con sus respectivos solucionarios.

---
*Desarrollado con enfoque en principios SOLID y escalabilidad de microservicios.*