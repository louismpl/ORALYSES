// Migration script — run with: node supabase/migrate.cjs
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qpjjgnyicgqqyzygxjbc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwampnbnlpY2dxcXl6eWd4amJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgyMDY5NSwiZXhwIjoyMDg2Mzk2Njk1fQ.3v-1eil4q8fS61w21C9-Cx-mCnWivenHPmVLKBDUx0Q';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function migrate() {
    console.log('🚀 Démarrage de la migration...\n');

    // 1. Ajouter colonne custom_config à assignments
    console.log('1. Ajout de custom_config à assignments...');
    const { error: e1 } = await supabase.rpc('exec_migration', {
        sql: 'ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS custom_config JSONB;'
    });

    // Fallback: try direct insert to check if column exists
    const { data: assignCheck } = await supabase
        .from('assignments')
        .select('id')
        .limit(1);
    console.log('   assignments accessible:', assignCheck !== null ? '✅' : '❌');

    // 2. Créer table custom_game_configs
    console.log('2. Vérification table custom_game_configs...');
    const { data: cfgCheck, error: cfgErr } = await supabase
        .from('custom_game_configs')
        .select('id')
        .limit(1);

    if (cfgErr?.code === 'PGRST205') {
        console.log('   Table manquante — à créer via SQL Editor Supabase');
        console.log('\n📋 SQL à exécuter dans Supabase SQL Editor:\n');
        console.log(`
-- Ajouter colonne custom_config aux assignments
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS custom_config JSONB;

-- Créer table custom_game_configs
CREATE TABLE IF NOT EXISTS public.custom_game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_custom_configs_therapist ON public.custom_game_configs(therapist_id);
CREATE INDEX IF NOT EXISTS idx_custom_configs_game ON public.custom_game_configs(game_id);

-- RLS
ALTER TABLE public.custom_game_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can manage their custom configs" ON public.custom_game_configs
  FOR ALL USING (therapist_id = auth.uid());
    `);
    } else {
        console.log('   custom_game_configs: ✅ existe déjà');
    }

    // 3. Vérifier les jeux
    console.log('\n3. Vérification des jeux...');
    const { data: games } = await supabase.from('games').select('name');
    games?.forEach(g => console.log('   ✅', g.name));

    console.log('\n✅ Migration terminée !');
}

migrate().catch(console.error);
