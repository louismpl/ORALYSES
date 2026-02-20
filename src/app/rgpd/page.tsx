import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OralysesLogo } from "@/components/oralyses-logo";
import { ArrowLeft, ShieldCheck, Database, UserCheck, HardDrive } from "lucide-react";

export default function RGPDPage() {
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
                    <div className="flex items-center gap-3 mb-8 text-emerald-500">
                        <ShieldCheck className="w-8 h-8" />
                        <h1 className="text-4xl font-black text-gray-900 leading-none">Conformité RGPD</h1>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-12">
                        <p className="text-xl text-gray-500 font-medium">
                            Le Règlement Général sur la Protection des Données (RGPD) est au cœur de la conception technique d&apos;Oralyses.
                        </p>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Database className="w-6 h-6 text-violet-500" />
                                Finalité du traitement
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Les données collectées par Oralyses ont pour unique finalité le suivi thérapeutique des patients et la mise en relation entre l&apos;orthophoniste et le parent pour la continuité des soins à domicile.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos Droits</h2>
                            <p className="text-gray-600 mb-6 font-medium">Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Droit d'accès", desc: "Savoir quelles données sont stockées." },
                                    { title: "Droit de rectification", desc: "Corriger des informations erronées." },
                                    { title: "Droit à l'effacement", desc: "Supprimer définitivement vos données." },
                                    { title: "Droit à la portabilité", desc: "Récupérer vos données sous format CSV/JSON." },
                                    { title: "Droit d'opposition", desc: "Refuser certains types de traitement." },
                                    { title: "Droit à la limitation", desc: "Suspendre temporairement le traitement." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
                                        <UserCheck className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <HardDrive className="w-6 h-6 text-orange-500" />
                                Conservation des données
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium font-medium">
                                Les données sont conservées pendant toute la durée du suivi thérapeutique actif. En cas d&apos;inactivité prolongée (supérieure à 24 mois sans connexion), les comptes et les données associées sont automatiquement pseudonymisés puis supprimés.
                            </p>
                        </section>

                        <section className="bg-gray-900 rounded-[2rem] p-8 text-white">
                            <h2 className="text-xl font-bold mb-4">Délégué à la Protection des Données (DPO)</h2>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez contacter notre DPO directement par email.
                            </p>
                            <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold h-12">
                                Contacter le DPO : dpo@oralyses.fr
                            </Button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
