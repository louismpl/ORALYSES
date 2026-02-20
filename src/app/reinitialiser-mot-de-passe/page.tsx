"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { OralysesLogo } from "@/components/oralyses-logo";
import { toast } from "sonner";

export default function ReinitialiserMotDePassePage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Handle the auth callback hash fragment
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                // User arrived via password reset link
            }
        });
    }, [supabase.auth]);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            toast.error(error.message);
        } else {
            setSuccess(true);
            toast.success("Mot de passe mis à jour !");
            setTimeout(() => {
                router.push("/connexion");
            }, 2000);
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Mot de passe mis à jour !
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Redirection vers la connexion...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <OralysesLogo size={36} />
                        <span className="text-xl font-bold" style={{ color: '#F28C6F' }}>
                            Oralyses
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Choisissez votre nouveau mot de passe
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <Label htmlFor="password">Nouveau mot de passe</Label>
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
                    <div>
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Retapez le mot de passe"
                            required
                            minLength={6}
                            className="mt-1"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
                    >
                        {loading ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
