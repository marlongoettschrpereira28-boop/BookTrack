'use client'
import { useState, useEffect } from 'react';

//TIPOS
interface Book {
  id: number;
  titulo: string;
  autor: string;
  isbn?: string | null;
  paginas?: number | null;
  genero?: string | null;
  capa_url?: string | null;
  descricao?: string | null;
  estado: 'pretendo_ler' | 'lendo' | 'lido' | 'abandonado';
  pagina_atual: number;
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers?: Array<{ identifier: string }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { thumbnail: string };
    description?: string;
  };
}

//COMPONENTES
interface ContainerProps {
  children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
}

function Grid({ children }: GridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    }}>
      {children}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s'
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
      className={className}>
      {children}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '672px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Adicionar Livro</h3>
          <button onClick={onClose} style={{
            color: '#6b7280',
            fontSize: '32px',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}>×</button>
        </div>
        <div style={{ padding: '16px' }}>{children}</div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeColor: string;
}

function FilterButton({ active, onClick, children, activeColor }: FilterButtonProps) {
  const baseStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: active ? activeColor : '#e5e7eb',
    color: active ? 'white' : '#374151'
  };

  return (
    <button onClick={onClick} style={baseStyle}>
      {children}
    </button>
  );
}

//CONSTANTES
const STATUS_CONFIG = {
  pretendo_ler: {
    label: 'Pretendo Ler',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    activeColor: '#eab308'
  },
  lendo: {
    label: 'Lendo',
    bgColor: '#1e40af',
    textColor: 'white',
    activeColor: '#2563eb'
  },
  lido: {
    label: 'Lido',
    bgColor: '#22c55e',
    textColor: 'black',
    activeColor: '#16a34a'
  },
  abandonado: {
    label: 'Abandonado',
    bgColor: '#ef4444',
    textColor: 'white',
    activeColor: '#dc2626'
  }
};

//COMPONENTE PRINCIPAL
export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  useEffect(() => { loadBooks(); }, []);

  //APIs
  const loadBooks = async () => {
    try {
      const response = await fetch('/api/livros');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
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
    } finally {
      setIsSearching(false);
    }
  };

  const addBook = async (bookData: GoogleBook) => {
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
        estado: 'pretendo_ler',
        pagina_atual: 0
      };

      const response = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });

      if (!response.ok) throw new Error(`Erro ao adicionar livro: ${response.status}`);

      await loadBooks();
      setIsModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Erro ao adicionar livro:', error);
      alert('Erro ao adicionar livro. Tente novamente.');
    }
  };

  const updateBook = async (id: number, updates: Partial<Book>) => {
    try {
      const book = books.find(b => b.id === id);
      const response = await fetch(`/api/livros/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...book, ...updates })
      });

      if (response.ok) await loadBooks();
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
    }
  };

  const removeBook = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este livro?')) return;

    try {
      const response = await fetch(`/api/livros/${id}`, { method: 'DELETE' });
      if (response.ok) await loadBooks();
    } catch (error) {
      console.error('Erro ao remover livro:', error);
    }
  };

  //HELPER
  const getCategories = () => {
    const categories = books
      .map(book => book.genero)
      .filter((genero): genero is string => genero !== null && genero !== undefined && genero.trim() !== '');
    return ['todas', ...new Set(categories)];
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'todas' || book.genero === selectedCategory;
    const matchesStatus = selectedStatus === 'todos' || book.estado === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const countByStatus = (status: string) => books.filter(b => b.estado === status).length;
  const countByCategory = (category: string) => books.filter(b => b.genero === category).length;

  //RENDER
  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#6b7280' }}>Carregando biblioteca...</p>
        </div>
      </Container>
    );
  }

  const categories = getCategories();

  return (
    <Container>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold' }}>Minha Biblioteca</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
        >
          + Adicionar Livro
        </button>
      </div>

      {/* Filtros */}
      {books.length > 0 && (
        <>
          {/* Filtro por Categoria */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Filtrar por categoria:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(category => (
                <FilterButton
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  activeColor="#2563eb"
                >
                  {category === 'todas' ? 'Todas' : category}
                  {category !== 'todas' && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.75 }}>
                      ({countByCategory(category)})
                    </span>
                  )}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Filtro por Status */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Filtrar por status:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <FilterButton
                active={selectedStatus === 'todos'}
                onClick={() => setSelectedStatus('todos')}
                activeColor="#9333ea"
              >
                Todos
              </FilterButton>

              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <FilterButton
                  key={status}
                  active={selectedStatus === status}
                  onClick={() => setSelectedStatus(status)}
                  activeColor={config.activeColor}
                >
                  {config.label}
                  <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.75 }}>
                    ({countByStatus(status)})
                  </span>
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Contador */}
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
            Mostrando {filteredBooks.length} de {books.length} livros
          </div>
        </>
      )}

      {/* Lista de Livros */}
      {books.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          border: '2px dashed #d1d5db',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Sua biblioteca está vazia</p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Adicionar primeiro livro
          </button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          border: '2px dashed #d1d5db',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Nenhum livro encontrado com estes filtros</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {selectedCategory !== 'todas' && (
              <button
                onClick={() => setSelectedCategory('todas')}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Limpar filtro de categoria
              </button>
            )}
            {selectedStatus !== 'todos' && (
              <button
                onClick={() => setSelectedStatus('todos')}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Limpar filtro de status
              </button>
            )}
          </div>
        </div>
      ) : (
        <Grid>
          {filteredBooks.map(book => (
            <Card key={book.id}>
              {/* Info do Livro */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                {book.capa_url && (
                  <img
                    src={book.capa_url}
                    alt={book.titulo}
                    style={{
                      width: '64px',
                      height: '96px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>
                    {book.titulo}
                  </strong>
                  <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
                    {book.autor}
                  </div>
                  {book.genero && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      📚 {book.genero}
                    </div>
                  )}
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: STATUS_CONFIG[book.estado]?.bgColor || '#f3f4f6',
                    color: STATUS_CONFIG[book.estado]?.textColor || '#1f2937'
                  }}>
                    {STATUS_CONFIG[book.estado]?.label || book.estado}
                  </span>
                </div>
              </div>

              {/* Controles */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Página atual: {book.paginas && `(de ${book.paginas})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={book.paginas || undefined}
                    value={book.pagina_atual}
                    onChange={(e) => updateBook(book.id, { pagina_atual: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Status:
                  </label>
                  <select
                    value={book.estado}
                    onChange={(e) => updateBook(book.id, { estado: e.target.value as 'pretendo_ler' | 'lendo' | 'lido' | 'abandonado' })}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <option key={status} value={status}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => removeBook(book.id)}
                  style={{
                    width: '100%',
                    color: '#dc2626',
                    background: 'white',
                    border: 'none',
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}
                >
                  Remover
                </button>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      {/* Modal de Busca */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Buscar livro pelo título, autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
              style={{
                flex: 1,
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px 16px'
              }}
            />
            <button
              onClick={searchBooks}
              disabled={isSearching}
              style={{
                backgroundColor: isSearching ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '4px',
                border: 'none',
                cursor: isSearching ? 'not-allowed' : 'pointer'
              }}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
            {searchResults.map(book => (
              <div
                key={book.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '12px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    style={{
                      width: '64px',
                      height: '96px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {book.volumeInfo.title}
                  </strong>
                  <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
                    {book.volumeInfo.authors?.join(', ') || 'Autor desconhecido'}
                  </div>
                  {book.volumeInfo.categories && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      📚 {book.volumeInfo.categories[0]}
                    </div>
                  )}
                  {book.volumeInfo.pageCount && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {book.volumeInfo.pageCount} páginas
                    </div>
                  )}
                  <button
                    onClick={() => addBook(book)}
                    style={{
                      backgroundColor: '#16a34a',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                Nenhum livro encontrado. Tente outra busca.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </Container>
  );
}