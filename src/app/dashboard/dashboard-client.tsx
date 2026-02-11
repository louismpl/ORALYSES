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
import {
  Sparkles,
  Plus,
  Users,
  BarChart3,
  Gamepad2,
  LogOut,
  Copy,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  last_played_at: string | null;
  created_at: string;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
}

interface Assignment {
  id: string;
  patient_id: string;
  game_id: string;
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
  games: { name: string; category: string };
}

export function DashboardClient({
  profile,
  patients,
  games,
  assignments,
  sessions,
}: {
  profile: Profile;
  patients: Patient[];
  games: Game[];
  assignments: Assignment[];
  sessions: Session[];
}) {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGoals, setNewPatientGoals] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("1");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Stats
  const activePatients = patients.filter((p) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return p.last_played_at && new Date(p.last_played_at) > lastWeek;
  }).length;

  const thisWeekSessions = sessions.filter((s) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new Date(s.started_at) > lastWeek;
  });

  const avgDuration =
    thisWeekSessions.length > 0
      ? Math.round(
          thisWeekSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) /
            thisWeekSessions.length /
            60
        )
      : 0;

  const completionRate =
    patients.length > 0
      ? Math.round((activePatients / patients.length) * 100)
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
      toast.success("Patient ajoute !");
      setNewPatientName("");
      setNewPatientAge("");
      setNewPatientGoals([]);
      setShowAddPatient(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAssignGame(patientId: string) {
    if (!selectedGame) return;
    setLoading(true);

    const { error } = await supabase.from("assignments").insert({
      patient_id: patientId,
      game_id: selectedGame,
      therapist_id: profile.id,
      difficulty_level: parseInt(selectedDifficulty),
    });

    if (error) {
      toast.error("Erreur lors de l'assignation");
    } else {
      toast.success("Jeu assigne !");
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

  function copyLinkCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Code copie !");
  }

  const goalOptions = ["articulation", "vocabulaire", "comprehension", "lecture", "langage oral"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Speech Play</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{profile.full_name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-gray-500">
            Votre tableau de bord therapeute
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="w-4 h-4" />
              Patients
            </div>
            <div className="text-2xl font-bold">{patients.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Actifs cette semaine
            </div>
            <div className="text-2xl font-bold text-green-600">
              {completionRate}%
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Duree moy. session
            </div>
            <div className="text-2xl font-bold">{avgDuration} min</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Gamepad2 className="w-4 h-4" />
              Sessions cette semaine
            </div>
            <div className="text-2xl font-bold">{thisWeekSessions.length}</div>
          </div>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="patients">
              <Users className="w-4 h-4 mr-1" /> Patients
            </TabsTrigger>
            <TabsTrigger value="activite">
              <BarChart3 className="w-4 h-4 mr-1" /> Activite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Mes patients</h2>
              <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un patient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau patient</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPatient} className="space-y-4">
                    <div>
                      <Label>Prenom</Label>
                      <Input
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder="Prenom de l'enfant"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        min={2}
                        max={15}
                        value={newPatientAge}
                        onChange={(e) => setNewPatientAge(e.target.value)}
                        placeholder="Age"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Objectifs therapeutiques</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {goalOptions.map((goal) => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() =>
                              setNewPatientGoals((prev) =>
                                prev.includes(goal)
                                  ? prev.filter((g) => g !== goal)
                                  : [...prev, goal]
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              newPatientGoals.includes(goal)
                                ? "bg-violet-100 border-violet-300 text-violet-700"
                                : "bg-gray-50 border-gray-200 text-gray-600"
                            }`}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                    >
                      {loading ? "Ajout..." : "Ajouter"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {patients.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucun patient
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Ajoutez votre premier patient pour commencer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => {
                  const patientAssignments = assignments.filter(
                    (a) => a.patient_id === patient.id
                  );
                  const patientSessions = sessions.filter(
                    (s) => s.patient_id === patient.id
                  );
                  const weekSessions = patientSessions.filter((s) => {
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    return new Date(s.started_at) > lastWeek;
                  });

                  return (
                    <div
                      key={patient.id}
                      className="bg-white rounded-xl p-6 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white font-bold">
                              {patient.first_name[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {patient.first_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {patient.age} ans
                                {patient.goals.length > 0 &&
                                  ` - ${patient.goals.join(", ")}`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyLinkCode(patient.link_code)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600 bg-gray-50 px-2 py-1 rounded"
                          >
                            <Copy className="w-3 h-3" />
                            Code: {patient.link_code}
                          </button>
                          <Dialog
                            open={showAssign === patient.id}
                            onOpenChange={(open) =>
                              setShowAssign(open ? patient.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Plus className="w-3 h-3 mr-1" /> Assigner jeu
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Assigner un jeu a {patient.first_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Jeu</Label>
                                  <Select
                                    value={selectedGame}
                                    onValueChange={setSelectedGame}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Choisir un jeu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {games.map((game) => (
                                        <SelectItem key={game.id} value={game.id}>
                                          {game.name} ({game.category})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Difficulte</Label>
                                  <Select
                                    value={selectedDifficulty}
                                    onValueChange={setSelectedDifficulty}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Facile</SelectItem>
                                      <SelectItem value="2">Moyen</SelectItem>
                                      <SelectItem value="3">Difficile</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  onClick={() => handleAssignGame(patient.id)}
                                  disabled={loading || !selectedGame}
                                  className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                                >
                                  {loading ? "Assignation..." : "Assigner"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Patient stats row */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-violet-600">
                            {weekSessions.length}
                          </div>
                          <div className="text-xs text-gray-500">
                            Sessions/sem
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-500">
                            <Star className="w-4 h-4 inline" />{" "}
                            {patient.stars_total}
                          </div>
                          <div className="text-xs text-gray-500">Etoiles</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {patient.streak_current}
                          </div>
                          <div className="text-xs text-gray-500">
                            Jours serie
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {patientAssignments.filter((a) => a.active).length}
                          </div>
                          <div className="text-xs text-gray-500">
                            Jeux actifs
                          </div>
                        </div>
                      </div>

                      {/* Assigned games */}
                      {patientAssignments.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-400 mb-2">
                            Jeux assignes :
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {patientAssignments.map((a) => (
                              <span
                                key={a.id}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  a.active
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {a.games.name} (niv. {a.difficulty_level})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent struggles */}
                      {weekSessions.some(
                        (s) =>
                          s.accuracy !== null &&
                          s.accuracy < 60
                      ) && (
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            Difficultes detectees cette semaine
                          </div>
                        </div>
                      )}

                      {/* Parent linked status */}
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            patient.parent_id
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {patient.parent_id
                            ? "Parent lie"
                            : "En attente de liaison parent"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activite" className="space-y-4">
            <h2 className="text-lg font-semibold">Activite recente</h2>
            {sessions.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucune activite
                </h3>
                <p className="text-gray-500 text-sm">
                  Les sessions de jeu apparaitront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const patient = patients.find(
                    (p) => p.id === session.patient_id
                  );
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                          {patient?.first_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {patient?.first_name} - {session.games.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.started_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < session.stars_earned
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {session.duration_seconds
                              ? `${Math.round(session.duration_seconds / 60)} min`
                              : "-"}
                            {session.accuracy !== null &&
                              ` | ${session.accuracy}%`}
                          </p>
                        </div>
                        {session.accuracy !== null && (
                          <Progress
                            value={Number(session.accuracy)}
                            className="w-16 h-2"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
