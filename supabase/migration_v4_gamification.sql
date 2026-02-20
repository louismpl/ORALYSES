-- =============================================
-- Migration v4 : Gamification Avancée
-- =============================================

-- Table des succès (badges)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sessions', 'stars', 'streak', 'accuracy')),
  threshold INTEGER NOT NULL, -- ex: 10 sessions, 100 stars...
  icon TEXT, -- Lucide icon name or emoji
  points INTEGER DEFAULT 50, -- bonus points/stars when unlocked
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des succès débloqués
CREATE TABLE IF NOT EXISTS public.patient_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, achievement_id)
);

-- Défis Quotidiens
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  game_category TEXT, -- optionnel, ex: 'articulation'
  required_count INTEGER DEFAULT 1,
  reward_stars INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view daily challenges" ON public.daily_challenges FOR SELECT USING (true);

CREATE POLICY "Users can view achievements for their patients" ON public.patient_achievements
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE therapist_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- Seed Data
INSERT INTO public.achievements (name, description, category, threshold, icon, points) VALUES
('Premiers pas', 'Compléter 1 session', 'sessions', 1, 'Award', 10),
('Habitué', 'Compléter 10 sessions', 'sessions', 10, 'Target', 50),
('Collectionneur', 'Gagner 100 étoiles', 'stars', 100, 'Star', 50),
('Série de Bronze', '3 jours de suite', 'streak', 3, 'Flame', 30),
('Série d Argent', '7 jours de suite', 'streak', 7, 'Flame', 100),
('Tireur d Elite', 'Atteindre 95% de précision sur un jeu', 'accuracy', 95, 'Activity', 40)
ON CONFLICT DO NOTHING;

INSERT INTO public.daily_challenges (title, description, reward_stars) VALUES
('Explorateur', 'Joue à 2 jeux différents aujourd hui', 15),
('Assidu', 'Complète une session de plus de 5 minutes', 10),
('Perfectionniste', 'Atteins 100% de précision sur un jeu', 20)
ON CONFLICT DO NOTHING;
