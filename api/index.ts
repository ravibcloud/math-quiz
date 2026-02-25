import express from "express";

const app = express();
app.use(express.json());

// The "Answer Key" is stored safely here on the server
const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: "Rebecca bought 8 air filters at $16.95 each and used a $7.50 coupon. How much did she pay?",
    options: ["$128.10", "$135.60", "$143.10", "$120.60"],
    correctAnswer: 0
  },
  {
    id: 2,
    text: "What is 0.64 rounded to the tenths place?",
    options: ["0.6", "0.7", "0.64", "1.0"],
    correctAnswer: 0
  },
  {
    id: 3,
    text: "Ms. Jaffey put 428.5 ounces of pretzels into 5 bowls equally. How many ounces per bowl?",
    options: ["80.0 oz", "85.3 oz", "85.7 oz", "97.7 oz"],
    correctAnswer: 2
  },
  {
    id: 4,
    text: "Dion ran 3.75 kilometers each day for 28 days. What was the total distance?",
    options: ["10.5 km", "105 km", "18.75 km", "1,050 km"],
    correctAnswer: 1
  },
  {
    id: 5,
    text: "The edge of a cube is 3 units. What is the volume of the cube?",
    options: ["9 cubic units", "12 cubic units", "27 cubic units", "81 cubic units"],
    correctAnswer: 2
  },
  {
    id: 6,
    text: "4 friends paid $50.24 total for museum tickets. How much did each friend pay?",
    options: ["$12.01", "$12.56", "$10.01", "$200.96"],
    correctAnswer: 1
  },
  {
    id: 7,
    text: "What is the value of 4(-2) + (-10) + 3(-8)?",
    options: ["-22", "-13", "-42", "7"],
    correctAnswer: 2
  },
  {
    id: 8,
    text: "Dennis made $245, which was 7% of the total value of furniture sold. Total value?",
    options: ["$350", "$1,715", "$3,500", "$171.50"],
    correctAnswer: 2
  },
  {
    id: 9,
    text: "What is the value of 6 + (-4)³?",
    options: ["-58", "-70", "8", "-10"],
    correctAnswer: 0
  },
  {
    id: 10,
    text: "Which point follows the rule y = x + 3?",
    options: ["(3, 1)", "(1, 4)", "(5, 2)", "(0, 0)"],
    correctAnswer: 1
  },
  {
    id: 11,
    text: "Mr. Maclane drove 577.2 miles. Ms. Lopez drove 165.4 miles. How many more miles?",
    options: ["311.8", "411.8", "742.6", "400.0"],
    correctAnswer: 1
  },
  {
    id: 12,
    text: "A man bought 6 cans of tuna at $0.93 each. What was the total cost?",
    options: ["$5.48", "$5.58", "$4.98", "$6.93"],
    correctAnswer: 1
  },
  {
    id: 13,
    text: "What is the value of (1/5) ÷ 30?",
    options: ["1/150", "1/6", "6", "150"],
    correctAnswer: 0
  },
  {
    id: 14,
    text: "What is the value of 3(25 + 19) + 4(3)?",
    options: ["144", "168", "294", "408"],
    correctAnswer: 0
  },
  {
    id: 15,
    text: "A family used 2.24 lbs of beef for 8 equal burgers. How much beef per burger?",
    options: ["0.33 lb", "0.28 lb", "0.3 lb", "2.8 lb"],
    correctAnswer: 1
  },
  {
    id: 16,
    text: "Kelsi spends $6.75 for breakfast for 14 Saturdays. What is the total spent?",
    options: ["$94.50", "$20.75", "$92.30", "$33.75"],
    correctAnswer: 0
  },
  {
    id: 17,
    text: "Nicholas put 1,012 cards into 22 boxes equally. How many cards per box?",
    options: ["55", "50", "46", "47"],
    correctAnswer: 2
  },
  {
    id: 18,
    text: "Fabio drinks 2 quarts of water. How many cups is this? (1 quart = 4 cups)",
    options: ["4 cups", "16 cups", "64 cups", "8 cups"],
    correctAnswer: 3
  },
  {
    id: 19,
    text: "A worker used 8.05 kg of meat for 35 lunches. How much meat per lunch?",
    options: ["2.03 kg", "0.23 kg", "0.023 kg", "2.3 kg"],
    correctAnswer: 1
  },
  {
    id: 20,
    text: "What is the value of 2(32 + 18) ÷ 4?",
    options: ["25", "100", "50", "12.5"],
    correctAnswer: 0
  }
];

// Send questions to the browser (without answers)
app.get("/api/questions", (req, res) => {
  const safeQuestions = QUIZ_QUESTIONS.map(({ id, text, options }) => ({
    id,
    text,
    options,
  }));
  res.json(safeQuestions);
});

// Check if a student's answer is correct
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
