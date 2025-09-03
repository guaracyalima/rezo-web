'use client';

import React, { useState, useEffect } from 'react';
import { Product, CreateProductData, createProduct, updateProduct, uploadProductImage, getProductCategories } from '../../../services/productsService';
import { getHousesByOwner } from '../../../services/housesService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
  houseId?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  houseId
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [availableHouses, setAvailableHouses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    shortDescription: '',
    houseId: houseId || '',
    category: '',
    price: 0,
    comparePrice: 0,
    stock: 1,
    images: [],
    isDigital: false,
    isFeatured: false,
    allowReviews: true,
    shipping: {
      freeShipping: false,
      shippingCost: 0,
      shippingTime: ''
    }
  });

  const categories = getProductCategories();

  useEffect(() => {
    loadUserHouses();
  }, []);

  const loadUserHouses = async () => {
    try {
      if (user) {
        console.log('Loading houses for user:', user.uid);
        const userHouses = await getHousesByOwner(user.uid);
        console.log('User houses:', userHouses);
        
        setAvailableHouses(userHouses);
        
        // If no houseId is provided and user has houses, select the first one
        if (!houseId && userHouses.length > 0 && userHouses[0].id) {
          setFormData(prev => ({ ...prev, houseId: userHouses[0].id! }));
        }
      }
    } catch (error) {
      console.error('Error loading user houses:', error);
    }
  };

  useEffect(() => {
    if (product) {
      console.log('ProductForm: Loading product for edit:', product.id);
      const isCustomCategory = !categories.includes(product.category);
      
      setFormData({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription || '',
        houseId: product.houseId,
        category: isCustomCategory ? 'Outro' : product.category,
        subcategory: product.subcategory || '',
        price: product.price,
        comparePrice: product.comparePrice || 0,
        stock: product.stock,
        sku: product.sku || '',
        weight: product.weight || 0,
        images: product.images,
        tags: product.tags || [],
        isDigital: product.isDigital,
        isFeatured: product.isFeatured,
        allowReviews: product.allowReviews,
        shipping: {
          freeShipping: product.shipping?.freeShipping || false,
          shippingCost: product.shipping?.shippingCost || 0,
          shippingTime: product.shipping?.shippingTime || ''
        },
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 }
      });

      if (isCustomCategory) {
        setCustomCategory(product.category);
      }
    } else {
      console.log('ProductForm: Creating new product');
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShippingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      }
    }));
  };

  const handleDimensionsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        length: prev.dimensions?.length || 0,
        width: prev.dimensions?.width || 0,
        height: prev.dimensions?.height || 0,
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create temporary product ID for upload
        const tempId = product?.id || 'temp_' + Date.now();
        return await uploadProductImage(file, tempId);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      showToast({
        type: 'success',
        title: 'Imagens enviadas',
        message: `${uploadedUrls.length} imagem(ns) adicionada(s) com sucesso`
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showToast({
        type: 'error',
        title: 'Erro ao enviar imagens',
        message: error.message || 'Tente novamente'
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast({
        type: 'error',
        title: 'Nome obrigatório',
        message: 'Por favor, informe o nome do produto'
      });
      return false;
    }

    if (!formData.description.trim()) {
      showToast({
        type: 'error',
        title: 'Descrição obrigatória',
        message: 'Por favor, informe a descrição do produto'
      });
      return false;
    }

    if (!formData.category) {
      showToast({
        type: 'error',
        title: 'Categoria obrigatória',
        message: 'Por favor, selecione uma categoria'
      });
      return false;
    }

    if (formData.category === 'Outro' && !customCategory.trim()) {
      showToast({
        type: 'error',
        title: 'Nova categoria obrigatória',
        message: 'Por favor, digite o nome da nova categoria'
      });
      return false;
    }

    if (!formData.houseId) {
      showToast({
        type: 'error',
        title: 'Casa obrigatória',
        message: 'Por favor, selecione uma casa'
      });
      return false;
    }

    if (formData.price <= 0) {
      showToast({
        type: 'error',
        title: 'Preço inválido',
        message: 'O preço deve ser maior que zero'
      });
      return false;
    }

    if (formData.stock < 0) {
      showToast({
        type: 'error',
        title: 'Estoque inválido',
        message: 'O estoque não pode ser negativo'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (product?.id) {
        // Update existing product
        console.log('Updating product:', product.id);
        await updateProduct(product.id, formData);
      } else {
        // Create new product
        console.log('Creating new product');
        await createProduct(formData);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar produto',
        message: error.message || 'Tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <div className="form-header">
        <h2 className="form-title">
          {product ? 'Editar Produto' : 'Criar Produto'}
        </h2>
        <button onClick={onCancel} className="close-btn">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Informações Básicas</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">Nome do Produto *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do produto"
                className="monday-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Casa *</label>
              <select
                value={formData.houseId}
                onChange={(e) => handleInputChange('houseId', e.target.value)}
                className="monday-select"
                required
                disabled={!!houseId}
              >
                <option value="">Selecione uma casa</option>
                {availableHouses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
              {availableHouses.length === 0 && (
                <small className="form-help error">
                  Nenhuma casa encontrada. Você precisa ser responsável por uma casa para criar produtos.
                </small>
              )}
              {houseId && (
                <small className="form-help">
                  Casa selecionada automaticamente para este contexto.
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  handleInputChange('category', selectedCategory);
                  if (selectedCategory !== 'Outro') {
                    setCustomCategory('');
                  }
                }}
                className="monday-select"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {formData.category === 'Outro' && (
              <div className="form-group">
                <label className="monday-label">Nova Categoria *</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomCategory(value);
                    handleInputChange('category', value);
                  }}
                  placeholder="Digite o nome da nova categoria"
                  className="monday-input"
                  required
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="monday-label">Descrição Curta</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Breve descrição do produto"
              className="monday-input"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="monday-label">Descrição Completa *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto"
              className="monday-textarea"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="monday-label">Tags (pressione Enter para adicionar)</label>
            <div className="tags-input-container">
              <div className="tags-display">
                {formData.tags?.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Digite uma tag e pressione Enter"
                className="monday-input"
              />
            </div>
            <small className="form-help">
              Exemplo: esotérico, cristal, proteção, meditação
            </small>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3 className="section-title">Preços e Estoque</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">Preço *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0,00"
                className="monday-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Preço Comparativo</label>
              <input
                type="number"
                value={formData.comparePrice}
                onChange={(e) => handleInputChange('comparePrice', Number(e.target.value))}
                placeholder="0,00"
                className="monday-input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Estoque *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                placeholder="1"
                className="monday-input"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="monday-label">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Código do produto"
                className="monday-input"
              />
            </div>

            <div className="form-group">
              <label className="monday-label">Peso (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                placeholder="0,00"
                className="monday-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3 className="section-title">Imagens</h3>
          
          <div className="image-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="file-input"
              id="product-images"
              disabled={uploadingImages}
            />
            <label htmlFor="product-images" className="upload-btn">
              {uploadingImages ? 'Enviando...' : '📷 Adicionar Imagens'}
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="images-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Produto ${index + 1}`} />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="form-section">
          <h3 className="section-title">Entrega</h3>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.shipping.freeShipping}
                onChange={(e) => handleShippingChange('freeShipping', e.target.checked)}
              />
              Entrega gratuita
            </label>
          </div>

          {!formData.shipping.freeShipping && (
            <div className="form-row">
              <div className="form-group">
                <label className="monday-label">Custo de Entrega</label>
                <input
                  type="number"
                  value={formData.shipping.shippingCost}
                  onChange={(e) => handleShippingChange('shippingCost', Number(e.target.value))}
                  placeholder="0,00"
                  className="monday-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="monday-label">Tempo de Entrega</label>
                <input
                  type="text"
                  value={formData.shipping.shippingTime}
                  onChange={(e) => handleShippingChange('shippingTime', e.target.value)}
                  placeholder="5-10 dias úteis"
                  className="monday-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="form-section">
          <h3 className="section-title">Opções</h3>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isDigital}
                onChange={(e) => handleInputChange('isDigital', e.target.checked)}
              />
              Produto digital
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
              />
              Produto em destaque
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.allowReviews}
                onChange={(e) => handleInputChange('allowReviews', e.target.checked)}
              />
              Permitir avaliações
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-monday">
            {loading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .product-form {
          max-height: 100vh;
          overflow-y: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e1e5e9;
          background: #fafbfc;
        }

        .form-title {
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

        .form-content {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e1e5e9;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #323338;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .form-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-upload {
          margin-bottom: 16px;
        }

        .file-input {
          display: none;
        }

        .upload-btn {
          display: inline-block;
          padding: 12px 20px;
          background: #0085ff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          background: #0073e6;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .image-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(255, 51, 51, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tags-input-container {
          border: 1px solid #d0d4d9;
          border-radius: 4px;
          padding: 8px;
          background: white;
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .tag-item {
          background: #0085ff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remove-tag-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-tag-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tags-input-container .monday-input {
          border: none;
          margin: 0;
          padding: 4px 0;
        }

        .tags-input-container .monday-input:focus {
          box-shadow: none;
        }

        .form-help {
          color: #676879;
          font-size: 12px;
          margin-top: 4px;
        }

        .form-help.error {
          color: #ff3333;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: #f8f9fa;
          color: #323338;
          border: 1px solid #d0d4d9;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #e8eaed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductForm;