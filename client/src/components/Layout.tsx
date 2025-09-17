import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="layout">
    <header>
      <img src={require('../assets/logo.png')} alt="ChefSire Logo" style={{height:40}} />
      <nav>
        {/* Add nav links here */}
      </nav>
    </header>
    <main>{children}</main>
    <footer>Copyright &copy; ChefSire</footer>
  </div>
);

export default Layout;