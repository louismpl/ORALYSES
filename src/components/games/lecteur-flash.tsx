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

interface FlashWord { target: string; distractors: string[]; }
interface FlashConfig { display_ms?: number; rounds: FlashWord[]; }

const DEFAULT_ROUNDS: FlashWord[] = [
    { target: "maison", distractors: ["raison", "saison", "mainson"] },
    { target: "cheval", distractors: ["chéval", "chevals", "chévral"] },
    { target: "bateau", distractors: ["gateau", "bateaux", "bateau"] },
    { target: "soleil", distractors: ["oreille", "soreil", "soleils"] },
    { target: "papillon", distractors: ["papilion", "parpillon", "papilon"] },
    { target: "chocolat", distractors: ["chocalat", "chocolas", "chocholat"] },
    { target: "garçon", distractors: ["garson", "garscon", "garçan"] },
    { target: "chapeau", distractors: ["chepeau", "chapaux", "chapeaus"] },
];

export function LecteurFlash({ config, difficulty, onComplete }: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as FlashConfig;
    const rounds = useMemo(() =>
        [...(gameConfig?.rounds?.length ? gameConfig.rounds : DEFAULT_ROUNDS)].sort(() => Math.random() - 0.5).slice(0, 6),
        [gameConfig]
    );
    const displayMs = gameConfig?.display_ms ?? (difficulty === 1 ? 800 : difficulty === 2 ? 500 : 250);

    const [roundIndex, setRoundIndex] = useState(0);
    const [phase, setPhase] = useState<"showing" | "choosing" | "feedback">("showing");
    const [chosen, setChosen] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const round = rounds[roundIndex];
    const choices = useMemo(() =>
        [round.target, ...round.distractors.slice(0, 3)].sort(() => Math.random() - 0.5),
        [round]
    );

    useEffect(() => {
        setPhase("showing");
        const t = setTimeout(() => setPhase("choosing"), displayMs);
        return () => clearTimeout(t);
    }, [roundIndex, displayMs]);

    function handleChoose(word: string) {
        if (phase !== "choosing") return;
        const correct = word === round.target;
        setChosen(word);
        setPhase("feedback");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: round.target, expected: round.target, got: word }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null);
            if (roundIndex + 1 >= rounds.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / rounds.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: rounds.length, itemsTotal: rounds.length, mistakes, durationSeconds: 0 });
            } else {
                setRoundIndex(r => r + 1);
            }
        }, 1200);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-4">
                {rounds.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < roundIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === roundIndex ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            <div className="text-center mb-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${phase === "showing" ? "bg-yellow-100 text-yellow-700" : "bg-violet-100 text-violet-700"}`}>
                    {phase === "showing" ? `⚡ Lis vite ! (${displayMs}ms)` : "Quel mot as-tu vu ?"}
                </div>
            </div>

            <div className="bg-gray-900 rounded-3xl h-40 flex items-center justify-center mb-6">
                <AnimatePresence mode="wait">
                    {phase === "showing" ? (
                        <motion.div key="word" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }} className="text-5xl font-black text-yellow-300 tracking-wider">
                            {round.target}
                        </motion.div>
                    ) : (
                        <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl">🤔</motion.div>
                    )}
                </AnimatePresence>
            </div>

            {(phase === "choosing" || phase === "feedback") && (
                <div className="grid grid-cols-2 gap-3">
                    {choices.map(word => {
                        const isChosen = chosen === word;
                        const isTarget = word === round.target;
                        return (
                            <motion.button key={word} whileTap={{ scale: 0.95 }} onClick={() => handleChoose(word)} disabled={phase !== "choosing"}
                                className={`h-16 rounded-2xl font-bold text-lg border-2 transition-all ${phase === "feedback" ? isTarget ? "bg-green-500 border-green-600 text-white" : isChosen ? "bg-red-500 border-red-600 text-white" : "bg-gray-100 border-gray-200 text-gray-500"
                                        : "bg-white border-gray-300 text-gray-800 hover:border-violet-400 hover:bg-violet-50"
                                    }`}>
                                {word}
                            </motion.button>
                        );
                    })}
                </div>
            )}
            <div className="text-center mt-4 text-sm text-gray-400">{roundIndex + 1} / {rounds.length}</div>
        </div>
    );
}
