import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

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
    const category = formData.get('category') as string;
    const prompt = formData.get('prompt') as string;

    if (!imageFile) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 });
    }

    // 3. Melhorar Prompt com Gemini
    let finalPrompt = prompt || 'A beautiful high quality photo, cinematic lighting, 8k resolution';
    if (process.env.GOOGLE_GEMINI_API_KEY && prompt) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const aiPrompt = `You are an expert AI image generation prompt engineer.
        The user wants an image with this description: "${prompt}".
        The image category is: "${category}".
        Rewrite this description into a highly detailed, professional prompt in English for Stable Diffusion or Photoroom.
        Include keywords for perfect lighting, photorealistic quality, camera angle, and atmosphere.
        Return ONLY the new prompt, nothing else. No markdown, no explanations.`;

        const result = await model.generateContent(aiPrompt);
        const enhancedPrompt = result.response.text().trim();
        if (enhancedPrompt) finalPrompt = enhancedPrompt;
      } catch (err) {
        console.error('Erro Gemini:', err);
      }
    }

    // 4. Geração de Imagem (Baldeação)
    let imageUrl = '';
    let bufferToUpload: Buffer;

    if (category === 'produtos' || category === 'gastronomia') {
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
      const falKey = process.env.FAL_KEY;
      if (!falKey) throw new Error('Fal.ai API Key não configurada.');

      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      const base64DataUri = `data:${imageFile.type || 'image/jpeg'};base64,${fileBuffer.toString('base64')}`;

      const falResponse = await fetch('https://fal.run/fal-ai/flux-dev/image-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: base64DataUri,
          prompt: finalPrompt,
          strength: 0.85
        })
      });

      if (!falResponse.ok) throw new Error('Erro ao gerar na Fal.ai.');
      const falData = await falResponse.json();
      
      if (falData.images && falData.images.length > 0) {
        // Baixa a imagem da URL retornada pela Fal para salvar no Supabase
        const imgFetch = await fetch(falData.images[0].url);
        const imgBuffer = await imgFetch.arrayBuffer();
        bufferToUpload = Buffer.from(imgBuffer);
      } else {
        throw new Error('Fal.ai não retornou imagens.');
      }
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
        category: category,
        prompt: finalPrompt
      });

    return NextResponse.json({ success: true, imageUrl, finalPrompt });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
