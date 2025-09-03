import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentPath?: string;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  onNavigate?: (path: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  subtitle,
  currentPath,
  user,
  onNavigate
}) => {
  return (
    <div className="app-layout">
      <Sidebar 
        currentPath={currentPath}
        onMenuClick={onNavigate}
      />
      
      <div className="main-content">
        <Header 
          title={title}
          subtitle={subtitle}
          user={user}
        />
        
        <div className="content-area">
          <div className="content-container">
            {children}
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f5f6f8;
          color: #323338;
          line-height: 1.5;
        }

        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 240px;
          transition: margin-left 0.3s ease;
        }

        .content-area {
          margin-top: 64px;
          min-height: calc(100vh - 64px);
          background: #f5f6f8;
        }

        .content-container {
          padding: 24px;
          max-width: 100%;
        }

        /* Monday.com inspired button styles */
        .btn-monday {
          background: #0085ff;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-monday:hover {
          background: #0073e6;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 133, 255, 0.3);
        }

        .btn-monday-secondary {
          background: transparent;
          border: 1px solid #d0d4d9;
          color: #323338;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-monday-secondary:hover {
          border-color: #0085ff;
          color: #0085ff;
        }

        /* Monday.com inspired card styles */
        .monday-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          border: 1px solid #e1e5e9;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }

        .monday-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .monday-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .monday-card-body {
          padding: 20px;
        }

        .monday-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        /* Status badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge-success {
          background: #00ca72;
          color: white;
        }

        .status-badge-warning {
          background: #ffcb00;
          color: #323338;
        }

        .status-badge-info {
          background: #0085ff;
          color: white;
        }

        .status-badge-secondary {
          background: #676879;
          color: white;
        }

        /* Form styles */
        .monday-form-group {
          margin-bottom: 20px;
        }

        .monday-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #323338;
          margin-bottom: 6px;
        }

        .monday-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          background: white !important;
          color: #323338 !important;
          -webkit-text-fill-color: #323338 !important;
          -webkit-appearance: none;
        }

        .monday-input:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.1);
          background: white !important;
          color: #323338 !important;
        }

        .monday-input:-webkit-autofill,
        .monday-input:-webkit-autofill:hover,
        .monday-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #323338 !important;
          background-color: white !important;
        }

        .monday-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .monday-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          font-size: 14px;
          background: white !important;
          color: #323338 !important;
          cursor: pointer;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .monday-select:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.1);
        }

        /* Grid system */
        .monday-grid {
          display: grid;
          gap: 20px;
        }

        .monday-grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .monday-grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .monday-grid-4 {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }

          .content-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;