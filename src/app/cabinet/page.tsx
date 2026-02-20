import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CabinetClient } from "./cabinet-client";

export default async function CabinetPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/connexion");

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, plan, cabinet_id, is_cabinet_admin")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "therapist") redirect("/dashboard");

    let cabinet = null;
    let members: {
        id: string;
        full_name: string;
        email: string;
        is_cabinet_admin: boolean;
        created_at: string;
    }[] = [];

    if (profile.cabinet_id) {
        // Fetch cabinet details (codes only visible to admin)
        const { data: cabinetData } = await supabase
            .from("cabinets")
            .select("id, name, admin_id, invite_code_1, invite_code_2, invite_code_3, invite_code_4, invite_code_5, created_at")
            .eq("id", profile.cabinet_id)
            .single();

        cabinet = cabinetData;

        // Fetch all members of this cabinet
        const { data: membersData } = await supabase
            .from("profiles")
            .select("id, full_name, email, is_cabinet_admin, created_at")
            .eq("cabinet_id", profile.cabinet_id)
            .order("is_cabinet_admin", { ascending: false });

        members = membersData || [];
    }

    return (
        <CabinetClient
            profile={profile}
            cabinet={cabinet}
            members={members}
        />
    );
}
