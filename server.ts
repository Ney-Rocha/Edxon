import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Dynamic Course Outline Generator
  app.post("/api/gemini/generate-outline", async (req, res) => {
    const { title, category, description } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      // Safe beautiful fallback if key is unconfigured or a placeholder
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          duration: "4 horas (Membro Técnico)",
          audience: "Colaboradores seniores, líderes seniores e analistas do setor de " + (category || "Tecnologia"),
          outline: `### Ementa Sugerida

1. **Introdução Estratégica** (45 min)
   - Conceitos basilares da área
   - Discussão de melhores práticas de mercado do setor
2. **Métodos Práticos e Conceitual** (90 min)
   - Estudo de caso interativo real
   - Resolução de exercícios práticos assistidos
3. **Métricas de Performance** (45 min)
   - Planos de desenvolvimento pessoal e profissional (PDI)`
        });
      }

      // Initialize the modern @google/genai module
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é um curador e desenhista instrucional de treinamentos de alta qualidade.
Crie informações sobre duração, público recomendado e uma ementa ou outline estruturada (em formato tópicos markdown) para o seguinte curso:
Título do Curso: ${title}
Categoria: ${category}
Descrição inicial: ${description || 'Nenhum resumo inicial.'}

Retorne obrigatoriamente um objeto JSON estrito com esta estrutura descritiva abaixo (sem aspas adicionais, tags html ou blocos de código markdown que quebrem o JSON parser):
{
  "duration": "Indique a duração sugerida em horas",
  "audience": "Descreva quem é o público-alvo",
  "outline": "Módulos detalhados do curso estruturados com tempos em formato Markdown simples"
}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      const cleaned = text.trim();
      res.json(JSON.parse(cleaned));
    } catch (e: any) {
      console.error("Gemini Generation Error:", e);
      // Fallback on error
      res.json({
        duration: "3 horas aula",
        audience: "Colaboradores do setor e analistas responsáveis.",
        outline: `### Ementa Básica do Módulo

1. **Visão Geral** (60 min)
2. **Casos de Negócio** (60 min)
3. **Autoavaliação** (60 min)`
      });
    }
  });

  // Serve static assets or mount Vite handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
