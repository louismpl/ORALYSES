"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface GameResult {
    score: number; starsEarned: number; accuracy: number;
    itemsCompleted: number; itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface SerpentConfig { sensitivity?: number; target_duration?: number; }

// Obstacle type
interface Obstacle { id: number; x: number; gap_y: number; }

export function SerpentSiffleur({ config, difficulty, onComplete }: {
    config: Record<string, unknown>; difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as SerpentConfig;
    const sensitivity = gameConfig?.sensitivity ?? (difficulty === 1 ? 0.015 : difficulty === 2 ? 0.02 : 0.03);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [snakeY, setSnakeY] = useState(50); // 0-100
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [score, setScore] = useState(0);
    const [isDead, setIsDead] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const obstacleIdRef = useRef(0);
    const snakeYRef = useRef(50);
    const isDeadRef = useRef(false);
    const scoreRef = useRef(0);
    const streamRef = useRef<MediaStream | null>(null);

    const GAP_SIZE = 35; // % of screen height for the gap
    const OBSTACLE_SPEED = difficulty === 1 ? 0.4 : difficulty === 2 ? 0.6 : 0.8;
    const GAME_DURATION = 30; // seconds

    async function requestMic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const ctx = new AudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioCtxRef.current = ctx;
            analyserRef.current = analyser;
            setHasPermission(true);
        } catch {
            setHasPermission(false);
        }
    }

    function startGame() {
        setCountdown(3);
        setScore(0); scoreRef.current = 0;
        setSnakeY(50); snakeYRef.current = 50;
        setObstacles([]);
        setIsDead(false); isDeadRef.current = false;
        setIsPlaying(false);

        let c = 3;
        const timer = setInterval(() => {
            c--;
            setCountdown(c);
            if (c <= 0) {
                clearInterval(timer);
                setIsPlaying(true);
                runGameLoop();
            }
        }, 1000);
    }

    const runGameLoop = useCallback(() => {
        let frame = 0;
        let lastObstacleFrame = 0;
        const OBSTACLE_INTERVAL = 80;
        const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);

        const tick = () => {
            if (isDeadRef.current) return;
            frame++;

            // Read microphone volume
            analyserRef.current!.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
            const isSound = avg > sensitivity;

            // Move snake
            snakeYRef.current = Math.max(5, Math.min(95, snakeYRef.current + (isSound ? -2.5 : 2.5)));
            setSnakeY(snakeYRef.current);

            // Spawn obstacles
            if (frame - lastObstacleFrame > OBSTACLE_INTERVAL) {
                lastObstacleFrame = frame;
                const gap_y = 15 + Math.random() * 50;
                setObstacles(obs => {
                    const newObs = [...obs.map(o => ({ ...o, x: o.x - OBSTACLE_SPEED })).filter(o => o.x > -10),
                    { id: obstacleIdRef.current++, x: 100, gap_y }];
                    // Check collisions
                    for (const obs of newObs) {
                        if (obs.x > 8 && obs.x < 18) {
                            const inGap = snakeYRef.current > obs.gap_y && snakeYRef.current < obs.gap_y + GAP_SIZE;
                            if (!inGap) {
                                isDeadRef.current = true;
                                setIsDead(true);
                                const fs = scoreRef.current;
                                const acc = Math.min(100, Math.round(fs / 5 * 100));
                                setTimeout(() => {
                                    onComplete({ score: fs, starsEarned: fs >= 15 ? 3 : fs >= 8 ? 2 : fs >= 3 ? 1 : 0, accuracy: acc, itemsCompleted: fs, itemsTotal: 20, mistakes: [], durationSeconds: 0 });
                                }, 1500);
                                return newObs;
                            }
                        }
                    }
                    return newObs;
                });
                scoreRef.current++;
                setScore(scoreRef.current);
            }

            if (!isDeadRef.current) animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
    }, [sensitivity, OBSTACLE_SPEED, GAP_SIZE, onComplete]);

    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            audioCtxRef.current?.close();
        };
    }, []);

    // Permission screen
    if (hasPermission === null) {
        return (
            <div className="max-w-md mx-auto text-center py-8">
                <div className="text-6xl mb-4">🐍</div>
                <h2 className="text-xl font-bold mb-2">Serpent Siffleur</h2>
                <p className="text-gray-500 mb-6">Fais &quot;SSSS&quot; dans le micro pour faire monter le serpent. Evite les rochers !</p>
                <Button onClick={requestMic} className="bg-gradient-to-r from-violet-500 to-orange-400 text-white px-6 py-3 rounded-xl">
                    <Mic className="w-4 h-4 mr-2" /> Activer le micro
                </Button>
            </div>
        );
    }

    if (hasPermission === false) {
        return (
            <div className="max-w-md mx-auto text-center py-8">
                <MicOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600">Accès micro refusé. Autorise le micro dans les paramètres.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            {/* Game screen */}
            <div className="relative bg-gradient-to-b from-green-800 to-green-600 rounded-3xl overflow-hidden h-72 mb-4 border-4 border-green-900">
                {/* Score */}
                <div className="absolute top-3 left-3 bg-black/40 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                    🔥 {score}
                </div>

                {/* Obstacles */}
                {obstacles.map(obs => (
                    <div key={obs.id} style={{ position: "absolute", left: `${obs.x}%`, top: 0, bottom: 0, width: "60px" }}>
                        {/* Top rock */}
                        <div style={{ position: "absolute", top: 0, height: `${obs.gap_y}%`, width: "100%", background: "linear-gradient(to bottom, #6b4226, #8B5E3C)", borderRadius: "0 0 12px 12px" }}>
                            <div className="text-2xl text-center">🪨</div>
                        </div>
                        {/* Bottom rock */}
                        <div style={{ position: "absolute", bottom: 0, height: `${100 - obs.gap_y - GAP_SIZE}%`, width: "100%", background: "linear-gradient(to top, #6b4226, #8B5E3C)", borderRadius: "12px 12px 0 0" }}>
                            <div className="text-2xl text-center">🪨</div>
                        </div>
                    </div>
                ))}

                {/* Snake */}
                <motion.div
                    style={{ position: "absolute", left: "12%", top: `${snakeY}%`, transform: "translateY(-50%)" }}
                    animate={isDead ? { rotate: [0, 20, -20, 0], scale: [1, 1.3, 0] } : {}}
                >
                    <div className="text-4xl select-none">🐍</div>
                </motion.div>

                {/* Countdown overlay */}
                {!isPlaying && !isDead && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                            {countdown > 0 ? (
                                <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-7xl font-black">{countdown}</motion.div>
                            ) : (
                                <div className="text-5xl font-black">GO ! 🎤</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Dead overlay */}
                {isDead && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-5xl mb-2">💥</div>
                            <div className="font-bold text-xl">Score : {score}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Instruction */}
            <div className="bg-green-50 rounded-2xl p-3 mb-4 text-center border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                    🎤 Fais &quot;SSSS&quot; pour monter • Silence pour descendre • Évite les rochers !
                </p>
            </div>

            <div className="flex gap-2">
                {!isPlaying && (
                    <Button onClick={startGame} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-bold">
                        {isDead ? "🔄 Réessayer" : "🎮 Jouer"}
                    </Button>
                )}
                {!isPlaying && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Quick simulation for testing
                            const s = score;
                            setTimeout(() => {
                                onComplete({ score: s + 5, starsEarned: 3, accuracy: 100, itemsCompleted: 5, itemsTotal: 20, mistakes: [], durationSeconds: 0 });
                            }, 500);
                        }}
                        className="h-14 px-4 rounded-2xl border-green-200 text-green-700">
                        Simuler
                    </Button>
                )}
            </div>
        </div>
    );
}
