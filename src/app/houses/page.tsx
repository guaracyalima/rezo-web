'use client';

import React, { useState, useEffect } from 'react';
import { House, getHouses } from '../../services/housesService';
import { useToast } from '../../contexts/ToastContext';
import PublicNavigation from '../../components/PublicNavigation';

export default function PublicHousesPage() {
  const { showToast } = useToast();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cult: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    loadHouses();
  }, [filters]);

  const loadHouses = async () => {
    try {
      setLoading(true);
      const response = await getHouses();
      const housesData = response.houses || [];
      
      // Filter only approved houses for public viewing
      let filteredHouses = housesData.filter((house: House) => house.approved);
      
      // Apply user filters
      if (filters.cult) {
        filteredHouses = filteredHouses.filter((house: House) => 
          house.cult.toLowerCase().includes(filters.cult.toLowerCase())
        );
      }
      
      if (filters.city) {
        filteredHouses = filteredHouses.filter((house: House) => 
          house.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      
      if (filters.state) {
        filteredHouses = filteredHouses.filter((house: House) => 
          house.state.toLowerCase().includes(filters.state.toLowerCase())
        );
      }
      
      setHouses(filteredHouses);
    } catch (error: any) {
      console.error('Error loading houses:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar casas',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-houses-page">
      <PublicNavigation />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Casas Espirituais</h1>
          <p className="hero-subtitle">
            Encontre casas espirituais e centros de desenvolvimento próximos a você
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
                  value={filters.cult}
                  onChange={(e) => setFilters(prev => ({ ...prev, cult: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">Todas as doutrinas</option>
                  <option value="Umbanda">Umbanda</option>
                  <option value="Candomblé">Candomblé</option>
                  <option value="Espírita">Espírita</option>
                  <option value="Santo Daime">Santo Daime</option>
                  <option value="Barquinha">Barquinha</option>
                  <option value="União do Vegetal">União do Vegetal</option>
                  <option value="Xamanismo">Xamanismo</option>
                  <option value="Budismo">Budismo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div className="filter-group">
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <input
                  type="text"
                  value={filters.state}
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
              {houses.length > 0 ? `${houses.length} casas encontradas` : 'Casas Espirituais'}
            </h2>
          </div>

          {houses.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3 className="empty-title">Nenhuma casa encontrada</h3>
              <p className="empty-description">
                Tente ajustar os filtros ou volte mais tarde para novas casas
              </p>
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
                      {house.approved && (
                        <span className="verified-badge">✓ Verificada</span>
                      )}
                      {house.enabledShop && (
                        <span className="shop-badge">🛍️ Lojinha</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="house-content">
                    <h3 className="house-title">{house.name}</h3>
                    
                    <div className="house-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{house.city}, {house.state}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">👤</span>
                        <span>{house.leader.name}</span>
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

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando casas...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-houses-page {
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

        .cult-badge, .verified-badge, .shop-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .verified-badge {
          background: rgba(0, 202, 114, 0.9);
        }

        .shop-badge {
          background: rgba(255, 107, 53, 0.9);
        }

        .house-content {
          padding: 24px;
        }

        .house-title {
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

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
          margin-left: auto;
          margin-right: auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .search-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .houses-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}