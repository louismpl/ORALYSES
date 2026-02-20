"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Camera, Smile } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface Exercise {
    name: string;
    instruction: string;
    emoji: string;
}

interface AmuzBouchConfig {
    exercises: Exercise[];
}

export function AmuzBouch({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as AmuzBouchConfig;
    const exercises = gameConfig.exercises || [
        { name: "La langue à gauche", instruction: "Touche ton coin de bouche gauche avec ta langue.", emoji: "😛" },
        { name: "La langue à droite", instruction: "Touche ton coin de bouche droit avec ta langue.", emoji: "😜" },
        { name: "Le gros bisou", instruction: "Fais un bruit de bisou très fort !", emoji: "💋" },
        { name: "Gonfle les joues", instruction: "Gonfle tes deux joues comme un ballon.", emoji: "🎈" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const current = exercises[currentIndex];
    const total = exercises.length;

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
                {exercises.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${i < currentIndex ? "bg-rose-400" : i === currentIndex ? "bg-rose-600" : "bg-gray-100"
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
                    className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-rose-100 text-center relative overflow-hidden"
                >
                    <div className="absolute top-4 left-6 text-rose-500 font-black text-4xl opacity-20 italic">
                        #{currentIndex + 1}
                    </div>

                    <div className="text-9xl mb-10 drop-shadow-xl animate-bounce">
                        {current.emoji}
                    </div>

                    <h2 className="text-4xl font-black text-gray-800 mb-4">
                        {current.name}
                    </h2>

                    <div className="bg-rose-50 rounded-2xl p-6 mb-8 border-2 border-dashed border-rose-200">
                        <p className="text-rose-700 text-xl font-medium leading-relaxed">
                            {current.instruction}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-16 rounded-2xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 gap-3"
                        >
                            <Camera className="w-6 h-6" /> Miroir
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 h-16 rounded-2xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 gap-3"
                        >
                            <Smile className="w-6 h-6" /> Exemple
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8">
                <Button
                    onClick={handleNext}
                    className="h-20 w-full bg-rose-600 hover:bg-rose-700 text-white rounded-3xl text-2xl font-black shadow-lg hover:shadow-xl transition-all"
                >
                    {feedback ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : (
                        <>
                            C&apos;est fait ! <ArrowRight className="ml-3 w-8 h-8" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic font-medium">
                Fais-le bien fort devant le miroir !
            </p>
        </div>
    );
}
