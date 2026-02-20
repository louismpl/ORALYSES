"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";

interface GameResult {
  score: number;
  starsEarned: number;
  accuracy: number;
  itemsCompleted: number;
  itemsTotal: number;
  mistakes: Array<{ item: string; expected: string; got: string }>;
  durationSeconds: number;
}

interface MemoryPair {
  word: string;
  image: string;
}

interface MemoryTheme {
  name: string;
  pairs: MemoryPair[];
}

interface MemoryConfig {
  themes: MemoryTheme[];
}

const EMOJI_MAP: Record<string, string> = {
  cat: "🐱", dog: "🐶", bird: "🐦", fish: "🐟", rabbit: "🐰", horse: "🐴",
  apple: "🍎", bread: "🍞", milk: "🥛", cheese: "🧀", banana: "🍌", cake: "🎂",
  bed: "🛏️", table: "🪑", chair: "💺", door: "🚪", window: "🪟", lamp: "💡",
};

interface Card {
  id: number;
  content: string;
  display: string;
  pairId: number;
  type: "word" | "image";
}

export function MemoryVocabulaire({
  config,
  difficulty,
  onComplete,
}: {
  config: Record<string, unknown>;
  difficulty: number;
  onComplete: (result: GameResult) => void;
}) {
  const gameConfig = config as unknown as MemoryConfig;
  const themeIndex = Math.min(difficulty - 1, gameConfig.themes.length - 1);
  const theme = gameConfig.themes[themeIndex];

  // Take 4-6 pairs based on difficulty
  const pairCount = Math.min(2 + difficulty * 2, theme.pairs.length);

  const cards = useMemo(() => {
    const selectedPairs = theme.pairs.slice(0, pairCount);
    const allCards: Card[] = [];
    selectedPairs.forEach((pair, idx) => {
      allCards.push({
        id: idx * 2,
        content: pair.word,
        display: pair.word,
        pairId: idx,
        type: "word",
      });
      allCards.push({
        id: idx * 2 + 1,
        content: pair.image,
        display: EMOJI_MAP[pair.image] || "❓",
        pairId: idx,
        type: "image",
      });
    });
    return allCards.sort(() => Math.random() - 0.5);
  }, [theme, pairCount]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [canClick, setCanClick] = useState(true);

  const totalPairs = pairCount;

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      // accuracy = how close to perfect (ideal = totalPairs attempts)
      // Guard against division by zero
      const accuracy = attempts > 0
        ? Math.min(Math.round((totalPairs / attempts) * 100), 100)
        : 100;
      const stars =
        accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
      onComplete({
        score: matched.length / 2,
        starsEarned: stars,
        accuracy,
        itemsCompleted: totalPairs,
        itemsTotal: totalPairs,
        mistakes: [],
        durationSeconds: 0,
      });
    }
  }, [matched, cards.length, totalPairs, attempts, onComplete]);

  function handleCardClick(cardId: number) {
    if (!canClick) return;
    if (flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setCanClick(false);
      setAttempts((a) => a + 1);

      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first)!;
      const card2 = cards.find((c) => c.id === second)!;

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match!
        setTimeout(() => {
          setMatched((m) => [...m, first, second]);
          setFlipped([]);
          setCanClick(true);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setCanClick(true);
        }, 1000);
      }
    }
  }

  const cols = cards.length <= 8 ? 4 : 4;

  return (
    <div className="max-w-md mx-auto">
      {/* Theme label */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
          Theme : {theme.name}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Trouve les paires mot + image
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.id);

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl text-center flex items-center justify-center font-bold transition-all ${isFlipped || isMatched
                  ? card.type === "word"
                    ? "bg-violet-100 border-2 border-violet-300 text-violet-700"
                    : "bg-orange-100 border-2 border-orange-300"
                  : "bg-gradient-to-br from-violet-400 to-orange-300 cursor-pointer hover:from-violet-500 hover:to-orange-400"
                } ${isMatched ? "opacity-50" : ""}`}
            >
              {isFlipped || isMatched ? (
                <span className={card.type === "image" ? "text-3xl" : "text-sm"}>
                  {card.type === "image" ? card.display : card.content}
                </span>
              ) : (
                <span className="text-2xl text-white">?</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="text-center mt-4 text-sm text-gray-400">
        {matched.length / 2} / {totalPairs} paires trouvees | {attempts}{" "}
        tentatives
      </div>
    </div>
  );
}
