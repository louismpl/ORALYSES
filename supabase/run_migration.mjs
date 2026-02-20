#!/usr/bin/env node
// Migration via supabase-js + service role key
// Ce script insère les jeux et ajoute la colonne custom_config_id

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://genexqtcuwpdminlkugm.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmV4cXRjdXdwZG1pbmxrdWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ0Mjc1OCwiZXhwIjoyMDg3MDE4NzU4fQ.6oXox2kXMDQ_lX2tI08b9MBaEcGfqs0mg20b-5gc9eU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Real columns in the games table: id, slug, name, description, category, config, created_at
const GAMES_TO_UPSERT = [
    {
        slug: "train-des-syllabes",
        name: "Le Train des Syllabes",
        description: "Ajoute le bon nombre de wagons selon le nombre de syllabes du mot.",
        category: "phonologie",
        config: {
            words: [
                { word: "Chat", emoji: "🐱", syllables: 1, syllable_display: "CHAT" },
                { word: "Lapin", emoji: "🐰", syllables: 2, syllable_display: "LA-PIN" },
                { word: "Éléphant", emoji: "🐘", syllables: 3, syllable_display: "É-LÉ-PHANT" },
                { word: "Papillon", emoji: "🦋", syllables: 3, syllable_display: "PA-PIL-LON" },
                { word: "Soleil", emoji: "☀️", syllables: 2, syllable_display: "SO-LEIL" },
                { word: "Crocodile", emoji: "🐊", syllables: 4, syllable_display: "CRO-CO-DI-LE" },
                { word: "Fleur", emoji: "🌸", syllables: 1, syllable_display: "FLEUR" },
                { word: "Banane", emoji: "🍌", syllables: 3, syllable_display: "BA-NA-NE" },
                { word: "Lion", emoji: "🦁", syllables: 2, syllable_display: "LI-ON" },
                { word: "Téléphone", emoji: "📱", syllables: 4, syllable_display: "TÉ-LÉ-PHO-NE" },
            ],
        },
    },
    {
        slug: "peche-aux-rimes",
        name: "La Pêche aux Rimes",
        description: "Attrape les poissons qui riment avec l'appât. Évite les autres !",
        category: "phonologie",
        config: {
            rounds: [
                {
                    bait: "Bateau", bait_emoji: "⛵", fish: [
                        { word: "Cadeau", emoji: "🎁", rhymes: true },
                        { word: "Chapeau", emoji: "🎩", rhymes: true },
                        { word: "Lapin", emoji: "🐰", rhymes: false },
                        { word: "Gâteau", emoji: "🎂", rhymes: true },
                        { word: "Maison", emoji: "🏠", rhymes: false },
                    ]
                },
                {
                    bait: "Soleil", bait_emoji: "☀️", fish: [
                        { word: "Oreille", emoji: "👂", rhymes: true },
                        { word: "Abeille", emoji: "🐝", rhymes: true },
                        { word: "Fleur", emoji: "🌸", rhymes: false },
                        { word: "Bouteille", emoji: "🍾", rhymes: true },
                        { word: "Chaton", emoji: "🐱", rhymes: false },
                    ]
                },
                {
                    bait: "Lune", bait_emoji: "🌙", fish: [
                        { word: "Dune", emoji: "🏜️", rhymes: true },
                        { word: "Brune", emoji: "🟤", rhymes: true },
                        { word: "Étoile", emoji: "⭐", rhymes: false },
                        { word: "Lion", emoji: "🦁", rhymes: false },
                        { word: "Lacune", emoji: "🕳️", rhymes: true },
                    ]
                },
                {
                    bait: "Souris", bait_emoji: "🐭", fish: [
                        { word: "Tapis", emoji: "🌀", rhymes: true },
                        { word: "Paris", emoji: "🗼", rhymes: true },
                        { word: "Cheval", emoji: "🐴", rhymes: false },
                        { word: "Pays", emoji: "🌍", rhymes: true },
                        { word: "Ballon", emoji: "🎈", rhymes: false },
                    ]
                },
            ],
        },
    },
    {
        slug: "architecte-des-phrases",
        name: "L'Architecte des Phrases",
        description: "Remets les briques-mots dans le bon ordre pour construire une phrase.",
        category: "syntaxe",
        config: {
            sentences: [
                { words: ["Le", "chat", "mange", "la", "souris"], hint: "Qui mange quoi ?" },
                { words: ["La", "fille", "court", "vite"], hint: "Que fait la fille ?" },
                { words: ["Mon", "chien", "est", "très", "gentil"], hint: "Comment est le chien ?" },
                { words: ["Elle", "lit", "un", "beau", "livre"], hint: "Que fait-elle ?" },
                { words: ["Le", "petit", "lapin", "saute", "haut"], hint: "Que fait le lapin ?" },
                { words: ["Les", "enfants", "jouent", "dans", "le", "jardin"], hint: "Où jouent les enfants ?" },
            ],
        },
    },
    {
        slug: "tri-lettres",
        name: "Le Tri B/D",
        description: "Trie rapidement les lettres B et D dans le bon côté.",
        category: "lecture",
        config: {
            pairs: [{ left_letter: "b", right_letter: "d", left_label: "Bébé", right_label: "Doigt", left_emoji: "👶", right_emoji: "☝️" }],
        },
    },
    {
        slug: "supermarche",
        name: "Le Supermarché",
        description: "Range les articles du tapis roulant dans le bon rayon.",
        category: "semantique",
        config: {
            categories: ["Fruits", "Légumes", "Animaux", "Vêtements"],
            items: [
                { name: "Pomme", emoji: "🍎", category: "Fruits" },
                { name: "Banane", emoji: "🍌", category: "Fruits" },
                { name: "Raisin", emoji: "🍇", category: "Fruits" },
                { name: "Carotte", emoji: "🥕", category: "Légumes" },
                { name: "Brocoli", emoji: "🥦", category: "Légumes" },
                { name: "Tomate", emoji: "🍅", category: "Légumes" },
                { name: "Chien", emoji: "🐶", category: "Animaux" },
                { name: "Chat", emoji: "🐱", category: "Animaux" },
                { name: "Lapin", emoji: "🐰", category: "Animaux" },
                { name: "Chapeau", emoji: "🎩", category: "Vêtements" },
                { name: "Manteau", emoji: "🧥", category: "Vêtements" },
                { name: "Chaussure", emoji: "👟", category: "Vêtements" },
            ],
        },
    },
    {
        slug: "lecteur-flash",
        name: "Le Lecteur Flash",
        description: "Un mot clignote très vite. Retrouve-le parmi 4 propositions.",
        category: "lecture",
        config: { display_ms: 600, rounds: [] },
    },
    {
        slug: "memory-contraires",
        name: "Mémory des Contraires",
        description: "Associe chaque mot à son contraire (chaud/froid, grand/petit...).",
        category: "semantique",
        config: {
            pairs: [
                { word1: "Chaud", word2: "Froid" },
                { word1: "Grand", word2: "Petit" },
                { word1: "Rapide", word2: "Lent" },
                { word1: "Jour", word2: "Nuit" },
                { word1: "Heureux", word2: "Triste" },
                { word1: "Propre", word2: "Sale" },
                { word1: "Lourd", word2: "Léger" },
                { word1: "Fort", word2: "Faible" },
            ],
        },
    },
    {
        slug: "mot-troue",
        name: "Le Mot Troué",
        description: "Complète le mot avec la bonne graphie manquante.",
        category: "orthographe",
        config: {
            items: [
                { sentence: "Un ch__al galope dans le pré.", options: ["ev", "av", "iv", "uv"], answer: "ev", full_word: "cheval" },
                { sentence: "La ma__on est grande et belle.", options: ["is", "us", "os", "as"], answer: "is", full_word: "maison" },
                { sentence: "Le chat __ort sous le lit.", options: ["d", "t", "s", "c"], answer: "d", full_word: "dort" },
                { sentence: "Il mange une belle __omme.", options: ["p", "b", "d", "f"], answer: "p", full_word: "pomme" },
                { sentence: "La __eur sent très bon.", options: ["fl", "bl", "cl", "gl"], answer: "fl", full_word: "fleur" },
            ],
        },
    },
    {
        slug: "course-des-accords",
        name: "La Course des Accords",
        description: "Choisis la bonne conjugaison pour que le coureur passe la porte !",
        category: "grammaire",
        config: {
            items: [
                { sentence: "Les chats ___ dans le jardin.", choices: ["courent", "court", "coure"], answer: "courent" },
                { sentence: "Elle ___ une belle chanson.", choices: ["chante", "chantent", "chantes"], answer: "chante" },
                { sentence: "Nous ___ au parc demain.", choices: ["allons", "allez", "vont"], answer: "allons" },
                { sentence: "Je ___ très fatigué.", choices: ["suis", "est", "sont"], answer: "suis" },
                { sentence: "Ils ___ leurs devoirs.", choices: ["font", "fait", "fais"], answer: "font" },
            ],
        },
    },
    {
        slug: "qui-est-ce",
        name: "Qui Est-Ce ?",
        description: "Trouve le personnage selon les indices logiques.",
        category: "comprehension",
        config: {
            rounds: [
                {
                    characters: [
                        { id: "1", emoji: "👦", name: "Tom", traits: ["chapeau", "lunettes", "sourire"] },
                        { id: "2", emoji: "👧", name: "Léa", traits: ["chapeau", "sourire"] },
                        { id: "3", emoji: "👴", name: "Papi", traits: ["lunettes", "moustache"] },
                        { id: "4", emoji: "👩", name: "Marie", traits: ["sourire"] },
                    ],
                    clues: [
                        { text: "Il/Elle a un chapeau", mustHave: ["chapeau"], mustNotHave: [] },
                        { text: "Il/Elle n'a PAS de lunettes", mustHave: [], mustNotHave: ["lunettes"] },
                    ],
                    answer: "2",
                },
                {
                    characters: [
                        { id: "1", emoji: "🧔", name: "Pierre", traits: ["barbe", "chapeau", "grand"] },
                        { id: "2", emoji: "👱", name: "Jules", traits: ["chapeau", "grand"] },
                        { id: "3", emoji: "👩‍🦰", name: "Emma", traits: ["barbe", "petit"] },
                        { id: "4", emoji: "🧒", name: "Luc", traits: ["grand"] },
                    ],
                    clues: [
                        { text: "Il/Elle est grand(e)", mustHave: ["grand"], mustNotHave: [] },
                        { text: "Il/Elle n'a PAS de barbe", mustHave: [], mustNotHave: ["barbe"] },
                        { text: "Il/Elle a un chapeau", mustHave: ["chapeau"], mustNotHave: [] },
                    ],
                    answer: "2",
                },
            ],
        },
    },
    {
        slug: "compte-est-bon",
        name: "Le Compte Est Bon",
        description: "Éclate les bulles dont la somme est égale au nombre cible !",
        category: "maths",
        config: { target: 10 },
    },
    {
        slug: "serpent-siffleur",
        name: "Le Serpent Siffleur",
        description: "Fais 'SSSS' dans le micro pour faire monter le serpent. Évite les rochers !",
        category: "souffle",
        config: { sensitivity: 0.02 },
    },
    {
        slug: "tapis-volant-du-temps",
        name: "Le Tapis Volant du Temps",
        description: "Pose chaque phrase sur le bon nuage : Hier (Passé), Aujourd'hui (Présent), ou Demain (Futur).",
        category: "grammaire",
        config: {
            items: [
                { sentence: "Je mangerai une pomme.", answer: "future", verb_hint: "mangerai" },
                { sentence: "Elle joue dans le jardin.", answer: "present", verb_hint: "joue" },
                { sentence: "Il a couru très vite.", answer: "past", verb_hint: "a couru" },
                { sentence: "Nous partirons demain matin.", answer: "future", verb_hint: "partirons" },
                { sentence: "Les enfants dorment.", answer: "present", verb_hint: "dorment" },
                { sentence: "Tu as mangé toute la tarte.", answer: "past", verb_hint: "as mangé" },
                { sentence: "Je serai médecin plus tard.", answer: "future", verb_hint: "serai" },
                { sentence: "Papa prépare le dîner.", answer: "present", verb_hint: "prépare" },
                { sentence: "Nous sommes allés à la plage.", answer: "past", verb_hint: "sommes allés" },
            ],
        },
    },
    {
        slug: "conjugueur-fou",
        name: "Le Conjugueur Fou",
        description: "Conjugue vite ! Pronom + Infinitif → clique la bonne forme avant le chrono.",
        category: "grammaire",
        config: {
            items: [
                { pronoun: "NOUS", infinitive: "CHANTER", tense: "présent", choices: ["chantons", "chantez", "chantent", "chantes"], answer: "chantons" },
                { pronoun: "IL", infinitive: "MANGER", tense: "présent", choices: ["mange", "mangeons", "mangent", "manges"], answer: "mange" },
                { pronoun: "VOUS", infinitive: "PARTIR", tense: "présent", choices: ["partez", "pars", "partent", "partons"], answer: "partez" },
                { pronoun: "ILS", infinitive: "JOUER", tense: "présent", choices: ["jouent", "joue", "jouons", "jouez"], answer: "jouent" },
                { pronoun: "TU", infinitive: "FINIR", tense: "présent", choices: ["finis", "finit", "finissons", "finissez"], answer: "finis" },
                { pronoun: "JE", infinitive: "AVOIR", tense: "présent", choices: ["ai", "as", "avons", "ont"], answer: "ai" },
                { pronoun: "ELLE", infinitive: "ÊTRE", tense: "présent", choices: ["est", "es", "sont", "sommes"], answer: "est" },
                { pronoun: "NOUS", infinitive: "ALLER", tense: "présent", choices: ["allons", "allez", "vont", "vas"], answer: "allons" },
                { pronoun: "ILS", infinitive: "FAIRE", tense: "présent", choices: ["font", "fais", "fait", "faisons"], answer: "font" },
                { pronoun: "TU", infinitive: "VOULOIR", tense: "présent", choices: ["veux", "veut", "voulons", "voulez"], answer: "veux" },
            ],
        },
    },
    {
        slug: "train-des-natures",
        name: "Le Train des Natures",
        description: "Chaque mot va dans le bon wagon : Nom (bleu), Verbe (rouge) ou Adjectif (vert).",
        category: "grammaire",
        config: {
            items: [
                { word: "Maison", nature: "nom", emoji: "🏠" },
                { word: "Courir", nature: "verbe", emoji: "🏃" },
                { word: "Petit", nature: "adjectif", emoji: "🐜" },
                { word: "Chien", nature: "nom", emoji: "🐶" },
                { word: "Manger", nature: "verbe", emoji: "🍴" },
                { word: "Grand", nature: "adjectif", emoji: "🏔️" },
                { word: "Fleur", nature: "nom", emoji: "🌸" },
                { word: "Dormir", nature: "verbe", emoji: "😴" },
                { word: "Rouge", nature: "adjectif", emoji: "🔴" },
                { word: "Soleil", nature: "nom", emoji: "☀️" },
                { word: "Jouer", nature: "verbe", emoji: "🎮" },
                { word: "Joyeux", nature: "adjectif", emoji: "😊" },
                { word: "Livre", nature: "nom", emoji: "📚" },
                { word: "Chanter", nature: "verbe", emoji: "🎵" },
                { word: "Belle", nature: "adjectif", emoji: "✨" },
            ],
        },
    },
];

// Existing games to rename (no config change)
const GAMES_TO_RENAME = [
    {
        slug: "attrape-les-sons",
        name: "Rime le Mot",
        description: "Attrape les mots qui contiennent le bon son. Un jeu de discrimination auditive et de phonologie !",
        category: "phonologie",
    },
    {
        slug: "memory-vocabulaire",
        name: "Jeu de Mémoire",
        description: "Retrouve les paires image-mot cachées sous les cartes. Entraîne ta mémoire et ton vocabulaire !",
        category: "semantique",
    },
    {
        slug: "simon-dit",
        name: "Suis les Consignes",
        description: "Écoute et touche la bonne forme selon les instructions. Entraîne ta compréhension et ton attention !",
        category: "comprehension",
    },
];

async function main() {
    console.log("🚀 Migration Supabase — Oralyses\n");

    // ─── 1. Rename existing games ─────────────────────────────────────────────
    console.log("✏️  Renommage des 3 premiers jeux...");
    for (const g of GAMES_TO_RENAME) {
        const { error } = await supabase
            .from("games")
            .update({ name: g.name, description: g.description, category: g.category })
            .eq("slug", g.slug);

        if (error) console.error(`  ❌ ${g.slug}: ${error.message}`);
        else console.log(`  ✅ ${g.slug} → "${g.name}"`);
    }

    // ─── 2. Upsert new games ──────────────────────────────────────────────────
    console.log("\n🎮 Insertion des 15 nouveaux jeux...");
    for (const g of GAMES_TO_UPSERT) {
        // Check if exists
        const { data: existing } = await supabase.from("games").select("id").eq("slug", g.slug).single();

        if (existing) {
            const { error } = await supabase.from("games").update({ name: g.name, description: g.description, category: g.category, config: g.config }).eq("slug", g.slug);
            if (error) console.error(`  ❌ UPDATE ${g.slug}: ${error.message}`);
            else console.log(`  ✏️  Mis à jour: ${g.name}`);
        } else {
            const { error } = await supabase.from("games").insert({ slug: g.slug, name: g.name, description: g.description, category: g.category, config: g.config });
            if (error) console.error(`  ❌ INSERT ${g.slug}: ${error.message}`);
            else console.log(`  ✅ Inséré: ${g.name}`);
        }
    }

    // ─── 3. Add custom_config_id column via calling a DB function ─────────────
    console.log("\n🔧 Ajout de la colonne custom_config_id dans assignments...");
    // Try to call an RPC function if it exists
    const { error: rpcError } = await supabase.rpc("exec_sql", {
        sql: "ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS custom_config_id UUID REFERENCES public.custom_game_configs(id) ON DELETE SET NULL;"
    });

    if (rpcError) {
        // RPC doesn't exist — try inserting a record with the column to test
        console.log("  ⚠️  Impossible d'ajouter la colonne automatiquement via RPC.");
        console.log("  📋 Vous devez exécuter manuellement dans Supabase SQL Editor:");
        console.log("     ALTER TABLE public.assignments");
        console.log("       ADD COLUMN IF NOT EXISTS custom_config_id UUID");
        console.log("       REFERENCES public.custom_game_configs(id) ON DELETE SET NULL;");
    } else {
        console.log("  ✅ Colonne custom_config_id ajoutée avec succès");
    }

    console.log("\n✅ Migration terminée !");

    // ─── 4. Verify ─────────────────────────────────────────────────────────────
    const { data: allGames } = await supabase.from("games").select("slug, name").order("created_at");
    console.log(`\n📊 ${allGames?.length || 0} jeux en base :`);
    allGames?.forEach(g => console.log(`   • ${g.name} (${g.slug})`));
}

main().catch(console.error);
