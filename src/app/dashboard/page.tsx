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

  // ── Subscription gate: block unpaid therapists ──────────────────────────
  const subStatus = profile.subscription_status;
  if (subStatus !== "active" && subStatus !== "on_trial") {
    redirect("/paiement");
  }

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

  // Get sessions with mood and mistakes for therapist analysis
  const { data: sessions } = patientIds.length
    ? await supabase
      .from("game_sessions")
      .select("*, games(name, category, slug)") // Added slug
      .in("patient_id", patientIds)
      .order("started_at", { ascending: false })
      .limit(100)
    : { data: [] };

  // Get achievements for all patients
  const { data: patientAchievements } = patientIds.length
    ? await supabase
      .from("patient_achievements")
      .select("*, achievements(*)")
      .in("patient_id", patientIds)
    : { data: [] };

  // Get custom game configs created by this therapist
  const { data: customConfigs } = await supabase
    .from("custom_game_configs")
    .select("*, games(name, slug)")
    .eq("therapist_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      profile={profile}
      patients={patients || []}
      games={games || []}
      assignments={assignments || []}
      sessions={sessions || []}
      customConfigs={customConfigs || []}
      patientAchievements={patientAchievements || []}
    />
  );
}
