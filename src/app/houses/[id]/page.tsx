'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { House, getHouseById } from '../../../services/housesService';
import { Event, getEventsByHouse } from '../../../services/eventsService';
import { useToast } from '../../../contexts/ToastContext';
import EventCard from '../../../components/dashboard/events/EventCard';
import { ProductsManager } from '../../../components/dashboard/products/ProductsManager';
import ServicesManager from '../../../components/dashboard/services/ServicesManager';
import PublicNavigation from '../../../components/PublicNavigation';

export default function PublicHouseDetailPage() {
  const params = useParams();
  const houseId = params.id as string;
  const { showToast } = useToast();
  
  const [house, setHouse] = useState<House | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'products' | 'services'>('info');

  useEffect(() => {
    if (houseId) {
      loadHouse();
      loadHouseEvents();
    }
  }, [houseId]);

  const loadHouse = async () => {
    try {
      setLoading(true);
      const houseData = await getHouseById(houseId);
      
      if (!houseData) {
        showToast({
          type: 'error',
          title: 'Casa não encontrada',
          message: 'A casa solicitada não existe ou foi removida'
        });
        return;
      }
      
      if (!houseData.approved) {
        showToast({
          type: 'warning',
          title: 'Casa não aprovada',
          message: 'Esta casa ainda não foi aprovada para visualização pública'
        });
        return;
      }
      
      setHouse(houseData);
    } catch (error: any) {
      console.error('Error loading house:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar casa',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHouseEvents = async () => {
    try {
      setEventsLoading(true);
      const eventsData = await getEventsByHouse(houseId);
      // Filter only public events for public viewing
      const publicEvents = eventsData.filter(event => event.isPublic);
      setEvents(publicEvents);
    } catch (error: any) {
      console.error('Error loading house events:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar eventos',
        message: 'Não foi possível carregar os eventos da casa'
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const getImageGallery = () => {
    const images: string[] = [];
    if (house?.logo) images.push(house.logo);
    if (house?.gallery) images.push(...house.gallery);
    return images;
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando casa...</p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="error-container">
        <h2>Casa não encontrada</h2>
        <p>A casa solicitada não existe ou não está disponível publicamente</p>
        <a href="/houses" className="back-link">← Voltar às casas</a>
      </div>
    );
  }

  const images = getImageGallery();

  return (
    <div className="public-house-detail">
      <PublicNavigation />
      
      {/* Header */}
      <div className="house-header">
        <div className="container">
          <a href="/houses" className="back-link">← Voltar às casas</a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-image">
              {images.length > 0 ? (
                <img src={images[selectedImageIndex]} alt={house.name} />
              ) : (
                <div className="hero-placeholder">
                  <span>🏠</span>
                </div>
              )}
              {images.length > 1 && (
                <div className="image-nav">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`nav-dot ${selectedImageIndex === index ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="hero-info">
              <div className="house-badges">
                <span className="cult-badge">{house.cult}</span>
                {house.approved && (
                  <span className="verified-badge">✓ Verificada</span>
                )}
                {house.enabledShop && (
                  <span className="shop-badge">🛍️ Lojinha</span>
                )}
              </div>
              
              <h1 className="house-title">{house.name}</h1>
              <p className="house-description">{house.about}</p>
              
              <div className="house-meta">
                <div className="meta-item">
                  <span className="meta-icon">📍</span>
                  <span>{house.city}, {house.state}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <span>Dirigente: {house.leader.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-section">
        <div className="container">
          <div className="tabs-nav">
            <button
              onClick={() => setActiveTab('info')}
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            >
              ℹ️ Informações
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            >
              📅 Eventos ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            >
              🛍️ Produtos
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            >
              🔮 Serviços
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-section">
        <div className="container">
          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="info-grid">
                <div className="info-card">
                  <h3 className="card-title">📞 Contato</h3>
                  <div className="card-content">
                    <p><strong>Telefone:</strong> {house.phone}</p>
                    {house.whatsapp && (
                      <p>
                        <strong>WhatsApp:</strong>{' '}
                        <a 
                          href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whatsapp-link"
                        >
                          {house.whatsapp}
                        </a>
                      </p>
                    )}
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${house.leader.contact}`} className="email-link">
                        {house.leader.contact}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <h3 className="card-title">📍 Localização</h3>
                  <div className="card-content">
                    <p><strong>Endereço:</strong> {house.street}, {house.number}</p>
                    {house.complement && <p>{house.complement}</p>}
                    <p><strong>Bairro:</strong> {house.neighborhood}</p>
                    <p><strong>Cidade:</strong> {house.city}, {house.state}</p>
                    <p><strong>CEP:</strong> {house.zipCode}</p>
                  </div>
                </div>

                <div className="info-card">
                  <h3 className="card-title">👤 Dirigente</h3>
                  <div className="card-content">
                    <div className="leader-info">
                      {house.leader.photo ? (
                        <img src={house.leader.photo} alt={house.leader.name} className="leader-photo" />
                      ) : (
                        <div className="leader-placeholder">👤</div>
                      )}
                      <div>
                        <p><strong>{house.leader.name}</strong></p>
                        <p className="leader-contact">{house.leader.contact}</p>
                        {house.leader.bio && <p className="leader-bio">{house.leader.bio}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {house.accessibility && (
                  <div className="info-card">
                    <h3 className="card-title">♿ Acessibilidade</h3>
                    <div className="card-content">
                      <p>{house.accessibility}</p>
                    </div>
                  </div>
                )}

                {(house.socialMedia?.facebook || house.socialMedia?.instagram) && (
                  <div className="info-card">
                    <h3 className="card-title">📱 Redes Sociais</h3>
                    <div className="card-content">
                      <div className="social-links">
                        {house.socialMedia.facebook && (
                          <a 
                            href={house.socialMedia.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link facebook"
                          >
                            📘 Facebook
                          </a>
                        )}
                        {house.socialMedia.instagram && (
                          <a 
                            href={house.socialMedia.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link instagram"
                          >
                            📷 Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>📅 Eventos da Casa</h3>
                <p>Confira os próximos eventos e atividades</p>
              </div>
              
              {eventsLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando eventos...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h4>Nenhum evento público disponível</h4>
                  <p>Esta casa ainda não possui eventos públicos cadastrados</p>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map((event) => (
                    <div key={event.id} className="public-event-card">
                      <div className="event-image">
                        {event.images && event.images.length > 0 ? (
                          <img src={event.images[0]} alt={event.title} />
                        ) : (
                          <div className="event-placeholder">📅</div>
                        )}
                        <div className="event-badges">
                          <span className="category-badge">{event.category}</span>
                          {event.ticketInfo.type === 'free' && (
                            <span className="free-badge">🆓 Gratuito</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="event-content">
                        <h4 className="event-title">{event.title}</h4>
                        <p className="event-description">{event.description}</p>
                        
                        <div className="event-meta">
                          <div className="meta-item">
                            <span>📅 {formatDate(event.startDate)}</span>
                          </div>
                          <div className="meta-item">
                            <span>⏰ {formatTime(event.startDate)}</span>
                          </div>
                        </div>
                        
                        <div className="event-actions">
                          <a href={`/events/${event.id}`} className="view-btn">
                            Ver Detalhes
                          </a>
                          {event.contactInfo.whatsapp && (
                            <a 
                              href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="whatsapp-btn"
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
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>🛍️ Produtos da Casa</h3>
                <p>Confira os produtos disponíveis nesta casa</p>
              </div>
              
              <ProductsManager
                houseId={houseId}
                showOwnerActions={false}
              />
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>🔮 Serviços</h3>
                <p>Conheça os serviços oferecidos por esta casa</p>
              </div>
              
              <ServicesManager
                houseId={houseId}
                showOwnerActions={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h3>Interessado em visitar esta casa?</h3>
            <p>Entre em contato para mais informações</p>
            <div className="cta-buttons">
              {house.whatsapp && (
                <a 
                  href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  💬 WhatsApp
                </a>
              )}
              <a 
                href={`tel:${house.phone}`}
                className="btn-phone"
              >
                📞 Ligar
              </a>
              <a 
                href={`mailto:${house.leader.contact}`}
                className="btn-email"
              >
                ✉️ Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .public-house-detail {
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

        .house-header {
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
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .hero-image {
          position: relative;
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
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: #676879;
        }

        .image-nav {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-dot.active {
          background: white;
        }

        .house-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .cult-badge, .verified-badge, .shop-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .cult-badge {
          background: #0085ff;
          color: white;
        }

        .verified-badge {
          background: #00ca72;
          color: white;
        }

        .shop-badge {
          background: #ff6b35;
          color: white;
        }

        .house-title {
          font-size: 36px;
          font-weight: 700;
          color: #323338;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .house-description {
          font-size: 18px;
          color: #676879;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .house-meta {
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

        .tabs-section {
          background: white;
          border-bottom: 1px solid #e1e5e9;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .tabs-nav {
          display: flex;
          gap: 0;
          overflow-x: auto;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 500;
          color: #676879;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #323338;
          background: #f8f9fa;
        }

        .tab-btn.active {
          color: #0085ff;
          border-bottom-color: #0085ff;
        }

        .content-section {
          padding: 40px 0;
        }

        .tab-content {
          min-height: 400px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-header h3 {
          font-size: 28px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 8px;
        }

        .section-header p {
          color: #676879;
          font-size: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .card-content p {
          margin-bottom: 8px;
          color: #676879;
          line-height: 1.5;
        }

        .leader-info {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .leader-photo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .leader-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f1f3f4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #676879;
        }

        .leader-contact {
          font-size: 14px;
          color: #676879;
        }

        .leader-bio {
          font-size: 14px;
          color: #676879;
          margin-top: 8px;
        }

        .social-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-link {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .social-link.facebook {
          background: #1877f2;
          color: white;
        }

        .social-link.instagram {
          background: #e4405f;
          color: white;
        }

        .social-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .public-event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .public-event-card:hover {
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

        .category-badge, .free-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .free-badge {
          background: rgba(0, 202, 114, 0.9);
        }

        .event-content {
          padding: 20px;
        }

        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .event-description {
          color: #676879;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-meta {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .event-meta .meta-item {
          font-size: 14px;
          color: #676879;
        }

        .event-actions {
          display: flex;
          gap: 8px;
        }

        .view-btn, .whatsapp-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          flex: 1;
          text-align: center;
        }

        .view-btn {
          background: #0085ff;
          color: white;
        }

        .view-btn:hover {
          background: #0073e6;
          color: white;
        }

        .whatsapp-btn {
          background: #25d366;
          color: white;
        }

        .whatsapp-btn:hover {
          background: #1fb855;
          color: white;
        }

        .loading-state, .empty-state, .coming-soon {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-icon, .coming-soon-icon {
          font-size: 64px;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-state h4, .coming-soon h4 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
        }

        .empty-state p, .coming-soon p {
          color: #676879;
          font-size: 16px;
        }

        .contact-cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 0;
        }

        .cta-content {
          text-align: center;
        }

        .cta-content h3 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .cta-content p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 32px;
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
          transform: translateY(-2px);
        }

        .btn-phone {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-phone:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
        }

        .btn-email {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-email:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
        }

        .whatsapp-link, .email-link {
          color: #0085ff;
          text-decoration: none;
        }

        .whatsapp-link:hover, .email-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .house-title {
            font-size: 28px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .tabs-nav {
            justify-content: flex-start;
          }

          .tab-btn {
            padding: 12px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}