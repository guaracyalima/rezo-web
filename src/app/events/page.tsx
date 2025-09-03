'use client';

import React, { useState, useEffect } from 'react';
import { Event, EventFilters, getEvents } from '../../services/eventsService';
import { getUserLocation, LocationData } from '../../services/geolocationService';
import { useToast } from '../../contexts/ToastContext';
import PublicNavigation from '../../components/PublicNavigation';

export default function PublicEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState<EventFilters>({
    isPublic: true,
    isActive: true,
    deleted: false
  });

  useEffect(() => {
    loadEvents(true);
    getUserLocation().then(setUserLocation).catch(() => null);
  }, [filters]);

  const loadEvents = async (reset = false) => {
    try {
      setLoading(true);

      const activeFilters: EventFilters = {
        isPublic: true,
        isActive: true,
        deleted: false
      };

      // Add location filter if available
      if (userLocation?.city && !filters.city) {
        activeFilters.city = userLocation.city;
      }
      if (userLocation?.state && !filters.state) {
        activeFilters.state = userLocation.state;
      }

      // Add user-selected filters
      if (filters.category?.trim()) {
        activeFilters.category = filters.category.trim();
      }
      if (filters.city?.trim()) {
        activeFilters.city = filters.city.trim();
      }
      if (filters.state?.trim()) {
        activeFilters.state = filters.state.trim();
      }

      const result = await getEvents(activeFilters, {
        limitCount: 20,
        lastDoc: reset ? null : lastDoc
      });

      if (reset) {
        setEvents(result.events);
      } else {
        setEvents(prev => [...prev, ...result.events]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(!!result.lastDoc && result.events.length === 20);
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

  const loadMore = () => {
    if (!loading && hasMore) {
      loadEvents(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="public-events-page">
      <PublicNavigation />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Eventos Espirituais</h1>
          <p className="hero-subtitle">
            Descubra cerimônias, workshops e encontros próximos a você
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="container">
          <div className="search-card">
            <div className="search-grid">
              <div className="filter-group">
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="filter-select"
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
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <input
                  type="text"
                  value={filters.state || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Estado (UF)"
                  className="filter-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        <div className="container">
          <div className="results-header">
            <h2 className="results-title">
              {events.length > 0 ? `${events.length} eventos encontrados` : 'Eventos Espirituais'}
            </h2>
            {userLocation?.city && (
              <p className="results-location">📍 Próximo a {userLocation.city}, {userLocation.state}</p>
            )}
          </div>

          {events.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 className="empty-title">Nenhum evento encontrado</h3>
              <p className="empty-description">
                Tente ajustar os filtros ou volte mais tarde para novos eventos
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    {event.images && event.images.length > 0 ? (
                      <img src={event.images[0]} alt={event.title} />
                    ) : (
                      <div className="event-placeholder">
                        <span>📅</span>
                      </div>
                    )}
                    <div className="event-badges">
                      <span className="category-badge">{event.category}</span>
                      <span className="ticket-badge">
                        {event.ticketInfo.type === 'free' && '🆓 Gratuito'}
                        {event.ticketInfo.type === 'paid' && `💰 ${formatPrice(event.ticketInfo.price)}`}
                        {event.ticketInfo.type === 'donation' && '🙏 Contribuição'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏰</span>
                        <span>{formatTime(event.startDate)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{event.location.city}, {event.location.state}</span>
                      </div>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-actions">
                      <a href={`/events/${event.id}`} className="view-button">
                        Ver Detalhes
                      </a>
                      {event.contactInfo.whatsapp && (
                        <a 
                          href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="whatsapp-button"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="load-more-section">
              <button
                onClick={loadMore}
                disabled={loading}
                className="load-more-button"
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-events-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 0 60px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 20px;
          opacity: 0.9;
          margin: 0;
        }

        .search-section {
          margin-top: -30px;
          padding-bottom: 40px;
          position: relative;
          z-index: 2;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .search-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }

        .search-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        .filter-input, .filter-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white !important;
          color: #323338 !important;
        }

        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 3px rgba(0, 133, 255, 0.1);
        }

        .results-section {
          padding: 40px 0 80px;
        }

        .results-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .results-title {
          font-size: 32px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 8px;
        }

        .results-location {
          font-size: 18px;
          color: #676879;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
          max-width: 400px;
          margin: 0 auto;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .event-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #676879;
        }

        .event-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .category-badge, .ticket-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .ticket-badge {
          background: rgba(0, 133, 255, 0.9);
        }

        .event-content {
          padding: 24px;
        }

        .event-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .event-meta {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #676879;
        }

        .meta-icon {
          font-size: 14px;
        }

        .event-description {
          color: #676879;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-actions {
          display: flex;
          gap: 12px;
        }

        .view-button, .whatsapp-button {
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          text-align: center;
          flex: 1;
        }

        .view-button {
          background: #0085ff;
          color: white;
        }

        .view-button:hover {
          background: #0073e6;
          color: white;
        }

        .whatsapp-button {
          background: #25d366;
          color: white;
        }

        .whatsapp-button:hover {
          background: #1fb855;
          color: white;
        }

        .load-more-section {
          text-align: center;
          margin-top: 40px;
        }

        .load-more-button {
          background: #0085ff;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .load-more-button:hover:not(:disabled) {
          background: #0073e6;
        }

        .load-more-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .search-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .events-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}