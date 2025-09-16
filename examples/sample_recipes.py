"""Sample recipes for demonstrating chefsire1 functionality."""

from chefsire1.models import Recipe, Ingredient, DifficultyLevel, MeasurementUnit, NutritionInfo
from chefsire1.recipe_manager import RecipeManager


def create_sample_recipes():
    """Create and return a list of sample recipes."""
    
    # Classic Chocolate Chip Cookies
    cookies = Recipe(
        name="Classic Chocolate Chip Cookies",
        description="Soft and chewy chocolate chip cookies that everyone loves",
        author="Chefsire1",
        prep_time_minutes=15,
        cook_time_minutes=12,
        servings=24,
        difficulty=DifficultyLevel.BEGINNER,
        ingredients=[
            Ingredient(name="all-purpose flour", amount=2.25, unit=MeasurementUnit.CUP),
            Ingredient(name="baking soda", amount=1, unit=MeasurementUnit.TEASPOON),
            Ingredient(name="salt", amount=1, unit=MeasurementUnit.TEASPOON),
            Ingredient(name="butter", amount=1, unit=MeasurementUnit.CUP, notes="softened"),
            Ingredient(name="granulated sugar", amount=0.75, unit=MeasurementUnit.CUP),
            Ingredient(name="brown sugar", amount=0.75, unit=MeasurementUnit.CUP, notes="packed"),
            Ingredient(name="vanilla extract", amount=2, unit=MeasurementUnit.TEASPOON),
            Ingredient(name="large eggs", amount=2, unit=MeasurementUnit.PIECE),
            Ingredient(name="chocolate chips", amount=2, unit=MeasurementUnit.CUP),
        ],
        instructions=[
            "Preheat oven to 375°F (190°C).",
            "In a medium bowl, whisk together flour, baking soda, and salt.",
            "In a large bowl, cream together butter and both sugars until light and fluffy.",
            "Beat in vanilla and eggs one at a time.",
            "Gradually mix in the flour mixture until just combined.",
            "Stir in chocolate chips.",
            "Drop rounded tablespoons of dough onto ungreased baking sheets.",
            "Bake for 9-11 minutes or until golden brown.",
            "Cool on baking sheet for 2 minutes, then remove to wire rack."
        ],
        tags=["dessert", "cookies", "chocolate", "baking"],
        equipment=["mixing bowls", "electric mixer", "baking sheets", "wire rack"],
        nutrition=NutritionInfo(
            calories_per_serving=180,
            fat_g=8,
            carbs_g=26,
            protein_g=2,
            sugar_g=18
        )
    )
    
    # Spaghetti Carbonara
    carbonara = Recipe(
        name="Spaghetti Carbonara",
        description="Authentic Italian pasta dish with eggs, cheese, and pancetta",
        author="Chefsire1",
        prep_time_minutes=10,
        cook_time_minutes=15,
        servings=4,
        difficulty=DifficultyLevel.INTERMEDIATE,
        ingredients=[
            Ingredient(name="spaghetti", amount=1, unit=MeasurementUnit.POUND),
            Ingredient(name="pancetta", amount=6, unit=MeasurementUnit.OUNCE, notes="diced"),
            Ingredient(name="large eggs", amount=3, unit=MeasurementUnit.PIECE),
            Ingredient(name="Pecorino Romano cheese", amount=1, unit=MeasurementUnit.CUP, notes="grated"),
            Ingredient(name="black pepper", amount=1, unit=MeasurementUnit.TEASPOON, notes="freshly ground"),
            Ingredient(name="salt", amount=1, unit=MeasurementUnit.TEASPOON),
        ],
        instructions=[
            "Bring a large pot of salted water to boil and cook spaghetti according to package directions.",
            "While pasta cooks, heat a large skillet over medium heat.",
            "Add pancetta and cook until crispy, about 5-7 minutes.",
            "In a bowl, whisk together eggs, cheese, and black pepper.",
            "When pasta is al dente, reserve 1 cup pasta water and drain pasta.",
            "Add hot pasta to the skillet with pancetta.",
            "Remove from heat and quickly toss with egg mixture, adding pasta water as needed.",
            "Serve immediately with extra cheese and pepper."
        ],
        tags=["pasta", "Italian", "dinner", "quick"],
        equipment=["large pot", "large skillet", "colander", "whisk"],
        notes="The key is to work quickly when combining the eggs to prevent scrambling.",
        nutrition=NutritionInfo(
            calories_per_serving=520,
            protein_g=22,
            carbs_g=65,
            fat_g=18,
            sodium_mg=850
        )
    )
    
    # Green Smoothie Bowl
    smoothie_bowl = Recipe(
        name="Tropical Green Smoothie Bowl",
        description="Nutritious and colorful smoothie bowl packed with fruits and vegetables",
        author="Chefsire1",
        prep_time_minutes=10,
        cook_time_minutes=1,  # Minimal time for blending
        servings=2,
        difficulty=DifficultyLevel.BEGINNER,
        ingredients=[
            Ingredient(name="frozen banana", amount=2, unit=MeasurementUnit.PIECE),
            Ingredient(name="frozen mango chunks", amount=1, unit=MeasurementUnit.CUP),
            Ingredient(name="fresh spinach", amount=2, unit=MeasurementUnit.CUP),
            Ingredient(name="coconut milk", amount=0.5, unit=MeasurementUnit.CUP),
            Ingredient(name="chia seeds", amount=1, unit=MeasurementUnit.TABLESPOON),
            Ingredient(name="honey", amount=1, unit=MeasurementUnit.TABLESPOON, notes="optional"),
            # Toppings
            Ingredient(name="granola", amount=0.25, unit=MeasurementUnit.CUP),
            Ingredient(name="fresh berries", amount=0.5, unit=MeasurementUnit.CUP),
            Ingredient(name="coconut flakes", amount=2, unit=MeasurementUnit.TABLESPOON),
            Ingredient(name="sliced almonds", amount=2, unit=MeasurementUnit.TABLESPOON),
        ],
        instructions=[
            "Add frozen banana, mango, spinach, coconut milk, chia seeds, and honey to a blender.",
            "Blend until smooth and creamy, adding more coconut milk if needed.",
            "Pour into bowls.",
            "Top with granola, berries, coconut flakes, and almonds.",
            "Serve immediately."
        ],
        tags=["healthy", "breakfast", "smoothie", "vegan", "gluten-free"],
        equipment=["high-speed blender", "bowls"],
        nutrition=NutritionInfo(
            calories_per_serving=280,
            protein_g=6,
            carbs_g=45,
            fat_g=12,
            fiber_g=8,
            sugar_g=32
        )
    )
    
    return [cookies, carbonara, smoothie_bowl]


def populate_sample_data():
    """Add sample recipes to the recipe manager."""
    manager = RecipeManager()
    
    recipes = create_sample_recipes()
    
    for recipe in recipes:
        try:
            manager.add_recipe(recipe)
            print(f"Added recipe: {recipe.name}")
        except ValueError as e:
            print(f"Skipped {recipe.name}: {e}")
    
    print(f"\nTotal recipes in collection: {len(manager.list_recipes())}")


if __name__ == "__main__":
    populate_sample_data()