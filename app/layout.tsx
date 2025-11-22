import './globals.css'

export const metadata = {
  title: 'BookTrack',
  description: 'BookTrack - controle de leitura (MVP)',
}

export default function RootLayout({ children }) {
  return (
     <html lang="en">
      <body>
        <header className="app-header" role="banner">
          <div className="inner">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <h1 style={{margin:0, fontSize:18}}>BookTrack</h1>
              <span className="small">controle de leitura</span>
            </div>
            <nav className="app-nav" role="navigation" aria-label="Menu principal">
              <a href="/">Biblioteca</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/profile">Perfil</a>
            </nav>
          </div>
        </header>

        <main>
          {children}
        </main>

        <footer className="app-footer" role="contentinfo">
          © {new Date().getFullYear()} BookTrack — Dados locais (localStorage)
        </footer>
      </body>
    </html>
  );
}
