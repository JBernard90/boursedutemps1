-- SQL pour configurer la table contact_requests et le système de notification
-- À exécuter dans le SQL Editor de Supabase (https://app.supabase.com/)

-- 1. Création de la table contact_requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    organization TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved'))
);

-- 2. Configuration des Security Rules (RLS)
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Autoriser tout le monde (anonyme) à insérer une demande
CREATE POLICY "Allow anonymous insertion" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

-- Autoriser uniquement les admins (ou l'utilisateur authentifié si besoin) à lire les demandes
-- Note: À adapter selon vos rôles utilisateurs si nécessaire
CREATE POLICY "Allow authenticated read" ON public.contact_requests
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Activation de l'extension de webhook si nécessaire
-- CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- 4. Création de la fonction Trigger pour le Webhook
-- Remplacez YOUR_APP_URL par l'URL de votre application (ex: https://...run.app)
CREATE OR REPLACE FUNCTION public.contact_requests_notify()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://YOUR_APP_URL/api/contact-notification',
      body := json_build_object(
        'type', 'INSERT',
        'table', 'contact_requests',
        'record', row_to_json(NEW)
      )::text,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Création du Trigger
DROP TRIGGER IF EXISTS on_contact_request_insert ON public.contact_requests;
CREATE TRIGGER on_contact_request_insert
  AFTER INSERT ON public.contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.contact_requests_notify();
