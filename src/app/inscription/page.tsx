"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { openLemonCheckout } from "@/lib/lemon-squeezy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OralysesLogo } from "@/components/oralyses-logo";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Suspense } from "react";

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <InscriptionContent />
    </Suspense>
  );
}

function InscriptionContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"therapist" | "parent">("parent");
  const [cabinetCode, setCabinetCode] = useState("");
  const [showCabinetCode, setShowCabinetCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile (trigger may have already created it)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error("Profile upsert error:", profileError);
      }

      // Si orthophoniste avec code cabinet → rejoindre le cabinet
      if (role === "therapist" && cabinetCode.trim()) {
        // Petit délai pour que la session soit bien établie
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { data: joinData, error: joinError } = await supabase.rpc(
          "join_cabinet",
          { p_cabinet_code: cabinetCode.trim().toUpperCase() }
        );

        if (joinError) {
          console.error("Join cabinet error:", joinError);
          toast.warning("Compte créé, mais le code cabinet est invalide. Vous pouvez le rejoindre plus tard depuis votre profil.");
        } else if (joinData?.success) {
          toast.success(`Compte créé et rattaché au cabinet de ${joinData.cabinet_admin_name} !`);
        } else {
          toast.warning(`Compte créé, mais : ${joinData?.error || "code cabinet invalide"}`);
        }
      } else {
        toast.success("Compte créé avec succès !");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (role === "therapist" && (selectedPlan === "pro" || selectedPlan === "cabinet")) {
        toast.info("Redirection vers le paiement...");
        // Wait a bit for the profile to be created
        await new Promise(r => setTimeout(r, 1500));

        const variantId = selectedPlan === "cabinet"
          ? "1325461" // Actual Cabinet Variant ID
          : "1325457"; // Actual Libéral Variant ID (trial)

        openLemonCheckout(variantId, data.user.id, email);
        // openLemonCheckout now redirects via window.location.href
        // so we don't need router.push here - the page will navigate away
        return;
      } else if (role === "parent") {
        router.push("/parent");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <OralysesLogo size={36} />
            <span className="text-xl font-bold" style={{ color: '#F28C6F' }}>
              Oralyses
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-1">
            Rejoignez Oralyses
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role selector */}
          <div>
            <Label>Vous êtes</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => { setRole("parent"); setShowCabinetCode(false); setCabinetCode(""); }}
                className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${role === "parent"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("therapist")}
                className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${role === "therapist"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
              >
                Orthophoniste
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          {/* Champ code cabinet (uniquement pour les orthos) */}
          {role === "therapist" && (
            <div>
              <button
                type="button"
                onClick={() => setShowCabinetCode(!showCabinetCode)}
                className="flex items-center gap-2 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors w-full"
              >
                <Building2 className="w-4 h-4" />
                Vous rejoignez un cabinet existant ?
                {showCabinetCode ? (
                  <ChevronUp className="w-3 h-3 ml-auto" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-auto" />
                )}
              </button>

              {showCabinetCode && (
                <div className="mt-2">
                  <Input
                    id="cabinetCode"
                    value={cabinetCode}
                    onChange={(e) => setCabinetCode(e.target.value.toUpperCase())}
                    placeholder="Code cabinet (ex: CAB-A7F3)"
                    className="font-mono tracking-wider"
                    maxLength={8}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Demandez ce code à l&apos;administrateur de votre cabinet
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-violet-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
