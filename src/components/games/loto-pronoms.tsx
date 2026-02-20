"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface LotoItem {
    image: string;
    action: string;
    correct: "Il" | "Elle" | "Ils" | "Elles";
}

interface LotoConfig {
    items: LotoItem[];
}

export function LotoPronoms({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as LotoConfig;
    const items = gameConfig.items || [
        { image: "👧", action: "mange une pomme", correct: "Elle" },
        { image: "👦", action: "joue au ballon", correct: "Il" },
        { image: "👧👦", action: "lisent un livre", correct: "Ils" },
        { image: "👧👧", action: "chantent ensemble", correct: "Elles" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<any[]>([]);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    const current = items[currentIndex];
    const total = items.length;

    function handleSelect(choice: string) {
        if (feedback) return;

        const isCorrect = choice === current.correct;
        setFeedback(isCorrect ? "correct" : "wrong");

        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            setMistakes(m => [...m, { item: current.action, expected: current.correct, got: choice }]);
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex + 1 >= total) {
                const finalScore = isCorrect ? score + 1 : score;
                const accuracy = Math.round((finalScore / total) * 100);
                onComplete({
                    score: finalScore * 10,
                    starsEarned: accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1,
                    accuracy,
                    itemsCompleted: total,
                    itemsTotal: total,
                    mistakes: isCorrect ? mistakes : [...mistakes, { item: current.action, expected: current.correct, got: choice }],
                    durationSeconds: Math.round((Date.now() - startTime) / 1000),
                });
            } else {
                setCurrentIndex(i => i + 1);
            }
        }, 800);
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
                {items.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-purple-400" : i === currentIndex ? "bg-purple-600" : "bg-gray-100"}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-white rounded-[2.5rem] p-10 shadow-xl border-4 transition-colors text-center ${feedback === "correct" ? "border-green-400 bg-green-50" :
                            feedback === "wrong" ? "border-red-400 bg-red-50" : "border-purple-100"
                        }`}
                >
                    <div className="text-8xl mb-8 drop-shadow-md">
                        {current.image}
                    </div>

                    <h2 className="text-3xl font-black text-gray-800 mb-8">
                        <span className="text-purple-600 underline decoration-wavy decoration-purple-200">_______</span> {current.action}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {["Il", "Elle", "Ils", "Elles"].map(p => (
                            <Button
                                key={p}
                                onClick={() => handleSelect(p)}
                                variant="outline"
                                className={`h-20 text-2xl font-black rounded-2xl border-2 hover:bg-purple-50 transition-all ${feedback === "correct" && current.correct === p ? "bg-green-100 border-green-500 scale-105" :
                                        feedback === "wrong" && p !== current.correct ? "opacity-50" : ""
                                    }`}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>

                    <div className="mt-10 h-10 flex items-center justify-center">
                        <AnimatePresence>
                            {feedback === "correct" && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-600 font-bold">
                                    <CheckCircle className="w-6 h-6" /> Super !
                                </motion.div>
                            )}
                            {feedback === "wrong" && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-red-600 font-bold">
                                    <XCircle className="w-6 h-6" /> Oh non !
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>

            <p className="text-center mt-6 text-gray-400 text-sm italic font-medium">
                Choisis le bon mot pour parler de la personne.
            </p>
        </div>
    );
}
