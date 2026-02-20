"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface BullleItem { value: number; id: string; x: number; y: number; }
interface CompteConfig { target?: number; }

function makeBubbles(target: number, count: number): BullleItem[] {
    const bubbles: BullleItem[] = [];
    for (let i = 0; i < count; i++) {
        bubbles.push({
            id: `b-${i}-${Math.random()}`,
            value: Math.floor(Math.random() * 9) + 1,
            x: 10 + Math.random() * 75,
            y: 10 + Math.random() * 75,
        });
    }
    return bubbles;
}

export function CompteEstBon({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as CompteConfig;
    const TARGET = gameConfig?.target ?? 10;
    const ROUNDS = difficulty === 1 ? 4 : difficulty === 2 ? 6 : 8;
    const BUBBLE_COUNT = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10;

    const [round, setRound] = useState(0);
    const [bubbles, setBubbles] = useState<BullleItem[]>(() => makeBubbles(TARGET, BUBBLE_COUNT));
    const [selected, setSelected] = useState<BullleItem[]>([]);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | "over" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const currentSum = selected.reduce((acc, b) => acc + b.value, 0);

    const handleBubble = useCallback((bubble: BullleItem) => {
        if (feedback) return;
        if (selected.find(b => b.id === bubble.id)) {
            setSelected(s => s.filter(b => b.id !== bubble.id));
            return;
        }
        const newSelected = [...selected, bubble];
        const sum = newSelected.reduce((acc, b) => acc + b.value, 0);
        if (sum === TARGET) {
            setSelected(newSelected);
            setFeedback("correct");
            setScore(s => s + 1);
            setAnswers(a => [...a, true]);
            setTimeout(() => {
                if (round + 1 >= ROUNDS) {
                    const fs = score + 1;
                    const acc = Math.round(fs / ROUNDS * 100);
                    onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : 1, accuracy: acc, itemsCompleted: ROUNDS, itemsTotal: ROUNDS, mistakes, durationSeconds: 0 });
                } else {
                    setRound(r => r + 1);
                    setBubbles(makeBubbles(TARGET, BUBBLE_COUNT));
                    setSelected([]);
                    setFeedback(null);
                }
            }, 900);
        } else if (sum > TARGET) {
            setSelected(newSelected);
            setFeedback("over");
            setMistakes(m => [...m, { item: newSelected.map(b => b.value).join("+"), expected: String(TARGET), got: String(sum) }]);
            setTimeout(() => { setSelected([]); setFeedback(null); }, 700);
        } else {
            setSelected(newSelected);
        }
    }, [feedback, selected, TARGET, round, ROUNDS, score, mistakes, BUBBLE_COUNT]);

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-4">
                {Array.from({ length: ROUNDS }).map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < round ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === round ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            {/* Score bar */}
            <div className="flex items-center justify-between mb-3">
                <div className={`text-3xl font-black transition-colors ${feedback === "correct" ? "text-green-500" : feedback === "over" ? "text-red-500" : currentSum === 0 ? "text-gray-300" : "text-violet-600"}`}>
                    {currentSum === 0 ? "?" : currentSum}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Objectif :</span>
                    <span className="text-2xl font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-xl">{TARGET}</span>
                </div>
                <div className="text-sm text-gray-400">{selected.length > 0 ? selected.map(b => b.value).join(" + ") : "Sélectionne..."}</div>
            </div>

            <p className="text-center text-sm text-gray-500 mb-4 font-medium">
                💭 Éclate les bulles qui font {TARGET} !
            </p>

            {/* Bubbles area */}
            <div className="relative bg-gradient-to-b from-blue-100 to-violet-100 rounded-3xl h-64 overflow-hidden border border-violet-200">
                <AnimatePresence>
                    {bubbles.map(bubble => {
                        const isSelected = !!selected.find(b => b.id === bubble.id);
                        return (
                            <motion.button
                                key={bubble.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, y: [0, -8, 0] }}
                                transition={{ y: { duration: 2 + bubble.value * 0.2, repeat: Infinity, ease: "easeInOut", delay: bubble.value * 0.1 } }}
                                onClick={() => handleBubble(bubble)}
                                disabled={!!feedback}
                                style={{ position: "absolute", left: `${bubble.x}%`, top: `${bubble.y}%` }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-4 shadow-lg transition-all ${isSelected
                                        ? feedback === "correct" ? "bg-green-400 border-green-600 text-white scale-125" : feedback === "over" ? "bg-red-400 border-red-600 text-white" : "bg-violet-400 border-violet-600 text-white scale-110"
                                        : "bg-white/80 border-violet-300 text-violet-700 hover:scale-110"
                                    }`}
                            >
                                {bubble.value}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>

                {feedback === "correct" && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">🎉</span>
                    </motion.div>
                )}
            </div>

            <div className="text-center mt-3 text-sm text-gray-400">Manche {round + 1} / {ROUNDS}</div>
        </div>
    );
}
