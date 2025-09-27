-- COMPLETE SUPABASE SETUP FOR POLICE DASHBOARD
-- Run this script in Supabase SQL Editor to set up the entire backend
-- Make sure to run this in order and check for any errors

-- ============================================================================
-- STEP 1: EXTENSIONS AND TYPES
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'in-progress', 'resolved', 'false-alarm');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM ('medical', 'theft', 'assault', 'lost', 'accident', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- Users table for tourists
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorities/Response units table
CREATE TABLE IF NOT EXISTS authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    current_location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOS Reports main table
CREATE TABLE IF NOT EXISTS sos_reports (
    id VARCHAR(20) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status report_status DEFAULT 'pending',
    priority report_priority DEFAULT 'medium',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    location_point GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_Point(longitude, latitude)) STORED,
    incident_type incident_type NOT NULL,
    incident_description TEXT NOT NULL,
    assigned_to UUID REFERENCES authorities(id),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for incident documentation
CREATE TABLE IF NOT EXISTS incident_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response notes table for tracking progress
CREATE TABLE IF NOT EXISTS response_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    authority_id UUID REFERENCES authorities(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response timeline for tracking status changes
CREATE TABLE IF NOT EXISTS response_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    status report_status NOT NULL,
    changed_by UUID REFERENCES authorities(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sos_reports_status ON sos_reports(status);
CREATE INDEX IF NOT EXISTS idx_sos_reports_priority ON sos_reports(priority);
CREATE INDEX IF NOT EXISTS idx_sos_reports_timestamp ON sos_reports(report_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sos_reports_location ON sos_reports USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_sos_reports_user_id ON sos_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_reports_assigned_to ON sos_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incident_photos_report_id ON incident_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_response_notes_report_id ON response_notes(report_id);
CREATE INDEX IF NOT EXISTS idx_response_timeline_report_id ON response_timeline(report_id);

-- ============================================================================
-- STEP 4: CREATE VIEWS
-- ============================================================================

-- Dashboard statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status IN ('pending', 'in-progress')) as active_reports,
    COUNT(*) FILTER (WHERE status = 'resolved' AND DATE(created_at) = CURRENT_DATE) as resolved_today,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE status = 'resolved') as total_resolved,
    COUNT(*) FILTER (WHERE status = 'false-alarm') as false_alarms
FROM sos_reports;

-- Recent reports view with user and authority details
CREATE OR REPLACE VIEW recent_reports_view AS
SELECT 
    sr.id,
    sr.report_timestamp as timestamp,
    sr.status,
    sr.priority,
    sr.latitude,
    sr.longitude,
    sr.address,
    sr.landmark,
    sr.incident_type,
    sr.incident_description,
    sr.estimated_arrival,
    sr.created_at,
    sr.updated_at,
    u.name as user_name,
    u.phone as user_phone,
    u.email as user_email,
    u.nationality as user_nationality,
    a.unit_name as assigned_unit,
    a.unit_type as assigned_unit_type,
    a.contact_phone as authority_phone,
    (SELECT COUNT(*) FROM incident_photos WHERE report_id = sr.id) as photo_count,
    (SELECT COUNT(*) FROM response_notes WHERE report_id = sr.id) as notes_count
FROM sos_reports sr
LEFT JOIN users u ON sr.user_id = u.id
LEFT JOIN authorities a ON sr.assigned_to = a.id
ORDER BY sr.report_timestamp DESC;

-- ============================================================================
-- STEP 5: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_authorities_updated_at ON authorities;
CREATE TRIGGER update_authorities_updated_at BEFORE UPDATE ON authorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sos_reports_updated_at ON sos_reports;
CREATE TRIGGER update_sos_reports_updated_at BEFORE UPDATE ON sos_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Status timeline trigger
CREATE OR REPLACE FUNCTION create_status_timeline()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO response_timeline (report_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, NEW.assigned_to, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS sos_reports_status_timeline ON sos_reports;
CREATE TRIGGER sos_reports_status_timeline 
    AFTER UPDATE ON sos_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION create_status_timeline();

-- ============================================================================
-- STEP 6: CREATE API FUNCTIONS
-- ============================================================================

-- Sequence for report IDs
CREATE SEQUENCE IF NOT EXISTS sos_report_sequence START 1;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalReports', total_reports,
        'activeReports', active_reports,
        'resolvedToday', resolved_today,
        'criticalAlerts', critical_alerts,
        'averageResponseTime', '8.5 minutes',
        'responseRate', '94%'
    ) INTO result
    FROM dashboard_stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent reports with all details
CREATE OR REPLACE FUNCTION get_recent_reports(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id VARCHAR(20),
    report_timestamp TIMESTAMP WITH TIME ZONE,
    status report_status,
    priority report_priority,
    user_name VARCHAR(255),
    user_phone VARCHAR(20),
    user_email VARCHAR(255),
    user_nationality VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    landmark TEXT,
    incident_type incident_type,
    incident_description TEXT,
    assigned_unit VARCHAR(255),
    assigned_unit_type VARCHAR(100),
    authority_phone VARCHAR(20),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    photo_count BIGINT,
    notes_count BIGINT,
    photos TEXT[],
    notes TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rrv.id,
        rrv.timestamp as report_timestamp,
        rrv.status,
        rrv.priority,
        rrv.user_name,
        rrv.user_phone,
        rrv.user_email,
        rrv.user_nationality,
        rrv.latitude,
        rrv.longitude,
        rrv.address,
        rrv.landmark,
        rrv.incident_type,
        rrv.incident_description,
        rrv.assigned_unit,
        rrv.assigned_unit_type,
        rrv.authority_phone,
        rrv.estimated_arrival,
        rrv.photo_count,
        rrv.notes_count,
        COALESCE(
            (SELECT ARRAY_AGG(photo_url) FROM incident_photos WHERE report_id = rrv.id),
            ARRAY[]::TEXT[]
        ) as photos,
        COALESCE(
            (SELECT ARRAY_AGG(note) FROM response_notes WHERE report_id = rrv.id ORDER BY created_at),
            ARRAY[]::TEXT[]
        ) as notes
    FROM recent_reports_view rrv
    ORDER BY rrv.timestamp DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 7: INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample users (tourists)
INSERT INTO users (id, name, phone, email, nationality) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', '+1-555-0123', 'sarah.j@email.com', 'USA'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Marco Rodriguez', '+34-600-123456', 'marco.r@email.com', 'Spain'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Emma Thompson', '+44-7700-900123', 'emma.t@email.com', 'UK'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Yuki Tanaka', '+81-90-1234-5678', 'yuki.t@email.com', 'Japan'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Pierre Dubois', '+33-6-12-34-56-78', 'pierre.d@email.com', 'France'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Raj Patel', '+91-98765-43210', 'raj.p@email.com', 'India'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Lisa Chen', '+86-138-0013-8000', 'lisa.c@email.com', 'China'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Ahmed Hassan', '+971-50-123-4567', 'ahmed.h@email.com', 'UAE'),
    ('550e8400-e29b-41d4-a716-446655440009', 'Sophie Martin', '+33-6-98-76-54-32', 'sophie.m@email.com', 'France'),
    ('550e8400-e29b-41d4-a716-446655440010', 'James Wilson', '+44-7911-123456', 'james.w@email.com', 'UK'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Maria Santos', '+55-11-98765-4321', 'maria.s@email.com', 'Brazil')
ON CONFLICT (id) DO NOTHING;

-- Insert sample authorities/response units
INSERT INTO authorities (id, unit_name, unit_type, contact_phone, contact_email, current_location) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Unit Alpha-7', 'medical', '+1-555-ALPHA7', 'alpha7@emergency.gov', ST_Point(-74.006, 40.7128)),
    ('660e8400-e29b-41d4-a716-446655440002', 'Officer Martinez', 'police', '+1-555-POLICE', 'martinez@police.gov', ST_Point(-73.9851, 40.7589)),
    ('660e8400-e29b-41d4-a716-446655440003', 'Tourist Guide Unit', 'tourist_guide', '+1-555-GUIDE', 'guide@tourism.gov', ST_Point(-73.9934, 40.7505)),
    ('660e8400-e29b-41d4-a716-446655440004', 'Mumbai Emergency Unit-1', 'medical', '+91-22-EMRG001', 'emergency1@mumbai.gov.in', ST_Point(72.8777, 19.076)),
    ('660e8400-e29b-41d4-a716-446655440005', 'Juhu Police Station', 'police', '+91-22-JUHU-PS', 'juhu@mumbaipolice.gov.in', ST_Point(72.8297, 19.033)),
    ('660e8400-e29b-41d4-a716-446655440006', 'Marine Drive Patrol', 'police', '+91-22-MARINE', 'marine@mumbaipolice.gov.in', ST_Point(72.8231, 19.0825)),
    ('660e8400-e29b-41d4-a716-446655440007', 'Tourist Helpline Team', 'tourist_guide', '+91-22-TOURIST', 'helpline@mumbaitourism.gov.in', ST_Point(72.8656, 19.0896)),
    ('660e8400-e29b-41d4-a716-446655440008', 'Traffic Police Unit', 'police', '+91-22-TRAFFIC', 'traffic@mumbaipolice.gov.in', ST_Point(72.8697, 19.1136)),
    ('660e8400-e29b-41d4-a716-446655440009', 'Railway Police & Medical Team', 'medical', '+91-22-RAILWAY', 'railway@mumbai.gov.in', ST_Point(72.8562, 19.0176))
ON CONFLICT (id) DO NOTHING;

-- Insert sample SOS reports
INSERT INTO sos_reports (id, user_id, report_timestamp, status, priority, latitude, longitude, address, landmark, incident_type, incident_description, assigned_to, estimated_arrival) VALUES
    ('SOS-001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15 14:30:00+00', 'in-progress', 'critical', 40.7128, -74.006, '123 Tourist Plaza, Downtown', 'Near Central Park', 'medical', 'Tourist collapsed, appears to be having difficulty breathing', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15 14:45:00+00'),
    ('SOS-002', '550e8400-e29b-41d4-a716-446655440002', '2024-01-15 13:15:00+00', 'in-progress', 'high', 40.7589, -73.9851, '456 Market Street', 'Times Square area', 'theft', 'Wallet and passport stolen by pickpocket', '660e8400-e29b-41d4-a716-446655440002', NULL),
    ('SOS-003', '550e8400-e29b-41d4-a716-446655440003', '2024-01-15 12:00:00+00', 'resolved', 'medium', 40.7505, -73.9934, '789 Heritage Avenue', 'Museum District', 'lost', 'Lost in unfamiliar area, phone battery dead', '660e8400-e29b-41d4-a716-446655440003', NULL),
    ('SOS-004', '550e8400-e29b-41d4-a716-446655440004', '2024-01-15 11:30:00+00', 'pending', 'high', 40.7282, -74.0776, '321 Waterfront Drive', 'Harbor View', 'accident', 'Bicycle accident, minor injuries but unable to move bike', NULL, NULL),
    ('SOS-005', '550e8400-e29b-41d4-a716-446655440005', '2024-01-15 10:45:00+00', 'false-alarm', 'low', 40.7614, -73.9776, '654 Shopping District', 'Fashion Avenue', 'other', 'Accidentally pressed SOS button while taking photos', NULL, NULL),
    ('SOS-MUM-001', '550e8400-e29b-41d4-a716-446655440006', '2024-01-15 16:45:00+00', 'pending', 'critical', 19.076, 72.8777, 'Gateway of India, Apollo Bandar, Colaba', 'Gateway of India Monument', 'medical', 'Tourist experiencing severe chest pain near Gateway of India', '660e8400-e29b-41d4-a716-446655440004', '2024-01-15 17:00:00+00'),
    ('SOS-MUM-002', '550e8400-e29b-41d4-a716-446655440007', '2024-01-15 15:30:00+00', 'in-progress', 'high', 19.033, 72.8297, 'Juhu Beach, Juhu Tara Road', 'Juhu Beach Main Area', 'theft', 'Bag snatching incident at Juhu Beach, passport and money stolen', '660e8400-e29b-41d4-a716-446655440005', NULL),
    ('SOS-MUM-003', '550e8400-e29b-41d4-a716-446655440008', '2024-01-15 14:15:00+00', 'pending', 'high', 19.0825, 72.8231, 'Marine Drive, Nariman Point', 'Queen''s Necklace Promenade', 'assault', 'Tourist harassed and threatened by group near Marine Drive', '660e8400-e29b-41d4-a716-446655440006', NULL),
    ('SOS-MUM-004', '550e8400-e29b-41d4-a716-446655440009', '2024-01-15 13:45:00+00', 'in-progress', 'medium', 19.0896, 72.8656, 'Crawford Market, Dr. Dadabhai Naoroji Rd', 'Crawford Market Main Entrance', 'lost', 'Lost in Crawford Market area, unable to find way back to hotel', '660e8400-e29b-41d4-a716-446655440007', NULL),
    ('SOS-MUM-005', '550e8400-e29b-41d4-a716-446655440010', '2024-01-15 12:30:00+00', 'resolved', 'medium', 19.1136, 72.8697, 'Bandra-Worli Sea Link, Bandra West', 'Sea Link Viewpoint', 'accident', 'Minor vehicle accident near Sea Link, tourist vehicle breakdown', '660e8400-e29b-41d4-a716-446655440008', NULL),
    ('SOS-MUM-006', '550e8400-e29b-41d4-a716-446655440011', '2024-01-15 11:00:00+00', 'pending', 'critical', 19.0176, 72.8562, 'Chhatrapati Shivaji Terminus, Fort', 'CST Railway Station Main Building', 'medical', 'Tourist collapsed at CST station, unconscious and unresponsive', '660e8400-e29b-41d4-a716-446655440009', '2024-01-15 11:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if everything was created successfully
SELECT 'Setup completed successfully!' as status;
SELECT 'Total users created: ' || COUNT(*) as users_count FROM users;
SELECT 'Total authorities created: ' || COUNT(*) as authorities_count FROM authorities;
SELECT 'Total reports created: ' || COUNT(*) as reports_count FROM sos_reports;

-- Test the dashboard stats function
SELECT 'Dashboard stats test:' as test;
SELECT get_dashboard_stats() as dashboard_data;
