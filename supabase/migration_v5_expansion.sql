-- =============================================
-- Migration v5 : Expansion de la Boutique et Succès
-- =============================================

-- Ajout des colonnes de personnalisation aux patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '👶';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS banner_sticker TEXT DEFAULT NULL;

-- Réinitialisation et remplissage de la boutique (16 objets)
DELETE FROM public.reward_items;

INSERT INTO public.reward_items (name, cost, category, emoji) VALUES
-- Stickers (Prix croissants)
('Petit Coeur', 2, 'sticker', '❤️'),
('Château de Sable', 5, 'sticker', '🏰'),
('Planète Bleue', 8, 'sticker', '🪐'),
('Arc-en-ciel', 12, 'sticker', '🌈'),
('Fusée Spatiale', 20, 'sticker', '🚀'),
('Éclair de Génie', 35, 'sticker', '⚡'),
('Trésor Caché', 60, 'sticker', '🏴‍☠️'),
('Météore de Feu', 100, 'sticker', '☄️'),

-- Avatars (Prix croissants)
('Robot Rigolo', 15, 'avatar', '🤖'),
('Super Dragon', 25, 'avatar', '🐲'),
('Licorne Magique', 40, 'avatar', '🦄'),
('Chat Ninja', 70, 'avatar', '🥷'),
('Astronaute', 120, 'avatar', '👨‍🚀'),
('Sorcier Sage', 250, 'avatar', '🧙‍♂️'),
('Phoenix de Feu', 450, 'avatar', '🦅'),
('Roi des Étoiles', 800, 'avatar', '👑');

-- Réinitialisation et remplissage des succès (Progression complète)
DELETE FROM public.achievements;

INSERT INTO public.achievements (name, description, category, threshold, icon, points) VALUES
-- NIVEAU BRONZE (Débutant)
('Premiers pas', 'Compléter 1 session', 'sessions', 1, 'Award', 10),
('Petit curieux', 'Compléter 5 sessions', 'sessions', 5, 'Zap', 20),
('Première étoile', 'Gagner 10 étoiles', 'stars', 10, 'Star', 15),
('Petite série', '2 jours de suite', 'streak', 2, 'Flame', 10),

-- NIVEAU ARGENT (Intermédiaire)
('Habitué', 'Compléter 20 sessions', 'sessions', 20, 'Target', 50),
('Collectionneur', 'Gagner 150 étoiles', 'stars', 150, 'Star', 60),
('Série de Bronze', '5 jours de suite', 'streak', 5, 'Flame', 80),
('Tireur d Elite', 'Atteindre 95% de précision', 'accuracy', 95, 'Activity', 40),

-- NIVEAU OR (Expert)
('Champion', 'Compléter 50 sessions', 'sessions', 50, 'Award', 150),
('Étoile Brillante', 'Gagner 500 étoiles', 'stars', 500, 'Star', 200),
('Série d Argent', '10 jours de suite', 'streak', 10, 'Flame', 300),
('Perfectionniste', '100% de précision au moins une fois', 'accuracy', 100, 'Target', 100),

-- NIVEAU LÉGENDE (Maître)
('Grand Maître', 'Compléter 100 sessions', 'sessions', 100, 'Award', 500),
('Millionnaire', 'Gagner 1500 étoiles', 'stars', 1500, 'Star', 800),
('Série Immortelle', '30 jours de suite', 'streak', 30, 'Flame', 1000),
('Légende Vivante', 'Maintenir 98% de moyenne sur 10 sessions', 'accuracy', 98, 'Activity', 1000);
