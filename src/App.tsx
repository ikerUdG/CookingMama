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
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [maxTime, setMaxTime] = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [allCuisines, setAllCuisines] = useState<string[]>([])
  const [allCourses, setAllCourses] = useState<string[]>([])

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

  // Fetch all available cuisines and courses for filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        // Fetch all recipes without filters to get all available options
        // Using max size (100) to get as many options as possible
        const response = await fetch(`${API_BASE}/search/recipes?size=100`)
        if (response.ok) {
          const data = await response.json()
          const allRecipes = data.hits?.hits?.map((hit: any) => hit._source) || 
                           data.hits?.map((hit: any) => hit._source) || 
                           data.results || []
          
          const cuisines = Array.from(new Set(allRecipes.map((r: Recipe) => r.cuisine).filter(Boolean)))
          const courses = Array.from(new Set(allRecipes.map((r: Recipe) => r.course).filter(Boolean)))
          
          console.log('📊 Available filter options:', {
            cuisines: cuisines.sort(),
            courses: courses.sort(),
            totalRecipes: allRecipes.length,
            sampleCuisines: allRecipes.slice(0, 5).map(r => ({ title: r.title, cuisine: r.cuisine, course: r.course }))
          })
          
          setAllCuisines(cuisines.sort() as string[])
          setAllCourses(courses.sort() as string[])
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    fetchFilterOptions()
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

        if (selectedCuisines.length > 0) {
          // Según la documentación, cuisine es String (no String/Array)
          // Solo enviamos el primer valor seleccionado
          params.append('cuisine', selectedCuisines[0])
        }

        if (selectedCourses.length > 0) {
          // Según la documentación, course es String (no String/Array)
          // Solo enviamos el primer valor seleccionado
          params.append('course', selectedCourses[0])
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

        // Debug: Log the URL being requested
        console.log('🔍 Fetching recipes from:', url)
        console.log('📋 Selected filters:', {
          cuisines: selectedCuisines,
          courses: selectedCourses,
          ingredients: selectedIngredients.length,
          difficulty: selectedDifficulty,
          maxTime
        })
        console.log('🔗 URL Params breakdown:', {
          cuisineParam: selectedCuisines.length > 0 ? selectedCuisines[0] : 'none',
          courseParam: selectedCourses.length > 0 ? selectedCourses[0] : 'none',
          fullParams: params.toString()
        })

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Debug: Log the response structure
        console.log('📥 API Response:', {
          hasHits: !!data.hits,
          hitsStructure: data.hits?.hits ? 'hits.hits' : data.hits ? 'hits' : 'results',
          total: data.hits?.total?.value || data.total || data.results?.length || 0,
          firstRecipe: data.hits?.hits?.[0]?._source || data.hits?.[0]?._source || data.results?.[0] || null
        })

        // Elasticsearch returns { total, max_score, hits: [...] }
        // Each hit has { _id, _source: { recipe data } }
        const recipes = data.hits?.hits?.map((hit: any) => ({
          _id: hit._id,
          ...hit._source
        })) || data.hits?.map((hit: any) => ({
          _id: hit._id,
          ...hit._source
        })) || data.results || []

        console.log('✅ Processed recipes:', recipes.length)
        if (selectedCuisines.length > 0) {
          console.log('🍳 Cuisine filter check:', {
            selected: selectedCuisines[0],
            recipesFound: recipes.length,
            cuisinesInResults: [...new Set(recipes.map(r => r.cuisine).filter(Boolean))],
            allRecipesHaveCuisine: recipes.every(r => r.cuisine),
            sampleRecipes: recipes.slice(0, 3).map(r => ({ title: r.title, cuisine: r.cuisine }))
          })
        }
        if (selectedCourses.length > 0) {
          console.log('🍽️ Course filter check:', {
            selected: selectedCourses[0],
            recipesFound: recipes.length,
            coursesInResults: [...new Set(recipes.map(r => r.course).filter(Boolean))],
            allRecipesHaveCourse: recipes.every(r => r.course),
            sampleRecipes: recipes.slice(0, 3).map(r => ({ title: r.title, course: r.course }))
          })
        }

        setRecipes(recipes)
      } catch (error) {
        console.error('Error fetching recipes:', error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [selectedIngredients, selectedDifficulty, selectedCuisines, selectedCourses, query, ingredients, maxTime])

  // Calculate filter options with counts
  const ingredientOptions = ingredients
    .map(ingredient => ({
      id: ingredient._id,
      label: ingredient.name,
      count: recipes.filter(r =>
        r.ingredients.some(ing => ing.ingredientId === ingredient._id)
      ).length
    }))

  // Calculate cuisine options from all available cuisines
  const cuisineOptions = allCuisines.map(cuisine => ({
    id: cuisine,
    label: cuisine,
    count: recipes.filter(r => r.cuisine === cuisine).length
  }))

  // Calculate course options from all available courses
  const courseOptions = allCourses.map(course => ({
    id: course,
    label: course,
    count: recipes.filter(r => r.course === course).length
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

  const toggleCuisine = (id: string) => {
    setSelectedCuisines(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const clearIngredients = () => setSelectedIngredients([])
  const clearDifficulty = () => setSelectedDifficulty([])
  const clearCuisines = () => setSelectedCuisines([])
  const clearCourses = () => setSelectedCourses([])
  const removeAll = () => {
    setSelectedIngredients([])
    setSelectedDifficulty([])
    setSelectedCuisines([])
    setSelectedCourses([])
    setMaxTime(null)
  }

  return (
    <Layout>
      <Header query={query} onChange={setQuery} />

      <div className="app-container">
        <FilterSidebar
          ingredients={ingredientOptions}
          cuisines={cuisineOptions}
          courses={courseOptions}
          selectedIngredients={selectedIngredients}
          selectedDifficulty={selectedDifficulty}
          selectedCuisines={selectedCuisines}
          selectedCourses={selectedCourses}
          maxTime={maxTime}
          onToggleIngredient={toggleIngredient}
          onToggleDifficulty={toggleDifficulty}
          onToggleCuisine={toggleCuisine}
          onToggleCourse={toggleCourse}
          onSetMaxTime={setMaxTime}
          onClearIngredients={clearIngredients}
          onClearDifficulty={clearDifficulty}
          onClearCuisines={clearCuisines}
          onClearCourses={clearCourses}
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
