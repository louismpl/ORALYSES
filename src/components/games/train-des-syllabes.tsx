"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, RefreshCw } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface WordItem {
    word: string;
    emoji: string;
    syllables: number;
    syllable_display: string; // e.g. "É-LÉ-PHANT"
}

interface TrainConfig {
    words: WordItem[];
}

const DEFAULT_WORDS: WordItem[] = [
    { word: "Chat", emoji: "🐱", syllables: 1, syllable_display: "CHAT" },
    { word: "Lapin", emoji: "🐰", syllables: 2, syllable_display: "LA-PIN" },
    { word: "Éléphant", emoji: "🐘", syllables: 3, syllable_display: "É-LÉ-PHANT" },
    { word: "Papillon", emoji: "🦋", syllables: 3, syllable_display: "PA-PIL-LON" },
    { word: "Soleil", emoji: "☀️", syllables: 2, syllable_display: "SO-LEIL" },
    { word: "Crocodile", emoji: "🐊", syllables: 4, syllable_display: "CRO-CO-DI-LE" },
    { word: "Fleur", emoji: "🌸", syllables: 1, syllable_display: "FLEUR" },
    { word: "Banane", emoji: "🍌", syllables: 3, syllable_display: "BA-NA-NE" },
    { word: "Lion", emoji: "🦁", syllables: 2, syllable_display: "LI-ON" },
    { word: "Téléphone", emoji: "📱", syllables: 4, syllable_display: "TÉ-LÉ-PHO-NE" },
];

export function TrainDesSyllabes({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as TrainConfig;
    const allWords = gameConfig?.words?.length ? gameConfig.words : DEFAULT_WORDS;

    // Difficulty: 1 = 1-2 syl, 2 = 1-3 syl, 3 = 1-4 syl
    const maxSyl = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
    const words = useMemo(
        () =>
            [...allWords.filter((w) => w.syllables <= maxSyl)]
                .sort(() => Math.random() - 0.5)
                .slice(0, 8),
        [allWords, maxSyl]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [wagons, setWagons] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);

    const currentWord = words[currentIndex];

    function handleTap() {
        if (feedback) return;
        setWagons((w) => Math.min(w + 1, 6));
    }

    function handleValidate() {
        if (feedback || wagons === 0) return;
        const correct = wagons === currentWord.syllables;
        setFeedback(correct ? "correct" : "wrong");
        if (correct) {
            setScore((s) => s + 1);
        } else {
            setMistakes((m) => [
                ...m,
                {
                    item: currentWord.word,
                    expected: `${currentWord.syllables} syllabe(s) (${currentWord.syllable_display})`,
                    got: `${wagons} wagon(s)`,
                },
            ]);
        }
        setAnswers((a) => [...a, correct]);
        setTimeout(() => {
            setFeedback(null);
            setWagons(0);
            if (currentIndex + 1 >= words.length) {
                const finalScore = score + (correct ? 1 : 0);
                const accuracy = Math.round((finalScore / words.length) * 100);
                const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
                onComplete({
                    score: finalScore, starsEarned: stars, accuracy,
                    itemsCompleted: words.length, itemsTotal: words.length,
                    mistakes: correct ? mistakes : [...mistakes, { item: currentWord.word, expected: `${currentWord.syllables} syllabe(s)`, got: `${wagons}` }],
                    durationSeconds: 0,
                });
            } else {
                setCurrentIndex((i) => i + 1);
            }
        }, 1000);
    }

    return (
        <div className="max-w-md mx-auto select-none">
            {/* Progress */}
            <div className="flex gap-1 mb-6">
                {words.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < currentIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === currentIndex ? "bg-violet-400" : "bg-gray-200"}`} />
                ))}
            </div>

            {/* Word card */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }}>
                    <div className={`bg-white rounded-3xl p-6 text-center shadow-lg border-4 transition-colors mb-4 ${feedback === "correct" ? "border-green-400 bg-green-50" : feedback === "wrong" ? "border-red-400 bg-red-50" : "border-violet-200"}`}>
                        <div className="text-7xl mb-3">{currentWord.emoji}</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{currentWord.word}</div>
                        {feedback && (
                            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-bold mt-2 ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                                {feedback === "correct" ? `✅ ${currentWord.syllable_display}` : `❌ C'était : ${currentWord.syllable_display}`}
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Train */}
            <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                <p className="text-xs text-gray-500 text-center mb-3 font-medium">Combien de syllabes ? Tape pour ajouter un wagon !</p>
                <div className="flex items-center gap-1 min-h-[56px] justify-center flex-wrap">
                    {/* Locomotive */}
                    <div className="text-3xl">🚂</div>
                    {/* Wagons */}
                    <AnimatePresence>
                        {Array.from({ length: wagons }).map((_, i) => (
                            <motion.div key={i} initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="text-2xl">
                                🟪
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="text-center mt-2">
                    <span className="text-sm font-bold text-violet-700">{wagons} wagon{wagons !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => setWagons(0)} variant="outline" disabled={!!feedback || wagons === 0} className="h-14 rounded-2xl">
                    <RefreshCw className="w-4 h-4" />
                </Button>
                <Button onClick={handleTap} disabled={!!feedback || wagons >= 6}
                    className="h-14 text-xl rounded-2xl bg-violet-500 hover:bg-violet-600 text-white col-span-1">
                    + Wagon
                </Button>
                <Button onClick={handleValidate} disabled={!!feedback || wagons === 0}
                    className="h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="w-5 h-5" />
                </Button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-400">{currentIndex + 1} / {words.length}</div>
        </div>
    );
}
