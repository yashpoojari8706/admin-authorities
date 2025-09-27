-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE report_status AS ENUM ('pending', 'in-progress', 'resolved', 'false-alarm');
CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_type AS ENUM ('medical', 'theft', 'assault', 'lost', 'accident', 'other');

-- Users table for tourists
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorities/Response units table
CREATE TABLE authorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(100) NOT NULL, -- 'police', 'medical', 'fire', 'tourist_guide'
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    current_location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOS Reports main table
CREATE TABLE sos_reports (
    id VARCHAR(20) PRIMARY KEY, -- Custom format like 'SOS-001', 'SOS-MUM-001'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status report_status DEFAULT 'pending',
    priority report_priority DEFAULT 'medium',
    
    -- Location information
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    location_point GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_Point(longitude, latitude)) STORED,
    
    -- Incident details
    incident_type incident_type NOT NULL,
    incident_description TEXT NOT NULL,
    
    -- Response information
    assigned_to UUID REFERENCES authorities(id),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for incident documentation
CREATE TABLE incident_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response notes table for tracking progress
CREATE TABLE response_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    authority_id UUID REFERENCES authorities(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response timeline for tracking status changes
CREATE TABLE response_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(20) NOT NULL REFERENCES sos_reports(id) ON DELETE CASCADE,
    status report_status NOT NULL,
    changed_by UUID REFERENCES authorities(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard statistics view
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status IN ('pending', 'in-progress')) as active_reports,
    COUNT(*) FILTER (WHERE status = 'resolved' AND DATE(created_at) = CURRENT_DATE) as resolved_today,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE status = 'resolved') as total_resolved,
    COUNT(*) FILTER (WHERE status = 'false-alarm') as false_alarms
FROM sos_reports;

-- Recent reports view with user and authority details
CREATE VIEW recent_reports_view AS
SELECT 
    sr.id,
    sr.timestamp,
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
    
    -- User information
    u.name as user_name,
    u.phone as user_phone,
    u.email as user_email,
    u.nationality as user_nationality,
    
    -- Authority information
    a.unit_name as assigned_unit,
    a.unit_type as assigned_unit_type,
    a.contact_phone as authority_phone,
    
    -- Photo count
    (SELECT COUNT(*) FROM incident_photos WHERE report_id = sr.id) as photo_count,
    
    -- Notes count
    (SELECT COUNT(*) FROM response_notes WHERE report_id = sr.id) as notes_count
    
FROM sos_reports sr
LEFT JOIN users u ON sr.user_id = u.id
LEFT JOIN authorities a ON sr.assigned_to = a.id
ORDER BY sr.timestamp DESC;

-- Create indexes for better performance
CREATE INDEX idx_sos_reports_status ON sos_reports(status);
CREATE INDEX idx_sos_reports_priority ON sos_reports(priority);
CREATE INDEX idx_sos_reports_timestamp ON sos_reports(timestamp DESC);
CREATE INDEX idx_sos_reports_location ON sos_reports USING GIST(location_point);
CREATE INDEX idx_sos_reports_user_id ON sos_reports(user_id);
CREATE INDEX idx_sos_reports_assigned_to ON sos_reports(assigned_to);
CREATE INDEX idx_incident_photos_report_id ON incident_photos(report_id);
CREATE INDEX idx_response_notes_report_id ON response_notes(report_id);
CREATE INDEX idx_response_timeline_report_id ON response_timeline(report_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authorities_updated_at BEFORE UPDATE ON authorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sos_reports_updated_at BEFORE UPDATE ON sos_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create timeline entry when status changes
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

CREATE TRIGGER sos_reports_status_timeline 
    AFTER UPDATE ON sos_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION create_status_timeline();
