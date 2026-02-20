"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface NatureItem { word: string; nature: "nom" | "verbe" | "adjectif"; emoji?: string; }
interface NatureConfig { items: NatureItem[]; }

const DEFAULT_ITEMS: NatureItem[] = [
    { word: "Maison", nature: "nom", emoji: "🏠" },
    { word: "Courir", nature: "verbe", emoji: "🏃" },
    { word: "Petit", nature: "adjectif", emoji: "🐜" },
    { word: "Chien", nature: "nom", emoji: "🐶" },
    { word: "Manger", nature: "verbe", emoji: "🍴" },
    { word: "Grand", nature: "adjectif", emoji: "🏔️" },
    { word: "Fleur", nature: "nom", emoji: "🌸" },
    { word: "Dormir", nature: "verbe", emoji: "😴" },
    { word: "Rouge", nature: "adjectif", emoji: "🔴" },
    { word: "Soleil", nature: "nom", emoji: "☀️" },
    { word: "Jouer", nature: "verbe", emoji: "🎮" },
    { word: "Joyeux", nature: "adjectif", emoji: "😊" },
    { word: "Livre", nature: "nom", emoji: "📚" },
    { word: "Chanter", nature: "verbe", emoji: "🎵" },
    { word: "Belle", nature: "adjectif", emoji: "✨" },
];

const WAGON_CONFIG = {
    nom: { color: "bg-blue-500", light: "bg-blue-100", border: "border-blue-500", text: "text-blue-700", label: "Nom", emoji: "📦" },
    verbe: { color: "bg-red-500", light: "bg-red-100", border: "border-red-500", text: "text-red-700", label: "Verbe", emoji: "⚡" },
    adjectif: { color: "bg-green-500", light: "bg-green-100", border: "border-green-500", text: "text-green-700", label: "Adjectif", emoji: "🎨" },
};

export function TrainDesNatures({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as NatureConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    // difficulty 1 = nom+verbe, 2 = tous, 3 = tous + vitesse
    const activeNatures = difficulty === 1
        ? ["nom", "verbe"] as const
        : ["nom", "verbe", "adjectif"] as const;

    const count = difficulty === 1 ? 8 : difficulty === 2 ? 12 : 15;
    const items = useMemo(
        () => [...allItems.filter(i => (activeNatures as readonly string[]).includes(i.nature))].sort(() => Math.random() - 0.5).slice(0, count),
        [allItems, count, difficulty]
    );

    const [idx, setIdx] = useState(0);
    const [feedback, setFeedback] = useState<{ nature: string; correct: boolean } | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const item = items[idx];

    function handlePick(nature: string) {
        if (feedback) return;
        const correct = nature === item.nature;
        setFeedback({ nature, correct });
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: item.word, expected: WAGON_CONFIG[item.nature as keyof typeof WAGON_CONFIG].label, got: WAGON_CONFIG[nature as keyof typeof WAGON_CONFIG]?.label ?? nature }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setFeedback(null);
            if (idx + 1 >= items.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / items.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else setIdx(i => i + 1);
        }, 900);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-4">
                {items.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === idx ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            {/* Train illustration */}
            <div className="bg-gray-100 rounded-2xl p-3 mb-4 flex items-center gap-2 overflow-x-auto">
                <span className="text-3xl flex-shrink-0">🚂</span>
                {activeNatures.map(n => {
                    const wc = WAGON_CONFIG[n];
                    return (
                        <div key={n} className={`flex-shrink-0 px-3 py-2 rounded-xl border-2 ${wc.light} ${wc.border} flex items-center gap-1`}>
                            <span className="text-lg">{wc.emoji}</span>
                            <span className={`text-xs font-bold ${wc.text}`}>{wc.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mb-4">
                <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium">Dans quel wagon va ce mot ?</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }}
                    className={`bg-white rounded-3xl p-8 border-4 shadow-lg text-center mb-6 transition-colors ${feedback ? feedback.correct ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50" : "border-gray-200"
                        }`}>
                    {item.emoji && <div className="text-5xl mb-2">{item.emoji}</div>}
                    <div className="text-4xl font-black text-gray-900">{item.word}</div>
                    {feedback && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className={`text-sm font-bold mt-3 ${feedback.correct ? "text-green-600" : "text-red-600"}`}>
                            {feedback.correct ? `✅ C'est un ${WAGON_CONFIG[item.nature as keyof typeof WAGON_CONFIG].label.toLowerCase()} !`
                                : `❌ C'est un ${WAGON_CONFIG[item.nature as keyof typeof WAGON_CONFIG].label.toLowerCase()}`}
                        </motion.p>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className={`grid gap-3 ${activeNatures.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {activeNatures.map(n => {
                    const wc = WAGON_CONFIG[n];
                    const isChosen = feedback?.nature === n;
                    const isAnswer = n === item.nature;
                    return (
                        <motion.button key={n} whileTap={{ scale: 0.92 }} onClick={() => handlePick(n)} disabled={!!feedback}
                            className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${feedback
                                ? isAnswer ? `${wc.color} border-transparent text-white scale-110` : isChosen ? "bg-red-500 border-red-600 text-white" : `${wc.light} ${wc.border} ${wc.text} opacity-40`
                                : `${wc.light} ${wc.border} ${wc.text} hover:scale-105`
                                }`}>
                            <span className="text-2xl">{wc.emoji}</span>
                            <span className="text-sm">{wc.label}</span>
                        </motion.button>
                    );
                })}
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">{idx + 1} / {items.length}</div>
        </div>
    );
}
