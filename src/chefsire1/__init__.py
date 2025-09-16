"""Chefsire1 - A modern recipe management and cooking assistant application."""

__version__ = "0.1.0"
__author__ = "myron302"
__email__ = "myron302@gmail.com"

from .models import Recipe, Ingredient, NutritionInfo, DifficultyLevel, MeasurementUnit
from .recipe_manager import RecipeManager

__all__ = [
    "Recipe", 
    "Ingredient", 
    "NutritionInfo", 
    "DifficultyLevel", 
    "MeasurementUnit",
    "RecipeManager"
]