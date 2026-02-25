import express from "express";
import { createRequire } from "module";
import path from "path";
import fs from "fs";

// This is the most stable way to load 'xlsx' on Vercel
const require = createRequire(import.meta.url);
const xlsx = require("xlsx");

const app = express();
app.use(express.json());

// 1. Health Check (Now with a version number)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    version: "1.0.5", 
    message: "The Quiz Brain is Awake and using the new Loader!" 
  });
});

// Helper to read the Excel file
const getQuestionsFromExcel = () => {
  try {
    const filePath = path.join(process.cwd(), "active_quiz.xlsx");
    
    if (!fs.existsSync(filePath)) {
      console.error("active_quiz.xlsx not found at", filePath);
      return [];
    }

    // Use the stable loader
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    return data.map((row: any, index: number) => {
      const options = [
        String(row.A || ""),
        String(row.B || ""),
        String(row.C || ""),
        String(row.D || "")
      ];
      
      const answerMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correctAnswer = answerMap[String(row.Answer).toUpperCase().trim()] ?? 0;

      const imageValue = String(row.Image || "").trim();
      let finalImage = null;
      if (imageValue) {
        if (imageValue.startsWith('http')) {
          finalImage = imageValue;
        } else {
          finalImage = `/quiz-images/${imageValue}`;
        }
      }

      return {
        id: index + 1,
        text: row.Question,
        image: finalImage,
        options,
        correctAnswer
      };
    });
  } catch (error) {
    console.error("Detailed Excel Error:", error);
    return [];
  }
};

// 2. Get Questions
app.get("/api/questions", (req, res) => {
  const questions = getQuestionsFromExcel();
  const safeQuestions = questions.map(({ id, text, options, image }) => ({
    id,
    text,
    options,
    image
  }));
  res.json(safeQuestions);
});

// 3. Check Answer
app.post("/api/check", (req, res) => {
  const { questionId, selectedOption } = req.body;
  const questions = getQuestionsFromExcel();
  const question = questions.find((q) => q.id === questionId);

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
