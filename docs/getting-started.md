# Getting Started with Chefsire1

## Quick Setup

1. Install Chefsire1:
   ```bash
   pip install chefsire1
   ```

2. Start adding recipes:
   ```bash
   chefsire add
   ```

3. Browse your collection:
   ```bash
   chefsire list
   ```

## Your First Recipe

Let's add a simple recipe using the interactive CLI:

```bash
$ chefsire add
Add New Recipe
Enter recipe details (press Ctrl+C to cancel)

Recipe name: Simple Pancakes
Description (optional): Quick weekend pancakes
Author (optional): Home Chef
Prep time (minutes): 10
Cook time (minutes): 15
Number of servings: 4
Difficulty level [beginner/intermediate/advanced/expert]: beginner

Add ingredients (type 'done' when finished):
Ingredient name: flour
Amount: 2
Unit [cup/tbsp/tsp/...]: cup
Notes (optional): all-purpose
... (continue adding ingredients)

Add instructions (type 'done' when finished):
Step 1: Mix dry ingredients in a bowl
Step 2: Add wet ingredients and stir until just combined
Step 3: Cook on griddle until golden brown
Step 4: done

Tags (comma-separated, optional): breakfast, quick, family-friendly
Equipment (comma-separated, optional): mixing bowl, griddle, spatula
Recipe notes (optional): Don't overmix the batter

✅ Recipe 'Simple Pancakes' added successfully!
```

## Essential Commands

### Viewing Recipes
```bash
# Show detailed recipe
chefsire show "Simple Pancakes"

# List all recipes
chefsire list

# Filter by tags
chefsire list --tags breakfast,quick

# Filter by difficulty
chefsire list --difficulty beginner

# Filter by cooking time (under 30 minutes)
chefsire list --max-time 30
```

### Finding Recipes
```bash
# Search by name or ingredient
chefsire search chocolate
chefsire search pancakes
chefsire search flour
```

### Practical Features
```bash
# Generate shopping list
chefsire shopping "Simple Pancakes"

# View all tags
chefsire tags

# Delete a recipe
chefsire delete "Old Recipe"
```

## Data Storage

Chefsire1 stores your recipes in `~/.chefsire1/`:
- `recipes/` - Individual recipe files in YAML format
- `index.json` - Quick lookup index for filtering and searching

You can backup this directory to preserve your recipes, or use version control to track changes.

## Tips for Success

1. **Use descriptive names** - Make recipe names searchable and memorable
2. **Tag consistently** - Use consistent tags like "dinner", "vegetarian", "quick" for easy filtering
3. **Include equipment** - List required tools to help with meal planning
4. **Add notes** - Include tips, variations, or substitutions in the notes field
5. **Use proper units** - Be specific with measurements for consistent results

## Example Workflow

Here's a typical workflow for meal planning:

```bash
# Find quick dinner recipes
chefsire list --tags dinner --max-time 30

# Get details for a specific recipe
chefsire show "Spaghetti Carbonara"

# Generate shopping list
chefsire shopping "Spaghetti Carbonara"

# Find recipes using ingredients you have
chefsire search pasta
chefsire search chicken
```

## Next Steps

- Check out the [API documentation](api.md) for programmatic usage
- See [examples/sample_recipes.py](../examples/sample_recipes.py) for more recipe ideas
- Explore advanced filtering and search features