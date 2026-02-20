"use client";

import { useState, useMemo, useCallback } from "react";
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

interface MotTrouéItem {
    sentence: string;   // e.g. "Un ch__al galope"
    blank_pos: number;  // word index with blank
    options: string[];  // e.g. ["ev", "eu", "an", "in"]
    answer: string;     // e.g. "ev"
    full_word: string;  // e.g. "cheval"
}

interface MotTrouéConfig { items: MotTrouéItem[]; }

const DEFAULT_ITEMS: MotTrouéItem[] = [
    { sentence: "Un ch__al galope dans le pré.", blank_pos: 1, options: ["ev", "eu", "an", "in"], answer: "ev", full_word: "cheval" },
    { sentence: "Je mange un g__teau au chocolat.", blank_pos: 3, options: ["â", "a", "ea", "o"], answer: "â", full_word: "gâteau" },
    { sentence: "Le ch__en aboie fort.", blank_pos: 1, options: ["ui", "ie", "ia", "ié"], answer: "ie", full_word: "chien" },
    { sentence: "Elle porte un b__teau rouge.", blank_pos: 3, options: ["a", "au", "ea", "o"], answer: "au", full_word: "bateau" },
    { sentence: "Le s__leil brille ce matin.", blank_pos: 1, options: ["o", "ou", "au", "oi"], answer: "o", full_word: "soleil" },
    { sentence: "Mon am__ joue dans le jardin.", blank_pos: 1, options: ["i", "ie", "y", "ée"], answer: "i", full_word: "ami" },
    { sentence: "La p__ule pond des œufs.", blank_pos: 1, options: ["ou", "o", "au", "u"], answer: "ou", full_word: "poule" },
    { sentence: "Il fait du v__lo tous les jours.", blank_pos: 3, options: ["é", "e", "è", "ai"], answer: "é", full_word: "vélo" },
];

export function MotTroue({ config, difficulty, onComplete }: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as MotTrouéConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    const count = difficulty === 1 ? 4 : difficulty === 2 ? 6 : 8;
    const items = useMemo(() => [...allItems].sort(() => Math.random() - 0.5).slice(0, count), [allItems, count]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const item = items[currentIndex];

    function handleAnswer(option: string) {
        if (feedback) return;
        const correct = option === item.answer;
        setChosen(option);
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: item.sentence, expected: item.answer, got: option }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null);
            setFeedback(null);
            if (currentIndex + 1 >= items.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / items.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else {
                setCurrentIndex(i => i + 1);
            }
        }, 1000);
    }

    // Highlight sentence with blank
    const parts = item.sentence.split("__");
    const display_before = parts[0];
    const display_after = parts[1] || "";

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-6">
                {items.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < currentIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === currentIndex ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            <div className="text-center mb-3">
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">🕳️ Complète le mot troué !</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className={`bg-white rounded-3xl p-6 border-4 shadow-lg mb-6 text-center transition-colors ${feedback === "correct" ? "border-green-400" : feedback === "wrong" ? "border-red-400" : "border-violet-200"}`}>
                    <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                        {display_before}
                        <span className={`inline-block rounded-lg px-2 py-0.5 font-black min-w-[40px] mx-0.5 ${feedback === "correct" ? "bg-green-200 text-green-800" : feedback === "wrong" ? "bg-red-200 text-red-800" : "bg-violet-200 text-violet-800"
                            }`}>
                            {feedback ? (chosen === item.answer ? item.answer : `${chosen}❌`) : "___"}
                        </span>
                        {display_after}
                    </p>
                    {feedback && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-bold mt-3 ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                            {feedback === "correct" ? `✅ ${item.full_word} !` : `❌ C'était "${item.answer}" → ${item.full_word}`}
                        </motion.p>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
                {item.options.map(opt => (
                    <motion.button key={opt} whileTap={{ scale: 0.93 }} onClick={() => handleAnswer(opt)} disabled={!!feedback}
                        className={`h-16 rounded-2xl text-xl font-black border-2 transition-all ${feedback
                                ? opt === item.answer ? "bg-green-500 border-green-600 text-white" : chosen === opt ? "bg-red-500 border-red-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400"
                                : "bg-white border-gray-300 text-gray-800 hover:border-violet-400 hover:bg-violet-50"
                            }`}>
                        {opt}
                    </motion.button>
                ))}
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">{currentIndex + 1} / {items.length}</div>
        </div>
    );
}
