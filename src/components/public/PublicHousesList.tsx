'use client';

import React, { useState, useEffect } from 'react';
import { House, HouseFilters, PaginationOptions } from '../../services/housesService';
import { 
  getHouses, 
  getAvailableCults,
  getBrazilianStates
} from '../../services/housesService';

interface PublicHousesListProps {
  initialCity?: string;
  initialState?: string;
}

const PublicHousesList: React.FC<PublicHousesListProps> = ({ 
  initialCity, 
  initialState 
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
    city: initialCity || '',
    state: initialState || '',
    approved: true,
    deleted: false
  });

  const cults = getAvailableCults();
  const states = getBrazilianStates();

  useEffect(() => {
    // Load houses initially with only location and approval filters
    loadHouses(true);
  }, []); // Only load once on mount

  useEffect(() => {
    // Update location filters when initial location is provided
    if (initialCity && initialState) {
      setFilters(prev => ({
        ...prev,
        city: initialCity,
        state: initialState
      }));
    }
  }, [initialCity, initialState]);

  useEffect(() => {
    // Reload houses when user actively changes filters
    const timer = setTimeout(() => {
      loadHouses(true);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [filters.searchTerm, filters.cult, filters.state, filters.city]);

  const loadHouses = async (reset = false) => {
    try {
      setLoading(true);
      setError('');

      // Build filters - only include non-empty values
      const activeFilters: HouseFilters = {
        approved: true,
        deleted: false
      };

      // Only add location filters if they have values
      if (filters.city?.trim()) {
        activeFilters.city = filters.city.trim();
      }
      if (filters.state?.trim()) {
        activeFilters.state = filters.state.trim();
      }
      
      // Only add other filters if user has actively set them
      if (filters.searchTerm?.trim()) {
        activeFilters.searchTerm = filters.searchTerm.trim();
      }
      if (filters.cult?.trim()) {
        activeFilters.cult = filters.cult.trim();
      }

      console.log('Loading houses with filters:', activeFilters);

      const pagination: PaginationOptions = {
        limitCount: 20,
        lastDoc: reset ? null : lastDoc
      };
      
      const result = await getHouses(activeFilters, pagination);

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

  const handleFilterChange = (key: keyof HouseFilters, value: string) => {
    setFilters((prev: HouseFilters) => ({
      ...prev,
      [key]: value
    }));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadHouses(false);
    }
  };

  return (
    <div className="public-houses-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Encontre Casas Espirituais</h1>
          <p className="hero-subtitle">
            Descubra casas de tradições espirituais próximas a você
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="container">
          <div className="search-card">
            <div className="search-grid">
              <div className="search-group">
                <input
                  type="text"
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Buscar por nome, culto ou dirigente..."
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={filters.cult || ''}
                  onChange={(e) => handleFilterChange('cult', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos os cultos</option>
                  {cults.map((cult: string) => (
                    <option key={cult} value={cult}>{cult}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <select
                  value={filters.state || ''}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos os estados</option>
                  {states.map((state: string) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Cidade"
                  className="filter-input"
                />
              </div>
            </div>
            
            {/* Location prompt for users without geolocation */}
            {!initialCity && !initialState && (
              <div className="location-prompt">
                <span className="location-icon">📍</span>
                <span className="location-text">
                  Para ver casas próximas a você, permita o acesso à localização ou digite sua cidade acima
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        <div className="container">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="results-header">
            <h2 className="results-title">
              {loading && houses.length === 0 ? 'Carregando casas...' : 
               houses.length > 0 ? `${houses.length} casas encontradas` : 'Casas Espirituais'}
            </h2>
            {initialCity && initialState && (
              <p className="results-location">📍 Mostrando casas próximas a {initialCity}, {initialState}</p>
            )}
            {!initialCity && !initialState && houses.length > 0 && (
              <p className="results-location">🌍 Mostrando todas as casas cadastradas</p>
            )}
            {!initialCity && !initialState && houses.length === 0 && !loading && (
              <p className="results-location">🔍 Use os filtros para encontrar casas em sua região</p>
            )}
          </div>

          {houses.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3 className="empty-title">Nenhuma casa encontrada</h3>
              <p className="empty-description">
                Tente ajustar os filtros ou explorar outras regiões
              </p>
            </div>
          ) : houses.length === 0 && loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3 className="loading-title">Carregando casas...</h3>
              <p className="loading-description">Buscando casas espirituais para você</p>
            </div>
          ) : (
            <div className="houses-grid">
              {houses.map((house) => (
                <div key={house.id} className="house-card">
                  <div className="house-image">
                    {house.logo ? (
                      <img src={house.logo} alt={house.name} />
                    ) : (
                      <div className="house-placeholder">
                        <span>🏠</span>
                      </div>
                    )}
                    <div className="house-badges">
                      <span className="cult-badge">{house.cult}</span>
                      {house.enabledShop && (
                        <span className="shop-badge">🛍️ Lojinha</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="house-content">
                    <h3 className="house-name">{house.name}</h3>
                    
                    <div className="house-meta">
                      <div className="meta-item">
                        <span className="meta-icon">👤</span>
                        <span>{house.leader.name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{house.city}, {house.state}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📞</span>
                        <span>{house.phone}</span>
                      </div>
                    </div>
                    
                    <p className="house-description">{house.about}</p>
                    
                    <div className="house-actions">
                      <a href={`/houses/${house.id}`} className="view-button">
                        Ver Detalhes
                      </a>
                      {house.whatsapp && (
                        <a 
                          href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}`} 
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
        .public-houses-container {
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
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        .search-input, .filter-input, .filter-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white !important;
          color: #323338 !important;
          -webkit-text-fill-color: #323338 !important;
        }

        .search-input:focus, .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 3px rgba(0, 133, 255, 0.1);
        }

        .search-input {
          font-size: 18px;
          padding: 16px 20px;
        }

        .location-prompt {
          margin-top: 16px;
          padding: 12px 16px;
          background: #e8f4fd;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #0c5460;
        }

        .location-icon {
          font-size: 16px;
        }

        .location-text {
          flex: 1;
          line-height: 1.4;
        }

        .results-section {
          padding: 40px 0 80px;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
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

        .loading-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        .loading-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
        }

        .loading-description {
          font-size: 16px;
          color: #676879;
          max-width: 400px;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        .houses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .house-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .house-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .house-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .house-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .house-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #676879;
        }

        .house-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cult-badge, .shop-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .shop-badge {
          background: rgba(0, 133, 255, 0.9);
        }

        .house-content {
          padding: 24px;
        }

        .house-name {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .house-meta {
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

        .house-description {
          color: #676879;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .house-actions {
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

          .hero-subtitle {
            font-size: 18px;
          }

          .search-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .results-title {
            font-size: 24px;
          }

          .houses-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .house-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicHousesList;