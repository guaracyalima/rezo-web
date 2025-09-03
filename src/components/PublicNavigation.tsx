'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicNavigation() {
  return (
    <nav className="public-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/" className="brand-link">
            🏠 Rezo Web
          </Link>
        </div>
        
        <div className="nav-links">
          <Link href="/houses" className="nav-link">
            🏠 Casas
          </Link>
          <Link href="/events" className="nav-link">
            📅 Eventos
          </Link>
          <Link href="/products" className="nav-link">
            🛍️ Produtos
          </Link>
          <Link href="/services" className="nav-link">
            🔮 Serviços
          </Link>
          <Link href="/dashboard" className="nav-link">
            🔐 Dashboard
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .public-nav {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        .brand-link {
          font-size: 24px;
          font-weight: 700;
          color: #323338;
          text-decoration: none;
        }

        .brand-link:hover {
          color: #0085ff;
        }

        .nav-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .nav-link {
          color: #676879;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #0085ff;
          background: #f8f9fa;
        }

        @media (max-width: 768px) {
          .nav-links {
            gap: 12px;
          }

          .nav-link {
            padding: 6px 12px;
            font-size: 14px;
          }

          .brand-link {
            font-size: 20px;
          }
        }
      `}</style>
    </nav>
  );
}