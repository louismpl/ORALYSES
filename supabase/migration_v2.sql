-- =============================================
-- Oralyses — Migration v2
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- ─── 1. Colonne mood dans game_sessions ──────────────────────────────────────
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS mood SMALLINT CHECK (mood BETWEEN 1 AND 5);

-- ─── 2. Colonne custom_config_id dans assignments ─────────────────────────────
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS custom_config_id UUID REFERENCES public.custom_game_configs(id) ON DELETE SET NULL;

-- ─── 3. Table cabinets ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cabinets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Cabinet',
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- 5 codes d'invitation uniques générés à la création
  invite_code_1 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_2 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_3 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_4 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_5 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. Colonnes cabinet dans profiles ───────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cabinet_id UUID REFERENCES public.cabinets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_cabinet_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'cabinet'));

-- Note: cabinet_code n'est plus une colonne dans profiles
-- Il est lu directement depuis la table cabinets

-- ─── 5. Index cabinet ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_cabinet ON public.profiles(cabinet_id);
CREATE INDEX IF NOT EXISTS idx_cabinets_admin ON public.cabinets(admin_id);

-- ─── 6. RLS pour cabinets ─────────────────────────────────────────────────────
ALTER TABLE public.cabinets ENABLE ROW LEVEL SECURITY;

-- Admin peut tout faire sur son cabinet
CREATE POLICY "Cabinet admin full access" ON public.cabinets
  FOR ALL USING (admin_id = auth.uid());

-- Membres peuvent voir le cabinet dont ils font partie
CREATE POLICY "Cabinet members can view their cabinet" ON public.cabinets
  FOR SELECT USING (
    id IN (
      SELECT cabinet_id FROM public.profiles
      WHERE id = auth.uid() AND cabinet_id IS NOT NULL
    )
  );

-- ─── 7. Streak trigger (si pas déjà créé) ────────────────────────────────────
-- (Normalement déjà dans schema.sql — on le recrée en sécurité)
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

  IF v_last_played IS NULL THEN
    -- Première session
    v_current_streak := 1;
  ELSIF v_last_played = v_today THEN
    -- Déjà joué aujourd'hui, pas de changement
    RETURN NEW;
  ELSIF v_last_played = v_today - INTERVAL '1 day' THEN
    -- Joué hier → on continue la série
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Trou dans la série → on repart à 1
    v_current_streak := 1;
  END IF;

  IF v_current_streak > COALESCE(v_best_streak, 0) THEN
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

-- Recréer le trigger de streak
DROP TRIGGER IF EXISTS on_session_created ON public.game_sessions;
CREATE TRIGGER on_session_created
  AFTER INSERT ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ─── 8. Fonction RPC : create_cabinet ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_cabinet(p_name TEXT DEFAULT 'Mon Cabinet')
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_cabinet_id UUID;
BEGIN
  -- Récupérer le profil actuel
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profil introuvable');
  END IF;

  IF v_profile.role != 'therapist' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Réservé aux thérapeutes');
  END IF;

  IF v_profile.cabinet_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous êtes déjà dans un cabinet');
  END IF;

  -- Créer le cabinet
  INSERT INTO public.cabinets (name, admin_id)
  VALUES (p_name, auth.uid())
  RETURNING id INTO v_cabinet_id;

  -- Lier l'admin à ce cabinet
  UPDATE public.profiles
  SET cabinet_id = v_cabinet_id, is_cabinet_admin = true
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'cabinet_id', v_cabinet_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 9. Fonction RPC : join_cabinet ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.join_cabinet(p_invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_cabinet RECORD;
  v_member_count INTEGER;
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profil introuvable');
  END IF;

  IF v_profile.role != 'therapist' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Réservé aux thérapeutes');
  END IF;

  IF v_profile.cabinet_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous êtes déjà dans un cabinet');
  END IF;

  -- Trouver le cabinet par l'un des 5 codes
  SELECT * INTO v_cabinet FROM public.cabinets
  WHERE invite_code_1 = upper(p_invite_code)
     OR invite_code_2 = upper(p_invite_code)
     OR invite_code_3 = upper(p_invite_code)
     OR invite_code_4 = upper(p_invite_code)
     OR invite_code_5 = upper(p_invite_code);

  IF v_cabinet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code d''invitation invalide');
  END IF;

  -- Vérifier la limite de 5 membres
  SELECT COUNT(*) INTO v_member_count
  FROM public.profiles WHERE cabinet_id = v_cabinet.id;

  IF v_member_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cabinet complet (5 membres maximum)');
  END IF;

  -- Rejoindre le cabinet
  UPDATE public.profiles
  SET cabinet_id = v_cabinet.id, is_cabinet_admin = false
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'cabinet_id', v_cabinet.id, 'cabinet_name', v_cabinet.name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 10. Fonction RPC : leave_cabinet ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.leave_cabinet()
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();

  IF v_profile.cabinet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous n''êtes pas dans un cabinet');
  END IF;

  IF v_profile.is_cabinet_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'L''admin ne peut pas quitter le cabinet. Dissolvez-le d''abord.');
  END IF;

  UPDATE public.profiles
  SET cabinet_id = NULL, is_cabinet_admin = false
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 11. Fonction RPC : remove_cabinet_member (admin only) ───────────────────
CREATE OR REPLACE FUNCTION public.remove_cabinet_member(p_member_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_admin RECORD;
  v_member RECORD;
BEGIN
  SELECT * INTO v_admin FROM public.profiles WHERE id = auth.uid();

  IF NOT v_admin.is_cabinet_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action réservée à l''administrateur');
  END IF;

  SELECT * INTO v_member FROM public.profiles
  WHERE id = p_member_id AND cabinet_id = v_admin.cabinet_id;

  IF v_member IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membre introuvable dans ce cabinet');
  END IF;

  IF v_member.is_cabinet_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Impossible de supprimer l''administrateur');
  END IF;

  UPDATE public.profiles
  SET cabinet_id = NULL, is_cabinet_admin = false
  WHERE id = p_member_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 12. Fonction RPC : dissolve_cabinet (admin only) ────────────────────────
CREATE OR REPLACE FUNCTION public.dissolve_cabinet()
RETURNS JSONB AS $$
DECLARE
  v_admin RECORD;
BEGIN
  SELECT * INTO v_admin FROM public.profiles WHERE id = auth.uid();

  IF NOT v_admin.is_cabinet_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action réservée à l''administrateur');
  END IF;

  -- Détacher tous les membres
  UPDATE public.profiles
  SET cabinet_id = NULL, is_cabinet_admin = false
  WHERE cabinet_id = v_admin.cabinet_id;

  -- Supprimer le cabinet (ON DELETE CASCADE nettoie les refs)
  DELETE FROM public.cabinets WHERE id = v_admin.cabinet_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 13. Regenerate invite codes (admin only) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(p_slot INTEGER)
RETURNS JSONB AS $$
DECLARE
  v_admin RECORD;
  v_new_code TEXT;
BEGIN
  SELECT * INTO v_admin FROM public.profiles WHERE id = auth.uid();

  IF NOT v_admin.is_cabinet_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Réservé à l''admin');
  END IF;

  v_new_code := upper(encode(gen_random_bytes(3), 'hex'));

  IF p_slot = 1 THEN
    UPDATE public.cabinets SET invite_code_1 = v_new_code WHERE id = v_admin.cabinet_id;
  ELSIF p_slot = 2 THEN
    UPDATE public.cabinets SET invite_code_2 = v_new_code WHERE id = v_admin.cabinet_id;
  ELSIF p_slot = 3 THEN
    UPDATE public.cabinets SET invite_code_3 = v_new_code WHERE id = v_admin.cabinet_id;
  ELSIF p_slot = 4 THEN
    UPDATE public.cabinets SET invite_code_4 = v_new_code WHERE id = v_admin.cabinet_id;
  ELSIF p_slot = 5 THEN
    UPDATE public.cabinets SET invite_code_5 = v_new_code WHERE id = v_admin.cabinet_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Slot invalide (1-5)');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_code', v_new_code, 'slot', p_slot);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
