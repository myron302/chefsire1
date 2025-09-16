import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Story } from '@chefsire/shared';
import RecipeCard from '../components/RecipeCard';

const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [recipesRes, storiesRes] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/stories')
        ]);

        const recipesData = await recipesRes.json();
        const storiesData = await storiesRes.json();

        if (recipesData.success) {
          setFeaturedRecipes(recipesData.data.slice(0, 3));
        }
        if (storiesData.success) {
          setRecentStories(storiesData.data.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🍳</div>
        <p>Loading delicious content...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="text-primary">Chefsire</span>
            </h1>
            <p className="hero-subtitle">
              Discover amazing recipes, share your culinary stories, and connect with food lovers around the world.
            </p>
            <div className="hero-actions">
              <Link to="/recipes" className="btn btn-primary">
                Explore Recipes
              </Link>
              <Link to="/recipes" className="btn btn-outline">
                Share Your Recipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Recipes</h2>
            <Link to="/recipes" className="section-link">
              View All →
            </Link>
          </div>
          
          {featuredRecipes.length > 0 ? (
            <div className="recipes-grid">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured recipes yet. Be the first to share one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Stories */}
      <section className="stories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Stories</h2>
            <Link to="/stories" className="section-link">
              View All →
            </Link>
          </div>
          
          {recentStories.length > 0 ? (
            <div className="stories-grid">
              {recentStories.map((story) => (
                <article key={story.id} className="story-card">
                  {story.imageUrl && (
                    <img src={story.imageUrl} alt={story.title} className="story-image" />
                  )}
                  <div className="story-content">
                    <h3 className="story-title">{story.title}</h3>
                    <p className="story-excerpt">
                      {story.content.substring(0, 150)}...
                    </p>
                    <div className="story-meta">
                      <span className="story-author">by {story.author?.displayName}</span>
                      <span className="story-date">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No stories yet. Share your culinary journey!</p>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
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
        
        .hero {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          padding: var(--space-12) 0;
          text-align: center;
        }
        
        .hero-content {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .hero-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--space-4);
        }
        
        .hero-subtitle {
          font-size: var(--font-size-lg);
          margin-bottom: var(--space-8);
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .hero-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .featured-section,
        .stories-section {
          padding: var(--space-12) 0;
        }
        
        .stories-section {
          background-color: var(--surface);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }
        
        .section-title {
          font-size: var(--font-size-2xl);
          font-weight: 600;
          color: var(--text-dark);
        }
        
        .section-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .section-link:hover {
          color: var(--primary-light);
        }
        
        .recipes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        
        .stories-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        
        .story-card {
          background-color: var(--background);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease;
        }
        
        .story-card:hover {
          box-shadow: var(--shadow-md);
        }
        
        .story-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .story-content {
          padding: var(--space-6);
        }
        
        .story-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          margin-bottom: var(--space-3);
          color: var(--text-dark);
        }
        
        .story-excerpt {
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: var(--space-4);
        }
        
        .story-meta {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
          color: var(--text-light);
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-12);
          color: var(--text-light);
        }
        
        @media (min-width: 640px) {
          .recipes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .recipes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .hero-title {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;