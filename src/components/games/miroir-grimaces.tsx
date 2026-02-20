"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Camera } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Grimace {
    name: string;
    instruction: string;
    image: string;
}

interface GrimaceConfig {
    grimaces: Grimace[];
}

const EMOJI_MAP: Record<string, string> = {
    kiss: "😗",
    smile: "😁",
    fish: "😙",
    ball: "😮",
    tongue: "😛",
};

export function MiroirGrimaces({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as GrimaceConfig;
    const grimaces = gameConfig.grimaces || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [showDone, setShowDone] = useState(false);

    const current = grimaces[currentIndex];
    const total = grimaces.length;

    function handleNext() {
        setShowDone(true);
        setTimeout(() => {
            setShowDone(false);
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Miroir des Grimaces</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {total}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-b-8 border-rose-200 relative overflow-hidden"
                >
                    {/* Simulation d'un miroir */}
                    <div className="absolute inset-4 rounded-[2rem] border-4 border-dashed border-rose-50 pointer-events-none opacity-50" />

                    <div className="relative z-10 text-center">
                        <div className="text-9xl mb-8 filter drop-shadow-lg">
                            {EMOJI_MAP[current.image] || "😃"}
                        </div>

                        <h3 className="text-3xl font-black text-rose-500 mb-2 uppercase tracking-tight">
                            {current.name}
                        </h3>

                        <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-sm mx-auto mb-10">
                            {current.instruction}
                        </p>

                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                                <Camera className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center">
                <Button
                    onClick={handleNext}
                    className="h-20 px-12 bg-rose-500 hover:bg-rose-600 text-white rounded-3xl text-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
                >
                    {showDone ? (
                        <CheckCircle className="w-10 h-10 animate-bounce" />
                    ) : (
                        <>
                            C&apos;est fait ! <ArrowRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                </Button>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 italic text-sm text-orange-700 text-center">
                &quot;Regarde-toi bien dans le miroir et essaie de faire exactement la même chose !&quot;
            </div>
        </div>
    );
}
