"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, ArrowRight } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface ImageItem {
    word: string;
    emoji: string;
}

interface ImagierConfig {
    items: ImageItem[];
}

export function Imagier({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as ImagierConfig;
    const items = gameConfig.items || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const current = items[currentIndex];
    const total = items.length;

    function handleNext() {
        setFeedback(true);
        setTimeout(() => {
            setFeedback(false);
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

    if (!current) return null;

    return (
        <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="flex gap-1 mb-8">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-blue-400" : i === currentIndex ? "bg-blue-600" : "bg-gray-100"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="bg-white rounded-[2.5rem] p-10 shadow-xl border-4 border-blue-100 text-center"
                >
                    <div className="text-9xl mb-8 drop-shadow-sm">
                        {current.emoji}
                    </div>

                    <h2 className="text-4xl font-black text-gray-800 mb-2">
                        {current.word}
                    </h2>

                    <div className="flex justify-center mt-6">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 px-6"
                        >
                            <Volume2 className="w-5 h-5 mr-2" /> Écouter
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-center">
                <Button
                    onClick={handleNext}
                    className="h-20 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10 animate-bounce" />
                    ) : (
                        <>
                            C&apos;est dit ! <ArrowRight className="ml-3 w-8 h-8" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic">
                Regarde l&apos;image et dis le mot bien fort !
            </p>
        </div>
    );
}
