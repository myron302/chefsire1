import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Recipe, Story } from '@chefsire/shared';
import RecipeCard from '../components/RecipeCard';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'stories'>('recipes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // For now, we'll use the first user as the "logged in" user
        const [userRes, recipesRes, storiesRes] = await Promise.all([
          fetch('/api/users/1'),
          fetch('/api/recipes'),
          fetch('/api/stories')
        ]);

        const userData = await userRes.json();
        const recipesData = await recipesRes.json();
        const storiesData = await storiesRes.json();

        if (userData.success) {
          setUser(userData.data);
        }

        if (recipesData.success) {
          // Filter recipes by the current user
          const filteredRecipes = recipesData.data.filter(
            (recipe: Recipe) => recipe.authorId === userData.data?.id
          );
          setUserRecipes(filteredRecipes);
        }

        if (storiesData.success) {
          // Filter stories by the current user
          const filteredStories = storiesData.data.filter(
            (story: Story) => story.authorId === userData.data?.id
          );
          setUserStories(filteredStories);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">👤</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <div className="error-icon">😞</div>
        <h2 className="error-title">Profile Not Found</h2>
        <p className="error-description">Unable to load user profile.</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <span className="avatar-icon">👤</span>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-username">@{user.username}</p>
            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{userRecipes.length}</span>
                <span className="stat-label">Recipes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStories.length}</span>
                <span className="stat-label">Stories</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {new Date(user.createdAt).getFullYear()}
                </span>
                <span className="stat-label">Joined</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn btn-primary">
                Edit Profile
              </button>
              <button className="btn btn-outline">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="content-section">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => setActiveTab('recipes')}
            >
              <span className="tab-icon">📖</span>
              <span className="tab-label">My Recipes ({userRecipes.length})</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'stories' ? 'active' : ''}`}
              onClick={() => setActiveTab('stories')}
            >
              <span className="tab-icon">📝</span>
              <span className="tab-label">My Stories ({userStories.length})</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'recipes' && (
              <div className="recipes-tab">
                {userRecipes.length > 0 ? (
                  <div className="recipes-grid">
                    {userRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📖</div>
                    <h3 className="empty-title">No recipes yet</h3>
                    <p className="empty-description">
                      Share your first recipe with the community!
                    </p>
                    <button className="btn btn-primary">
                      Create Recipe
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="stories-tab">
                {userStories.length > 0 ? (
                  <div className="stories-grid">
                    {userStories.map((story) => (
                      <article key={story.id} className="story-card">
                        {story.imageUrl && (
                          <img
                            src={story.imageUrl}
                            alt={story.title}
                            className="story-image"
                          />
                        )}
                        <div className="story-content">
                          <h3 className="story-title">{story.title}</h3>
                          <p className="story-excerpt">
                            {story.content.substring(0, 150)}...
                          </p>
                          <div className="story-meta">
                            <span className="story-date">
                              {new Date(story.createdAt).toLocaleDateString()}
                            </span>
                            {story.recipe && (
                              <Link to={`/recipes/${story.recipe.id}`} className="story-recipe-link">
                                Recipe: {story.recipe.title}
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3 className="empty-title">No stories yet</h3>
                    <p className="empty-description">
                      Share your culinary journey and experiences!
                    </p>
                    <button className="btn btn-primary">
                      Write Story
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          padding: var(--space-8) 0;
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
        
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-12);
          padding: var(--space-8);
          background-color: var(--surface);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        
        .profile-avatar-container {
          position: relative;
        }
        
        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--primary);
        }
        
        .profile-avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid var(--primary);
        }
        
        .avatar-icon {
          font-size: 3rem;
          color: white;
        }
        
        .profile-name {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: var(--space-2);
        }
        
        .profile-username {
          font-size: var(--font-size-lg);
          color: var(--primary);
          margin-bottom: var(--space-4);
        }
        
        .profile-bio {
          color: var(--text-light);
          line-height: 1.6;
          max-width: 500px;
          margin-bottom: var(--space-6);
        }
        
        .profile-stats {
          display: flex;
          gap: var(--space-8);
          margin-bottom: var(--space-6);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }
        
        .stat-number {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--primary);
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .profile-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .content-section {
          background-color: var(--background);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        
        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border);
          background-color: var(--surface);
        }
        
        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-light);
          font-size: var(--font-size-sm);
        }
        
        .tab-button:hover,
        .tab-button.active {
          background-color: var(--background);
          color: var(--primary);
        }
        
        .tab-button.active {
          border-bottom: 2px solid var(--primary);
        }
        
        .tab-icon {
          font-size: var(--font-size-base);
        }
        
        .tab-content {
          padding: var(--space-8);
        }
        
        .recipes-grid,
        .stories-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }
        
        .story-card {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
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
          color: var(--text-dark);
          margin-bottom: var(--space-3);
        }
        
        .story-excerpt {
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: var(--space-4);
        }
        
        .story-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-size-sm);
        }
        
        .story-date {
          color: var(--text-light);
        }
        
        .story-recipe-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
        
        .story-recipe-link:hover {
          text-decoration: underline;
        }
        
        .empty-state {
          text-align: center;
          padding: var(--space-12);
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-4);
          color: var(--text-light);
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
          .profile-header {
            flex-direction: row;
            text-align: left;
          }
          
          .recipes-grid,
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .tab-button {
            flex-direction: row;
            font-size: var(--font-size-base);
          }
        }
        
        @media (min-width: 1024px) {
          .recipes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;