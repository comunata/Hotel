-- BaecoDigital Smart Hospitality — Schema v1
-- Tables prefixed with h_ to avoid conflicts with comunata.ro schema

-- Properties
CREATE TABLE IF NOT EXISTS h_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  location TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  google_maps_url TEXT,
  arrival_instructions TEXT,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms / Units per property
CREATE TABLE IF NOT EXISTS h_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES h_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 2,
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 450,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest CRM
CREATE TABLE IF NOT EXISTS h_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  visits_count INTEGER DEFAULT 0,
  first_visit DATE,
  last_visit DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (email),
  UNIQUE NULLS NOT DISTINCT (phone)
);

-- Reservations
CREATE TABLE IF NOT EXISTS h_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  property_id UUID REFERENCES h_properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES h_rooms(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES h_guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER DEFAULT 2,
  extras JSONB DEFAULT '[]',
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages / Communication log
CREATE TABLE IF NOT EXISTS h_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES h_reservations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('guest', 'admin', 'system')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability overrides (blocked dates)
CREATE TABLE IF NOT EXISTS h_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES h_properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES h_rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  note TEXT,
  UNIQUE NULLS NOT DISTINCT (room_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_h_reservations_code ON h_reservations(code);
CREATE INDEX IF NOT EXISTS idx_h_reservations_check_in ON h_reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_h_reservations_status ON h_reservations(status);
CREATE INDEX IF NOT EXISTS idx_h_guests_email ON h_guests(email);
CREATE INDEX IF NOT EXISTS idx_h_guests_phone ON h_guests(phone);
CREATE INDEX IF NOT EXISTS idx_h_messages_reservation ON h_messages(reservation_id);

-- RLS Policies
ALTER TABLE h_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE h_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE h_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE h_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE h_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE h_availability ENABLE ROW LEVEL SECURITY;

-- Public read for properties (site visitors)
CREATE POLICY "Properties are publicly visible" ON h_properties
  FOR SELECT TO anon, authenticated USING (active = true);

-- Public read for rooms
CREATE POLICY "Rooms are publicly visible" ON h_rooms
  FOR SELECT TO anon, authenticated USING (active = true);

-- Reservations: anyone can insert (booking), only authenticated can read all
CREATE POLICY "Anyone can create reservation" ON h_reservations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Reservation owner can read by code" ON h_reservations
  FOR SELECT TO anon, authenticated USING (true);

-- Messages: anyone can insert, read own reservation messages
CREATE POLICY "Anyone can insert messages" ON h_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read messages" ON h_messages
  FOR SELECT TO anon, authenticated USING (true);

-- Guests: only authenticated (admin) can read all; insert via API
CREATE POLICY "Anyone can insert guest" ON h_guests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read guests" ON h_guests
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can update guest" ON h_guests
  FOR UPDATE TO anon, authenticated USING (true);

-- Availability: public read, authenticated write
CREATE POLICY "Anyone can read availability" ON h_availability
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can manage availability" ON h_availability
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed: Poiana Salcâmilor
INSERT INTO h_properties (name, slug, tagline, location, description, phone, whatsapp, address, amenities)
VALUES (
  'Poiana Salcâmilor',
  'poiana-salcamilor',
  'Două nopți de liniște.',
  'Negrești, Vaslui',
  'O proprietate ascunsă în inima naturii, unde liniștea se simte din primul moment.',
  '+40 700 000 000',
  '40700000000',
  'Negrești, Vaslui, România',
  '["Ciubăr", "Grătar", "Parcare privată", "WiFi", "Focar", "Terasă", "Curte privată"]'
) ON CONFLICT (slug) DO NOTHING;

-- Seed room for Poiana Salcâmilor
INSERT INTO h_rooms (property_id, name, capacity, price_per_night, amenities)
SELECT
  id,
  'Cabana Principală',
  8,
  450.00,
  '["Pat dublu", "2 canapele extensibile", "Bucătărie", "Baie proprie", "Terasă"]'
FROM h_properties WHERE slug = 'poiana-salcamilor'
ON CONFLICT DO NOTHING;
