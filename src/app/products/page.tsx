'use client';

import React, { useState, useEffect } from 'react';
import { Product, getProducts, ProductFilters } from '../../services/productsService';
import { useToast } from '../../contexts/ToastContext';
import PublicNavigation from '../../components/PublicNavigation';

export default function PublicProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    isActive: true,
    deleted: false
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getProducts(filters);
      setProducts(result.products);
    } catch (error: any) {
      console.error('Error loading products:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar produtos',
        message: error.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getDiscountPercentage = (product: Product) => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  return (
    <div className="public-products-page">
      <PublicNavigation />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Produtos Espirituais</h1>
          <p className="hero-subtitle">
            Encontre produtos únicos de casas espirituais e artesãos
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
                  <option value="Artesanato">Artesanato</option>
                  <option value="Livros">Livros</option>
                  <option value="Incensos">Incensos</option>
                  <option value="Velas">Velas</option>
                  <option value="Cristais">Cristais</option>
                  <option value="Óleos Essenciais">Óleos Essenciais</option>
                  <option value="Ervas">Ervas</option>
                  <option value="Decoração">Decoração</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Produtos Digitais">Produtos Digitais</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div className="filter-group">
                <input
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Preço mínimo"
                  className="filter-input"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="filter-group">
                <input
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Preço máximo"
                  className="filter-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="filter-group">
                <select
                  value={filters.isDigital === undefined ? '' : filters.isDigital ? 'digital' : 'physical'}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    isDigital: e.target.value === '' ? undefined : e.target.value === 'digital' 
                  }))}
                  className="filter-select"
                >
                  <option value="">Todos os tipos</option>
                  <option value="physical">Físico</option>
                  <option value="digital">Digital</option>
                </select>
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
              {products.length > 0 ? `${products.length} produtos encontrados` : 'Produtos Espirituais'}
            </h2>
          </div>

          {products.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">Nenhum produto encontrado</h3>
              <p className="empty-description">
                Tente ajustar os filtros ou volte mais tarde para novos produtos
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const discount = getDiscountPercentage(product);
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="product-placeholder">
                          <span>📦</span>
                        </div>
                      )}
                      <div className="product-badges">
                        <span className="category-badge">{product.category}</span>
                        {product.isFeatured && (
                          <span className="featured-badge">⭐ Destaque</span>
                        )}
                        {discount > 0 && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                        {product.isDigital && (
                          <span className="digital-badge">📱 Digital</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="product-content">
                      <h3 className="product-title">{product.name}</h3>
                      
                      <p className="product-description">
                        {product.shortDescription || product.description}
                      </p>
                      
                      <div className="product-price">
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="compare-price">{formatPrice(product.comparePrice)}</span>
                        )}
                        <span className="current-price">{formatPrice(product.price)}</span>
                      </div>

                      <div className="product-stock">
                        {product.stock > 0 ? (
                          <span className="in-stock">✅ {product.stock} disponível</span>
                        ) : (
                          <span className="out-of-stock">❌ Fora de estoque</span>
                        )}
                      </div>
                      
                      <div className="product-actions">
                        <a href={`/products/${product.id}`} className="view-button">
                          Ver Detalhes
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando produtos...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-products-page {
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

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .product-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #f1f3f4, #e8eaed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #676879;
        }

        .product-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .category-badge, .featured-badge, .discount-badge, .digital-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .featured-badge {
          background: rgba(255, 107, 53, 0.9);
        }

        .discount-badge {
          background: rgba(231, 76, 60, 0.9);
        }

        .digital-badge {
          background: rgba(0, 133, 255, 0.9);
        }

        .product-content {
          padding: 20px;
        }

        .product-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          color: #676879;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compare-price {
          text-decoration: line-through;
          color: #676879;
          font-size: 14px;
        }

        .current-price {
          font-size: 18px;
          font-weight: 700;
          color: #00ca72;
        }

        .product-stock {
          margin-bottom: 16px;
          font-size: 14px;
        }

        .in-stock {
          color: #00ca72;
        }

        .out-of-stock {
          color: #ff3333;
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        .view-button {
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          text-align: center;
          flex: 1;
          background: #0085ff;
          color: white;
        }

        .view-button:hover {
          background: #0073e6;
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

          .products-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}