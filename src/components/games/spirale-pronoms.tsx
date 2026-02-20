"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface SpiraleItem {
    phrase: string;
    options: string[];
    correct: string;
    emoji: string;
}

interface SpiraleConfig {
    items: SpiraleItem[];
}

export function SpiralePronoms({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as SpiraleConfig;
    const items = gameConfig.items || [
        { phrase: "... regarde la télé.", options: ["Je", "Tu", "Il"], correct: "Il", emoji: "📺" },
        { phrase: "... mangeons une pomme.", options: ["Nous", "Vous", "Ils"], correct: "Nous", emoji: "🍎" },
        { phrase: "... joues au parc.", options: ["Je", "Tu", "Il"], correct: "Tu", emoji: "🌳" },
        { phrase: "... partent en vacances.", options: ["Ils", "Vous", "Nous"], correct: "Ils", emoji: "🚗" },
        { phrase: "... allez à l'école.", options: ["Nous", "Vous", "Elles"], correct: "Vous", emoji: "🏫" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<any[]>([]);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    const current = items[currentIndex];
    const total = items.length;

    function handleAnswer(choice: string) {
        if (feedback) return;
        const isCorrect = choice === current.correct;
        setFeedback(isCorrect ? "correct" : "wrong");

        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            setMistakes(m => [...m, { item: current.phrase, expected: current.correct, got: choice }]);
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex + 1 >= total) {
                const finalScore = isCorrect ? score + 1 : score;
                const accuracy = Math.round((finalScore / total) * 100);
                onComplete({
                    score: finalScore * 10,
                    starsEarned: accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1,
                    accuracy,
                    itemsCompleted: total,
                    itemsTotal: total,
                    mistakes: isCorrect ? mistakes : [...mistakes, { item: current.phrase, expected: current.correct, got: choice }],
                    durationSeconds: Math.round((Date.now() - startTime) / 1000),
                });
            } else {
                setCurrentIndex(i => i + 1);
            }
        }, 800);
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress Spiral Representation (Dots) */}
            <div className="flex justify-center gap-3 mb-12">
                {items.map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: i === currentIndex ? [1, 1.3, 1] : 1,
                            rotate: i === currentIndex ? 360 : 0
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-4 h-4 rounded-full ${i < currentIndex ? "bg-pink-400" : i === currentIndex ? "bg-pink-600 border-4 border-pink-100" : "bg-gray-100"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 10, scale: 1.1 }}
                    className={`bg-white rounded-[3rem] p-12 shadow-2xl border-4 transition-all relative ${feedback === "correct" ? "border-green-400 bg-green-50" :
                            feedback === "wrong" ? "border-red-400 bg-red-50" : "border-pink-50 shadow-pink-100/50"
                        }`}
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-pink-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                        {current.emoji}
                    </div>

                    <div className="mt-6 mb-12 text-center">
                        <h2 className="text-4xl font-black text-gray-800 leading-tight">
                            {current.phrase}
                        </h2>
                        <p className="text-pink-400 font-bold mt-2 uppercase tracking-widest text-sm">Complète la phrase !</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {current.options.map(opt => (
                            <Button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                className={`h-20 text-2xl font-black rounded-2xl shadow-md transition-all ${feedback === "correct" && opt === current.correct ? "bg-green-500 text-white scale-105" :
                                        feedback === "wrong" && opt !== current.correct ? "bg-red-100 text-red-700 opacity-50" :
                                            "bg-white text-gray-800 border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50"
                                    }`}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center h-8">
                        <AnimatePresence>
                            {feedback === "correct" && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-green-600 font-bold flex items-center gap-2 text-xl">
                                    <CheckCircle className="w-8 h-8" /> C&apos;est parfait !
                                </motion.div>
                            )}
                            {feedback === "wrong" && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-red-600 font-bold flex items-center gap-2 text-xl">
                                    <XCircle className="w-8 h-8" /> Essaie encore !
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-center">
                <div className="bg-pink-100/50 px-6 py-2 rounded-full flex items-center gap-2 text-pink-600 font-bold text-sm">
                    <RotateCcw className="w-4 h-4 animate-spin-slow" /> Entraîne ta mémoire grammaticale
                </div>
            </div>
        </div>
    );
}
