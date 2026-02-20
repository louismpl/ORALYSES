"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { openLemonCheckout } from "@/lib/lemon-squeezy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OralysesLogo } from "@/components/oralyses-logo";
import { toast } from "sonner";
import {
    Building2,
    Copy,
    Check,
    Users,
    Crown,
    User,
    ArrowLeft,
    LogOut,
    Plus,
    Shield,
    ChevronRight,
    Lock,
    Sparkles,
    RefreshCw,
    Trash2,
    AlertTriangle,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    plan: string | null;
    cabinet_id: string | null;
    is_cabinet_admin: boolean;
}

interface Cabinet {
    id: string;
    name: string;
    admin_id: string;
    invite_code_1: string | null;
    invite_code_2: string | null;
    invite_code_3: string | null;
    invite_code_4: string | null;
    invite_code_5: string | null;
    created_at: string;
}

interface Member {
    id: string;
    full_name: string;
    email: string;
    is_cabinet_admin: boolean;
    created_at: string;
}

// ─── Invite code slot component ───────────────────────────────────────────────
function InviteCodeSlot({
    slot,
    code,
    isAdmin,
    onRegenerate,
}: {
    slot: number;
    code: string | null;
    isAdmin: boolean;
    onRegenerate: (slot: number) => Promise<void>;
}) {
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    function handleCopy() {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success(`Code ${slot} copié !`);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleRegenerate() {
        setRegenerating(true);
        await onRegenerate(slot);
        setRegenerating(false);
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl border-2 border-violet-200 px-4 py-2.5 font-mono text-lg font-bold text-center tracking-[0.2em] text-violet-700">
                {code || "------"}
            </div>
            <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-violet-50 border border-violet-200 transition-colors"
                title="Copier ce code"
            >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-violet-500" />}
            </button>
            {isAdmin && (
                <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="p-2 rounded-lg hover:bg-orange-50 border border-orange-200 transition-colors"
                    title="Regénérer ce code"
                >
                    <RefreshCw className={`w-4 h-4 text-orange-500 ${regenerating ? "animate-spin" : ""}`} />
                </button>
            )}
        </div>
    );
}

// ─── Main CabinetClient ───────────────────────────────────────────────────────
export function CabinetClient({
    profile,
    cabinet: initialCabinet,
    members: initialMembers,
}: {
    profile: Profile;
    cabinet: Cabinet | null;
    members: Member[];
}) {
    const [cabinet, setCabinet] = useState<Cabinet | null>(initialCabinet);
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [loading, setLoading] = useState(false);
    const [cabinetNameInput, setCabinetNameInput] = useState("");
    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const [removingMember, setRemovingMember] = useState<string | null>(null);
    const [showDissolve, setShowDissolve] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const isInCabinet = !!profile.cabinet_id;
    const isAdmin = profile.is_cabinet_admin;
    const plan = profile.plan || "free";

    // Get all invite codes from cabinet
    const inviteCodes = cabinet
        ? [
            { slot: 1, code: cabinet.invite_code_1 },
            { slot: 2, code: cabinet.invite_code_2 },
            { slot: 3, code: cabinet.invite_code_3 },
            { slot: 4, code: cabinet.invite_code_4 },
            { slot: 5, code: cabinet.invite_code_5 },
        ]
        : [];

    // ── Create cabinet ──────────────────────────────────────────────────────────
    async function handleCreateCabinet(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const name = cabinetNameInput.trim() || "Mon Cabinet";
        const { data, error } = await supabase.rpc("create_cabinet", { p_name: name });

        if (error) {
            toast.error("Erreur lors de la création du cabinet");
            console.error(error);
        } else if (data?.success) {
            toast.success("Cabinet créé avec succès !");
            setShowCreate(false);
            router.refresh();
        } else {
            toast.error(data?.error || "Erreur inconnue");
        }
        setLoading(false);
    }

    // ── Join cabinet ────────────────────────────────────────────────────────────
    async function handleJoinCabinet(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.rpc("join_cabinet", {
            p_invite_code: inviteCodeInput.trim().toUpperCase(),
        });

        if (error) {
            toast.error("Erreur de connexion. Réessayez.");
        } else if (data?.success) {
            toast.success(`Vous avez rejoint "${data.cabinet_name || "le cabinet"}" !`);
            router.refresh();
        } else {
            toast.error(data?.error || "Code invalide ou cabinet complet");
        }
        setLoading(false);
    }

    // ── Leave cabinet ───────────────────────────────────────────────────────────
    async function handleLeaveCabinet() {
        setLoading(true);
        const { data, error } = await supabase.rpc("leave_cabinet");
        if (error) {
            toast.error("Erreur");
        } else if (data?.success) {
            toast.success("Vous avez quitté le cabinet");
            router.refresh();
        } else {
            toast.error(data?.error || "Erreur");
        }
        setLoading(false);
    }

    // ── Remove member (admin) ───────────────────────────────────────────────────
    async function handleRemoveMember(memberId: string, memberName: string) {
        setRemovingMember(memberId);
        const { data, error } = await supabase.rpc("remove_cabinet_member", { p_member_id: memberId });
        if (error) {
            toast.error("Erreur lors de la suppression");
        } else if (data?.success) {
            toast.success(`${memberName} a été retiré du cabinet`);
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } else {
            toast.error(data?.error || "Erreur");
        }
        setRemovingMember(null);
    }

    // ── Dissolve cabinet (admin) ────────────────────────────────────────────────
    async function handleDissolveCabinet() {
        setLoading(true);
        const { data, error } = await supabase.rpc("dissolve_cabinet");
        if (error) {
            toast.error("Erreur lors de la dissolution");
        } else if (data?.success) {
            toast.success("Cabinet dissous");
            setShowDissolve(false);
            router.refresh();
        } else {
            toast.error(data?.error || "Erreur");
        }
        setLoading(false);
    }

    // ── Regenerate invite code (admin) ──────────────────────────────────────────
    async function handleRegenerateCode(slot: number) {
        const { data, error } = await supabase.rpc("regenerate_invite_code", { p_slot: slot });
        if (error || !data?.success) {
            toast.error("Erreur lors de la régénération");
            return;
        }
        toast.success(`Code ${slot} regénéré !`);
        // Update local state
        setCabinet(prev => {
            if (!prev) return prev;
            const key = `invite_code_${slot}` as keyof Cabinet;
            return { ...prev, [key]: data.new_code };
        });
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <OralysesLogo size={28} />
                        <span className="font-bold" style={{ color: "#F28C6F" }}>Oralyses</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/profil">
                            <Button variant="ghost" size="sm"><User className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Title */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isInCabinet && cabinet ? cabinet.name : "Cabinet"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isInCabinet
                                ? isAdmin ? "Vous administrez ce cabinet" : "Vous êtes membre de ce cabinet"
                                : "Créez ou rejoignez un cabinet"}
                        </p>
                    </div>
                    {isAdmin && (
                        <span className="ml-auto flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">
                            <Crown className="w-3 h-3" /> Admin
                        </span>
                    )}
                </div>

                {/* ══ Pas dans un cabinet ══════════════════════════════════════════════ */}
                {!isInCabinet && (
                    <div className="space-y-4">
                        {/* Créer un cabinet */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                    <Crown className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-gray-900 mb-1">Créer un nouveau cabinet</h2>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Vous devenez administrateur. Vous recevrez 5 codes d&apos;invitation à distribuer à vos collègues (max. 5 orthophonistes au total).
                                    </p>

                                    {plan === "cabinet" ? (
                                        <Dialog open={showCreate} onOpenChange={setShowCreate}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Créer mon cabinet
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Nommer votre cabinet</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleCreateCabinet} className="space-y-4">
                                                    <div>
                                                        <Label>Nom du cabinet</Label>
                                                        <Input
                                                            value={cabinetNameInput}
                                                            onChange={e => setCabinetNameInput(e.target.value)}
                                                            placeholder="Ex: Cabinet Dupont & Associés"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <Button type="submit" disabled={loading}
                                                        className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white">
                                                        {loading ? "Création..." : "Créer le cabinet"}
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                                            <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Plan Cabinet requis</p>
                                                <p className="text-xs text-amber-600 mt-0.5">
                                                    Vous êtes sur le plan{" "}
                                                    <span className="font-semibold capitalize">
                                                        {plan === "free" ? "Essai gratuit" : "Pro"}
                                                    </span>.
                                                    Pour créer un cabinet multi-orthophonistes, passez au plan Cabinet.
                                                </p>
                                                <button
                                                    onClick={() => openLemonCheckout("1325461", profile.id, profile.email)}
                                                    className="mt-2 text-xs text-amber-700 font-semibold underline underline-offset-2 flex items-center gap-1 hover:text-amber-900"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    Souscrire au plan Cabinet (99€/mois)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Séparateur */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-400 font-medium">ou</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Rejoindre un cabinet */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-gray-900 mb-1">Rejoindre un cabinet existant</h2>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Entrez le code d&apos;invitation que l&apos;administrateur vous a communiqué.
                                    </p>
                                    <form onSubmit={handleJoinCabinet} className="flex gap-2">
                                        <Input
                                            value={inviteCodeInput}
                                            onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                                            placeholder="XXXXXX"
                                            className="font-mono tracking-widest flex-1 uppercase"
                                            maxLength={6}
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            disabled={loading || inviteCodeInput.length < 6}
                                            variant="outline"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ Dans un cabinet ══════════════════════════════════════════════════ */}
                {isInCabinet && (
                    <div className="space-y-5">

                        {/* Codes d'invitation (admin seulement) */}
                        {isAdmin && cabinet && (
                            <div className="bg-gradient-to-br from-violet-50 to-orange-50 rounded-2xl p-6 border border-violet-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-violet-600" />
                                    <h2 className="font-semibold text-violet-900 text-sm uppercase tracking-wide">
                                        Codes d&apos;invitation
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600 mb-5">
                                    Distribuez ces 5 codes à vos collègues. Chaque code est à usage unique par compte.
                                    Regénérez un code si vous souhaitez en révoquer un.
                                </p>
                                <div className="space-y-2">
                                    {inviteCodes.map(({ slot, code }) => (
                                        <div key={slot} className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-violet-500 w-12 flex-shrink-0">
                                                Code {slot}
                                            </span>
                                            <div className="flex-1">
                                                <InviteCodeSlot
                                                    slot={slot}
                                                    code={code}
                                                    isAdmin={isAdmin}
                                                    onRegenerate={handleRegenerateCode}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-violet-400 mt-4">
                                    💡 Pour retirer un accès sans supprimer le membre, regénérez le code correspondant : l&apos;ancien code devient invalide.
                                </p>
                            </div>
                        )}

                        {/* Liste des membres */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <h2 className="font-semibold text-gray-900">Membres du cabinet</h2>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                    {members.length} / 5
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            {member.full_name
                                                .split(" ")
                                                .map(n => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 text-sm truncate">
                                                    {member.full_name}
                                                    {member.id === profile.id && (
                                                        <span className="ml-1 text-gray-400 font-normal text-xs">(vous)</span>
                                                    )}
                                                </p>
                                                {member.is_cabinet_admin && (
                                                    <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                            <p className="text-xs text-gray-400">
                                                Membre depuis {new Date(member.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                            </p>
                                        </div>

                                        {/* Badge & Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.is_cabinet_admin
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-gray-100 text-gray-600"}`}>
                                                {member.is_cabinet_admin ? "Admin" : "Membre"}
                                            </span>

                                            {/* Bouton supprimer (admin only, pas sur soi-même, pas sur l'admin) */}
                                            {isAdmin && !member.is_cabinet_admin && member.id !== profile.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id, member.full_name)}
                                                    disabled={removingMember === member.id}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                                    title={`Retirer ${member.full_name} du cabinet`}
                                                >
                                                    {removingMember === member.id
                                                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                        : <X className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Slots vides */}
                                {Array.from({ length: Math.max(0, 5 - members.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex items-center gap-4 px-6 py-3 opacity-40">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-400 italic">Emplacement disponible</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions admin */}
                        {isAdmin && (
                            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <h3 className="font-semibold text-red-800 text-sm">Zone dangereuse</h3>
                                </div>
                                <p className="text-xs text-red-600">
                                    Dissoudre le cabinet retire tous les membres et supprime définitivement le cabinet. Cette action est irréversible.
                                </p>

                                <Dialog open={showDissolve} onOpenChange={setShowDissolve}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 w-full sm:w-auto">
                                            <Trash2 className="w-4 h-4 mr-2" /> Dissoudre le cabinet
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="text-red-700 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" /> Confirmer la dissolution
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Tous les {members.length} membres seront retirés du cabinet.
                                                Cette action est <strong>irréversible</strong>.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button variant="outline" onClick={() => setShowDissolve(false)} className="flex-1">
                                                    Annuler
                                                </Button>
                                                <Button
                                                    onClick={handleDissolveCabinet}
                                                    disabled={loading}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    {loading ? "Dissolution..." : "Confirmer"}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        {/* Bouton quitter (membres uniquement) */}
                        {!isAdmin && (
                            <Button
                                variant="outline"
                                onClick={handleLeaveCabinet}
                                disabled={loading}
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {loading ? "Quitter..." : "Quitter le cabinet"}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
