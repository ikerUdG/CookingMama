import type { Ingredient } from '../types'
import { IngredientCard } from './IngredientCard'

type IngredientListProps = {
    ingredients: Ingredient[]
}

export function IngredientList({ ingredients }: IngredientListProps) {
    return (
        <div className="ingredient-list">
            {ingredients.map((ingredient) => (
                <IngredientCard key={ingredient._id} ingredient={ingredient} />
            ))}
        </div>
    )
}
