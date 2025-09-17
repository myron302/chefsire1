import fetch from "node-fetch";
import { storage } from "./storage.js";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

export async function fetchRecipesFromTheMealDB() {
  try {
    console.log("Starting to fetch recipes from TheMealDB...");
    
    // Get all categories
    const categoriesRes = await fetch(`${BASE_URL}categories.php`);
    const categoriesData = await categoriesRes.json();
    const categories = categoriesData.categories;
    
    if (!categories) {
      throw new Error("No categories found");
    }

    console.log(`Found ${categories.length} categories`);
    const allRecipes = [];

    // Limit to first 3 categories for testing to avoid overwhelming the API
    const limitedCategories = categories.slice(0, 3);

    for (const category of limitedCategories) {
      const categoryName = category.strCategory;
      console.log(`Fetching ${categoryName}...`);
      
      try {
        // Get meals by category
        const filterRes = await fetch(`${BASE_URL}filter.php?c=${categoryName}`);
        const filterData = await filterRes.json();
        const meals = filterData.meals || [];

        console.log(`Found ${meals.length} meals in ${categoryName}`);

        // Limit to first 5 meals per category for testing
        const limitedMeals = meals.slice(0, 5);

        for (const meal of limitedMeals) {
          try {
            // Get full meal details
            const lookupRes = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
            const lookupData = await lookupRes.json();
            const fullMeal = lookupData.meals?.[0];

            if (!fullMeal || !fullMeal.strMeal || !fullMeal.strInstructions) {
              console.warn(`Skipping incomplete meal: ${meal.idMeal}`);
              continue;
            }

            // Build ingredients array
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = fullMeal[`strIngredient${i}`];
              const measure = fullMeal[`strMeasure${i}`];
              if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure || ""} ${ingredient}`.trim());
              }
            }

            // Process instructions
            let instructions = fullMeal.strInstructions || "";
            instructions = instructions
              .split(/\r\n|\n|\r/)
              .map((step: string) => step.trim())
              .filter((step: string) => step.length > 0);

            if (instructions.length === 0) {
              instructions = ["No instructions available"];
            }

            const recipe = {
              id: crypto.randomUUID(),
              postId: null, // Will be set when we create posts
              title: fullMeal.strMeal.trim(),
              imageUrl: fullMeal.strMealThumb || null, // This is the key - the image URL!
              ingredients: ingredients.length > 0 ? ingredients : ["No ingredients listed"],
              instructions,
              cookTime: null,
              servings: null,
              difficulty: null,
              calories: null,
              protein: null,
              carbs: null,
              fat: null,
              fiber: null,
            };

            allRecipes.push(recipe);
            console.log(`✓ Processed: ${recipe.title} ${recipe.imageUrl ? '(with image)' : '(no image)'}`);

          } catch (mealError) {
            console.error(`Error processing meal ${meal.idMeal}:`, mealError);
            continue;
          }
        }

        // Be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (categoryError) {
        console.error(`Error processing category ${categoryName}:`, categoryError);
        continue;
      }
    }

    console.log(`\nProcessed ${allRecipes.length} total recipes`);

    if (allRecipes.length === 0) {
      throw new Error("No valid recipes were processed");
    }

    // Insert recipes into database
    let insertedCount = 0;
    for (const recipe of allRecipes) {
      try {
        await storage.createRecipe(recipe);
        insertedCount++;
      } catch (insertError) {
        console.error(`Failed to insert recipe ${recipe.title}:`, insertError);
      }
    }

    console.log(`Successfully inserted ${insertedCount} recipes with images!`);
    
    return { 
      success: true, 
      count: insertedCount,
      processed: allRecipes.length,
      withImages: allRecipes.filter(r => r.imageUrl).length
    };

  } catch (error) {
    console.error("Error in fetchRecipesFromTheMealDB:", error);
    throw error;
  }
}
