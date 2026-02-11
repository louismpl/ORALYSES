import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "therapist") redirect("/parent");

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("therapist_id", user.id)
    .order("created_at", { ascending: false });

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("name");

  // Get assignments for all patients
  const patientIds = (patients || []).map((p) => p.id);
  const { data: assignments } = patientIds.length
    ? await supabase
        .from("assignments")
        .select("*, games(*)")
        .in("patient_id", patientIds)
    : { data: [] };

  // Get recent sessions
  const { data: sessions } = patientIds.length
    ? await supabase
        .from("game_sessions")
        .select("*, games(name, category)")
        .in("patient_id", patientIds)
        .order("started_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <DashboardClient
      profile={profile}
      patients={patients || []}
      games={games || []}
      assignments={assignments || []}
      sessions={sessions || []}
    />
  );
}
