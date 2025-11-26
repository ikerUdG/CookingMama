import { useState } from 'react'
import { FilterSection } from './FilterSection'

type Props = {
  categories: { id: string; label: string; count: number }[]
  ingredients: { id: string; label: string; count: number }[]
  selectedCategories: string[]
  selectedIngredients: string[]
  selectedDifficulty: string[]
  maxTime: number | null
  onToggleCategory: (id: string) => void
  onToggleIngredient: (id: string) => void
  onToggleDifficulty: (id: string) => void
  onSetMaxTime: (time: number | null) => void
  onClearCategories: () => void
  onClearIngredients: () => void
  onClearDifficulty: () => void
  onRemoveAll: () => void
}

export function FilterSidebar({
  categories,
  ingredients,
  selectedCategories,
  selectedIngredients,
  selectedDifficulty,
  maxTime,
  onToggleCategory,
  onToggleIngredient,
  onToggleDifficulty,
  onSetMaxTime,
  onClearCategories,
  onClearIngredients,
  onClearDifficulty,
  onRemoveAll
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isTimeExpanded, setIsTimeExpanded] = useState(true)

  if (isCollapsed) {
    return (
      <aside className="filter-sidebar collapsed">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(false)}
          title="Expandir filtros"
        >
          <span className="icon">≫</span>
        </button>
      </aside>
    )
  }

  const difficultyOptions = [
    { id: 'easy', label: 'Fácil', count: 0 }, // Count 0 as placeholder since we don't calculate it yet
    { id: 'medium', label: 'Media', count: 0 },
    { id: 'hard', label: 'Difícil', count: 0 }
  ]

  return (
    <aside className="filter-sidebar">
      <div className="sidebar-header">
        <h2 className="filter-sidebar-title">Filtros</h2>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(true)}
          title="Contraer filtros"
        >
          <span className="icon">≪</span>
        </button>
      </div>

      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => setIsTimeExpanded(!isTimeExpanded)}
          aria-expanded={isTimeExpanded}
        >
          <span className="filter-section-icon">{isTimeExpanded ? '▼' : '▶'}</span>
          <span className="filter-section-title">Tiempo de preparación</span>
        </button>

        {isTimeExpanded && (
          <div className="filter-section-content">
            <div className="time-options">
              {[15, 30, 45, 60].map(time => (
                <label key={time} className="radio-option">
                  <input
                    type="radio"
                    name="maxTime"
                    checked={maxTime === time}
                    onChange={() => onSetMaxTime(time)}
                  />
                  <span>Menos de {time} min</span>
                </label>
              ))}
              <label className="radio-option">
                <input
                  type="radio"
                  name="maxTime"
                  checked={maxTime === null}
                  onChange={() => onSetMaxTime(null)}
                />
                <span>Cualquier tiempo</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty filter hidden
      <FilterSection
        title="Dificultad"
        options={difficultyOptions}
        selected={selectedDifficulty}
        onToggle={onToggleDifficulty}
        onClear={onClearDifficulty}
      />
      */}

      <FilterSection
        title="Categorías"
        options={categories}
        selected={selectedCategories}
        onToggle={onToggleCategory}
        onClear={onClearCategories}
      />

      <FilterSection
        title="Ingredientes"
        options={ingredients}
        selected={selectedIngredients}
        onToggle={onToggleIngredient}
        onClear={onClearIngredients}
      />

      <button className="filter-remove-all-btn" onClick={onRemoveAll}>
        Borrar todos los filtros
      </button>
    </aside >
  )
}
