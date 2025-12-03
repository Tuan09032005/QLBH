-- Create orders table in Supabase
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (unauthenticated)
CREATE POLICY IF NOT EXISTS "Allow insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own orders
CREATE POLICY IF NOT EXISTS "Allow read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow updates to own orders
CREATE POLICY IF NOT EXISTS "Allow update own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
