import Link from "next/link";
import {
  Gamepad2,
  BarChart3,
  Shield,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
              Speech Play
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fonctionnalites" className="hover:text-violet-600 transition-colors">
              Fonctionnalites
            </a>
            <a href="#comment-ca-marche" className="hover:text-violet-600 transition-colors">
              Comment ca marche
            </a>
            <a href="#tarifs" className="hover:text-violet-600 transition-colors">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/inscription">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
              >
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Concu avec des orthophonistes certifiees
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Les devoirs d&apos;orthophonie deviennent un{" "}
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">
              jeu
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Fini les feuilles perdues au fond du cartable. Speech Play transforme
            les exercices en mini-jeux valides cliniquement. L&apos;enfant joue,
            le parent suit, l&apos;orthophoniste ajuste.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/inscription">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white px-8 h-12 text-base"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#comment-ca-marche">
              <Button variant="outline" size="lg" className="h-12 text-base">
                Decouvrir comment ca marche
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-violet-600">3</div>
              <div className="text-sm text-gray-500 mt-1">Mini-jeux</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">5 min</div>
              <div className="text-sm text-gray-500 mt-1">Par session</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-600">100%</div>
              <div className="text-sm text-gray-500 mt-1">Suivi en temps reel</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-50 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-red-700 mb-4">
                Le probleme
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-red-400 mt-0.5">x</span>
                  Feuilles d&apos;exercices perdues dans le cartable
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-0.5">x</span>
                  Consignes oubliees par mercredi
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-0.5">x</span>
                  Aucun suivi entre les seances
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 mt-0.5">x</span>
                  Culpabilite des parents, frustration du therapeute
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                La solution Speech Play
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Jeux accessibles en un clic sur tablette ou telephone
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Sessions courtes de 5-7 min adaptees a l&apos;attention de l&apos;enfant
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Donnees objectives pour chaque session
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Le therapeute voit tout avant le prochain RDV
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trois vues, un seul objectif
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Chaque utilisateur a exactement ce dont il a besoin. Ni plus, ni moins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-violet-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pour l&apos;enfant
              </h3>
              <p className="text-gray-600 mb-4">
                Des mini-jeux colores et engageants. Systeme d&apos;etoiles, avatar personnalisable, sessions courtes.
              </p>
              <ul className="text-sm text-gray-500 space-y-1.5">
                <li>- Attrape les Sons (articulation)</li>
                <li>- Memory Vocabulaire</li>
                <li>- Simon Dit (comprehension)</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pour le parent
              </h3>
              <p className="text-gray-600 mb-4">
                Interface simple : bouton jouer, barre de progres, historique des sessions. Aucune competence technique requise.
              </p>
              <ul className="text-sm text-gray-500 space-y-1.5">
                <li>- Suivi quotidien et streak</li>
                <li>- Rappels automatiques</li>
                <li>- Rapport hebdomadaire</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-violet-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pour l&apos;orthophoniste
              </h3>
              <p className="text-gray-600 mb-4">
                Dashboard complet : assigner des jeux, voir les taux de completion, identifier les points de blocage.
              </p>
              <ul className="text-sm text-gray-500 space-y-1.5">
                <li>- Gestion multi-patients</li>
                <li>- Analytiques detaillees</li>
                <li>- Prescription en 2 clics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Comment ca marche
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "L'orthophoniste prescrit",
                desc: "En fin de seance, le therapeute choisit les jeux adaptes aux objectifs de l'enfant et les assigne en 2 clics depuis son dashboard.",
              },
              {
                step: "2",
                title: "Le parent lance l'app",
                desc: "Un code unique lie le compte parent au patient. Le parent ouvre l'app, appuie sur Jouer, et l'enfant commence sa session de 5 minutes.",
              },
              {
                step: "3",
                title: "L'enfant joue et progresse",
                desc: "Des mini-jeux colores avec systeme d'etoiles et avatar. L'enfant s'amuse, ses resultats sont enregistres automatiquement.",
              },
              {
                step: "4",
                title: "Tout le monde sait",
                desc: "Le parent voit la progression. L'orthophoniste consulte les donnees avant le prochain rendez-vous. Fini le 'Oui oui, on a fait les exercices...'",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-gray-600">
              Commencez gratuitement. Passez au premium quand vous voulez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Gratuit</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">0 EUR</span>
                <span className="text-gray-500">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  1 jeu accessible
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Suivi basique
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  1 patient
                </li>
              </ul>
              <Link href="/inscription">
                <Button variant="outline" className="w-full">
                  Commencer
                </Button>
              </Link>
            </div>

            {/* Family */}
            <div className="bg-gradient-to-b from-violet-50 to-white rounded-2xl p-8 border-2 border-violet-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-orange-400 text-white text-xs font-medium px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Famille</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">15 EUR</span>
                <span className="text-gray-500">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  Tous les jeux
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  Suivi complet et rapports
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  Jusqu&apos;a 3 enfants
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  Rappels quotidiens
                </li>
              </ul>
              <Link href="/inscription">
                <Button className="w-full bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white">
                  Essayer 14 jours gratuits
                </Button>
              </Link>
            </div>

            {/* Clinic */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cabinet</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">45 EUR</span>
                <span className="text-gray-500">/ortho/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Dashboard therapeute complet
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Patients illimites
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Analytiques avancees
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Support prioritaire
                </li>
              </ul>
              <Link href="/inscription">
                <Button variant="outline" className="w-full">
                  Contacter l&apos;equipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RGPD Banner */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-violet-600" />
            <span className="font-semibold text-gray-900">
              Conforme RGPD &amp; Donnees de sante
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Vos donnees sont hebergees en Europe, chiffrees et conformes a la
            reglementation sur les donnees de sante des mineurs. Aucune donnee
            n&apos;est partagee avec des tiers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Speech Play</span>
          </div>
          <p className="text-sm text-gray-500">
            2026 Speech Play. Tous droits reserves.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">
              Mentions legales
            </a>
            <a href="#" className="hover:text-gray-900">
              Confidentialite
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
