"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GameResult {
    score: number;
    starsEarned: number;
    accuracy: number;
    itemsCompleted: number;
    itemsTotal: number;
    mistakes: Array<{ item: string; expected: string; got: string }>;
    durationSeconds: number;
}

interface SupermarcheConfig {
    categories: string[];
    items: { name: string; emoji: string; category: string }[];
}

const DEFAULT_ITEMS = [
    { name: "Pomme", emoji: "🍎", category: "Fruits" },
    { name: "Banane", emoji: "🍌", category: "Fruits" },
    { name: "Raisin", emoji: "🍇", category: "Fruits" },
    { name: "Orange", emoji: "🍊", category: "Fruits" },
    { name: "Fraise", emoji: "🍓", category: "Fruits" },
    { name: "Carotte", emoji: "🥕", category: "Légumes" },
    { name: "Brocoli", emoji: "🥦", category: "Légumes" },
    { name: "Tomate", emoji: "🍅", category: "Légumes" },
    { name: "Salade", emoji: "🥬", category: "Légumes" },
    { name: "Poivron", emoji: "🫑", category: "Légumes" },
    { name: "Chien", emoji: "🐶", category: "Animaux" },
    { name: "Chat", emoji: "🐱", category: "Animaux" },
    { name: "Lapin", emoji: "🐰", category: "Animaux" },
    { name: "Vache", emoji: "🐄", category: "Animaux" },
    { name: "T-shirt", emoji: "👕", category: "Vêtements" },
    { name: "Pantalon", emoji: "👖", category: "Vêtements" },
    { name: "Chaussure", emoji: "👟", category: "Vêtements" },
    { name: "Chapeau", emoji: "🧢", category: "Vêtements" },
];

const CATEGORY_CONFIG: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    "Fruits": { bg: "bg-red-100", border: "border-red-400", text: "text-red-700", emoji: "🍎" },
    "Légumes": { bg: "bg-green-100", border: "border-green-400", text: "text-green-700", emoji: "🥕" },
    "Animaux": { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-700", emoji: "🐾" },
    "Vêtements": { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700", emoji: "👕" },
};

export function Supermarche({
    config,
    difficulty,
    onComplete,
}: {
    config: Record<string, unknown>;
    difficulty: number;
    onComplete: (result: GameResult) => void;
}) {
    const gameConfig = config as unknown as SupermarcheConfig;
    const allItems = gameConfig?.items?.length ? gameConfig.items : DEFAULT_ITEMS;
    const categories = gameConfig?.categories?.length ? gameConfig.categories : ["Fruits", "Légumes", "Animaux", "Vêtements"];
    const activeCategories = difficulty === 1 ? categories.slice(0, 2) : difficulty === 2 ? categories.slice(0, 3) : categories;

    const items = useMemo(
        () => [...allItems.filter(i => activeCategories.includes(i.category))].sort(() => Math.random() - 0.5).slice(0, difficulty === 1 ? 8 : difficulty === 2 ? 12 : 16),
        [allItems, activeCategories, difficulty]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [feedback, setFeedback] = useState<{ category: string; correct: boolean } | null>(null);

    const currentItem = items[currentIndex];

    function handleCategory(category: string) {
        if (feedback) return;
        const correct = category === currentItem.category;
        setFeedback({ category, correct });
        if (correct) setScore(s => s + 1);
        else setMistakes(m => [...m, { item: currentItem.name, expected: currentItem.category, got: category }]);
        setAnswers(a => [...a, correct]);
        setTimeout(() => {
            setFeedback(null);
            if (currentIndex + 1 >= items.length) {
                const fs = score + (correct ? 1 : 0);
                const acc = Math.round(fs / items.length * 100);
                const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
                onComplete({ score: fs, starsEarned: stars, accuracy: acc, itemsCompleted: items.length, itemsTotal: items.length, mistakes, durationSeconds: 0 });
            } else {
                setCurrentIndex(i => i + 1);
            }
        }, 800);
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="flex gap-1 mb-4">
                {items.map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < currentIndex ? (answers[i] ? "bg-green-400" : "bg-red-400") : i === currentIndex ? "bg-violet-400" : "bg-gray-200"}`} />
                ))}
            </div>

            <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl mb-4 overflow-hidden border border-gray-300">
                <div className="flex gap-1 px-2 pt-2">
                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="flex-1 h-1.5 bg-gray-400 rounded-full opacity-50" />)}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -200, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="flex flex-col items-center py-6">
                        <div className="text-7xl mb-2">{currentItem.emoji}</div>
                        <div className="text-2xl font-bold text-gray-800">{currentItem.name}</div>
                        {feedback && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-bold mt-2 ${feedback.correct ? "text-green-600" : "text-red-600"}`}>
                                {feedback.correct ? "✅ Bien rangé !" : `❌ C'est dans ${currentItem.category} !`}
                            </motion.p>
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="flex gap-1 px-2 pb-2">
                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="flex-1 h-1.5 bg-gray-400 rounded-full opacity-50" />)}
                </div>
            </div>

            <p className="text-sm text-center text-gray-500 mb-3 font-medium">🛒 Dans quel rayon ?</p>
            <div className={`grid gap-3 ${activeCategories.length <= 2 ? "grid-cols-2" : activeCategories.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {activeCategories.map(cat => {
                    const c = CATEGORY_CONFIG[cat] || { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-700", emoji: "📦" };
                    const isChosen = feedback?.category === cat;
                    return (
                        <motion.button key={cat} whileTap={{ scale: 0.93 }} onClick={() => handleCategory(cat)} disabled={!!feedback}
                            className={`p-4 rounded-2xl border-2 font-bold transition-all ${isChosen ? feedback!.correct ? "bg-green-500 border-green-600 text-white" : "bg-red-500 border-red-600 text-white" : `${c.bg} ${c.border} ${c.text} hover:scale-105`}`}>
                            <div className="text-3xl mb-1">{c.emoji}</div>
                            <div className="text-sm">{cat}</div>
                        </motion.button>
                    );
                })}
            </div>
            <div className="text-center mt-4 text-sm text-gray-400">{currentIndex + 1} / {items.length}</div>
        </div>
    );
}
