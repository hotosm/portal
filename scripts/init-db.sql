-- Initialize database with PostGIS extension

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS installation
SELECT PostGIS_Version();

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'PostGIS extension successfully enabled';
END $$;

-- Create hanko_user_mappings table for authentication
CREATE TABLE IF NOT EXISTS hanko_user_mappings (
    hanko_user_id VARCHAR(255) PRIMARY KEY,
    app_user_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(100) NOT NULL DEFAULT 'portal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_hanko_app UNIQUE (hanko_user_id, app_name)
);

CREATE INDEX IF NOT EXISTS idx_hanko_mappings_app_user ON hanko_user_mappings (app_user_id, app_name);

DO $$
BEGIN
    RAISE NOTICE 'hanko_user_mappings table created';
END $$;
