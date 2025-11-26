import type { Ingredient } from '../types'

type IngredientCardProps = {
    ingredient: Ingredient
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
    return (
        <article className="ingredient-card">
            <div className="ingredient-card-header">
                <span className="ingredient-category">{ingredient.category}</span>
            </div>
            <div className="ingredient-card-body">
                <h3 className="ingredient-name">{ingredient.name}</h3>
                {ingredient.description && (
                    <p className="ingredient-description">{ingredient.description}</p>
                )}
            </div>
        </article>
    )
}
