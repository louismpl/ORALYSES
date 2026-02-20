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

interface MemoryPair { word: string; emoji: string; antonym: string; antonym_emoji: string; }
interface ContrairesConfig { pairs: MemoryPair[]; }

const DEFAULT_PAIRS: MemoryPair[] = [
    { word: "Chaud", emoji: "🔥", antonym: "Froid", antonym_emoji: "🧊" },
    { word: "Grand", emoji: "🏔️", antonym: "Petit", antonym_emoji: "🐜" },
    { word: "Rapide", emoji: "🐆", antonym: "Lent", antonym_emoji: "🐌" },
    { word: "Jour", emoji: "☀️", antonym: "Nuit", antonym_emoji: "🌙" },
    { word: "Heureux", emoji: "😊", antonym: "Triste", antonym_emoji: "😢" },
    { word: "Plein", emoji: "🫙", antonym: "Vide", antonym_emoji: "🪣" },
    { word: "Propre", emoji: "✨", antonym: "Sale", antonym_emoji: "🤮" },
    { word: "Fort", emoji: "💪", antonym: "Faible", antonym_emoji: "🪶" },
];

export function MemoryContraires({ config, difficulty, onComplete }: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as ContrairesConfig;
    const allPairs = gameConfig?.pairs?.length ? gameConfig.pairs : DEFAULT_PAIRS;
    const pairCount = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 6;
    const pairs = useMemo(() => [...allPairs].sort(() => Math.random() - 0.5).slice(0, pairCount), [allPairs, pairCount]);

    // Build cards: each pair = 2 cards (word card + antonym card)
    const cards = useMemo(() => {
        const c: { id: string; text: string; emoji: string; pairId: string; isAntonym: boolean }[] = [];
        pairs.forEach((p, i) => {
            c.push({ id: `${i}-a`, text: p.word, emoji: p.emoji, pairId: String(i), isAntonym: false });
            c.push({ id: `${i}-b`, text: p.antonym, emoji: p.antonym_emoji, pairId: String(i), isAntonym: true });
        });
        return c.sort(() => Math.random() - 0.5);
    }, [pairs]);

    const [flipped, setFlipped] = useState<string[]>([]);
    const [matched, setMatched] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);

    function handleFlip(cardId: string) {
        if (matched.includes(cardId) || flipped.includes(cardId) || feedback) return;
        const newFlipped = [...flipped, cardId];
        setFlipped(newFlipped);

        if (!selected) {
            setSelected(cardId);
            return;
        }

        const firstCard = cards.find(c => c.id === selected)!;
        const secondCard = cards.find(c => c.id === cardId)!;
        const isMatch = firstCard.pairId === secondCard.pairId && firstCard.isAntonym !== secondCard.isAntonym;

        setFeedback(isMatch ? "correct" : "wrong");
        if (isMatch) {
            setScore(s => s + 1);
            setMatched(m => [...m, selected, cardId]);
            setTimeout(() => {
                setFeedback(null);
                setSelected(null);
                setFlipped(f => f.filter(id => id !== selected && id !== cardId));
                if (matched.length + 2 >= cards.length) {
                    const fs = score + 1;
                    const acc = Math.round(fs / pairs.length * 100);
                    onComplete({ score: fs, starsEarned: acc >= 90 ? 3 : acc >= 70 ? 2 : 1, accuracy: acc, itemsCompleted: pairs.length, itemsTotal: pairs.length, mistakes, durationSeconds: 0 });
                }
            }, 800);
        } else {
            setMistakes(m => [...m, { item: firstCard.text, expected: `Contraire: ${secondCard.text}`, got: "Mauvaise paire" }]);
            setTimeout(() => {
                setFeedback(null);
                setSelected(null);
                setFlipped(f => f.filter(id => id !== selected && id !== cardId));
            }, 900);
        }
    }

    const totalMatched = matched.length / 2;

    return (
        <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-bold text-violet-600">Paires trouvées : {totalMatched}/{pairs.length}</div>
                {feedback && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-sm font-bold px-3 py-1 rounded-full ${feedback === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {feedback === "correct" ? "✅ Contraires !" : "❌ Pas contraires"}
                    </motion.div>
                )}
            </div>

            <p className="text-sm text-center text-gray-500 mb-4">Associe chaque mot à son contraire !</p>

            <div className={`grid gap-3 ${cards.length <= 8 ? "grid-cols-4" : "grid-cols-4"}`}>
                {cards.map(card => {
                    const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                    const isMatched = matched.includes(card.id);
                    const isSelected = selected === card.id;
                    return (
                        <motion.button
                            key={card.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleFlip(card.id)}
                            disabled={isMatched || !!feedback}
                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all border-2 ${isMatched ? "bg-green-100 border-green-400 text-green-700" :
                                    isFlipped ? isSelected ? "bg-violet-100 border-violet-500 text-violet-700" : feedback === "wrong" ? "bg-red-100 border-red-400" : "bg-blue-50 border-blue-300" :
                                        "bg-gray-800 border-gray-700 text-gray-800 hover:bg-gray-700"
                                }`}
                        >
                            {isFlipped ? (
                                <>
                                    <span className="text-2xl">{card.emoji}</span>
                                    <span className="mt-1 leading-tight text-center px-1">{card.text}</span>
                                </>
                            ) : (
                                <span className="text-2xl">❓</span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
