// app_page.jsx
'use client'

import Card from "./componentes/Card";
import Container from "./componentes/Container";
import Grid from "./componentes/Grid";

export default function Home() {
  // exemplo de dados
  const books = [
    { id:1, title:'Livro A', author:'Autor A' },
    { id:2, title:'Livro B', author:'Autor B' },
    { id:3, title:'Livro C', author:'Autor C' },
  ];

  return (
    <Container>
      <h2>Minha Biblioteca</h2>
      <div className="vspace-1" />
      <Grid>
        {books.map(b => (
          <Card key={b.id}>
            <strong>{b.title}</strong>
            <div className="small">{b.author}</div>
          </Card>
        ))}
      </Grid>
    </Container>
  )
}
