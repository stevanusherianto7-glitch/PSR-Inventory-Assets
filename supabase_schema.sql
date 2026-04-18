-- ============================================================
-- PSR Inventory Assets — Supabase Schema
-- Project: pbitlwrgainrcippjuwd
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── 1. TABEL ITEMS (Inventory Aset Kitchen & Mini Bar) ─────
CREATE TABLE IF NOT EXISTS items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL CHECK (category IN ('Kitchen', 'Mini Bar')),
  quantity   INTEGER NOT NULL DEFAULT 0,
  price      NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. TABEL TRANSACTIONS (Riwayat Penjualan POS) ─────────
CREATE TABLE IF NOT EXISTS transactions (
  id              TEXT PRIMARY KEY,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  items           JSONB NOT NULL DEFAULT '[]',
  total           NUMERIC NOT NULL DEFAULT 0,
  "paymentMethod" TEXT NOT NULL CHECK ("paymentMethod" IN ('Tunai', 'QRIS')),
  "cashReceived"  NUMERIC,
  change          NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. TABEL EXPENSES (Pengeluaran Harian) ────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  amount     NUMERIC NOT NULL DEFAULT 0,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. ROW LEVEL SECURITY (RLS) ───────────────────────────
-- Aktifkan RLS tapi izinkan semua operasi via anon key
-- (karena aplikasi ini tidak pakai authentication)

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi untuk anon (tanpa login)
CREATE POLICY "Allow all for anon" ON items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

-- ─── 5. SEED DATA — Item Awal Kitchen ──────────────────────
INSERT INTO items (name, category, quantity, price) VALUES
  ('WAJAN / WOOK 45 CM',                          'Kitchen', 2,  50000),
  ('WAJAN / WOOK 30 CM',                          'Kitchen', 2,  50000),
  ('PAN KECIL & SEDANG',                           'Kitchen', 4,  50000),
  ('PANCI STAINLES 16QT',                          'Kitchen', 3,  50000),
  ('PANCI STAINLES 18QT',                          'Kitchen', 1,  50000),
  ('PANCI STAINLES 20QT',                          'Kitchen', 1,  50000),
  ('SPATULA',                                       'Kitchen', 4,  20000),
  ('SODET',                                         'Kitchen', 2,  20000),
  ('SARINGAN MINYAK',                               'Kitchen', 1,  30000),
  ('PISAU DAPUR, GUNTING',                          'Kitchen', 1, 100000),
  ('BLENDER PHILIPS',                               'Kitchen', 1, 500000),
  ('CENTONG SAYUR',                                 'Kitchen', 2,  15000),
  ('SARINGAN STAINLES',                             'Kitchen', 1,  30000),
  ('STOPLES PLASTIK BUMBU',                         'Kitchen', 10, 10000),
  ('WADAH SENDOK GARPU',                            'Kitchen', 1,  20000),
  ('ANEKA UKURAN STOPLES PLASTIK SEGALA UKURAN',    'Kitchen', 10, 10000),
  ('KIPAS ANGIN TINGGI',                            'Kitchen', 1, 300000),
  ('KIPAS ANGIN PENDEK',                            'Kitchen', 1, 200000),
  ('TAKARAN AIR',                                   'Kitchen', 2,  10000),
  ('WADAH KECAP',                                   'Kitchen', 2,  10000),
  ('PLASTIK WRAP',                                  'Kitchen', 1,  25000),
  ('KOMPOR HIGH PRESSURE',                          'Kitchen', 1, 1600000),
  ('KOMPOR MATA SERIBU',                            'Kitchen', 1, 700000);
