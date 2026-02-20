"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Play, User } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface ActionCard {
    verb: string;
    emoji: string;
    instruction: string;
}

interface MimesConfig {
    items: ActionCard[];
}

export function MimesActions({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as MimesConfig;
    const items = gameConfig.items || [
        { verb: "Manger", emoji: "🍎", instruction: "Fais semblant de croquer dans une pomme bien juteuse !" },
        { verb: "Dormir", emoji: "😴", instruction: "Pose ta tête sur tes mains et fais un petit dodo." },
        { verb: "Courir", emoji: "🏃", instruction: "Bouge tes bras très vite comme si tu faisais une course !" },
        { verb: "Boire", emoji: "🥤", instruction: "Prends un verre imaginaire et bois tout d'un coup !" },
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
            <div className="flex gap-1.5 mb-8">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-indigo-400" : i === currentIndex ? "bg-indigo-600" : "bg-gray-100"
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
                    className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-indigo-100 text-center relative overflow-hidden"
                >
                    <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <User className="text-indigo-400 w-6 h-6" />
                    </div>

                    <div className="text-[10rem] mb-10 drop-shadow-xl inline-block leading-none">
                        {current.emoji}
                    </div>

                    <h2 className="text-5xl font-black text-gray-800 mb-6 uppercase tracking-tight">
                        {current.verb}
                    </h2>

                    <div className="bg-indigo-50/50 rounded-2xl p-6 mb-8 border border-indigo-100">
                        <p className="text-indigo-800 text-lg font-medium">
                            {current.instruction}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Play className="w-3 h-3 fill-current" /> En mouvement
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
                <Button
                    onClick={handleNext}
                    className="h-20 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : (
                        <>
                            J&apos;ai mimé ! <ArrowRight className="ml-3 w-8 h-8" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic font-medium">
                Réalise l&apos;action comme si c&apos;était vrai !
            </p>
        </div>
    );
}
