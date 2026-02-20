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
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

        if (!secret) {
            console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is not set!");
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
        }

        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(rawBody).digest("hex");
        const signature = req.headers.get("x-signature") || "";

        if (digest.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(digest, "utf8"), Buffer.from(signature, "utf8"))) {
            console.error("Signature mismatch!");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;
        const userId = customData?.user_id;

        console.log(`[Webhook] Event: ${eventName}, User: ${userId}`);

        if (!userId) {
            console.warn("[Webhook] No user_id in custom_data, skipping.");
            return NextResponse.json({ success: true, warning: "no user_id" });
        }

        const attributes = payload.data?.attributes || {};
        const subscriptionId = payload.data?.id?.toString() || null;
        const variantId = attributes.variant_id;
        const status = attributes.status; // active, on_trial, cancelled, expired, paused, past_due, unpaid
        const endsAt = attributes.ends_at || attributes.renews_at || null;

        // Determine plan from variant ID
        let plan = "free";
        if (variantId?.toString() === "1325457") {
            plan = "pro"; // Pack Libéral
        } else if (variantId?.toString() === "1325461") {
            plan = "cabinet"; // Pack Cabinet
        }

        switch (eventName) {
            // ─── Subscription created or renewed ─────────────────────────────
            case "subscription_created":
            case "subscription_resumed":
            case "subscription_unpaused": {
                const subStatus = (status === "on_trial") ? "on_trial" : "active";
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan,
                        subscription_id: subscriptionId,
                        subscription_status: subStatus,
                        subscription_ends_at: endsAt,
                    })
                    .eq("id", userId);
                if (error) console.error("[Webhook] Error activating subscription:", error);
                else console.log(`[Webhook] User ${userId} activated: plan=${plan}, status=${subStatus}`);
                break;
            }

            // ─── Subscription updated (plan change, renewal, etc.) ───────────
            case "subscription_updated":
            case "subscription_plan_changed": {
                if (status === "active" || status === "on_trial") {
                    const subStatus = (status === "on_trial") ? "on_trial" : "active";
                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .update({
                            plan,
                            subscription_id: subscriptionId,
                            subscription_status: subStatus,
                            subscription_ends_at: endsAt,
                        })
                        .eq("id", userId);
                    if (error) console.error("[Webhook] Error updating subscription:", error);
                    else console.log(`[Webhook] User ${userId} updated: plan=${plan}, status=${subStatus}`);
                } else if (status === "cancelled" || status === "expired" || status === "past_due" || status === "unpaid") {
                    // Subscription updated but now in a dead state
                    const { error } = await supabaseAdmin
                        .from("profiles")
                        .update({
                            plan: "free",
                            subscription_status: status === "past_due" ? "expired" : status,
                            subscription_ends_at: endsAt,
                        })
                        .eq("id", userId);
                    if (error) console.error("[Webhook] Error deactivating subscription:", error);
                    else console.log(`[Webhook] User ${userId} deactivated: status=${status}`);
                }
                break;
            }

            // ─── Payment successful ──────────────────────────────────────────
            case "subscription_payment_success":
            case "subscription_payment_recovered": {
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan,
                        subscription_status: "active",
                        subscription_ends_at: endsAt,
                    })
                    .eq("id", userId);
                if (error) console.error("[Webhook] Error on payment success:", error);
                else console.log(`[Webhook] User ${userId} payment success, re-activated.`);
                break;
            }

            // ─── Payment failed ──────────────────────────────────────────────
            case "subscription_payment_failed": {
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "expired",
                        plan: "free",
                    })
                    .eq("id", userId);
                if (error) console.error("[Webhook] Error on payment failure:", error);
                else console.log(`[Webhook] User ${userId} payment failed, access revoked.`);
                break;
            }

            // ─── Subscription cancelled or expired ───────────────────────────
            case "subscription_cancelled":
            case "subscription_expired": {
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        plan: "free",
                        subscription_status: eventName === "subscription_cancelled" ? "cancelled" : "expired",
                        subscription_ends_at: endsAt,
                    })
                    .eq("id", userId);
                if (error) console.error("[Webhook] Error cancelling subscription:", error);
                else console.log(`[Webhook] User ${userId} subscription ${eventName}.`);
                break;
            }

            // ─── Subscription paused ─────────────────────────────────────────
            case "subscription_paused": {
                const { error } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "paused",
                        plan: "free",
                    })
                    .eq("id", userId);
                if (error) console.error("[Webhook] Error pausing subscription:", error);
                else console.log(`[Webhook] User ${userId} subscription paused.`);
                break;
            }

            // ─── Order created (one-time, if applicable) ────────────────────
            case "order_created": {
                console.log(`[Webhook] Order created for user ${userId}, variant ${variantId}`);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event: ${eventName}`);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Webhook] Handler error:", err);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
