import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Verificação de Autenticação
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autorizado. Faça login primeiro.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    // 2. Verificação de Créditos
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: 'Créditos insuficientes. Recarregue sua conta.' }, { status: 403 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File | null;
    const niche = formData.get('niche') as string;
    const prompt = formData.get('prompt') as string;

    if (!imageFile) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 });
    }

    // 3. Melhorar Prompt com Gemini usando Persona por Nicho
    let finalPrompt = prompt || 'A beautiful high quality photo, cinematic lighting, 8k resolution';
    if (process.env.GOOGLE_GEMINI_API_KEY && prompt) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        let persona = "You are an expert AI image generation prompt engineer.";
        if (niche === 'restaurantes') {
          persona = "You are an elite food photographer and food styling AI expert. Your goal is to create appetizing, photorealistic food prompts.";
        } else if (niche === 'criancas') {
          persona = "You are a specialized children's fantasy photographer AI expert. Your goal is to create magical, cute, and cinematic baby photoshoot prompts.";
        } else if (niche === 'adultos') {
          persona = "You are an expert professional portrait and fashion photographer AI. Your goal is to create high-end, realistic, and stylish portrait prompts.";
        }

        const aiPrompt = `${persona}
        The user wants to transform an image with this description: "${prompt}".
        Rewrite this description into a highly detailed, professional prompt in English for an Image-to-Image model (Stable Diffusion / Flux / Photoroom).
        Include keywords for perfect lighting, photorealistic quality, camera angle, and atmosphere.
        Return ONLY the new prompt, nothing else. No markdown, no explanations.`;

        const result = await model.generateContent(aiPrompt);
        const enhancedPrompt = result.response.text().trim();
        if (enhancedPrompt) finalPrompt = enhancedPrompt;
      } catch (err) {
        console.error('Erro Gemini:', err);
      }
    }

    // 4. Geração de Imagem (Baldeação por Nicho)
    let imageUrl = '';
    let bufferToUpload: Buffer;

    if (niche === 'restaurantes') {
      const photoroomKey = process.env.PHOTOROOM_API_KEY;
      if (!photoroomKey) throw new Error('Photoroom API Key não configurada.');

      const prFormData = new FormData();
      prFormData.append('imageFile', imageFile);
      prFormData.append('background.prompt', finalPrompt);

      const prResponse = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers: { 'x-api-key': photoroomKey },
        body: prFormData,
      });

      if (!prResponse.ok) throw new Error('Erro ao gerar na Photoroom.');

      const imageBlob = await prResponse.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      bufferToUpload = Buffer.from(arrayBuffer);

    } else {
      // Integração com Replicate (Flux)
      const replicateToken = process.env.REPLICATE_API_TOKEN;
      if (!replicateToken) throw new Error('Replicate API Token não configurada.');

      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      const base64DataUri = `data:${imageFile.type || 'image/jpeg'};base64,${fileBuffer.toString('base64')}`;

      const replicate = new Replicate({
        auth: replicateToken,
      });

      const output = await replicate.run(
        "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3",
        {
          input: {
            image: base64DataUri,
            prompt: finalPrompt,
            prompt_strength: 0.85
          }
        }
      );

      // output is usually an array of URLs
      const resultUrl = Array.isArray(output) ? output[0] : output;

      if (!resultUrl) {
        throw new Error('Replicate não retornou imagens.');
      }

      // Baixa a imagem da URL retornada pela Replicate para salvar no Supabase
      const imgFetch = await fetch(resultUrl);
      const imgBuffer = await imgFetch.arrayBuffer();
      bufferToUpload = Buffer.from(imgBuffer);
    }

    // 5. Salvar Imagem no Supabase Storage
    const fileName = `${user.id}/${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('ensaio-images')
      .upload(fileName, bufferToUpload, { contentType: 'image/png' });

    if (uploadError) {
      console.error('Erro no upload Storage:', uploadError);
      throw new Error('Erro ao salvar a imagem no servidor.');
    }

    // Pega a URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage.from('ensaio-images').getPublicUrl(fileName);
    imageUrl = publicUrl;

    // 6. Descontar Crédito e Registrar no Histórico
    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    await supabaseAdmin
      .from('images')
      .insert({
        user_id: user.id,
        original_url: 'uploaded_by_user', // Em produção poderíamos salvar a original também no storage
        generated_url: imageUrl,
        category: niche,
        prompt: finalPrompt
      });

    return NextResponse.json({ success: true, imageUrl, finalPrompt });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
