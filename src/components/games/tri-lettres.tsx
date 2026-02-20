"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface TriConfig {
    pairs: { left_letter: string; right_letter: string; left_label: string; right_label: string; left_emoji: string; right_emoji: string }[];
}

const DEFAULT_PAIRS = [
    { left_letter: "b", right_letter: "d", left_label: "Bébé", right_label: "Doigt", left_emoji: "👶", right_emoji: "☝️" },
];

export function TriLettres({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as TriConfig;
    const pairs = gameConfig?.pairs?.length ? gameConfig.pairs : DEFAULT_PAIRS;
    const pair = pairs[0];

    const TOTAL_ITEMS = difficulty === 1 ? 10 : difficulty === 2 ? 15 : 20;

    // Generate sequence of letters to sort
    const sequence = useMemo(() => {
        const arr: string[] = [];
        for (let i = 0; i < TOTAL_ITEMS; i++) {
            arr.push(Math.random() < 0.5 ? pair.left_letter : pair.right_letter);
        }
        return arr;
    }, [pair, TOTAL_ITEMS]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [feedback, setFeedback] = useState<{ side: "left" | "right"; correct: boolean } | null>(null);
    const [animKey, setAnimKey] = useState(0);

    const currentLetter = sequence[currentIndex];

    function handleAnswer(side: "left" | "right") {
        if (feedback) return;
        const expectedSide = currentLetter === pair.left_letter ? "left" : "right";
        const correct = side === expectedSide;
        setFeedback({ side, correct });
        if (correct) {
            setScore((s) => s + 1);
        } else {
            setMistakes((m) => [...m, {
                item: currentLetter.toUpperCase(),
                expected: currentLetter === pair.left_letter ? `${pair.left_label} (gauche)` : `${pair.right_label} (droite)`,
                got: side === "left" ? pair.left_label : pair.right_label,
            }]);
        }
        setAnswers((a) => [...a, correct]);
        setTimeout(() => {
            setFeedback(null);
            setAnimKey((k) => k + 1);
            if (currentIndex + 1 >= TOTAL_ITEMS) {
                const finalScore = score + (correct ? 1 : 0);
                const acc = Math.round((finalScore / TOTAL_ITEMS) * 100);
                const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
                onComplete({ score: finalScore, starsEarned: stars, accuracy: acc, itemsCompleted: TOTAL_ITEMS, itemsTotal: TOTAL_ITEMS, mistakes, durationSeconds: 0 });
            } else {
                setCurrentIndex((i) => i + 1);
            }
        }, 500);
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Score strip */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-violet-600">✓ {score}</span>
                <div className="flex gap-0.5">
                    {sequence.map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < currentIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === currentIndex ? "bg-violet-400" : "bg-gray-200"}`} />
                    ))}
                </div>
                <span className="text-sm font-bold text-red-400">✗ {mistakes.length}</span>
            </div>

            {/* Labels */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center bg-blue-50 rounded-2xl p-3 border-2 border-blue-200">
                    <div className="text-3xl mb-1">{pair.left_emoji}</div>
                    <div className="font-bold text-blue-700">{pair.left_label}</div>
                    <div className="text-4xl font-black text-blue-600 mt-1">{pair.left_letter}</div>
                </div>
                <div className="text-center bg-green-50 rounded-2xl p-3 border-2 border-green-200">
                    <div className="text-3xl mb-1">{pair.right_emoji}</div>
                    <div className="font-bold text-green-700">{pair.right_label}</div>
                    <div className="text-4xl font-black text-green-600 mt-1">{pair.right_letter}</div>
                </div>
            </div>

            {/* Falling letter */}
            <div className="bg-gray-900 rounded-3xl h-40 flex items-center justify-center relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-900/50 to-gray-900" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentIndex}-${animKey}`}
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`relative z-10 text-8xl font-black select-none ${feedback
                                ? feedback.correct ? "text-green-400" : "text-red-400"
                                : "text-white"
                            }`}
                    >
                        {currentLetter}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleAnswer("left")}
                    disabled={!!feedback}
                    className={`h-20 rounded-2xl font-bold text-xl border-4 transition-colors ${feedback?.side === "left"
                            ? feedback.correct ? "bg-green-500 border-green-600 text-white" : "bg-red-500 border-red-600 text-white"
                            : "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                        }`}
                >
                    ← {pair.left_letter.toUpperCase()} comme {pair.left_label}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleAnswer("right")}
                    disabled={!!feedback}
                    className={`h-20 rounded-2xl font-bold text-xl border-4 transition-colors ${feedback?.side === "right"
                            ? feedback.correct ? "bg-green-500 border-green-600 text-white" : "bg-red-500 border-red-600 text-white"
                            : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                        }`}
                >
                    {pair.right_letter.toUpperCase()} comme {pair.right_label} →
                </motion.button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-400">{currentIndex + 1} / {TOTAL_ITEMS}</div>
        </div>
    );
}
