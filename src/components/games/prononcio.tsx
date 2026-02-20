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

interface PairConfig {
    son1: string;
    son2: string;
    words: Array<{ word: string; target: 1 | 2; image?: string }>;
}

interface PrononcioConfig {
    pairs: PairConfig[];
}

export function Prononcio({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as PrononcioConfig;
    const pairIndex = Math.min(difficulty - 1, gameConfig.pairs.length - 1);
    const currentPair = gameConfig.pairs[pairIndex] || { son1: "S", son2: "CH", words: [] };

    const words = useMemo(() => {
        return [...currentPair.words].sort(() => Math.random() - 0.5);
    }, [currentPair]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [startTime] = useState(Date.now());

    const currentWord = words[currentIndex];
    const total = words.length;

    function handleAnswer(choice: 1 | 2) {
        if (feedback) return;
        const isCorrect = currentWord.target === choice;
        setFeedback(isCorrect ? "correct" : "wrong");

        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            setMistakes(m => [...m, {
                item: currentWord.word,
                expected: currentWord.target === 1 ? currentPair.son1 : currentPair.son2,
                got: choice === 1 ? currentPair.son1 : currentPair.son2
            }]);
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex + 1 >= total) {
                const accuracy = Math.round(((isCorrect ? score + 1 : score) / total) * 100);
                onComplete({
                    score: isCorrect ? score + 1 : score,
                    starsEarned: accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0,
                    accuracy,
                    itemsCompleted: total,
                    itemsTotal: total,
                    mistakes: isCorrect ? mistakes : [...mistakes, { item: currentWord.word, expected: currentWord.target === 1 ? currentPair.son1 : currentPair.son2, got: choice === 1 ? currentPair.son1 : currentPair.son2 }],
                    durationSeconds: Math.round((Date.now() - startTime) / 1000),
                });
            } else {
                setCurrentIndex(i => i + i);
            }
        }, 800);
    }

    if (!currentWord) {
        return (
            <div className="text-center py-10 text-gray-400">
                Pas de contenu pour ce niveau.
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="flex gap-1 mb-8">
                {words.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-orange-400" : "bg-gray-100"}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className={`bg-white rounded-3xl p-10 shadow-xl border-4 text-center transition-colors ${feedback === "correct" ? "border-green-400 bg-green-50" :
                            feedback === "wrong" ? "border-red-400 bg-red-50" : "border-orange-100"
                        }`}
                >
                    <div className="text-sm font-bold text-orange-400 mb-6 uppercase tracking-widest">
                        Écoute bien...
                    </div>

                    <div className="text-5xl font-black text-gray-800 mb-8">
                        {currentWord.word}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => handleAnswer(1)}
                            variant="outline"
                            className={`h-24 text-3xl font-black rounded-2xl border-2 hover:bg-orange-50 ${feedback === "correct" && currentWord.target === 1 ? "bg-green-100 border-green-500" : ""
                                }`}
                        >
                            {currentPair.son1}
                        </Button>
                        <Button
                            onClick={() => handleAnswer(2)}
                            variant="outline"
                            className={`h-24 text-3xl font-black rounded-2xl border-2 hover:bg-orange-50 ${feedback === "correct" && currentWord.target === 2 ? "bg-green-100 border-green-500" : ""
                                }`}
                        >
                            {currentPair.son2}
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="text-center mt-8 text-gray-400 text-sm">
                Quel son entends-tu dans ce mot ?
            </div>
        </div>
    );
}
