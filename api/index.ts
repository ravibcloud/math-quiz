import express from "express";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "The Quiz Brain is Awake!" });
});

// Helper to read the Excel file
const getQuestionsFromExcel = () => {
  try {
    const filePath = path.join(process.cwd(), "active_quiz.xlsx");
    
    if (!fs.existsSync(filePath)) {
      console.error("quiz.xlsx not found at", filePath);
      return [];
    }

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
          // Local files are expected in /public/quiz-images/ which maps to /quiz-images/ in the browser
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
    console.error("Error reading Excel:", error);
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
