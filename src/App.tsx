import { useEffect, useState, useCallback } from 'react'
import './App.css'
import { Header } from './components/Header'
import { RecipeList } from './components/RecipeList'
import { RecipeModal } from './components/RecipeModal'
import { FilterSidebar } from './components/FilterSidebar'
import { Layout } from './components/Layout'
import type { Recipe, Ingredient } from './types'

const API_BASE = 'http://localhost:3000'

function App() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Filter selections
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [maxTime, setMaxTime] = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])

  // Fetch all ingredients
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await fetch(`${API_BASE}/ingredients`)
        const data = await response.json()
        setIngredients(data)
      } catch (error) {
        console.error('Error fetching ingredients:', error)
      }
    }
    fetchIngredients()
  }, [])

  // Fetch recipes based on selected ingredients using Elasticsearch
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true)
        let url = `${API_BASE}/search/recipes`
        const params = new URLSearchParams()

        if (selectedIngredients.length > 0) {
          // Get ingredient names from IDs
          const ingredientNames = selectedIngredients
            .map(id => ingredients.find(i => i._id === id)?.name)
            .filter(Boolean)
          if (ingredientNames.length > 0) {
            params.append('ingredients', ingredientNames.join(','))
          }
        }

        if (selectedDifficulty.length > 0) {
          params.append('difficulty', selectedDifficulty.join(','))
        }

        if (query) {
          params.append('q', query)
        }

        if (maxTime) {
          params.append('maxTime', maxTime.toString())
        }

        // Request more results for better UX
        params.append('size', '50')

        if (params.toString()) {
          url += '?' + params.toString()
        }

        const response = await fetch(url)
        const data = await response.json()

        // Elasticsearch returns { total, max_score, hits: [...] }
        // Each hit has { _id, _source: { recipe data } }
        const recipes = data.hits?.map((hit: any) => ({
          _id: hit._id,
          ...hit._source
        })) || []

        setRecipes(recipes)
      } catch (error) {
        console.error('Error fetching recipes:', error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [selectedIngredients, selectedDifficulty, query, ingredients, maxTime])

  // Calculate filter options with counts
  const categoryOptions = Array.from(new Set(ingredients.map(i => i.category)))
    .map(category => {
      const ingredientsInCategory = ingredients.filter(i => i.category === category)
      return {
        id: category,
        label: category,
        count: ingredientsInCategory.length
      }
    })

  const ingredientOptions = ingredients
    .filter(ingredient => {
      if (selectedCategories.length === 0) return true
      return selectedCategories.includes(ingredient.category)
    })
    .map(ingredient => ({
      id: ingredient._id,
      label: ingredient.name,
      count: recipes.filter(r =>
        r.ingredients.some(ing => ing.ingredientId === ingredient._id)
      ).length
    }))

  const openRecipe = useCallback((recipe: Recipe) => {
    setSelected(recipe)
  }, [])

  const closeRecipe = useCallback(() => {
    setSelected(null)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeRecipe()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleIngredient = (id: string) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleDifficulty = (id: string) => {
    setSelectedDifficulty(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const clearCategories = () => setSelectedCategories([])
  const clearIngredients = () => setSelectedIngredients([])
  const clearDifficulty = () => setSelectedDifficulty([])
  const removeAll = () => {
    setSelectedCategories([])
    setSelectedIngredients([])
    setSelectedDifficulty([])
    setMaxTime(null)
  }

  return (
    <Layout>
      <Header query={query} onChange={setQuery} />

      <div className="app-container">
        <FilterSidebar
          categories={categoryOptions}
          ingredients={ingredientOptions}
          selectedCategories={selectedCategories}
          selectedIngredients={selectedIngredients}
          selectedDifficulty={selectedDifficulty}
          maxTime={maxTime}
          onToggleCategory={toggleCategory}
          onToggleIngredient={toggleIngredient}
          onToggleDifficulty={toggleDifficulty}
          onSetMaxTime={setMaxTime}
          onClearCategories={clearCategories}
          onClearIngredients={clearIngredients}
          onClearDifficulty={clearDifficulty}
          onRemoveAll={removeAll}
        />

        <main className="content" role="main">
          {loading ? (
            <p>Cargando recetas...</p>
          ) : (
            <>
              <p className="results-count">{recipes.length} recetas encontradas</p>
              <RecipeList recipes={recipes} onOpen={openRecipe} />
            </>
          )}
        </main>
      </div>

      <footer className="footer">
        <small>Buscador de recetas con Elasticsearch - búsqueda fuzzy y filtros avanzados.</small>
      </footer>

      {selected && (<RecipeModal recipe={selected} onClose={closeRecipe} />)}
    </Layout>
  )
}

export default App
