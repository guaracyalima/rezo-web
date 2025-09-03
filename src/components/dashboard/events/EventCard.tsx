'use client';

import React from 'react';
import { Event } from '../../../services/eventsService';

interface EventCardProps {
  event: Event;
  onView: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  layout?: 'grid' | 'list';
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onView,
  onEdit,
  showActions = true,
  layout = 'grid'
}) => {
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

  const isUpcoming = (timestamp: any) => {
    if (!timestamp) return false;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date > new Date();
  };

  const isPast = (timestamp: any) => {
    if (!timestamp) return false;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date < new Date();
  };

  if (layout === 'list') {
    return (
      <div className="event-card-list">
        <div className="event-image-small">
          {event.images && event.images.length > 0 ? (
            <img src={event.images[0]} alt={event.title} />
          ) : (
            <div className="event-placeholder-small">
              <span>📅</span>
            </div>
          )}
        </div>

        <div className="event-content-list">
          <div className="event-main-info">
            <h3 className="event-title">{event.title}</h3>
            <p className="event-description">{event.description}</p>
          </div>

          <div className="event-meta-list">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(event.startDate)} às {formatTime(event.startDate)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span>{event.location.city}, {event.location.state}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🏷️</span>
              <span>{event.category}</span>
            </div>
          </div>
        </div>

        <div className="event-actions-list">
          <div className="event-status">
            {isPast(event.startDate) ? (
              <span className="status-badge status-past">Finalizado</span>
            ) : isUpcoming(event.startDate) ? (
              <span className="status-badge status-upcoming">Próximo</span>
            ) : (
              <span className="status-badge status-today">Hoje</span>
            )}
          </div>
          
          <div className="action-buttons">
            <button onClick={onView} className="btn-view">
              Ver Detalhes
            </button>
            {showActions && onEdit && (
              <button onClick={onEdit} className="btn-edit">
                Editar
              </button>
            )}
          </div>
        </div>

        <style jsx>{`
          .event-card-list {
            display: flex;
            align-items: center;
            gap: 16px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 16px;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .event-card-list:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #0085ff;
          }

          .event-image-small {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .event-image-small img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .event-placeholder-small {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f1f3f4, #e8eaed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #676879;
          }

          .event-content-list {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .event-main-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .event-title {
            font-size: 18px;
            font-weight: 600;
            color: #323338;
            margin: 0;
            line-height: 1.3;
          }

          .event-description {
            font-size: 14px;
            color: #676879;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .event-meta-list {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #676879;
          }

          .meta-icon {
            font-size: 14px;
          }

          .event-actions-list {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
            flex-shrink: 0;
          }

          .event-status {
            display: flex;
          }

          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-upcoming {
            background: #e8f5e8;
            color: #2d7d2d;
          }

          .status-today {
            background: #fff3cd;
            color: #856404;
          }

          .status-past {
            background: #f8f9fa;
            color: #676879;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }

          .btn-view, .btn-edit {
            padding: 6px 12px;
            border: 1px solid #d0d4d9;
            border-radius: 4px;
            background: white;
            color: #323338;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-view:hover {
            border-color: #0085ff;
            color: #0085ff;
          }

          .btn-edit:hover {
            border-color: #0085ff;
            color: #0085ff;
          }
        `}</style>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="event-card" onClick={onView}>
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
          {isPast(event.startDate) ? (
            <span className="status-badge status-past">Finalizado</span>
          ) : isUpcoming(event.startDate) ? (
            <span className="status-badge status-upcoming">Próximo</span>
          ) : (
            <span className="status-badge status-today">Hoje</span>
          )}
          {event.ticketInfo.type === 'paid' && event.ticketInfo.price && (
            <span className="price-badge">{formatPrice(event.ticketInfo.price)}</span>
          )}
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
        
        {showActions && (
          <div className="event-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="btn-view"
            >
              Ver Detalhes
            </button>
            {onEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="btn-edit"
              >
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .event-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
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
          font-size: 64px;
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

        .category-badge, .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge {
          background: rgba(0, 133, 255, 0.9);
          color: white;
        }

        .status-upcoming {
          background: rgba(0, 202, 114, 0.9);
          color: white;
        }

        .status-today {
          background: rgba(255, 203, 0, 0.9);
          color: #323338;
        }

        .status-past {
          background: rgba(0, 0, 0, 0.6);
          color: white;
        }

        .price-badge {
          background: rgba(0, 133, 255, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-badge {
          background: rgba(0, 255, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-content {
          padding: 20px;
        }

        .event-title {
          font-size: 18px;
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
          font-size: 16px;
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
          gap: 8px;
        }

        .btn-view, .btn-edit {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          text-align: center;
        }

        .btn-view {
          background: #0085ff;
          color: white;
          border: none;
        }

        .btn-view:hover {
          background: #0073e6;
        }

        .btn-edit {
          background: transparent;
          color: #323338;
          border: 1px solid #d0d4d9;
        }

        .btn-edit:hover {
          border-color: #0085ff;
          color: #0085ff;
        }
      `}</style>
    </div>
  );
};

export default EventCard;