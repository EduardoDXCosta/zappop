import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar em public/uploads local do PC durante o desenvolvimento
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignora erro se diretório já existe
    }

    // Gerar nome único para evitar conflito
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Retorna a URL relativa pro browser consumir
    return NextResponse.json({ url: `/uploads/${fileName}` });

  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return NextResponse.json({ error: 'Falha no upload.' }, { status: 500 });
  }
}
