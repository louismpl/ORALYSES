"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, RefreshCw, Mic, MicOff } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface VirelangueItem {
    text: string;
    target_son: string;
}

interface VirelangueConfig {
    items: VirelangueItem[];
}

export function Virelangues({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as VirelangueConfig;
    const items = gameConfig.items || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState<"success" | null>(null);

    const currentItem = items[currentIndex];
    const total = items.length;

    function handleNext() {
        setFeedback("success");
        setTimeout(() => {
            setFeedback(null);
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
            <div className="flex gap-1 mb-8">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-rose-400" : "bg-gray-200"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl p-8 shadow-xl border-4 border-rose-100 text-center"
                >
                    <div className="inline-block p-3 bg-rose-50 rounded-2xl mb-6">
                        <Volume2 className="w-8 h-8 text-rose-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                        &quot;{currentItem.text}&quot;
                    </h2>

                    <div className="flex justify-center gap-2 mb-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-50 px-3 py-1 rounded-full">
                            Sons cibles : {currentItem.target_son}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => setIsListening(!isListening)}
                            className={`w-20 h-20 rounded-full transition-all ${isListening ? "bg-rose-500 animate-pulse" : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8" />}
                        </Button>
                        <p className="text-sm text-gray-500">
                            {isListening ? "Écoute en cours..." : "Clique sur le micro pour t'entraîner"}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center">
                <Button
                    onClick={handleNext}
                    disabled={feedback !== null}
                    className="bg-gradient-to-r from-rose-500 to-orange-400 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:scale-105 transition-transform"
                >
                    {currentIndex === total - 1 ? "Terminer !" : "Suivant"}
                </Button>
            </div>

            <div className="text-center mt-6 text-gray-400 text-sm">
                Répète la phrase clairement 3 fois le plus vite possible !
            </div>
        </div>
    );
}
