import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GamePlayer } from "./game-player";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string; gameSlug: string }>;
  searchParams: Promise<{ assignment?: string; difficulty?: string }>;
}) {
  const { patientId, gameSlug } = await params;
  const { assignment, difficulty } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/connexion");

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("slug", gameSlug)
    .single();

  if (!game) redirect("/parent");

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  if (!patient) redirect("/parent");

  return (
    <GamePlayer
      game={game}
      patient={patient}
      assignmentId={assignment || null}
      difficulty={parseInt(difficulty || "1")}
    />
  );
}
