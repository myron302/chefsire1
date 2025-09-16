# Chefsire1 🍳

A modern recipe management and cooking assistant application built from the ground up with Python.

## Features

- **Recipe Management**: Add, view, edit, and delete recipes with detailed information
- **Smart Search**: Find recipes by name, ingredients, or tags
- **Interactive CLI**: Beautiful command-line interface with rich formatting
- **Flexible Storage**: YAML-based storage with automatic indexing
- **Nutrition Tracking**: Optional nutritional information per recipe
- **Shopping Lists**: Generate shopping lists from recipes
- **Tag System**: Organize recipes with custom tags
- **Filtering**: Filter recipes by difficulty, cooking time, and tags

## Installation

### From Source

```bash
git clone https://github.com/myron302/chefsire1.git
cd chefsire1
pip install -e .
```

### Development Installation

```bash
git clone https://github.com/myron302/chefsire1.git
cd chefsire1
pip install -e ".[dev]"
```

## Quick Start

### Basic Usage

```bash
# Add a new recipe interactively
chefsire add

# List all recipes
chefsire list

# Show a specific recipe
chefsire show "Chocolate Chip Cookies"

# Search for recipes
chefsire search chocolate

# Generate shopping list
chefsire shopping "Spaghetti Carbonara"

# View all available tags
chefsire tags
```

### Example: Adding a Recipe

```bash
$ chefsire add
Add New Recipe
Enter recipe details (press Ctrl+C to cancel)

Recipe name: Pancakes
Description (optional): Fluffy weekend pancakes
Author (optional): Chef Alice
Prep time (minutes): 10
Cook time (minutes): 15
Number of servings: 4
Difficulty level [beginner/intermediate/advanced/expert]: beginner

Add ingredients (type 'done' when finished):
Ingredient name: flour
Amount: 2
Unit [cup/tbsp/tsp/...]: cup
Notes (optional): all-purpose
...
```

## Project Structure

```
chefsire1/
├── src/chefsire1/          # Main package
│   ├── __init__.py         # Package initialization
│   ├── models.py           # Data models (Recipe, Ingredient, etc.)
│   ├── recipe_manager.py   # Recipe management logic
│   └── cli.py              # Command-line interface
├── tests/                  # Test suite
├── examples/               # Example recipes and usage
├── docs/                   # Documentation
└── pyproject.toml         # Project configuration
```

## API Examples

### Creating Recipes Programmatically

```python
from chefsire1 import Recipe, Ingredient, RecipeManager, DifficultyLevel, MeasurementUnit

# Create ingredients
ingredients = [
    Ingredient(name="flour", amount=2, unit=MeasurementUnit.CUP),
    Ingredient(name="sugar", amount=0.5, unit=MeasurementUnit.CUP),
    Ingredient(name="eggs", amount=2, unit=MeasurementUnit.PIECE)
]

# Create recipe
recipe = Recipe(
    name="Simple Pancakes",
    description="Quick and easy pancakes",
    prep_time_minutes=10,
    cook_time_minutes=15,
    servings=4,
    difficulty=DifficultyLevel.BEGINNER,
    ingredients=ingredients,
    instructions=[
        "Mix dry ingredients",
        "Add wet ingredients",
        "Cook on griddle until golden"
    ],
    tags=["breakfast", "quick", "family-friendly"]
)

# Save recipe
manager = RecipeManager()
manager.add_recipe(recipe)
```

### Searching and Filtering

```python
# Find all breakfast recipes
breakfast_recipes = manager.list_recipes(tags=["breakfast"])

# Find quick recipes (under 30 minutes)
quick_recipes = manager.list_recipes(max_time=30)

# Search by ingredient
chocolate_recipes = manager.search_recipes("chocolate")
```

## Data Storage

Recipes are stored in YAML format in `~/.chefsire1/recipes/` with an index file for fast lookups. Each recipe is saved as a separate file for easy version control and backup.

## Development

### Running Tests

```bash
pytest
pytest --cov=chefsire1  # With coverage
```

### Code Formatting

```bash
black src/ tests/
ruff check src/ tests/
mypy src/
```

### Adding Sample Data

```bash
python examples/sample_recipes.py
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Web interface
- [ ] Recipe scaling (adjust serving sizes)
- [ ] Meal planning features
- [ ] Import/export from popular recipe formats
- [ ] Recipe sharing and community features
- [ ] Mobile app companion
- [ ] Integration with grocery delivery services

---

*Built with ❤️ for home cooks and food enthusiasts*