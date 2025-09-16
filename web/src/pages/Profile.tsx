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


    </div>
  );
};

export default Profile;