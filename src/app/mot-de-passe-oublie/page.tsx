"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { OralysesLogo } from "@/components/oralyses-logo";
import { toast } from "sonner";

export default function MotDePasseOubliePage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const supabase = createClient();

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
        });

        if (error) {
            toast.error(error.message);
        } else {
            setSent(true);
            toast.success("Email envoyé !");
        }
        setLoading(false);
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Vérifiez votre boîte mail
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Un lien de réinitialisation a été envoyé à{" "}
                        <strong>{email}</strong>. Cliquez dessus pour créer un nouveau mot
                        de passe.
                    </p>
                    <Link href="/connexion">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour à la connexion
                        </Button>
                    </Link>
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
                        Mot de passe oublié
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
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
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
                    >
                        {loading ? "Envoi..." : "Envoyer le lien"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link
                        href="/connexion"
                        className="text-violet-600 font-medium hover:underline"
                    >
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    );
}
