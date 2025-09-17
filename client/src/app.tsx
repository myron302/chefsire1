import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header>
        <h1>Chefsire</h1>
        <p>Professional recipe sharing platform</p>
      </header>
      
      <main>
        <div style={{ marginTop: '40px' }}>
          <h2>Welcome to Chefsire</h2>
          <p>Your culinary journey starts here. Share recipes, discover new dishes, and connect with fellow food enthusiasts.</p>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => alert('API integration coming soon!')}
            >
              Get Started
            </button>
          </div>
        </div>
      </main>
      
      <footer style={{ marginTop: '60px', color: '#666' }}>
        <p>Built with modern web technologies for web and mobile.</p>
      </footer>
    </div>
  );
}

export default App;
