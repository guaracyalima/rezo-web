'use client';

import React, { useState } from 'react';
import { Product, deleteProduct } from '../../../services/productsService';
import { useToast } from '../../../contexts/ToastContext';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const { showToast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiscountPercentage = () => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  const handleDelete = async () => {
    if (!product.id) return;

    setDeleting(true);
    try {
      await deleteProduct(product.id);
      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showToast({
        type: 'error',
        title: 'Erro ao excluir produto',
        message: error.message || 'Tente novamente'
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const discount = getDiscountPercentage();

  return (
    <div className="product-detail">
      <div className="detail-header">
        <h2 className="detail-title">Detalhes do Produto</h2>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>

      <div className="detail-content">
        <div className="product-gallery">
          <div className="main-image">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[selectedImageIndex]} 
                alt={product.name}
                className="product-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>📦</span>
              </div>
            )}
            
            {/* Product badges on image */}
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
              {!product.isActive && (
                <span className="badge inactive">⏸️ Inativo</span>
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

        <div className="product-info">
          <div className="product-header">
            <div className="product-category">
              <span className="category-tag">{product.category}</span>
              {product.subcategory && (
                <span className="subcategory-tag">{product.subcategory}</span>
              )}
            </div>

            <h1 className="product-name">{product.name}</h1>
            
            {product.shortDescription && (
              <p className="product-short-description">{product.shortDescription}</p>
            )}

            <div className="product-pricing">
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="compare-price">{formatPrice(product.comparePrice)}</span>
              )}
              <span className="current-price">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <span className="discount-text">Você economiza {formatPrice(product.comparePrice! - product.price)}</span>
              )}
            </div>

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">
                  ✅ {product.stock} {product.stock === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                </span>
              ) : (
                <span className="out-of-stock">❌ Produto fora de estoque</span>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="product-details">
            <h3>Descrição</h3>
            <div className="product-description">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="product-specs">
              <h3>Especificações</h3>
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
                  <span className="spec-value">{product.isDigital ? 'Digital' : 'Físico'}</span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Avaliações:</span>
                  <span className="spec-value">{product.allowReviews ? 'Permitidas' : 'Não permitidas'}</span>
                </div>
              </div>
            </div>

            <div className="shipping-info">
              <h3>Informações de Entrega</h3>
              <div className="shipping-details">
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
            </div>

            <div className="product-meta">
              <h3>Informações do Sistema</h3>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Criado em:</span>
                  <span className="meta-value">{formatDate(product.createdAt)}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Atualizado em:</span>
                  <span className="meta-value">{formatDate(product.updatedAt)}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`meta-value ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="detail-actions">
          {onEdit && (
            <button 
              onClick={() => {
                console.log('Edit button clicked in ProductDetail');
                onEdit(product);
              }}
              className="action-btn edit-btn"
            >
              ✏️ Editar Produto
            </button>
          )}
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="action-btn delete-btn"
          >
            🗑️ Excluir Produto
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o produto "{product.name}"?</p>
            <p className="warning">Esta ação não pode ser desfeita.</p>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .product-detail {
          max-height: 100vh;
          overflow-y: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .detail-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #676879;
          padding: 4px;
        }

        .close-btn:hover {
          color: #323338;
        }

        .detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .main-image {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-image {
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
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badge {
          padding: 6px 12px;
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

        .badge.inactive {
          background: #95a5a6;
        }

        .image-thumbnails {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 8px;
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
          gap: 24px;
        }

        .product-category {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .category-tag, .subcategory-tag {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-tag {
          background: #e1e5e9;
          color: #676879;
        }

        .subcategory-tag {
          background: #0085ff;
          color: white;
        }

        .product-name {
          font-size: 32px;
          font-weight: 700;
          color: #323338;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .product-short-description {
          font-size: 18px;
          color: #676879;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .product-pricing {
          margin-bottom: 16px;
        }

        .compare-price {
          text-decoration: line-through;
          color: #676879;
          font-size: 18px;
          margin-right: 12px;
        }

        .current-price {
          font-size: 28px;
          font-weight: 700;
          color: #00ca72;
        }

        .discount-text {
          display: block;
          color: #00ca72;
          font-size: 14px;
          margin-top: 4px;
        }

        .product-stock {
          margin-bottom: 16px;
          font-size: 16px;
        }

        .in-stock {
          color: #00ca72;
        }

        .out-of-stock {
          color: #ff3333;
        }

        .product-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: #f1f3f4;
          color: #676879;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .product-details h3 {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
        }

        .product-description p {
          color: #676879;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .specs-grid, .meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .spec-item, .meta-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .spec-label, .meta-label {
          font-weight: 500;
          color: #676879;
        }

        .spec-value, .meta-value {
          color: #323338;
        }

        .meta-value.active {
          color: #00ca72;
        }

        .meta-value.inactive {
          color: #ff3333;
        }

        .shipping-details {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
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

        .detail-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 24px;
          border-top: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .action-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .edit-btn {
          background: #ffcb00;
          color: #323338;
        }

        .edit-btn:hover {
          background: #e6b800;
        }

        .delete-btn {
          background: #ff3333;
          color: white;
        }

        .delete-btn:hover {
          background: #e60000;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .confirm-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          text-align: center;
        }

        .confirm-modal h3 {
          color: #323338;
          margin-bottom: 16px;
        }

        .confirm-modal p {
          color: #676879;
          margin-bottom: 8px;
        }

        .warning {
          color: #ff3333;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: #f8f9fa;
          color: #323338;
          border: 1px solid #d0d4d9;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-danger {
          padding: 12px 24px;
          background: #ff3333;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .detail-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .product-name {
            font-size: 24px;
          }

          .current-price {
            font-size: 24px;
          }

          .detail-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;