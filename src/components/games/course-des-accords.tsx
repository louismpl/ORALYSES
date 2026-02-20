"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface AccordItem {
    context: string;   // "Les chats..."
    options: string[]; // ["dorment", "dort"]
    answer: string;    // "dorment"
    rule: string;      // hint
}

interface AccordConfig { items: AccordItem[]; }

const DEFAULT_ITEMS: AccordItem[] = [
    { context: "Les chats...", options: ["dorment", "dort"], answer: "dorment", rule: "Les chats = pluriel → -ent" },
    { context: "Elle...", options: ["mange", "mangent"], answer: "mange", rule: "Elle = singulier → -e" },
    { context: "Nous...", options: ["chantons", "chante"], answer: "chantons", rule: "Nous → -ons" },
    { context: "Des fleurs...", options: ["pousse", "poussent"], answer: "poussent", rule: "Des fleurs = pluriel → -ent" },
    { context: "Tu...", options: ["cours", "courent"], answer: "cours", rule: "Tu → -s" },
    { context: "Ils...", options: ["jouent", "joue"], answer: "jouent", rule: "Ils = pluriel → -ent" },
    { context: "La petite fille...", options: ["rit", "rient"], answer: "rit", rule: "La fille = singulier → -t" },
    { context: "Les oiseaux...", options: ["vole", "volent"], answer: "volent", rule: "Les oiseaux = pluriel → -ent" },
    { context: "Vous...", options: ["partez", "part"], answer: "partez", rule: "Vous → -ez" },
    { context: "Mon chat et mon chien...", options: ["jouent", "joue"], answer: "jouent", rule: "Deux sujets = pluriel → -ent" },
];

export function CourseDesAccords({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as AccordConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    const count = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 10;
    const items = useMemo(() => [...allItems].sort(() => Math.random() - 0.5).slice(0, count), [allItems, count]);

    const [idx, setIdx] = useState(0);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const item = items[idx];

    function handlePick(option: string) {
        if (feedback) return;
        const correct = option === item.answer;
        setChosen(option);
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: item.context, expected: item.answer, got: option }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null); setFeedback(null);
            if (idx + 1 >= items.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / items.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else setIdx(i => i + 1);
        }, 1100);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-6">
                {items.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === idx ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            {/* Road */}
            <div className="relative bg-gradient-to-b from-green-200 to-green-300 rounded-3xl overflow-hidden mb-6 h-40">
                {/* Road strip */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-600">
                    <div className="flex gap-4 items-center h-full px-6">
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="flex-1 h-2 bg-yellow-400 rounded" />)}
                    </div>
                </div>
                {/* Runner emoji */}
                <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl"
                >🏃</motion.div>
                {/* Context */}
                <div className="absolute top-4 left-0 right-0 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <span className="bg-white/90 rounded-xl px-4 py-2 font-bold text-gray-800 text-lg">{item.context}</span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Two doors */}
            <div className="grid grid-cols-2 gap-4">
                {item.options.map(opt => {
                    const isChosen = chosen === opt;
                    const isAnswer = opt === item.answer;
                    return (
                        <motion.button
                            key={opt}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handlePick(opt)}
                            disabled={!!feedback}
                            className={`relative h-24 rounded-2xl font-bold text-xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${feedback
                                    ? isAnswer ? "bg-green-500 border-green-600 text-white" : isChosen ? "bg-red-500 border-red-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400"
                                    : "bg-white border-gray-300 hover:border-violet-400 hover:bg-violet-50 text-gray-800"
                                }`}
                        >
                            <span className="text-3xl">{isAnswer ? "🚪" : "🧱"}</span>
                            <span>{opt}</span>
                        </motion.button>
                    );
                })}
            </div>

            {feedback && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`text-center text-sm font-bold mt-3 ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                    {feedback === "correct" ? `✅ Bien joué !` : `❌ ${item.rule}`}
                </motion.p>
            )}
            <div className="text-center mt-4 text-sm text-gray-400">{idx + 1} / {items.length}</div>
        </div>
    );
}
