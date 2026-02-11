"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, X } from "lucide-react";

interface GameResult {
  score: number;
  starsEarned: number;
  accuracy: number;
  itemsCompleted: number;
  itemsTotal: number;
  mistakes: Array<{ item: string; expected: string; got: string }>;
  durationSeconds: number;
}

interface WordItem {
  word: string;
  image: string;
  target: boolean;
}

interface SoundPair {
  target: string;
  distractor: string;
  words: WordItem[];
}

interface AttrapeConfig {
  sound_pairs: SoundPair[];
}

const EMOJI_MAP: Record<string, string> = {
  cat: "🐱", bag: "👜", dog: "🐶", monkey: "🐵", shoe: "👟", sun: "☀️",
  fire: "🔥", wind: "💨", flower: "🌸", car: "🚗", red: "🔴", moon: "🌙",
  king: "👑", lion: "🦁",
};

export function AttrapeLesSons({
  config,
  difficulty,
  onComplete,
}: {
  config: Record<string, unknown>;
  difficulty: number;
  onComplete: (result: GameResult) => void;
}) {
  const gameConfig = config as unknown as AttrapeConfig;
  const pairIndex = Math.min(difficulty - 1, gameConfig.sound_pairs.length - 1);
  const currentPair = gameConfig.sound_pairs[pairIndex];

  const words = useMemo(() => {
    return [...currentPair.words].sort(() => Math.random() - 0.5);
  }, [currentPair]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentWord = words[currentIndex];
  const totalWords = words.length;
  const isFinished = currentIndex >= totalWords;

  function handleAnswer(isTarget: boolean) {
    const correct = currentWord.target === isTarget;
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      setScore((s) => s + 1);
    } else {
      setMistakes((m) => [
        ...m,
        {
          item: currentWord.word,
          expected: currentWord.target ? `contient "${currentPair.target}"` : `contient "${currentPair.distractor}"`,
          got: isTarget ? "a dit oui" : "a dit non",
        },
      ]);
    }

    setAnswers((a) => [...a, correct]);

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= totalWords) {
        const finalScore = score + (correct ? 1 : 0);
        const accuracy = Math.round((finalScore / totalWords) * 100);
        const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
        onComplete({
          score: finalScore,
          starsEarned: stars,
          accuracy,
          itemsCompleted: totalWords,
          itemsTotal: totalWords,
          mistakes: correct ? mistakes : [...mistakes, {
            item: currentWord.word,
            expected: currentWord.target ? `contient "${currentPair.target}"` : `contient "${currentPair.distractor}"`,
            got: isTarget ? "a dit oui" : "a dit non",
          }],
          durationSeconds: 0,
        });
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 800);
  }

  if (isFinished) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {words.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i < currentIndex
                ? answers[i]
                  ? "bg-green-400"
                  : "bg-red-400"
                : i === currentIndex
                ? "bg-violet-400"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
          <Volume2 className="w-4 h-4" />
          Trouve les mots avec le son &quot;{currentPair.target}&quot;
        </div>
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative"
        >
          <div
            className={`bg-white rounded-3xl p-8 text-center shadow-lg border-4 transition-colors ${
              feedback === "correct"
                ? "border-green-400 bg-green-50"
                : feedback === "wrong"
                ? "border-red-400 bg-red-50"
                : "border-violet-200"
            }`}
          >
            <div className="text-6xl mb-4">
              {EMOJI_MAP[currentWord.image] || "🔤"}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {currentWord.word}
            </div>
            <div className="text-sm text-gray-500">
              Ce mot contient-il le son &quot;{currentPair.target}&quot; ?
            </div>

            {feedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${
                  feedback === "correct" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {feedback === "correct" ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button
          onClick={() => handleAnswer(true)}
          disabled={feedback !== null}
          className="h-16 text-xl rounded-2xl bg-green-500 hover:bg-green-600 text-white"
        >
          Oui !
        </Button>
        <Button
          onClick={() => handleAnswer(false)}
          disabled={feedback !== null}
          className="h-16 text-xl rounded-2xl bg-orange-500 hover:bg-orange-600 text-white"
        >
          Non !
        </Button>
      </div>

      <div className="text-center mt-4 text-sm text-gray-400">
        {currentIndex + 1} / {totalWords}
      </div>
    </div>
  );
}
