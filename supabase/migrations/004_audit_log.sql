-- ============================================================
-- Pixenox — Audit Logging
-- Migration 004: Audit Log Triggers
-- ============================================================

-- Function to handle audit logging automatically via triggers
CREATE OR REPLACE FUNCTION tf_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_record_id UUID;
  v_old_data JSONB;
  v_new_data JSONB;
BEGIN
  -- Get the current authenticated user ID
  -- Fallback to a zero UUID if null, to handle edge cases
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID);
  
  v_action := TG_OP;
  
  IF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id;
    v_new_data := to_jsonb(NEW.*);
    v_old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := NEW.id;
    v_new_data := to_jsonb(NEW.*);
    v_old_data := to_jsonb(OLD.*);
  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
    v_new_data := NULL;
    v_old_data := to_jsonb(OLD.*);
  END IF;

  INSERT INTO audit_log (user_id, action, table_name, record_id, old_value, new_value)
  VALUES (v_user_id, v_action, TG_TABLE_NAME, v_record_id, v_old_data, v_new_data);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Apply the trigger to relevant tables where we want audit history
CREATE TRIGGER tr_audit_theme_settings AFTER INSERT OR UPDATE OR DELETE ON theme_settings FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_brand_settings AFTER INSERT OR UPDATE OR DELETE ON brand_settings FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_nav_config AFTER INSERT OR UPDATE OR DELETE ON nav_config FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_hero_settings AFTER INSERT OR UPDATE OR DELETE ON hero_settings FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_services_cards AFTER INSERT OR UPDATE OR DELETE ON services_cards FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_case_studies AFTER INSERT OR UPDATE OR DELETE ON case_studies FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_testimonials AFTER INSERT OR UPDATE OR DELETE ON testimonials FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_company_story AFTER INSERT OR UPDATE OR DELETE ON company_story FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
CREATE TRIGGER tr_audit_seo_config AFTER INSERT OR UPDATE OR DELETE ON seo_config FOR EACH ROW EXECUTE FUNCTION tf_audit_log();
