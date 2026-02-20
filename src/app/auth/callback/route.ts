import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Get user role to redirect properly
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                const redirectTo =
                    profile?.role === "therapist" ? "/dashboard" : "/parent";
                return NextResponse.redirect(`${origin}${redirectTo}`);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Auth error — redirect to error page
    return NextResponse.redirect(`${origin}/connexion`);
}
