'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        currentPath={pathname} 
        onMenuClick={handleMenuClick}
      />
      
      <div className="main-content">
        <div className="content-wrapper">
          {title && (
            <div className="page-header">
              <h1 className="page-title">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .main-content {
          flex: 1;
          margin-left: 240px;
          min-height: 100vh;
          background: #f8f9fa;
          transition: margin-left 0.3s ease;
        }

        .content-wrapper {
          padding: 0;
          max-width: none;
          margin: 0;
        }

        .page-header {
          background: white;
          padding: 24px 32px;
          border-bottom: 1px solid #e1e5e9;
          margin-bottom: 0;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #323338;
          margin: 0;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }

          .sidebar.sidebar-open + .main-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;