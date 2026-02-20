"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface SentenceItem {
    words: string[];
    hint?: string;
}

interface ArchitecteConfig {
    sentences: SentenceItem[];
}

const DEFAULT_SENTENCES: SentenceItem[] = [
    { words: ["Le", "chat", "mange", "la", "souris"], hint: "Qui mange quoi ?" },
    { words: ["La", "fille", "court", "vite"], hint: "Que fait la fille ?" },
    { words: ["Mon", "chien", "est", "très", "gentil"], hint: "Comment est le chien ?" },
    { words: ["Elle", "lit", "un", "beau", "livre"], hint: "Que fait-elle ?" },
    { words: ["Le", "petit", "lapin", "saute", "haut"], hint: "Que fait le lapin ?" },
    { words: ["Papa", "prépare", "un", "gâteau", "délicieux"], hint: "Que fait Papa ?" },
];

const BRICK_COLORS = [
    "bg-violet-400", "bg-orange-400", "bg-blue-400", "bg-green-400",
    "bg-pink-400", "bg-yellow-400", "bg-indigo-400", "bg-red-400",
];

export function ArchitecteDesPhrases({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as ArchitecteConfig;
    const allSentences = gameConfig?.sentences?.length ? gameConfig.sentences : DEFAULT_SENTENCES;
    const sentences = useMemo(
        () => [...allSentences].sort(() => Math.random() - 0.5).slice(0, difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5),
        [allSentences, difficulty]
    );

    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [placed, setPlaced] = useState<string[]>([]);
    const [available, setAvailable] = useState<string[]>(() =>
        [...sentences[0].words].sort(() => Math.random() - 0.5)
    );
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [shake, setShake] = useState(false);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const sentence = sentences[sentenceIndex];

    function handlePickWord(word: string, idx: number) {
        if (feedback) return;
        setPlaced((p) => [...p, word]);
        setAvailable((a) => a.filter((_, i) => i !== idx));
    }

    function handleRemoveWord(idx: number) {
        if (feedback) return;
        const word = placed[idx];
        setAvailable((a) => [...a, word]);
        setPlaced((p) => p.filter((_, i) => i !== idx));
    }

    function handleReset() {
        setPlaced([]);
        setAvailable([...sentence.words].sort(() => Math.random() - 0.5));
    }

    function handleValidate() {
        if (placed.length !== sentence.words.length || feedback) return;
        const correct = placed.join(" ") === sentence.words.join(" ");
        setFeedback(correct ? "correct" : "wrong");
        if (!correct) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setMistakes((m) => [...m, { item: placed.join(" "), expected: sentence.words.join(" "), got: placed.join(" ") }]);
        } else {
            setScore((s) => s + 1);
        }
        setAnswers((a) => [...a, correct]);
        setTimeout(() => {
            setFeedback(null);
            if (sentenceIndex + 1 >= sentences.length) {
                const finalScore = score + (correct ? 1 : 0);
                const acc = Math.round((finalScore / sentences.length) * 100);
                const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
                onComplete({ score: finalScore, starsEarned: stars, accuracy: acc, itemsCompleted: sentences.length, itemsTotal: sentences.length, mistakes, durationSeconds: 0 });
            } else {
                const next = sentences[sentenceIndex + 1];
                setSentenceIndex((i) => i + 1);
                setPlaced([]);
                setAvailable([...next.words].sort(() => Math.random() - 0.5));
            }
        }, correct ? 1200 : 800);
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="flex gap-1 mb-6">
                {sentences.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < sentenceIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === sentenceIndex ? "bg-violet-400" : "bg-gray-200"}`} />
                ))}
            </div>

            <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                    🧱 {sentence.hint || "Construis la phrase correcte !"}
                </div>
            </div>

            {/* Wall — placed words */}
            <motion.div
                animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`min-h-[80px] rounded-2xl border-2 border-dashed p-3 mb-4 flex flex-wrap gap-2 items-center justify-center transition-colors ${feedback === "correct" ? "border-green-400 bg-green-50" : feedback === "wrong" ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"
                    }`}
            >
                {placed.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">Clique sur les briques pour construire la phrase...</span>
                ) : (
                    <AnimatePresence>
                        {placed.map((word, i) => (
                            <motion.button
                                key={`${i}-${word}`}
                                initial={{ scale: 0, y: -20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0 }}
                                onClick={() => handleRemoveWord(i)}
                                disabled={!!feedback}
                                className={`px-3 py-2 rounded-xl text-white font-bold text-sm shadow ${BRICK_COLORS[i % BRICK_COLORS.length]} hover:opacity-80 active:scale-95 transition-all`}
                            >
                                {word}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                )}
                {feedback === "correct" && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                )}
            </motion.div>

            {/* Available bricks */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-4">
                <p className="text-xs text-gray-400 mb-2 text-center font-medium">🧱 Briques disponibles</p>
                <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
                    <AnimatePresence>
                        {available.map((word, i) => (
                            <motion.button
                                key={`avail-${i}-${word}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                onClick={() => handlePickWord(word, i)}
                                disabled={!!feedback}
                                className="px-3 py-2 rounded-xl bg-gray-700 text-white font-bold text-sm shadow hover:bg-gray-800 active:scale-95 transition-all"
                            >
                                {word}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={handleReset} variant="outline" disabled={!!feedback || placed.length === 0} className="rounded-xl h-12">
                    <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                    onClick={handleValidate}
                    disabled={!!feedback || placed.length !== sentence.words.length}
                    className="col-span-3 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white font-bold"
                >
                    Valider la phrase !
                </Button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-400">{sentenceIndex + 1} / {sentences.length}</div>
        </div>
    );
}
