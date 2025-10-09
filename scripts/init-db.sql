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
