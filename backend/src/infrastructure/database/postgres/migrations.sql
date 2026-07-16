-- Base de datos para la Asociación Turística Las Rocas
-- PostgreSQL

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'visitor' CHECK (role IN ('super_admin', 'admin', 'staff', 'visitor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de servicios turísticos
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('hospedaje', 'restaurante', 'aventura', 'cultura', 'gastronomia', 'transporte', 'paquete', 'piscinas', 'otro')),
    image TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    duration VARCHAR(50),
    location TEXT,
    schedule TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Migración: agregar columnas de disponibilidad a servicios
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 999;
ALTER TABLE services ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS available_until DATE;

-- 3. Tabla de noticias y eventos
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('noticia', 'evento', 'festividad', 'actividad')),
    image TEXT,
    event_date TIMESTAMP,
    location TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id),
    service_name VARCHAR(255),
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    number_of_people INTEGER,
    preferred_date TIMESTAMP,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla de preguntas del chatbot
CREATE TABLE IF NOT EXISTS chatbot_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keywords TEXT[] DEFAULT '{}',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tabla de información institucional
CREATE TABLE IF NOT EXISTS organization (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    name VARCHAR(255) NOT NULL DEFAULT 'Asociación Turística Las Rocas',
    legal_name TEXT,
    ruc VARCHAR(20),
    description TEXT,
    history TEXT,
    mission TEXT,
    vision TEXT,
    objectives TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo TEXT,
    cover_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar registro institucional por defecto
INSERT INTO organization (id, name, description, mission, vision, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Asociación Turística Las Rocas',
    'Promoviendo el turismo local y experiencias auténticas en nuestra región.',
    'Ser el puente entre los visitantes y las maravillas de nuestra tierra, promoviendo el desarrollo turístico sostenible.',
    'Convertirnos en la asociación turística de referencia, preservando nuestra cultura y naturaleza.',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insertar usuario administrador por defecto (password: Admin123!)
-- Email: admin@lasrocas
-- Password hash: $2a$10$rQyK.vTqJj8.3PqXJQVxEeZY8pE2vqFqPxqVxQ3xQ3xQ3xQ3xQ3xQ (bcrypt de "Admin123!")
INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@lasrocas',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjqQBrkHxO3A3F9bBqJq.f5hT1LR5u',
    'Administrador',
    'Las Rocas',
    'super_admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_event_date ON news(event_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_service ON reservations(service_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_category ON chatbot_questions(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_active ON chatbot_questions(is_active);

-- 8. Agregar columna page_content a organization para CMS de páginas
ALTER TABLE organization ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT '{}'::jsonb;

-- 9. Eliminar CHECK constraint de categorías para que el administrador pueda gestionarlas libremente
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;

-- 10. Tabla de logs del chatbot para estadísticas
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('faq', 'ai', 'fallback')),
    matched_question TEXT,
    confidence VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_logs_created_at ON chatbot_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_source ON chatbot_logs(source);

-- 11. Agregar feedback y session_id a chatbot_logs
ALTER TABLE chatbot_logs ADD COLUMN IF NOT EXISTS feedback VARCHAR(10) CHECK (feedback IN ('like', 'dislike'));
ALTER TABLE chatbot_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session ON chatbot_logs(session_id);

-- 12. Agregar super_admin al CHECK de users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'board', 'staff', 'visitor'));

-- 13. Tabla de atractivos turísticos
CREATE TABLE IF NOT EXISTS touristic_attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('natural', 'cultural', 'aventura', 'gastronomico', 'historico', 'playa', 'montana', 'otro')),
    image TEXT,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    schedule TEXT,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    duration VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attractions_category ON touristic_attractions(category);
CREATE INDEX IF NOT EXISTS idx_attractions_active ON touristic_attractions(is_active);

-- 14. Tabla de auditoría de actividades de administradores
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 15. Tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- 16. Tabla de reseñas públicas
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service_name VARCHAR(200),
    role VARCHAR(100),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_name);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- 18. Tabla de sesiones del chatbot (persistente)
CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id VARCHAR(100) PRIMARY KEY,
    history JSONB DEFAULT '[]'::jsonb,
    summary TEXT DEFAULT '',
    language VARCHAR(2) DEFAULT 'es',
    preferred_category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_updated ON chatbot_sessions(updated_at);

-- 19. Tabla de embeddings para RAG del chatbot
CREATE TABLE IF NOT EXISTS chatbot_embeddings (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    embedding JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_embeddings_content ON chatbot_embeddings USING gin(to_tsvector('spanish', content));