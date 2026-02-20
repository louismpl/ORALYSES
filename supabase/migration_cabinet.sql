-- =============================================
-- Oralyses — Migration Cabinet
-- À exécuter dans le SQL Editor de Supabase
-- =============================================

-- 1. Ajouter les colonnes cabinet + plan sur profiles
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cabinet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_cabinet_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cabinet_code TEXT UNIQUE,
  -- Plan d'abonnement : 'free' (essai 14j), 'pro', 'cabinet'
  -- Mis à jour par Stripe webhook ou manuellement par admin
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'cabinet')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Index pour les recherches cabinet
CREATE INDEX IF NOT EXISTS idx_profiles_cabinet_id ON public.profiles(cabinet_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cabinet_code ON public.profiles(cabinet_code);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- 2. RPC : Créer un cabinet (l'admin génère son code)
-- =============================================
CREATE OR REPLACE FUNCTION public.create_cabinet()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile RECORD;
  v_code TEXT;
  v_attempts INT := 0;
BEGIN
  -- Vérifier authentification
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- Récupérer le profil complet
  SELECT role, plan INTO v_profile FROM public.profiles WHERE id = v_user_id;

  -- Vérifier que c'est un orthophoniste
  IF v_profile.role != 'therapist' THEN
    RETURN json_build_object('success', false, 'error', 'Seuls les orthophonistes peuvent créer un cabinet');
  END IF;

  -- ⬇️ Vérification du plan Cabinet
  IF v_profile.plan != 'cabinet' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Le plan Cabinet est requis pour créer un cabinet. Passez au plan Cabinet depuis votre profil.',
      'upgrade_required', true
    );
  END IF;

  -- Vérifier qu'il n'est pas déjà dans un cabinet
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND (cabinet_id IS NOT NULL OR is_cabinet_admin = true)) THEN
    RETURN json_build_object('success', false, 'error', 'Vous êtes déjà dans un cabinet');
  END IF;

  -- Générer un code cabinet unique (format CAB-XXXX)
  LOOP
    v_code := 'CAB-' || upper(encode(gen_random_bytes(3), 'hex'));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE cabinet_code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RETURN json_build_object('success', false, 'error', 'Impossible de générer un code unique');
    END IF;
  END LOOP;

  -- Mettre à jour le profil : devient admin du cabinet
  UPDATE public.profiles
  SET
    cabinet_id = v_user_id,  -- son propre ID = le cabinet
    is_cabinet_admin = true,
    cabinet_code = v_code
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'cabinet_code', v_code,
    'message', 'Cabinet créé avec succès'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC : Rejoindre un cabinet (ortho invité entre le code)
-- =============================================
CREATE OR REPLACE FUNCTION public.join_cabinet(p_cabinet_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role TEXT;
  v_admin RECORD;
BEGIN
  -- Vérifier authentification
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- Vérifier que c'est un orthophoniste
  SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id;
  IF v_role != 'therapist' THEN
    RETURN json_build_object('success', false, 'error', 'Seuls les orthophonistes peuvent rejoindre un cabinet');
  END IF;

  -- Vérifier qu'il n'est pas déjà dans un cabinet
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND cabinet_id IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Vous êtes déjà dans un cabinet');
  END IF;

  -- Chercher l'admin par le code cabinet
  SELECT id, full_name, cabinet_code
  INTO v_admin
  FROM public.profiles
  WHERE cabinet_code = upper(trim(p_cabinet_code))
    AND is_cabinet_admin = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Code cabinet invalide');
  END IF;

  -- Vérifier la limite de 5 membres (admin + 4 invités)
  IF (SELECT COUNT(*) FROM public.profiles WHERE cabinet_id = v_admin.id) >= 5 THEN
    RETURN json_build_object('success', false, 'error', 'Ce cabinet a atteint la limite de 5 orthophonistes');
  END IF;

  -- Rattacher l'ortho au cabinet
  UPDATE public.profiles
  SET cabinet_id = v_admin.id
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'cabinet_admin_name', v_admin.full_name,
    'message', 'Vous avez rejoint le cabinet avec succès'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC : Quitter un cabinet
-- =============================================
CREATE OR REPLACE FUNCTION public.leave_cabinet()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- Ne pas laisser un admin quitter (il doit d'abord transférer)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND is_cabinet_admin = true) THEN
    RETURN json_build_object('success', false, 'error', 'Un administrateur ne peut pas quitter son cabinet. Dissoudre le cabinet depuis les paramètres.');
  END IF;

  UPDATE public.profiles
  SET cabinet_id = NULL
  WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'message', 'Vous avez quitté le cabinet');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS : Les membres du cabinet voient les patients de leurs collègues
-- =============================================
-- Mettre à jour la politique RLS patients pour inclure les collègues de cabinet
DROP POLICY IF EXISTS "Therapists can view their patients" ON public.patients;
CREATE POLICY "Therapists can view their patients" ON public.patients
  FOR SELECT USING (
    therapist_id = auth.uid()
    OR parent_id = auth.uid()
    OR (
      -- Les membres d'un même cabinet voient tous les patients
      EXISTS (
        SELECT 1 FROM public.profiles p_viewer
        JOIN public.profiles p_owner ON p_owner.id = public.patients.therapist_id
        WHERE p_viewer.id = auth.uid()
          AND p_viewer.cabinet_id IS NOT NULL
          AND p_viewer.cabinet_id = p_owner.cabinet_id
      )
    )
  );

-- Les admins cabinet peuvent aussi voir les patients de leurs membres pour les updates
DROP POLICY IF EXISTS "Therapists can manage their patients" ON public.patients;
CREATE POLICY "Therapists can manage their patients" ON public.patients
  FOR ALL USING (
    therapist_id = auth.uid()
  );

-- 6. RLS sur profiles : les membres cabinet se voient entre eux
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (
      -- Les membres du même cabinet se voient entre eux
      cabinet_id IS NOT NULL
      AND cabinet_id = (SELECT cabinet_id FROM public.profiles WHERE id = auth.uid())
    )
  );
