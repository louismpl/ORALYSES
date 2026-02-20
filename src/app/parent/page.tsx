import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ParentClient } from "./parent-client";

export default async function ParentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");
  if (profile.role === "therapist") redirect("/dashboard");

  // Get patients linked to this parent
  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("parent_id", user.id);

  const patientIds = (patients || []).map((p) => p.id);

  // Get assignments for patients
  const { data: assignments } = patientIds.length
    ? await supabase
      .from("assignments")
      .select("*, games(*)")
      .in("patient_id", patientIds)
      .eq("active", true)
    : { data: [] };

  // Get recent sessions (with mood and game slug for charts)
  const { data: sessions } = patientIds.length
    ? await supabase
      .from("game_sessions")
      .select("*, games(name, category, slug)")
      .in("patient_id", patientIds)
      .order("started_at", { ascending: false })
      .limit(50)
    : { data: [] };

  // Get rewards unlocked
  const { data: unlockedRewards } = patientIds.length
    ? await supabase
      .from("patient_rewards")
      .select("*, reward_items(*)")
      .in("patient_id", patientIds)
    : { data: [] };

  // Get achievements unlocked
  const { data: unlockedAchievements } = patientIds.length
    ? await supabase
      .from("patient_achievements")
      .select("*, achievements(*)")
      .in("patient_id", patientIds)
    : { data: [] };

  // Get all reward items to browse
  const { data: allRewards } = await supabase
    .from("reward_items")
    .select("*")
    .order("cost");

  return (
    <ParentClient
      profile={profile}
      patients={patients || []}
      assignments={assignments || []}
      sessions={sessions || []}
      unlockedRewards={unlockedRewards || []}
      unlockedAchievements={unlockedAchievements || []}
      allRewards={allRewards || []}
    />
  );
}
