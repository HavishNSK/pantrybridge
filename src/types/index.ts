export type Unit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'can' | 'each' | 'dozen' | 'loaf' | 'bunch'

export type Category =
  | 'grains'
  | 'legumes'
  | 'canned'
  | 'produce'
  | 'fruit'
  | 'dairy'
  | 'protein'
  | 'baking'
  | 'condiments'
  | 'frozen'

/** Base measure every quantity is normalized to for matching. */
export type BaseMeasure = 'g' | 'ml' | 'each'

export interface NutritionPer100 {
  kcal: number
  protein: number
  fiber: number
  carbs: number
  fat: number
}

export interface Ingredient {
  id: string
  name: string
  aliases: string[]
  category: Category
  base: BaseMeasure
  /** grams (or ml) in one 'each'/'can'/'loaf'/... where relevant */
  gramsPer?: Partial<Record<Unit, number>>
  defaultUnit: Unit
  /** USDA FoodData Central (SR Legacy) per 100 g reference values, rounded */
  nutrition: NutritionPer100
  /** estimated cost in USD per 100 g/ml, or per each when base = 'each' */
  pricePerBase: number
  /** typical shelf life after purchase, days */
  shelfDays: number
  vegetable?: boolean
  fruit?: boolean
  /** pantry basics assumed on hand (salt, water, oil) */
  staple?: boolean
  /** SNAP covers food for home preparation; all ingredients here are food */
  snapEligible: boolean
}

export interface PantryItem {
  uid: string
  ingredientId: string
  quantity: number
  unit: Unit
  addedAt: string
  /** ISO date; optional because shelf-stable items may not have one */
  expiresAt?: string
  demo?: boolean
}

export type Equipment = 'pot' | 'skillet' | 'oven' | 'sheet-pan' | 'microwave' | 'blender' | 'none'

export interface RecipeIngredient {
  ingredientId: string
  quantity: number
  unit: Unit
  optional?: boolean
  note?: string
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface Recipe {
  id: string
  name: string
  blurb: string
  minutes: number
  servings: number
  meal: MealSlot[]
  equipment: Equipment[]
  ingredients: RecipeIngredient[]
  steps: string[]
  /** illustration palette + motif */
  art: { motif: 'bowl' | 'skillet' | 'plate' | 'mug' | 'tray'; colors: [string, string, string] }
  tags: string[]
}

export interface Substitution {
  from: string
  to: string[]
  note: string
}

export interface PlanEntry {
  recipeId: string
  servings: number
  /** eaten from a previous meal's extra servings, so it uses no new ingredients */
  leftover?: boolean
}

export interface ListItem {
  id: string
  name: string
  /** SNAP covers food for home preparation, not household supplies */
  food: boolean
  done: boolean
}

export interface Budget {
  amount: number
  start: string
  end: string
  source: 'groceries' | 'benefits' | 'mixed'
}

/** day index 0 (Mon) – 6 (Sun) */
export type WeekPlan = Record<number, Partial<Record<MealSlot, PlanEntry>>>

export type ResourceType = 'food-bank' | 'pantry-finder' | 'snap' | 'wic' | 'kids' | 'hotline' | 'meals' | 'seniors'

export interface Resource {
  id: string
  name: string
  type: ResourceType
  description: string
  url: string
  phone?: string
  /** county names served; empty = statewide */
  counties: string[]
  source: string
  lastVerified: string
  official: boolean
}
