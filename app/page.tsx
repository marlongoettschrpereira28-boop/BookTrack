'use client'
import { useState, useEffect } from 'react';

// Componentes
function Container({ children }) {
  return <div className="max-w-6xl mx-auto p-6">{children}</div>;
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Adicionar Livro</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar livros do banco
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/livros');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        throw new Error('Resposta da API não é JSON');
      }
      
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      alert('Erro ao carregar livros. Verifique se a API está funcionando.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const addBook = async (bookData) => {
    try {
      const volumeInfo = bookData.volumeInfo;
      
      const newBook = {
        titulo: volumeInfo.title,
        autor: volumeInfo.authors?.join(', ') || 'Autor desconhecido',
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || null,
        paginas: volumeInfo.pageCount || null,
        genero: volumeInfo.categories?.[0] || null,
        capa_url: volumeInfo.imageLinks?.thumbnail || null,
        descricao: volumeInfo.description || null,
        estado: 'lendo',
        pagina_atual: 0
      };
      
      const response = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro ao adicionar livro: ${response.status}`);
      }
      
      await loadBooks();
      setIsModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      alert('Erro ao adicionar livro. Tente novamente.');
    }
  };

  const updateBookStatus = async (id, estado) => {
    try {
      const book = books.find(b => b.id === id);
      
      const response = await fetch(`/api/livros/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          pagina_atual: book.pagina_atual
        })
      });
      
      if (response.ok) {
        await loadBooks();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const updateBookPage = async (id, pagina_atual) => {
    try {
      const book = books.find(b => b.id === id);
      
      const response = await fetch(`/api/livros/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina_atual: parseInt(pagina_atual) || 0,
          estado: book.estado
        })
      });
      
      if (response.ok) {
        await loadBooks();
      }
    } catch (error) {
      console.error('Erro ao atualizar página:', error);
    }
  };

  const removeBook = async (id) => {
    if (!confirm('Tem certeza que deseja remover este livro?')) return;
    
    try {
      const response = await fetch(`/api/livros/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadBooks();
      }
    } catch (error) {
      console.error('Erro ao remover livro:', error);
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'lendo': return 'bg-blue-100 text-blue-800';
      case 'lido': return 'bg-green-100 text-green-800';
      case 'abandonado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado) => {
    switch(estado) {
      case 'lendo': return 'Lendo';
      case 'lido': return 'Lido';
      case 'abandonado': return 'Abandonado';
      default: return estado;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando biblioteca...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Minha Biblioteca</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Adicionar Livro
        </button>
      </div>
      
      {books.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Sua biblioteca está vazia</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Adicionar primeiro livro
          </button>
        </div>
      ) : (
        <Grid>
          {books.map(book => (
            <Card key={book.id} className="flex flex-col">
              <div className="flex gap-3 mb-3">
                {book.capa_url && (
                  <img src={book.capa_url} alt={book.titulo} className="w-16 h-24 object-cover rounded" />
                )}
                <div className="flex-1">
                  <strong className="text-lg block mb-1">{book.titulo}</strong>
                  <div className="text-sm text-gray-600 mb-2">{book.autor}</div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(book.estado)}`}>
                    {getStatusLabel(book.estado)}
                  </span>
                </div>
              </div>
              
              <div className="mt-auto space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Página atual: {book.paginas && `(de ${book.paginas})`}
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max={book.paginas || undefined}
                    value={book.pagina_atual}
                    onChange={(e) => updateBookPage(book.id, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Status:</label>
                  <select 
                    value={book.estado}
                    onChange={(e) => updateBookStatus(book.id, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="lendo">Lendo</option>
                    <option value="lido">Lido</option>
                    <option value="abandonado">Abandonado</option>
                  </select>
                </div>

                <button
                  onClick={() => removeBook(book.id)}
                  className="w-full text-red-600 hover:bg-red-50 py-1 rounded text-sm"
                >
                  Remover
                </button>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Buscar livro pelo título, autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
              className="flex-1 border border-gray-300 rounded px-4 py-2"
            />
            <button 
              onClick={searchBooks}
              disabled={isSearching}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map(book => (
              <div key={book.id} className="border rounded p-3 flex gap-3 hover:bg-gray-50">
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img 
                    src={book.volumeInfo.imageLinks.thumbnail} 
                    alt={book.volumeInfo.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <strong className="block mb-1">{book.volumeInfo.title}</strong>
                  <div className="text-sm text-gray-600 mb-2">
                    {book.volumeInfo.authors?.join(', ') || 'Autor desconhecido'}
                  </div>
                  {book.volumeInfo.pageCount && (
                    <div className="text-xs text-gray-500 mb-2">
                      {book.volumeInfo.pageCount} páginas
                    </div>
                  )}
                  <button 
                    onClick={() => addBook(book)}
                    className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
            
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-center text-gray-500 py-8">
                Nenhum livro encontrado. Tente outra busca.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </Container>
  );
}