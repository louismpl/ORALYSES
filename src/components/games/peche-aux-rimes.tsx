"use client";

import { useState, useMemo } from "react";
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

interface RoundData {
    bait: string;
    bait_emoji: string;
    fish: { word: string; emoji: string; rhymes: boolean }[];
}

interface PecheConfig {
    rounds: RoundData[];
}

const DEFAULT_ROUNDS: RoundData[] = [
    {
        bait: "Bateau", bait_emoji: "⛵",
        fish: [
            { word: "Cadeau", emoji: "🎁", rhymes: true },
            { word: "Chapeau", emoji: "🎩", rhymes: true },
            { word: "Lapin", emoji: "🐰", rhymes: false },
            { word: "Gâteau", emoji: "🎂", rhymes: true },
            { word: "Maison", emoji: "🏠", rhymes: false },
        ],
    },
    {
        bait: "Soleil", bait_emoji: "☀️",
        fish: [
            { word: "Oreille", emoji: "👂", rhymes: true },
            { word: "Abeille", emoji: "🐝", rhymes: true },
            { word: "Fleur", emoji: "🌸", rhymes: false },
            { word: "Bouteille", emoji: "🍾", rhymes: true },
            { word: "Chaton", emoji: "🐱", rhymes: false },
        ],
    },
    {
        bait: "Souris", bait_emoji: "🐭",
        fish: [
            { word: "Tapis", emoji: "🪞", rhymes: true },
            { word: "Paris", emoji: "🗼", rhymes: true },
            { word: "Cheval", emoji: "🐴", rhymes: false },
            { word: "Pays", emoji: "🌍", rhymes: true },
            { word: "Ballon", emoji: "🎈", rhymes: false },
        ],
    },
    {
        bait: "Lune", bait_emoji: "🌙",
        fish: [
            { word: "Dune", emoji: "🏜️", rhymes: true },
            { word: "Une", emoji: "1️⃣", rhymes: true },
            { word: "Étoile", emoji: "⭐", rhymes: false },
            { word: "Brune", emoji: "🟤", rhymes: true },
            { word: "Lion", emoji: "🦁", rhymes: false },
        ],
    },
];

export function PecheAuxRimes({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as PecheConfig;
    const rounds = useMemo(
        () => [...(gameConfig?.rounds?.length ? gameConfig.rounds : DEFAULT_ROUNDS)].sort(() => Math.random() - 0.5).slice(0, difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4),
        [gameConfig, difficulty]
    );

    const [roundIndex, setRoundIndex] = useState(0);
    const [caught, setCaught] = useState<Set<number>>(new Set());
    const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const round = rounds[roundIndex];
    const rhymeCount = round.fish.filter((f) => f.rhymes).length;
    const caughtRhymes = [...caught].filter((i) => round.fish[i].rhymes).length;

    function handleClickFish(index: number) {
        if (caught.has(index) || feedback) return;
        const fish = round.fish[index];
        const correct = fish.rhymes;
        setFeedback({ index, correct });
        setCaught((s) => new Set([...s, index]));

        if (correct) {
            setScore((s) => s + 1);
        } else {
            setMistakes((m) => [...m, { item: fish.word, expected: `Rime avec ${round.bait}`, got: `Ne rime pas` }]);
        }
        setAnswers((a) => [...a, correct]);

        setTimeout(() => {
            setFeedback(null);
            const newCaught = new Set([...caught, index]);
            const newCaughtRhymes = [...newCaught].filter((i) => round.fish[i].rhymes).length;
            if (newCaughtRhymes >= rhymeCount) {
                // Move to next round
                setTimeout(() => {
                    if (roundIndex + 1 >= rounds.length) {
                        const totalItems = rounds.reduce((acc, r) => acc + r.fish.filter(f => f.rhymes).length, 0);
                        const accuracy = Math.round((score + (correct ? 1 : 0)) / Math.max(totalItems, 1) * 100);
                        const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
                        onComplete({ score: score + (correct ? 1 : 0), starsEarned: stars, accuracy, itemsCompleted: totalItems, itemsTotal: totalItems, mistakes, durationSeconds: 0 });
                    } else {
                        setRoundIndex((r) => r + 1);
                        setCaught(new Set());
                    }
                }, 600);
            }
        }, 700);
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Progress rounds */}
            <div className="flex gap-1 mb-4">
                {rounds.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < roundIndex ? "bg-green-400" : i === roundIndex ? "bg-violet-400" : "bg-gray-200"}`} />
                ))}
            </div>

            {/* Bait */}
            <div className="text-center mb-4">
                <div className="inline-flex items-center gap-3 bg-blue-50 border-2 border-blue-200 rounded-2xl px-6 py-3">
                    <span className="text-4xl">{round.bait_emoji}</span>
                    <div>
                        <p className="text-xs text-blue-500 font-medium">L&apos;appât</p>
                        <p className="text-2xl font-bold text-blue-800">{round.bait}</p>
                    </div>
                    <span className="text-3xl">🎣</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Attrape les poissons qui riment avec <strong>{round.bait}</strong> !
                    <span className="ml-2 text-violet-600 font-bold">{caughtRhymes}/{rhymeCount} rime(s)</span>
                </p>
            </div>

            {/* Pond with fish */}
            <div className="bg-gradient-to-b from-blue-300 to-blue-500 rounded-3xl p-4 relative overflow-hidden min-h-[260px]">
                {/* Water ripple */}
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)" }} />
                </div>

                <div className="relative grid grid-cols-3 gap-3 place-items-center">
                    {round.fish.map((fish, i) => {
                        const isCaught = caught.has(i);
                        const isFeedback = feedback?.index === i;
                        return (
                            <AnimatePresence key={`${roundIndex}-${i}`}>
                                <motion.button
                                    animate={!isCaught ? { y: [0, -6, 0] } : {}}
                                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                                    onClick={() => handleClickFish(i)}
                                    disabled={isCaught || !!feedback}
                                    className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all w-full ${isCaught
                                            ? fish.rhymes ? "bg-green-100 border-green-400 opacity-70" : "bg-red-100 border-red-400 opacity-50"
                                            : "bg-white/80 border-white hover:border-violet-400 hover:scale-105 active:scale-95"
                                        }`}
                                >
                                    <span className="text-3xl">{fish.emoji}</span>
                                    <span className="text-xs font-bold text-gray-800">{fish.word}</span>
                                    {isFeedback && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${isFeedback && feedback!.correct ? "bg-green-500" : "bg-red-500"}`}>
                                            {feedback!.correct ? "✓" : "✗"}
                                        </motion.div>
                                    )}
                                    {isCaught && !isFeedback && (
                                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${fish.rhymes ? "bg-green-500" : "bg-red-500"}`}>
                                            {fish.rhymes ? "✓" : "✗"}
                                        </div>
                                    )}
                                </motion.button>
                            </AnimatePresence>
                        );
                    })}
                </div>
            </div>

            <div className="text-center mt-3 text-sm text-gray-400">Manche {roundIndex + 1} / {rounds.length}</div>
        </div>
    );
}
