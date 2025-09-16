import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Recipe } from '@chefsire/shared';
import { formatCookingTime } from '@chefsire/shared';

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

      <style jsx>{`
        .recipe-detail-page {
          min-height: 100vh;
          padding: var(--space-4) 0 var(--space-8);
        }
        
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: var(--space-4);
          text-align: center;
        }
        
        .loading-spinner {
          font-size: var(--font-size-3xl);
          animation: spin 2s linear infinite;
        }
        
        .error-icon {
          font-size: 4rem;
        }
        
        .error-title {
          font-size: var(--font-size-2xl);
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--space-2);
        }
        
        .error-description {
          color: var(--text-light);
          margin-bottom: var(--space-6);
        }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
          font-size: var(--font-size-sm);
        }
        
        .breadcrumb-link {
          color: var(--primary);
          text-decoration: none;
        }
        
        .breadcrumb-link:hover {
          text-decoration: underline;
        }
        
        .breadcrumb-separator {
          color: var(--text-light);
        }
        
        .breadcrumb-current {
          color: var(--text-light);
        }
        
        .recipe-header {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
          margin-bottom: var(--space-12);
        }
        
        .recipe-image-container {
          width: 100%;
          height: 300px;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .recipe-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .recipe-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: var(--space-4);
        }
        
        .recipe-description {
          font-size: var(--font-size-lg);
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: var(--space-6);
        }
        
        .recipe-meta {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background-color: var(--surface);
          border-radius: var(--radius);
        }
        
        .meta-icon {
          font-size: var(--font-size-xl);
        }
        
        .meta-content {
          display: flex;
          flex-direction: column;
        }
        
        .meta-label {
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        
        .meta-value {
          font-weight: 600;
          color: var(--text-dark);
        }
        
        .difficulty-easy { color: #10b981; }
        .difficulty-medium { color: var(--secondary); }
        .difficulty-hard { color: var(--accent); }
        
        .recipe-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
        }
        
        .tag {
          padding: var(--space-2) var(--space-3);
          background-color: var(--primary);
          color: white;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }
        
        .recipe-author {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }
        
        .author-text {
          color: var(--text-dark);
        }
        
        .author-date {
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        
        .recipe-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
        }
        
        .recipe-section {
          background-color: var(--background);
          border-radius: var(--radius-lg);
          padding: var(--space-8);
          border: 1px solid var(--border);
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-2xl);
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--space-6);
        }
        
        .section-icon {
          font-size: var(--font-size-xl);
        }
        
        .ingredients-list {
          list-style: none;
          display: grid;
          gap: var(--space-3);
        }
        
        .ingredient-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background-color: var(--surface);
          border-radius: var(--radius);
        }
        
        .ingredient-amount {
          font-weight: 600;
          color: var(--primary);
          min-width: 80px;
          font-size: var(--font-size-sm);
        }
        
        .ingredient-name {
          flex: 1;
          color: var(--text-dark);
        }
        
        .ingredient-notes {
          color: var(--text-light);
          font-style: italic;
          font-size: var(--font-size-sm);
        }
        
        .instructions-list {
          list-style: none;
          display: grid;
          gap: var(--space-6);
        }
        
        .instruction-item {
          display: flex;
          gap: var(--space-4);
        }
        
        .step-number {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background-color: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-instruction {
          color: var(--text-dark);
          line-height: 1.6;
          margin-bottom: var(--space-2);
        }
        
        .step-duration {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
          color: var(--text-light);
          background-color: var(--surface);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }
        
        @media (min-width: 768px) {
          .recipe-header {
            grid-template-columns: 1fr 1fr;
          }
          
          .recipe-image-container {
            height: 400px;
          }
          
          .recipe-meta {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .recipe-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (min-width: 1024px) {
          .recipe-title {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecipeDetail;