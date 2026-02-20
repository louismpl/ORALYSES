"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap, Volume2 } from "lucide-react";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface BullesConfig {
    words: string[];
}

export function BullesMots({
    config,
    onComplete,
}: {
    config: Record<string, unknown>;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as BullesConfig;
    const words = gameConfig.words || ["Bulle", "Ballon", "Bateau", "Banane", "Bougie", "Biberon", "Bouche", "Baguette"];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [intensity, setIntensity] = useState(0);
    const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number }[]>([]);
    const [startTime] = useState(Date.now());
    const [feedback, setFeedback] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const bubbleIdRef = useRef(0);

    const total = words.length;

    useEffect(() => {
        if (isRecording) {
            startListening();
        } else {
            stopListening();
        }
        return () => stopListening();
    }, [isRecording]);

    async function startListening() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const update = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const avg = sum / bufferLength;
                const norm = Math.min(avg / 40, 1);
                setIntensity(norm);

                if (norm > 0.3 && Math.random() > 0.7) {
                    spawnBubble(norm);
                }

                animationFrameRef.current = requestAnimationFrame(update);
            };
            update();
        } catch (err) {
            console.error(err);
            setIsRecording(false);
        }
    }

    function stopListening() {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        setIntensity(0);
    }

    function spawnBubble(int: number) {
        const id = bubbleIdRef.current++;
        const x = Math.random() * 80 + 10;
        const size = 20 + int * 60;
        setBubbles(prev => [...prev, { id, x, size }]);
        setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.id !== id));
        }, 4000);
    }

    function handleNext() {
        setFeedback(true);
        stopListening();
        setIsRecording(false);
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
        }, 800);
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border-4 border-teal-100 text-center relative overflow-hidden h-[500px] flex flex-col items-center justify-between">

                {/* Sky / Bubbles area */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 to-white overflow-hidden pointer-events-none">
                    <AnimatePresence>
                        {bubbles.map(b => (
                            <motion.div
                                key={b.id}
                                initial={{ y: 500, opacity: 0, x: `${b.x}%` }}
                                animate={{ y: -100, opacity: 0.6 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 4, ease: "linear" }}
                                className="absolute rounded-full bg-teal-200 border-2 border-white shadow-inner"
                                style={{ width: b.size, height: b.size }}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-teal-500 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                            Mot {currentIndex + 1} / {total}
                        </span>
                        <div className="flex gap-1">
                            {[...Array(total)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i < currentIndex ? "bg-teal-500" : i === currentIndex ? "bg-amber-400" : "bg-gray-200"}`} />
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-2 uppercase tracking-tighter font-bold">Dis bien fort :</p>
                    <h2 className="text-6xl font-black text-gray-800 mb-8 drop-shadow-sm">
                        {words[currentIndex]}
                    </h2>
                </div>

                {/* Mic Control */}
                <div className="relative z-10 w-full space-y-6">
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`w-24 h-24 rounded-full shadow-xl transition-all ${isRecording ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-teal-500 hover:bg-teal-600"
                                }`}
                        >
                            <div className="relative">
                                <Volume2 className={`w-10 h-10 text-white ${isRecording ? "animate-pulse" : ""}`} />
                                {isRecording && (
                                    <motion.div
                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="absolute inset-0 bg-white rounded-full"
                                    />
                                )}
                            </div>
                        </Button>
                        {!isRecording && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Simulate voice
                                    const interval = setInterval(() => {
                                        setIntensity(0.8);
                                        spawnBubble(0.8);
                                        setTimeout(() => setIntensity(0), 100);
                                    }, 200);
                                    setTimeout(() => clearInterval(interval), 1000);
                                }}
                                className="h-24 w-24 rounded-full border-teal-200 text-teal-600 font-bold"
                            >
                                Simuler
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                            <motion.div
                                animate={{ width: `${intensity * 100}%` }}
                                className="h-full bg-gradient-to-r from-teal-400 to-amber-300"
                            />
                        </div>
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Puissance du souffle</p>
                    </div>
                </div>

                <div className="relative z-10 mt-6 w-full">
                    <Button
                        onClick={handleNext}
                        disabled={!isRecording && intensity === 0 && currentIndex === 0 && bubbles.length === 0}
                        className="w-full h-16 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-2xl text-xl font-black shadow-lg transition-all gap-3"
                    >
                        {feedback ? (
                            <CheckCircle className="w-8 h-8" />
                        ) : (
                            <>Bravo, mot suivant ! <Zap className="w-6 h-6 fill-current" /></>
                        )}
                    </Button>
                </div>
            </div>

            <p className="text-center mt-6 text-gray-400 text-sm italic font-medium">
                Fais monter les bulles avec ta voix !
            </p>
        </div>
    );
}
