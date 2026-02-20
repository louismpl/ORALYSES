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

interface Animal {
    name: string;
    sound: string;
    text: string;
}

interface AnimalConfig {
    animals: Animal[];
}

export function SonsAnimaux({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as AnimalConfig;
    const animals = gameConfig.animals || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [showFeedback, setShowFeedback] = useState(false);

    const current = animals[currentIndex];
    const total = animals.length;

    function handleNext() {
        setShowFeedback(true);
        setTimeout(() => {
            setShowFeedback(false);
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
                {animals.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-amber-400" : "bg-gray-200"
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-amber-100 text-center"
                >
                    <div className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-widest">
                        {current.name}
                    </div>

                    <div className="text-8xl mb-6">
                        {current.name === "Le Lion" && "🦁"}
                        {current.name === "Le Chat" && "🐱"}
                        {current.name === "La Vache" && "🐮"}
                        {current.name === "Le Cochon" && "🐷"}
                        {current.name === "Le Serpent" && "🐍"}
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 mb-8">
                        <p className="text-gray-500 text-sm mb-2">Comment fait-il ?</p>
                        <div className="text-4xl font-black text-amber-600">
                            &quot;{current.text}&quot;
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-16 rounded-xl border-2 border-amber-200 text-amber-600 hover:bg-amber-50 gap-3"
                    >
                        <Volume2 className="w-6 h-6" /> Écouter le cri
                    </Button>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center">
                <Button
                    onClick={handleNext}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-6 rounded-2xl text-xl font-bold gap-3 shadow-lg"
                >
                    {showFeedback ? (
                        <CheckCircle className="w-8 h-8" />
                    ) : (
                        <>
                            Je l&apos;ai fait ! <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </Button>
            </div>

            <div className="text-center mt-6 text-gray-400 text-sm">
                Imite le cri de l&apos;animal le plus fort possible !
            </div>
        </div>
    );
}
