-- =============================================
-- Migration v3 : Boutique de Récompenses
-- =============================================

-- Table des objets de la boutique
CREATE TABLE IF NOT EXISTS public.reward_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sticker', 'avatar', 'theme')),
  image_url TEXT,
  emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des objets débloqués par les patients
CREATE TABLE IF NOT EXISTS public.patient_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reward_item_id UUID NOT NULL REFERENCES public.reward_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, reward_item_id)
);

-- RLS
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rewards" ON public.reward_items FOR SELECT USING (true);

CREATE POLICY "Users can view rewards for their patients" ON public.patient_rewards
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE therapist_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can unlock rewards for their patients" ON public.patient_rewards
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE therapist_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- Seed initial rewards
INSERT INTO public.reward_items (name, cost, category, emoji) VALUES
('Super Dragon', 10, 'avatar', '🐲'),
('Fusée Spatiale', 15, 'sticker', '🚀'),
('Licorne Magique', 20, 'avatar', '🦄'),
('Chateau de Sable', 5, 'sticker', '🏰'),
('Robot Rigolo', 12, 'avatar', '🤖'),
('Planète Bleue', 8, 'sticker', '🪐'),
('Chat Ninja', 30, 'avatar', '🥷'),
('Arc-en-ciel', 10, 'sticker', '🌈')
ON CONFLICT DO NOTHING;
