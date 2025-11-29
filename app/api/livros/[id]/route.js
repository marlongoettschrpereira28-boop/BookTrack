import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// PUT - Atualizar livro
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();
    
    console.log('Atualizando livro:', id, body);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    const livro = await prisma.livro.update({
      where: { id },
      data: {
        pagina_atual: body.pagina_atual,
        estado: body.estado
      }
    });
    
    return NextResponse.json(livro);
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar livro', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover livro
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    console.log('Deletando livro ID:', id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    await prisma.livro.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar livro', details: error.message },
      { status: 500 }
    );
  }
}