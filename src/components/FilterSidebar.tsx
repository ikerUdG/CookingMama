import { useState } from 'react'
import { FilterSection } from './FilterSection'

type Props = {
  ingredients: { id: string; label: string; count: number }[]
  cuisines: { id: string; label: string; count: number }[]
  courses: { id: string; label: string; count: number }[]
  selectedIngredients: string[]
  selectedDifficulty: string[]
  selectedCuisines: string[]
  selectedCourses: string[]
  maxTime: number | null
  onToggleIngredient: (id: string) => void
  onToggleDifficulty: (id: string) => void
  onToggleCuisine: (id: string) => void
  onToggleCourse: (id: string) => void
  onSetMaxTime: (time: number | null) => void
  onClearIngredients: () => void
  onClearDifficulty: () => void
  onClearCuisines: () => void
  onClearCourses: () => void
  onRemoveAll: () => void
}

export function FilterSidebar({
  ingredients,
  cuisines,
  courses,
  selectedIngredients,
  selectedDifficulty,
  selectedCuisines,
  selectedCourses,
  maxTime,
  onToggleIngredient,
  onToggleDifficulty,
  onToggleCuisine,
  onToggleCourse,
  onSetMaxTime,
  onClearIngredients,
  onClearDifficulty,
  onClearCuisines,
  onClearCourses,
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

      <FilterSection
        title="Cocina"
        options={cuisines}
        selected={selectedCuisines}
        onToggle={onToggleCuisine}
        onClear={onClearCuisines}
      />

      <FilterSection
        title="Curso"
        options={courses}
        selected={selectedCourses}
        onToggle={onToggleCourse}
        onClear={onClearCourses}
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
