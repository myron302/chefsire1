import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Recipe } from '@chefsire/shared';

// Local utility function
const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/recipes/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setRecipe(data.data);
        } else {
          setError(data.error || 'Recipe not found');
        }
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🍳</div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="error-container">
        <div className="error-icon">😞</div>
        <h2 className="error-title">Recipe Not Found</h2>
        <p className="error-description">{error || 'The recipe you are looking for does not exist.'}</p>
        <Link to="/recipes" className="btn btn-primary">
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to="/recipes" className="breadcrumb-link">Recipes</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{recipe.title}</span>
        </nav>

        {/* Recipe Header */}
        <div className="recipe-header">
          {recipe.imageUrl && (
            <div className="recipe-image-container">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="recipe-image"
              />
            </div>
          )}
          
          <div className="recipe-info">
            <h1 className="recipe-title">{recipe.title}</h1>
            <p className="recipe-description">{recipe.description}</p>
            
            <div className="recipe-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <div className="meta-content">
                  <span className="meta-label">Cooking Time</span>
                  <span className="meta-value">{formatCookingTime(recipe.cookingTime)}</span>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">👥</span>
                <div className="meta-content">
                  <span className="meta-label">Servings</span>
                  <span className="meta-value">{recipe.servings}</span>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon">📊</span>
                <div className="meta-content">
                  <span className="meta-label">Difficulty</span>
                  <span className={`meta-value difficulty-${recipe.difficulty}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {recipe.tags.length > 0 && (
              <div className="recipe-tags">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {recipe.author && (
              <div className="recipe-author">
                <span className="author-text">
                  Recipe by <strong>{recipe.author.displayName}</strong>
                </span>
                <span className="author-date">
                  Added on {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <div className="recipe-content">
          {/* Ingredients */}
          <div className="recipe-section">
            <h2 className="section-title">
              <span className="section-icon">🛒</span>
              Ingredients
            </h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="ingredient-item">
                  <span className="ingredient-amount">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                  <span className="ingredient-name">{ingredient.name}</span>
                  {ingredient.notes && (
                    <span className="ingredient-notes">({ingredient.notes})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="recipe-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Instructions
            </h2>
            <ol className="instructions-list">
              {recipe.steps.map((step) => (
                <li key={step.id} className="instruction-item">
                  <div className="step-number">{step.stepNumber}</div>
                  <div className="step-content">
                    <p className="step-instruction">{step.instruction}</p>
                    {step.duration && (
                      <span className="step-duration">
                        ⏱️ {formatCookingTime(step.duration)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>


    </div>
  );
};

export default RecipeDetail;