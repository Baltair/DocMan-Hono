-- =============================================================================
-- DocMan — Initial Database Schema
-- =============================================================================
-- Supabase (PostgreSQL) migration for the DocMan document management system.
--
-- Tables:
--   1. organisations        — Multi-tenant root entity
--   2. profiles              — Extends auth.users with name + org membership
--   3. documents             — Core document records with status enum
--   4. tags                  — Per-organisation tag taxonomy
--   5. document_tags         — M:N junction between documents and tags
--   6. reminders             — Scheduled reminders linked to documents
--   7. contacts              — Organisation contacts directory
--
-- Also includes:
--   - document_status enum
--   - Auto-profile creation trigger on auth.users insert
--   - Row Level Security (RLS) policies for all tables
--   - Indexes on all RLS-referenced columns
--   - Storage bucket + storage RLS policies
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. ORGANISATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organisations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 2. PROFILES (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name       TEXT NOT NULL DEFAULT '',
  last_name        TEXT NOT NULL DEFAULT '',
  organisation_id  UUID REFERENCES public.organisations(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_organisation_id ON public.profiles(organisation_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2.1 ORGANISATION POLICIES (Requires profiles table)
-- ---------------------------------------------------------------------------
-- Members of an org can read their own org
CREATE POLICY "org_select" ON public.organisations
  FOR SELECT USING (
    id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Only authenticated users can create organisations (during registration)
CREATE POLICY "org_insert" ON public.organisations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Org members can update their own org
CREATE POLICY "org_update" ON public.organisations
  FOR UPDATE USING (
    id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 2.2 PROFILE POLICIES
-- ---------------------------------------------------------------------------

-- Users can read profiles within their organisation
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- Allow insert during registration (trigger or signup flow)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- ---- Auto-create profile on auth.users insert ----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 3. DOCUMENTS
-- ---------------------------------------------------------------------------
CREATE TYPE public.document_status AS ENUM (
  'draft',
  'review',
  'approved',
  'archived'
);

CREATE TABLE IF NOT EXISTS public.documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  status           public.document_status NOT NULL DEFAULT 'draft',
  file_path        TEXT,              -- Path in Supabase Storage bucket
  file_size        BIGINT DEFAULT 0,  -- File size in bytes
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_organisation_id ON public.documents(organisation_id);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_status ON public.documents(status);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Org members can see their org's documents
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Org members can create documents in their org
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT WITH CHECK (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
    AND created_by = (SELECT auth.uid())
  );

-- Org members can update their org's documents
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Only the document creator can delete
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE USING (
    created_by = (SELECT auth.uid())
  );


-- ---------------------------------------------------------------------------
-- 4. TAGS (per-organisation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (organisation_id, name)
);

CREATE INDEX idx_tags_organisation_id ON public.tags(organisation_id);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select" ON public.tags
  FOR SELECT USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "tags_insert" ON public.tags
  FOR INSERT WITH CHECK (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "tags_update" ON public.tags
  FOR UPDATE USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "tags_delete" ON public.tags
  FOR DELETE USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );


-- ---------------------------------------------------------------------------
-- 5. DOCUMENT_TAGS (junction table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_tags (
  document_id  UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_id       UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  PRIMARY KEY (document_id, tag_id)
);

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Org isolation via the parent document's organisation_id
CREATE POLICY "document_tags_select" ON public.document_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND d.organisation_id = (
          SELECT organisation_id FROM public.profiles
          WHERE id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "document_tags_insert" ON public.document_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND d.organisation_id = (
          SELECT organisation_id FROM public.profiles
          WHERE id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "document_tags_delete" ON public.document_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND d.organisation_id = (
          SELECT organisation_id FROM public.profiles
          WHERE id = (SELECT auth.uid())
        )
    )
  );


-- ---------------------------------------------------------------------------
-- 6. REMINDERS (linked to documents only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_at    TIMESTAMPTZ NOT NULL,
  message      TEXT DEFAULT '',
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_document_id ON public.reminders(document_id);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON public.reminders(remind_at);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reminders
CREATE POLICY "reminders_select" ON public.reminders
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "reminders_insert" ON public.reminders
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND d.organisation_id = (
          SELECT organisation_id FROM public.profiles
          WHERE id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "reminders_update" ON public.reminders
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "reminders_delete" ON public.reminders
  FOR DELETE USING (user_id = (SELECT auth.uid()));


-- ---------------------------------------------------------------------------
-- 7. CONTACTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL DEFAULT '',
  email            TEXT,
  phone            TEXT,
  company          TEXT,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_organisation_id ON public.contacts(organisation_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "contacts_insert" ON public.contacts
  FOR INSERT WITH CHECK (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "contacts_delete" ON public.contacts
  FOR DELETE USING (
    organisation_id = (
      SELECT organisation_id FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );


-- ---------------------------------------------------------------------------
-- 8. STORAGE BUCKET — Document files
-- ---------------------------------------------------------------------------
-- Create a private bucket for document uploads.
-- Files are stored under: {organisation_id}/{document_id}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Org members can read files from their org's folder
CREATE POLICY "storage_documents_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT organisation_id::text FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Org members can upload files to their org's folder
CREATE POLICY "storage_documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT organisation_id::text FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );

-- Org members can delete files from their org's folder
CREATE POLICY "storage_documents_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (
      SELECT organisation_id::text FROM public.profiles
      WHERE id = (SELECT auth.uid())
    )
  );
