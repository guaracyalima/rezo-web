import React, { useState } from 'react';
import { House } from '../../../services/housesService';
import HouseList from './HouseList';
import HouseForm from './HouseForm';
import HouseDetail from './HouseDetail';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface HousesManagerProps {
  userId?: string;
  showOwnerActions?: boolean;
}

const HousesManager: React.FC<HousesManagerProps> = ({ 
  userId, 
  showOwnerActions = false 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleCreateNew = () => {
    setSelectedHouse(null);
    setViewMode('create');
  };

  const handleEdit = (house: House) => {
    setSelectedHouse(house);
    setViewMode('edit');
  };

  const handleView = (house: House) => {
    setSelectedHouse(house);
    setViewMode('detail');
  };

  const handleFormSuccess = (houseId: string) => {
    setSuccessMessage(
      viewMode === 'create' 
        ? 'Casa criada com sucesso!' 
        : 'Casa atualizada com sucesso!'
    );
    setViewMode('list');
    setSelectedHouse(null);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedHouse(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <HouseForm
            isEdit={false}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        );
      
      case 'edit':
        return (
          <HouseForm
            isEdit={true}
            houseId={selectedHouse?.id}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        );
      
      case 'detail':
        return (
          <HouseDetail
            houseId={selectedHouse?.id || ''}
            onEdit={handleEdit}
            onClose={handleCancel}
            showActions={showOwnerActions}
          />
        );
      
      default:
        return (
          <HouseList
            showOwnerActions={showOwnerActions}
            userId={userId}
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="houses-manager">
      {/* Success Message */}
      {successMessage && (
        <div className="success-notification">
          <div className="notification-content">
            <span className="notification-icon">✓</span>
            <span className="notification-message">{successMessage}</span>
            <button
              className="notification-close"
              onClick={() => setSuccessMessage('')}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {renderContent()}

      <style jsx>{`
        .houses-manager {
          width: 100%;
          min-height: 400px;
        }

        .success-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification-content {
          background: #00ca72;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 202, 114, 0.3);
          min-width: 300px;
        }

        .notification-icon {
          font-size: 16px;
          font-weight: bold;
        }

        .notification-message {
          flex: 1;
          font-weight: 500;
        }

        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .notification-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HousesManager;