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
    timestamp TIMESTAMP WITH TIME ZONE,
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
        rrv.timestamp,
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

-- Function to create a new SOS report
CREATE OR REPLACE FUNCTION create_sos_report(
    p_user_id UUID,
    p_latitude DECIMAL(10, 8),
    p_longitude DECIMAL(11, 8),
    p_address TEXT,
    p_landmark TEXT,
    p_incident_type incident_type,
    p_incident_description TEXT,
    p_priority report_priority DEFAULT 'medium',
    p_photos TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VARCHAR(20) AS $$
DECLARE
    new_report_id VARCHAR(20);
    photo_url TEXT;
BEGIN
    -- Generate unique report ID
    SELECT 'SOS-' || LPAD(NEXTVAL('sos_report_sequence')::TEXT, 3, '0') INTO new_report_id;
    
    -- Insert the main report
    INSERT INTO sos_reports (
        id, user_id, latitude, longitude, address, landmark, 
        incident_type, incident_description, priority
    ) VALUES (
        new_report_id, p_user_id, p_latitude, p_longitude, p_address, p_landmark,
        p_incident_type, p_incident_description, p_priority
    );
    
    -- Insert photos if provided
    IF array_length(p_photos, 1) > 0 THEN
        FOREACH photo_url IN ARRAY p_photos
        LOOP
            INSERT INTO incident_photos (report_id, photo_url)
            VALUES (new_report_id, photo_url);
        END LOOP;
    END IF;
    
    -- Create initial timeline entry
    INSERT INTO response_timeline (report_id, status, notes)
    VALUES (new_report_id, 'pending', 'Initial report created');
    
    RETURN new_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update report status
CREATE OR REPLACE FUNCTION update_report_status(
    p_report_id VARCHAR(20),
    p_status report_status,
    p_authority_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the report status
    UPDATE sos_reports 
    SET status = p_status, 
        assigned_to = COALESCE(p_authority_id, assigned_to)
    WHERE id = p_report_id;
    
    -- Add timeline entry
    INSERT INTO response_timeline (report_id, status, changed_by, notes)
    VALUES (p_report_id, p_status, p_authority_id, COALESCE(p_notes, 'Status updated to ' || p_status));
    
    -- Add response note if provided
    IF p_notes IS NOT NULL AND p_authority_id IS NOT NULL THEN
        INSERT INTO response_notes (report_id, authority_id, note)
        VALUES (p_report_id, p_authority_id, p_notes);
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign authority to report
CREATE OR REPLACE FUNCTION assign_authority_to_report(
    p_report_id VARCHAR(20),
    p_authority_id UUID,
    p_estimated_arrival TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the report with assignment
    UPDATE sos_reports 
    SET assigned_to = p_authority_id,
        estimated_arrival = p_estimated_arrival,
        status = CASE WHEN status = 'pending' THEN 'in-progress' ELSE status END
    WHERE id = p_report_id;
    
    -- Add timeline entry
    INSERT INTO response_timeline (report_id, status, changed_by, notes)
    VALUES (p_report_id, 'in-progress', p_authority_id, 
            COALESCE(p_notes, 'Authority assigned to report'));
    
    -- Add response note
    INSERT INTO response_notes (report_id, authority_id, note)
    VALUES (p_report_id, p_authority_id, 
            COALESCE(p_notes, 'Assigned to handle this emergency'));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get reports by status
CREATE OR REPLACE FUNCTION get_reports_by_status(p_status report_status)
RETURNS TABLE (
    id VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE,
    priority report_priority,
    user_name VARCHAR(255),
    address TEXT,
    incident_type incident_type,
    incident_description TEXT,
    assigned_unit VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rrv.id,
        rrv.timestamp,
        rrv.priority,
        rrv.user_name,
        rrv.address,
        rrv.incident_type,
        rrv.incident_description,
        rrv.assigned_unit
    FROM recent_reports_view rrv
    WHERE rrv.status = p_status
    ORDER BY rrv.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get reports near location
CREATE OR REPLACE FUNCTION get_reports_near_location(
    p_latitude DECIMAL(10, 8),
    p_longitude DECIMAL(11, 8),
    p_radius_km DECIMAL DEFAULT 5.0
)
RETURNS TABLE (
    id VARCHAR(20),
    distance_km DECIMAL,
    timestamp TIMESTAMP WITH TIME ZONE,
    status report_status,
    priority report_priority,
    address TEXT,
    incident_type incident_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        ROUND(
            ST_Distance(
                sr.location_point,
                ST_Point(p_longitude, p_latitude)::geography
            ) / 1000, 2
        ) as distance_km,
        sr.timestamp,
        sr.status,
        sr.priority,
        sr.address,
        sr.incident_type
    FROM sos_reports sr
    WHERE ST_DWithin(
        sr.location_point,
        ST_Point(p_longitude, p_latitude)::geography,
        p_radius_km * 1000
    )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for report IDs
CREATE SEQUENCE IF NOT EXISTS sos_report_sequence START 1;

-- Function to get report timeline
CREATE OR REPLACE FUNCTION get_report_timeline(p_report_id VARCHAR(20))
RETURNS TABLE (
    status report_status,
    changed_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rt.status,
        COALESCE(a.unit_name, 'System') as changed_by,
        rt.notes,
        rt.created_at
    FROM response_timeline rt
    LEFT JOIN authorities a ON rt.changed_by = a.id
    WHERE rt.report_id = p_report_id
    ORDER BY rt.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
