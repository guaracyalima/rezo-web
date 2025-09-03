'use client';

import React, { useState, useEffect } from 'react';
import { Event, EventFilters, getEvents, getEventsByOrganizer, getEventsByHouse } from '../../../services/eventsService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import EventCard from './EventCard';
import EventForm from './EventForm';
import EventDetail from './EventDetail';

interface EventsManagerProps {
  userId?: string;
  houseId?: string;
  showOwnerActions?: boolean;
}

export const EventsManager: React.FC<EventsManagerProps> = ({
  userId,
  houseId,
  showOwnerActions = true
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filters, setFilters] = useState<EventFilters>({
    isActive: true,
    deleted: false
  });

  useEffect(() => {
    loadEvents();
  }, [userId, houseId, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);

      let eventsData: Event[];

      if (houseId) {
        // Load events for a specific house
        eventsData = await getEventsByHouse(houseId);
      } else if (userId && showOwnerActions) {
        // Load user's events
        eventsData = await getEventsByOrganizer(userId);
      } else {
        // Load public events with filters
        const result = await getEvents(filters);
        eventsData = result.events;
      }

      setEvents(eventsData);
    } catch (error: any) {
      console.error('Error loading events:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar eventos',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setShowCreateForm(true);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingEvent(null);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    loadEvents();
    handleCloseForm();
    showToast({
      type: 'success',
      title: 'Evento salvo com sucesso!',
      message: 'Seu evento foi criado/atualizado e está disponível para visualização'
    });
  };

  const handleEventDeleted = () => {
    loadEvents();
    handleCloseDetail();
    showToast({
      type: 'success',
      title: 'Evento excluído',
      message: 'O evento foi removido com sucesso'
    });
  };

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        onClose={handleCloseDetail}
        onEdit={showOwnerActions ? handleEditEvent : undefined}
        onDelete={showOwnerActions ? handleEventDeleted : undefined}
        showActions={showOwnerActions}
      />
    );
  }

  if (showCreateForm) {
    return (
      <EventForm
        event={editingEvent}
        onSave={handleEventSaved}
        onCancel={handleCloseForm}
        houseId={houseId}
      />
    );
  }

  return (
    <div className="events-manager">
      {/* Header */}
      <div className="events-header">
        <div className="header-left">
          <h2 className="events-title">
            {houseId ? 'Eventos da Casa' : showOwnerActions ? 'Meus Eventos' : 'Eventos'}
          </h2>
          <p className="events-count">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </p>
        </div>
        
        <div className="header-right">
          {showOwnerActions && (
            <button 
              onClick={handleCreateEvent}
              className="btn-monday"
            >
              + Criar Evento
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
        <div className="events-filters">
          <div className="filter-group">
            <label className="monday-label">Categoria</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="monday-select"
            >
              <option value="">Todas as categorias</option>
              <option value="Cerimônia">Cerimônia</option>
              <option value="Workshop">Workshop</option>
              <option value="Encontro">Encontro</option>
              <option value="Retiro">Retiro</option>
              <option value="Palestra">Palestra</option>
              <option value="Curso">Curso</option>
              <option value="Celebração">Celebração</option>
              <option value="Meditação">Meditação</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="monday-label">Cidade</label>
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Filtrar por cidade"
              className="monday-input"
            />
          </div>

          <div className="filter-group">
            <label className="monday-label">Estado</label>
            <input
              type="text"
              value={filters.state || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              placeholder="UF"
              className="monday-input"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="events-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3 className="empty-title">
              {houseId ? 'Nenhum evento para esta casa' : showOwnerActions ? 'Nenhum evento criado' : 'Nenhum evento encontrado'}
            </h3>
            <p className="empty-description">
              {houseId 
                ? 'Esta casa ainda não possui eventos cadastrados'
                : showOwnerActions 
                  ? 'Crie seu primeiro evento para compartilhar com a comunidade'
                  : 'Tente ajustar os filtros ou volte mais tarde'
              }
            </p>
            {showOwnerActions && (
              <button 
                onClick={handleCreateEvent}
                className="btn-monday"
              >
                {houseId ? 'Criar Evento para esta Casa' : 'Criar Primeiro Evento'}
              </button>
            )}
          </div>
        ) : (
          <div className={`events-${view}`}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onView={() => handleViewEvent(event)}
                onEdit={showOwnerActions ? () => handleEditEvent(event) : undefined}
                showActions={showOwnerActions}
                layout={view}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .events-manager {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .events-header {
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

        .events-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .events-count {
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

        .events-filters {
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

        .events-content {
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

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .events-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .header-right {
            justify-content: space-between;
          }

          .events-filters {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsManager;