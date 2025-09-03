'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFilters, getProducts, getProductsByHouse, getProductsBySeller, deleteProduct } from '../../../services/productsService';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';

interface ProductsManagerProps {
  userId?: string;
  houseId?: string;
  showOwnerActions?: boolean;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  userId,
  houseId,
  showOwnerActions = true
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    isActive: true,
    deleted: false
  });

  useEffect(() => {
    loadProducts();
  }, [userId, houseId, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      let productsData: Product[];

      if (houseId) {
        // Load products for a specific house
        productsData = await getProductsByHouse(houseId);
      } else if (userId && showOwnerActions) {
        // Load user's products
        productsData = await getProductsBySeller(userId);
      } else {
        // Load public products with filters
        const result = await getProducts(filters);
        productsData = result.products;
      }

      setProducts(productsData);
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

  const handleCreateProduct = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Edit product clicked:', product.id);
    setEditingProduct(product);
    setShowCreateForm(true);
  };

  const handleViewProduct = (product: Product) => {
    console.log('Viewing product:', product.id, 'showOwnerActions:', showOwnerActions);
    if (showOwnerActions) {
      // In dashboard, show ProductDetail component
      setSelectedProduct(product);
    } else {
      // In public view, redirect to public product page
      window.open(`/products/${product.id}`, '_blank');
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleProductSaved = () => {
    loadProducts();
    handleCloseForm();
    showToast({
      type: 'success',
      title: 'Produto salvo com sucesso!',
      message: 'Seu produto foi criado/atualizado e está disponível para visualização'
    });
  };

  const handleProductDeleted = () => {
    loadProducts();
    handleCloseDetail();
    showToast({
      type: 'success',
      title: 'Produto excluído',
      message: 'O produto foi removido com sucesso'
    });
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!product.id) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir este produto?');
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      showToast({
        type: 'success',
        title: 'Produto excluído',
        message: 'O produto foi removido com sucesso'
      });
      loadProducts();
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showToast({
        type: 'error',
        title: 'Erro ao excluir produto',
        message: error.message || 'Tente novamente'
      });
    }
  };

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onClose={handleCloseDetail}
        onEdit={showOwnerActions ? () => handleEditProduct(selectedProduct) : undefined}
        onDelete={showOwnerActions ? () => handleDeleteProduct(selectedProduct) : undefined}
        showActions={showOwnerActions}
      />
    );
  }

  if (showCreateForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleProductSaved}
        onCancel={handleCloseForm}
        houseId={houseId}
      />
    );
  }

  return (
    <div className="products-manager">
      {/* Header */}
      <div className="products-header">
        <div className="header-left">
          <h2 className="products-title">
            {houseId ? 'Produtos da Casa' : showOwnerActions ? 'Meus Produtos' : 'Produtos'}
          </h2>
          <p className="products-count">
            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
          </p>
        </div>
        
        <div className="header-right">
          {showOwnerActions && (
            <button 
              onClick={handleCreateProduct}
              className="btn-monday"
            >
              + Criar Produto
            </button>
          )}
          
          <div className="view-toggle">
            <button
              onClick={() => setView('grid')}
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            >
              ⊞ Grade
            </button>
            <button
              onClick={() => setView('list')}
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
            >
              ☰ Lista
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {!showOwnerActions && (
        <div className="products-filters">
          <div className="filter-group">
            <label className="monday-label">Categoria</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="monday-select"
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
            <label className="monday-label">Preço Mínimo</label>
            <input
              type="number"
              value={filters.priceMin || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="R$ 0,00"
              className="monday-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="filter-group">
            <label className="monday-label">Preço Máximo</label>
            <input
              type="number"
              value={filters.priceMax || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="R$ 1000,00"
              className="monday-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="filter-group">
            <label className="monday-label">Tipo</label>
            <select
              value={filters.isDigital === undefined ? '' : filters.isDigital ? 'digital' : 'physical'}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                isDigital: e.target.value === '' ? undefined : e.target.value === 'digital' 
              }))}
              className="monday-select"
            >
              <option value="">Todos os tipos</option>
              <option value="physical">Físico</option>
              <option value="digital">Digital</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="products-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">
              {houseId ? 'Nenhum produto para esta casa' : showOwnerActions ? 'Nenhum produto criado' : 'Nenhum produto encontrado'}
            </h3>
            <p className="empty-description">
              {houseId 
                ? 'Esta casa ainda não possui produtos cadastrados'
                : showOwnerActions 
                  ? 'Crie seu primeiro produto para começar a vender'
                  : 'Tente ajustar os filtros ou volte mais tarde'
              }
            </p>
            {showOwnerActions && (
              <button 
                onClick={handleCreateProduct}
                className="btn-monday"
              >
                {houseId ? 'Criar Produto para esta Casa' : 'Criar Primeiro Produto'}
              </button>
            )}
          </div>
        ) : (
          <div className={`products-${view}`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={() => handleViewProduct(product)}
                onEdit={showOwnerActions ? handleEditProduct : undefined}
                onDelete={showOwnerActions ? () => handleDeleteProduct(product) : undefined}
                showActions={showOwnerActions}
                layout={view}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .products-manager {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .products-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .products-count {
          font-size: 14px;
          color: #676879;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          overflow: hidden;
        }

        .view-btn {
          background: white;
          border: none;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: #0085ff;
          color: white;
        }

        .view-btn:hover:not(.active) {
          background: #f5f6f8;
        }

        .products-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #f8f9fa;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .products-content {
          padding: 24px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
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
          margin-bottom: 24px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .header-right {
            justify-content: space-between;
          }

          .products-filters {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsManager;