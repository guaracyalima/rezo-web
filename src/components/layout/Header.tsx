import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard', 
  subtitle,
  onNotificationClick
}) => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  const user = userProfile ? {
    name: userProfile.name,
    email: userProfile.email
  } : {
    name: 'Usuário',
    email: 'user@example.com'
  };
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-title-section">
            <h1 className="header-title">{title}</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            {/* Search */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="search-input"
                />
              </div>
            </div>

            {/* Notifications */}
            <button 
              className="header-action-btn"
              onClick={onNotificationClick}
            >
              <span className="action-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>

            {/* Help */}
            <button className="header-action-btn">
              <span className="action-icon">❓</span>
            </button>

            {/* User Menu */}
            <div className="user-menu" onClick={handleLogout}>
              <div className="user-avatar">
                <span className="avatar-initials">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .app-header {
          height: 64px;
          background: #ffffff;
          border-bottom: 1px solid #e1e5e9;
          position: fixed;
          top: 0;
          left: 240px;
          right: 0;
          z-index: 999;
          transition: left 0.3s ease;
        }

        .header-content {
          height: 100%;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-title-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .header-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 14px;
          color: #676879;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 280px;
          height: 36px;
          padding: 0 12px 0 36px;
          border: 1px solid #d0d4d9;
          border-radius: 8px;
          font-size: 14px;
          background: #f5f6f8;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #0085ff;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #676879;
          font-size: 14px;
          z-index: 1;
        }

        .header-action-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: background 0.2s ease;
        }

        .header-action-btn:hover {
          background: #f5f6f8;
        }

        .action-icon {
          font-size: 16px;
          color: #676879;
        }

        .notification-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #ff3838;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-left: 8px;
        }

        .user-menu:hover {
          background: #f5f6f8;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #0085ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #323338;
          line-height: 1;
        }

        .user-email {
          font-size: 12px;
          color: #676879;
          line-height: 1;
        }

        .dropdown-arrow {
          font-size: 10px;
          color: #676879;
          margin-left: 4px;
        }

        @media (max-width: 768px) {
          .app-header {
            left: 0;
          }

          .search-input {
            width: 200px;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;