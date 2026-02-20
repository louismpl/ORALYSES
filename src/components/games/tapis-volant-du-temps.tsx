"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface TapisItem { sentence: string; answer: "past" | "present" | "future"; verb_hint: string; }
interface TapisConfig { items: TapisItem[]; }

const DEFAULT_ITEMS: TapisItem[] = [
    { sentence: "Je mangerai une pomme.", answer: "future", verb_hint: "mangerai" },
    { sentence: "Elle joue dans le jardin.", answer: "present", verb_hint: "joue" },
    { sentence: "Il a couru très vite.", answer: "past", verb_hint: "a couru" },
    { sentence: "Nous partirons demain matin.", answer: "future", verb_hint: "partirons" },
    { sentence: "Les enfants dorment.", answer: "present", verb_hint: "dorment" },
    { sentence: "Tu as mangé toute la tarte.", answer: "past", verb_hint: "as mangé" },
    { sentence: "Je serai médecin plus tard.", answer: "future", verb_hint: "serai" },
    { sentence: "Papa prépare le dîner.", answer: "present", verb_hint: "prépare" },
    { sentence: "Nous sommes allés à la plage.", answer: "past", verb_hint: "sommes allés" },
];

const CLOUDS = {
    past: { label: "Hier (Passé) ☁️", emoji: "☁️", color: "bg-orange-100 border-orange-400 text-orange-800", icon: "🕰️" },
    present: { label: "Aujourd'hui (Présent) ⛅", emoji: "⛅", color: "bg-blue-100 border-blue-400 text-blue-800", icon: "📅" },
    future: { label: "Demain (Futur) 🌤️", emoji: "🌤️", color: "bg-violet-100 border-violet-400 text-violet-800", icon: "🔮" },
};

export function TapisVolantDuTemps({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as TapisConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    const count = difficulty === 1 ? 4 : difficulty === 2 ? 6 : 9;
    const items = useMemo(() => [...allItems].sort(() => Math.random() - 0.5).slice(0, count), [allItems, count]);

    const [idx, setIdx] = useState(0);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const item = items[idx];

    function handlePick(tense: "past" | "present" | "future") {
        if (feedback) return;
        const correct = tense === item.answer;
        setChosen(tense);
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: item.sentence, expected: CLOUDS[item.answer].label, got: CLOUDS[tense].label }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null); setFeedback(null);
            if (idx + 1 >= items.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / items.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else setIdx(i => i + 1);
        }, 1000);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-6">
                {items.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === idx ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            <div className="text-center mb-3">
                <span className="bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">🌤️ Sur quel nuage pose cette phrase ?</span>
            </div>

            {/* Sentence card */}
            <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                    className={`bg-white rounded-3xl p-6 border-4 shadow-lg mb-6 text-center transition-colors ${feedback === "correct" ? "border-green-400" : feedback === "wrong" ? "border-red-400" : "border-blue-200"}`}>
                    <div className="text-lg font-semibold text-gray-800 mb-3">&ldquo;{item.sentence}&rdquo;</div>
                    <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-sm">
                        <span className="text-gray-500">Verbe clé :</span>
                        <span className="font-bold text-violet-700 underline decoration-dotted">{item.verb_hint}</span>
                    </div>
                    {feedback && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className={`text-sm font-bold mt-3 ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                            {feedback === "correct" ? "✅ Bravo !" : `❌ C'était : ${CLOUDS[item.answer].label}`}
                        </motion.p>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Cloud buttons */}
            <div className="grid grid-cols-3 gap-3">
                {(["past", "present", "future"] as const).map(tense => {
                    const cloud = CLOUDS[tense];
                    const isChosen = chosen === tense;
                    const isAnswer = tense === item.answer;
                    return (
                        <motion.button key={tense} whileTap={{ scale: 0.9 }} onClick={() => handlePick(tense)} disabled={!!feedback}
                            className={`p-3 rounded-2xl border-2 font-semibold flex flex-col items-center gap-1 transition-all text-xs ${feedback
                                    ? isAnswer ? "bg-green-500 border-green-600 text-white scale-105" : isChosen ? "bg-red-400 border-red-500 text-white" : "bg-gray-100 border-gray-200 text-gray-400 opacity-60"
                                    : `${cloud.color} hover:scale-105`
                                }`}>
                            <span className="text-2xl">{cloud.emoji}</span>
                            <span className="leading-tight text-center">{Cloud_shortLabel(tense)}</span>
                        </motion.button>
                    );
                })}
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">{idx + 1} / {items.length}</div>
        </div>
    );
}

function Cloud_shortLabel(tense: "past" | "present" | "future") {
    return tense === "past" ? "Hier\n(Passé)" : tense === "present" ? "Aujourd'hui\n(Présent)" : "Demain\n(Futur)";
}
