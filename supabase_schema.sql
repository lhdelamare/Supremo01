-- SQL Schema for SGCARSP (Supabase) - snake_case version

-- 1. Profiles (User Profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'consulta' CHECK (role IN ('admin', 'secretario', 'financeiro', 'consulta')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Capitulos
CREATE TABLE capitulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  numero INTEGER NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  data_fundacao DATE NOT NULL,
  responsavel TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Irmaos
CREATE TABLE irmaos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  potencia TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  capitulo_id UUID REFERENCES capitulos(id) ON DELETE SET NULL,
  cargo TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  foto_url TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso', 'falecido')),
  numero_registro TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Financeiro
CREATE TABLE financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_entidade TEXT NOT NULL CHECK (tipo_entidade IN ('irmao', 'capitulo', 'lote_irmaos')),
  entidade_id TEXT NOT NULL, -- UUID as string to handle 'all' or specific IDs
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  data_lancamento DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor DECIMAL(12,2) NOT NULL,
  tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('debito', 'credito')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'lancado')),
  observacoes TEXT,
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Produtos
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  estoque INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Vendas
CREATE TABLE vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_cliente TEXT NOT NULL CHECK (tipo_cliente IN ('irmao', 'capitulo')),
  cliente_id UUID NOT NULL,
  data_venda DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  desconto DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  status TEXT DEFAULT 'concluida' CHECK (status IN ('concluida', 'pendente', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Venda Itens
CREATE TABLE venda_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(12,2) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL
);

-- Row Level Security (RLS) - Basic Example
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE capitulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Capitulos are viewable by authenticated users." ON capitulos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can modify capitulos." ON capitulos FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE irmaos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Irmaos are viewable by authenticated users." ON irmaos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can modify irmaos." ON irmaos FOR ALL USING (auth.role() = 'authenticated');

-- (Repeat RLS policies for other tables as needed)
