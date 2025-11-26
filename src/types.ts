export type Recipe = {
  _id: string
  title: string
  slug: string
  description: string
  cuisine?: string
  course?: string
  difficulty: 'easy' | 'medium' | 'hard'
  servings: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  totalTimeMinutes: number
  tags: string[]
  ingredients: Array<{
    ingredientId: string
    name: string
    quantity?: number
    unit?: string
    optional: boolean
    notes?: string
  }>
  instructions: string[]
  tips?: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
  imageUrl?: string
  source?: string
  createdAt?: string
  updatedAt?: string
}

export type Ingredient = {
  _id: string
  name: string
  category: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

