"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, RotateCcw, Home, Trophy } from "lucide-react";

interface GameResult {
  score: number;
  starsEarned: number;
  accuracy: number;
  itemsCompleted: number;
  itemsTotal: number;
  durationSeconds: number;
}

export function GameComplete({
  result,
  patientName,
  gameName,
  onPlayAgain,
  onGoBack,
}: {
  result: GameResult;
  patientName: string;
  gameName: string;
  onPlayAgain: () => void;
  onGoBack: () => void;
}) {
  // Index 0 = 0 stars, 1 = 1 star, 2 = 2 stars, 3 = 3 stars
  const messages: Record<number, string> = {
    0: "Courage, tu vas y arriver !",
    1: "Continue comme ça !",
    2: "Bien joué !",
    3: "Bravo, champion ! 🏆",
  };
  const message = messages[result.starsEarned] ?? "Bravo !";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl"
      >
        {/* Trophy */}
        <motion.div
          initial={{ rotate: -20 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {message}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {patientName} a terminé <span className="font-medium text-gray-700">{gameName}</span>
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
            >
              <Star
                className={`w-12 h-12 ${i < result.starsEarned
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200"
                  }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-violet-50 rounded-xl p-3">
            <div className="text-xl font-bold text-violet-600">
              {result.accuracy}%
            </div>
            <div className="text-xs text-gray-500">Précision</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <div className="text-xl font-bold text-orange-600">
              {result.score}/{result.itemsTotal}
            </div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-xl font-bold text-green-600">
              {Math.floor(result.durationSeconds / 60)}:{String(result.durationSeconds % 60).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-500">Durée</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white h-12 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejouer
          </Button>
          <Button
            onClick={onGoBack}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
