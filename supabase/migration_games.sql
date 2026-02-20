-- =============================================
-- Oralyses — Migrations complètes
-- À exécuter dans le SQL Editor de Supabase
-- Ordre : 1. Exécuter ce fichier COMPLET
-- =============================================

-- ─── 1. Colonne custom_config_id dans assignments ─────────────────────────────
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS custom_config_id UUID REFERENCES public.custom_game_configs(id) ON DELETE SET NULL;

-- ─── 2. Insertion des 15 nouveaux jeux ────────────────────────────────────────
INSERT INTO public.games (slug, name, description, category, icon, min_age, max_age, config, difficulty_levels)
VALUES

('train-des-syllabes', 'Le Train des Syllabes',
 'Ajoute le bon nombre de wagons selon le nombre de syllabes du mot.',
 'phonologie', '🚂', 4, 10,
 '{"words": [
   {"word":"Chat","emoji":"🐱","syllables":1,"syllable_display":"CHAT"},
   {"word":"Lapin","emoji":"🐰","syllables":2,"syllable_display":"LA-PIN"},
   {"word":"Éléphant","emoji":"🐘","syllables":3,"syllable_display":"É-LÉ-PHANT"},
   {"word":"Papillon","emoji":"🦋","syllables":3,"syllable_display":"PA-PIL-LON"},
   {"word":"Soleil","emoji":"☀️","syllables":2,"syllable_display":"SO-LEIL"},
   {"word":"Crocodile","emoji":"🐊","syllables":4,"syllable_display":"CRO-CO-DI-LE"},
   {"word":"Fleur","emoji":"🌸","syllables":1,"syllable_display":"FLEUR"},
   {"word":"Banane","emoji":"🍌","syllables":3,"syllable_display":"BA-NA-NE"},
   {"word":"Lion","emoji":"🦁","syllables":2,"syllable_display":"LI-ON"},
   {"word":"Téléphone","emoji":"📱","syllables":4,"syllable_display":"TÉ-LÉ-PHO-NE"}
 ]}',
 3),

('peche-aux-rimes', 'La Pêche aux Rimes',
 'Attrape les poissons qui riment avec l''appât. Évite les autres !',
 'phonologie', '🎣', 4, 9,
 '{"rounds": [
   {"bait":"Bateau","bait_emoji":"⛵","fish":[{"word":"Cadeau","emoji":"🎁","rhymes":true},{"word":"Chapeau","emoji":"🎩","rhymes":true},{"word":"Lapin","emoji":"🐰","rhymes":false},{"word":"Gâteau","emoji":"🎂","rhymes":true},{"word":"Maison","emoji":"🏠","rhymes":false}]},
   {"bait":"Soleil","bait_emoji":"☀️","fish":[{"word":"Oreille","emoji":"👂","rhymes":true},{"word":"Abeille","emoji":"🐝","rhymes":true},{"word":"Fleur","emoji":"🌸","rhymes":false},{"word":"Bouteille","emoji":"🍾","rhymes":true},{"word":"Chaton","emoji":"🐱","rhymes":false}]},
   {"bait":"Souris","bait_emoji":"🐭","fish":[{"word":"Tapis","emoji":"🌀","rhymes":true},{"word":"Paris","emoji":"🗼","rhymes":true},{"word":"Cheval","emoji":"🐴","rhymes":false},{"word":"Pays","emoji":"🌍","rhymes":true},{"word":"Ballon","emoji":"🎈","rhymes":false}]},
   {"bait":"Lune","bait_emoji":"🌙","fish":[{"word":"Dune","emoji":"🏜️","rhymes":true},{"word":"Une","emoji":"1️⃣","rhymes":true},{"word":"Étoile","emoji":"⭐","rhymes":false},{"word":"Brune","emoji":"🟤","rhymes":true},{"word":"Lion","emoji":"🦁","rhymes":false}]}
 ]}',
 3),

('architecte-des-phrases', 'L''Architecte des Phrases',
 'Remets les briques-mots dans le bon ordre pour construire une phrase.',
 'syntaxe', '🧱', 5, 12,
 '{"sentences": [
   {"words":["Le","chat","mange","la","souris"],"hint":"Qui mange quoi ?"},
   {"words":["La","fille","court","vite"],"hint":"Que fait la fille ?"},
   {"words":["Mon","chien","est","très","gentil"],"hint":"Comment est le chien ?"},
   {"words":["Elle","lit","un","beau","livre"],"hint":"Que fait-elle ?"},
   {"words":["Le","petit","lapin","saute","haut"],"hint":"Que fait le lapin ?"}
 ]}',
 3),

('tri-lettres', 'Le Tri B/D',
 'Trie rapidement les lettres B et D dans le bon côté.',
 'lecture', '🔤', 5, 10,
 '{"pairs": [{"left_letter":"b","right_letter":"d","left_label":"Bébé","right_label":"Doigt","left_emoji":"👶","right_emoji":"☝️"}]}',
 3),

('supermarche', 'Le Supermarché',
 'Range les articles du tapis roulant dans le bon rayon.',
 'semantique', '🛒', 4, 10,
 '{"categories":["Fruits","Légumes","Animaux","Vêtements"],"items":[
   {"name":"Pomme","emoji":"🍎","category":"Fruits"},
   {"name":"Banane","emoji":"🍌","category":"Fruits"},
   {"name":"Carotte","emoji":"🥕","category":"Légumes"},
   {"name":"Brocoli","emoji":"🥦","category":"Légumes"},
   {"name":"Chien","emoji":"🐶","category":"Animaux"},
   {"name":"Chat","emoji":"🐱","category":"Animaux"},
   {"name":"Chapeau","emoji":"🎩","category":"Vêtements"},
   {"name":"Manteau","emoji":"🧥","category":"Vêtements"}
 ]}',
 3),

('lecteur-flash', 'Le Lecteur Flash',
 'Un mot clignote très vite. Retrouve-le parmi 4 propositions.',
 'lecture', '⚡', 6, 12,
 '{"display_ms": 600, "rounds": []}',
 3),

('memory-contraires', 'Mémory des Contraires',
 'Associe chaque mot à son contraire (chaud/froid, grand/petit...).',
 'semantique', '🔄', 5, 11,
 '{"pairs":[
   {"word1":"Chaud","word2":"Froid"},{"word1":"Grand","word2":"Petit"},
   {"word1":"Rapide","word2":"Lent"},{"word1":"Jour","word2":"Nuit"},
   {"word1":"Heureux","word2":"Triste"},{"word1":"Propre","word2":"Sale"}
 ]}',
 3),

('mot-troue', 'Le Mot Troué',
 'Complète le mot avec la bonne graphie manquante.',
 'orthographe', '🕳️', 6, 12,
 '{"items":[
   {"sentence":"Un ch__al galope dans le pré.","options":["ev","av","iv","uv"],"answer":"ev","full_word":"cheval"},
   {"sentence":"La ma__on est grande.","options":["is","ain","in","ain"],"answer":"is","full_word":"maison"},
   {"sentence":"Le chat __ort sous le lit.","options":["d","t","s","c"],"answer":"d","full_word":"dort"}
 ]}',
 3),

('course-des-accords', 'La Course des Accords',
 'Choisis la bonne porte (bonne conjugaison) pour que le coureur passe !',
 'grammaire', '🏃', 6, 12,
 '{"items":[]}',
 3),

('qui-est-ce', 'Qui Est-Ce ?',
 'Trouve le personnage selon les indices logiques.',
 'comprehension', '🔍', 5, 11,
 '{"rounds":[]}',
 3),

('compte-est-bon', 'Le Compte Est Bon',
 'Éclate les bulles qui font le bon total.',
 'maths', '💭', 5, 10,
 '{"target": 10}',
 3),

('serpent-siffleur', 'Le Serpent Siffleur',
 'Fais "SSSS" dans le micro pour faire monter le serpent. Évite les rochers !',
 'souffle', '🐍', 4, 99,
 '{"sensitivity": 0.02}',
 3),

('tapis-volant-du-temps', 'Le Tapis Volant du Temps',
 'Pose chaque phrase sur le bon nuage : Hier, Aujourd''hui, ou Demain.',
 'grammaire', '🌤️', 6, 12,
 '{"items":[
   {"sentence":"Je mangerai une pomme.","answer":"future","verb_hint":"mangerai"},
   {"sentence":"Elle joue dans le jardin.","answer":"present","verb_hint":"joue"},
   {"sentence":"Il a couru très vite.","answer":"past","verb_hint":"a couru"},
   {"sentence":"Nous partirons demain matin.","answer":"future","verb_hint":"partirons"},
   {"sentence":"Les enfants dorment.","answer":"present","verb_hint":"dorment"},
   {"sentence":"Tu as mangé toute la tarte.","answer":"past","verb_hint":"as mangé"}
 ]}',
 3),

('conjugueur-fou', 'Le Conjugueur Fou',
 'Conjugue vite ! Pronom + Infinitif → clique la bonne forme avant le chrono.',
 'grammaire', '⏱️', 7, 14,
 '{"items":[
   {"pronoun":"NOUS","infinitive":"CHANTER","tense":"présent","choices":["chantons","chantez","chantent","chantes"],"answer":"chantons"},
   {"pronoun":"IL","infinitive":"MANGER","tense":"présent","choices":["mange","mangeons","mangent","manges"],"answer":"mange"},
   {"pronoun":"VOUS","infinitive":"PARTIR","tense":"présent","choices":["partez","pars","partent","partons"],"answer":"partez"},
   {"pronoun":"ILS","infinitive":"JOUER","tense":"présent","choices":["jouent","joue","jouons","jouez"],"answer":"jouent"},
   {"pronoun":"TU","infinitive":"FINIR","tense":"présent","choices":["finis","finit","finissons","finissez"],"answer":"finis"}
 ]}',
 3),

('train-des-natures', 'Le Train des Natures',
 'Chaque mot va dans le bon wagon : Nom (bleu), Verbe (rouge) ou Adjectif (vert).',
 'grammaire', '🚃', 6, 12,
 '{"items":[
   {"word":"Maison","nature":"nom","emoji":"🏠"},{"word":"Courir","nature":"verbe","emoji":"🏃"},
   {"word":"Petit","nature":"adjectif","emoji":"🐜"},{"word":"Chien","nature":"nom","emoji":"🐶"},
   {"word":"Manger","nature":"verbe","emoji":"🍴"},{"word":"Grand","nature":"adjectif","emoji":"🏔️"},
   {"word":"Fleur","nature":"nom","emoji":"🌸"},{"word":"Dormir","nature":"verbe","emoji":"😴"},
   {"word":"Rouge","nature":"adjectif","emoji":"🔴"},{"word":"Soleil","nature":"nom","emoji":"☀️"}
 ]}',
 3)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  config = EXCLUDED.config;
