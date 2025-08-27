-- Add new fields to profiles table
ALTER TABLE public.profiles ADD COLUMN gender text;
ALTER TABLE public.profiles ADD COLUMN year_of_study integer;
ALTER TABLE public.profiles ADD COLUMN branch text;
ALTER TABLE public.profiles ADD COLUMN whatsapp_number text;
ALTER TABLE public.profiles ADD COLUMN linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN github_url text;