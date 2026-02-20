import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OralysesLogo } from "@/components/oralyses-logo";
import { ArrowLeft, Lock, Shield, EyeOff } from "lucide-react";

export default function ConfidentialitePage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <header className="h-20 border-b border-gray-100 flex items-center px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="bg-gradient-to-br from-orange-400 to-violet-500 p-1.5 rounded-xl group-hover:rotate-6 transition-transform">
                            <OralysesLogo size={24} />
                        </div>
                        <span className="font-black text-xl tracking-tight text-gray-900">Oralyses</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-500">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center gap-3 mb-8 text-orange-500">
                        <Lock className="w-8 h-8" />
                        <h1 className="text-4xl font-black text-gray-900 leading-none">Confidentialité</h1>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-12">
                        <p className="text-xl text-gray-500 font-medium">
                            Chez Oralyses, nous accordons une importance capitale à la vie privée de nos patients, particulièrement lorsqu&apos;il s&apos;agit d&apos;enfants. Voici comment nous protégeons vos données.
                        </p>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-violet-500" />
                                Notre engagement Zéro-Partage
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Oralyses est construit sur un modèle d&apos;abonnement pour garantir que vos données ne sont <strong>jamais</strong> vendues, louées ou partagées à des fins publicitaires. Notre seul client est l&apos;orthophoniste ou le parent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Données collectées</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-3">Orthophonistes</h3>
                                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                        <li>Nom, Prénom, Email</li>
                                        <li>Numéro ADELI (Vérification)</li>
                                        <li>Données de facturation (via Lemon Squeezy)</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-3">Patients (Enfants)</h3>
                                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                        <li>Prénom uniquement (pseudonymisation)</li>
                                        <li>Âge (pour calibrer les jeux)</li>
                                        <li>Scores et progression thérapeutique</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chiffrement</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Toutes les communications entre votre navigateur et nos serveurs sont chiffrées via TLS 1.3. Les données stockées en base de données sont chiffrées au repos (AES-256).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <EyeOff className="w-6 h-6 text-orange-500" />
                                Droit à l&apos;oubli
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Tout orthophoniste peut supprimer un dossier patient instantanément. Cette action est irréversible et entraîne la suppression définitive de toutes les données associées au patient sur nos serveurs de production.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400 font-medium">
                        Dernière mise à jour : 20 Février 2026
                    </p>
                </div>
            </main>
        </div>
    );
}
