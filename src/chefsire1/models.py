"""Data models for the chefsire1 application."""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator


class DifficultyLevel(str, Enum):
    """Recipe difficulty levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class MeasurementUnit(str, Enum):
    """Common cooking measurement units."""
    # Volume
    CUP = "cup"
    TABLESPOON = "tbsp"
    TEASPOON = "tsp"
    FLUID_OUNCE = "fl oz"
    MILLILITER = "ml"
    LITER = "l"
    
    # Weight
    POUND = "lb"
    OUNCE = "oz"
    GRAM = "g"
    KILOGRAM = "kg"
    
    # Count
    PIECE = "piece"
    CLOVE = "clove"
    PINCH = "pinch"
    DASH = "dash"


class Ingredient(BaseModel):
    """Represents a recipe ingredient."""
    name: str = Field(..., description="Name of the ingredient")
    amount: float = Field(..., description="Amount of the ingredient")
    unit: MeasurementUnit = Field(..., description="Unit of measurement")
    notes: Optional[str] = Field(None, description="Additional notes about the ingredient")
    
    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v
    
    def __str__(self) -> str:
        amount_str = f"{self.amount:g}"  # Remove trailing zeros
        result = f"{amount_str} {self.unit.value} {self.name}"
        if self.notes:
            result += f" ({self.notes})"
        return result


class NutritionInfo(BaseModel):
    """Nutritional information for a recipe."""
    calories_per_serving: Optional[int] = Field(None, description="Calories per serving")
    protein_g: Optional[float] = Field(None, description="Protein in grams")
    carbs_g: Optional[float] = Field(None, description="Carbohydrates in grams")
    fat_g: Optional[float] = Field(None, description="Fat in grams")
    fiber_g: Optional[float] = Field(None, description="Fiber in grams")
    sugar_g: Optional[float] = Field(None, description="Sugar in grams")
    sodium_mg: Optional[float] = Field(None, description="Sodium in milligrams")


class Recipe(BaseModel):
    """Represents a recipe with all its details."""
    
    # Basic information
    name: str = Field(..., description="Name of the recipe")
    description: Optional[str] = Field(None, description="Brief description of the recipe")
    author: Optional[str] = Field(None, description="Recipe author")
    
    # Timing and difficulty
    prep_time_minutes: int = Field(..., description="Preparation time in minutes")
    cook_time_minutes: int = Field(..., description="Cooking time in minutes")
    servings: int = Field(..., description="Number of servings")
    difficulty: DifficultyLevel = Field(..., description="Recipe difficulty level")
    
    # Recipe content
    ingredients: List[Ingredient] = Field(..., description="List of ingredients")
    instructions: List[str] = Field(..., description="Step-by-step instructions")
    
    # Optional details
    tags: List[str] = Field(default_factory=list, description="Recipe tags/categories")
    equipment: List[str] = Field(default_factory=list, description="Required equipment")
    notes: Optional[str] = Field(None, description="Additional notes")
    nutrition: Optional[NutritionInfo] = Field(None, description="Nutritional information")
    
    # Metadata
    source: Optional[str] = Field(None, description="Recipe source")
    created_at: Optional[str] = Field(None, description="Creation timestamp")
    
    @validator('prep_time_minutes', 'cook_time_minutes', 'servings')
    def time_and_servings_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Time and servings must be positive')
        return v
    
    @validator('ingredients')
    def must_have_ingredients(cls, v):
        if not v:
            raise ValueError('Recipe must have at least one ingredient')
        return v
    
    @validator('instructions')
    def must_have_instructions(cls, v):
        if not v:
            raise ValueError('Recipe must have at least one instruction')
        return v
    
    @property
    def total_time_minutes(self) -> int:
        """Calculate total time required for the recipe."""
        return self.prep_time_minutes + self.cook_time_minutes
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert recipe to dictionary representation."""
        return self.dict()
    
    def get_shopping_list(self) -> List[str]:
        """Generate a shopping list from the recipe ingredients."""
        return [str(ingredient) for ingredient in self.ingredients]