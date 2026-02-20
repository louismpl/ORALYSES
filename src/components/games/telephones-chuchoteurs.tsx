"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, CheckCircle, ArrowRight, Ear, VolumeX } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Instruction {
    text: string;
    emoji: string;
}

interface TelephoneConfig {
    instructions: Instruction[];
}

export function TelephonesChuchoteurs({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as TelephoneConfig;
    const instructions = gameConfig.instructions || [
        { text: "Chuchote ton mot secret doucement.", emoji: "🤫" },
        { text: "Essaie de dire 'Chat' sans faire de bruit.", emoji: "🐱" },
        { text: "Est-ce que tu as bien entendu le son /s/ ?", emoji: "👂" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const current = instructions[currentIndex];
    const total = instructions.length;

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
                {instructions.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-orange-400" : i === currentIndex ? "bg-orange-600" : "bg-gray-100"
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
                    className="bg-white rounded-[2.5rem] p-12 shadow-xl border-4 border-orange-100 text-center relative"
                >
                    <div className="flex justify-center mb-10">
                        <div className="relative">
                            <div className="text-9xl drop-shadow-lg">
                                {current.emoji}
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -right-4 -top-4 text-4xl"
                            >
                                <VolumeX className="text-orange-300" />
                            </motion.div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-800 mb-8 leading-tight">
                        {current.text}
                    </h2>

                    <div className="bg-orange-50 rounded-3xl p-8 flex items-center gap-6 text-left border border-orange-100">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Ear className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-orange-900 font-bold text-lg">Le savais-tu ?</p>
                            <p className="text-orange-700 text-sm">Chuchoter permet d&apos;aider tes oreilles à mieux entendre la forme de ta bouche !</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8">
                <Button
                    onClick={handleNext}
                    className="h-20 w-full bg-orange-600 hover:bg-orange-700 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all gap-4"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : (
                        <>
                            C&apos;est fait, j&apos;ai écouté ! <Phone className="w-8 h-8 rotate-12" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic">
                Comme un agent secret, parle tout doucement...
            </p>
        </div>
    );
}
