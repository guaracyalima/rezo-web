import React from 'react';
import { Service } from '../../../services/servicesService';
import ServiceShare from '../../services/ServiceShare';

interface ServiceCardProps {
  service: Service;
  onView?: (service: Service) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  showActions?: boolean;
  layout?: 'grid' | 'list';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onView,
  onEdit,
  onDelete,
  showActions = false,
  layout = 'grid'
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
      'all': 'Todos os níveis'
    };
    return labels[level as keyof typeof labels] || level;
  };

  if (layout === 'list') {
    return (
      <div 
        className="service-card-list"
        onClick={() => onView && onView(service)}
        style={{ cursor: onView ? 'pointer' : 'default' }}
      >
        <div className="service-image">
          {service.images && service.images.length > 0 ? (
            <img src={service.images[0]} alt={service.title} />
          ) : (
            <div className="service-placeholder">
              <span>🔮</span>
            </div>
          )}
          {service.isFeatured && (
            <div className="featured-badge">⭐ Destaque</div>
          )}
        </div>

        <div className="service-content">
          <div className="service-header">
            <h3 className="service-title">{service.title}</h3>
            <div className="service-badges">
              <span className="category-badge">{service.category}</span>
              {service.isOnline && (
                <span className="online-badge">💻 Online</span>
              )}
              {service.isInPerson && (
                <span className="inperson-badge">🏠 Presencial</span>
              )}
              {!service.isActive && (
                <span className="inactive-badge">⏸️ Inativo</span>
              )}
            </div>
          </div>

          <p className="service-description">
            {service.shortDescription || service.description}
          </p>

          <div className="service-meta">
            <div className="service-pricing">
              <span className="base-price">A partir de {formatPrice(service.basePrice)}</span>
              <span className="duration">⏱️ {formatDuration(service.duration)}</span>
            </div>
            
            <div className="service-info">
              <span className="experience-level">
                📊 {getExperienceLevelLabel(service.experienceLevel)}
              </span>
              {service.maxParticipants && (
                <span className="max-participants">
                  👥 Até {service.maxParticipants} pessoas
                </span>
              )}
            </div>
          </div>

          {(showActions || onView) && (
            <div className="service-actions" onClick={(e) => e.stopPropagation()}>
              {onView && (
                <button onClick={(e) => { e.stopPropagation(); onView(service); }} className="action-btn view-btn">
                  👁️ Ver
                </button>
              )}
              {showActions && onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(service); }} className="action-btn edit-btn">
                  ✏️ Editar
                </button>
              )}
              {showActions && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(service); }} className="action-btn delete-btn">
                  🗑️ Excluir
                </button>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .service-card-list {
            display: flex;
            gap: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e1e5e9;
          }

          .service-card-list:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .service-image {
            position: relative;
            width: 120px;
            height: 120px;
            flex-shrink: 0;
          }

          .service-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .service-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f1f3f4, #e8eaed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #676879;
          }

          .featured-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ff6b35;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }

          .service-content {
            flex: 1;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .service-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .service-title {
            font-size: 18px;
            font-weight: 600;
            color: #323338;
            margin: 0;
            line-height: 1.3;
          }

          .service-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .category-badge, .online-badge, .inperson-badge, .inactive-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .category-badge {
            background: #e1e5e9;
            color: #676879;
          }

          .online-badge {
            background: #0085ff;
            color: white;
          }

          .inperson-badge {
            background: #00ca72;
            color: white;
          }

          .inactive-badge {
            background: #ff3333;
            color: white;
          }

          .service-description {
            color: #676879;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .service-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
          }

          .service-pricing {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .base-price {
            font-size: 16px;
            font-weight: 700;
            color: #00ca72;
          }

          .duration {
            font-size: 12px;
            color: #676879;
          }

          .service-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 12px;
            color: #676879;
          }

          .service-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
          }

          .action-btn {
            background: none;
            border: 1px solid #d0d4d9;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .view-btn:hover {
            background: #0085ff;
            color: white;
            border-color: #0085ff;
          }

          .edit-btn:hover {
            background: #ffcb00;
            color: white;
            border-color: #ffcb00;
          }

          .delete-btn:hover {
            background: #ff3333;
            color: white;
            border-color: #ff3333;
          }
        `}</style>
      </div>
    );
  }

  // Grid layout
  return (
    <div 
      className="service-card-grid"
      onClick={() => onView && onView(service)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <div className="service-image">
        {service.images && service.images.length > 0 ? (
          <img src={service.images[0]} alt={service.title} />
        ) : (
          <div className="service-placeholder">
            <span>🔮</span>
          </div>
        )}
        <div className="service-badges">
          {service.isFeatured && (
            <span className="featured-badge">⭐</span>
          )}
          {service.isOnline && (
            <span className="online-badge">💻</span>
          )}
          {service.isInPerson && (
            <span className="inperson-badge">🏠</span>
          )}
          {!service.isActive && (
            <span className="inactive-badge">⏸️</span>
          )}
        </div>
      </div>        <div className="service-content">
          <div className="service-header">
            <div className="category-and-share">
              <span className="category-tag">{service.category}</span>
              <div className="share-container">
                <ServiceShare service={service} />
              </div>
            </div>
          </div>

          <h3 className="service-title">{service.title}</h3>
        
        <p className="service-description">
          {service.shortDescription || service.description}
        </p>

        <div className="service-details">
          <div className="service-price">
            <span className="price-label">A partir de</span>
            <span className="base-price">{formatPrice(service.basePrice)}</span>
          </div>

          <div className="service-duration">
            <span className="duration-icon">⏱️</span>
            <span className="duration-text">{formatDuration(service.duration)}</span>
          </div>

          <div className="service-level">
            <span className="level-icon">📊</span>
            <span className="level-text">{getExperienceLevelLabel(service.experienceLevel)}</span>
          </div>

          {service.maxParticipants && (
            <div className="service-participants">
              <span className="participants-icon">👥</span>
              <span className="participants-text">Até {service.maxParticipants}</span>
            </div>
          )}
        </div>          {onView && (
            <div className="service-actions" onClick={(e) => e.stopPropagation()}>
              <button onClick={(e) => { e.stopPropagation(); onView(service); }} className="action-btn primary">
                {showActions ? 'Ver Detalhes' : 'Ver e Agendar'}
              </button>
              
              {showActions && onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(service); }} className="action-btn secondary">
                  Editar
                </button>
              )}
            </div>
          )}
      </div>

      <style jsx>{`
        .service-card-grid {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e1e5e9;
        }

        .service-card-grid:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .service-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .service-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .service-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #676879;
        }

        .service-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .featured-badge, .online-badge, .inperson-badge, .inactive-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .featured-badge {
          background: #ff6b35;
        }

        .online-badge {
          background: #0085ff;
        }

        .inperson-badge {
          background: #00ca72;
        }

        .inactive-badge {
          background: #95a5a6;
        }

        .service-content {
          padding: 16px;
        }

        .service-header {
          margin-bottom: 12px;
        }

        .category-and-share {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-tag {
          background: #f1f3f4;
          color: #676879;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .share-container {
          flex-shrink: 0;
        }

        .service-title {
          font-size: 16px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .service-description {
          color: #676879;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .service-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .service-price {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-label {
          font-size: 12px;
          color: #676879;
        }

        .base-price {
          font-size: 18px;
          font-weight: 700;
          color: #00ca72;
        }

        .service-duration, .service-level, .service-participants {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #676879;
        }

        .service-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .action-btn {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          flex: 1;
          text-align: center;
        }

        .action-btn.primary {
          background: #0085ff;
          color: white;
        }

        .action-btn.primary:hover {
          background: #0073e6;
        }

        .action-btn.secondary {
          background: #f8f9fa;
          color: #323338;
          border: 1px solid #d0d4d9;
        }

        .action-btn.secondary:hover {
          background: #e8eaed;
        }
      `}</style>
    </div>
  );
};

export default ServiceCard;