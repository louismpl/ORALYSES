"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle, RefreshCw, Volume2, Clock } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface PromptConfig {
    prompts: string[];
}

export function HistoiresLibres({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as PromptConfig;
    const prompts = gameConfig.prompts || ["Raconte-moi une histoire !"];

    const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
    const [startTime] = useState(Date.now());
    const [isRecording, setIsRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setElapsed(e => e + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    function handleComplete() {
        const finalDuration = Math.round((Date.now() - startTime) / 1000);
        onComplete({
            score: Math.min(elapsed * 2, 100),
            starsEarned: elapsed >= 45 ? 3 : elapsed >= 20 ? 2 : 1,
            accuracy: 100,
            itemsCompleted: 1,
            itemsTotal: 1,
            mistakes: [],
            durationSeconds: finalDuration,
        });
    }

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border-4 border-teal-100 text-center relative overflow-hidden">
                <div className="inline-block p-4 bg-teal-50 rounded-3xl mb-8">
                    <Volume2 className="w-10 h-10 text-teal-500" />
                </div>

                <h2 className="text-3xl font-black text-gray-800 mb-6 leading-tight">
                    {prompt}
                </h2>

                <p className="text-gray-500 mb-10 text-lg">
                    Appuie sur le bouton et raconte tout ce qui te passe par la tête !
                </p>

                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        {isRecording && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 bg-teal-400 rounded-full"
                            />
                        )}
                        <Button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`w-28 h-28 rounded-full shadow-2xl relative z-10 transition-all ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-teal-500 hover:bg-teal-600"
                                }`}
                        >
                            <Mic className={`w-12 h-12 text-white ${isRecording ? "animate-pulse" : ""}`} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-2xl font-mono font-bold text-gray-700 bg-gray-50 px-6 py-2 rounded-2xl">
                        <Clock className="w-6 h-6 text-teal-500" />
                        {formatTime(elapsed)}
                    </div>

                    <p className="text-sm font-medium text-teal-600 h-6">
                        {isRecording ? "Enregistrement en cours..." : "Prêt à t'écouter !"}
                    </p>
                </div>
            </div>

            <div className="mt-10 flex justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => { setElapsed(0); setIsRecording(false); }}
                    className="h-16 px-8 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold"
                >
                    <RefreshCw className="mr-2 w-5 h-5" /> Recommencer
                </Button>
                <Button
                    onClick={handleComplete}
                    disabled={elapsed < 5}
                    className="h-16 px-12 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl text-xl font-bold shadow-lg disabled:opacity-50"
                >
                    Terminer la session
                </Button>
            </div>

            <div className="mt-8 p-6 bg-teal-50/50 rounded-3xl border border-teal-100 flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <p className="text-sm text-teal-800 leading-relaxed">
                    <b>Conseil :</b> Essaie de parler pendant au moins 1 minute pour bien t&apos;entraîner à transférer tes progrès en parlant normalement !
                </p>
            </div>
        </div>
    );
}
