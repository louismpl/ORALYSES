"use client";

// Checkout link UUIDs from Lemon Squeezy
const CHECKOUT_UUIDS: Record<string, string> = {
    "1325457": "d793488c-7257-4d1d-955e-628b302731d1", // Pack Libéral
    "1325461": "be4c9c26-2dd7-4b2a-adbf-12b2cadfb50f", // Pack Cabinet
};

/**
 * Utility to open Lemon Squeezy checkout with custom data
 * @param variantId The variant ID from Lemon Squeezy dashboard
 * @param userId The current user's ID to link the purchase
 * @param email User's email to pre-fill the checkout
 * @param disableTrial If true, removes the free trial (for returning users)
 */
export function openLemonCheckout(
    variantId: string,
    userId: string,
    email: string,
    disableTrial: boolean = false
) {
    if (typeof window === "undefined") return;

    const checkoutUuid = CHECKOUT_UUIDS[variantId] || variantId;
    const storeSubdomain = "oralyses";

    let checkoutUrl = `https://${storeSubdomain}.lemonsqueezy.com/checkout/buy/${checkoutUuid}?checkout[email]=${encodeURIComponent(email)}&checkout[custom][user_id]=${userId}`;

    // Disable trial for returning users who already used their free trial
    if (disableTrial) {
        checkoutUrl += `&checkout[product_options][trial_length_days]=0`;
    }

    // Redirect directly instead of window.open to avoid popup blockers
    window.location.href = checkoutUrl;
}
