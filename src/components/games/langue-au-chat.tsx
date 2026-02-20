"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Question {
    text: string;
    emoji: string;
}

interface LangueChatConfig {
    items: Question[];
}

export function LangueAuChat({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as LangueChatConfig;
    const items = gameConfig.items || [
        { text: "Préfères-tu les chats ou les chiens ? Pourquoi ?", emoji: "🐱🐶" },
        { text: "Quel est ton plus grand rêve ?", emoji: "✨" },
        { text: "Qu'est-ce qui te fait le plus rire ?", emoji: "😂" },
        { text: "Si tu pouvais être un animal, lequel serais-tu ?", emoji: "🦓" },
    ];

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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="bg-white rounded-[2.5rem] p-12 shadow-xl border-4 border-amber-100 text-center relative"
                >
                    <div className="flex justify-center mb-10">
                        <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                            <MessageCircle className="w-12 h-12" />
                        </div>
                    </div>

                    <div className="text-8xl mb-6">
                        {current.emoji}
                    </div>

                    <h2 className="text-3xl font-black text-gray-800 leading-tight">
                        &quot;{current.text}&quot;
                    </h2>
                </motion.div>
            </AnimatePresence>

            <div className="mt-10">
                <Button
                    onClick={handleNext}
                    className="h-20 w-full bg-amber-500 hover:bg-amber-600 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-4"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : (
                        <>
                            J&apos;ai répondu ! <ArrowRight className="w-8 h-8" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic font-medium">
                Donne une réponse bien complète en faisant de belles phrases !
            </p>
        </div>
    );
}
