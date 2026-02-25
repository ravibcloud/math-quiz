import express from "express";
import { QUIZ_QUESTIONS } from "../src/constants";

const app = express();
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

export default app;
