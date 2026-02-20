"use client";

/**
 * Utility to open Lemon Squeezy checkout with custom data
 * @param variantId The variant ID from Lemon Squeezy dashboard
 * @param userId The current user's ID to link the purchase
 * @param email User's email to pre-fill the checkout
 */
export function openLemonCheckout(variantId: string, userId: string, email: string) {
    if (typeof window === "undefined") return;

    // Lemon Squeezy checkout URL format
    // Replace YOUR_STORE_SUBDOMAIN with your actual store name
    const storeSubdomain = "oralyses"; // User should confirm this
    const checkoutUrl = `https://${storeSubdomain}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[email]=${encodeURIComponent(email)}&checkout[custom][user_id]=${userId}&embed=1`;

    // If using the Lemon Squeezy script for overlays
    if ((window as any).LemonSqueezy) {
        (window as any).LemonSqueezy.Url.Open(checkoutUrl);
    } else {
        window.open(checkoutUrl, "_blank");
    }
}
