-- =============================================
-- Speech Play — Schema complet Supabase
-- =============================================
-- À exécuter dans le SQL Editor de Supabase
-- (Dashboard > SQL Editor > New query)
-- =============================================

-- 1. EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES
-- =============================================

-- Profils utilisateurs (lié à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'therapist')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patients (enfants suivis)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 2 AND 18),
  goals TEXT[] NOT NULL DEFAULT '{}',
  link_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  stars_total INTEGER NOT NULL DEFAULT 0,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_best INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catalogue des jeux
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignations de jeux aux patients
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
  active BOOLEAN NOT NULL DEFAULT true,
  custom_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configurations de jeux personnalisées par l'orthophoniste
CREATE TABLE IF NOT EXISTS public.custom_game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions de jeu (résultats)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  accuracy NUMERIC(5,2),
  items_completed INTEGER NOT NULL DEFAULT 0,
  items_total INTEGER NOT NULL DEFAULT 0,
  mistakes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEX
-- =============================================
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON public.patients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patients_parent ON public.patients(parent_id);
CREATE INDEX IF NOT EXISTS idx_patients_link_code ON public.patients(link_code);
CREATE INDEX IF NOT EXISTS idx_assignments_patient ON public.assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assignments_game ON public.assignments(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_patient ON public.game_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON public.game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started ON public.game_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_configs_therapist ON public.custom_game_configs(therapist_id);
CREATE INDEX IF NOT EXISTS idx_custom_configs_game ON public.custom_game_configs(game_id);

-- 4. TRIGGERS & FUNCTIONS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_patients_updated
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Streak management function
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_played DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
BEGIN
  SELECT 
    last_played_at::date, 
    streak_current, 
    streak_best
  INTO v_last_played, v_current_streak, v_best_streak
  FROM public.patients
  WHERE id = NEW.patient_id;

  IF v_last_played IS NULL OR v_last_played < v_today - INTERVAL '1 day' THEN
    -- Reset streak (missed a day or first time)
    IF v_last_played = v_today - INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
    ELSE
      v_current_streak := 1;
    END IF;
  ELSIF v_last_played = v_today THEN
    -- Already played today, no change
    RETURN NEW;
  ELSE
    v_current_streak := v_current_streak + 1;
  END IF;

  IF v_current_streak > v_best_streak THEN
    v_best_streak := v_current_streak;
  END IF;

  UPDATE public.patients
  SET 
    streak_current = v_current_streak,
    streak_best = v_best_streak,
    last_played_at = now()
  WHERE id = NEW.patient_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_session_created
  AFTER INSERT ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_game_configs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PATIENTS
CREATE POLICY "Therapists can view their patients" ON public.patients
  FOR SELECT USING (
    therapist_id = auth.uid() OR parent_id = auth.uid()
  );

CREATE POLICY "Therapists can create patients" ON public.patients
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Therapists can update their patients" ON public.patients
  FOR UPDATE USING (therapist_id = auth.uid());

CREATE POLICY "Parents can link to patient via code" ON public.patients
  FOR UPDATE USING (
    parent_id IS NULL OR parent_id = auth.uid()
  )
  WITH CHECK (
    parent_id = auth.uid()
  );

CREATE POLICY "Therapists can delete their patients" ON public.patients
  FOR DELETE USING (therapist_id = auth.uid());

-- GAMES (read-only for all authenticated users)
CREATE POLICY "Anyone can view games" ON public.games
  FOR SELECT USING (true);

-- CUSTOM GAME CONFIGS
CREATE POLICY "Therapists can manage their custom configs" ON public.custom_game_configs
  FOR ALL USING (therapist_id = auth.uid());

-- ASSIGNMENTS
CREATE POLICY "Therapists can manage assignments" ON public.assignments
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "Parents can view assignments for their children" ON public.assignments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE parent_id = auth.uid()
    )
  );

-- GAME SESSIONS
CREATE POLICY "Users can view sessions for their patients" ON public.game_sessions
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE therapist_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions for their patients" ON public.game_sessions
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE therapist_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- 6. SEED DATA — JEUX
-- =============================================

INSERT INTO public.games (slug, name, description, category, config) VALUES
(
  'attrape-les-sons',
  'Attrape les Sons',
  'L''enfant identifie si un mot contient un son cible. Travaille la discrimination auditive et l''articulation.',
  'articulation',
  '{
    "sound_pairs": [
      {
        "target": "ch",
        "distractor": "s",
        "words": [
          {"word": "Chat", "image": "cat", "target": true},
          {"word": "Sac", "image": "bag", "target": false},
          {"word": "Chien", "image": "dog", "target": true},
          {"word": "Singe", "image": "monkey", "target": false},
          {"word": "Chaussure", "image": "shoe", "target": true},
          {"word": "Soleil", "image": "sun", "target": false}
        ]
      },
      {
        "target": "f",
        "distractor": "v",
        "words": [
          {"word": "Feu", "image": "fire", "target": true},
          {"word": "Vent", "image": "wind", "target": false},
          {"word": "Fleur", "image": "flower", "target": true},
          {"word": "Voiture", "image": "car", "target": false},
          {"word": "Fourmi", "image": "red", "target": true},
          {"word": "Velo", "image": "moon", "target": false}
        ]
      },
      {
        "target": "r",
        "distractor": "l",
        "words": [
          {"word": "Roi", "image": "king", "target": true},
          {"word": "Lion", "image": "lion", "target": false},
          {"word": "Rouge", "image": "red", "target": true},
          {"word": "Lune", "image": "moon", "target": false},
          {"word": "Rose", "image": "flower", "target": true},
          {"word": "Lampe", "image": "sun", "target": false}
        ]
      }
    ]
  }'::jsonb
),
(
  'memory-vocabulaire',
  'Memory Vocabulaire',
  'Jeu de memory classique : associer un mot à son image. Enrichit le vocabulaire de l''enfant.',
  'vocabulaire',
  '{
    "themes": [
      {
        "name": "Les animaux",
        "pairs": [
          {"word": "Chat", "image": "cat"},
          {"word": "Chien", "image": "dog"},
          {"word": "Oiseau", "image": "bird"},
          {"word": "Poisson", "image": "fish"},
          {"word": "Lapin", "image": "rabbit"},
          {"word": "Cheval", "image": "horse"}
        ]
      },
      {
        "name": "La nourriture",
        "pairs": [
          {"word": "Pomme", "image": "apple"},
          {"word": "Pain", "image": "bread"},
          {"word": "Lait", "image": "milk"},
          {"word": "Fromage", "image": "cheese"},
          {"word": "Banane", "image": "banana"},
          {"word": "Gateau", "image": "cake"}
        ]
      },
      {
        "name": "La maison",
        "pairs": [
          {"word": "Lit", "image": "bed"},
          {"word": "Table", "image": "table"},
          {"word": "Chaise", "image": "chair"},
          {"word": "Porte", "image": "door"},
          {"word": "Fenetre", "image": "window"},
          {"word": "Lampe", "image": "lamp"}
        ]
      }
    ]
  }'::jsonb
),
(
  'simon-dit',
  'Simon Dit',
  'L''enfant suit les instructions de Simon : toucher les bonnes formes. Travaille la compréhension orale.',
  'comprehension',
  '{
    "levels": [
      {
        "level": 1,
        "name": "Facile — 1 forme",
        "instructions": [
          {"text": "Touche le cercle rouge", "targets": ["red-circle"]},
          {"text": "Touche le carre bleu", "targets": ["blue-square"]},
          {"text": "Touche le triangle jaune", "targets": ["yellow-triangle"]},
          {"text": "Touche le cercle rouge", "targets": ["red-circle"]}
        ]
      },
      {
        "level": 2,
        "name": "Moyen — 2 formes",
        "instructions": [
          {"text": "Touche le cercle rouge puis le carre bleu", "targets": ["red-circle", "blue-square"]},
          {"text": "Touche le triangle jaune", "targets": ["yellow-triangle"]},
          {"text": "Touche le carre bleu puis le triangle jaune", "targets": ["blue-square", "yellow-triangle"]},
          {"text": "Touche le cercle rouge", "targets": ["red-circle"]}
        ]
      },
      {
        "level": 3,
        "name": "Difficile — Plus de formes",
        "instructions": [
          {"text": "Touche le carre rouge", "targets": ["red-square"]},
          {"text": "Touche le grand cercle rouge puis le carre bleu", "targets": ["big-red-circle", "blue-square"]},
          {"text": "Touche le petit triangle jaune", "targets": ["small-yellow-triangle"]},
          {"text": "Touche le carre bleu puis le carre rouge", "targets": ["blue-square", "red-square"]}
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  config = EXCLUDED.config;

-- =============================================
-- FIN DU SCHEMA
-- =============================================
