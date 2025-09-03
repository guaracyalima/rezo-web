import React from 'react';
import { ProductsManager } from './ProductsManager';
import { useAuth } from '../../../contexts/AuthContext';

const ProductsSection: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="products-section">
      <ProductsManager
        userId={user.uid}
        showOwnerActions={true}
      />
    </div>
  );
};

export default ProductsSection;