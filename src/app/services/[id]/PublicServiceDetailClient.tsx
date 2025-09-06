'use client';

import React, { useState, useEffect } from 'react';
import ServiceShare from '../../../components/services/ServiceShare';
import ServiceSchedulingMonday from '../../../components/booking/ServiceSchedulingMonday';
import TestModal from '../../../components/TestModal';
import ErrorBoundary from '../../../components/ErrorBoundary';
import PublicNavigation from '../../../components/PublicNavigation';

// Client-safe versions with serialized dates
interface SerializedService {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  basePrice: number;
  duration: number;
  experienceLevel: string;
  isOnline: boolean;
  isInPerson: boolean;
  maxParticipants?: number;
  images: string[];
  tags?: string[];
  requirements?: string[];
  whatToExpected?: string[];
  includedMaterials?: string[];
  isFeatured: boolean;
  isActive: boolean;
  houseId: string;
  providerId: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface SerializedHouse {
  id: string;
  name: string;
  city: string;
  state: string;
  logo?: string;
  whatsapp?: string;
  phone?: string;
  approved: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface PublicServiceDetailClientProps {
  service: SerializedService;
  house: SerializedHouse | null;
}

export default function PublicServiceDetailClient({ service, house }: PublicServiceDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showScheduling, setShowScheduling] = useState(false);

  console.log('🔍 PublicServiceDetailClient render - showScheduling:', showScheduling);

  // Monitor state changes
  useEffect(() => {
    console.log('🔄 showScheduling state changed to:', showScheduling);
  }, [showScheduling]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
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

  return (
    <div className="public-service-detail">
      <PublicNavigation />
      
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav className="breadcrumb">
            <a href="/services">Serviços</a>
            <span className="separator">›</span>
            <a href={`/services?category=${service.category}`}>{service.category}</a>
            <span className="separator">›</span>
            <span className="current">{service.title}</span>
          </nav>
        </div>
      </div>

      {/* Service Detail */}
      <div className="service-section">
        <div className="container">
          <div className="service-layout">
            {/* Service Gallery */}
            <div className="service-gallery">
              <div className="main-image">
                {service.images && service.images.length > 0 ? (
                  <img 
                    src={service.images[selectedImageIndex]} 
                    alt={service.title}
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>🔮</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="image-badges">
                  {service.isFeatured && (
                    <span className="badge featured">⭐ Destaque</span>
                  )}
                  {service.isOnline && (
                    <span className="badge online">💻 Online</span>
                  )}
                  {service.isInPerson && (
                    <span className="badge inperson">🏠 Presencial</span>
                  )}
                </div>
              </div>

              {service.images && service.images.length > 1 && (
                <div className="image-thumbnails">
                  {service.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    >
                      <img src={image} alt={`${service.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="service-info">
              <div className="service-header">
                <span className="category-tag">{service.category}</span>
                <h1 className="service-title">{service.title}</h1>
                
                {service.shortDescription && (
                  <p className="service-subtitle">{service.shortDescription}</p>
                )}

                <div className="service-pricing">
                  <span className="price-label">A partir de</span>
                  <span className="current-price">{formatPrice(service.basePrice)}</span>
                </div>

                <div className="service-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>Duração: {formatDuration(service.duration)}</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    <span>Nível: {getExperienceLevelLabel(service.experienceLevel)}</span>
                  </div>

                  {service.maxParticipants && (
                    <div className="meta-item">
                      <span className="meta-icon">👥</span>
                      <span>Até {service.maxParticipants} participantes</span>
                    </div>
                  )}

                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>
                      {service.isOnline && service.isInPerson ? 'Online e Presencial' :
                       service.isOnline ? 'Apenas Online' : 'Apenas Presencial'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="service-tags">
                    {service.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Share Button */}
                <div className="service-share">
                  <ServiceShare service={service as any} houseName={house?.name} />
                </div>
                  {/* House Info */}
              {house && (
                <div className="provider-info">
                  <h3>🏠 Oferecido por</h3>
                  <div className="house-card">
                    <div className="house-info">
                      {house.logo && (
                        <img src={house.logo} alt={house.name} className="house-logo" />
                      )}
                      <div>
                        <h4 className="house-name">{house.name}</h4>
                        <p className="house-location">{house.city}, {house.state}</p>
                        {house.approved && (
                          <span className="verified-badge">✓ Casa Verificada</span>
                        )}
                      </div>
                    </div>
                    <a href={`/houses/${house.id}`} className="view-house-btn">
                      Ver Casa
                    </a>
                  </div>
                </div>
              )}
              </div>

              {/* Contact Actions */}
              <div className="contact-actions">
                <h3>💬 Interessado?</h3>
                <p>Agende seu atendimento ou entre em contato para mais informações</p>
                <div className="contact-buttons">
                  <button 
                    onClick={() => {
                      console.log('🎯 Schedule button clicked for service:', service.id);
                      console.log('📊 Current showScheduling state before:', showScheduling);
                      setShowScheduling(true);
                      console.log('📊 setShowScheduling(true) called');
                      // Force a re-render check
                      setTimeout(() => {
                        console.log('📊 showScheduling state after timeout:', showScheduling);
                      }, 100);
                    }}
                    className="contact-btn schedule"
                  >
                    📅 Agendar Agora
                  </button>
                  
                  {house?.whatsapp && (
                    <a 
                      href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}?text=Olá! Tenho interesse no serviço: ${service.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-btn whatsapp"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                 
                </div>
              </div>

            
            </div>
          </div>

          {/* Service Description */}
          <div className="service-description-section">
            <h2>📝 Descrição do Serviço</h2>
            <div className="description-content">
              {service.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className="requirements-section">
              <h2>📋 Pré-requisitos</h2>
              <ul className="requirements-list">
                {service.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* What to Expect */}
          {service.whatToExpected && service.whatToExpected.length > 0 && (
            <div className="expectations-section">
              <h2>✨ O que Esperar</h2>
              <ul className="expectations-list">
                {service.whatToExpected.map((expectation, index) => (
                  <li key={index}>{expectation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Included Materials */}
          {service.includedMaterials && service.includedMaterials.length > 0 && (
            <div className="materials-section">
              <h2>🎁 Materiais Inclusos</h2>
              <ul className="materials-list">
                {service.includedMaterials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'black', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '4px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        showScheduling: {showScheduling ? 'TRUE' : 'FALSE'}
      </div>

      {/* Service Scheduling Modal */}
      {(() => {
        console.log('🔍 Modal render check - showScheduling:', showScheduling);
        return showScheduling;
      })() && (
        <>
          {console.log('🔍 Rendering ServiceSchedulingMonday modal with ErrorBoundary')}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999
          }}>
            <ErrorBoundary>
              <ServiceSchedulingMonday
                service={service as any}
                onClose={() => {
                  console.log('🚪 Closing scheduling modal');
                  setShowScheduling(false);
                }}
                onBookingComplete={(bookingId) => {
                  console.log('✅ Booking created:', bookingId);
                  setShowScheduling(false);
                }}
              />
            </ErrorBoundary>
          </div>
        </>
      )}

      <style jsx>{`
        .public-service-detail {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .breadcrumb-section {
          background: white;
          padding: 16px 0;
          border-bottom: 1px solid #e1e5e9;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .breadcrumb a {
          color: #0085ff;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .separator {
          color: #676879;
        }

        .current {
          color: #323338;
          font-weight: 500;
        }

        .service-section {
          padding: 40px 0 80px;
        }

        .service-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .service-gallery {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-image {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .main-image img {
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
          font-size: 80px;
          color: #676879;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
        }

        .image-badges {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badge {
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .badge.featured {
          background: #ff6b35;
        }

        .badge.online {
          background: #0085ff;
        }

        .badge.inperson {
          background: #00ca72;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .category-tag {
          background: #e1e5e9;
          color: #676879;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          width: fit-content;
        }

        .service-title {
          font-size: 36px;
          font-weight: 700;
          color: #323338;
          margin: 16px 0 8px 0;
          line-height: 1.2;
        }

        .service-subtitle {
          font-size: 18px;
          color: #676879;
          margin: 0 0 24px 0;
          line-height: 1.4;
        }

        .service-pricing {
          margin-bottom: 20px;
        }

        .price-label {
          display: block;
          color: #676879;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .current-price {
          font-size: 32px;
          font-weight: 700;
          color: #00ca72;
        }

        .service-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: #323338;
        }

        .meta-icon {
          font-size: 18px;
        }

        .service-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .tag {
          background: #f1f3f4;
          color: #676879;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .service-share {
          margin-bottom: 20px;
        }

        .contact-actions, .provider-info {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .contact-actions h3, .provider-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .contact-actions p {
          color: #676879;
          margin-bottom: 16px;
        }

        .contact-buttons {
          display: flex;
          gap: 12px;
          flex-direction: column;
        }

        .contact-btn {
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: center;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }

        .contact-btn.schedule {
          background: #0085ff;
          color: white;
        }

        .contact-btn.schedule:hover {
          background: #0073e6;
        }

        .contact-btn.whatsapp {
          background: #25d366;
          color: white;
        }

        .contact-btn.whatsapp:hover {
          background: #1fb855;
          color: white;
        }

        .contact-btn.phone {
          background: #f8f9fa;
          color: #323338;
          border: 2px solid #d0d4d9;
        }

        .contact-btn.phone:hover {
          background: #e8eaed;
        }

        .house-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .house-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .house-logo {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
        }

        .house-name {
          font-size: 16px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 4px 0;
        }

        .house-location {
          font-size: 14px;
          color: #676879;
          margin: 0 0 4px 0;
        }

        .verified-badge {
          background: #00ca72;
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 500;
        }

        .view-house-btn {
          background: #0085ff;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .view-house-btn:hover {
          background: #0073e6;
          color: white;
        }

        .service-description-section, .requirements-section, .expectations-section, .materials-section {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }

        .service-description-section h2, .requirements-section h2, .expectations-section h2, .materials-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 24px;
        }

        .description-content p {
          color: #676879;
          line-height: 1.7;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .requirements-list, .expectations-list, .materials-list {
          margin: 0;
          padding-left: 20px;
        }

        .requirements-list li, .expectations-list li, .materials-list li {
          color: #676879;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .service-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .service-title {
            font-size: 28px;
          }

          .current-price {
            font-size: 28px;
          }

          .contact-buttons {
            flex-direction: column;
          }

          .house-card {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}