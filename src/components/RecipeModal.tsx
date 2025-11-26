import type { Recipe } from '../types'

type Props = {
  recipe: Recipe
  onClose: () => void
}

export function RecipeModal({ recipe, onClose }: Props) {
  const difficultyMap = {
    easy: 'Fácil',
    medium: 'Media',
    hard: 'Difícil'
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="recipe-dialog-title" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 id="recipe-dialog-title" className="modal-title">{recipe.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        <div className="modal-meta">
          {typeof recipe.prepTimeMinutes === 'number' && <span>Prep: {recipe.prepTimeMinutes} min</span>}
          {typeof recipe.cookTimeMinutes === 'number' && <span>•</span>}
          {typeof recipe.cookTimeMinutes === 'number' && <span>Cocción: {recipe.cookTimeMinutes} min</span>}
          <span className="dot">•</span>
          <span>Tiempo total: {recipe.totalTimeMinutes} min</span>
          <span className="dot">•</span>
          <span>{difficultyMap[recipe.difficulty]}</span>
          <span className="dot">•</span>
          <span>Raciones: {recipe.servings}</span>
        </div>
        {recipe.imageUrl && (
          <div className="modal-hero" aria-hidden="true">
            <img src={recipe.imageUrl} alt={recipe.title} />
          </div>
        )}
        <div className="modal-content">
          <section className="section">
            <h3>Descripción</h3>
            <p className="modal-description">{recipe.description}</p>
          </section>
          <div className="details-grid">
            <section className="ingredients section">
              <h3>Ingredientes</h3>
              <ul>
                {recipe.ingredients.map((item, idx) => (
                  <li key={idx}>
                    {item.quantity && item.unit ? `${item.quantity} ${item.unit} ` : ''}
                    {item.name}
                    {item.notes ? ` (${item.notes})` : ''}
                  </li>
                ))}
              </ul>
            </section>
            <section className="steps section">
              <h3>Instrucciones</h3>
              {recipe.instructions.length > 0 ? (
                <ol>
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p>No hay instrucciones disponibles.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


