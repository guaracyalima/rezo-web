import React, { useState, useEffect } from 'react';
import { House, HouseFilters, PaginationOptions } from '../../../services/housesService';
import { 
  getHouses, 
  getHousesByOwner, 
  getHousesByResponsible, 
  deleteHouse,
  getAvailableCults,
  getBrazilianStates
} from '../../../services/housesService';

interface HouseListProps {
  showOwnerActions?: boolean;
  userId?: string;
  onEdit?: (house: House) => void;
  onView?: (house: House) => void;
  onCreateNew?: () => void;
}

const HouseList: React.FC<HouseListProps> = ({ 
  showOwnerActions = false, 
  userId,
  onEdit,
  onView,
  onCreateNew
}) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState<HouseFilters>({
    searchTerm: '',
    cult: '',
    city: '',
    state: '',
    approved: true,
    deleted: false
  });

  const cults = getAvailableCults();
  const states = getBrazilianStates();

  useEffect(() => {
    loadHouses(true);
  }, [filters]);

  const loadHouses = async (reset = false) => {
    try {
      setLoading(true);
      setError('');

      let result;
      
      if (showOwnerActions && userId) {
        // Load houses for specific user (owner + responsible)
        const [ownedHouses, responsibleHouses] = await Promise.all([
          getHousesByOwner(userId),
          getHousesByResponsible(userId)
        ]);
        
        // Combine and deduplicate
        const allHouses = [...ownedHouses];
        responsibleHouses.forEach(house => {
          if (!allHouses.find(h => h.id === house.id)) {
            allHouses.push(house);
          }
        });
        
        result = { houses: allHouses, lastDoc: null };
        setHasMore(false);
      } else {
        // Load public houses with filters
        const pagination: PaginationOptions = {
          limitCount: 20,
          lastDoc: reset ? null : lastDoc
        };
        
        result = await getHouses(filters, pagination);
      }

      if (reset) {
        setHouses(result.houses);
      } else {
        setHouses(prev => [...prev, ...result.houses]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(!!result.lastDoc && result.houses.length === 20);
    } catch (error: any) {
      console.error('Error loading houses:', error);
      setError(error.message || 'Erro ao carregar casas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof HouseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDelete = async (houseId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta casa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteHouse(houseId);
      setHouses(prev => prev.filter(house => house.id !== houseId));
    } catch (error: any) {
      console.error('Error deleting house:', error);
      setError(error.message || 'Erro ao excluir casa');
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadHouses(false);
    }
  };

  const getApprovalStatusBadge = (house: House) => {
    if (house.approved) {
      return (
        <span className="badge bg-success">Aprovada</span>
      );
    }
    return (
      <span className="badge bg-warning text-dark">Pendente</span>
    );
  };

  if (loading && houses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="houses-list">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">
            {showOwnerActions ? 'Minhas Casas' : 'Casas de Rezo'}
          </h2>
          <p className="text-muted mb-0">
            {houses.length} {houses.length === 1 ? 'casa encontrada' : 'casas encontradas'}
          </p>
        </div>
        {showOwnerActions && onCreateNew && (
          <button onClick={onCreateNew} className="btn-monday">
            <span>+</span> Nova Casa
          </button>
        )}
      </div>

      {/* Filters */}
      {!showOwnerActions && (
        <div className="monday-card mb-4">
          <div className="monday-card-header">
            <h3 className="monday-card-title">Filtros</h3>
          </div>
          <div className="monday-card-body">
            <div className="monday-grid monday-grid-4">
              <div className="monday-form-group">
                <label className="monday-label">Buscar</label>
                <input
                  type="text"
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Nome, culto, dirigente..."
                  className="monday-input"
                />
              </div>
              <div className="monday-form-group">
                <label className="monday-label">Culto</label>
                <select
                  value={filters.cult || ''}
                  onChange={(e) => handleFilterChange('cult', e.target.value)}
                  className="monday-select"
                >
                  <option value="">Todos os cultos</option>
                  {cults.map(cult => (
                    <option key={cult} value={cult}>{cult}</option>
                  ))}
                </select>
              </div>
              <div className="monday-form-group">
                <label className="monday-label">Estado</label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="monday-select"
                >
                  <option value="">Todos os estados</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="monday-form-group">
                <label className="monday-label">Cidade</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="monday-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}

      {/* Houses Grid */}
      {houses.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">
            {showOwnerActions ? 
              'Nenhuma casa cadastrada' : 
              'Nenhuma casa encontrada'
            }
          </h3>
          <p className="empty-state-description">
            {showOwnerActions ? 
              'Comece criando sua primeira casa de rezo.' : 
              'Tente ajustar os filtros para encontrar casas.'
            }
          </p>
          {showOwnerActions && onCreateNew && (
            <button onClick={onCreateNew} className="btn-monday">
              <span>+</span> Criar Primeira Casa
            </button>
          )}
        </div>
      ) : (
        <div className="monday-grid monday-grid-3">
          {houses.map((house) => (
            <div key={house.id} className="house-card">
              <div className="house-card-image">
                {house.logo ? (
                  <img
                    src={house.logo}
                    alt={house.name}
                    className="card-image"
                  />
                ) : (
                  <div className="card-image-placeholder">
                    <span>🏠</span>
                  </div>
                )}
                <div className="card-badges">
                  {house.approved ? (
                    <span className="status-badge status-badge-success">Aprovada</span>
                  ) : (
                    <span className="status-badge status-badge-warning">Pendente</span>
                  )}
                  {house.enabledShop && (
                    <span className="status-badge status-badge-info">Lojinha</span>
                  )}
                </div>
              </div>
              
              <div className="house-card-content">
                <div className="house-card-header">
                  <h4 className="house-title">{house.name}</h4>
                  <span className="house-cult">{house.cult}</span>
                </div>
                
                <div className="house-info">
                  <div className="info-item">
                    <span className="info-icon">👤</span>
                    <span className="info-text">{house.leader.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span className="info-text">{house.city}, {house.state}</span>
                  </div>
                </div>
                
                <p className="house-description">{house.about}</p>
                
                <div className="house-actions">
                  <button
                    onClick={() => onView?.(house)}
                    className="btn-monday-secondary"
                  >
                    Ver Detalhes
                  </button>
                  {showOwnerActions && (
                    <div className="action-group">
                      <button
                        onClick={() => onEdit?.(house)}
                        className="btn-monday-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => house.id && handleDelete(house.id)}
                        className="btn-danger"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !showOwnerActions && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-monday-secondary"
          >
            {loading ? 'Carregando...' : 'Carregar Mais'}
          </button>
        </div>
      )}

      <style jsx>{`
        .houses-list {
          width: 100%;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-state-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 8px;
        }

        .empty-state-description {
          color: #676879;
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .house-card {
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .house-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .house-card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-image-placeholder {
          width: 100%;
          height: 100%;
          background: #f5f6f8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #676879;
        }

        .card-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .house-card-content {
          padding: 20px;
        }

        .house-card-header {
          margin-bottom: 16px;
        }

        .house-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .house-cult {
          color: #0085ff;
          font-size: 14px;
          font-weight: 500;
        }

        .house-info {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #676879;
        }

        .info-icon {
          font-size: 14px;
        }

        .info-text {
          flex: 1;
        }

        .house-description {
          color: #676879;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .house-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .action-group {
          display: flex;
          gap: 8px;
        }

        .btn-danger {
          background: #ff3838;
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-danger:hover {
          background: #e63333;
        }
      `}</style>
    </div>
  );
};

export default HouseList;