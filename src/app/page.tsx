"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Gamepad2,
  BarChart3,
  Shield,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OralysesLogo } from "@/components/oralyses-logo";
import { motion, useInView, animate } from "framer-motion";

function Counter({ from, to, duration = 2, suffix = "" }: { from: number; to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration,
        onUpdate: (value) => setCount(Math.floor(value)),
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-orange-50 selection:bg-violet-100 selection:text-violet-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-orange-400 to-violet-500 p-1.5 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-orange-500/20">
              <OralysesLogo size={24} />
            </div>
            <span className="font-black text-2xl tracking-tight text-gray-900">Oralyses</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <a href="#fonctionnalites" className="hover:text-violet-600 transition-colors uppercase tracking-widest text-[11px]">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="hover:text-violet-600 transition-colors uppercase tracking-widest text-[11px]">
              Comment ça marche
            </a>
            <a href="#tarifs" className="hover:text-violet-600 transition-colors uppercase tracking-widest text-[11px]">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion">
              <Button variant="ghost" size="sm" className="font-bold text-gray-600 hover:text-gray-900">
                Connexion
              </Button>
            </Link>
            <Link href="/inscription?plan=pro">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-400 to-violet-500 hover:from-orange-500 hover:to-violet-600 text-white px-5 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-transform active:scale-95 border-none"
              >
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-10 border border-violet-100"
          >
            <Star className="w-4 h-4 fill-violet-500" />
            Conçu avec des orthophonistes certifiées
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight"
          >
            Les devoirs d&apos;orthophonie deviennent un{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">jeu</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0 7C20 7 30 1 50 1C70 1 80 7 100 7" stroke="#F28C6F" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Fini les feuilles perdues au fond du cartable. Oralyses transforme
            les exercices en mini-jeux validés cliniquement. L&apos;enfant joue,
            le parent suit, l&apos;orthophoniste ajuste.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link href="/inscription?plan=pro">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white px-10 h-14 rounded-2xl text-lg font-black shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 active:scale-95"
              >
                C&apos;est parti gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#comment-ca-marche">
              <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold border-gray-200 hover:bg-gray-50 transition-all">
                Comment ça marche ?
              </Button>
            </Link>
          </motion.div>

          {/* Stats conters */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
            {[
              { val: 40, suffix: "+", lbl: "Mini-jeux interactifs", color: "text-violet-600" },
              { val: 5, suffix: " min", lbl: "Par session quotidienne", color: "text-orange-500" },
              { val: 100, suffix: "%", lbl: "Suivi en temps réel", color: "text-violet-600" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="relative group"
              >
                <div className={`text-5xl font-black ${s.color} mb-2 tracking-tighter`}>
                  <Counter from={0} to={s.val} suffix={s.suffix} duration={2 + i * 0.5} />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-gray-400">{s.lbl}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gray-100 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100 relative group overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-100/30 blur-3xl group-hover:bg-red-200/40 transition-colors" />
              <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-8 border-b border-red-100 pb-4">
                Le problème classique
              </h3>
              <ul className="space-y-5 text-gray-600 font-medium">
                {[
                  "Feuilles d'exercices égarées ou abîmées",
                  "Consignes oubliées dès le lendemain",
                  "Aucun retour avant la prochaine séance",
                  "Stress parental et lassitude de l'enfant"
                ].map((txt, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="mt-1 w-5 h-w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-[10px] font-black italic">×</span>
                    </div>
                    {txt}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-violet-200 relative group overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-3xl group-hover:bg-white/20 transition-colors" />
              <h3 className="text-sm font-black uppercase tracking-widest text-violet-200 mb-8 border-b border-white/10 pb-4">
                La révolution Oralyses
              </h3>
              <ul className="space-y-5 font-medium">
                {[
                  "Jeux toujours dispo sur tablette ou téléphone",
                  "Séances flash de 5 min ultra-efficaces",
                  "Données de réussite chiffrées et immédiates",
                  "L'orthophoniste ajuste à distance en 2 clics"
                ].map((txt, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    {txt}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalités" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight"
            >
              Un écosystème conçu pour réussir
            </motion.h2>
            <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
              Chaque utilisateur possède une interface dédiée, simplifiée pour l&apos;usage quotidien.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Gamepad2 className="w-7 h-7" />,
                title: "Pour l'enfant",
                desc: "Des mondes colorés et stimulants. Système d'étoiles, boutique de récompenses et sessions courtes.",
                features: ["Articulation ludique", "Vocabulaire imagé", "Compréhension active"],
                color: "violet"
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Pour le parent",
                desc: "Zéro complexité technique. Un bouton jouer, des rapports de progrès et des rappels motivants.",
                features: ["Suivi en un clin d'œil", "Historique détaillé", "Calendrier assiduité"],
                color: "orange"
              },
              {
                icon: <BarChart3 className="w-7 h-7" />,
                title: "Pour l'expert",
                desc: "Dashboard analytique complet. Ajustement des niveaux et prescription de séances sur mesure.",
                features: ["Analyses prédisantes", "Gestion multi-patients", "Rapports PDF exports"],
                color: "violet"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`group bg-white rounded-[2.5rem] p-10 shadow-sm border border-${card.color}-100 hover:shadow-2xl hover:shadow-${card.color}-500/5 transition-all duration-500 hover:-translate-y-2`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-${card.color}-100 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <div className={`text-${card.color}-600`}>{card.icon}</div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{card.title}</h3>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed">{card.desc}</p>
                <div className="space-y-3">
                  {card.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${card.color}-400 group-hover:scale-150 transition-transform`} />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="py-24 px-4 bg-gray-50/50 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 text-center mb-20 tracking-tight">
            Le parcours fluide
          </h2>
          <div className="grid gap-16 relative">
            <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-violet-200 via-orange-200 to-violet-200 hidden md:block" />
            {[
              {
                step: "1",
                title: "L'orthophoniste prescrit",
                desc: "En fin de séance, l'expert choisit les jeux adaptés aux objectifs de rééducation et les assigne instantanément.",
              },
              {
                step: "2",
                title: "Le parent ouvre l'application",
                desc: "Pas de configuration complexe. Un code lie le compte, un clic lance la session de 5 minutes du jour.",
              },
              {
                step: "3",
                title: "L'enfant progresse en s'amusant",
                desc: "Les exercices deviennent des défis stimulants. L'enfant gagne des étoiles et débloque ses succès.",
              },
              {
                step: "4",
                title: "Suivi synchronisé",
                desc: "Tout le monde reste informé. L'orthophoniste analyse les résultats précis avant le rendez-vous suivant.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-10 items-start relative z-10"
              >
                <div className="w-11 h-11 rounded-full bg-white border-4 border-violet-500 shadow-xl flex items-center justify-center text-gray-900 font-black flex-shrink-0 text-lg">
                  {item.step}
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex-1 hover:shadow-lg transition-all">
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Investissez dans la réussite
            </h2>
            <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">
              Un abonnement unique pour les professionnels. L&apos;accès pour vos patients est entièrement inclus.
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest border border-emerald-100 inline-flex items-center gap-3 mb-16 mx-auto">
            <CheckCircle className="w-5 h-5 fill-emerald-500 text-white" />
            14 jours d&apos;essai gratuit — sans engagement
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left">
            {/* Pack Libéral */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-[2.5rem] p-10 border border-violet-100 shadow-xl shadow-violet-500/5 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 duration-500" />
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6 uppercase tracking-widest text-[11px] font-black text-violet-600">
                  <Star className="w-4 h-4 fill-violet-600" />
                  Indépendant
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Pack Libéral</h3>
                <p className="text-gray-500 font-medium">L&apos;outil parfait pour démarrer votre pratique numérique.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-black text-gray-900">39€</span>
                <span className="text-gray-400 font-bold">/mois</span>
              </div>
              <ul className="space-y-4 mb-12 font-bold text-gray-600">
                {["Patients illimités", "Tous les mini-jeux inclus", "Éditeur de séances", "Tableau de bord expert", "Exports PDF", "Support prioritaire"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription?plan=pro">
                <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white text-lg font-black shadow-xl transition-all active:scale-95">
                  Démarrer l&apos;essai
                </Button>
              </Link>
            </motion.div>

            {/* Pack Cabinet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative bg-white rounded-[2.5rem] p-10 border border-orange-100 shadow-xl shadow-orange-500/5 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 duration-500" />
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6 uppercase tracking-widest text-[11px] font-black text-orange-600">
                  <Users className="w-4 h-4" />
                  Multi-praticiens
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Pack Cabinet</h3>
                <p className="text-gray-500 font-medium">Optimisez la collaboration au sein de votre équipe.</p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-black text-gray-900">99€</span>
                <span className="text-gray-400 font-bold">/mois</span>
              </div>
              <ul className="space-y-4 mb-12 font-bold text-gray-600">
                {["Jusqu'à 5 praticiens", "Facturation centralisée", "Analytiques globales", "Partage de dossiers", "Support Premium VIP", "Formations équipe"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription?plan=cabinet">
                <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-violet-500 text-white text-lg font-black shadow-xl transition-all active:scale-95 border-none">
                  Inscrire le cabinet
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Parent notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 inline-flex items-center gap-4 bg-white/50 backdrop-blur-md rounded-3xl px-10 py-6 border border-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400" />
            <div className="bg-orange-100 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-left font-medium text-gray-700">
              <span className="block text-xl font-black text-gray-900">Vous êtes parent ?</span>
              L&apos;accès pour votre enfant est <span className="text-orange-600 font-black italic">intégré et gratuit</span>. L&apos;orthophoniste vous parraine via un code.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust & RGPD */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-violet-100 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">Sécurité & Données de Santé</span>
          </div>
          <p className="text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Oralyses respecte scrupuleusement le RGPD. Toutes les données sont hébergées en Europe sur des serveurs certifiés données de santé (HDS). Le chiffrement de bout en bout garantit la confidentialité absolue des dossiers de vos patients.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-orange-400 to-violet-500 p-1.5 rounded-xl">
                <OralysesLogo size={24} />
              </div>
              <span className="font-black text-2xl tracking-tight text-gray-900">Oralyses</span>
            </Link>

            <nav className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
              <Link href="/mentions-legales" className="hover:text-violet-600 transition-colors">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:text-violet-600 transition-colors">Confidentialité</Link>
              <Link href="/rgpd" className="hover:text-violet-600 transition-colors">RGPD</Link>
              <Link href="/contact" className="hover:text-violet-600 transition-colors">Contact</Link>
            </nav>

            <div className="text-right flex flex-col items-center md:items-end gap-1">
              <p className="text-sm text-gray-400 font-bold">
                &copy; {new Date().getFullYear()} Oralyses.
              </p>
              <p className="text-[10px] uppercase font-black tracking-tighter text-gray-300">Advanced Speech Therapy AI • Paris</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
