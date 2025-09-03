import React from 'react';
import { Product } from '../../../services/productsService';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  showActions = false,
  layout = 'grid'
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getDiscountPercentage = () => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  const discount = getDiscountPercentage();

  if (layout === 'list') {
    return (
      <div 
        className="product-card-list"
        onClick={() => onView && onView(product)}
        style={{ cursor: onView ? 'pointer' : 'default' }}
      >
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-placeholder">
              <span>📦</span>
            </div>
          )}
          {product.isFeatured && (
            <div className="featured-badge">⭐ Destaque</div>
          )}
          {discount > 0 && (
            <div className="discount-badge">-{discount}%</div>
          )}
        </div>

        <div className="product-content">
          <div className="product-header">
            <h3 className="product-title">{product.name}</h3>
            <div className="product-badges">
              <span className="category-badge">{product.category}</span>
              {product.isDigital && (
                <span className="digital-badge">📱 Digital</span>
              )}
              {!product.isActive && (
                <span className="inactive-badge">⏸️ Inativo</span>
              )}
            </div>
          </div>

          <p className="product-description">
            {product.shortDescription || product.description}
          </p>

          <div className="product-meta">
            <div className="product-price">
              {product.comparePrice && (
                <span className="compare-price">{formatPrice(product.comparePrice)}</span>
              )}
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>
            
            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">✅ {product.stock} em estoque</span>
              ) : (
                <span className="out-of-stock">❌ Fora de estoque</span>
              )}
            </div>
          </div>

          {(showActions || onView) && (
            <div className="product-actions" onClick={(e) => e.stopPropagation()}>
              {onView && (
                <button onClick={(e) => { e.stopPropagation(); onView(product); }} className="action-btn view-btn">
                  👁️ Ver
                </button>
              )}
              {showActions && onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="action-btn edit-btn">
                  ✏️ Editar
                </button>
              )}
              {showActions && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(product); }} className="action-btn delete-btn">
                  🗑️ Excluir
                </button>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .product-card-list {
            display: flex;
            gap: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid #e1e5e9;
          }

          .product-card-list:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .product-image {
            position: relative;
            width: 120px;
            height: 120px;
            flex-shrink: 0;
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
            font-size: 32px;
            color: #676879;
          }

          .featured-badge, .discount-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ff6b35;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }

          .discount-badge {
            background: #e74c3c;
          }

          .product-content {
            flex: 1;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .product-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .product-title {
            font-size: 18px;
            font-weight: 600;
            color: #323338;
            margin: 0;
            line-height: 1.3;
          }

          .product-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .category-badge, .digital-badge, .inactive-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .category-badge {
            background: #e1e5e9;
            color: #676879;
          }

          .digital-badge {
            background: #0085ff;
            color: white;
          }

          .inactive-badge {
            background: #ff3333;
            color: white;
          }

          .product-description {
            color: #676879;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .product-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
          }

          .product-price {
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
            font-size: 12px;
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
            margin-top: 8px;
          }

          .action-btn {
            background: none;
            border: 1px solid #d0d4d9;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .view-btn:hover {
            background: #0085ff;
            color: white;
            border-color: #0085ff;
          }

          .edit-btn:hover {
            background: #ffcb00;
            color: white;
            border-color: #ffcb00;
          }

          .delete-btn:hover {
            background: #ff3333;
            color: white;
            border-color: #ff3333;
          }
        `}</style>
      </div>
    );
  }

  // Grid layout
  return (
    <div 
      className="product-card-grid"
      onClick={() => onView && onView(product)}
      style={{ cursor: onView ? 'pointer' : 'default' }}
    >
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <span>📦</span>
          </div>
        )}
        <div className="product-badges">
          {product.isFeatured && (
            <span className="featured-badge">⭐</span>
          )}
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {product.isDigital && (
            <span className="digital-badge">📱</span>
          )}
          {!product.isActive && (
            <span className="inactive-badge">⏸️</span>
          )}
        </div>
      </div>

      <div className="product-content">
        <div className="product-category">
          <span className="category-tag">{product.category}</span>
        </div>

        <h3 className="product-title">{product.name}</h3>
        
        <p className="product-description">
          {product.shortDescription || product.description}
        </p>

        <div className="product-price">
          {product.comparePrice && (
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

        {onView && (
          <div className="product-actions" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onView(product); }} className="action-btn primary">
              {showActions ? 'Ver Detalhes' : 'Ver Produto'}
            </button>
            {showActions && onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="action-btn secondary">
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card-grid {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e1e5e9;
        }

        .product-card-grid:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .product-image {
          position: relative;
          height: 200px;
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

        .featured-badge, .discount-badge, .digital-badge, .inactive-badge {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .featured-badge {
          background: #ff6b35;
        }

        .discount-badge {
          background: #e74c3c;
        }

        .digital-badge {
          background: #0085ff;
        }

        .inactive-badge {
          background: #95a5a6;
        }

        .product-content {
          padding: 20px;
        }

        .product-category {
          margin-bottom: 8px;
        }

        .category-tag {
          background: #f1f3f4;
          color: #676879;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .product-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 8px 0 12px 0;
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
          -webkit-line-clamp: 3;
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
          font-size: 20px;
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

        .action-btn {
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          flex: 1;
        }

        .action-btn.primary {
          background: #0085ff;
          color: white;
        }

        .action-btn.primary:hover {
          background: #0073e6;
        }

        .action-btn.secondary {
          background: #f8f9fa;
          color: #323338;
          border: 1px solid #d0d4d9;
        }

        .action-btn.secondary:hover {
          background: #e8eaed;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;