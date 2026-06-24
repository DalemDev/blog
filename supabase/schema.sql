CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color      VARCHAR(7) DEFAULT '#6366f1',
  icon       VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50) NOT NULL,
  slug       VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT,
  cover_image_url TEXT,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time       INTEGER DEFAULT 1,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name  VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content      TEXT NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_status     ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published  ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug       ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post    ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status  ON comments(status);

CREATE INDEX IF NOT EXISTS idx_posts_fts ON posts
  USING gin(to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')));

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"  ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write"  ON categories FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "tags_public_read"  ON tags FOR SELECT USING (true);
CREATE POLICY "tags_admin_write"  ON tags FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "posts_public_read"  ON posts FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "posts_admin_write"  ON posts FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "post_tags_public_read" ON post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags_admin_write" ON post_tags FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "comments_public_read"   ON comments FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');
CREATE POLICY "comments_public_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_admin_manage"  ON comments FOR ALL    USING (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

CREATE POLICY "post_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-images' AND auth.role() = 'authenticated');

ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE posts SET views = views + 1
  WHERE slug = post_slug AND status = 'published';
$$;

INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Ingeniería de Software',    'ingenieria-de-software',    'Desarrollo de software, arquitectura y metodologías', '#6366f1', 'code-2'),
  ('Ciencia de Datos','ciencia-de-datos', 'Análisis y visualización de datos', '#f59e0b', 'bar-chart-2'),
  ('Infraestructura',           'infrastructura',           'Servicios, redes y gestión de sistemas', '#3b82f6', 'network'),
  ('Inteligencia Artificial', 'inteligencia-artificial', 'Machine learning, deep learning y aplicaciones de IA', '#8b5cf6', 'brain'),
  ('Seguridad',     'seguridad',      'Ciberseguridad, criptografía y mejores prácticas', '#eab308', 'shield-check'),
  ('Carrera & Oficio', 'carrera-y-oficio', 'Consejos profesionales, desarrollo de carrera y habilidades blandas', '#ec4899', 'briefcase')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('Clean Code', 'clean-code'),
  ('Patrones de Diseño', 'patrones-de-diseno'),
  ('Refactoring', 'refactoring'),
  ('Testing', 'testing'),
  ('Apis', 'apis'),
  ('Rest', 'rest'),
  ('GraphQL', 'graphql'),
  ('Arquitectura', 'arquitectura'),
  ('Microservicios', 'microservicios'),
  ('Sistemas Distribuidos', 'sistemas-distribuidos'),
  ('PostgreSQL', 'postgresql'),
  ('MySQL', 'mysql'),
  ('MongoDB', 'mongodb'),
  ('Redis', 'redis'),
  ('Elasticsearch', 'elasticsearch'),
  ('ORM', 'orm'),
  ('Migraciones', 'migraciones'),
  ('Optimización', 'optimizacion'),
  ('Indexing', 'indexing'),
  ('NoSQL', 'nosql'),
  ('Python', 'python'),
  ('R', 'r'),
  ('Pandas', 'pandas'),
  ('Numpy', 'numpy'),
  ('Estadística', 'estadistica'),
  ('Jupyter', 'jupyter'),
  ('Machine Learning', 'machine-learning'),
  ('Docker', 'docker'),
  ('Kubernetes', 'kubernetes'),
  ('Linux', 'linux'),
  ('Bash', 'bash'),
  ('CI / CD', 'ci-cd'),
  ('AWS', 'aws'),
  ('GCP', 'gcp'),
  ('Azure', 'azure'),
  ('NGNIX', 'ngnix'),
  ('Terraform', 'terraform'),
  ('Deep Learning', 'deep-learning'),
  ('LLMS', 'llms'),
  ('Redes Neuronales', 'redes-neuronales'),
  ('TensorFlow', 'tensorflow'),
  ('Criptografía', 'criptografia'),
  ('JWT', 'jwt'),
  ('Pentesting', 'pentesting'),
  ('Productividad', 'productividad'),
  ('Code Review', 'code-review'),
  ('Trabajo Remoto', 'trabajo-remoto'),
  ('Entrevistas', 'entrevistas'),
  ('Open Source', 'open-source'),
  ('Documentación', 'documentacion')
ON CONFLICT (slug) DO NOTHING;
