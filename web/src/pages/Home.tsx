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


    </div>
  );
};

export default Home;