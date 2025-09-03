'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { Service, getServicesByProvider } from '../../../services/servicesService';
import { getHousesByOwner, House } from '../../../services/housesService';
import ServiceFormSteps from '../../../components/dashboard/services/ServiceFormSteps';

export default function ServicesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouseId, setSelectedHouseId] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user houses
      const userHouses = await getHousesByOwner(user!.uid);
      setHouses(userHouses);
      
      // Load services for all houses
      const allServices: Service[] = [];
      for (const house of userHouses) {
        try {
          const houseServices = await getServicesByProvider(user!.uid);
          const filteredServices = houseServices.filter(service => service.houseId === house.id);
          allServices.push(...filteredServices);
        } catch (error) {
          console.error('Error loading services for house:', house.id, error);
        }
      }
      
      setServices(allServices);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar dados',
        message: 'Não foi possível carregar seus serviços'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedHouseId === 'all' 
    ? services 
    : services.filter(service => service.houseId === selectedHouseId);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getHouseName = (houseId: string) => {
    const house = houses.find(h => h.id === houseId);
    return house?.name || 'Casa não encontrada';
  };

  const handleServiceSaved = () => {
    setShowCreateModal(false);
    loadUserData(); // Reload services after creating/updating
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

  if (houses.length === 0) {
    return (
      <DashboardLayout title="Meus Atendimentos">
        <div className="services-page">
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Nenhuma casa encontrada</h3>
            <p>Você precisa ter pelo menos uma casa registrada para criar atendimentos.</p>
            <a href="/dashboard/houses" className="btn-primary">
              Cadastrar Casa
            </a>
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
          <div className="filters">
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              className="house-filter"
            >
              <option value="all">Todas as casas</option>
              {houses.map(house => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="actions">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Novo Atendimento
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-content">
          {filteredServices.length === 0 ? (
            <div className="empty-services">
              <div className="empty-icon">🔮</div>
              <h3>Nenhum atendimento encontrado</h3>
              <p>Comece criando seu primeiro atendimento para oferecer seus serviços.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                + Criar Primeiro Atendimento
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <div className="service-image">
                      {service.images?.[0] ? (
                        <img src={service.images[0]} alt={service.title} />
                      ) : (
                        <div className="image-placeholder">🔮</div>
                      )}
                    </div>
                    
                    <div className={`service-status ${service.isActive ? 'active' : 'inactive'}`}>
                      {service.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                  
                  <div className="service-content">
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">
                      {service.shortDescription || service.description}
                    </p>
                    
                    <div className="service-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🏠</span>
                        <span className="meta-text">{getHouseName(service.houseId)}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-icon">💰</span>
                        <span className="meta-text">{formatPrice(service.basePrice)}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span className="meta-text">{service.duration} min</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span className="meta-text">
                          {service.isOnline && service.isInPerson ? 'Híbrido' :
                           service.isOnline ? 'Online' : 'Presencial'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="service-actions">
                    <button 
                      onClick={() => window.location.href = `/dashboard/services/${service.id}/edit`}
                      className="btn-secondary"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => window.location.href = `/services/${service.id}`}
                      className="btn-primary"
                    >
                      👁️ Ver Página
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <ServiceFormSteps
            onSave={handleServiceSaved}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      )}

      <style jsx>{`
        .services-page {
          background: #f8f9fa;
        }

        .page-actions {
          background: white;
          padding: 24px 32px;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filters {
          display: flex;
          gap: 16px;
        }

        .house-filter {
          padding: 8px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          min-width: 200px;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
        }

        .btn-primary {
          background: #0085ff;
          color: white;
        }

        .btn-primary:hover {
          background: #0073e6;
        }

        .btn-secondary {
          background: white;
          color: #676879;
          border: 2px solid #e1e5e9;
        }

        .btn-secondary:hover {
          background: #f5f6f8;
          border-color: #323338;
          color: #323338;
        }

        .services-content {
          padding: 32px;
        }

        .loading-state, .empty-state, .empty-services {
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

        .empty-state h3, .empty-services h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .empty-state p, .empty-services p {
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

        .service-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .service-header {
          position: relative;
          height: 160px;
        }

        .service-image {
          width: 100%;
          height: 100%;
        }

        .service-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 48px;
          color: white;
        }

        .service-status {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .service-status.active {
          background: #00c875;
          color: white;
        }

        .service-status.inactive {
          background: #ff6b35;
          color: white;
        }

        .service-content {
          padding: 20px;
        }

        .service-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .service-description {
          font-size: 14px;
          color: #676879;
          margin: 0 0 16px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .service-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta-icon {
          font-size: 14px;
          width: 20px;
        }

        .meta-text {
          font-size: 13px;
          color: #676879;
        }

        .service-actions {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #e1e5e9;
          display: flex;
          gap: 12px;
        }

        .service-actions .btn-primary,
        .service-actions .btn-secondary {
          flex: 1;
          padding: 8px 16px;
          text-align: center;
          font-size: 13px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .page-actions {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .services-content {
            padding: 16px;
          }

          .modal-overlay {
            padding: 10px;
          }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px 0 32px;
          border-bottom: 1px solid #e1e5e9;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: #676879;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f5f6f8;
        }

        .modal-body {
          padding: 0 32px 24px 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #323338;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0085ff;
        }

        .checkbox-group {
          display: flex;
          gap: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #323338;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
          width: 16px;
          height: 16px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px 32px;
          border-top: 1px solid #e1e5e9;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-actions {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .services-content {
            padding: 16px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}