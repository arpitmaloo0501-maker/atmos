-- =============================================================================
-- MausamNet / Atmos Weather Reports Database Schema & Migration
-- =============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-id>/sql/new
--
-- This script provides:
-- 1. Fresh table creation with PostGIS spatial tracking & UUID keys
-- 2. Non-destructive migration if weather_reports already exists
-- 3. Automatic spatial geometry synchronization trigger
-- 4. Spatial and temporal indexing for high-throughput queries
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- -----------------------------------------------------------------------------
-- 1. FRESH INSTALLATION (Table does not exist)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL DEFAULT 'social_media', -- 'social_media', 'citizen_app', 'sensor'
    original_text TEXT,
    media_url TEXT, -- Handles photos or video uploads
    media_hash TEXT, -- Used for perceptual deduplication (pHash)
    category VARCHAR(50), -- 'Rainfall', 'Flooding', 'Thunderstorm', 'Heatwave', etc.
    latitude FLOAT,
    longitude FLOAT,
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- 'VERIFIED', 'SUSPICIOUS', 'REJECTED', 'PENDING'
    credibility_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. NON-DESTRUCTIVE MIGRATION (If table already exists with legacy columns)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    -- Add columns if they do not exist yet
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'source_type') THEN
        ALTER TABLE weather_reports ADD COLUMN source_type VARCHAR(50) DEFAULT 'social_media';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'original_text') THEN
        ALTER TABLE weather_reports ADD COLUMN original_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'media_hash') THEN
        ALTER TABLE weather_reports ADD COLUMN media_hash TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'category') THEN
        ALTER TABLE weather_reports ADD COLUMN category VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'verification_status') THEN
        ALTER TABLE weather_reports ADD COLUMN verification_status VARCHAR(20) DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'credibility_score') THEN
        ALTER TABLE weather_reports ADD COLUMN credibility_score FLOAT DEFAULT 0.0;
    END IF;

    -- Backfill new columns from legacy columns if present
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'event_type') THEN
        UPDATE weather_reports SET category = COALESCE(category, event_type);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'description') THEN
        UPDATE weather_reports SET original_text = COALESCE(original_text, description);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'status') THEN
        UPDATE weather_reports SET verification_status = COALESCE(verification_status, UPPER(status));
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'trust_score') THEN
        UPDATE weather_reports SET credibility_score = COALESCE(credibility_score, ROUND((trust_score::numeric / 100.0), 2)) WHERE trust_score IS NOT NULL;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. POSTGIS POINT GEOMETRY COLUMN
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_reports' AND column_name = 'geom') THEN
        PERFORM AddGeometryColumn('public', 'weather_reports', 'geom', 4326, 'POINT', 2);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. AUTOMATIC GEOMETRY POPULATION & INDEXES
-- -----------------------------------------------------------------------------
-- Create or replace trigger function to sync geom with (longitude, latitude)
CREATE OR REPLACE FUNCTION sync_weather_report_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_weather_report_geom ON weather_reports;
CREATE TRIGGER trg_sync_weather_report_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude ON weather_reports
    FOR EACH ROW
    EXECUTE FUNCTION sync_weather_report_geom();

-- Populate existing rows
UPDATE weather_reports
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geom IS NULL;

-- Spatial GIST index for fast radius searches (e.g. ST_DWithin)
CREATE INDEX IF NOT EXISTS idx_weather_reports_geom ON weather_reports USING GIST (geom);

-- B-Tree indexes for fast querying and realtime filtering
CREATE INDEX IF NOT EXISTS idx_weather_reports_created_at ON weather_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_reports_category ON weather_reports (category);
CREATE INDEX IF NOT EXISTS idx_weather_reports_verification_status ON weather_reports (verification_status);
CREATE INDEX IF NOT EXISTS idx_weather_reports_source_type ON weather_reports (source_type);

-- Enable Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE weather_reports;
