"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, HelpCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Riddle {
    question: string;
    answer: string;
    emoji: string;
    clue: string;
}

interface DevinettesConfig {
    items: Riddle[];
}

export function DevinettesObjets({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as DevinettesConfig;
    const items = gameConfig.items || [
        { question: "J'ai quatre pattes et je fais 'Ouaf' !", answer: "Un Chien", emoji: "🐶", clue: "C'est le meilleur ami de l'homme." },
        { question: "Je suis jaune, longue et les singes m'adorent.", answer: "Une Banane", emoji: "🍌", clue: "C'est un fruit." },
        { question: "Je transporte les gens sur les rails.", answer: "Un Train", emoji: "🚂", clue: "Ça fait 'Tchou-tchou'." },
        { question: "On m'utilise pour se protéger de la pluie.", answer: "Un Parapluie", emoji: "☔", clue: "On l'ouvre quand il pleut." },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const current = items[currentIndex];
    const total = items.length;

    function handleNext() {
        setFeedback(true);
        setTimeout(() => {
            setFeedback(false);
            setShowAnswer(false);
            if (currentIndex + 1 >= total) {
                const duration = Math.round((Date.now() - startTime) / 1000);
                onComplete({
                    score: total * 10,
                    starsEarned: 3,
                    accuracy: 100,
                    itemsCompleted: total,
                    itemsTotal: total,
                    mistakes: [],
                    durationSeconds: duration,
                });
            } else {
                setCurrentIndex(i => i + 1);
            }
        }, 600);
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-amber-400" : i === currentIndex ? "bg-amber-600" : "bg-gray-100"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="bg-white rounded-[2.5rem] p-10 shadow-xl border-4 border-amber-100 text-center relative overflow-hidden"
                >
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <HelpCircle className="w-10 h-10" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-800 mb-8 leading-tight">
                        &quot;{current.question}&quot;
                    </h2>

                    <div className="min-h-[180px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!showAnswer ? (
                                <motion.button
                                    key="reveal"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowAnswer(true)}
                                    className="group flex flex-col items-center gap-3 p-8 border-4 border-dashed border-gray-200 rounded-3xl hover:border-amber-300 hover:bg-amber-50 transition-all"
                                >
                                    <div className="text-gray-300 group-hover:text-amber-400 transition">
                                        <Eye className="w-12 h-12" />
                                    </div>
                                    <p className="font-bold text-gray-400 group-hover:text-amber-600 transition uppercase tracking-widest text-sm">Voir la réponse</p>
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="answer"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-green-50 rounded-3xl p-8 border-2 border-green-200 w-full"
                                >
                                    <div className="text-7xl mb-4">{current.emoji}</div>
                                    <div className="text-4xl font-black text-green-700 uppercase">{current.answer}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!showAnswer && (
                        <p className="mt-8 text-sm text-gray-400 italic">
                            💡 Indice : {current.clue}
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
                <Button
                    onClick={handleNext}
                    disabled={!showAnswer}
                    className="h-20 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : (
                        <>Trouvé ! <ArrowRight className="ml-3 w-8 h-8" /></>
                    )}
                </Button>
            </div>
        </div>
    );
}
