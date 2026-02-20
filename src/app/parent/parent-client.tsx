"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OralysesLogo } from "@/components/oralyses-logo";
import {
  Play,
  Star,
  Flame,
  Calendar,
  LogOut,
  Link2,
  Clock,
  User,
  TrendingUp,
  ChevronRight,
  Target,
  Award,
  BarChart3,
  Zap,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Patient {
  id: string;
  first_name: string;
  age: number;
  stars_total: number;
  streak_current: number;
  streak_best?: number;
  last_played_at: string | null;
  avatar_emoji?: string;
  banner_sticker?: string;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface Assignment {
  id: string;
  patient_id: string;
  game_id: string;
  difficulty_level: number;
  games: Game;
}

interface Session {
  id: string;
  patient_id: string;
  game_id: string;
  started_at: string;
  duration_seconds: number | null;
  stars_earned: number;
  score: number;
  accuracy: number | null;
  mood: number | null;
  games: { name: string; category: string; slug: string };
}

const MOOD_EMOJIS: Record<number, string> = {
  1: "😴", 2: "😕", 3: "😊", 4: "😄", 5: "🤩"
};
const MOOD_LABELS: Record<number, string> = {
  1: "Fatigué(e)", 2: "Pas top", 3: "Ça va bien", 4: "En forme !", 5: "Super bien !"
};
const MOOD_COLORS: Record<number, string> = {
  1: "bg-slate-100 text-slate-600",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-green-100 text-green-700",
  5: "bg-violet-100 text-violet-700",
};

const CATEGORY_COLORS: Record<string, string> = {
  phonologie: "bg-rose-100 text-rose-700",
  vocabulaire: "bg-blue-100 text-blue-700",
  lecture: "bg-indigo-100 text-indigo-700",
  syntaxe: "bg-emerald-100 text-emerald-700",
  memoire: "bg-purple-100 text-purple-700",
  maths: "bg-orange-100 text-orange-700",
  motricite: "bg-teal-100 text-teal-700",
  grammaire: "bg-pink-100 text-pink-700",
};

function MiniBarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  const globalMax = Math.max(...data.map(d => d.max), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20 truncate">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(d.value / globalMax) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-6 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function WeekCalendar({ sessions }: { sessions: Session[] }) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  return (
    <div className="flex gap-1.5">
      {days.map((label, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayStr = day.toDateString();
        const played = sessions.some(s => new Date(s.started_at).toDateString() === dayStr);
        const isToday = day.toDateString() === now.toDateString();
        const isFuture = day > now;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs text-gray-400">{label}</span>
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isFuture
              ? "bg-gray-50 text-gray-300"
              : played
                ? "bg-gradient-to-br from-violet-400 to-orange-400 text-white shadow-sm"
                : isToday
                  ? "border-2 border-dashed border-violet-300 text-violet-400"
                  : "bg-gray-100 text-gray-400"
              }`}>
              {played ? "⭐" : isToday ? "•" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressMiniChart({ sessions }: { sessions: Session[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const daySessions = sessions.filter(s => new Date(s.started_at).toDateString() === dayStr);
    const avgAccuracy = daySessions.length > 0
      ? daySessions.reduce((a, s) => a + (s.accuracy ?? 70), 0) / daySessions.length
      : null;
    return { dayIndex: i, accuracy: avgAccuracy, count: daySessions.length };
  });

  const height = 50;
  const width = 200;
  // Only keep days that have data, but preserve their x position (0–6)
  const pointsWithData = last7.filter(d => d.accuracy !== null);
  const points = pointsWithData.map(d => {
    const x = (d.dayIndex / 6) * width;
    const y = height - ((d.accuracy! / 100) * (height - 4)) - 2; // 2px padding top/bottom
    return { x, y, val: d.accuracy! };
  });

  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-14 text-xs text-gray-400">
        Jouez au moins 2 jours différents pour voir la courbe
      </div>
    );
  }

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
      <defs>
        <linearGradient id="parentChartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <polyline
        points={polylineStr}
        fill="none"
        stroke="url(#parentChartGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="url(#parentChartGrad)" />
      ))}
    </svg>
  );
}

import { RewardShop } from "@/components/rewards/reward-shop";
import { DailyQuests } from "@/components/games/daily-quests";

interface RewardItem {
  id: string;
  name: string;
  cost: number;
  category: string;
  emoji: string;
}

interface PatientReward {
  id: string;
  patient_id: string;
  reward_item_id: string;
  reward_items: RewardItem;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  threshold: number;
  icon: string;
}

interface PatientAchievement {
  id: string;
  patient_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

export function ParentClient({
  profile,
  patients,
  assignments,
  sessions,
  unlockedRewards,
  unlockedAchievements,
  allRewards,
}: {
  profile: { id: string; full_name: string };
  patients: Patient[];
  assignments: Assignment[];
  sessions: Session[];
  unlockedRewards: PatientReward[];
  unlockedAchievements: PatientAchievement[];
  allRewards: RewardItem[];
}) {
  const [linkCode, setLinkCode] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChild, setActiveChild] = useState<string>(patients[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "progress" | "shop" | "achievements">("dashboard");
  const router = useRouter();
  const supabase = createClient();

  async function handleLinkChild(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .rpc("link_child_to_parent", { p_link_code: linkCode.trim() });

    if (error) {
      toast.error("Erreur de connexion. Réessayez.");
    } else if (data?.success) {
      toast.success(`${data.first_name} est maintenant lié à votre compte !`);
      setShowLink(false);
      setLinkCode("");
      router.refresh();
    } else {
      toast.error(data?.error || "Code invalide ou enfant déjà lié");
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const today = new Date().toDateString();

  // ─── No children linked ─────────────────────────────────────────────────────
  if (patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-orange-50 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <OralysesLogo size={28} />
              <span className="font-bold" style={{ color: '#F28C6F' }}>Oralyses</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6 text-4xl">
            🔗
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Liez le compte de votre enfant
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Demandez le code de liaison à l&apos;orthophoniste de votre enfant pour suivre sa progression.
          </p>
          <Dialog open={showLink} onOpenChange={setShowLink}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-500 to-orange-400 text-white px-8 h-12 rounded-xl">
                Entrer le code de liaison
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Code de liaison</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLinkChild} className="space-y-4">
                <Input value={linkCode} onChange={e => setLinkCode(e.target.value)}
                  placeholder="Ex: a1b2c3d4" required className="text-center text-lg tracking-widest" />
                <Button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                  {loading ? "Liaison..." : "Lier mon enfant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const child = patients.find(p => p.id === activeChild) ?? patients[0];
  const childAssignments = assignments.filter(a => a.patient_id === child.id);
  const childSessions = sessions.filter(s => s.patient_id === child.id);
  const playedToday = childSessions.some(s => new Date(s.started_at).toDateString() === today);

  const weekSessions = childSessions.filter(s => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(s.started_at) > weekAgo;
  });
  const weekGoal = 5;
  const weekProgress = Math.min((weekSessions.length / weekGoal) * 100, 100);

  const avgAccuracy = childSessions.length > 0
    ? Math.round(childSessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / childSessions.length)
    : 0;

  const totalStars = childSessions.reduce((a, s) => a + s.stars_earned, 0);

  // Per-game stats
  const gameStats = childAssignments.map(a => {
    const gameSessions = childSessions.filter(s => s.game_id === a.game_id);
    const avg = gameSessions.length > 0
      ? Math.round(gameSessions.reduce((acc, s) => acc + (s.accuracy ?? 0), 0) / gameSessions.length)
      : 0;
    return {
      label: a.games.name,
      slug: a.games.slug,
      category: a.games.category,
      sessions: gameSessions.length,
      accuracy: avg,
      stars: gameSessions.reduce((acc, s) => acc + s.stars_earned, 0),
    };
  });

  // Mood distribution
  const moodSessions = childSessions.filter(s => s.mood !== null && s.mood !== undefined);
  const moodCounts: Record<number, number> = {};
  moodSessions.forEach(s => {
    moodCounts[s.mood!] = (moodCounts[s.mood!] || 0) + 1;
  });
  const dominantMood = moodSessions.length > 0
    ? parseInt(Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "3")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-orange-50">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <OralysesLogo size={28} />
            <span className="font-bold" style={{ color: '#F28C6F' }}>Oralyses</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/profil">
              <Button variant="ghost" size="sm"><User className="w-4 h-4" /></Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* ─── Child selector ──────────────────────────────────────────────── */}
        {patients.length > 1 && (
          <div className="pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {patients.map(p => (
              <button
                key={p.id}
                onClick={() => { setActiveChild(p.id); setActiveTab("dashboard"); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeChild === p.id
                  ? "bg-gradient-to-r from-violet-500 to-orange-400 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-violet-300"
                  }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeChild === p.id ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"
                  }`}>{p.first_name[0]}</span>
                {p.first_name}
              </button>
            ))}
            <Dialog open={showLink} onOpenChange={setShowLink}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-gray-400 border border-dashed border-gray-300 hover:border-violet-300 whitespace-nowrap">
                  <Link2 className="w-3.5 h-3.5" /> Ajouter
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Code de liaison</DialogTitle></DialogHeader>
                <form onSubmit={handleLinkChild} className="space-y-4">
                  <Input value={linkCode} onChange={e => setLinkCode(e.target.value)}
                    placeholder="Ex: a1b2c3d4" required className="text-center text-lg tracking-widest" />
                  <Button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                    {loading ? "Liaison..." : "Lier mon enfant"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ─── Hero card ───────────────────────────────────────────────────── */}
        <div className="mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-orange-400 text-white p-6 shadow-xl shadow-violet-200 relative">
          {/* Banner Sticker */}
          {child.banner_sticker && (
            <div className="absolute top-2 right-12 text-4xl opacity-40 rotate-12 select-none pointer-events-none">
              {child.banner_sticker}
            </div>
          )}

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-violet-100 text-sm">Bonjour 👋</p>
                {child.avatar_emoji && <span className="text-xl animate-bounce" style={{ animationDuration: '3s' }}>{child.avatar_emoji}</span>}
              </div>
              <h2 className="text-2xl font-bold">{child.first_name}</h2>
              {dominantMood && (
                <p className="text-violet-100 text-xs mt-0.5">
                  Humeur habituelle : {MOOD_EMOJIS[dominantMood]} {MOOD_LABELS[dominantMood]}
                </p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border border-white/30 shadow-inner">
              {child.avatar_emoji || child.first_name[0]}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <button
              onClick={() => setActiveTab("shop")}
              className="bg-white/15 hover:bg-white/20 transition-all rounded-2xl p-3 text-center cursor-pointer border-none text-white w-full"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="font-bold text-lg">{child.stars_total}</span>
              </div>
              <p className="text-white/70 text-xs">Boutique</p>
            </button>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Flame className={`w-4 h-4 ${child.streak_current > 0 ? "text-orange-300" : "text-white/30"}`} />
                <span className="font-bold text-lg">{child.streak_current}</span>
              </div>
              <p className="text-white/70 text-xs">Jours consec.</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Target className="w-4 h-4 text-green-300" />
                <span className="font-bold text-lg">{avgAccuracy}%</span>
              </div>
              <p className="text-white/70 text-xs">Précision</p>
            </div>
          </div>

          {/* Objectif hebdo */}
          <div>
            <div className="flex justify-between text-xs text-white/80 mb-1.5">
              <span>Objectif semaine : {weekSessions.length}/{weekGoal} sessions</span>
              <span>{Math.round(weekProgress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${weekProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── CTA Play ────────────────────────────────────────────────────── */}
        {!playedToday && childAssignments.length > 0 && (
          <div className="mt-4">
            <Link
              href={`/play/${child.id}/${childAssignments[0].games.slug}?assignment=${childAssignments[0].id}&difficulty=${childAssignments[0].difficulty_level}`}
            >
              <Button className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white rounded-2xl shadow-lg shadow-violet-200">
                <Play className="w-6 h-6 mr-2" />
                Jouer maintenant !
              </Button>
            </Link>
          </div>
        )}
        {playedToday && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-medium">🎉 Session du jour complétée, bravo {child.first_name} !</p>
          </div>
        )}

        {/* ─── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mt-6 flex bg-gray-100 rounded-2xl p-1 gap-1 overflow-x-auto scroller-hide">
          {(["dashboard", "history", "progress", "shop", "achievements"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab ? "bg-white shadow text-gray-900 font-bold scale-[1.02]" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
            >
              {tab === "dashboard" && "📋 Jeux"}
              {tab === "history" && "📅 Hist."}
              {tab === "progress" && "📈 Progrès"}
              {tab === "shop" && "🎁 Shop"}
              {tab === "achievements" && "🏆 Succès"}
            </button>
          ))}
        </div>

        {/* ─── Tab: Jeux assignés ──────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="mt-4 space-y-4">
            {/* Daily Quests */}
            <DailyQuests
              patientId={child.id}
              sessionsToday={childSessions.filter(s => new Date(s.started_at).toDateString() === today).length}
            />

            <div className="space-y-3">
              {childAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun jeu assigné pour le moment</p>
                </div>
              ) : (
                childAssignments.map(a => {
                  const stat = gameStats.find(g => g.slug === a.games.slug);
                  const catColor = CATEGORY_COLORS[a.games.category] ?? "bg-gray-100 text-gray-600";
                  return (
                    <Link
                      key={a.id}
                      href={`/play/${child.id}/${a.games.slug}?assignment=${a.id}&difficulty=${a.difficulty_level}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 text-violet-500 group-hover:text-violet-700 transition" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{a.games.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>
                            {a.games.category}
                          </span>
                          <span className="text-xs text-gray-400">Niv. {a.difficulty_level}</span>
                          {stat && stat.sessions > 0 && (
                            <span className="text-xs text-gray-400">{stat.sessions} session{stat.sessions > 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>
                      {stat && stat.accuracy > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-violet-600">{stat.accuracy}%</p>
                          <p className="text-xs text-gray-400">précision</p>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </Link>
                  );
                })
              )}

              {/* Calendrier semaine */}
              {childSessions.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Cette semaine
                  </h3>
                  <WeekCalendar sessions={childSessions} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Tab: Historique ─────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="mt-4 space-y-2">
            {childSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune session jouée pour l&apos;instant</p>
              </div>
            ) : (
              childSessions.slice(0, 30).map(s => {
                const catColor = CATEGORY_COLORS[s.games.category] ?? "bg-gray-100 text-gray-600";
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex-shrink-0">
                      {s.mood ? (
                        <span className={`text-xl flex items-center justify-center w-10 h-10 rounded-xl ${MOOD_COLORS[s.mood]}`}>
                          {MOOD_EMOJIS[s.mood]}
                        </span>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Star className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.games.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {new Date(s.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", weekday: "short" })}
                          {s.duration_seconds && ` · ${Math.round(s.duration_seconds / 60)} min`}
                        </p>
                        {s.accuracy !== null && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.accuracy >= 80 ? "bg-green-100 text-green-700" : s.accuracy >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {s.accuracy}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < s.stars_earned ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Tab: Progrès ────────────────────────────────────────────────── */}
        {activeTab === "progress" && (
          <div className="mt-4 space-y-4">
            {/* Courbe précision 7j */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Précision sur 7 jours
              </h3>
              <p className="text-xs text-gray-400 mb-3">Moyenne par jour de jeu</p>
              <ProgressMiniChart sessions={childSessions} />
            </div>

            {/* Stats globales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <span className="text-xs text-gray-500">Étoiles totales</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalStars}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-xs text-gray-500">Sessions totales</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{childSessions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-xs text-gray-500">Précision moy.</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{avgAccuracy}%</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs text-gray-500">Meilleur streak</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{child.streak_best ?? child.streak_current ?? 0}j</p>
              </div>
            </div>

            {/* Par jeu */}
            {gameStats.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-500" />
                  Précision par jeu
                </h3>
                <MiniBarChart data={gameStats.map(g => ({ label: g.label, value: g.accuracy, max: 100 }))} />
              </div>
            )}

            {/* Humeur */}
            {moodSessions.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                  😊 Baromètre d&apos;humeur
                </h3>
                <div className="flex items-end gap-2 h-16">
                  {[1, 2, 3, 4, 5].map(m => {
                    const count = moodCounts[m] ?? 0;
                    const maxCount = Math.max(...Object.values(moodCounts), 1);
                    const pct = (count / maxCount) * 100;
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: "48px" }}>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${dominantMood === m ? "bg-gradient-to-t from-violet-400 to-orange-400" : "bg-gray-100"
                              }`}
                            style={{ height: `${pct}%`, minHeight: count > 0 ? "4px" : "0" }}
                          />
                        </div>
                        <span className="text-base">{MOOD_EMOJIS[m]}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Shop ───────────────────────────────────────────────────── */}
        {activeTab === "shop" && (
          <div className="mt-6">
            <RewardShop
              patientId={child.id}
              starsTotal={child.stars_total}
              onUpdate={() => router.refresh()}
            />
          </div>
        )}

        {/* ─── Tab: Achievements ────────────────────────────────────────────── */}
        {activeTab === "achievements" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800">Mes Trophées</h2>
                <p className="text-sm text-gray-500">
                  {unlockedAchievements.filter(a => a.patient_id === child.id).length} débloqués
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {unlockedAchievements.filter(a => a.patient_id === child.id).map((ua) => (
                <motion.div
                  key={ua.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-5 rounded-[2rem] border-2 border-violet-100 shadow-sm flex flex-col items-center text-center hover:border-violet-300 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    {ua.achievements.icon === 'Award' ? '🏆' :
                      ua.achievements.icon === 'Star' ? '⭐' :
                        ua.achievements.icon === 'Flame' ? '🔥' :
                          ua.achievements.icon === 'Target' ? '🎯' :
                            ua.achievements.icon === 'Activity' ? '⚡' :
                              ua.achievements.icon || '🏅'}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{ua.achievements.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{ua.achievements.description}</p>
                  <div className="mt-3 text-[10px] font-bold text-violet-600 uppercase tracking-tighter bg-violet-50 px-2 py-0.5 rounded-full">
                    Gagné !
                  </div>
                </motion.div>
              ))}

              {unlockedAchievements.filter(a => a.patient_id === child.id).length === 0 && (
                <div className="col-span-2 py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Joue à des jeux pour gagner tes premiers trophées !</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Link another child (bottom) ─────────────────────────────────── */}
        {patients.length > 0 && patients.length < 2 && (
          <div className="mt-6 text-center">
            <Dialog open={showLink} onOpenChange={setShowLink}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-500">
                  <Link2 className="w-4 h-4 mr-1" /> Lier un autre enfant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Code de liaison</DialogTitle></DialogHeader>
                <form onSubmit={handleLinkChild} className="space-y-4">
                  <Input value={linkCode} onChange={e => setLinkCode(e.target.value)}
                    placeholder="Ex: a1b2c3d4" required className="text-center text-lg tracking-widest" />
                  <Button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                    {loading ? "Liaison..." : "Lier mon enfant"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
