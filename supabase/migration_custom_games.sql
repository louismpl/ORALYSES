-- ============================================================
-- MIGRATION Speech Play — Tables manquantes
-- À exécuter dans : https://supabase.com/dashboard/project/qpjjgnyicgqqyzygxjbc/sql/new
-- ============================================================

-- 1. Ajouter colonne custom_config aux assignments (config perso par assignment)
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS custom_config JSONB;

-- 2. Créer table custom_game_configs (configs sauvegardées par l'orthophoniste)
CREATE TABLE IF NOT EXISTS public.custom_game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_custom_configs_therapist ON public.custom_game_configs(therapist_id);
CREATE INDEX IF NOT EXISTS idx_custom_configs_game ON public.custom_game_configs(game_id);

-- 4. Activer RLS
ALTER TABLE public.custom_game_configs ENABLE ROW LEVEL SECURITY;

-- 5. Politique RLS : chaque orthophoniste gère ses propres configs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_game_configs' 
    AND policyname = 'Therapists can manage their custom configs'
  ) THEN
    CREATE POLICY "Therapists can manage their custom configs" 
      ON public.custom_game_configs 
      FOR ALL 
      USING (auth.uid() = therapist_id);
  END IF;
END $$;

-- Vérification finale
SELECT 
  'custom_game_configs' as table_name,
  COUNT(*) as row_count
FROM public.custom_game_configs
UNION ALL
SELECT 
  'assignments.custom_config exists' as table_name,
  COUNT(*) as row_count
FROM information_schema.columns 
WHERE table_name = 'assignments' AND column_name = 'custom_config';
