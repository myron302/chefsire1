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

      <style jsx>{`
        .recipes-page {
          min-height: 100vh;
          padding: var(--space-8) 0;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: var(--space-4);
        }
        
        .loading-spinner {
          font-size: var(--font-size-3xl);
          animation: spin 2s linear infinite;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }
        
        .page-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: var(--space-4);
        }
        
        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-light);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .filters-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          padding: var(--space-6);
          background-color: var(--surface);
          border-radius: var(--radius-lg);
        }
        
        .search-container {
          flex: 1;
        }
        
        .search-input-wrapper {
          position: relative;
          width: 100%;
        }
        
        .search-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }
        
        .search-input {
          width: 100%;
          padding: var(--space-3) var(--space-4) var(--space-3) var(--space-12);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: var(--font-size-base);
          background-color: var(--background);
          transition: border-color 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .filter-container {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .filter-label {
          font-weight: 500;
          color: var(--text-dark);
          white-space: nowrap;
        }
        
        .filter-select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background-color: var(--background);
          font-size: var(--font-size-sm);
        }
        
        .results-summary {
          margin-bottom: var(--space-6);
        }
        
        .results-text {
          color: var(--text-light);
          font-size: var(--font-size-sm);
        }
        
        .recipes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-12);
          background-color: var(--surface);
          border-radius: var(--radius-lg);
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-4);
        }
        
        .empty-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--space-3);
        }
        
        .empty-description {
          color: var(--text-light);
          margin-bottom: var(--space-6);
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (min-width: 640px) {
          .filters-section {
            flex-direction: row;
            align-items: end;
          }
          
          .recipes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .recipes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Recipes;