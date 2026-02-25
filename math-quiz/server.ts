import express from "express";
import { createServer as createViteServer } from "vite";
import { QUIZ_QUESTIONS } from "./src/constants";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to get questions WITHOUT answers (Security!)
  app.get("/api/questions", (req, res) => {
    const safeQuestions = QUIZ_QUESTIONS.map(({ id, text, options }) => ({
      id,
      text,
      options,
    }));
    res.json(safeQuestions);
  });

  // API Route to check an answer (Security!)
  app.post("/api/check", (req, res) => {
    const { questionId, selectedOption } = req.body;
    const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = question.correctAnswer === selectedOption;
    res.json({ 
      isCorrect, 
      correctAnswer: isCorrect ? null : question.correctAnswer 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files from /dist
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
