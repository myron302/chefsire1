"""Recipe management functionality for chefsire1."""

import json
import yaml
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

from .models import Recipe


class RecipeManager:
    """Manages recipe storage, retrieval, and operations."""
    
    def __init__(self, data_dir: Optional[Path] = None):
        """Initialize the recipe manager.
        
        Args:
            data_dir: Directory to store recipe data. Defaults to ~/.chefsire1/
        """
        if data_dir is None:
            data_dir = Path.home() / ".chefsire1"
        
        self.data_dir = Path(data_dir)
        self.recipes_dir = self.data_dir / "recipes"
        self.recipes_dir.mkdir(parents=True, exist_ok=True)
        
        # Index file for quick recipe lookup
        self.index_file = self.data_dir / "index.json"
        self._index = self._load_index()
    
    def _load_index(self) -> Dict[str, Dict[str, Any]]:
        """Load the recipe index."""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        return {}
    
    def _save_index(self) -> None:
        """Save the recipe index."""
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump(self._index, f, indent=2, ensure_ascii=False)
    
    def _convert_enums_to_values(self, data):
        """Recursively convert enum objects to their values in a dictionary."""
        if isinstance(data, dict):
            for key, value in data.items():
                if hasattr(value, 'value'):  # It's an enum
                    data[key] = value.value
                elif isinstance(value, (dict, list)):
                    self._convert_enums_to_values(value)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if hasattr(item, 'value'):  # It's an enum
                    data[i] = item.value
                elif isinstance(item, (dict, list)):
                    self._convert_enums_to_values(item)
    
    def _recipe_filename(self, recipe_name: str) -> str:
        """Generate a safe filename for a recipe."""
        # Replace problematic characters with underscores
        safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in recipe_name)
        safe_name = "_".join(safe_name.split())  # Replace spaces with underscores
        return f"{safe_name.lower()}.yaml"
    
    def add_recipe(self, recipe: Recipe) -> None:
        """Add a new recipe to the collection.
        
        Args:
            recipe: Recipe to add
            
        Raises:
            ValueError: If recipe with same name already exists
        """
        if recipe.name in self._index:
            raise ValueError(f"Recipe '{recipe.name}' already exists")
        
        # Add creation timestamp if not set
        if recipe.created_at is None:
            recipe.created_at = datetime.now().isoformat()
        
        # Save recipe to file
        filename = self._recipe_filename(recipe.name)
        recipe_path = self.recipes_dir / filename
        
        # Convert recipe to dict and handle enums properly
        recipe_data = recipe.dict()
        self._convert_enums_to_values(recipe_data)
        
        with open(recipe_path, 'w', encoding='utf-8') as f:
            yaml.dump(recipe_data, f, default_flow_style=False, allow_unicode=True)
        
        # Update index
        self._index[recipe.name] = {
            "filename": filename,
            "tags": recipe.tags,
            "difficulty": recipe.difficulty.value,
            "prep_time_minutes": recipe.prep_time_minutes,
            "cook_time_minutes": recipe.cook_time_minutes,
            "servings": recipe.servings,
            "created_at": recipe.created_at,
            "author": recipe.author,
        }
        self._save_index()
    
    def get_recipe(self, name: str) -> Optional[Recipe]:
        """Get a recipe by name.
        
        Args:
            name: Name of the recipe
            
        Returns:
            Recipe if found, None otherwise
        """
        if name not in self._index:
            return None
        
        filename = self._index[name]["filename"]
        recipe_path = self.recipes_dir / filename
        
        if not recipe_path.exists():
            # Clean up broken index entry
            del self._index[name]
            self._save_index()
            return None
        
        try:
            with open(recipe_path, 'r', encoding='utf-8') as f:
                recipe_data = yaml.safe_load(f)
            return Recipe(**recipe_data)
        except (yaml.YAMLError, ValueError, IOError):
            return None
    
    def list_recipes(self, tags: Optional[List[str]] = None, 
                     difficulty: Optional[str] = None,
                     max_time: Optional[int] = None) -> List[str]:
        """List recipe names with optional filtering.
        
        Args:
            tags: Filter by tags (recipe must have at least one matching tag)
            difficulty: Filter by difficulty level
            max_time: Filter by maximum total cooking time
            
        Returns:
            List of recipe names matching the criteria
        """
        results = []
        
        for name, info in self._index.items():
            # Filter by tags
            if tags and not any(tag in info.get("tags", []) for tag in tags):
                continue
            
            # Filter by difficulty
            if difficulty and info.get("difficulty") != difficulty:
                continue
            
            # Filter by time
            if max_time is not None:
                total_time = info.get("prep_time_minutes", 0) + info.get("cook_time_minutes", 0)
                if total_time > max_time:
                    continue
            
            results.append(name)
        
        return sorted(results)
    
    def delete_recipe(self, name: str) -> bool:
        """Delete a recipe.
        
        Args:
            name: Name of the recipe to delete
            
        Returns:
            True if recipe was deleted, False if not found
        """
        if name not in self._index:
            return False
        
        filename = self._index[name]["filename"]
        recipe_path = self.recipes_dir / filename
        
        # Remove file if it exists
        if recipe_path.exists():
            recipe_path.unlink()
        
        # Remove from index
        del self._index[name]
        self._save_index()
        
        return True
    
    def update_recipe(self, name: str, recipe: Recipe) -> bool:
        """Update an existing recipe.
        
        Args:
            name: Current name of the recipe
            recipe: Updated recipe data
            
        Returns:
            True if recipe was updated, False if not found
        """
        if name not in self._index:
            return False
        
        # If name changed, we need to handle the rename
        if name != recipe.name:
            # Check if new name conflicts
            if recipe.name in self._index:
                raise ValueError(f"Recipe '{recipe.name}' already exists")
            
            # Delete old recipe
            self.delete_recipe(name)
            # Add with new name
            self.add_recipe(recipe)
        else:
            # Update in place
            filename = self._recipe_filename(recipe.name)
            recipe_path = self.recipes_dir / filename
            
            # Convert recipe to dict and handle enums properly
            recipe_data = recipe.dict()
            self._convert_enums_to_values(recipe_data)
            
            with open(recipe_path, 'w', encoding='utf-8') as f:
                yaml.dump(recipe_data, f, default_flow_style=False, allow_unicode=True)
            
            # Update index
            self._index[recipe.name] = {
                "filename": filename,
                "tags": recipe.tags,
                "difficulty": recipe.difficulty.value,
                "prep_time_minutes": recipe.prep_time_minutes,
                "cook_time_minutes": recipe.cook_time_minutes,
                "servings": recipe.servings,
                "created_at": recipe.created_at,
                "author": recipe.author,
            }
            self._save_index()
        
        return True
    
    def get_all_tags(self) -> List[str]:
        """Get all unique tags from all recipes."""
        all_tags = set()
        for info in self._index.values():
            all_tags.update(info.get("tags", []))
        return sorted(list(all_tags))
    
    def search_recipes(self, query: str) -> List[str]:
        """Search recipes by name, tags, or ingredients.
        
        Args:
            query: Search query
            
        Returns:
            List of matching recipe names
        """
        query = query.lower()
        results = []
        
        for name in self._index:
            # Search in name
            if query in name.lower():
                results.append(name)
                continue
            
            # Search in tags
            info = self._index[name]
            if any(query in tag.lower() for tag in info.get("tags", [])):
                results.append(name)
                continue
            
            # Search in ingredients (requires loading the recipe)
            recipe = self.get_recipe(name)
            if recipe:
                for ingredient in recipe.ingredients:
                    if query in ingredient.name.lower():
                        results.append(name)
                        break
        
        return sorted(list(set(results)))  # Remove duplicates and sort
    
    def export_recipe(self, name: str, format: str = "yaml") -> Optional[str]:
        """Export a recipe in the specified format.
        
        Args:
            name: Name of the recipe
            format: Export format ("yaml" or "json")
            
        Returns:
            Recipe data as string, or None if recipe not found
        """
        recipe = self.get_recipe(name)
        if not recipe:
            return None
        
        if format.lower() == "json":
            return json.dumps(recipe.dict(), indent=2, ensure_ascii=False)
        else:  # yaml
            return yaml.dump(recipe.dict(), default_flow_style=False, allow_unicode=True)
    
    def import_recipe(self, data: str, format: str = "yaml") -> Recipe:
        """Import a recipe from string data.
        
        Args:
            data: Recipe data as string
            format: Data format ("yaml" or "json")
            
        Returns:
            Recipe object
            
        Raises:
            ValueError: If data is invalid
        """
        try:
            if format.lower() == "json":
                recipe_data = json.loads(data)
            else:  # yaml
                recipe_data = yaml.safe_load(data)
            
            return Recipe(**recipe_data)
        except (json.JSONDecodeError, yaml.YAMLError, ValueError) as e:
            raise ValueError(f"Invalid recipe data: {e}")