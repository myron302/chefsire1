import { Link } from 'react-router-dom';
import { Recipe } from '@chefsire/shared';

interface RecipeCardProps {
  recipe: Recipe;
}

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

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe.id}`} className="card recipe-card">
      <div className="recipe-image-container">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="recipe-image"
          />
        ) : (
          <div className="recipe-image-placeholder">
            <span className="placeholder-icon">🍳</span>
          </div>
        )}
        <div className="recipe-difficulty">
          <span className={`difficulty-badge ${recipe.difficulty}`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        <p className="text-muted mb-4">{recipe.description}</p>
        
        <div className="flex mb-4" style={{gap: 'var(--space-4)'}}>
          <div className="flex items-center" style={{gap: 'var(--space-1)'}}>
            <span>⏱️</span>
            <span className="text-sm text-muted">{formatCookingTime(recipe.cookingTime)}</span>
          </div>
          <div className="flex items-center" style={{gap: 'var(--space-1)'}}>
            <span>👥</span>
            <span className="text-sm text-muted">{recipe.servings} servings</span>
          </div>
        </div>
        
        {recipe.tags.length > 0 && (
          <div className="mb-4" style={{display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)'}}>
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="tag-more">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}
        
        {recipe.author && (
          <div style={{borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)'}}>
            <span className="text-sm text-muted">by {recipe.author.displayName}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;