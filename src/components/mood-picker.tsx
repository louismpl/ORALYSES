"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
    { value: 1, emoji: "😴", label: "Fatigué(e)", color: "from-slate-200 to-slate-300", border: "border-slate-400", bg: "bg-slate-50" },
    { value: 2, emoji: "😕", label: "Pas top", color: "from-orange-200 to-orange-300", border: "border-orange-400", bg: "bg-orange-50" },
    { value: 3, emoji: "😊", label: "Ça va bien", color: "from-yellow-200 to-yellow-300", border: "border-yellow-400", bg: "bg-yellow-50" },
    { value: 4, emoji: "😄", label: "En forme !", color: "from-green-200 to-green-300", border: "border-green-400", bg: "bg-green-50" },
    { value: 5, emoji: "🤩", label: "Super bien !", color: "from-violet-200 to-orange-200", border: "border-violet-400", bg: "bg-violet-50" },
];

export function MoodPicker({
    patientName,
    onSelect,
}: {
    patientName: string;
    onSelect: (mood: number) => void;
}) {
    const [selected, setSelected] = useState<number | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    function handleSelect(value: number) {
        setSelected(value);
    }

    function handleConfirm() {
        if (!selected) return;
        setConfirmed(true);
        setTimeout(() => onSelect(selected), 600);
    }

    const selectedMood = MOODS.find(m => m.value === selected);

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-100 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-6">
            <AnimatePresence mode="wait">
                {!confirmed ? (
                    <motion.div
                        key="picker"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm text-center"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-5 shadow-lg"
                        >
                            {patientName[0].toUpperCase()}
                        </motion.div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            Bonjour {patientName} ! 👋
                        </h1>
                        <p className="text-gray-500 mb-8 text-sm">
                            Comment tu te sens aujourd&apos;hui avant de jouer ?
                        </p>

                        {/* Mood grid */}
                        <div className="flex justify-center gap-3 mb-8">
                            {MOODS.map((mood, i) => (
                                <motion.button
                                    key={mood.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.07 }}
                                    onClick={() => handleSelect(mood.value)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all duration-200 ${selected === mood.value
                                            ? `${mood.bg} ${mood.border} scale-110 shadow-md`
                                            : "bg-white/70 border-transparent hover:scale-105 hover:border-gray-200"
                                        }`}
                                >
                                    <span className="text-4xl">{mood.emoji}</span>
                                    <span className={`text-xs font-medium ${selected === mood.value ? "text-gray-700" : "text-gray-400"}`}>
                                        {mood.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Confirm button */}
                        <AnimatePresence>
                            {selected && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleConfirm}
                                    className={`w-full h-14 rounded-2xl font-bold text-white text-lg shadow-lg bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 active:scale-95 transition-all`}
                                >
                                    On joue ! 🚀
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="confirmed"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        className="text-center"
                    >
                        <div className="text-8xl mb-4">{selectedMood?.emoji}</div>
                        <p className="text-2xl font-bold text-gray-800">C&apos;est parti !</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
