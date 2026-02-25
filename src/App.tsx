/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  Star, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Play,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from './constants';

const COLORS = [
  'bg-red-500 hover:bg-red-600',
  'bg-blue-500 hover:bg-blue-600',
  'bg-amber-500 hover:bg-amber-600',
  'bg-emerald-500 hover:bg-emerald-600'
];

const SHAPES = ['▲', '◆', '●', '■'];

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'feedback' | 'finished'>('start');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [questionTimer, setQuestionTimer] = useState(20);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  // Fetch questions from our new API
  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
      setTimeLeft(questionTimer);
      setGameState('playing');
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (gameState !== 'playing') return;
    
    setSelectedOption(index);
    setLoading(true);

    try {
      // Ask the server if we are correct
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionId: currentQuestion.id, 
          selectedOption: index 
        })
      });
      const result = await response.json();
      
      setIsCorrect(result.isCorrect);
      setCorrectAnswerIndex(result.correctAnswer);
      
      if (result.isCorrect) {
        setScore(prev => prev + 1);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
      }
      
      setGameState('feedback');
    } catch (error) {
      console.error("Failed to check answer", error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(questionTimer);
      setSelectedOption(null);
      setIsCorrect(null);
      setCorrectAnswerIndex(null);
      setGameState('playing');
    } else {
      setGameState('finished');
      if (score > questions.length * 0.7) {
        triggerConfetti();
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestions([]);
    setSelectedOption(null);
    setIsCorrect(null);
    setCorrectAnswerIndex(null);
    setGameState('start');
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setIsCorrect(false);
      setGameState('feedback');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence>
          {gameState === 'playing' && Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110vh', x: Math.random() * 100 + 'vw' }}
              animate={{ 
                y: '-10vh',
                rotate: 360,
                transition: { duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear" }
              }}
              className="absolute opacity-10 text-4xl"
            >
              🎈
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Star className="text-white w-6 h-6 fill-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-900">STAAR Math Challenge</h1>
        </div>
        
        {gameState === 'playing' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <Timer className={`w-5 h-5 ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
              <span className={`font-mono font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-500">
              Question <span className="text-indigo-600">{currentQuestionIndex + 1}</span> / {questions.length}
            </div>
          </div>
        )}

        {gameState === 'start' && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Settings className="w-4 h-4" />
            <span>20 Questions • {questionTimer}s each</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 relative">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="bg-indigo-100 p-6 rounded-full"
                >
                  <Trophy className="w-20 h-20 text-indigo-600" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-full shadow-lg"
                >
                  <Star className="w-6 h-6 text-white fill-white" />
                </motion.div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ready to Ace STAAR?</h2>
                <p className="text-slate-500 text-lg">Test your skills with 20 gamified math questions from real STAAR exams.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Time per question</label>
                  <div className="flex gap-2">
                    {[10, 20, 30, 60].map(t => (
                      <button
                        key={t}
                        onClick={() => setQuestionTimer(t)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${questionTimer === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'LOADING...' : <><Play className="fill-white" /> START QUIZ</>}
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-5xl flex flex-col gap-8"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(index)}
                    className={`${COLORS[index % COLORS.length]} text-white p-6 rounded-2xl flex items-center gap-6 text-left transition-all shadow-lg group`}
                  >
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 group-hover:bg-white/30">
                      {SHAPES[index % SHAPES.length]}
                    </div>
                    <span className="text-xl md:text-2xl font-bold">{option}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-2xl w-full p-10 rounded-3xl shadow-2xl text-center space-y-8 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}
            >
              <div className="flex justify-center">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    className="bg-white/20 p-6 rounded-full"
                  >
                    <CheckCircle2 className="w-24 h-24 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1], x: [0, -10, 10, -10, 10, 0] }}
                    className="bg-white/20 p-6 rounded-full"
                  >
                    <XCircle className="w-24 h-24 text-white" />
                  </motion.div>
                )}
              </div>

              <div className="text-white space-y-2">
                <h2 className="text-5xl font-black uppercase tracking-tighter">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                {!isCorrect && correctAnswerIndex !== null && (
                  <p className="text-xl font-bold opacity-90">
                    The correct answer was: {currentQuestion.options[correctAnswerIndex]}
                  </p>
                )}
              </div>

              <button
                onClick={nextQuestion}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl text-xl font-black shadow-xl hover:bg-slate-50 transition-colors flex items-center gap-3 mx-auto"
              >
                {currentQuestionIndex === questions.length - 1 ? 'SEE RESULTS' : 'NEXT QUESTION'}
                <ArrowRight />
              </button>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-10"
            >
              <div className="space-y-4">
                <div className="relative inline-block">
                  <Trophy className="w-24 h-24 text-amber-400 mx-auto" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"
                  />
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Quiz Complete!</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Your Score</div>
                  <div className="text-5xl font-black text-indigo-600">{score}</div>
                  <div className="text-sm font-bold text-indigo-400">out of {questions.length}</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Accuracy</div>
                  <div className="text-5xl font-black text-emerald-600">{Math.round((score / questions.length) * 100)}%</div>
                  <div className="text-sm font-bold text-emerald-400">Success Rate</div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={restartQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <RotateCcw /> PLAY AGAIN
                </button>
                <p className="text-slate-400 font-medium">Great job! Keep practicing to master STAAR Math.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Progress Bar */}
      {gameState === 'playing' && (
        <div className="h-4 bg-slate-200 w-full relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          />
        </div>
      )}
    </div>
  );
}
