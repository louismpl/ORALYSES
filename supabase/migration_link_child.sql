-- =============================================
-- Migration : Fonction RPC pour lier un enfant à un parent
-- =============================================
-- Problème : le parent ne peut pas voir le patient via RLS
-- (car il n'est ni le thérapeute, ni encore lié comme parent)
-- Solution : une fonction SECURITY DEFINER qui contourne le RLS
-- =============================================

CREATE OR REPLACE FUNCTION public.link_child_to_parent(p_link_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_patient RECORD;
  v_user_id UUID := auth.uid();
  v_user_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur est connecté
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  -- Vérifier que l'utilisateur est un parent
  SELECT role INTO v_user_role FROM public.profiles WHERE id = v_user_id;
  IF v_user_role IS NULL OR v_user_role != 'parent' THEN
    RETURN json_build_object('success', false, 'error', 'Seuls les parents peuvent lier un enfant');
  END IF;

  -- Chercher le patient par code de liaison
  SELECT * INTO v_patient FROM public.patients WHERE link_code = p_link_code;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Code de liaison invalide');
  END IF;

  -- Vérifier que le patient n'est pas déjà lié
  IF v_patient.parent_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Cet enfant est déjà lié à un parent');
  END IF;

  -- Lier l'enfant au parent
  UPDATE public.patients
  SET parent_id = v_user_id
  WHERE id = v_patient.id;

  -- Retourner le succès avec les infos du patient
  RETURN json_build_object(
    'success', true,
    'first_name', v_patient.first_name,
    'patient_id', v_patient.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
