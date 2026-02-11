"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Play,
  Star,
  Flame,
  Calendar,
  LogOut,
  Link2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  first_name: string;
  age: number;
  stars_total: number;
  streak_current: number;
  streak_best: number;
  last_played_at: string | null;
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
  started_at: string;
  duration_seconds: number | null;
  stars_earned: number;
  score: number;
  accuracy: number | null;
  games: { name: string; category: string };
}

export function ParentClient({
  profile,
  patients,
  assignments,
  sessions,
}: {
  profile: { id: string; full_name: string };
  patients: Patient[];
  assignments: Assignment[];
  sessions: Session[];
}) {
  const [linkCode, setLinkCode] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLinkChild(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .update({ parent_id: profile.id })
      .eq("link_code", linkCode.trim())
      .is("parent_id", null)
      .select()
      .single();

    if (error || !data) {
      toast.error("Code invalide ou enfant deja lie");
    } else {
      toast.success(`${data.first_name} est maintenant lie a votre compte !`);
      setShowLink(false);
      setLinkCode("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Today check
  const today = new Date().toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Speech Play</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {patients.length === 0 ? (
          /* No child linked */
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Liez le compte de votre enfant
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Demandez le code de liaison a l&apos;orthophoniste de votre enfant
            </p>
            <Dialog open={showLink} onOpenChange={setShowLink}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                  Entrer le code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Code de liaison</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLinkChild} className="space-y-4">
                  <Input
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    placeholder="Ex: a1b2c3d4"
                    required
                    className="text-center text-lg tracking-widest"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                  >
                    {loading ? "Liaison..." : "Lier mon enfant"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          /* Child cards */
          patients.map((child) => {
            const childAssignments = assignments.filter(
              (a) => a.patient_id === child.id
            );
            const childSessions = sessions.filter(
              (s) => s.patient_id === child.id
            );
            const playedToday = childSessions.some(
              (s) => new Date(s.started_at).toDateString() === today
            );
            const weekSessions = childSessions.filter((s) => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(s.started_at) > weekAgo;
            });
            const weekGoal = 5; // sessions per week
            const weekProgress = Math.min(
              (weekSessions.length / weekGoal) * 100,
              100
            );

            return (
              <div key={child.id} className="space-y-4">
                {/* Child header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white text-xl font-bold">
                      {child.first_name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {child.first_name}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {child.stars_total}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame
                            className={`w-4 h-4 ${
                              child.streak_current > 0
                                ? "text-orange-500"
                                : "text-gray-300"
                            }`}
                          />
                          {child.streak_current}j
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">
                        Objectif hebdo : {weekSessions.length}/{weekGoal}{" "}
                        sessions
                      </span>
                      <span className="font-medium text-violet-600">
                        {Math.round(weekProgress)}%
                      </span>
                    </div>
                    <Progress value={weekProgress} className="h-3" />
                  </div>

                  {playedToday ? (
                    <div className="bg-green-50 rounded-lg p-3 text-center text-sm text-green-700">
                      Bravo ! Session du jour terminee
                    </div>
                  ) : (
                    childAssignments.length > 0 && (
                      <Link
                        href={`/play/${child.id}/${childAssignments[0].games.slug}?assignment=${childAssignments[0].id}&difficulty=${childAssignments[0].difficulty_level}`}
                      >
                        <Button className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white rounded-xl">
                          <Play className="w-6 h-6 mr-2" />
                          Jouer !
                        </Button>
                      </Link>
                    )
                  )}
                </div>

                {/* Assigned games */}
                {childAssignments.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-500" />
                      Jeux assignes
                    </h3>
                    <div className="space-y-2">
                      {childAssignments.map((a) => (
                        <Link
                          key={a.id}
                          href={`/play/${child.id}/${a.games.slug}?assignment=${a.id}&difficulty=${a.difficulty_level}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-violet-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {a.games.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Niveau {a.difficulty_level}
                            </p>
                          </div>
                          <Play className="w-5 h-5 text-violet-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session history */}
                {childSessions.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-500" />
                      Historique
                    </h3>
                    <div className="space-y-2">
                      {childSessions.slice(0, 10).map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {s.games.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(s.started_at).toLocaleDateString(
                                "fr-FR",
                                { day: "numeric", month: "short" }
                              )}
                              {s.duration_seconds &&
                                ` - ${Math.round(s.duration_seconds / 60)} min`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < s.stars_earned
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Link another child */}
        {patients.length > 0 && (
          <div className="mt-4 text-center">
            <Dialog open={showLink} onOpenChange={setShowLink}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Link2 className="w-4 h-4 mr-1" /> Lier un autre enfant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Code de liaison</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLinkChild} className="space-y-4">
                  <Input
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    placeholder="Ex: a1b2c3d4"
                    required
                    className="text-center text-lg tracking-widest"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                  >
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
