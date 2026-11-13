-- Zero Control Database Schema
-- Version 1.0 (PostgreSQL compatible)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  username_normalized VARCHAR(30) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'membro',
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username_normalized ON users(username_normalized);

-- 2. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_path TEXT,
  bio TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 4. Modules (As 12 áreas do Zero Control)
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  route VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200) NOT NULL,
  description TEXT NOT NULL
);

-- 5. Opportunity Types (Os 24 tipos de oportunidade)
CREATE TABLE IF NOT EXISTS opportunity_types (
  id INTEGER PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

-- 6. Service Categories (As 24 áreas profissionais)
CREATE TABLE IF NOT EXISTS service_categories (
  id INTEGER PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER NOT NULL
);

-- 7. Posts (Mural da Guilda e outras vertentes)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin_module VARCHAR(50) NOT NULL DEFAULT 'guilda' REFERENCES modules(slug),
  intention VARCHAR(50) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  opportunity_type_slug VARCHAR(50) NOT NULL REFERENCES opportunity_types(slug),
  service_category_slug VARCHAR(50) NOT NULL REFERENCES service_categories(slug),
  modality VARCHAR(30) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  compensation_type VARCHAR(30) NOT NULL,
  amount_cents INTEGER,
  amount_min_cents INTEGER,
  amount_max_cents INTEGER,
  amount_unit VARCHAR(50),
  deadline TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(opportunity_type_slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(service_category_slug);

-- 8. Post Images
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  image_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);

-- 9. Applications (Candidaturas e Manifestações de Interesse)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_amount_cents INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'enviada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_post_applicant UNIQUE (post_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_post_id ON applications(post_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);

-- 10. Saved Posts (Favoritos)
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_saved_post UNIQUE (user_id, post_id)
);

-- 10.1 Post Comments (Comentários nos Job´s)
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at ASC);

-- 11. Reports (Conselho / Moderação)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  decision_notes TEXT,
  decided_by UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 12. Forja: Quote Requests (Pedidos de orçamento institucionais)
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  estimated_budget VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Forja: Service Offerings (Catálogo de serviços institucionais Phantom Troupe)
CREATE TABLE IF NOT EXISTS service_offerings (
  id UUID PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  estimated_delivery VARCHAR(100) NOT NULL,
  portfolio_sample TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Aliança: Partnerships
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY,
  partner_name VARCHAR(150) NOT NULL,
  benefit_title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  conditions TEXT NOT NULL,
  validity_date TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Missões: Quests
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  objective TEXT NOT NULL,
  delivery_criteria TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. Companhia: Teams & Members
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'convidado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

-- 17. Jornada: Engagements & Deliveries
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  terms TEXT NOT NULL,
  phase VARCHAR(30) NOT NULL DEFAULT 'preparacao',
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. Mutirão: Volunteer Actions
CREATE TABLE IF NOT EXISTS volunteer_actions (
  id UUID PRIMARY KEY,
  coordinator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_name VARCHAR(150) NOT NULL,
  purpose TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  expenses_reimbursement TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_participations (
  id UUID PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES volunteer_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_volunteer_participation UNIQUE (action_id, user_id)
);

-- 19. Embaixada: Contact Requests
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 20. Tesouraria: Financial Records
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_type VARCHAR(30) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  origin_description TEXT NOT NULL,
  confirmation_reference VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'registrado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. Fundação: Support Requests
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(120) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 22. Audit Events & Notifications
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
