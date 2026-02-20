"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { OralysesLogo } from "@/components/oralyses-logo";
import {
  Plus,
  Users,
  BarChart3,
  Gamepad2,
  Building2,
  LogOut,
  Copy,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  User,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Target,
  Award,
  Flame,
  Activity,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { GameEditor } from "@/components/games/game-editor";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  email: string;
}

interface Patient {
  id: string;
  first_name: string;
  age: number;
  goals: string[];
  link_code: string;
  parent_id: string | null;
  stars_total: number;
  streak_current: number;
  streak_best: number;
  last_played_at: string | null;
  created_at: string;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
}

interface CustomConfig {
  id: string;
  name: string;
  game_id: string;
  config: Record<string, unknown>;
  games?: { name: string; slug: string };
}

interface Assignment {
  id: string;
  patient_id: string;
  game_id: string;
  custom_config_id: string | null;
  difficulty_level: number;
  active: boolean;
  games: Game;
}

interface Session {
  id: string;
  patient_id: string;
  game_id: string;
  started_at: string;
  duration_seconds: number | null;
  score: number;
  stars_earned: number;
  accuracy: number | null;
  items_completed: number;
  items_total: number;
  mood: number | null;
  mistakes: Array<{ item: string; expected: string; got: string }> | null;
  games: { name: string; category: string; slug: string };
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

const MOOD_EMOJIS: Record<number, string> = {
  1: "😴", 2: "😕", 3: "😊", 4: "😄", 5: "🤩"
};
const MOOD_LABELS: Record<number, string> = {
  1: "Fatigué", 2: "Pas top", 3: "Ça va", 4: "En forme", 5: "Super !"
};
const MOOD_COLORS: Record<number, string> = {
  1: "bg-slate-100 text-slate-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-green-100 text-green-700",
  5: "bg-violet-100 text-violet-700",
};

const DIFFICULTY_LABELS: Record<number, string> = { 1: "Facile", 2: "Moyen", 3: "Difficile" };

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 80, h = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-6">
      <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Per-game accuracy bar ────────────────────────────────────────────────────
function AccuracyBar({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? "from-green-400 to-emerald-500"
    : value >= 60 ? "from-yellow-400 to-orange-400"
      : "from-red-400 to-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 truncate max-w-[140px]">{label}</span>
        <span className="font-semibold text-gray-800 ml-2">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ─── Patient detail panel ─────────────────────────────────────────────────────
function PatientDetailPanel({
  patient,
  assignments,
  sessions,
  customConfigs,
  onBack,
  onAssign,
  onToggle,
  onDelete,
  deletingAssignment,
  patientAchievements,
}: {
  patient: Patient;
  assignments: Assignment[];
  sessions: Session[];
  customConfigs: CustomConfig[];
  onBack: () => void;
  onAssign: () => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  deletingAssignment: string | null;
  patientAchievements: PatientAchievement[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "errors" | "achievements">("overview");

  const weekSessions = sessions.filter(s => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(s.started_at) > weekAgo;
  });

  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / sessions.length)
    : 0;

  // Per-game stats
  const gameStats = assignments.map(a => {
    const gs = sessions.filter(s => s.game_id === a.game_id);
    const acc = gs.length > 0
      ? Math.round(gs.reduce((s, x) => s + (x.accuracy ?? 0), 0) / gs.length)
      : 0;
    const trend = gs.slice(-7).map(s => s.accuracy ?? 0);
    return { assignment: a, sessions: gs, accuracy: acc, trend };
  });

  // Mood distribution
  const moodSessions = sessions.filter(s => s.mood != null);
  const moodCounts: Record<number, number> = {};
  moodSessions.forEach(s => { moodCounts[s.mood!] = (moodCounts[s.mood!] || 0) + 1; });

  // Mood-accuracy correlation
  const moodAccuracy: Record<number, number[]> = {};
  sessions.filter(s => s.mood != null && s.accuracy != null).forEach(s => {
    if (!moodAccuracy[s.mood!]) moodAccuracy[s.mood!] = [];
    moodAccuracy[s.mood!].push(s.accuracy!);
  });

  // All errors with full context
  const allErrors = sessions
    .filter(s => s.mistakes && s.mistakes.length > 0)
    .flatMap(s => (s.mistakes || []).map(m => ({ ...m, game: s.games.name, date: s.started_at })));

  // Enriched error grouping: group by game + item + expected + got
  type ErrorEntry = { item: string; expected: string; got: string; game: string; count: number; lastDate: string };
  const errorMap = new Map<string, ErrorEntry>();
  allErrors.forEach(e => {
    const key = `${e.game}||${e.item}||${e.expected}||${e.got}`;
    const existing = errorMap.get(key);
    if (existing) {
      existing.count += 1;
      if (e.date > existing.lastDate) existing.lastDate = e.date;
    } else {
      errorMap.set(key, { item: e.item, expected: e.expected, got: e.got, game: e.game, count: 1, lastDate: e.date });
    }
  });
  const enrichedErrors = Array.from(errorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
      </div>

      <div className="relative bg-gradient-to-r from-gray-900 via-violet-900 to-indigo-950 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-4xl font-black shadow-inner">
              {patient.first_name[0]}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h2 className="text-4xl font-black tracking-tight">{patient.first_name}</h2>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  Patient actif
                </div>
              </div>
              <p className="text-violet-100/70 text-lg mt-1 font-medium italic">
                {patient.age} ans · {patient.goals.length > 0 ? patient.goals.join(", ") : "Bilans en cours"}
              </p>
              <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${patient.parent_id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-orange-500/20 text-orange-300 border border-orange-500/30"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${patient.parent_id ? "bg-emerald-400" : "bg-orange-400"} animate-pulse`} />
                  {patient.parent_id ? "Compte parent associé" : "Liaison parent en attente"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const win = window.open('', '_blank');
                win?.document.write(`
                           <html>
                               <head>
                                   <title>Bilan_Oralyses_${patient.first_name}</title>
                                   <style>
                                       body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
                                       .header { display: flex; justify-content: space-between; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 40px; }
                                       .title { color: #8b5cf6; margin: 0; font-size: 28px; font-weight: 800; }
                                       .section { margin-bottom: 40px; }
                                       .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #111827; border-left: 4px solid #fb923c; padding-left: 12px; }
                                       .stats-grid { display: flex; gap: 20px; margin-bottom: 20px; }
                                       .stat-card { background: #f3f4f6; padding: 20px; border-radius: 16px; flex: 1; border: 1px solid #e5e7eb; }
                                       .stat-val { font-size: 24px; font-weight: 800; color: #8b5cf6; margin-bottom: 4px; }
                                       .stat-lbl { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                                       table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
                                       th { text-align: left; background: #f9fafb; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
                                       td { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
                                       tr:last-child td { border-bottom: none; }
                                       .footer { margin-top: 60px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 30px; }
                                   </style>
                               </head>
                               <body>
                                   <div class="header">
                                       <div>
                                           <h1 class="title">Bilan de Progression</h1>
                                           <p style="font-size: 18px; margin-top: 8px;">Patient : <strong>${patient.first_name}</strong> · ${patient.age} ans</p>
                                       </div>
                                       <div style="text-align: right">
                                           <p style="font-weight: 700; color: #F28C6F; font-size: 20px; margin: 0;">Oralyses</p>
                                           <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">Le ${new Date().toLocaleDateString('fr-FR')}</p>
                                       </div>
                                   </div>
                                   <div class="section">
                                       <div class="section-title">Indicateurs Clés</div>
                                       <div class="stats-grid">
                                           <div class="stat-card"><div class="stat-val">${sessions.length}</div><div class="stat-lbl">Séances Jouées</div></div>
                                           <div class="stat-card"><div class="stat-val">${avgAccuracy}%</div><div class="stat-lbl">Précision Moyenne</div></div>
                                           <div class="stat-card"><div class="stat-val">${patient.stars_total}</div><div class="stat-lbl">Étoiles Obtenues</div></div>
                                           <div class="stat-card"><div class="stat-val">${patient.streak_current}j</div><div class="stat-lbl">Série Actuelle</div></div>
                                       </div>
                                   </div>
                                   <div class="section">
                                       <div class="section-title">Analyse par Objectif Thérapeutique</div>
                                       <table>
                                           <thead>
                                               <tr><th>Exercice</th><th>Catégorie</th><th>Succès Moy.</th><th>Sessions</th></tr>
                                           </thead>
                                           <tbody>
                                               ${gameStats.map(gs => `
                                                   <tr>
                                                       <td style="font-weight: 600;">${gs.assignment.games.name}</td>
                                                       <td style="color: #6b7280;">${gs.assignment.games.category}</td>
                                                       <td style="font-weight: 700; color: ${gs.accuracy >= 80 ? '#10b981' : gs.accuracy >= 50 ? '#f59e0b' : '#ef4444'}">${gs.accuracy}%</td>
                                                       <td>${gs.sessions.length}</td>
                                                   </tr>
                                               `).join('')}
                                           </tbody>
                                       </table>
                                   </div>
                                   <div class="footer">
                                       <p>Ce document est un relevé d'activité généré par l'application Speech Play.</p>
                                       <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} Speech Play - Orthophonie Numérique</p>
                                   </div>
                                   <script>
                                       window.onload = () => {
                                           window.print();
                                           setTimeout(() => window.close(), 500);
                                       };
                                   </script>
                               </body>
                           </html>
                       `);
                win?.document.close();
              }}
              className="h-12 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold transition-all hover:scale-105 active:scale-95 group border cursor-pointer">
              <FileText className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Bilan PDF Clinique
            </Button>
            <Button onClick={onAssign}
              className="h-12 px-6 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-extrabold shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95 border-none">
              <Plus className="w-4 h-4 mr-2" /> Assigner un jeu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Star className="w-5 h-5 text-yellow-300" />, val: patient.stars_total, lbl: "Étoiles cumulées", color: "bg-yellow-400/10" },
            { icon: <Flame className="w-5 h-5 text-orange-400" />, val: `${patient.streak_current}j`, lbl: "Série d'assiduité", color: "bg-orange-400/10" },
            { icon: <Target className="w-5 h-5 text-emerald-400" />, val: `${avgAccuracy}%`, lbl: "Précision moyenne", color: "bg-emerald-400/10" },
            { icon: <Activity className="w-5 h-5 text-blue-400" />, val: weekSessions.length, lbl: "Sessions / 7j", color: "bg-blue-400/10" },
          ].map((s, i) => (
            <div key={i} className={`${s.color} backdrop-blur-md rounded-3xl p-5 border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors`}>
              <div className="mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
              <div className="text-2xl font-black leading-none">{s.val}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-60 mt-2">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(["overview", "sessions", "errors", "achievements"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "overview" && "📋 Jeux"}
            {t === "sessions" && "📅 Sess."}
            {t === "errors" && "⚠️ Erreurs"}
            {t === "achievements" && "🏆 Succès"}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Assignments with stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-violet-500" /> Jeux assignés
            </h3>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                <p className="text-sm">Aucun jeu assigné</p>
              </div>
            ) : (
              gameStats.map(({ assignment: a, sessions: gs, accuracy, trend }) => {
                const cfgName = a.custom_config_id
                  ? customConfigs.find(c => c.id === a.custom_config_id)?.name
                  : null;
                return (
                  <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm flex items-center gap-2 ${a.active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                            <span>{ALL_GAMES_INFO.find(g => g.slug === a.games.slug)?.emoji || "🎮"}</span>
                            {cfgName ? `✨ ${cfgName}` : a.games.name}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                            {DIFFICULTY_LABELS[a.difficulty_level]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {gs.length} sessions
                          </span>
                        </div>
                        {gs.length > 0 && (
                          <div className="mt-2">
                            <AccuracyBar value={accuracy} label="Précision moy." />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {trend.length >= 2 && (
                          <Sparkline values={trend} />
                        )}
                        <button onClick={() => onToggle(a.id, a.active)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={a.active ? "Désactiver" : "Activer"}>
                          {a.active
                            ? <ToggleRight className="w-5 h-5 text-violet-500" />
                            : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button onClick={() => onDelete(a.id)} disabled={deletingAssignment === a.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mood section */}
          {moodSessions.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">😊</span> Baromètre d&apos;humeur
              </h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(m => {
                  const cnt = moodCounts[m] ?? 0;
                  const acc = moodAccuracy[m]
                    ? Math.round(moodAccuracy[m].reduce((a, v) => a + v, 0) / moodAccuracy[m].length)
                    : null;
                  return (
                    <div key={m} className={`flex-1 rounded-xl p-2 text-center ${cnt > 0 ? MOOD_COLORS[m] : "bg-gray-50"}`}>
                      <div className="text-xl mb-0.5">{MOOD_EMOJIS[m]}</div>
                      <div className="text-xs font-bold">{cnt}</div>
                      {acc !== null && <div className="text-xs opacity-70">{acc}%</div>}
                    </div>
                  );
                })}
              </div>
              {moodSessions.length >= 3 && (
                <p className="text-xs text-gray-500">
                  Le chiffre en bas de chaque humeur = précision moy. lors de ces sessions.
                </p>
              )}
            </div>
          )}

          {/* Alert: low accuracy */}
          {weekSessions.some(s => s.accuracy !== null && s.accuracy < 60) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Difficultés détectées cette semaine</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Certaines sessions ont une précision &lt; 60%. Pensez à réviser le niveau ou le contenu.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions tab */}
      {activeTab === "sessions" && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune session jouée</p>
            </div>
          ) : (
            sessions.slice(0, 40).map(s => (
              <div key={s.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                {s.mood != null ? (
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${MOOD_COLORS[s.mood]}`}>
                    {MOOD_EMOJIS[s.mood]}
                  </span>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ALL_GAMES_INFO.find(g => g.slug === (s.games.slug || ""))?.emoji || "🎮"}</span>
                    <p className="text-sm font-medium text-gray-900 truncate">{s.games.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">
                      {new Date(s.started_at).toLocaleDateString("fr-FR", {
                        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {s.duration_seconds && (
                      <span className="text-xs text-gray-400">· {Math.round(s.duration_seconds / 60)} min</span>
                    )}
                    {s.mood != null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${MOOD_COLORS[s.mood]}`}>
                        {MOOD_LABELS[s.mood]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < s.stars_earned ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  {s.accuracy !== null && (
                    <span className={`text-xs font-bold ${s.accuracy >= 80 ? "text-green-600" : s.accuracy >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                      {s.accuracy}%
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Errors tab */}
      {activeTab === "errors" && (
        <div className="space-y-3">
          {enrichedErrors.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune erreur enregistrée 🎉</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Erreurs les plus fréquentes — classées par nombre d&apos;occurrences</p>
              {enrichedErrors.map((err, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">{err.game}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(err.lastDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${err.count >= 5 ? "bg-red-100 text-red-700" : err.count >= 3 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                      ×{err.count}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">📝 {err.item}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px] font-bold">✓</span>
                      <span className="text-gray-500">Réponse attendue :</span>
                      <span className="font-semibold text-green-700">{err.expected}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold">✗</span>
                      <span className="text-gray-500">L&apos;enfant a répondu :</span>
                      <span className="font-semibold text-red-600">{err.got}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Achievements tab */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-2 gap-3">
          {patientAchievements.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun succès débloqué pour le moment</p>
            </div>
          ) : (
            patientAchievements.map((ua) => (
              <div key={ua.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-2xl mb-2 shadow-inner">
                  {ua.achievements.icon === 'Award' && '🏆'}
                  {ua.achievements.icon === 'Star' && '⭐'}
                  {ua.achievements.icon === 'Flame' && '🔥'}
                  {ua.achievements.icon === 'Target' && '🎯'}
                  {ua.achievements.icon === 'Activity' && '⚡'}
                </div>
                <h4 className="font-bold text-gray-900 text-xs leading-tight">{ua.achievements.name}</h4>
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">{ua.achievements.description}</p>
                <div className="mt-2 text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  Le {new Date(ua.unlocked_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main DashboardClient ─────────────────────────────────────────────────────
export function DashboardClient({
  profile,
  patients,
  games,
  assignments,
  sessions,
  customConfigs = [],
  patientAchievements = [],
}: {
  profile: Profile;
  patients: Patient[];
  games: Game[];
  assignments: Assignment[];
  sessions: Session[];
  customConfigs?: CustomConfig[];
  patientAchievements?: PatientAchievement[];
}) {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGoals, setNewPatientGoals] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("1");
  const [loading, setLoading] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Stats
  const activePatients = patients.filter(p => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return p.last_played_at && new Date(p.last_played_at) > lastWeek;
  }).length;

  const thisWeekSessions = sessions.filter(s => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new Date(s.started_at) > lastWeek;
  });

  /* Duration removed per user request */

  const completionRate = patients.length > 0
    ? Math.round((activePatients / patients.length) * 100) : 0;

  const avgAccuracyAll = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / sessions.length)
    : 0;

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("patients").insert({
      therapist_id: profile.id,
      first_name: newPatientName,
      age: parseInt(newPatientAge),
      goals: newPatientGoals,
    });
    if (error) {
      toast.error("Erreur lors de l'ajout du patient");
    } else {
      toast.success("Patient ajouté !");
      setNewPatientName(""); setNewPatientAge(""); setNewPatientGoals([]);
      setShowAddPatient(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAssignGame(patientId: string) {
    if (!selectedGame) return;
    setLoading(true);
    const customConfig = customConfigs.find(c => `custom:${c.id}` === selectedGame);
    const gameId = customConfig ? customConfig.game_id : selectedGame;
    const { error } = await supabase.from("assignments").insert({
      patient_id: patientId,
      game_id: gameId,
      therapist_id: profile.id,
      difficulty_level: parseInt(selectedDifficulty),
      custom_config_id: customConfig ? customConfig.id : null,
      custom_config: customConfig ? customConfig.config : null,
    });
    if (error) {
      toast.error("Erreur lors de l'assignation");
    } else {
      toast.success("Jeu assigné !");
      setShowAssign(null);
      setSelectedGame("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleToggleAssignment(assignmentId: string, currentActive: boolean) {
    const { error } = await supabase.from("assignments").update({ active: !currentActive }).eq("id", assignmentId);
    if (error) toast.error("Erreur");
    else { toast.success(currentActive ? "Jeu désactivé" : "Jeu activé"); router.refresh(); }
  }

  async function handleDeleteAssignment(assignmentId: string) {
    setDeletingAssignment(assignmentId);
    const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
    if (error) toast.error("Erreur lors de la suppression");
    else { toast.success("Assignation supprimée"); router.refresh(); }
    setDeletingAssignment(null);
  }

  function copyLinkCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Code copié !");
  }

  const goalOptions = ["articulation", "vocabulaire", "comprehension", "lecture", "langage oral"];
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-orange-400 to-violet-500 p-1.5 rounded-xl group-hover:rotate-6 transition-transform">
              <OralysesLogo size={28} />
            </div>
            <span className="font-black text-2xl tracking-tight text-gray-900">Oralyses</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">{profile.full_name}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">Pro Expert</span>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <Link href="/cabinet"><Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm"><Building2 className="w-4 h-4 text-gray-500" /></Button></Link>
              <Link href="/profil"><Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm"><User className="w-4 h-4 text-gray-500" /></Button></Link>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm text-red-400 hover:text-red-500" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {profile.full_name.split(" ")[0]} 👋</h1>
          <p className="text-gray-500">Le tableau de bord</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <Users className="w-5 h-5" />, val: patients.length, lbl: "Patients suivis", sub: "Actif & Cabinet", color: "from-violet-500 to-indigo-500" },
            { icon: <TrendingUp className="w-5 h-5" />, val: `${completionRate}%`, lbl: "Taux d'activité", sub: "Semaine en cours", color: "from-emerald-500 to-teal-500" },
            { icon: <BarChart3 className="w-5 h-5" />, val: `${avgAccuracyAll}%`, lbl: "Réussite globale", sub: "Précision moyenne", color: "from-orange-400 to-pink-500" },
            { icon: <Activity className="w-5 h-5" />, val: thisWeekSessions.length, lbl: "Sessions (7j)", sub: "Volume d'activité", color: "from-blue-500 to-cyan-500" },
          ].map((s, i) => (
            <div key={i} className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-[0.03] rounded-bl-full group-hover:scale-125 transition-transform`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-200`}>
                {s.icon}
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tight">{s.val}</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{s.lbl}</div>
              <div className="text-xs font-medium text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="patients"><Users className="w-4 h-4 mr-1" /> Patients</TabsTrigger>
            <TabsTrigger value="jeux"><Gamepad2 className="w-4 h-4 mr-1" /> Mes Jeux</TabsTrigger>
            <TabsTrigger value="activite"><BarChart3 className="w-4 h-4 mr-1" /> Activité</TabsTrigger>
          </TabsList>

          {/* ── Patients tab ───────────────────────────────────────────────── */}
          <TabsContent value="patients" className="space-y-4">
            {selectedPatient ? (
              /* Patient detail view */
              <PatientDetailPanel
                patient={selectedPatient}
                assignments={assignments.filter(a => a.patient_id === selectedPatient.id)}
                sessions={sessions.filter(s => s.patient_id === selectedPatient.id)}
                customConfigs={customConfigs}
                onBack={() => setSelectedPatientId(null)}
                onAssign={() => setShowAssign(selectedPatient.id)}
                onToggle={handleToggleAssignment}
                onDelete={handleDeleteAssignment}
                deletingAssignment={deletingAssignment}
                patientAchievements={patientAchievements.filter(a => a.patient_id === selectedPatient.id)}
              />
            ) : (
              /* Patient list */
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Mes patients</h2>
                  <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                        <Plus className="w-4 h-4 mr-1" /> Ajouter un patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Nouveau patient</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddPatient} className="space-y-4">
                        <div>
                          <Label>Prénom</Label>
                          <Input value={newPatientName} onChange={e => setNewPatientName(e.target.value)}
                            placeholder="Prénom de l'enfant" required className="mt-1" />
                        </div>
                        <div>
                          <Label>Âge</Label>
                          <Input type="number" min={2} max={15} value={newPatientAge}
                            onChange={e => setNewPatientAge(e.target.value)} placeholder="Âge" required className="mt-1" />
                        </div>
                        <div>
                          <Label>Objectifs thérapeutiques</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {goalOptions.map(goal => (
                              <button key={goal} type="button"
                                onClick={() => setNewPatientGoals(prev =>
                                  prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${newPatientGoals.includes(goal)
                                  ? "bg-violet-100 border-violet-300 text-violet-700"
                                  : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                                {goal}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button type="submit" disabled={loading}
                          className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                          {loading ? "Ajout..." : "Ajouter"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {patients.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun patient</h3>
                    <p className="text-gray-500 text-sm">Ajoutez votre premier patient pour commencer</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {patients.map(patient => {
                      const patientAssignments = assignments.filter(a => a.patient_id === patient.id);
                      const patientSessions = sessions.filter(s => s.patient_id === patient.id);
                      const weekSessions = patientSessions.filter(s => {
                        const lastWeek = new Date();
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        return new Date(s.started_at) > lastWeek;
                      });
                      const avgAcc = patientSessions.length > 0
                        ? Math.round(patientSessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / patientSessions.length)
                        : null;
                      const lastSession = patientSessions[0];
                      const hasStruggle = weekSessions.some(s => s.accuracy !== null && s.accuracy < 60);

                      return (
                        <button key={patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="text-left bg-white rounded-xl p-5 border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white font-bold text-lg">
                                {patient.first_name[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{patient.first_name}</p>
                                <p className="text-xs text-gray-400">{patient.age} ans</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition mt-1" />
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {patient.stars_total}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Flame className={`w-3 h-3 ${patient.streak_current > 0 ? "text-orange-500" : "text-gray-300"}`} />
                              {patient.streak_current}j
                            </div>
                            {avgAcc !== null && (
                              <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${avgAcc >= 80 ? "bg-green-100 text-green-700" : avgAcc >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {avgAcc}% précision
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>
                              {weekSessions.length} session{weekSessions.length > 1 ? "s" : ""} cette sem.
                            </span>
                            <div className="flex items-center gap-2">
                              {hasStruggle && (
                                <span title="Difficultés détectées">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                              {!patient.parent_id && (
                                <span className="text-amber-500">Pas de parent</span>
                              )}
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded-full">
                                {patientAssignments.filter(a => a.active).length} jeu{patientAssignments.filter(a => a.active).length > 1 ? "x" : ""}
                              </span>
                            </div>
                          </div>

                          {lastSession && (
                            <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
                              Dernière session : {new Date(lastSession.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              {lastSession.mood != null && ` ${MOOD_EMOJIS[lastSession.mood]}`}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Assign dialog (from list) */}
                <Dialog open={showAssign !== null && selectedPatient === undefined}
                  onOpenChange={open => !open && setShowAssign(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assigner un jeu à {patients.find(p => p.id === showAssign)?.first_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Jeu</Label>
                        <Select value={selectedGame} onValueChange={setSelectedGame}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un jeu" /></SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Jeux standards</div>
                            {games.map(game => <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>)}
                            {customConfigs.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-semibold text-violet-500 uppercase tracking-wide mt-1 border-t">Mes configurations</div>
                                {customConfigs.map(cfg => (
                                  <SelectItem key={cfg.id} value={`custom:${cfg.id}`}>✨ {cfg.name}</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Difficulté</Label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Facile</SelectItem>
                            <SelectItem value="2">Moyen</SelectItem>
                            <SelectItem value="3">Difficile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => handleAssignGame(showAssign!)}
                        disabled={loading || !selectedGame}
                        className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                        {loading ? "Assignation..." : "Assigner"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Assign dialog (from detail panel) */}
            {selectedPatient && (
              <Dialog open={showAssign === selectedPatient.id} onOpenChange={open => !open && setShowAssign(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assigner un jeu à {selectedPatient.first_name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Jeu</Label>
                      <Select value={selectedGame} onValueChange={setSelectedGame}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un jeu" /></SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Jeux standards</div>
                          {games.map(game => <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>)}
                          {customConfigs.length > 0 && (
                            <>
                              <div className="px-2 py-1 text-xs font-semibold text-violet-500 uppercase tracking-wide mt-1 border-t">Mes configurations</div>
                              {customConfigs.map(cfg => (
                                <SelectItem key={cfg.id} value={`custom:${cfg.id}`}>✨ {cfg.name}</SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulté</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Facile</SelectItem>
                          <SelectItem value="2">Moyen</SelectItem>
                          <SelectItem value="3">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => handleAssignGame(selectedPatient.id)}
                      disabled={loading || !selectedGame}
                      className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                      {loading ? "Assignation..." : "Assigner"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* ── Jeux tab ───────────────────────────────────────────────────── */}
          <TabsContent value="jeux" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <GameEditor
                games={games}
                therapistId={profile.id}
                existingConfigs={customConfigs}
                onConfigSaved={() => router.refresh()}
              />
            </div>

            {/* ── Catalogue complet des jeux ──────────────────────────────── */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tous les jeux disponibles</h3>
              <p className="text-sm text-gray-500 mb-4">Cliquez sur un jeu pour découvrir son objectif thérapeutique et comment il fonctionne.</p>
              <GamesLibrary games={games} />
            </div>
          </TabsContent>

          {/* ── Activité tab ──────────────────────────────────────────────── */}
          <TabsContent value="activite" className="space-y-4">
            <ActivityTab patients={patients} sessions={sessions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── ActivityTab ──────────────────────────────────────────────────────────────
function ActivityTab({
  patients,
  sessions,
}: {
  patients: Patient[];
  sessions: Session[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const MOOD_EMOJIS_LOCAL: Record<number, string> = { 1: "😴", 2: "😕", 3: "😊", 4: "😄", 5: "🤩" };
  const MOOD_LABELS_LOCAL: Record<number, string> = { 1: "Fatigué", 2: "Pas top", 3: "Ça va", 4: "En forme", 5: "Super !" };

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun patient</h3>
        <p className="text-gray-500 text-sm">Ajoutez des patients pour voir leur activité ici</p>
      </div>
    );
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const filteredSessions = selectedPatientId
    ? sessions.filter(s => s.patient_id === selectedPatientId)
    : [];

  return (
    <div className="space-y-4">
      {/* Patient selector */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" /> Activité par patient
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {patients.map(p => {
            const patientSessions = sessions.filter(s => s.patient_id === p.id);
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const weekCount = patientSessions.filter(s => new Date(s.started_at) > lastWeek).length;
            const isSelected = selectedPatientId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(isSelected ? null : p.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full border-2 transition-all duration-300 ${isSelected
                  ? "border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-200"
                  : "border-gray-100 bg-white text-gray-600 hover:border-violet-200 hover:bg-violet-50/30"
                  }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"}`}>
                  {p.first_name[0]}
                </div>
                <span className="font-bold text-sm">{p.first_name}</span>
                {weekCount > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20" : "bg-violet-100 text-violet-600"}`}>
                    +{weekCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions du patient sélectionné */}
      {selectedPatient && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Sessions de {selectedPatient.first_name}
              <span className="ml-2 text-sm font-normal text-gray-400">({filteredSessions.length} au total)</span>
            </h3>
            <button
              onClick={() => setSelectedPatientId(null)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Fermer
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Aucune session enregistrée pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 pb-4 pt-1">
              {filteredSessions.slice(0, 50).map(session => (
                <SessionItem key={session.id} session={session} moodEmojis={MOOD_EMOJIS_LOCAL} moodLabels={MOOD_LABELS_LOCAL} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionItem({
  session,
  moodEmojis,
  moodLabels
}: {
  session: Session;
  moodEmojis: Record<number, string>;
  moodLabels: Record<number, string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMistakes = session.mistakes && session.mistakes.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] border border-gray-100 overflow-hidden transition-all hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 group">
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {session.mood != null ? (
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform" title={moodLabels[session.mood]}>
              {moodEmojis[session.mood]}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-gray-900">{session.games?.name || "Jeu"}</p>
              <div className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${session.accuracy != null && session.accuracy >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
                {session.accuracy}%
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {new Date(session.started_at).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50 bg-gray-50/30">
          {hasMistakes ? (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Détails des erreurs
              </p>
              <div className="grid gap-2">
                {session.mistakes?.map((m, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-xs">
                    <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                      {m.item}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-500">Attendu :</span>
                        <span className="font-medium text-gray-700">{m.expected}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 font-bold">✗</span>
                        <span className="text-gray-500">Réponse :</span>
                        <span className="font-medium text-gray-700">{m.got}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center py-2">
              <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-green-600" /> Session parfaite, aucune erreur !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GamesLibrary ─────────────────────────────────────────────────────────────
const ALL_GAMES_INFO = [
  // ─── Prononciation ───────────────────────────────────
  { slug: "virelangues", name: "Virelangues Rigolos", category: "prononciation", emoji: "👅", desc: "Répéter des phrases complexes pour améliorer l'articulation rapide.", color: "bg-rose-50 border-rose-200" },
  { slug: "souffle-plume", name: "Souffle sur la Plume", category: "prononciation", emoji: "🪶", desc: "Contrôler son souffle pour renforcer les muscles buccaux.", color: "bg-rose-50 border-rose-200" },
  { slug: "miroir-grimaces", name: "Miroir des Grimaces", category: "prononciation", emoji: "🪞", desc: "Imiter des expressions pour travailler les praxies bucco-faciales.", color: "bg-rose-50 border-rose-200" },
  { slug: "amuz-bouch", name: "Amuz'Bouch", category: "prononciation", emoji: "👄", desc: "Exercices ludiques de motricité bucco-maxillaire.", color: "bg-rose-50 border-rose-200" },
  { slug: "sons-animaux", name: "Sons des Animaux", category: "prononciation", emoji: "🦁", desc: "Discrimination auditive et reproduction de cris d'animaux.", color: "bg-rose-50 border-rose-200" },
  { slug: "serpent-siffleur", name: "Serpent Siffleur", category: "prononciation", emoji: "🐍", desc: "Éviter les obstacles en articulant des sons continus (s, ch, j).", color: "bg-rose-50 border-rose-200" },

  // ─── Articulation ─────────────────────────────────────
  { slug: "attrape-les-sons", name: "Attrape les Sons", category: "articulation", emoji: "🎯", desc: "Identifier si un mot contient un son cible dans différentes positions.", color: "bg-orange-50 border-orange-200" },
  { slug: "prononcio", name: "Prononcio", category: "articulation", emoji: "📣", desc: "Entraînement intensif sur des paires de sons proches (s/ch, f/v, r/l).", color: "bg-orange-50 border-orange-200" },
  { slug: "chiffon-cochon", name: "Chiffon le Cochon", category: "articulation", emoji: "🐷", desc: "Focus sur les sons /ch/ et /f/ à travers des histoires interactives.", color: "bg-orange-50 border-orange-200" },
  { slug: "jean-geant", name: "Jean le Géant", category: "articulation", emoji: "👹", desc: "Focus sur les sons /j/ et /g/ pour la fluidité articulatoire.", color: "bg-orange-50 border-orange-200" },
  { slug: "telephones-chuchoteurs", name: "Tél. Chuchoteurs", category: "articulation", emoji: "📞", desc: "S'écouter parler pour auto-corriger sa prononciation.", color: "bg-orange-50 border-orange-200" },

  // ─── Vocabulaire ──────────────────────────────────────
  { slug: "memory-vocabulaire", name: "Memory Vocabulaire", category: "vocabulaire", emoji: "🧠", desc: "Associer mots et images pour enrichir le lexique thématique.", color: "bg-blue-50 border-blue-200" },
  { slug: "boite-surprises", name: "Boîte à Surprises", category: "vocabulaire", emoji: "🎁", desc: "Décrire des objets cachés pour travailler les champs lexicaux.", color: "bg-blue-50 border-blue-200" },
  { slug: "mimes-actions", name: "Mimes d'Actions", category: "vocabulaire", emoji: "🏃", desc: "Reconnaître et nommer des verbes d'action variés.", color: "bg-blue-50 border-blue-200" },
  { slug: "devinettes-objets", name: "Devinettes Objets", category: "vocabulaire", emoji: "🔍", desc: "Travailler les adjectifs et les définitions par l'énigme.", color: "bg-blue-50 border-blue-200" },
  { slug: "de-premiers-mots", name: "Dé des Premiers Mots", category: "vocabulaire", emoji: "🎲", desc: "Stimulation précoce du langage par le jeu de hasard.", color: "bg-blue-50 border-blue-200" },
  { slug: "loto-pronoms", name: "Loto des Pronoms", category: "vocabulaire", emoji: "👥", desc: "Maîtriser l'usage des pronoms il/elle et ils/elles.", color: "bg-blue-50 border-blue-200" },
  { slug: "memory-contraires", name: "Memory Contraires", category: "vocabulaire", emoji: "↔️", desc: "Associer des antonymes pour structurer le lexique.", color: "bg-blue-50 border-blue-200" },
  { slug: "supermarche", name: "Le Supermarché", category: "vocabulaire", emoji: "🛒", desc: "Catégorisation sémantique des articles de consommation.", color: "bg-blue-50 border-blue-200" },

  // ─── Phonologie ───────────────────────────────────────
  { slug: "train-des-syllabes", name: "Train des Syllabes", category: "phonologie", emoji: "🚂", desc: "Compter et segmenter les syllabes des mots.", color: "bg-amber-50 border-amber-200" },
  { slug: "peche-aux-rimes", name: "Pêche aux Rimes", category: "phonologie", emoji: "🎣", desc: "Identifier les sons finaux identiques entre les mots.", color: "bg-amber-50 border-amber-200" },
  { slug: "bizarre-bizarre", name: "Bizarre, Bizarre !", category: "phonologie", emoji: "🤪", desc: "Travailler les sons complexes comme /k/, /g/, /n/.", color: "bg-amber-50 border-amber-200" },
  { slug: "langue-au-chat", name: "Langue au Chat", category: "phonologie", emoji: "🐱", desc: "Répondre à des questions complexes en articulant.", color: "bg-amber-50 border-amber-200" },

  // ─── Compréhension ────────────────────────────────────
  { slug: "simon-dit", name: "Simon Dit", category: "compréhension", emoji: "👂", desc: "Suivre des consignes orales de complexité croissante.", color: "bg-indigo-50 border-indigo-200" },
  { slug: "qui-est-ce", name: "Qui est-ce ?", category: "compréhension", emoji: "🕵️", desc: "Utiliser l'inférence pour trouver un personnage mystère.", color: "bg-indigo-50 border-indigo-200" },

  // ─── Syntaxe & Grammaire ─────────────────────────────
  { slug: "architecte-des-phrases", name: "Arch. des Phrases", category: "syntaxe", emoji: "🏗️", desc: "Structurer des phrases (sujet-verbe-complément).", color: "bg-purple-50 border-purple-200" },
  { slug: "spirale-pronoms", name: "Spirale des Pronoms", category: "grammaire", emoji: "🌀", desc: "Utilisation fluide des pronoms en contexte de jeu.", color: "bg-pink-50 border-pink-200" },
  { slug: "conjugueur-fou", name: "Conjugueur Fou", category: "grammaire", emoji: "⚡", desc: "Maîtriser les terminaisons verbales de base.", color: "bg-pink-50 border-pink-200" },
  { slug: "course-des-accords", name: "Course des Accords", category: "grammaire", emoji: "🏁", desc: "Accorder les adjectifs en genre et en nombre.", color: "bg-pink-50 border-pink-200" },
  { slug: "train-des-natures", name: "Train des Natures", category: "grammaire", emoji: "🚃", desc: "Identifier les classes grammaticales (nom, verbe...).", color: "bg-pink-50 border-pink-200" },
  { slug: "tapis-volant-du-temps", name: "Tapis du Temps", category: "grammaire", emoji: "🪄", desc: "Distinguer passé, présent et futur.", color: "bg-pink-50 border-pink-200" },

  // ─── Lecture & Orthographe ───────────────────────────
  { slug: "lecteur-flash", name: "Lecteur Flash", category: "lecture", emoji: "⚡", desc: "Reconnaissance visuelle rapide de mots cibles.", color: "bg-yellow-50 border-yellow-200" },
  { slug: "mot-troue", name: "Le Mot Troué", category: "orthographe", emoji: "✏️", desc: "Compléter l'orthographe lexicale et grammaticale.", color: "bg-yellow-50 border-yellow-200" },
  { slug: "tri-lettres", name: "Tri des Lettres", category: "lecture", emoji: "🔤", desc: "Reconnaissance des lettres et sons initiaux.", color: "bg-yellow-50 border-yellow-200" },

  // ─── Langage Oral & Transfert ────────────────────────
  { slug: "bulles-mots", name: "Bulles de Mots", category: "oral", emoji: "🧼", desc: "Prononciation rythmée en coordonnant le souffle.", color: "bg-teal-50 border-teal-200" },
  { slug: "histoires-libres", name: "Histoires Libres", category: "oral", emoji: "📖", desc: "Raconter une histoire pour transférer les acquis en parole spontanée.", color: "bg-teal-50 border-teal-200" },

  // ─── Autre ───────────────────────────────────────────
  { slug: "compte-est-bon", name: "Le Compte est Bon", category: "numération", emoji: "🔢", desc: "Calcul mental et manipulation des nombres.", color: "bg-slate-50 border-slate-200" },
];

const CATEGORY_BADGE: Record<string, string> = {
  prononciation: "bg-rose-100 text-rose-700",
  articulation: "bg-orange-100 text-orange-700",
  vocabulaire: "bg-blue-100 text-blue-700",
  phonologie: "bg-amber-100 text-amber-700",
  compréhension: "bg-indigo-100 text-indigo-700",
  syntaxe: "bg-purple-100 text-purple-700",
  grammaire: "bg-pink-100 text-pink-700",
  lecture: "bg-yellow-100 text-yellow-700",
  orthographe: "bg-yellow-100 text-yellow-700",
  oral: "bg-teal-100 text-teal-700",
  numération: "bg-slate-100 text-slate-700",
};

function GamesLibrary({ games }: { games: Game[] }) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_GAMES_INFO.map(info => {
        const isExpanded = expandedSlug === info.slug;
        const inDb = games.some(g => g.slug === info.slug);
        return (
          <button
            key={info.slug}
            onClick={() => setExpandedSlug(isExpanded ? null : info.slug)}
            className={`text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${info.color} ${isExpanded ? "shadow-md" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{info.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{info.name}</p>
                  {!inDb && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">Bientôt</span>
                  )}
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${CATEGORY_BADGE[info.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {info.category}
                </span>
                {isExpanded && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{info.desc}</p>
                )}
                {!isExpanded && (
                  <p className="text-xs text-gray-400 mt-1">Cliquer pour voir le détail →</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
