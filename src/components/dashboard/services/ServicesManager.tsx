'use client';

import React, { useState, useEffect } from 'react';
import { Service, ServiceFilters, getServices, getServicesByHouse, getServicesByProvider, deleteService } from '../../../services/servicesService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import ServiceCard from './ServiceCard';
import ServiceFormSteps from './ServiceFormSteps';
import ServiceDetail from './ServiceDetail';

interface ServicesManagerProps {
  userId?: string;
  houseId?: string;
  showOwnerActions?: boolean;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  userId,
  houseId,
  showOwnerActions = true
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filters, setFilters] = useState<ServiceFilters>(() => {
    // Only apply restrictive filters for logged-in users (dashboard)
    if (showOwnerActions) {
      return {
        isActive: true,
        deleted: false
      };
    }
    // For public area, don't apply any default filters
    return {};
  });

  useEffect(() => {
    loadServices();
  }, [userId, houseId, filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      console.log('Loading services with params:', { userId, houseId, showOwnerActions, filters });

      let servicesData: Service[];

      if (houseId) {
        // Load services for a specific house
        console.log('Loading services for house:', houseId);
        servicesData = await getServicesByHouse(houseId);
      } else if (userId && showOwnerActions) {
        // Load user's services
        console.log('Loading services for provider:', userId);
        servicesData = await getServicesByProvider(userId);
      } else {
        // Load public services with filters
        console.log('Loading public services with filters:', filters);
        const result = await getServices(filters);
        servicesData = result.services;
      }

      console.log('Final loaded services:', servicesData);
      setServices(servicesData);
    } catch (error: any) {
      console.error('Error loading services:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar atendimentos',
        message: error.message || 'Tente novamente em alguns instantes'
      });
      
      // Set empty array on error to show empty state instead of hanging
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setShowCreateForm(true);
    setEditingService(null);
  };

  const handleEditService = (service: Service) => {
    console.log('Edit service clicked:', service.id);
    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleViewService = (service: Service) => {
    console.log('Viewing service:', service.id, 'showOwnerActions:', showOwnerActions);
    if (showOwnerActions) {
      // In dashboard, show ServiceDetail component
      setSelectedService(service);
    } else {
      // In public view, redirect to public service page
      window.open(`/services/${service.id}`, '_blank');
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingService(null);
  };

  const handleCloseDetail = () => {
    setSelectedService(null);
  };

  const handleDeleteService = async (service: Service) => {
    if (!service.id) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja excluir o serviço "${service.title}"?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteService(service.id);
      showToast({
        type: 'success',
        title: 'Atendimento excluído',
        message: 'O atendimento foi removido com sucesso'
      });
      loadServices();
      setSelectedService(null);
    } catch (error: any) {
      console.error('Error deleting service:', error);
      showToast({
        type: 'error',
        title: 'Erro ao excluir atendimento',
        message: error.message || 'Não foi possível excluir o atendimento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSaved = () => {
    loadServices();
    handleCloseForm();
    showToast({
      type: 'success',
      title: 'Atendimento salvo com sucesso!',
      message: 'Seu atendimento foi criado/atualizado e está disponível para visualização'
    });
  };

  const handleServiceDeleted = () => {
    loadServices();
    handleCloseDetail();
    showToast({
      type: 'success',
      title: 'Atendimento excluído',
      message: 'O atendimento foi removido com sucesso'
    });
  };

  if (selectedService) {
    return (
      <ServiceDetail
        service={selectedService}
        onClose={handleCloseDetail}
        onEdit={showOwnerActions ? () => handleEditService(selectedService) : undefined}
        onDelete={showOwnerActions ? () => handleDeleteService(selectedService) : undefined}
        showActions={showOwnerActions}
      />
    );
  }

  if (showCreateForm) {
    return (
      <ServiceFormSteps
        service={editingService}
        onSave={handleServiceSaved}
        onCancel={handleCloseForm}
        houseId={houseId}
      />
    );
  }

  return (
    <div className="services-manager">
      {/* Header */}
      <div className="services-header">
        <div className="header-left">
          <h2 className="services-title">
            {houseId ? 'Atendimentos da Casa' : showOwnerActions ? 'Meus Atendimentos' : 'Atendimentos'}
          </h2>
          <p className="services-count">
            {services.length} {services.length === 1 ? 'atendimento' : 'atendimentos'}
          </p>
        </div>
        
        <div className="header-right">
          {showOwnerActions && (
            <button 
              onClick={handleCreateService}
              className="btn-monday"
            >
              + Criar Atendimento
            </button>
          )}
          
          <div className="view-toggle">
            <button
              onClick={() => setView('grid')}
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            >
              ⊞ Grade
            </button>
            <button
              onClick={() => setView('list')}
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
            >
              ☰ Lista
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {!showOwnerActions && (
        <div className="services-filters">
          <div className="filter-group">
            <label className="monday-label">Categoria</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="monday-select"
            >
              <option value="">Todas as categorias</option>
              <option value="Consulta Espiritual">Consulta Espiritual</option>
              <option value="Leitura de Cartas">Leitura de Cartas</option>
              <option value="Reiki">Reiki</option>
              <option value="Terapia Holística">Terapia Holística</option>
              <option value="Meditação">Meditação</option>
              <option value="Aromaterapia">Aromaterapia</option>
              <option value="Cristaloterapia">Cristaloterapia</option>
              <option value="Numerologia">Numerologia</option>
              <option value="Astrologia">Astrologia</option>
              <option value="Massagem Terapêutica">Massagem Terapêutica</option>
              <option value="Terapia com Florais">Terapia com Florais</option>
              <option value="Limpeza Espiritual">Limpeza Espiritual</option>
              <option value="Desenvolvimento Mediúnico">Desenvolvimento Mediúnico</option>
              <option value="Curso Online">Curso Online</option>
              <option value="Workshop">Workshop</option>
              <option value="Mentoria">Mentoria</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="monday-label">Preço Mínimo</label>
            <input
              type="number"
              value={filters.priceMin || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="R$ 0,00"
              className="monday-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="filter-group">
            <label className="monday-label">Preço Máximo</label>
            <input
              type="number"
              value={filters.priceMax || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="R$ 500,00"
              className="monday-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="filter-group">
            <label className="monday-label">Modalidade</label>
            <select
              value={
                filters.isOnline === true ? 'online' : 
                filters.isInPerson === true ? 'inperson' : ''
              }
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({ 
                  ...prev, 
                  isOnline: value === 'online' ? true : undefined,
                  isInPerson: value === 'inperson' ? true : undefined
                }));
              }}
              className="monday-select"
            >
              <option value="">Todas as modalidades</option>
              <option value="online">Online</option>
              <option value="inperson">Presencial</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="monday-label">Nível</label>
            <select
              value={filters.experienceLevel || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                experienceLevel: e.target.value || undefined
              }))}
              className="monday-select"
            >
              <option value="">Todos os níveis</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
              <option value="all">Todos os níveis</option>
            </select>
          </div>
        </div>
      )}

      {/* Debug Info - Remove this in production */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid #ccc'
      }}>
        <strong>🔍 Debug Info:</strong><br/>
        Loading: {loading ? 'true' : 'false'}<br/>
        Services Count: {services.length}<br/>
        User ID: {userId}<br/>
        House ID: {houseId || 'none'}<br/>
        Show Owner Actions: {showOwnerActions ? 'true' : 'false'}<br/>
        Filters: {JSON.stringify(filters, null, 2)}<br/>
        Services: {JSON.stringify(services.map(s => ({ 
          id: s.id, 
          title: s.title, 
          providerId: s.providerId,
          isActive: s.isActive,
          deleted: s.deleted 
        })), null, 2)}
      </div>

      {/* Content */}
      <div className="services-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando atendimentos...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔮</div>
            <h3 className="empty-title">
              {houseId ? 'Nenhum atendimento para esta casa' : showOwnerActions ? 'Nenhum atendimento criado' : 'Nenhum atendimento encontrado'}
            </h3>
            <p className="empty-description">
              {houseId 
                ? 'Esta casa ainda não possui atendimentos cadastrados'
                : showOwnerActions 
                  ? 'Crie seu primeiro atendimento para começar a oferecer'
                  : 'Tente ajustar os filtros ou volte mais tarde'
              }
            </p>
            {showOwnerActions && (
              <button 
                onClick={handleCreateService}
                className="btn-monday"
              >
                {houseId ? 'Criar Atendimento para esta Casa' : 'Criar Primeiro Atendimento'}
              </button>
            )}
          </div>
        ) : (
          <div className={`services-${view}`}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onView={() => handleViewService(service)}
                onEdit={showOwnerActions ? () => handleEditService(service) : undefined}
                onDelete={showOwnerActions ? () => handleDeleteService(service) : undefined}
                showActions={showOwnerActions}
                layout={view}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .services-manager {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .services-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .services-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .services-count {
          font-size: 14px;
          color: #676879;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          overflow: hidden;
        }

        .view-btn {
          background: white;
          border: none;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: #0085ff;
          color: white;
        }

        .view-btn:hover:not(.active) {
          background: #f5f6f8;
        }

        .services-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #f8f9fa;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .services-content {
          padding: 24px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
        }

        .empty-description {
          font-size: 16px;
          color: #676879;
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .services-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .header-right {
            justify-content: space-between;
          }

          .services-filters {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesManager;

export { ServicesManager };