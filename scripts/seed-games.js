const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple env loader
const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
envLines.forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('Seeding games...');

    const gamesData = [
        {
            slug: 'virelangues',
            name: 'Virelangues Rigolos',
            description: "Répéter des phrases complexes pour améliorer l'articulation rapide.",
            category: 'prononciation',
            config: {
                items: [
                    { text: "Un dragon gradé dégrada un gradé dragon.", target_son: "gr" },
                    { text: "Les chaussettes de l'archiduchesse sont-elles sèches ?", target_son: "ch/s" },
                    { text: "Six saucissons secs sans sel.", target_son: "s" },
                    { text: "Fruit frais, fruit frit, fruit cuit, fruit cru.", target_son: "fr" },
                    { text: "Son chat chante sa chanson.", target_son: "ch/s" },
                    { text: "Trois tortues trottaient sur trois toits très étroits.", target_son: "tr" },
                    { text: "Gros gras grain d'orge, quand te dégros-gras-grain-d'orgeras-tu ?", target_son: "gr" },
                    { text: "Petit pot de beurre, quand te dépetit-pot-de-beurrereras-tu ?", target_son: "p/b" },
                    { text: "Le chasseur sache chasser sans son chien.", target_son: "ch/s" },
                    { text: "Cinq chiens chassent six chats.", target_son: "ch/s" }
                ]
            }
        },
        {
            slug: 'souffle-plume',
            name: 'Souffle sur la Plume',
            description: 'Contrôler son souffle pour renforcer les muscles buccaux.',
            category: 'prononciation',
            config: { sensitivity: 0.05, target_duration: 15, rounds: 10 }
        },
        {
            slug: 'miroir-grimaces',
            name: 'Miroir des Grimaces',
            description: 'Imiter des expressions pour travailler les praxies bucco-faciales.',
            category: 'prononciation',
            config: {
                grimaces: [
                    { name: "Le bisou", instruction: "Fais des lèvres en avant comme pour un bisou.", image: "kiss" },
                    { name: "Le grand sourire", instruction: "Montre toutes tes dents avec un grand sourire.", image: "smile" },
                    { name: "Le poisson", instruction: "Aspire tes joues vers l'intérieur.", image: "fish" },
                    { name: "Le gonflage", instruction: "Gonfle tes deux joues d'air.", image: "ball" },
                    { name: "La langue au nez", instruction: "Essaie de toucher ton nez avec ta langue.", image: "tongue" },
                    { name: "La bouche en O", instruction: "Fais un grand O avec ta bouche.", image: "ball" },
                    { name: "Gonfler une joue", instruction: "Gonfle seulement la joue gauche.", image: "ball" },
                    { name: "Gonfler l'autre joue", instruction: "Gonfle seulement la joue droite.", image: "ball" },
                    { name: "Claquement", instruction: "Fais claquer ta langue contre ton palais.", image: "tongue" },
                    { name: "Vibration", instruction: "Fais vibrer tes lèvres comme un moteur.", image: "ball" }
                ]
            }
        },
        {
            slug: 'amuz-bouch',
            name: "Amuz'Bouch",
            description: 'Exercices ludiques de motricité bucco-maxillaire.',
            category: 'prononciation',
            config: { exercises: ["Langue à gauche", "Langue à droite", "Claquer la langue", "Faire vibrer les lèvres"] }
        },
        {
            slug: 'sons-animaux',
            name: 'Sons des Animaux',
            description: "Discrimination auditive et reproduction de cris d'animaux.",
            category: 'prononciation',
            config: {
                animals: [
                    { name: "Le Lion", text: "Grrr !" }, { name: "Le Chat", text: "Miaou !" },
                    { name: "La Vache", text: "Meuh !" }, { name: "Le Cochon", text: "Groin !" },
                    { name: "Le Serpent", text: "Sss !" }, { name: "Le Chien", text: "Ouaf !" },
                    { name: "L'Oiseau", text: "Piou !" }, { name: "Le Mouton", text: "Bêê !" },
                    { name: "Le Coq", text: "Cocorico !" }, { name: "L'Abeille", text: "Bzzz !" }
                ]
            }
        },
        {
            slug: 'serpent-siffleur',
            name: 'Serpent Siffleur',
            description: 'Éviter les obstacles en articulant des sons continus.',
            category: 'prononciation',
            config: { sensitivity: 0.05 }
        },
        {
            slug: 'attrape-les-sons',
            name: 'Attrape les Sons',
            description: 'Identifier si un mot contient un son cible.',
            category: 'articulation',
            config: {
                sound_pairs: [{
                    target: "ch", distractor: "s", words: [
                        { word: "Chat", target: true, image: "cat" }, { word: "Sac", target: false, image: "bag" },
                        { word: "Chien", target: true, image: "dog" }, { word: "Soleil", target: false, image: "sun" },
                        { word: "Chaussure", target: true, image: "shoe" }, { word: "Vache", target: true, image: "cow" },
                        { word: "Singe", target: false, image: "monkey" }, { word: "Soupe", target: false, image: "soup" },
                        { word: "Chemise", target: true, image: "shirt" }, { word: "Ciseau", target: false, image: "scissors" },
                        { word: "Douche", target: true, image: "shower" }, { word: "Sable", target: false, image: "sun" },
                        { word: "Chocolat", target: true, image: "cake" }, { word: "Salade", target: false, image: "soup" }
                    ]
                }]
            }
        },
        {
            slug: 'prononcio',
            name: 'Prononcio',
            description: 'Distinguer des sons proches.',
            category: 'articulation',
            config: {
                pairs: [{
                    son1: "S", son2: "CH", words: [
                        { word: "Souris", target: 1 }, { word: "Chou", target: 2 }, { word: "Sac", target: 1 },
                        { word: "Chat", target: 2 }, { word: "Poisson", target: 1 }, { word: "Poche", target: 2 },
                        { word: "Singe", target: 1 }, { word: "Chateau", target: 2 }, { word: "Soleil", target: 1 }
                    ]
                }]
            }
        },
        {
            slug: 'prononcio-s-z',
            name: 'Prononcio S/Z',
            description: 'S (sifflement) vs Z (bourdonnement).',
            category: 'articulation',
            config: {
                pairs: [{
                    son1: "S", son2: "Z", words: [
                        { word: "Poisson", target: 1 }, { word: "Poison", target: 2 }, { word: "Dessert", target: 1 },
                        { word: "Désert", target: 2 }, { word: "Cousin", target: 2 }, { word: "Coussin", target: 1 }
                    ]
                }]
            }
        },
        { slug: 'prononcio-f-v', name: 'Prononcio F/V', description: 'F (vent) vs V (moteur).', category: 'articulation', config: { pairs: [] } },
        { slug: 'prononcio-p-b', name: 'Prononcio P/B', description: 'P (explosion) vs B (bulle).', category: 'articulation', config: { pairs: [] } },
        { slug: 'prononcio-t-d', name: 'Prononcio T/D', description: 'T (tic-tac) vs D (tambour).', category: 'articulation', config: { pairs: [] } },
        {
            slug: 'chiffon-cochon',
            name: 'Chiffon le Cochon',
            description: 'Focus sur les sons /ch/ et /f/.',
            category: 'articulation',
            config: {
                title: "Chiffon le Cochon", pages: [
                    { text: "C'est Chiffon le cochon.", focusWord: "Chiffon", emoji: "🐷" },
                    { text: "Il a un beau chapeau.", focusWord: "chapeau", emoji: "🎩" },
                    { text: "Il cherche ses amis.", focusWord: "cherche", emoji: "🔍" },
                    { text: "Il souffle sur les fleurs.", focusWord: "souffle", emoji: "🌸" },
                    { text: "Il voit une fourmi.", focusWord: "fourmi", emoji: "🐜" }
                ]
            }
        },
        { slug: 'jean-geant', name: 'Jean le Géant', description: 'Focus sur les sons /j/ et /g/.', category: 'articulation', config: { title: "Jean le Géant", pages: [] } },
        { slug: 'telephones-chuchoteurs', name: 'Tél. Chuchoteurs', description: "S'écouter chuchoter.", category: 'articulation', config: { instructions: [] } },
        {
            slug: 'memory-vocabulaire',
            name: 'Memory Vocabulaire',
            description: 'Associer mots et images.',
            category: 'vocabulaire',
            config: { themes: [{ name: "Animaux", pairs: [{ word: "Lion", image: "lion" }, { word: "Singe", image: "monkey" }, { word: "Chat", image: "cat" }, { word: "Chien", image: "dog" }, { word: "Lapin", image: "rabbit" }, { word: "Cheval", image: "horse" }] }] }
        },
        {
            slug: 'boite-surprises',
            name: 'Boîte à Surprises',
            description: 'Nommer les objets qui sortent.',
            category: 'vocabulaire',
            config: { items: [{ word: "Pomme", emoji: "🍎" }, { word: "Voiture", emoji: "🚗" }, { word: "Cadeau", emoji: "🎁" }, { word: "Ballon", emoji: "🎈" }, { word: "Livre", emoji: "📖" }, { word: "Brosse", emoji: "🪮" }, { word: "Clé", emoji: "🔑" }, { word: "Stylo", emoji: "🖊️" }] }
        },
        {
            slug: 'mimes-actions',
            name: "Mimes d'Actions",
            description: "Nommer des verbes d'action.",
            category: 'vocabulaire',
            config: { items: [{ word: "Manger", emoji: "🍴" }, { word: "Dormir", emoji: "😴" }, { word: "Courir", emoji: "🏃" }, { word: "Sauter", emoji: "🦘" }, { word: "Boire", emoji: "🥛" }, { word: "Lire", emoji: "📖" }, { word: "Chanter", emoji: "🎤" }, { word: "Danser", emoji: "💃" }] }
        },
        { slug: 'devinettes-objets', name: 'Devinettes Objets', description: 'Travailler les définitions.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'de-premiers-mots', name: 'Dé des Premiers Mots', description: 'Sitmulation précoce.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'loto-pronoms', name: 'Loto des Pronoms', description: 'Il/Elle.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'memory-contraires', name: 'Memory Contraires', description: 'Associer les antonymes.', category: 'vocabulaire', config: { pairs: [] } },
        { slug: 'supermarche', name: 'Le Supermarché', description: 'Catégorisation.', category: 'vocabulaire', config: { categories: ["Fruits", "Légumes"] } },
        {
            slug: 'imagier-couleurs',
            name: 'Imagier Couleurs',
            description: 'Apprendre les couleurs.',
            category: 'vocabulaire',
            config: { items: [{ word: "Rouge", emoji: "🔴" }, { word: "Bleu", emoji: "🔵" }, { word: "Jaune", emoji: "🟡" }, { word: "Vert", emoji: "🟢" }, { word: "Orange", emoji: "🟠" }, { word: "Violet", emoji: "🟣" }, { word: "Rose", emoji: "💗" }, { word: "Noir", emoji: "⚫" }] }
        },
        { slug: 'imagier-corps', name: 'Mon Corps', description: 'Apprendre les parties du corps.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'imagier-ecole', name: 'Mon École', description: 'Vocabulaire scolaire.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'imagier-transports', name: 'Transports', description: 'Véhicules.', category: 'vocabulaire', config: { items: [] } },
        { slug: 'train-des-syllabes', name: 'Train des Syllabes', description: 'Compter les syllabes.', category: 'phonologie', config: { items: [{ word: "Chat", syllables: 1 }] } },
        { slug: 'peche-aux-rimes', name: 'Pêche aux Rimes', description: 'Identifier les rimes.', category: 'phonologie', config: { bait: "Bateau", options: ["Cadeau"] } },
        { slug: 'bizarre-bizarre', name: 'Bizarre, Bizarre !', description: 'Sons complexes.', category: 'phonologie', config: { items: [] } },
        { slug: 'langue-au-chat', name: 'Langue au Chat', description: 'Répondre en articulant.', category: 'phonologie', config: { questions: [] } },
        { slug: 'simon-dit', name: 'Simon Dit', description: 'Écouter et obéir.', category: 'compréhension', config: { levels: [] } },
        { slug: 'qui-est-ce', name: 'Qui est-ce ?', description: 'Inférences.', category: 'compréhension', config: { rounds: [] } },
        { slug: 'architecte-des-phrases', name: 'Arch. des Phrases', description: 'Ordre des mots.', category: 'syntaxe', config: { sentences: [] } },
        { slug: 'spirale-pronoms', name: 'Spirale des Pronoms', description: 'Pronoms.', category: 'grammaire', config: { rounds: [] } },
        { slug: 'conjugueur-fou', name: 'Conjugueur Fou', description: 'Conjugaisons.', category: 'grammaire', config: { items: [] } },
        { slug: 'course-des-accords', name: 'Course des Accords', description: 'Accords.', category: 'grammaire', config: { items: [] } },
        { slug: 'train-des-natures', name: 'Train des Natures', description: 'Natures de mots.', category: 'grammaire', config: { items: [] } },
        { slug: 'tapis-volant-du-temps', name: 'Tapis du Temps', description: 'Fronologie temporelle.', category: 'grammaire', config: { items: [] } },
        { slug: 'lecteur-flash', name: 'Lecteur Flash', description: 'Vitesse de lecture.', category: 'lecture', config: { words: [] } },
        { slug: 'mot-troue', name: 'Le Mot Troué', description: 'Orthographe.', category: 'orthographe', config: { items: [] } },
        { slug: 'tri-lettres', name: 'Tri des Lettres', description: 'Discrim. visuelle.', category: 'lecture', config: { pairs: [] } },
        { slug: 'bulles-mots', name: 'Bulles de Mots', description: 'Souffle et parole.', category: 'oral', config: { words: [] } },
        { slug: 'histoires-libres', name: 'Histoires Libres', description: 'Expression libre.', category: 'oral', config: { prompts: ["Raconte ta journée"] } },
        { slug: 'compte-est-bon', name: 'Le Compte est Bon', description: 'Numération.', category: 'numération', config: { target: 10 } }
    ];

    for (const game of gamesData) {
        const { error } = await supabase
            .from('games')
            .upsert(game, { onConflict: 'slug' });

        if (error) {
            console.error(`Error inserting game ${game.slug}:`, error.message);
        } else {
            console.log(`Successfully seeded game: ${game.slug}`);
        }
    }

    console.log('Done!');
}

seed();
