type Props = {
  query: string
  onChange: (value: string) => void
}

export function Header({ query, onChange }: Props) {
  return (
    <header className="header">
      <div className="header-top">
        <img src="/logo.jpg" alt="Cooking Mama" className="logo" />
        <h1 className="brand-title">Cooking Mama</h1>
      </div>
      <div className="search-container">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar recetas deliciosas..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Buscar recetas"
        />
      </div>
    </header>
  )
}
