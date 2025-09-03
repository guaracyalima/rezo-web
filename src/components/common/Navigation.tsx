import React from 'react';

interface NavigationProps {
  currentPath?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <a className="navbar-brand fw-bold" href="/">
          🏠 Rezo Web
        </a>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPath === '/houses' ? 'active' : ''}`} 
                href="/houses"
              >
                Casas Públicas
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPath === '/dashboard/houses' ? 'active' : ''}`} 
                href="/dashboard/houses"
              >
                Minhas Casas
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPath === '/test-houses' ? 'active' : ''}`} 
                href="/test-houses"
              >
                Test Page
              </a>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                👤 Usuário
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/profile">Perfil</a></li>
                <li><a className="dropdown-item" href="/settings">Configurações</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="/logout">Sair</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;