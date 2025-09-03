'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product, getProductById } from '../../../services/productsService';
import { House, getHouseById } from '../../../services/housesService';
import { useToast } from '../../../contexts/ToastContext';
import PublicNavigation from '../../../components/PublicNavigation';

export default function PublicProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProductById(productId);
      
      if (!productData) {
        showToast({
          type: 'error',
          title: 'Produto não encontrado',
          message: 'O produto solicitado não existe ou foi removido'
        });
        return;
      }
      
      if (!productData.isActive) {
        showToast({
          type: 'warning',
          title: 'Produto indisponível',
          message: 'Este produto não está disponível no momento'
        });
        return;
      }
      
      setProduct(productData);
      
      // Load house information
      if (productData.houseId) {
        const houseData = await getHouseById(productData.houseId);
        setHouse(houseData);
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar produto',
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

  const getDiscountPercentage = () => {
    if (product?.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="public-product-detail">
        <PublicNavigation />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="public-product-detail">
        <PublicNavigation />
        <div className="error-container">
          <h2>Produto não encontrado</h2>
          <p>O produto solicitado não existe ou não está disponível</p>
          <a href="/products" className="back-link">← Voltar aos produtos</a>
        </div>
      </div>
    );
  }

  const discount = getDiscountPercentage();

  return (
    <div className="public-product-detail">
      <PublicNavigation />
      
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav className="breadcrumb">
            <a href="/products">Produtos</a>
            <span className="separator">›</span>
            <a href={`/products?category=${product.category}`}>{product.category}</a>
            <span className="separator">›</span>
            <span className="current">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="product-section">
        <div className="container">
          <div className="product-layout">
            {/* Product Gallery */}
            <div className="product-gallery">
              <div className="main-image">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[selectedImageIndex]} 
                    alt={product.name}
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>📦</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="image-badges">
                  {product.isFeatured && (
                    <span className="badge featured">⭐ Destaque</span>
                  )}
                  {discount > 0 && (
                    <span className="badge discount">-{discount}%</span>
                  )}
                  {product.isDigital && (
                    <span className="badge digital">📱 Digital</span>
                  )}
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="image-thumbnails">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <span className="category-tag">{product.category}</span>
                <h1 className="product-title">{product.name}</h1>
                
                {product.shortDescription && (
                  <p className="product-subtitle">{product.shortDescription}</p>
                )}

                <div className="product-pricing">
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="compare-price">{formatPrice(product.comparePrice)}</span>
                  )}
                  <span className="current-price">{formatPrice(product.price)}</span>
                  {discount > 0 && (
                    <span className="savings">Você economiza {formatPrice(product.comparePrice! - product.price)}</span>
                  )}
                </div>

                <div className="product-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">
                      ✅ {product.stock} {product.stock === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                    </span>
                  ) : (
                    <span className="out-of-stock">❌ Produto esgotado</span>
                  )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="product-tags">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="shipping-info">
                <h3>📦 Informações de Entrega</h3>
                {product.shipping.freeShipping ? (
                  <p className="free-shipping">🚚 Entrega gratuita</p>
                ) : (
                  <p className="paid-shipping">
                    🚚 Entrega: {formatPrice(product.shipping.shippingCost || 0)}
                  </p>
                )}
                
                {product.shipping.shippingTime && (
                  <p className="shipping-time">⏱️ Prazo: {product.shipping.shippingTime}</p>
                )}
              </div>

              {/* House Info */}
              {house && (
                <div className="seller-info">
                  <h3>🏠 Vendido por</h3>
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

              {/* Contact Actions */}
              <div className="contact-actions">
                <h3>💬 Interessado?</h3>
                <p>Entre em contato para mais informações ou para realizar a compra</p>
                <div className="contact-buttons">
                  {house?.whatsapp && (
                    <a 
                      href={`https://wa.me/${house.whatsapp.replace(/\D/g, '')}?text=Olá! Tenho interesse no produto: ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-btn whatsapp"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {house?.phone && (
                    <a 
                      href={`tel:${house.phone}`}
                      className="contact-btn phone"
                    >
                      📞 Ligar
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="product-description-section">
            <h2>📋 Descrição do Produto</h2>
            <div className="description-content">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Product Specifications */}
          {(product.sku || product.weight || product.dimensions) && (
            <div className="specifications-section">
              <h2>📏 Especificações</h2>
              <div className="specs-grid">
                {product.sku && (
                  <div className="spec-item">
                    <span className="spec-label">SKU:</span>
                    <span className="spec-value">{product.sku}</span>
                  </div>
                )}
                
                {product.weight && (
                  <div className="spec-item">
                    <span className="spec-label">Peso:</span>
                    <span className="spec-value">{product.weight}kg</span>
                  </div>
                )}

                {product.dimensions && (
                  <div className="spec-item">
                    <span className="spec-label">Dimensões:</span>
                    <span className="spec-value">
                      {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                    </span>
                  </div>
                )}

                <div className="spec-item">
                  <span className="spec-label">Tipo:</span>
                  <span className="spec-value">{product.isDigital ? 'Produto Digital' : 'Produto Físico'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-product-detail {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .loading-container, .error-container {
          min-height: 70vh;
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

        .product-section {
          padding: 40px 0 80px;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-image {
          position: relative;
          aspect-ratio: 1;
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

        .badge.discount {
          background: #e74c3c;
        }

        .badge.digital {
          background: #0085ff;
        }

        .image-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border: 3px solid transparent;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: none;
          transition: all 0.2s ease;
        }

        .thumbnail.active {
          border-color: #0085ff;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
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

        .product-title {
          font-size: 36px;
          font-weight: 700;
          color: #323338;
          margin: 16px 0 8px 0;
          line-height: 1.2;
        }

        .product-subtitle {
          font-size: 18px;
          color: #676879;
          margin: 0 0 24px 0;
          line-height: 1.4;
        }

        .product-pricing {
          margin-bottom: 20px;
        }

        .compare-price {
          text-decoration: line-through;
          color: #676879;
          font-size: 20px;
          margin-right: 16px;
        }

        .current-price {
          font-size: 32px;
          font-weight: 700;
          color: #00ca72;
        }

        .savings {
          display: block;
          color: #00ca72;
          font-size: 16px;
          margin-top: 8px;
          font-weight: 500;
        }

        .product-stock {
          margin-bottom: 20px;
          font-size: 16px;
        }

        .in-stock {
          color: #00ca72;
          font-weight: 500;
        }

        .out-of-stock {
          color: #ff3333;
          font-weight: 500;
        }

        .product-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: #f1f3f4;
          color: #676879;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .shipping-info, .seller-info, .contact-actions {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .shipping-info h3, .seller-info h3, .contact-actions h3 {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
        }

        .free-shipping {
          color: #00ca72;
          font-weight: 500;
          margin: 0;
        }

        .paid-shipping, .shipping-time {
          color: #676879;
          margin: 0 0 8px 0;
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

        .contact-actions p {
          color: #676879;
          margin-bottom: 16px;
        }

        .contact-buttons {
          display: flex;
          gap: 12px;
        }

        .contact-btn {
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          flex: 1;
          text-align: center;
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

        .product-description-section, .specifications-section {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }

        .product-description-section h2, .specifications-section h2 {
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

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .spec-label {
          font-weight: 500;
          color: #676879;
        }

        .spec-value {
          color: #323338;
          font-weight: 500;
        }

        .back-link {
          color: #0085ff;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .product-title {
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

          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}