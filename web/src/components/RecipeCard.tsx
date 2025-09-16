import { Link } from 'react-router-dom';
import { Recipe } from '@chefsire/shared';
import { formatCookingTime } from '@chefsire/shared';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
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
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        
        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span className="meta-text">{formatCookingTime(recipe.cookingTime)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">{recipe.servings} servings</span>
          </div>
        </div>
        
        {recipe.tags.length > 0 && (
          <div className="recipe-tags">
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
          <div className="recipe-author">
            <span className="author-text">by {recipe.author.displayName}</span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .recipe-card {
          display: block;
          background-color: var(--background);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }
        
        .recipe-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .recipe-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        
        .recipe-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .recipe-image-placeholder {
          width: 100%;
          height: 100%;
          background-color: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .placeholder-icon {
          font-size: var(--font-size-3xl);
          color: var(--text-light);
        }
        
        .recipe-difficulty {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
        }
        
        .difficulty-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius);
          font-size: var(--font-size-xs);
          font-weight: 500;
          text-transform: capitalize;
          color: white;
        }
        
        .difficulty-badge.easy {
          background-color: #10b981;
        }
        
        .difficulty-badge.medium {
          background-color: var(--secondary);
        }
        
        .difficulty-badge.hard {
          background-color: var(--accent);
        }
        
        .recipe-content {
          padding: var(--space-6);
        }
        
        .recipe-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--text-dark);
        }
        
        .recipe-description {
          color: var(--text-light);
          margin-bottom: var(--space-4);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .recipe-meta {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        
        .meta-icon {
          font-size: var(--font-size-sm);
        }
        
        .meta-text {
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        
        .recipe-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        
        .tag {
          padding: var(--space-1) var(--space-2);
          background-color: var(--surface);
          color: var(--primary);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: 500;
        }
        
        .tag-more {
          padding: var(--space-1) var(--space-2);
          background-color: var(--border);
          color: var(--text-light);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
        }
        
        .recipe-author {
          border-top: 1px solid var(--border);
          padding-top: var(--space-3);
        }
        
        .author-text {
          font-size: var(--font-size-sm);
          color: var(--text-light);
          font-style: italic;
        }
      `}</style>
    </Link>
  );
};

export default RecipeCard;