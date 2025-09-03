'use client';

import React, { useState } from 'react';

interface ProductShareProps {
  product: {
    id?: string;
    name: string;
    price: number;
    shortDescription?: string;
    description: string;
    category: string;
    stock: number;
  };
  houseName?: string;
}

export const ProductShare: React.FC<ProductShareProps> = ({ product, houseName }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const getShareText = () => {
    const title = `${product.name} - ${houseName || 'Casa Espiritual'}`;
    const price = `R$ ${product.price.toFixed(2)}`;
    const description = product.shortDescription || product.description.substring(0, 100);
    const stock = product.stock > 0 ? `✅ Em estoque` : `❌ Esgotado`;
    
    return `🛒 ${title}\n\n${description}\n\n💰 ${price}\n${stock}\n\n🏷️ ${product.category}`;
  };

  const shareLinks = {
    whatsapp: () => {
      const text = encodeURIComponent(getShareText());
      const url = encodeURIComponent(getShareUrl());
      return `https://wa.me/?text=${text}%0A%0A${url}`;
    },
    
    facebook: () => {
      const url = encodeURIComponent(getShareUrl());
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    },
    
    twitter: () => {
      const text = encodeURIComponent(`🛒 ${product.name} - ${houseName || 'Casa Espiritual'} por R$ ${product.price.toFixed(2)}`);
      const url = encodeURIComponent(getShareUrl());
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    },
    
    telegram: () => {
      const text = encodeURIComponent(getShareText());
      const url = encodeURIComponent(getShareUrl());
      return `https://t.me/share/url?text=${text}&url=${url}`;
    },
    
    linkedin: () => {
      const url = encodeURIComponent(getShareUrl());
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText()}\n\n${getShareUrl()}`);
      alert('Link copiado para a área de transferência!');
      setShowShareMenu(false);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform](), '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="product-share">
      <button 
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="share-button"
      >
        📤 Compartilhar
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <div className="share-menu-overlay" onClick={() => setShowShareMenu(false)} />
          <div className="share-menu-content">
            <h3 className="share-title">Compartilhar Produto</h3>
            
            <div className="share-options">
              <button 
                onClick={() => handleShare('whatsapp')}
                className="share-option whatsapp"
              >
                <span className="share-icon">📱</span>
                <span>WhatsApp</span>
              </button>
              
              <button 
                onClick={() => handleShare('facebook')}
                className="share-option facebook"
              >
                <span className="share-icon">📘</span>
                <span>Facebook</span>
              </button>
              
              <button 
                onClick={() => handleShare('twitter')}
                className="share-option twitter"
              >
                <span className="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
              
              <button 
                onClick={() => handleShare('telegram')}
                className="share-option telegram"
              >
                <span className="share-icon">✈️</span>
                <span>Telegram</span>
              </button>
              
              <button 
                onClick={() => handleShare('linkedin')}
                className="share-option linkedin"
              >
                <span className="share-icon">💼</span>
                <span>LinkedIn</span>
              </button>
              
              <button 
                onClick={copyToClipboard}
                className="share-option copy"
              >
                <span className="share-icon">📋</span>
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .product-share {
          position: relative;
          display: inline-block;
        }

        .share-button {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .share-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
        }

        .share-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .share-menu-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1001;
          max-width: 400px;
          width: 90%;
        }

        .share-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 20px;
          text-align: center;
        }

        .share-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .share-option {
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #323338;
        }

        .share-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .share-option.whatsapp:hover {
          border-color: #25D366;
          color: #25D366;
        }

        .share-option.facebook:hover {
          border-color: #1877F2;
          color: #1877F2;
        }

        .share-option.twitter:hover {
          border-color: #1DA1F2;
          color: #1DA1F2;
        }

        .share-option.telegram:hover {
          border-color: #0088CC;
          color: #0088CC;
        }

        .share-option.linkedin:hover {
          border-color: #0A66C2;
          color: #0A66C2;
        }

        .share-option.copy:hover {
          border-color: #28a745;
          color: #28a745;
        }

        .share-icon {
          font-size: 24px;
        }

        @media (max-width: 480px) {
          .share-options {
            grid-template-columns: 1fr;
          }
          
          .share-option {
            flex-direction: row;
            justify-content: flex-start;
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductShare;