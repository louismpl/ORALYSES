"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OralysesLogo } from "@/components/oralyses-logo";
import {
    ArrowLeft,
    Mail,
    MessageSquare,
    Send,
    CheckCircle2,
    Building2,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
        toast.success("Message envoyé avec succès !");
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="bg-gradient-to-br from-orange-400 to-violet-500 p-1.5 rounded-xl group-hover:rotate-6 transition-transform">
                            <OralysesLogo size={24} />
                        </div>
                        <span className="font-black text-xl tracking-tight text-gray-900">Oralyses</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-500">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Info */}
                    <div className="space-y-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-2xl text-sm font-bold mb-6"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Nous sommes à votre écoute</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight"
                            >
                                Une question ? <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-violet-500">Parlons-en.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-6 text-xl text-gray-500 font-medium max-w-lg"
                            >
                                Que vous soyez orthophoniste, parent ou partenaire, notre équipe vous répond sous 24h.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Email</h3>
                                    <p className="text-gray-500 font-medium pt-1">contact@oralyses.fr</p>
                                    <p className="text-sm text-gray-400 pt-0.5">Pour toute demande générale</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Siège social</h3>
                                    <p className="text-gray-500 font-medium pt-1">Paris, France</p>
                                    <p className="text-sm text-gray-400 pt-0.5">Innovation en orthophonie numérique</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Réseaux</h3>
                                    <p className="text-gray-500 font-medium pt-1">@oralyses_app</p>
                                    <p className="text-sm text-gray-400 pt-0.5">Suivez nos mises à jour</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-50/50 rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50"
                    >
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Nom Complet</label>
                                            <Input
                                                placeholder="Jean Dupont"
                                                required
                                                className="h-14 rounded-2xl border-gray-200 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Email professionnel</label>
                                            <Input
                                                type="email"
                                                placeholder="jean@exemple.fr"
                                                required
                                                className="h-14 rounded-2xl border-gray-200 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Sujet de votre message</label>
                                        <Input
                                            placeholder="Comment lier un compte parent ?"
                                            required
                                            className="h-14 rounded-2xl border-gray-200 focus:ring-violet-500 focus:border-violet-500 bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Votre message</label>
                                        <Textarea
                                            placeholder="Décrivez votre besoin en quelques lignes..."
                                            required
                                            className="min-h-[160px] rounded-2xl border-gray-200 focus:ring-violet-500 focus:border-violet-500 bg-white resize-none py-4"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-16 rounded-2xl bg-gray-900 hover:bg-black text-white text-lg font-bold shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Envoyer ma demande
                                                <Send className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-center text-xs text-gray-400 font-medium">
                                        En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
                                    </p>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-4">Message envoyé !</h2>
                                    <p className="text-gray-500 font-medium text-lg max-w-xs mx-auto mb-10">
                                        Merci pour votre message. Notre équipe reviendra vers vous très rapidement.
                                    </p>
                                    <Button
                                        onClick={() => setIsSubmitted(false)}
                                        variant="outline"
                                        className="h-14 px-8 rounded-2xl font-bold border-gray-200 hover:bg-gray-50 text-gray-900"
                                    >
                                        Envoyer un autre message
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
