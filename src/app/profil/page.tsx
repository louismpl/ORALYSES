import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/connexion");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) redirect("/connexion");

    return <ProfilClient profile={profile} />;
}
