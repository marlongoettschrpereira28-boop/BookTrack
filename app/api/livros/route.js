import { NextResponse } from 'next/server';


// Tenta importar Prisma, mas continua se falhar
let prisma = null;
try {
  const { prisma: prismaClient } = require('@/app/lib/prisma');
  prisma = prismaClient;
  console.log('Prisma conectado com sucesso');
} catch (error) {
  console.warn('Prisma não disponível, usando armazenamento em memória');
  console.error('Erro do Prisma:', error.message);
}

// GET - Listar todos os livros
export async function GET() {
  try {
    if (prisma) {
      const livros = await prisma.livro.findMany({
        orderBy: {
          data_adicao: 'desc'
        }
      });
      return NextResponse.json(livros);
    } else {
      // Fallback: retorna livros da memória
      return NextResponse.json(livrosMemoria);
    }
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar livros', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo livro
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (prisma) {
      const livro = await prisma.livro.create({
        data: {
          titulo: body.titulo,
          autor: body.autor,
          isbn: body.isbn,
          paginas: body.paginas,
          genero: body.genero,
          capa_url: body.capa_url,
          descricao: body.descricao,
          pagina_atual: body.pagina_atual || 0,
          estado: body.estado || 'lendo'
        }
      });
      return NextResponse.json(livro, { status: 201 });
    } else {
      // Fallback: adiciona na memória
      const novoLivro = {
        id: nextId++,
        ...body,
        pagina_atual: body.pagina_atual || 0,
        estado: body.estado || 'lendo',
        data_adicao: new Date().toISOString()
      };
      livrosMemoria.push(novoLivro);
      return NextResponse.json(novoLivro, { status: 201 });
    }
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar livro', details: error.message },
      { status: 500 }
    );
  }
}