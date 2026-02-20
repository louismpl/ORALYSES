import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OralysesLogo } from "@/components/oralyses-logo";
import { ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";

export default function MentionsLegalesPage() {
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
                    <div className="flex items-center gap-3 mb-8 text-violet-600">
                        <Scale className="w-8 h-8" />
                        <h1 className="text-4xl font-black text-gray-900 leading-none">Mentions Légales</h1>
                    </div>

                    <div className="prose prose-gray max-w-none space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du Site</h2>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-600 space-y-2">
                                <p><strong>Nom de l&apos;entreprise :</strong> Oralyses SAS</p>
                                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
                                <p><strong>Capital social :</strong> 10 000 €</p>
                                <p><strong>Siège social :</strong> Paris, France (Adresse à préciser)</p>
                                <p><strong>RCS :</strong> Paris B 123 456 789 (Exemple)</p>
                                <p><strong>Responsable de la publication :</strong> Louis Hauguel</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-600">
                                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, USA</p>
                                <p><strong>Infrastructure Données :</strong> Europe (Francfort) - AWS / MongoDB Atlas</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Propriété Intellectuelle</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Protection des Données de Santé</h2>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-2xl">
                                <p className="text-orange-900 font-bold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-orange-600" />
                                    Note Importante
                                </p>
                                <p className="text-orange-800 font-medium">
                                    Oralyses s&apos;engage à héberger les données de santé de ses utilisateurs sur des serveurs certifiés HDS (Hébergeur de Données de Santé) conformément aux dispositions de l&apos;article L.1111-8 du Code de la santé publique.
                                </p>
                            </div>
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
