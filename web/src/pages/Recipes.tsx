import { useState, useEffect } from 'react';
import { Recipe } from '@chefsire/shared';
import RecipeCard from '../components/RecipeCard';

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        
        if (data.success) {
          setRecipes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🍳</div>
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="recipes-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Recipes</h1>
          <p className="page-subtitle">
            Discover and share amazing recipes from our community
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search recipes, ingredients, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-container">
            <label htmlFor="difficulty-filter" className="filter-label">
              Difficulty:
            </label>
            <select
              id="difficulty-filter"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p className="results-text">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="recipes-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3 className="empty-title">No recipes found</h3>
            <p className="empty-description">
              {searchTerm || selectedDifficulty !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Be the first to share a recipe with our community!'}
            </p>
            <button className="btn btn-primary">
              Share a Recipe
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default Recipes;