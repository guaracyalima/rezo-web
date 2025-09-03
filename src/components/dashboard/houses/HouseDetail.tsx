import React, { useState, useEffect } from 'react';
import { House, getHouseById } from '../../../services/housesService';
import { Event, getEventsByHouse } from '../../../services/eventsService';
import { useToast } from '../../../contexts/ToastContext';
import { EventsManager } from '../events/EventsManager';
import { ProductsManager } from '../products/ProductsManager';

interface HouseDetailProps {
  houseId: string;
  onEdit?: (house: House) => void;
  onClose?: () => void;
  showActions?: boolean;
}

const HouseDetail: React.FC<HouseDetailProps> = ({ 
  houseId, 
  onEdit, 
  onClose, 
  showActions = false 
}) => {
  const { showToast } = useToast();
  const [house, setHouse] = useState<House | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'products'>('info');

  useEffect(() => {
    loadHouse();
    loadHouseEvents();
  }, [houseId]);

  const loadHouse = async () => {
    try {
      setLoading(true);
      setError('');
      const houseData = await getHouseById(houseId);
      if (houseData) {
        setHouse(houseData);
      } else {
        setError('Casa não encontrada');
        showToast({
          type: 'error',
          title: 'Casa não encontrada',
          message: 'A casa solicitada não existe ou foi removida'
        });
      }
    } catch (error: any) {
      console.error('Error loading house:', error);
      setError(error.message || 'Erro ao carregar casa');
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
      setEvents(eventsData);
    } catch (error: any) {
      console.error('Error loading house events:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar eventos',
        message: error.message || 'Não foi possível carregar os eventos da casa'
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

  const images = getImageGallery();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Casa não encontrada'}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn btn-outline-primary mt-3"
          >
            ← Voltar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-lg mb-4">
        <div className="row g-0">
          <div className="col-12 col-md-5">
            <div className="ratio ratio-16x9 bg-secondary">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={house.name}
                  className="img-fluid object-fit-cover rounded-start"
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                  <span className="fs-1">🏠</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-2 justify-content-center">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`btn btn-sm ${selectedImageIndex === index ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    <img src={image} alt={`Imagem ${index + 1}`} className="img-thumbnail" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="col-12 col-md-7">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h3 fw-bold mb-2">{house.name}</h1>
                  <span className="badge bg-primary me-2">{house.cult}</span>
                  {house.approved && (
                    <span className="badge bg-success me-2">✓ Verificada</span>
                  )}
                  {house.enabledShop && (
                    <span className="badge bg-info">🛍️ Lojinha</span>
                  )}
                </div>
                {showActions && onEdit && (
                  <button
                    onClick={() => onEdit(house)}
                    className="btn btn-outline-primary"
                  >
                    Editar Casa
                  </button>
                )}
              </div>
              <div className="mb-3">
                <h5 className="fw-bold">Sobre a Casa</h5>
                <p className="text-muted">{house.about}</p>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold">Dirigente</h5>
                <div className="d-flex align-items-center gap-3">
                  {house.leader.photo ? (
                    <img src={house.leader.photo} alt={house.leader.name} className="img-thumbnail rounded-circle" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                  ) : (
                    <div className="img-thumbnail rounded-circle bg-secondary d-flex justify-content-center align-items-center" style={{ width: 60, height: 60 }}>
                      <span className="fs-4">👤</span>
                    </div>
                  )}
                  <div>
                    <div className="fw-bold">{house.leader.name}</div>
                    <div className="text-muted small">{house.leader.contact}</div>
                    {house.leader.bio && <div className="text-muted small">{house.leader.bio}</div>}
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="fw-bold">Contato</h6>
                  <div className="mb-1">Telefone: <span className="text-muted">{house.phone}</span></div>
                  {house.whatsapp && (
                    <div className="mb-1">WhatsApp: <a href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-success">{house.whatsapp}</a></div>
                  )}
                  <div className="mb-1">Email: <a href={`mailto:${house.leader.contact}`} className="text-primary">{house.leader.contact}</a></div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold">Localização</h6>
                  <div>{house.street}, {house.number}</div>
                  {house.complement && <div>{house.complement}</div>}
                  <div>{house.neighborhood}</div>
                  <div>{house.city}, {house.state}</div>
                  <div>CEP: {house.zipCode}</div>
                </div>
              </div>
              {house.accessibility && (
                <div className="mb-3">
                  <h6 className="fw-bold">Acessibilidade</h6>
                  <div className="text-muted">{house.accessibility}</div>
                </div>
              )}
              {(house.socialMedia?.facebook || house.socialMedia?.instagram) && (
                <div className="mb-3">
                  <h6 className="fw-bold">Redes Sociais</h6>
                  <div className="d-flex gap-2">
                    {house.socialMedia.facebook && (
                      <a href={house.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                        📘 Facebook
                      </a>
                    )}
                    {house.socialMedia.instagram && (
                      <a href={house.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-danger">
                        📷 Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div className="border-top pt-3 mt-3">
                <div className="d-flex gap-2 mb-3">
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`btn btn-sm ${activeTab === 'info' ? 'btn-primary' : 'btn-outline-primary'}`}
                  >
                    ℹ️ Informações
                  </button>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-outline-primary'}`}
                  >
                    📅 Eventos
                  </button>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'}`}
                  >
                    🛍️ Produtos
                  </button>
                </div>

                {activeTab === 'info' && (
                  <div>
                    <h6 className="fw-bold">Ações Rápidas</h6>
                    <div className="d-flex gap-2 flex-wrap">
                      <button 
                        onClick={() => setActiveTab('events')}
                        className="btn btn-outline-primary btn-sm"
                      >
                        📅 Ver Eventos
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">🔮 Ver Atendimentos</button>
                      {house.enabledShop && (
                        <button className="btn btn-outline-success btn-sm">🛍️ Ver Lojinha</button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div>
                    <EventsManager
                      houseId={houseId}
                      showOwnerActions={showActions}
                    />
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <ProductsManager
                      houseId={houseId}
                      showOwnerActions={showActions}
                    />
                  </div>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-outline-secondary mt-4"
                >
                  ← Voltar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;