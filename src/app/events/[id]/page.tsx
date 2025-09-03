'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Event, getEventById } from '../../../services/eventsService';
import { useToast } from '../../../contexts/ToastContext';
import PublicNavigation from '../../../components/PublicNavigation';

export default function PublicEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      
      const eventData = await getEventById(eventId);
      
      if (!eventData) {
        showToast({
          type: 'error',
          title: 'Evento não encontrado',
          message: 'O evento solicitado não existe ou foi removido'
        });
        return;
      }
      
      if (!eventData.isPublic) {
        showToast({
          type: 'warning',
          title: 'Acesso restrito',
          message: 'Este evento não está disponível publicamente'
        });
        return;
      }
      
      setEvent(eventData);
    } catch (error: any) {
      console.error('Error loading event:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar evento',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <h2>Evento não encontrado</h2>
        <p>O evento solicitado não existe ou não está mais disponível</p>
        <a href="/events" className="back-link">← Voltar aos eventos</a>
      </div>
    );
  }

  return (
    <div className="public-event-detail">
      <PublicNavigation />
      
      {/* Header */}
      <div className="event-header">
        <div className="container">
          <a href="/events" className="back-link">← Voltar aos eventos</a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            {event.images && event.images.length > 0 ? (
              <div className="hero-image">
                <img src={event.images[0]} alt={event.title} />
              </div>
            ) : (
              <div className="hero-placeholder">
                <span>📅</span>
              </div>
            )}
            
            <div className="hero-info">
              <div className="event-badges">
                <span className="category-badge">{event.category}</span>
                <span className="ticket-badge">
                  {event.ticketInfo.type === 'free' && '🆓 Gratuito'}
                  {event.ticketInfo.type === 'paid' && `💰 ${formatPrice(event.ticketInfo.price)}`}
                  {event.ticketInfo.type === 'donation' && '🙏 Contribuição'}
                </span>
              </div>
              
              <h1 className="event-title">{event.title}</h1>
              <p className="event-description">{event.description}</p>
              
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
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="details-section">
        <div className="container">
          <div className="details-grid">
            {/* Location */}
            <div className="detail-card">
              <h3 className="card-title">📍 Local</h3>
              <div className="card-content">
                <p><strong>Endereço:</strong> {event.location.address}</p>
                <p><strong>Cidade:</strong> {event.location.city}, {event.location.state}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="detail-card">
              <h3 className="card-title">👥 Participação</h3>
              <div className="card-content">
                <p><strong>Confirmados:</strong> {event.currentParticipants}</p>
                {event.maxParticipants && (
                  <p><strong>Limite:</strong> {event.maxParticipants} pessoas</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="detail-card">
              <h3 className="card-title">📞 Contato</h3>
              <div className="card-content">
                {event.contactInfo.phone && (
                  <p><strong>Telefone:</strong> {event.contactInfo.phone}</p>
                )}
                {event.contactInfo.whatsapp && (
                  <p>
                    <strong>WhatsApp:</strong>{' '}
                    <a 
                      href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-link"
                    >
                      {event.contactInfo.whatsapp}
                    </a>
                  </p>
                )}
                {event.contactInfo.email && (
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${event.contactInfo.email}`} className="email-link">
                      {event.contactInfo.email}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Requirements */}
            {event.requirements && (
              <div className="detail-card full-width">
                <h3 className="card-title">📋 Requisitos e Observações</h3>
                <div className="card-content">
                  <p>{event.requirements}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="contact-cta">
            <h3>Interessado em participar?</h3>
            <p>Entre em contato para mais informações ou confirmação de presença</p>
            <div className="cta-buttons">
              {event.contactInfo.whatsapp && (
                <a 
                  href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  💬 WhatsApp
                </a>
              )}
              {event.contactInfo.phone && (
                <a 
                  href={`tel:${event.contactInfo.phone}`}
                  className="btn-phone"
                >
                  📞 Ligar
                </a>
              )}
              {event.contactInfo.email && (
                <a 
                  href={`mailto:${event.contactInfo.email}`}
                  className="btn-email"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          {event.images && event.images.length > 1 && (
            <div className="gallery-section">
              <h3>🖼️ Galeria</h3>
              <div className="gallery-grid">
                {event.images.slice(1).map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img src={image} alt={`Imagem ${index + 2}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-event-detail {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .loading-container, .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .event-header {
          background: white;
          padding: 20px 0;
          border-bottom: 1px solid #e1e5e9;
        }

        .back-link {
          color: #0085ff;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .hero-section {
          background: white;
          padding: 40px 0;
          border-bottom: 1px solid #e1e5e9;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .hero-image {
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-placeholder {
          aspect-ratio: 16/9;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: #676879;
          border-radius: 12px;
        }

        .event-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .category-badge, .ticket-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge {
          background: #0085ff;
          color: white;
        }

        .ticket-badge {
          background: #00ca72;
          color: white;
        }

        .event-title {
          font-size: 36px;
          font-weight: 700;
          color: #323338;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .event-description {
          font-size: 18px;
          color: #676879;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          color: #323338;
        }

        .meta-icon {
          font-size: 20px;
        }

        .details-section {
          padding: 60px 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .detail-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .detail-card.full-width {
          grid-column: 1 / -1;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .card-content p {
          margin-bottom: 8px;
          color: #676879;
          line-height: 1.5;
        }

        .whatsapp-link, .email-link {
          color: #0085ff;
          text-decoration: none;
        }

        .whatsapp-link:hover, .email-link:hover {
          text-decoration: underline;
        }

        .contact-cta {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
        }

        .contact-cta h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 8px;
        }

        .contact-cta p {
          color: #676879;
          margin-bottom: 24px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-whatsapp, .btn-phone, .btn-email {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-whatsapp {
          background: #25d366;
          color: white;
        }

        .btn-whatsapp:hover {
          background: #1fb855;
          color: white;
        }

        .btn-phone {
          background: #0085ff;
          color: white;
        }

        .btn-phone:hover {
          background: #0073e6;
          color: white;
        }

        .btn-email {
          background: #676879;
          color: white;
        }

        .btn-email:hover {
          background: #565a67;
          color: white;
        }

        .gallery-section {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .gallery-section h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 24px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .gallery-item {
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .event-title {
            font-size: 28px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}