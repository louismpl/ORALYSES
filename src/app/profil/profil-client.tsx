"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    User,
    Mail,
    Lock,
    CheckCircle,
    LogOut,
    Shield,
} from "lucide-react";
import { OralysesLogo } from "@/components/oralyses-logo";
import { toast } from "sonner";

interface ProfilClientProps {
    profile: {
        id: string;
        full_name: string;
        email: string;
        role: string;
        avatar_url: string | null;
        created_at: string;
    };
}

export function ProfilClient({ profile }: ProfilClientProps) {
    const [fullName, setFullName] = useState(profile.full_name);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setLoadingProfile(true);

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", profile.id);

        if (error) {
            toast.error("Erreur lors de la mise à jour");
        } else {
            toast.success("Profil mis à jour !");
            router.refresh();
        }
        setLoadingProfile(false);
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setLoadingPassword(true);

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Mot de passe mis à jour !");
            setNewPassword("");
            setConfirmPassword("");
        }
        setLoadingPassword(false);
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const backUrl = profile.role === "therapist" ? "/dashboard" : "/parent";

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href={backUrl} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <OralysesLogo size={28} />
                        <span className="font-bold" style={{ color: '#F28C6F' }}>Oralyses</span>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
                {/* Profile header */}
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                        {profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">
                        {profile.full_name}
                    </h1>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <span className="inline-block mt-2 text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">
                        {profile.role === "therapist" ? "Orthophoniste" : "Parent"}
                    </span>
                </div>

                {/* Update profile */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-violet-500" />
                        Informations personnelles
                    </h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{profile.email}</span>
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
                        <Button
                            type="submit"
                            disabled={loadingProfile}
                            className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
                        >
                            {loadingProfile ? "Mise à jour..." : "Enregistrer"}
                        </Button>
                    </form>
                </div>

                {/* Update password */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-violet-500" />
                        Modifier le mot de passe
                    </h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 caractères"
                                required
                                minLength={6}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirmer</Label>
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
                            disabled={loadingPassword}
                            variant="outline"
                            className="w-full"
                        >
                            {loadingPassword ? "Mise à jour..." : "Changer le mot de passe"}
                        </Button>
                    </form>
                </div>

                {/* Account info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-500" />
                        Informations du compte
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Membre depuis</span>
                            <span className="text-gray-900">
                                {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Rôle</span>
                            <span className="text-gray-900">
                                {profile.role === "therapist" ? "Orthophoniste" : "Parent"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                </Button>
            </div>
        </div>
    );
}
