'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

// Simplified service interface
interface SimpleService {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  isOnline: boolean;
  isInPerson: boolean;
  images?: string[];
  houseId: string;
}

export default function ServicesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading services
      setTimeout(() => {
        setServices([]);
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Meus Atendimentos">
        <div className="services-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando atendimentos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meus Atendimentos">
      <div className="services-page">
        {/* Header Actions */}
        <div className="page-actions">
          <div className="actions">
            <button 
              onClick={() => window.location.href = '/dashboard/services/new'}
              className="btn-primary"
            >
              + Novo Atendimento
            </button>
          </div>
        </div>

        {/* Services Content */}
        <div className="services-content">
          {services.length === 0 ? (
            <div className="empty-services">
              <div className="empty-icon">🔮</div>
              <h3>Nenhum atendimento encontrado</h3>
              <p>Comece criando seu primeiro atendimento para oferecer seus serviços.</p>
              <button 
                onClick={() => window.location.href = '/dashboard/services/new'}
                className="btn-primary"
              >
                + Criar Primeiro Atendimento
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {/* Services will be mapped here */}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .services-page {
          background: #f8f9fa;
        }

        .page-actions {
          background: white;
          padding: 24px 32px;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
          background: #0085ff;
          color: white;
        }

        .btn-primary:hover {
          background: #0073e6;
        }

        .services-content {
          padding: 32px;
        }

        .loading-state, .empty-services {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 80px;
          opacity: 0.6;
        }

        .empty-services h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .empty-services p {
          color: #676879;
          max-width: 400px;
          line-height: 1.5;
          margin: 8px 0 24px 0;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .services-content {
            padding: 16px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}