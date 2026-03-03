-- Script SQL pour configurer le programme d'affiliation dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase.

-- TABLE 1 : Affiliés (utilisateurs qui peuvent recommander la formation)
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id)
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Un utilisateur ne peut voir que sa propre fiche d'affilié
CREATE POLICY "Chaque affilié peut voir sa propre fiche"
  ON affiliates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Un utilisateur peut créer sa fiche d'affilié une seule fois
CREATE POLICY "Un utilisateur peut se déclarer affilié"
  ON affiliates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- TABLE 2 : Codes promo d'affiliation
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (code)
);

ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;

-- Un affilié ne voit que ses propres codes
CREATE POLICY "Chaque affilié voit ses propres codes"
  ON affiliate_codes FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Un affilié peut créer ses propres codes (vous pouvez limiter à 1 code par affilié si besoin)
CREATE POLICY "Chaque affilié peut créer ses codes promo"
  ON affiliate_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );


-- TABLE 3 : Ventes générées par affiliation
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_code_id UUID NOT NULL REFERENCES affiliate_codes(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  amount NUMERIC(10, 2) NOT NULL,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.15,
  commission_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

-- Un affilié voit uniquement ses propres ventes (via ses codes)
CREATE POLICY "Un affilié voit ses ventes"
  ON affiliate_sales FOR SELECT
  TO authenticated
  USING (
    affiliate_code_id IN (
      SELECT ac.id
      FROM affiliate_codes ac
      JOIN affiliates a ON a.id = ac.affiliate_id
      WHERE a.user_id = auth.uid()
    )
  );

-- Les insertions de ventes doivent être réalisées par un service backend
-- Vous pouvez utiliser la clé service role côté serveur pour insérer dans cette table.
-- Pour plus de sécurité, on ne donne pas de droit d'INSERT aux simples utilisateurs authentifiés.

