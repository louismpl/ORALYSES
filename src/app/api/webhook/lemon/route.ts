import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "placeholder");
        const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
        const signature = Buffer.from(req.headers.get("x-signature") || "", "utf8");

        if (!crypto.timingSafeEqual(digest, signature)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data; // We expect { user_id: '...' }

        console.log(`Lemon Squeezy Webhook: ${eventName}`, customData);

        if (eventName === "subscription_created" || eventName === "subscription_updated") {
            const userId = customData?.user_id;
            const status = payload.data.attributes.status;
            const variantId = payload.data.attributes.variant_id; // Map this to 'pro' or 'cabinet'

            if (userId && (status === "active" || status === "on_trial")) {
                let plan = "free";
                if (variantId?.toString() === "1325457") {
                    plan = "pro"; // Pack Libéral
                } else if (variantId?.toString() === "1325461") {
                    plan = "cabinet"; // Pack Cabinet
                }

                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({ plan: plan })
                    .eq("id", userId);

                if (error) console.error("Error updating profile plan:", error);
            }
        }

        if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
            const userId = customData?.user_id;
            if (userId) {
                await supabaseAdmin
                    .from("profiles")
                    .update({ plan: "free" })
                    .eq("id", userId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
