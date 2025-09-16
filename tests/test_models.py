"""Tests for chefsire1 models."""

import pytest
from chefsire1.models import Recipe, Ingredient, DifficultyLevel, MeasurementUnit, NutritionInfo


def test_ingredient_creation():
    """Test creating an ingredient."""
    ingredient = Ingredient(
        name="flour",
        amount=2.5,
        unit=MeasurementUnit.CUP,
        notes="all-purpose"
    )
    
    assert ingredient.name == "flour"
    assert ingredient.amount == 2.5
    assert ingredient.unit == MeasurementUnit.CUP
    assert ingredient.notes == "all-purpose"
    assert str(ingredient) == "2.5 cup flour (all-purpose)"


def test_ingredient_validation():
    """Test ingredient validation."""
    with pytest.raises(ValueError):
        Ingredient(name="flour", amount=0, unit=MeasurementUnit.CUP)
    
    with pytest.raises(ValueError):
        Ingredient(name="flour", amount=-1, unit=MeasurementUnit.CUP)


def test_recipe_creation():
    """Test creating a recipe."""
    ingredients = [
        Ingredient(name="flour", amount=2, unit=MeasurementUnit.CUP),
        Ingredient(name="sugar", amount=1, unit=MeasurementUnit.CUP)
    ]
    
    instructions = [
        "Mix ingredients",
        "Bake for 30 minutes"
    ]
    
    recipe = Recipe(
        name="Test Recipe",
        description="A test recipe",
        prep_time_minutes=15,
        cook_time_minutes=30,
        servings=4,
        difficulty=DifficultyLevel.BEGINNER,
        ingredients=ingredients,
        instructions=instructions
    )
    
    assert recipe.name == "Test Recipe"
    assert recipe.total_time_minutes == 45
    assert len(recipe.ingredients) == 2
    assert len(recipe.instructions) == 2


def test_recipe_validation():
    """Test recipe validation."""
    ingredients = [Ingredient(name="flour", amount=2, unit=MeasurementUnit.CUP)]
    instructions = ["Mix and bake"]
    
    # Test invalid times
    with pytest.raises(ValueError):
        Recipe(
            name="Test",
            prep_time_minutes=0,
            cook_time_minutes=30,
            servings=4,
            difficulty=DifficultyLevel.BEGINNER,
            ingredients=ingredients,
            instructions=instructions
        )
    
    # Test invalid servings
    with pytest.raises(ValueError):
        Recipe(
            name="Test",
            prep_time_minutes=15,
            cook_time_minutes=30,
            servings=0,
            difficulty=DifficultyLevel.BEGINNER,
            ingredients=ingredients,
            instructions=instructions
        )
    
    # Test empty ingredients
    with pytest.raises(ValueError):
        Recipe(
            name="Test",
            prep_time_minutes=15,
            cook_time_minutes=30,
            servings=4,
            difficulty=DifficultyLevel.BEGINNER,
            ingredients=[],
            instructions=instructions
        )
    
    # Test empty instructions
    with pytest.raises(ValueError):
        Recipe(
            name="Test",
            prep_time_minutes=15,
            cook_time_minutes=30,
            servings=4,
            difficulty=DifficultyLevel.BEGINNER,
            ingredients=ingredients,
            instructions=[]
        )


def test_recipe_shopping_list():
    """Test generating shopping list from recipe."""
    ingredients = [
        Ingredient(name="flour", amount=2, unit=MeasurementUnit.CUP),
        Ingredient(name="sugar", amount=1, unit=MeasurementUnit.CUP, notes="brown")
    ]
    
    recipe = Recipe(
        name="Test Recipe",
        prep_time_minutes=15,
        cook_time_minutes=30,
        servings=4,
        difficulty=DifficultyLevel.BEGINNER,
        ingredients=ingredients,
        instructions=["Mix and bake"]
    )
    
    shopping_list = recipe.get_shopping_list()
    assert len(shopping_list) == 2
    assert "2 cup flour" in shopping_list[0]
    assert "1 cup sugar (brown)" in shopping_list[1]


def test_nutrition_info():
    """Test nutrition information."""
    nutrition = NutritionInfo(
        calories_per_serving=250,
        protein_g=8.5,
        carbs_g=45.2,
        fat_g=12.1
    )
    
    assert nutrition.calories_per_serving == 250
    assert nutrition.protein_g == 8.5
    assert nutrition.carbs_g == 45.2
    assert nutrition.fat_g == 12.1