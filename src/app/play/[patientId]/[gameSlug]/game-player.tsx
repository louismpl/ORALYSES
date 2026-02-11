"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AttrapeLesSons } from "@/components/games/attrape-les-sons";
import { MemoryVocabulaire } from "@/components/games/memory-vocabulaire";
import { SimonDit } from "@/components/games/simon-dit";
import { GameComplete } from "@/components/games/game-complete";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GameResult {
  score: number;
  starsEarned: number;
  accuracy: number;
  itemsCompleted: number;
  itemsTotal: number;
  mistakes: Array<{ item: string; expected: string; got: string }>;
  durationSeconds: number;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  category: string;
  config: Record<string, unknown>;
}

interface Patient {
  id: string;
  first_name: string;
  stars_total: number;
  streak_current: number;
}

export function GamePlayer({
  game,
  patient,
  assignmentId,
  difficulty,
}: {
  game: Game;
  patient: Patient;
  assignmentId: string | null;
  difficulty: number;
}) {
  const [gameState, setGameState] = useState<"playing" | "complete">("playing");
  const [result, setResult] = useState<GameResult | null>(null);
  const [startTime] = useState(Date.now());
  const router = useRouter();
  const supabase = createClient();

  const handleGameComplete = useCallback(async (gameResult: GameResult) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const finalResult = { ...gameResult, durationSeconds: duration };
    setResult(finalResult);
    setGameState("complete");

    // Save session to DB
    await supabase.from("game_sessions").insert({
      patient_id: patient.id,
      game_id: game.id,
      assignment_id: assignmentId,
      duration_seconds: duration,
      score: gameResult.score,
      stars_earned: gameResult.starsEarned,
      accuracy: gameResult.accuracy,
      items_completed: gameResult.itemsCompleted,
      items_total: gameResult.itemsTotal,
      mistakes: gameResult.mistakes,
      ended_at: new Date().toISOString(),
    });

    // Update patient stats
    await supabase
      .from("patients")
      .update({
        stars_total: patient.stars_total + gameResult.starsEarned,
        last_played_at: new Date().toISOString(),
      })
      .eq("id", patient.id);
  }, [startTime, supabase, patient, game, assignmentId]);

  if (gameState === "complete" && result) {
    return (
      <GameComplete
        result={result}
        patientName={patient.first_name}
        gameName={game.name}
        onPlayAgain={() => {
          setGameState("playing");
          setResult(null);
        }}
        onGoBack={() => router.push("/parent")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-orange-100">
      {/* Game header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link href="/parent">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="font-semibold text-sm">{game.name}</span>
        </div>
        <div className="text-sm text-gray-500">
          {patient.first_name}
        </div>
      </div>

      {/* Game area */}
      <div className="p-4">
        {game.slug === "attrape-les-sons" && (
          <AttrapeLesSons
            config={game.config}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        )}
        {game.slug === "memory-vocabulaire" && (
          <MemoryVocabulaire
            config={game.config}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        )}
        {game.slug === "simon-dit" && (
          <SimonDit
            config={game.config}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        )}
      </div>
    </div>
  );
}
