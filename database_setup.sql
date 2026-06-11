-- 1. Cria a tabela de Perfis (Profiles) para armazenar os créditos
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  credits INTEGER DEFAULT 50 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cria a tabela de Imagens (Histórico de Ensaios)
CREATE TABLE public.images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  generated_url TEXT NOT NULL,
  category TEXT NOT NULL,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilita o RLS (Row Level Security) para segurança
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles: o usuário só vê e atualiza o próprio perfil
CREATE POLICY "Usuários podem ver o próprio perfil" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Images: o usuário só vê e insere as próprias imagens
CREATE POLICY "Usuários podem ver próprias imagens" 
  ON public.images FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprias imagens" 
  ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Trigger automático: Toda vez que um usuário logar/cadastrar, ele ganha uma linha no Profile com 50 créditos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (new.id, 50);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Criação do Storage (Bucket) para salvar as fotos geradas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ensaio-images', 'ensaio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: Qualquer um pode ver imagens, mas apenas usuários autenticados podem fazer upload
CREATE POLICY "Qualquer pessoa pode visualizar imagens"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'ensaio-images' );

CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'ensaio-images' AND auth.role() = 'authenticated' );
