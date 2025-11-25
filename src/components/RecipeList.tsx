import type { Recipe } from '../types'
import { RecipeCard } from './RecipeCard'

type Props = {
  recipes: Recipe[]
  onOpen: (recipe: Recipe) => void
}

export function RecipeList({ recipes, onOpen }: Props) {
  return (
    <section className="recipes" aria-label="Listado de recetas">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} onOpen={onOpen} />)
      )}
    </section>
  )
}


