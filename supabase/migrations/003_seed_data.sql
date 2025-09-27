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
    ('550e8400-e29b-41d4-a716-446655440011', 'Maria Santos', '+55-11-98765-4321', 'maria.s@email.com', 'Brazil');

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
    ('660e8400-e29b-41d4-a716-446655440009', 'Railway Police & Medical Team', 'medical', '+91-22-RAILWAY', 'railway@mumbai.gov.in', ST_Point(72.8562, 19.0176));

-- Insert sample SOS reports
INSERT INTO sos_reports (id, user_id, timestamp, status, priority, latitude, longitude, address, landmark, incident_type, incident_description, assigned_to, estimated_arrival) VALUES
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
    ('SOS-MUM-006', '550e8400-e29b-41d4-a716-446655440011', '2024-01-15 11:00:00+00', 'pending', 'critical', 19.0176, 72.8562, 'Chhatrapati Shivaji Terminus, Fort', 'CST Railway Station Main Building', 'medical', 'Tourist collapsed at CST station, unconscious and unresponsive', '660e8400-e29b-41d4-a716-446655440009', '2024-01-15 11:15:00+00');

-- Insert sample incident photos
INSERT INTO incident_photos (report_id, photo_url) VALUES
    ('SOS-001', '/placeholder-medical-emergency.png'),
    ('SOS-002', '/crowded-tourist-area-theft-scene.jpg'),
    ('SOS-003', '/confused-tourist-on-street.jpg'),
    ('SOS-004', '/bicycle-accident-scene.jpg'),
    ('SOS-MUM-001', '/placeholder-medical-emergency.png'),
    ('SOS-MUM-002', '/crowded-tourist-area-theft-scene.jpg'),
    ('SOS-MUM-003', '/placeholder-assault-scene.png'),
    ('SOS-MUM-004', '/confused-tourist-on-street.jpg'),
    ('SOS-MUM-005', '/bicycle-accident-scene.jpg'),
    ('SOS-MUM-006', '/placeholder-medical-emergency.png');

-- Insert sample response notes
INSERT INTO response_notes (report_id, authority_id, note) VALUES
    ('SOS-001', '660e8400-e29b-41d4-a716-446655440001', 'Paramedics dispatched'),
    ('SOS-001', '660e8400-e29b-41d4-a716-446655440001', 'Tourist conscious but distressed'),
    ('SOS-002', '660e8400-e29b-41d4-a716-446655440002', 'Report filed'),
    ('SOS-002', '660e8400-e29b-41d4-a716-446655440002', 'Checking nearby CCTV footage'),
    ('SOS-003', '660e8400-e29b-41d4-a716-446655440003', 'Tourist safely escorted to hotel'),
    ('SOS-003', '660e8400-e29b-41d4-a716-446655440003', 'Provided emergency contact info'),
    ('SOS-004', NULL, 'Awaiting response unit assignment'),
    ('SOS-005', NULL, 'Confirmed false alarm via callback'),
    ('SOS-005', NULL, 'User apologized for mistake'),
    ('SOS-MUM-001', '660e8400-e29b-41d4-a716-446655440004', 'Ambulance dispatched'),
    ('SOS-MUM-001', '660e8400-e29b-41d4-a716-446655440004', 'Critical medical emergency'),
    ('SOS-MUM-002', '660e8400-e29b-41d4-a716-446655440005', 'Police team dispatched'),
    ('SOS-MUM-002', '660e8400-e29b-41d4-a716-446655440005', 'Searching for suspects'),
    ('SOS-MUM-003', '660e8400-e29b-41d4-a716-446655440006', 'Patrol unit en route'),
    ('SOS-MUM-003', '660e8400-e29b-41d4-a716-446655440006', 'High priority response'),
    ('SOS-MUM-004', '660e8400-e29b-41d4-a716-446655440007', 'Guide dispatched to assist'),
    ('SOS-MUM-004', '660e8400-e29b-41d4-a716-446655440007', 'Providing directions'),
    ('SOS-MUM-005', '660e8400-e29b-41d4-a716-446655440008', 'Vehicle towed'),
    ('SOS-MUM-005', '660e8400-e29b-41d4-a716-446655440008', 'Tourist provided alternate transport'),
    ('SOS-MUM-005', '660e8400-e29b-41d4-a716-446655440008', 'Case resolved'),
    ('SOS-MUM-006', '660e8400-e29b-41d4-a716-446655440009', 'Emergency medical team dispatched'),
    ('SOS-MUM-006', '660e8400-e29b-41d4-a716-446655440009', 'Critical condition');

-- Insert initial timeline entries
INSERT INTO response_timeline (report_id, status, changed_by, notes) VALUES
    ('SOS-001', 'pending', NULL, 'Initial report created'),
    ('SOS-001', 'in-progress', '660e8400-e29b-41d4-a716-446655440001', 'Medical unit assigned and dispatched'),
    ('SOS-002', 'pending', NULL, 'Initial report created'),
    ('SOS-002', 'in-progress', '660e8400-e29b-41d4-a716-446655440002', 'Police officer assigned to case'),
    ('SOS-003', 'pending', NULL, 'Initial report created'),
    ('SOS-003', 'in-progress', '660e8400-e29b-41d4-a716-446655440003', 'Tourist guide unit assigned'),
    ('SOS-003', 'resolved', '660e8400-e29b-41d4-a716-446655440003', 'Tourist safely returned to hotel'),
    ('SOS-004', 'pending', NULL, 'Initial report created'),
    ('SOS-005', 'pending', NULL, 'Initial report created'),
    ('SOS-005', 'false-alarm', NULL, 'Confirmed as accidental activation'),
    ('SOS-MUM-001', 'pending', NULL, 'Initial report created'),
    ('SOS-MUM-002', 'pending', NULL, 'Initial report created'),
    ('SOS-MUM-002', 'in-progress', '660e8400-e29b-41d4-a716-446655440005', 'Police team assigned'),
    ('SOS-MUM-003', 'pending', NULL, 'Initial report created'),
    ('SOS-MUM-004', 'pending', NULL, 'Initial report created'),
    ('SOS-MUM-004', 'in-progress', '660e8400-e29b-41d4-a716-446655440007', 'Tourist helpline team assigned'),
    ('SOS-MUM-005', 'pending', NULL, 'Initial report created'),
    ('SOS-MUM-005', 'in-progress', '660e8400-e29b-41d4-a716-446655440008', 'Traffic police unit assigned'),
    ('SOS-MUM-005', 'resolved', '660e8400-e29b-41d4-a716-446655440008', 'Vehicle issue resolved, tourist assisted'),
    ('SOS-MUM-006', 'pending', NULL, 'Initial report created');
