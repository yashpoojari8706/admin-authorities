-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_timeline ENABLE ROW LEVEL SECURITY;

-- Create user roles
CREATE ROLE tourist;
CREATE ROLE authority;
CREATE ROLE admin;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authorities can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Authorities table policies
CREATE POLICY "Authorities can view all authorities" ON authorities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Authorities can update their own info" ON authorities
    FOR UPDATE USING (auth.uid() = id);

-- SOS Reports table policies
CREATE POLICY "Users can create SOS reports" ON sos_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON sos_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authorities can view all reports" ON sos_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Authorities can update reports" ON sos_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Incident photos policies
CREATE POLICY "Users can upload photos for their reports" ON incident_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sos_reports 
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view photos of their reports" ON incident_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sos_reports 
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authorities can view all incident photos" ON incident_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Response notes policies
CREATE POLICY "Authorities can create response notes" ON response_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Authorities can view all response notes" ON response_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view notes for their reports" ON response_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sos_reports 
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

-- Response timeline policies
CREATE POLICY "Authorities can view all timeline entries" ON response_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM authorities 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view timeline for their reports" ON response_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sos_reports 
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

-- Grant permissions to roles
GRANT USAGE ON SCHEMA public TO tourist, authority, admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT SELECT, INSERT, UPDATE ON users TO tourist;
GRANT SELECT ON authorities TO tourist;
GRANT SELECT, INSERT, UPDATE ON sos_reports TO tourist;
GRANT SELECT, INSERT ON incident_photos TO tourist;
GRANT SELECT ON response_notes TO tourist;
GRANT SELECT ON response_timeline TO tourist;

GRANT SELECT, UPDATE ON users TO authority;
GRANT SELECT, UPDATE ON authorities TO authority;
GRANT SELECT, UPDATE ON sos_reports TO authority;
GRANT SELECT ON incident_photos TO authority;
GRANT SELECT, INSERT, UPDATE ON response_notes TO authority;
GRANT SELECT ON response_timeline TO authority;

-- Create function to check if user is authority
CREATE OR REPLACE FUNCTION is_authority(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM authorities 
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
