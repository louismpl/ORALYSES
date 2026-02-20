"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface ConjugItem { pronoun: string; infinitive: string; tense: string; choices: string[]; answer: string; }
interface ConjugConfig { items: ConjugItem[]; }

const DEFAULT_ITEMS: ConjugItem[] = [
    { pronoun: "NOUS", infinitive: "CHANTER", tense: "présent", choices: ["chantons", "chantez", "chantent", "chantes"], answer: "chantons" },
    { pronoun: "IL", infinitive: "MANGER", tense: "présent", choices: ["mangeons", "mange", "mangent", "manges"], answer: "mange" },
    { pronoun: "VOUS", infinitive: "PARTIR", tense: "présent", choices: ["partez", "pars", "partent", "partons"], answer: "partez" },
    { pronoun: "ILS", infinitive: "JOUER", tense: "présent", choices: ["jouent", "joue", "jouons", "jouez"], answer: "jouent" },
    { pronoun: "TU", infinitive: "FINIR", tense: "présent", choices: ["finis", "finit", "finissons", "finissez"], answer: "finis" },
    { pronoun: "JE", infinitive: "AVOIR", tense: "présent", choices: ["ai", "as", "avons", "ont"], answer: "ai" },
    { pronoun: "ELLE", infinitive: "ÊTRE", tense: "présent", choices: ["est", "es", "sont", "sommes"], answer: "est" },
    { pronoun: "NOUS", infinitive: "ALLER", tense: "présent", choices: ["allons", "allez", "vont", "vas"], answer: "allons" },
    { pronoun: "ILS", infinitive: "FAIRE", tense: "présent", choices: ["font", "fais", "fait", "faisons"], answer: "font" },
    { pronoun: "TU", infinitive: "VOULOIR", tense: "présent", choices: ["veux", "veut", "voulons", "voulez"], answer: "veux" },
];

const TIME_PER_ITEM = 8; // seconds

export function ConjugueurFou({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as ConjugConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    const count = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 10;
    const timeLimit = difficulty === 1 ? 10 : difficulty === 2 ? 6 : 4;
    const items = useMemo(() => [...allItems].sort(() => Math.random() - 0.5).slice(0, count), [allItems, count]);

    const [idx, setIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | "timeout" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const item = items[idx];

    function nextItem(correct: boolean, chosenAnswer: string) {
        const fs = score + (correct ? 1 : 0);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null); setFeedback(null); setTimeLeft(timeLimit);
            if (idx + 1 >= items.length) {
                const acc = Math.round(fs / items.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else setIdx(i => i + 1);
        }, 800);
    }

    useEffect(() => {
        if (feedback) return;
        setTimeLeft(timeLimit);
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    setFeedback("timeout");
                    setMistakes(m => [...m, { item: `${item.pronoun} ${item.infinitive}`, expected: item.answer, got: "(temps écoulé)" }]);
                    nextItem(false, "");
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [idx, feedback]);

    function handlePick(choice: string) {
        if (feedback) return;
        clearInterval(timerRef.current!);
        const correct = choice === item.answer;
        setChosen(choice);
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: `${item.pronoun} ${item.infinitive}`, expected: item.answer, got: choice }]);
        nextItem(correct, choice);
    }

    const timerPct = (timeLeft / timeLimit) * 100;

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-4">
                {items.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === idx ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            {/* Timer bar */}
            <div className="h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div
                    animate={{ width: `${timerPct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${timerPct > 60 ? "bg-green-400" : timerPct > 30 ? "bg-yellow-400" : "bg-red-400"}`}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}>
                    {/* Pronoun + Infinitive */}
                    <div className="bg-gray-900 rounded-3xl p-6 text-center mb-6">
                        <div className="flex items-center justify-center gap-4">
                            <div className="bg-violet-600 rounded-2xl px-4 py-3">
                                <p className="text-xs text-violet-300 font-medium">Pronom</p>
                                <p className="text-3xl font-black text-white">{item.pronoun}</p>
                            </div>
                            <span className="text-white text-3xl font-black">+</span>
                            <div className="bg-orange-500 rounded-2xl px-4 py-3">
                                <p className="text-xs text-orange-200 font-medium">{item.tense}</p>
                                <p className="text-3xl font-black text-white">{item.infinitive}</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-3">⏱️ {timeLeft}s</p>
                    </div>

                    {/* Choices */}
                    <div className="grid grid-cols-2 gap-3">
                        {item.choices.map(choice => {
                            const isChosen = chosen === choice;
                            const isAnswer = choice === item.answer;
                            return (
                                <motion.button key={choice} whileTap={{ scale: 0.93 }} onClick={() => handlePick(choice)} disabled={!!feedback}
                                    className={`h-16 rounded-2xl font-bold text-lg border-2 transition-all ${feedback
                                            ? isAnswer ? "bg-green-500 border-green-600 text-white" : isChosen ? "bg-red-500 border-red-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400"
                                            : "bg-white border-gray-300 text-gray-800 hover:border-violet-400 hover:bg-violet-50"
                                        }`}>
                                    {choice}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="text-center mt-4 text-sm text-gray-400">{idx + 1} / {items.length}</div>
        </div>
    );
}
