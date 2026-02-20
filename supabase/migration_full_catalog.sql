-- =============================================
-- Oralyses — Full Games Catalog (40 professional games)
-- This migration populates the entire library.
-- =============================================

INSERT INTO public.games (slug, name, description, category, config) VALUES
-- ─── Prononciation ───────────────────
('virelangues', 'Virelangues Rigolos', 'Répéter des phrases complexes pour améliorer l''articulation rapide.', 'prononciation', 
 '{"items": [
   {"text": "Un dragon gradé dégrada un gradé dragon.", "target_son": "gr"},
   {"text": "Les chaussettes de l''archiduchesse sont-elles sèches ?", "target_son": "ch/s"},
   {"text": "Six saucissons secs sans sel.", "target_son": "s"},
   {"text": "Fruit frais, fruit frit, fruit cuit, fruit cru.", "target_son": "fr"},
   {"text": "Son chat chante sa chanson.", "target_son": "ch/s"},
   {"text": "Trois tortues trottaient sur trois toits très étroits.", "target_son": "tr"},
   {"text": "Gros gras grain d''orge, quand te dégros-gras-grain-d''orgeras-tu ?", "target_son": "gr"},
   {"text": "Petit pot de beurre, quand te dépetit-pot-de-beurrereras-tu ?", "target_son": "p/b"},
   {"text": "Le chasseur sache chasser sans son chien.", "target_son": "ch/s"},
   {"text": "Cinq chiens chassent six chats.", "target_son": "ch/s"}
 ]}'),

('souffle-plume', 'Souffle sur la Plume', 'Contrôler son souffle pour renforcer les muscles buccaux.', 'prononciation', '{"sensitivity": 0.05, "target_duration": 15, "rounds": 10}'),

('miroir-grimaces', 'Miroir des Grimaces', 'Imiter des expressions pour travailler les praxies bucco-faciales.', 'prononciation', 
 '{"grimaces": [
   {"name": "Le bisou", "instruction": "Fais des lèvres en avant comme pour un bisou.", "image": "kiss"},
   {"name": "Le grand sourire", "instruction": "Montre toutes tes dents avec un grand sourire.", "image": "smile"},
   {"name": "Le poisson", "instruction": "Aspire tes joues vers l''intérieur.", "image": "fish"},
   {"name": "Le gonflage", "instruction": "Gonfle tes deux joues d''air.", "image": "ball"},
   {"name": "La langue au nez", "instruction": "Essaie de toucher ton nez avec ta langue.", "image": "tongue"},
   {"name": "La bouche en O", "instruction": "Fais un grand O avec ta bouche.", "image": "ball"},
   {"name": "Gonfler une joue", "instruction": "Gonfle seulement la joue gauche.", "image": "ball"},
   {"name": "Gonfler l''autre joue", "instruction": "Gonfle seulement la joue droite.", "image": "ball"},
   {"name": "Claquement", "instruction": "Fais claquer ta langue contre ton palais.", "image": "tongue"},
   {"name": "Vibration", "instruction": "Fais vibrer tes lèvres comme un moteur.", "image": "ball"}
 ]}'),

('amuz-bouch', 'Amuz''Bouch', 'Exercices ludiques de motricité bucco-maxillaire.', 'prononciation', 
 '{"exercises": ["Langue à gauche", "Langue à droite", "Claquer la langue", "Faire vibrer les lèvres"]}'),

('sons-animaux', 'Sons des Animaux', 'Discrimination auditive et reproduction de cris d''animaux.', 'prononciation', 
 '{"animals": [
   {"name": "Le Lion", " sound": "Roar", "text": "Grrr !"}, {"name": "Le Chat", "text": "Miaou !"}, 
   {"name": "La Vache", "text": "Meuh !"}, {"name": "Le Cochon", "text": "Groin !"},
   {"name": "Le Serpent", "text": "Sss !"}, {"name": "Le Chien", "text": "Ouaf !"},
   {"name": "L''Oiseau", "text": "Piou !"}, {"name": "Le Mouton", "text": "Bêê !"},
   {"name": "Le Coq", "text": "Cocorico !"}, {"name": "L''Abeille", "text": "Bzzz !"}
 ]}'),

('serpent-siffleur', 'Serpent Siffleur', 'Éviter les obstacles en articulant des sons continus.', 'prononciation', '{"sensitivity": 0.05}'),

-- ─── Articulation ─────────────────────
('attrape-les-sons', 'Attrape les Sons', 'Identifier si un mot contient un son cible.', 'articulation', 
 '{"sound_pairs": [{"target": "ch", "distractor": "s", "words": [
    {"word":"Chat","target":true,"image":"cat"},{"word":"Sac","target":false,"image":"bag"},
    {"word":"Chien","target":true,"image":"dog"},{"word":"Soleil","target":false,"image":"sun"},
    {"word":"Chaussure","target":true,"image":"shoe"},{"word":"Vache","target":true,"image":"cow"},
    {"word":"Singe","target":false,"image":"monkey"},{"word":"Soupe","target":false,"image":"soup"},
    {"word":"Chemise","target":true,"image":"shirt"},{"word":"Ciseau","target":false,"image":"scissors"},
    {"word":"Douche","target":true,"image":"shower"},{"word":"Sable","target":false,"image":"sun"},
    {"word":"Chocolat","target":true,"image":"cake"},{"word":"Salade","target":false,"image":"soup"}
  ]}]}'),

('prononcio', 'Prononcio', 'Distinguer des sons proches.', 'articulation', 
 '{"pairs": [{"son1": "S", "son2": "CH", "words": [
    {"word":"Souris","target":1},{"word":"Chou","target":2},{"word":"Sac","target":1},
    {"word":"Chat","target":2},{"word":"Poisson","target":1},{"word":"Poche","target":2},
    {"word":"Singe","target":1},{"word":"Chateau","target":2},{"word":"Soleil","target":1}
  ]}]}'),

('prononcio-s-z', 'Prononcio S/Z', 'S (sifflement) vs Z (bourdonnement).', 'articulation', 
 '{"pairs": [{"son1": "S", "son2": "Z", "words": [
    {"word":"Poisson","target":1},{"word":"Poison","target":2},{"word":"Dessert","target":1},
    {"word":"Désert","target":2},{"word":"Cousin","target":2},{"word":"Coussin","target":1}
  ]}]}'),

('prononcio-f-v', 'Prononcio F/V', 'F (vent) vs V (moteur).', 'articulation', '{"pairs": []}'),
('prononcio-p-b', 'Prononcio P/B', 'P (explosion) vs B (bulle).', 'articulation', '{"pairs": []}'),
('prononcio-t-d', 'Prononcio T/D', 'T (tic-tac) vs D (tambour).', 'articulation', '{"pairs": []}'),

('chiffon-cochon', 'Chiffon le Cochon', 'Focus sur les sons /ch/ et /f/.', 'articulation', 
 '{"title": "Chiffon le Cochon", "pages": [
    {"text":"C''est Chiffon le cochon.","focusWord":"Chiffon","emoji":"🐷"},
    {"text":"Il a un beau chapeau.","focusWord":"chapeau","emoji":"🎩"},
    {"text":"Il cherche ses amis.","focusWord":"cherche","emoji":"🔍"},
    {"text":"Il souffle sur les fleurs.","focusWord":"souffle","emoji":"🌸"},
    {"text":"Il voit une fourmi.","focusWord":"fourmi","emoji":"🐜"}
  ]}'),

('jean-geant', 'Jean le Géant', 'Focus sur les sons /j/ et /g/.', 'articulation', '{"title": "Jean le Géant", "pages": []}'),
('telephones-chuchoteurs', 'Tél. Chuchoteurs', 'S''écouter chuchoter.', 'articulation', '{"instructions": []}'),

-- ─── Vocabulaire ──────────────────────
('memory-vocabulaire', 'Memory Vocabulaire', 'Associer mots et images.', 'vocabulaire', 
 '{"themes": [{"name":"Animaux","pairs":[{"word":"Lion","image":"lion"},{"word":"Singe","image":"monkey"},{"word":"Chat","image":"cat"},{"word":"Chien","image":"dog"},{"word":"Lapin","image":"rabbit"},{"word":"Cheval","image":"horse"}]}]}'),

('boite-surprises', 'Boîte à Surprises', 'Nommer les objets qui sortent.', 'vocabulaire', 
 '{"items": [{"word":"Pomme","emoji":"🍎"},{"word":"Voiture","emoji":"🚗"},{"word":"Cadeau","emoji":"🎁"},{"word":"Ballon","emoji":"🎈"},{"word":"Livre","emoji":"📖"},{"word":"Brosse","emoji":"🪮"},{"word":"Clé","emoji":"🔑"},{"word":"Stylo","emoji":"🖊️"}]}'),

('mimes-actions', 'Mimes d''Actions', 'Nommer des verbes d''action.', 'vocabulaire', 
 '{"items": [{"word":"Manger","emoji":"🍴"},{"word":"Dormir","emoji":"😴"},{"word":"Courir","emoji":"🏃"},{"word":"Sauter","emoji":"🦘"},{"word":"Boire","emoji":"🥛"},{"word":"Lire","emoji":"📖"},{"word":"Chanter","emoji":"🎤"},{"word":"Danser","emoji":"💃"}]}'),

('devinettes-objets', 'Devinettes Objets', 'Travailler les définitions.', 'vocabulaire', '{"items": []}'),
('de-premiers-mots', 'Dé des Premiers Mots', 'Sitmulation précoce.', 'vocabulaire', '{"items": []}'),
('loto-pronoms', 'Loto des Pronoms', 'Il/Elle.', 'vocabulaire', '{"items": []}'),
('memory-contraires', 'Memory Contraires', 'Associer les antonymes.', 'vocabulaire', '{"pairs": []}'),
('supermarche', 'Le Supermarché', 'Catégorisation.', 'vocabulaire', '{"categories": ["Fruits", "Légumes"]}'),

('imagier-couleurs', 'Imagier Couleurs', 'Apprendre les couleurs.', 'vocabulaire', 
 '{"items": [{"word":"Rouge","emoji":"🔴"},{"word":"Bleu","emoji":"🔵"},{"word":"Jaune","emoji":"🟡"},{"word":"Vert","emoji":"🟢"},{"word":"Orange","emoji":"🟠"},{"word":"Violet","emoji":"🟣"},{"word":"Rose","emoji":"💗"},{"word":"Noir","emoji":"⚫"}]}'),

('imagier-corps', 'Mon Corps', 'Apprendre les parties du corps.', 'vocabulaire', '{"items": []}'),
('imagier-ecole', 'Mon École', 'Vocabulaire scolaire.', 'vocabulaire', '{"items": []}'),
('imagier-transports', 'Transports', 'Véhicules.', 'vocabulaire', '{"items": []}'),

-- ─── Phonologie ───────────────────────
('train-des-syllabes', 'Train des Syllabes', 'Compter les syllabes.', 'phonologie', '{"items": [{"word":"Chat","syllables":1}]}'),
('peche-aux-rimes', 'Pêche aux Rimes', 'Identifier les rimes.', 'phonologie', '{"bait":"Bateau","options":["Cadeau"]}'),
('bizarre-bizarre', 'Bizarre, Bizarre !', 'Sons complexes.', 'phonologie', '{"items": []}'),
('langue-au-chat', 'Langue au Chat', 'Répondre en articulant.', 'phonologie', '{"questions": []}'),

-- ─── Compréhension ────────────────────
('simon-dit', 'Simon Dit', 'Écouter et obéir.', 'compréhension', '{"levels": []}'),
('qui-est-ce', 'Qui est-ce ?', 'Inférences.', 'compréhension', '{"rounds": []}'),

-- ─── Syntaxe & Grammaire ──────────────
('architecte-des-phrases', 'Arch. des Phrases', 'Ordre des mots.', 'syntaxe', '{"sentences": []}'),
('spirale-pronoms', 'Spirale des Pronoms', 'Pronoms.', 'grammaire', '{"rounds": []}'),
('conjugueur-fou', 'Conjugueur Fou', 'Conjugaisons.', 'grammaire', '{"items": []}'),
('course-des-accords', 'Course des Accords', 'Accords.', 'grammaire', '{"items": []}'),
('train-des-natures', 'Train des Natures', 'Natures de mots.', 'grammaire', '{"items": []}'),
('tapis-volant-du-temps', 'Tapis du Temps', 'Fronologie temporelle.', 'grammaire', '{"items": []}'),

-- ─── Lecture & Orthographe ───────────
('lecteur-flash', 'Lecteur Flash', 'Vitesse de lecture.', 'lecture', '{"words": []}'),
('mot-troue', 'Le Mot Troué', 'Orthographe.', 'orthographe', '{"items": []}'),
('tri-lettres', 'Tri des Lettres', 'Discrim. visuelle.', 'lecture', '{"pairs": []}'),

-- ─── Langage Oral & Transfert ────────
('bulles-mots', 'Bulles de Mots', 'Souffle et parole.', 'oral', '{"words": []}'),
('histoires-libres', 'Histoires Libres', 'Expression libre.', 'oral', '{"prompts": ["Raconte ta journée"]}'),

-- ─── Autre ───────────────────────────
('compte-est-bon', 'Le Compte est Bon', 'Numération.', 'numération', '{"target": 10}')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  config = EXCLUDED.config;
