"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface StoryPage {
    text: string;
    focusWord: string;
    emoji: string;
}

interface StoryConfig {
    title: string;
    pages: StoryPage[];
}

export function StoryArticulation({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as StoryConfig;
    const pages = gameConfig.pages || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const current = pages[currentIndex];
    const total = pages.length;

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
        <div className="max-w-xl mx-auto">
            {/* Book Cover / Header */}
            <div className="bg-white rounded-t-[2rem] p-6 border-x-4 border-t-4 border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-orange-400" />
                    <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">
                        {gameConfig.title || "Histoire"}
                    </span>
                </div>
                <span className="text-xs font-bold text-gray-400">
                    Page {currentIndex + 1} / {total}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white border-x-4 border-orange-100 p-10 text-center shadow-inner"
                >
                    <div className="text-9xl mb-10 drop-shadow-lg">
                        {current.emoji}
                    </div>

                    <p className="text-2xl text-gray-800 leading-relaxed mb-10 font-medium">
                        {current.text.split(current.focusWord).map((part, i, arr) => (
                            <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="text-orange-500 font-black underline decoration-wavy decoration-orange-200">
                                        {current.focusWord}
                                    </span>
                                )}
                            </span>
                        ))}
                    </p>

                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold text-orange-400 uppercase">
                            Mot magique à répéter
                        </div>
                        <div className="text-5xl font-black text-orange-600">
                            {current.focusWord}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="bg-white rounded-b-[2rem] p-8 border-x-4 border-b-4 border-orange-100 shadow-xl flex justify-center">
                <Button
                    onClick={handleNext}
                    className="h-20 w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-4"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10 animate-bounce" />
                    ) : (
                        <>
                            {currentIndex === total - 1 ? "Fin de l'histoire" : "Tourner la page"}
                            <ArrowRight className="w-8 h-8" />
                        </>
                    )}
                </Button>
            </div>

            <div className="text-center mt-6 text-gray-400 text-sm italic">
                Articule bien le mot en orange à chaque page !
            </div>
        </div>
    );
}
