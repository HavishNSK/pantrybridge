import type { Ingredient } from '../types'

/**
 * Canonical ingredient reference.
 *
 * Nutrition: rounded per-100 g (or per-100 ml) reference values based on USDA FoodData Central
 * (SR Legacy / Foundation entries for the raw or as-packaged form). Canned items are
 * per 100 g of can contents.
 *
 * Prices: rough U.S. grocery estimates (2025–2026) per 100 g / 100 ml, or per item for
 * `base: 'each'`. They are planning estimates only; local prices vary.
 */
type Row = Omit<Ingredient, 'snapEligible'> & { snapEligible?: boolean }

const rows: Row[] = [
  // Grains
  { id: 'rice', name: 'White rice', aliases: ['rice', 'long grain rice', 'jasmine rice'], category: 'grains', base: 'g', defaultUnit: 'lb', gramsPer: { cup: 185 }, nutrition: { kcal: 365, protein: 7.1, fiber: 1.3, carbs: 80, fat: 0.7 }, pricePerBase: 0.2, shelfDays: 730 },
  { id: 'brown-rice', name: 'Brown rice', aliases: ['brown rice'], category: 'grains', base: 'g', defaultUnit: 'lb', gramsPer: { cup: 190 }, nutrition: { kcal: 367, protein: 7.5, fiber: 3.4, carbs: 76, fat: 3.2 }, pricePerBase: 0.28, shelfDays: 180 },
  { id: 'oats', name: 'Rolled oats', aliases: ['oats', 'oatmeal', 'old fashioned oats', 'quick oats'], category: 'grains', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 81 }, nutrition: { kcal: 379, protein: 13.2, fiber: 10.1, carbs: 68, fat: 6.5 }, pricePerBase: 0.3, shelfDays: 365 },
  { id: 'pasta', name: 'Pasta', aliases: ['spaghetti', 'penne', 'macaroni', 'noodles', 'elbow macaroni'], category: 'grains', base: 'g', defaultUnit: 'lb', gramsPer: { each: 454, cup: 100 }, nutrition: { kcal: 371, protein: 13, fiber: 3.2, carbs: 75, fat: 1.5 }, pricePerBase: 0.3, shelfDays: 730 },
  { id: 'bread', name: 'Whole wheat bread', aliases: ['bread', 'sandwich bread', 'wheat bread'], category: 'grains', base: 'g', defaultUnit: 'loaf', gramsPer: { loaf: 567, each: 28 }, nutrition: { kcal: 252, protein: 12.5, fiber: 6, carbs: 43, fat: 3.5 }, pricePerBase: 0.55, shelfDays: 7 },
  { id: 'tortillas', name: 'Flour tortillas', aliases: ['tortilla', 'tortillas', 'wraps'], category: 'grains', base: 'g', defaultUnit: 'each', gramsPer: { each: 45 }, nutrition: { kcal: 304, protein: 8, fiber: 3.5, carbs: 50, fat: 8 }, pricePerBase: 0.6, shelfDays: 21 },
  { id: 'flour', name: 'All-purpose flour', aliases: ['flour', 'plain flour'], category: 'baking', base: 'g', defaultUnit: 'lb', gramsPer: { cup: 125, tbsp: 8 }, nutrition: { kcal: 364, protein: 10.3, fiber: 2.7, carbs: 76, fat: 1 }, pricePerBase: 0.12, shelfDays: 365 },
  { id: 'cornmeal', name: 'Cornmeal', aliases: ['corn meal', 'polenta'], category: 'baking', base: 'g', defaultUnit: 'lb', gramsPer: { cup: 157 }, nutrition: { kcal: 370, protein: 7, fiber: 7.3, carbs: 79, fat: 1.8 }, pricePerBase: 0.2, shelfDays: 365 },

  // Legumes & canned protein
  { id: 'black-beans', name: 'Black beans (canned)', aliases: ['black beans', 'canned black beans'], category: 'legumes', base: 'g', defaultUnit: 'can', gramsPer: { can: 425, cup: 172 }, nutrition: { kcal: 91, protein: 6, fiber: 6.9, carbs: 16.6, fat: 0.3 }, pricePerBase: 0.22, shelfDays: 730 },
  { id: 'pinto-beans', name: 'Pinto beans (canned)', aliases: ['pinto beans', 'pintos'], category: 'legumes', base: 'g', defaultUnit: 'can', gramsPer: { can: 425, cup: 171 }, nutrition: { kcal: 86, protein: 5, fiber: 5, carbs: 15, fat: 0.8 }, pricePerBase: 0.21, shelfDays: 730 },
  { id: 'chickpeas', name: 'Chickpeas (canned)', aliases: ['garbanzo beans', 'chickpeas', 'garbanzos'], category: 'legumes', base: 'g', defaultUnit: 'can', gramsPer: { can: 425, cup: 164 }, nutrition: { kcal: 139, protein: 7, fiber: 6, carbs: 22.5, fat: 2.6 }, pricePerBase: 0.25, shelfDays: 730 },
  { id: 'lentils', name: 'Dry lentils', aliases: ['lentils', 'red lentils', 'brown lentils'], category: 'legumes', base: 'g', defaultUnit: 'lb', gramsPer: { cup: 192 }, nutrition: { kcal: 352, protein: 24.6, fiber: 10.7, carbs: 63, fat: 1.1 }, pricePerBase: 0.4, shelfDays: 730 },
  { id: 'peanut-butter', name: 'Peanut butter', aliases: ['pb', 'peanut butter'], category: 'protein', base: 'g', defaultUnit: 'oz', gramsPer: { tbsp: 16, cup: 258, each: 454 }, nutrition: { kcal: 588, protein: 25, fiber: 6, carbs: 20, fat: 50 }, pricePerBase: 0.55, shelfDays: 180 },
  { id: 'tuna', name: 'Canned tuna', aliases: ['tuna', 'tuna fish'], category: 'canned', base: 'g', defaultUnit: 'can', gramsPer: { can: 142 }, nutrition: { kcal: 116, protein: 25.5, fiber: 0, carbs: 0, fat: 0.8 }, pricePerBase: 0.95, shelfDays: 1095 },

  // Dairy, eggs, meat
  { id: 'eggs', name: 'Eggs', aliases: ['egg', 'large eggs'], category: 'protein', base: 'g', defaultUnit: 'each', gramsPer: { each: 50, dozen: 600 }, nutrition: { kcal: 143, protein: 12.6, fiber: 0, carbs: 0.7, fat: 9.5 }, pricePerBase: 0.6, shelfDays: 35 },
  { id: 'milk', name: 'Milk (2%)', aliases: ['milk', '2% milk', 'whole milk'], category: 'dairy', base: 'ml', defaultUnit: 'cup', nutrition: { kcal: 50, protein: 3.3, fiber: 0, carbs: 4.8, fat: 2 }, pricePerBase: 0.09, shelfDays: 10 },
  { id: 'cheddar', name: 'Cheddar cheese', aliases: ['cheese', 'shredded cheese', 'cheddar'], category: 'dairy', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 113 }, nutrition: { kcal: 403, protein: 23, fiber: 0, carbs: 3.1, fat: 33 }, pricePerBase: 1.1, shelfDays: 30 },
  { id: 'yogurt', name: 'Plain yogurt', aliases: ['yogurt', 'yoghurt'], category: 'dairy', base: 'g', defaultUnit: 'cup', gramsPer: { cup: 245 }, nutrition: { kcal: 61, protein: 3.5, fiber: 0, carbs: 4.7, fat: 3.3 }, pricePerBase: 0.45, shelfDays: 14 },
  { id: 'butter', name: 'Butter', aliases: ['butter', 'margarine'], category: 'dairy', base: 'g', defaultUnit: 'tbsp', gramsPer: { tbsp: 14, cup: 227 }, nutrition: { kcal: 717, protein: 0.9, fiber: 0, carbs: 0.1, fat: 81 }, pricePerBase: 1.0, shelfDays: 60 },
  { id: 'chicken', name: 'Chicken thighs', aliases: ['chicken', 'chicken breast', 'chicken thighs'], category: 'protein', base: 'g', defaultUnit: 'lb', nutrition: { kcal: 121, protein: 19.7, fiber: 0, carbs: 0, fat: 4.1 }, pricePerBase: 0.75, shelfDays: 3 },
  { id: 'ground-turkey', name: 'Ground turkey', aliases: ['turkey', 'ground turkey'], category: 'protein', base: 'g', defaultUnit: 'lb', nutrition: { kcal: 148, protein: 19.7, fiber: 0, carbs: 0, fat: 7.7 }, pricePerBase: 0.99, shelfDays: 3 },

  // Canned & frozen produce
  { id: 'diced-tomatoes', name: 'Diced tomatoes (canned)', aliases: ['canned tomatoes', 'diced tomatoes', 'crushed tomatoes'], category: 'canned', base: 'g', defaultUnit: 'can', gramsPer: { can: 411, cup: 240 }, nutrition: { kcal: 20, protein: 0.9, fiber: 1.3, carbs: 4, fat: 0.2 }, pricePerBase: 0.3, shelfDays: 730, vegetable: true },
  { id: 'tomato-paste', name: 'Tomato paste', aliases: ['tomato paste'], category: 'canned', base: 'g', defaultUnit: 'can', gramsPer: { can: 170, tbsp: 16 }, nutrition: { kcal: 82, protein: 4.3, fiber: 4.1, carbs: 19, fat: 0.5 }, pricePerBase: 0.55, shelfDays: 730, vegetable: true },
  { id: 'corn', name: 'Corn (canned)', aliases: ['corn', 'sweet corn', 'canned corn'], category: 'canned', base: 'g', defaultUnit: 'can', gramsPer: { can: 432, cup: 165 }, nutrition: { kcal: 67, protein: 2.3, fiber: 1.9, carbs: 15, fat: 0.9 }, pricePerBase: 0.28, shelfDays: 730, vegetable: true },
  { id: 'green-beans', name: 'Green beans (canned)', aliases: ['green beans', 'string beans'], category: 'canned', base: 'g', defaultUnit: 'can', gramsPer: { can: 411, cup: 150 }, nutrition: { kcal: 20, protein: 1, fiber: 1.9, carbs: 4.4, fat: 0.1 }, pricePerBase: 0.25, shelfDays: 730, vegetable: true },
  { id: 'peaches', name: 'Peaches (canned)', aliases: ['canned peaches', 'peaches'], category: 'fruit', base: 'g', defaultUnit: 'can', gramsPer: { can: 425, cup: 245 }, nutrition: { kcal: 54, protein: 0.4, fiber: 1.3, carbs: 15, fat: 0 }, pricePerBase: 0.35, shelfDays: 730, fruit: true },
  { id: 'mixed-veg', name: 'Frozen mixed vegetables', aliases: ['mixed vegetables', 'frozen vegetables', 'frozen veggies'], category: 'frozen', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 135, each: 340 }, nutrition: { kcal: 64, protein: 2.9, fiber: 4, carbs: 13, fat: 0.5 }, pricePerBase: 0.35, shelfDays: 240, vegetable: true },
  { id: 'frozen-spinach', name: 'Frozen spinach', aliases: ['frozen spinach'], category: 'frozen', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 156, each: 283 }, nutrition: { kcal: 29, protein: 3.6, fiber: 3, carbs: 4.8, fat: 0.6 }, pricePerBase: 0.45, shelfDays: 240, vegetable: true },
  { id: 'peas', name: 'Frozen peas', aliases: ['peas', 'green peas'], category: 'frozen', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 145, each: 340 }, nutrition: { kcal: 77, protein: 5.2, fiber: 4.5, carbs: 13.6, fat: 0.4 }, pricePerBase: 0.4, shelfDays: 240, vegetable: true },
  { id: 'berries', name: 'Frozen berries', aliases: ['berries', 'blueberries', 'strawberries', 'mixed berries'], category: 'frozen', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 150, each: 340 }, nutrition: { kcal: 45, protein: 0.7, fiber: 2.7, carbs: 11, fat: 0.3 }, pricePerBase: 0.75, shelfDays: 240, fruit: true },

  // Fresh produce
  { id: 'onion', name: 'Onions', aliases: ['onion', 'yellow onion', 'white onion'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 150, cup: 160 }, nutrition: { kcal: 40, protein: 1.1, fiber: 1.7, carbs: 9.3, fat: 0.1 }, pricePerBase: 0.26, shelfDays: 45, vegetable: true },
  { id: 'garlic', name: 'Garlic', aliases: ['garlic', 'garlic cloves'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 40, tsp: 3 }, nutrition: { kcal: 149, protein: 6.4, fiber: 2.1, carbs: 33, fat: 0.5 }, pricePerBase: 1.0, shelfDays: 60, vegetable: true },
  { id: 'carrots', name: 'Carrots', aliases: ['carrot', 'carrots', 'baby carrots'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 60, cup: 128, lb: 453.6 }, nutrition: { kcal: 41, protein: 0.9, fiber: 2.8, carbs: 9.6, fat: 0.2 }, pricePerBase: 0.3, shelfDays: 28, vegetable: true },
  { id: 'potatoes', name: 'Potatoes', aliases: ['potato', 'russet potatoes', 'potatoes'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 213 }, nutrition: { kcal: 77, protein: 2, fiber: 2.2, carbs: 17, fat: 0.1 }, pricePerBase: 0.22, shelfDays: 30, vegetable: true },
  { id: 'sweet-potatoes', name: 'Sweet potatoes', aliases: ['sweet potato', 'yams'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 130 }, nutrition: { kcal: 86, protein: 1.6, fiber: 3, carbs: 20, fat: 0.1 }, pricePerBase: 0.33, shelfDays: 30, vegetable: true },
  { id: 'cabbage', name: 'Cabbage', aliases: ['cabbage', 'green cabbage'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 900, cup: 89 }, nutrition: { kcal: 25, protein: 1.3, fiber: 2.5, carbs: 5.8, fat: 0.1 }, pricePerBase: 0.2, shelfDays: 30, vegetable: true },
  { id: 'spinach', name: 'Fresh spinach', aliases: ['spinach', 'baby spinach'], category: 'produce', base: 'g', defaultUnit: 'oz', gramsPer: { bunch: 340, cup: 30 }, nutrition: { kcal: 23, protein: 2.9, fiber: 2.2, carbs: 3.6, fat: 0.4 }, pricePerBase: 0.9, shelfDays: 5, vegetable: true },
  { id: 'bell-pepper', name: 'Bell peppers', aliases: ['bell pepper', 'green pepper', 'red pepper', 'pepper'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 120, cup: 150 }, nutrition: { kcal: 20, protein: 0.9, fiber: 1.7, carbs: 4.6, fat: 0.2 }, pricePerBase: 0.6, shelfDays: 10, vegetable: true },
  { id: 'tomatoes', name: 'Fresh tomatoes', aliases: ['tomato', 'tomatoes', 'roma tomatoes'], category: 'produce', base: 'g', defaultUnit: 'each', gramsPer: { each: 123 }, nutrition: { kcal: 18, protein: 0.9, fiber: 1.2, carbs: 3.9, fat: 0.2 }, pricePerBase: 0.45, shelfDays: 7, vegetable: true },
  { id: 'bananas', name: 'Bananas', aliases: ['banana', 'bananas'], category: 'fruit', base: 'g', defaultUnit: 'each', gramsPer: { each: 118 }, nutrition: { kcal: 89, protein: 1.1, fiber: 2.6, carbs: 23, fat: 0.3 }, pricePerBase: 0.15, shelfDays: 6, fruit: true },
  { id: 'apples', name: 'Apples', aliases: ['apple', 'apples'], category: 'fruit', base: 'g', defaultUnit: 'each', gramsPer: { each: 182 }, nutrition: { kcal: 52, protein: 0.3, fiber: 2.4, carbs: 14, fat: 0.2 }, pricePerBase: 0.4, shelfDays: 30, fruit: true },
  { id: 'oranges', name: 'Oranges', aliases: ['orange', 'oranges'], category: 'fruit', base: 'g', defaultUnit: 'each', gramsPer: { each: 140 }, nutrition: { kcal: 47, protein: 0.9, fiber: 2.4, carbs: 12, fat: 0.1 }, pricePerBase: 0.35, shelfDays: 21, fruit: true },
  { id: 'raisins', name: 'Raisins', aliases: ['raisins'], category: 'fruit', base: 'g', defaultUnit: 'oz', gramsPer: { cup: 145, tbsp: 9 }, nutrition: { kcal: 299, protein: 3.1, fiber: 3.7, carbs: 79, fat: 0.5 }, pricePerBase: 0.7, shelfDays: 180, fruit: true },

  // Condiments, liquids, staples
  { id: 'broth', name: 'Broth', aliases: ['stock', 'chicken broth', 'vegetable broth', 'bouillon'], category: 'condiments', base: 'ml', defaultUnit: 'cup', gramsPer: { each: 946 }, nutrition: { kcal: 5, protein: 0.5, fiber: 0, carbs: 0.4, fat: 0.2 }, pricePerBase: 0.25, shelfDays: 365 },
  { id: 'soy-sauce', name: 'Soy sauce', aliases: ['soy sauce', 'soya sauce'], category: 'condiments', base: 'ml', defaultUnit: 'tbsp', nutrition: { kcal: 53, protein: 8, fiber: 0.8, carbs: 4.9, fat: 0.6 }, pricePerBase: 0.45, shelfDays: 730 },
  { id: 'honey', name: 'Honey', aliases: ['honey'], category: 'condiments', base: 'g', defaultUnit: 'tbsp', gramsPer: { tbsp: 21, tsp: 7, cup: 339 }, nutrition: { kcal: 304, protein: 0.3, fiber: 0.2, carbs: 82, fat: 0 }, pricePerBase: 0.85, shelfDays: 730 },
  { id: 'oil', name: 'Cooking oil', aliases: ['oil', 'vegetable oil', 'canola oil', 'olive oil'], category: 'condiments', base: 'ml', defaultUnit: 'tbsp', nutrition: { kcal: 884, protein: 0, fiber: 0, carbs: 0, fat: 100 }, pricePerBase: 0.3, shelfDays: 365, staple: true },
  { id: 'spices', name: 'Salt, pepper & spices', aliases: ['salt', 'pepper', 'spices', 'chili powder', 'cumin', 'cinnamon', 'seasoning'], category: 'condiments', base: 'g', defaultUnit: 'tsp', gramsPer: { tsp: 2.5, tbsp: 7.5 }, nutrition: { kcal: 0, protein: 0, fiber: 0, carbs: 0, fat: 0 }, pricePerBase: 0, shelfDays: 730, staple: true },
  { id: 'water', name: 'Water', aliases: ['water'], category: 'condiments', base: 'ml', defaultUnit: 'cup', nutrition: { kcal: 0, protein: 0, fiber: 0, carbs: 0, fat: 0 }, pricePerBase: 0, shelfDays: 99999, staple: true },
  { id: 'sugar', name: 'Sugar', aliases: ['sugar', 'brown sugar'], category: 'baking', base: 'g', defaultUnit: 'cup', gramsPer: { cup: 200, tbsp: 12.5, tsp: 4 }, nutrition: { kcal: 387, protein: 0, fiber: 0, carbs: 100, fat: 0 }, pricePerBase: 0.1, shelfDays: 730 },
  { id: 'baking-powder', name: 'Baking powder', aliases: ['baking powder', 'baking soda'], category: 'baking', base: 'g', defaultUnit: 'tsp', gramsPer: { tsp: 4.6, tbsp: 13.8 }, nutrition: { kcal: 53, protein: 0, fiber: 0.2, carbs: 28, fat: 0 }, pricePerBase: 0.9, shelfDays: 365, staple: true },
]

export const INGREDIENTS: Ingredient[] = rows.map((r) => ({ snapEligible: true, ...r }))

export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]))

export function getIngredient(id: string): Ingredient {
  const found = INGREDIENT_BY_ID[id]
  if (!found) throw new Error(`Unknown ingredient: ${id}`)
  return found
}

export const CATEGORY_LABEL: Record<Ingredient['category'], string> = {
  grains: 'Grains & bread',
  legumes: 'Beans & legumes',
  canned: 'Canned goods',
  produce: 'Vegetables',
  fruit: 'Fruit',
  dairy: 'Dairy',
  protein: 'Eggs, meat & nut butter',
  baking: 'Baking',
  condiments: 'Oils, sauces & spices',
  frozen: 'Frozen',
}
