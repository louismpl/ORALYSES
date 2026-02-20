"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { openLemonCheckout } from "@/lib/lemon-squeezy";
import { OralysesLogo } from "@/components/oralyses-logo";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Star,
    Users,
    CheckCircle,
    Sparkles,
    LogOut,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function PaiementPage() {
    const [profile, setProfile] = useState<{
        id: string;
        email: string;
        full_name: string;
        plan: string | null;
        subscription_status: string | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkAccess() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/connexion");
                return;
            }

            const { data: p } = await supabase
                .from("profiles")
                .select("id, email, full_name, plan, subscription_status, role")
                .eq("id", user.id)
                .single();

            if (!p) {
                router.push("/connexion");
                return;
            }

            // If user already has an active subscription, send to dashboard
            if (
                p.subscription_status === "active" ||
                p.subscription_status === "on_trial"
            ) {
                if (p.role === "parent") {
                    router.push("/parent");
                } else {
                    router.push("/dashboard");
                }
                return;
            }

            setProfile(p);
            setLoading(false);
        }
        checkAccess();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    function handleSelectPlan(planType: "pro" | "cabinet") {
        if (!profile) return;
        const variantId = planType === "cabinet" ? "1325461" : "1325457";
        // Returning users (cancelled/expired) should NOT get a free trial again
        const shouldDisableTrial = profile.subscription_status === "cancelled"
            || profile.subscription_status === "expired"
            || profile.subscription_status === "paused";
        openLemonCheckout(variantId, profile.id, profile.email, shouldDisableTrial);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white">
                <div className="flex flex-col items-center gap-4">
                    <OralysesLogo size={48} />
                    <div className="animate-pulse text-gray-500 font-medium">
                        Chargement...
                    </div>
                </div>
            </div>
        );
    }

    // Determine if this is a first-time user (never paid) or a returning user
    const isFirstTime = profile?.subscription_status === "unpaid" || !profile?.subscription_status;
    const isReturning = profile?.subscription_status === "cancelled" || profile?.subscription_status === "expired" || profile?.subscription_status === "paused";

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-orange-50/30">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <OralysesLogo size={28} />
                        <span className="font-bold" style={{ color: "#F28C6F" }}>
                            Oralyses
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {profile?.email}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Title area */}
                <div className="text-center mb-12">
                    {isReturning ? (
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-red-200">
                            <Shield className="w-4 h-4" />
                            Abonnement expiré
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-amber-200">
                            <Shield className="w-4 h-4" />
                            Abonnement requis
                        </div>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                        {isReturning
                            ? <>Bon retour {profile?.full_name?.split(" ")[0]} 👋</>
                            : <>Bonjour {profile?.full_name?.split(" ")[0]} 👋</>
                        }
                    </h1>
                    <p className="text-lg text-gray-500 max-w-md mx-auto">
                        {isReturning
                            ? "Votre abonnement a expiré. Réactivez-le pour retrouver votre espace."
                            : "Choisissez votre formule pour accéder à votre espace et commencer à transformer vos séances d\u0027orthophonie."
                        }
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Pack Libéral */}
                    <div className="group relative bg-white rounded-3xl p-8 border-2 border-violet-100 shadow-lg hover:shadow-xl hover:border-violet-300 hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 duration-500" />

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4 uppercase tracking-widest text-[10px] font-black text-violet-600">
                                <Star className="w-3.5 h-3.5 fill-violet-600" />
                                Indépendant
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-1">
                                Pack Libéral
                            </h3>
                            <p className="text-sm text-gray-500">
                                L&apos;outil parfait pour votre pratique.
                            </p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-gray-900">39€</span>
                            <span className="text-gray-400 font-bold">/mois</span>
                        </div>
                        {isFirstTime ? (
                            <p className="text-xs text-violet-600 font-semibold mb-6">
                                ✨ 14 jours d&apos;essai gratuit
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 font-semibold mb-6">
                                Facturation mensuelle
                            </p>
                        )}

                        <ul className="space-y-3 mb-8 text-sm font-semibold text-gray-600">
                            {[
                                "Patients illimités",
                                "Tous les mini-jeux inclus",
                                "Éditeur de séances",
                                "Tableau de bord expert",
                                "Exports PDF",
                                "Support prioritaire",
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5">
                                    <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handleSelectPlan("pro")}
                            className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold shadow-lg transition-all active:scale-95"
                        >
                            {isFirstTime ? "Commencer l\u0027essai gratuit" : "S\u0027abonner — 39€/mois"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Pack Cabinet */}
                    <div className="group relative bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-lg hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 duration-500" />

                        {/* Popular badge */}
                        <div className="absolute -top-3 right-6 bg-gradient-to-r from-orange-400 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Populaire
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4 uppercase tracking-widest text-[10px] font-black text-orange-600">
                                <Users className="w-3.5 h-3.5" />
                                Multi-praticiens
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-1">
                                Pack Cabinet
                            </h3>
                            <p className="text-sm text-gray-500">
                                Optimisez votre équipe.
                            </p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-black text-gray-900">99€</span>
                            <span className="text-gray-400 font-bold">/mois</span>
                        </div>

                        <ul className="space-y-3 mb-8 text-sm font-semibold text-gray-600">
                            {[
                                "Jusqu\u0027à 5 praticiens",
                                "Facturation centralisée",
                                "Analytiques globales",
                                "Partage de dossiers",
                                "Support Premium VIP",
                                "Formations équipe",
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5">
                                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handleSelectPlan("cabinet")}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-violet-500 text-white font-bold shadow-lg transition-all active:scale-95 border-none hover:opacity-90"
                        >
                            {isReturning ? "Réactiver — 99€/mois" : "Inscrire le cabinet"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Bottom note */}
                <p className="text-center text-xs text-gray-400 mt-8 max-w-md mx-auto">
                    Paiement sécurisé par Lemon Squeezy. Annulez à tout moment depuis
                    votre espace. En cas de question, contactez-nous à{" "}
                    <a
                        href="mailto:contact@oralyses.fr"
                        className="text-violet-500 hover:underline"
                    >
                        contact@oralyses.fr
                    </a>
                </p>
            </div>
        </div>
    );
}
