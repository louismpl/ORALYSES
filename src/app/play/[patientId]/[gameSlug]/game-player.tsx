"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Games
import { AttrapeLesSons } from "@/components/games/attrape-les-sons";
import { MemoryVocabulaire } from "@/components/games/memory-vocabulaire";
import { SimonDit } from "@/components/games/simon-dit";
import { TrainDesSyllabes } from "@/components/games/train-des-syllabes";
import { PecheAuxRimes } from "@/components/games/peche-aux-rimes";
import { ArchitecteDesPhrases } from "@/components/games/architecte-des-phrases";
import { TriLettres } from "@/components/games/tri-lettres";
import { Supermarche } from "@/components/games/supermarche";
import { LecteurFlash } from "@/components/games/lecteur-flash";
import { MemoryContraires } from "@/components/games/memory-contraires";
import { MotTroue } from "@/components/games/mot-troue";
import { CourseDesAccords } from "@/components/games/course-des-accords";
import { QuiEstCe } from "@/components/games/qui-est-ce";
import { CompteEstBon } from "@/components/games/compte-est-bon";
import { SerpentSiffleur } from "@/components/games/serpent-siffleur";
import { TapisVolantDuTemps } from "@/components/games/tapis-volant-du-temps";
import { ConjugueurFou } from "@/components/games/conjugueur-fou";
import { TrainDesNatures } from "@/components/games/train-des-natures";
import { Virelangues } from "@/components/games/virelangues";
import { MiroirGrimaces } from "@/components/games/miroir-grimaces";
import { SonsAnimaux } from "@/components/games/sons-animaux";
import { Prononcio } from "@/components/games/prononcio";
import { Imagier } from "@/components/games/imagier";
import { HistoiresLibres } from "@/components/games/histoires-libres";
import { StoryArticulation } from "@/components/games/story-articulation";
import { SoufflePlume } from "@/components/games/souffle-plume";
import { AmuzBouch } from "@/components/games/amuz-bouch";
import { TelephonesChuchoteurs } from "@/components/games/telephones-chuchoteurs";
import { MimesActions } from "@/components/games/mimes-actions";
import { DevinettesObjets } from "@/components/games/devinettes-objets";
import { LotoPronoms } from "@/components/games/loto-pronoms";
import { LangueAuChat } from "@/components/games/langue-au-chat";
import { SpiralePronoms } from "@/components/games/spirale-pronoms";
import { BullesMots } from "@/components/games/bulles-mots";

import { MoodPicker } from "@/components/mood-picker";
import { GameComplete } from "@/components/games/game-complete";
import { GameErrorBoundary } from "@/components/game-error-boundary";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

// ── Mood: once-per-day helpers ────────────────────────────────────────────────
function getTodayKey(patientId: string) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `mood_${patientId}_${today}`;
}

function getTodayMood(patientId: string): number | null {
  if (typeof window === "undefined") return null;
  const key = getTodayKey(patientId);
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : null;
}

function saveTodayMood(patientId: string, mood: number) {
  if (typeof window === "undefined") return;
  // Clean old mood entries (anything not from today)
  const todayPrefix = `mood_${patientId}_`;
  const todayKey = getTodayKey(patientId);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(todayPrefix) && k !== todayKey) {
      localStorage.removeItem(k);
    }
  }
  localStorage.setItem(todayKey, String(mood));
}

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
  avatar_emoji?: string;
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
  // Check if mood was already given today
  const existingMood = getTodayMood(patient.id);
  const [gameState, setGameState] = useState<"mood" | "playing" | "complete">(
    existingMood ? "playing" : "mood"
  );
  const [mood, setMood] = useState<number | null>(existingMood);
  const [result, setResult] = useState<GameResult | null>(null);
  const [startTime, setStartTime] = useState<number>(existingMood ? Date.now() : 0);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  function handleMoodSelected(selectedMood: number) {
    setMood(selectedMood);
    saveTodayMood(patient.id, selectedMood); // Save to localStorage so next game today skips mood
    setStartTime(Date.now());
    setGameState("playing");
  }

  const handleGameComplete = useCallback(async (gameResult: GameResult) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const finalResult = { ...gameResult, durationSeconds: duration };
    setResult(finalResult);
    setGameState("complete");

    // Celebratory confetti!
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#fb923c", "#fcd34d", "#10b981"]
    });

    // Save session
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
      mood: mood,
      ended_at: new Date().toISOString(),
    });

    // Update patient stars
    const newStarsTotal = patient.stars_total + gameResult.starsEarned;
    await supabase
      .from("patients")
      .update({
        stars_total: newStarsTotal,
        last_played_at: new Date().toISOString(),
      })
      .eq("id", patient.id);

    // Achievement logic
    try {
      const { data: achs } = await supabase.from("achievements").select("*");
      const { data: unlocked } = await supabase.from("patient_achievements")
        .select("achievement_id").eq("patient_id", patient.id);

      const unlockedIds = unlocked?.map(u => u.achievement_id) || [];

      for (const ach of achs || []) {
        if (unlockedIds.includes(ach.id)) continue;

        let shouldUnlock = false;
        if (ach.category === "accuracy" && gameResult.accuracy >= ach.threshold) shouldUnlock = true;
        if (ach.category === "stars" && newStarsTotal >= ach.threshold) shouldUnlock = true;
        // For sessions/streak, we'd need more counting, but we can at least check accuracy/stars

        if (shouldUnlock) {
          await supabase.from("patient_achievements").insert({
            patient_id: patient.id,
            achievement_id: ach.id
          });
          toast.success(`Nouveau succès : ${ach.name} ! 🏆`, {
            description: ach.description,
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error("Error checking achievements:", err);
    }

  }, [startTime, supabase, patient, game, assignmentId, mood]);

  // ── Mood screen ─────────────────────────────────────────────────────────────
  if (gameState === "mood") {
    return (
      <MoodPicker
        patientName={patient.first_name}
        onSelect={handleMoodSelected}
      />
    );
  }

  // ── Game complete screen ─────────────────────────────────────────────────────
  if (gameState === "complete" && result) {
    return (
      <GameComplete
        result={result}
        patientName={patient.first_name}
        gameName={game.name}
        onPlayAgain={() => {
          setGameState("playing");
          setResult(null);
          setStartTime(Date.now());
        }}
        onGoBack={() => router.push("/parent")}
      />
    );
  }

  // ── Game screen ───────────────────────────────────────────────────────────────
  // Boost config to reach ~2-3 minutes of gameplay (approx 15-20 items)
  const boostedConfig = useCallback((cfg: Record<string, unknown>) => {
    const booster = { ...cfg };
    const arrayFields = ["items", "words", "rounds", "themes", "pages", "sentences", "sound_pairs", "levels", "instructions", "exercises", "grimaces", "pairs", "prompts", "questions"];
    const target = 15; // Target items for a 2-3 min session

    for (const f of arrayFields) {
      if (Array.isArray(booster[f]) && (booster[f] as any[]).length > 0 && (booster[f] as any[]).length < target) {
        const arr = booster[f] as any[];
        const repeated = [];
        while (repeated.length < target) {
          repeated.push(...JSON.parse(JSON.stringify(arr)));
        }
        booster[f] = repeated.slice(0, target);
      }
    }
    return booster;
  }, []);

  const gameProps = {
    config: boostedConfig(game.config),
    difficulty,
    onComplete: handleGameComplete
  };

  const MOOD_EMOJIS: Record<number, string> = { 1: "😴", 2: "😕", 3: "😊", 4: "😄", 5: "🤩" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-orange-100">
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
        <div className="flex items-center gap-1 text-sm text-gray-500">
          {mood && <span title="Humeur">{MOOD_EMOJIS[mood]}</span>}
          <span>{patient.avatar_emoji} {patient.first_name}</span>
        </div>
      </div>

      <div className="p-4">
        <GameErrorBoundary gameName={game.name}>
          {game.slug === "attrape-les-sons" && <AttrapeLesSons {...gameProps} />}
          {game.slug === "memory-vocabulaire" && <MemoryVocabulaire {...gameProps} />}
          {game.slug === "simon-dit" && <SimonDit {...gameProps} />}
          {game.slug === "train-des-syllabes" && <TrainDesSyllabes {...gameProps} />}
          {game.slug === "peche-aux-rimes" && <PecheAuxRimes {...gameProps} />}
          {game.slug === "architecte-des-phrases" && <ArchitecteDesPhrases {...gameProps} />}
          {game.slug === "tri-lettres" && <TriLettres {...gameProps} />}
          {game.slug === "supermarche" && <Supermarche {...gameProps} />}
          {game.slug === "lecteur-flash" && <LecteurFlash {...gameProps} />}
          {game.slug === "memory-contraires" && <MemoryContraires {...gameProps} />}
          {game.slug === "mot-troue" && <MotTroue {...gameProps} />}
          {game.slug === "course-des-accords" && <CourseDesAccords {...gameProps} />}
          {game.slug === "qui-est-ce" && <QuiEstCe {...gameProps} />}
          {game.slug === "compte-est-bon" && <CompteEstBon {...gameProps} />}
          {game.slug === "serpent-siffleur" && <SerpentSiffleur {...gameProps} />}
          {game.slug === "tapis-volant-du-temps" && <TapisVolantDuTemps {...gameProps} />}
          {game.slug === "conjugueur-fou" && <ConjugueurFou {...gameProps} />}
          {game.slug === "train-des-natures" && <TrainDesNatures {...gameProps} />}
          {game.slug === "virelangues" && <Virelangues {...gameProps} />}
          {game.slug === "miroir-grimaces" && <MiroirGrimaces {...gameProps} />}
          {game.slug === "sons-animaux" && <SonsAnimaux {...gameProps} />}
          {[
            "prononcio", "prononcio-s-z", "prononcio-f-v", "prononcio-p-b", "prononcio-t-d"
          ].includes(game.slug) && <Prononcio {...gameProps} />}
          {[
            "imagier-couleurs", "imagier-corps", "imagier-ecole", "imagier-transports", "boite-surprises", "de-premiers-mots"
          ].includes(game.slug) && <Imagier {...gameProps} />}
          {game.slug === "histoires-libres" && <HistoiresLibres {...gameProps} />}
          {[
            "chiffon-cochon", "jean-geant"
          ].includes(game.slug) && <StoryArticulation {...gameProps} />}
          {game.slug === "souffle-plume" && <SoufflePlume {...gameProps} />}
          {game.slug === "amuz-bouch" && <AmuzBouch {...gameProps} />}
          {game.slug === "telephones-chuchoteurs" && <TelephonesChuchoteurs {...gameProps} />}
          {game.slug === "mimes-actions" && <MimesActions {...gameProps} />}
          {game.slug === "devinettes-objets" && <DevinettesObjets {...gameProps} />}
          {game.slug === "loto-pronoms" && <LotoPronoms {...gameProps} />}
          {game.slug === "langue-au-chat" && <LangueAuChat {...gameProps} />}
          {game.slug === "spirale-pronoms" && <SpiralePronoms {...gameProps} />}
          {game.slug === "bulles-mots" && <BullesMots {...gameProps} />}
          {game.slug === "bizarre-bizarre" && <TrainDesSyllabes {...gameProps} />} {/* Reuse train/articulation logic */}
          {/* Fallback si le slug ne correspond à aucun jeu connu */}
          {![
            "virelangues", "souffle-plume", "miroir-grimaces", "amuz-bouch", "sons-animaux", "serpent-siffleur",
            "attrape-les-sons", "prononcio", "chiffon-cochon", "jean-geant", "telephones-chuchoteurs",
            "memory-vocabulaire", "boite-surprises", "mimes-actions", "devinettes-objets", "de-premiers-mots",
            "loto-pronoms", "memory-contraires", "supermarche", "train-des-syllabes", "peche-aux-rimes",
            "bizarre-bizarre", "langue-au-chat", "simon-dit", "qui-est-ce", "architecte-des-phrases",
            "spirale-pronoms", "conjugueur-fou", "course-des-accords", "train-des-natures", "tapis-volant-du-temps",
            "lecteur-flash", "mot-troue", "tri-lettres", "bulles-mots", "histoires-libres", "compte-est-bon",
            "imagier-couleurs", "imagier-corps", "imagier-ecole", "imagier-transports",
            "prononcio-s-z", "prononcio-f-v", "prononcio-p-b", "prononcio-t-d"
          ].includes(game.slug) && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">Jeu non disponible</p>
                <p className="text-sm">Ce jeu n&apos;est pas encore implémenté.</p>
              </div>
            )}
        </GameErrorBoundary>
      </div>
    </div>
  );
}
