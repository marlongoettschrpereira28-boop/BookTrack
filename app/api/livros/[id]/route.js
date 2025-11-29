import { NextResponse } from 'next/server';

// Importa a mesma referência de memória
let prisma = null;
try {
  const { prisma: prismaClient } = require('@/app/lib/prisma');
  prisma = prismaClient;
} catch (error) {
  console.warn('⚠️ Prisma não disponível em [id]/route');
}

// Referência ao array de memória (hack para desenvolvimento)
const getLivrosMemoria = () => {
  if (global.livrosMemoria === undefined) {
    global.livrosMemoria = [];
  }
  return global.livrosMemoria;
};

// PUT - Atualizar livro
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (prisma) {
      const livro = await prisma.livro.update({
        where: { id },
        data: {
          pagina_atual: body.pagina_atual,
          estado: body.estado
        }
      });
      return NextResponse.json(livro);
    } else {
      // Fallback: atualiza na memória
      const livros = getLivrosMemoria();
      const index = livros.findIndex(l => l.id === id);
      if (index !== -1) {
        livros[index] = { ...livros[index], ...body };
        return NextResponse.json(livros[index]);
      }
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar livro', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remover livro
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (prisma) {
      await prisma.livro.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    } else {
      // Fallback: remove da memória
      const livros = getLivrosMemoria();
      const index = livros.findIndex(l => l.id === id);
      if (index !== -1) {
        livros.splice(index, 1);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar livro', details: error.message },
      { status: 500 }
    );
  }
}