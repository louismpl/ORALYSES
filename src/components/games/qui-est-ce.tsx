"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Character { id: string; emoji: string; traits: Record<string, boolean>; }
interface QCEItem { clue: string; answer_id: string; characters: Character[]; }
interface QCEConfig { rounds: QCEItem[]; }

const DEFAULT_ROUNDS: QCEItem[] = [
    {
        clue: "Trouve celui qui a un chapeau MAIS PAS de lunettes.",
        answer_id: "c",
        characters: [
            { id: "a", emoji: "🧑‍🦱", traits: { chapeau: false, lunettes: false } },
            { id: "b", emoji: "🧑‍🦳", traits: { chapeau: false, lunettes: true } },
            { id: "c", emoji: "🎩", traits: { chapeau: true, lunettes: false } },
            { id: "d", emoji: "🥸", traits: { chapeau: true, lunettes: true } },
        ],
    },
    {
        clue: "Trouve celui qui est TRISTE et a les cheveux ROUGES.",
        answer_id: "b",
        characters: [
            { id: "a", emoji: "😊", traits: { triste: false, cheveux_rouges: true } },
            { id: "b", emoji: "😢", traits: { triste: true, cheveux_rouges: true } },
            { id: "c", emoji: "😢", traits: { triste: true, cheveux_rouges: false } },
            { id: "d", emoji: "😊", traits: { triste: false, cheveux_rouges: false } },
        ],
    },
    {
        clue: "Trouve l'animal qui est GRAND mais PAS DANGEREUX.",
        answer_id: "c",
        characters: [
            { id: "a", emoji: "🐍", traits: { grand: false, dangereux: true } },
            { id: "b", emoji: "🦁", traits: { grand: true, dangereux: true } },
            { id: "c", emoji: "🐘", traits: { grand: true, dangereux: false } },
            { id: "d", emoji: "🐜", traits: { grand: false, dangereux: false } },
        ],
    },
    {
        clue: "Trouve ce qui se mange et se boit.",
        answer_id: "d",
        characters: [
            { id: "a", emoji: "📚", traits: { mange: false, boit: false } },
            { id: "b", emoji: "🍔", traits: { mange: true, boit: false } },
            { id: "c", emoji: "💧", traits: { mange: false, boit: true } },
            { id: "d", emoji: "🍵", traits: { mange: true, boit: true } },
        ],
    },
    {
        clue: "Trouve celui qui vole mais n'est pas un oiseau.",
        answer_id: "b",
        characters: [
            { id: "a", emoji: "🐦", traits: { vole: true, oiseau: true } },
            { id: "b", emoji: "🛩️", traits: { vole: true, oiseau: false } },
            { id: "c", emoji: "🐟", traits: { vole: false, oiseau: false } },
            { id: "d", emoji: "🦅", traits: { vole: true, oiseau: true } },
        ],
    },
];

export function QuiEstCe({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as QCEConfig;
    const allRounds = gameConfig?.rounds?.length ? gameConfig.rounds : DEFAULT_ROUNDS;
    const count = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
    const rounds = useMemo(() => [...allRounds].sort(() => Math.random() - 0.5).slice(0, count), [allRounds, count]);

    const [idx, setIdx] = useState(0);
    const [chosen, setChosen] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const round = rounds[idx];

    function handlePick(id: string) {
        if (feedback) return;
        const correct = id === round.answer_id;
        setChosen(id);
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: round.clue, expected: round.answer_id, got: id }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setChosen(null); setFeedback(null);
            if (idx + 1 >= rounds.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / rounds.length * 100);
                onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0, accuracy: acc, itemsCompleted: rounds.length, itemsTotal: rounds.length, mistakes, durationSeconds: 0 });
            } else setIdx(i => i + 1);
        }, 1100);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-6">
                {rounds.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === idx ? "bg-violet-400" : "bg-gray-200"}`} />)}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 text-center">
                        <div className="text-2xl mb-1">🔍</div>
                        <p className="font-semibold text-blue-900 text-base">{round.clue}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {round.characters.map(char => {
                            const isChosen = chosen === char.id;
                            const isAnswer = char.id === round.answer_id;
                            return (
                                <motion.button
                                    key={char.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handlePick(char.id)}
                                    disabled={!!feedback}
                                    className={`h-28 rounded-2xl flex items-center justify-center text-6xl border-4 transition-all ${feedback
                                            ? isAnswer ? "border-green-500 bg-green-50 scale-110" : isChosen ? "border-red-400 bg-red-50 opacity-80" : "border-gray-200 bg-gray-50 opacity-40"
                                            : "border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50 hover:scale-105"
                                        }`}
                                >
                                    {char.emoji}
                                    {feedback && isAnswer && (
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 text-2xl">✅</motion.span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="text-center mt-4 text-sm text-gray-400">{idx + 1} / {rounds.length}</div>
        </div>
    );
}
