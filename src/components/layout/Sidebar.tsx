import React, { useState } from 'react';
import Link from 'next/link';

interface SidebarProps {
  currentPath?: string;
  onMenuClick?: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onMenuClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      icon: '🏠',
      label: 'Casas Públicas',
      path: '/houses',
      badge: null
    },
    {
      icon: '⚡',
      label: 'Dashboard',
      path: '/dashboard',
      badge: null
    },
    {
      icon: '🏢',
      label: 'Minhas Casas',
      path: '/dashboard/houses',
      badge: 'New'
    },
    {
      icon: '🔮',
      label: 'Atendimentos',
      path: '/dashboard/services',
      badge: null
    },
    {
      icon: '📅',
      label: 'Agendamentos',
      path: '/dashboard/bookings',
      badge: null
    },
    {
      icon: '⏰',
      label: 'Horários',
      path: '/dashboard/availability',
      badge: null
    },
    {
      icon: '🎪',
      label: 'Eventos',
      path: '/dashboard/events',
      badge: null
    },
    {
      icon: '🛍️',
      label: 'Lojinha',
      path: '/dashboard/shop',
      badge: null
    },
    {
      icon: '📊',
      label: 'Relatórios',
      path: '/dashboard/reports',
      badge: null
    }
  ];

  const bottomMenuItems = [
    {
      icon: '⚙️',
      label: 'Configurações',
      path: '/settings',
      badge: null
    },
    {
      icon: '❓',
      label: 'Ajuda',
      path: '/help',
      badge: null
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="sidebar-logo">
            <span className="logo-icon">🕉️</span>
            {!collapsed && <span className="logo-text">Rezo Web</span>}
          </div>
          <button 
            className="btn btn-link sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-menu">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`sidebar-menu-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onMenuClick?.(item.path);
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="menu-label">{item.label}</span>
                    {item.badge && (
                      <span className="badge bg-primary ms-auto">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="sidebar-section mt-auto">
          <div className="sidebar-menu">
            {bottomMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`sidebar-menu-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onMenuClick?.(item.path);
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 240px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #ddd4e7;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          transition: width 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .sidebar-collapsed {
          width: 64px;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid #eaedf3;
          min-height: 72px;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .logo-icon {
          font-size: 28px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }

        .sidebar-toggle {
          padding: 8px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .sidebar-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          background: #fafbfc;
        }

        .sidebar-section {
          padding: 0 12px;
        }

        .sidebar-section:not(:last-child) {
          margin-bottom: 24px;
        }

        .sidebar-menu-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin: 2px 0;
          border-radius: 8px;
          text-decoration: none;
          color: #676879;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          position: relative;
          border: 1px solid transparent;
        }

        .sidebar-menu-item:hover {
          background: #f5f6f8;
          color: #323338;
          border-color: #d0d4d9;
          transform: translateY(-1px);
        }

        .sidebar-menu-item.active {
          background: linear-gradient(135deg, #0085ff 0%, #0073e6 100%);
          color: white;
          border-color: #0085ff;
          box-shadow: 0 2px 8px rgba(0, 133, 255, 0.3);
        }

        .sidebar-menu-item.active:hover {
          background: linear-gradient(135deg, #0073e6 0%, #0066cc 100%);
          transform: translateY(-1px);
        }

        .menu-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 18px;
          border-radius: 4px;
          background: rgba(103, 120, 121, 0.1);
          transition: all 0.2s ease;
        }

        .sidebar-menu-item.active .menu-icon {
          background: rgba(255, 255, 255, 0.15);
        }

        .menu-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        .badge {
          background: #ff6b35;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }

        .sidebar-menu-item.active .badge {
          background: rgba(255, 255, 255, 0.2);
        }

        .mt-auto {
          margin-top: auto;
        }

        .d-flex {
          display: flex;
        }

        .align-items-center {
          align-items: center;
        }

        .btn {
          cursor: pointer;
        }

        .btn-link {
          background: none;
          border: none;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;