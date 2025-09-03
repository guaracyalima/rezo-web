'use client';

import React, { useState, useEffect } from 'react';
import { Service, getServices } from '../../services/servicesService';

export default function PublicServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicServices();
  }, []);

  const loadPublicServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌍 Loading public services...');
      
      // Try to get all services without restrictive filters
      const result = await getServices({}, { limitCount: 50 });
      
      console.log('✅ Services result:', result);
      console.log('📝 Services array:', result.services);
      console.log('🔢 Services count:', result.services?.length || 0);
      
      setServices(result.services || []);
    } catch (err: any) {
      console.error('❌ Error loading public services:', err);
      console.error('📄 Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(err.message || 'Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  const testDirectFirebase = async () => {
    try {
      console.log('🧪 DIRECT FIREBASE TEST...');
      
      // Import Firebase directly
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      console.log('📱 Firebase DB:', db);
      
      const servicesRef = collection(db, 'services');
      console.log('📂 Services collection ref:', servicesRef);
      
      const snapshot = await getDocs(servicesRef);
      console.log('📊 Snapshot size:', snapshot.size);
      
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        console.log('📄 Doc:', doc.id, doc.data());
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Direct Firebase result:', docs);
      setServices(docs);
      
    } catch (error) {
      console.error('💥 Direct Firebase test failed:', error);
    }
  };

  const handleViewService = (service: Service) => {
    window.location.href = `/services/${service.id}`;
  };

  return (
    <div className="public-services-page">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Explorar Atendimentos
        </h1>
        <p className="text-gray-600 mb-8">
          Descubra atendimentos espirituais e terapêuticos oferecidos pelas nossas casas
        </p>
      </div>

      {/* Debug Info */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        margin: '20px', 
        fontSize: '14px',
        fontFamily: 'monospace',
        border: '1px solid #2196f3',
        borderRadius: '8px'
      }}>
        <strong>🌍 Public Services Debug:</strong><br/>
        Loading: {loading ? 'true' : 'false'}<br/>
        Error: {error || 'none'}<br/>
        Services Count: {services.length}<br/>
        Database: Using default Firebase database (not 'rezos')<br/>
        Collection: 'services'<br/>
        Services Data: {JSON.stringify(services.map(s => ({ 
          id: s.id, 
          title: s.title,
          category: s.category,
          basePrice: s.basePrice
        })), null, 2)}
        
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={testDirectFirebase}
            style={{
              background: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🧪 Test Direct Firebase
          </button>
          <button 
            onClick={loadPublicServices}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Services
          </button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando atendimentos...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Erro ao carregar atendimentos</h3>
            <p>{error}</p>
            <button onClick={loadPublicServices} className="btn-retry">
              Tentar Novamente
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔮</div>
            <h3>Nenhum atendimento encontrado</h3>
            <p>Não há atendimentos disponíveis no momento</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card" onClick={() => handleViewService(service)}>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-description">{service.description}</p>
                  <div className="service-price">
                    R$ {service.basePrice?.toFixed(2) || '0,00'}
                  </div>
                  <div className="service-modality">
                    {service.isOnline && '💻 Online'}
                    {service.isOnline && service.isInPerson && ' • '}
                    {service.isInPerson && '👥 Presencial'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .public-services-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .page-header {
          background: white;
          padding: 60px 20px;
          text-align: center;
          border-bottom: 1px solid #e1e5e9;
        }

        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon, .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .btn-retry {
          background: #2196f3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }

        .btn-retry:hover {
          background: #1976d2;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .service-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e1e5e9;
        }

        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .service-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .service-category {
          font-size: 14px;
          color: #2196f3;
          font-weight: 500;
          margin: 0 0 12px 0;
        }

        .service-description {
          font-size: 14px;
          color: #676879;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .service-price {
          font-size: 20px;
          font-weight: 700;
          color: #4caf50;
          margin: 0 0 8px 0;
        }

        .service-modality {
          font-size: 12px;
          color: #676879;
          background: #f5f6f8;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}