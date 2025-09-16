import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/recipes', label: 'Recipes', icon: '📖' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">👨‍🍳</span>
          <span className="brand-text">Chefsire</span>
        </Link>
        
        <div className="navbar-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--background);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          z-index: 1000;
        }
        
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-3) var(--space-4);
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          color: var(--primary);
          font-weight: 700;
          font-size: var(--font-size-xl);
        }
        
        .brand-icon {
          font-size: var(--font-size-2xl);
        }
        
        .navbar-menu {
          display: flex;
          gap: var(--space-2);
        }
        
        .navbar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          text-decoration: none;
          color: var(--text-light);
          border-radius: var(--radius);
          transition: all 0.2s ease;
          font-size: var(--font-size-xs);
        }
        
        .navbar-item:hover,
        .navbar-item.active {
          color: var(--primary);
          background-color: var(--surface);
        }
        
        .navbar-icon {
          font-size: var(--font-size-lg);
        }
        
        .navbar-label {
          font-weight: 500;
        }
        
        @media (min-width: 640px) {
          .navbar-item {
            flex-direction: row;
            font-size: var(--font-size-sm);
          }
          
          .navbar-icon {
            font-size: var(--font-size-base);
          }
        }
      `}</style>
    </nav>
  );
};

export default NavBar;