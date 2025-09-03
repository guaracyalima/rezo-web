'use client';

import React, { useState, useEffect } from 'react';
import { Booking, getCustomerBookings, cancelBooking } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function BookingsManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userBookings = await getCustomerBookings(user.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar agendamentos',
        message: 'Não foi possível carregar seus agendamentos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Por favor, informe o motivo do cancelamento'
      });
      return;
    }

    try {
      await cancelBooking(selectedBooking.id!, cancelReason, true);
      showToast({
        type: 'success',
        title: 'Agendamento cancelado',
        message: 'Seu agendamento foi cancelado com sucesso'
      });
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast({
        type: 'error',
        title: 'Erro ao cancelar',
        message: 'Não foi possível cancelar o agendamento'
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#ffcb00',
      confirmed: '#00ca72',
      cancelled: '#ff3333',
      completed: '#0085ff',
      no_show: '#95a5a6'
    };
    return colors[status as keyof typeof colors] || '#676879';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído',
      no_show: 'Não compareceu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDateTime = new Date(booking.scheduledDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'confirmed' && hoursUntilBooking > 24;
  };

  if (!user) {
    return (
      <div className="bookings-manager">
        <div className="loading-state">
          <p>Você precisa estar logado para ver seus agendamentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-manager">
      <div className="manager-header">
        <h2>Meus Agendamentos</h2>
        <p>Gerencie todos os seus agendamentos de serviços</p>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-buttons">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendentes' },
            { value: 'confirmed', label: 'Confirmados' },
            { value: 'completed', label: 'Concluídos' },
            { value: 'cancelled', label: 'Cancelados' }
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`filter-btn ${filter === filterOption.value ? 'active' : ''}`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Nenhum agendamento encontrado</h3>
            <p>
              {filter === 'all' 
                ? 'Você ainda não fez nenhum agendamento'
                : `Você não possui agendamentos ${getStatusLabel(filter).toLowerCase()}`
              }
            </p>
            <a href="/services" className="cta-button">
              Explorar Serviços
            </a>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h4 className="service-title">{booking.serviceTitle}</h4>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{formatDate(booking.scheduledDate)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">
                      {formatTime(booking.scheduledTime)} - {formatTime(booking.endTime)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text">{formatPrice(booking.paymentAmount)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">
                      {booking.isOnline ? '💻' : '🏠'}
                    </span>
                    <span className="detail-text">
                      {booking.isOnline ? 'Online' : 'Presencial'}
                    </span>
                  </div>

                  {booking.location && (
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">
                        {booking.location.city}, {booking.location.state}
                      </span>
                    </div>
                  )}
                </div>

                {booking.customerNotes && (
                  <div className="booking-notes">
                    <h5>Observações:</h5>
                    <p>{booking.customerNotes}</p>
                  </div>
                )}

                {booking.isOnline && booking.meetingUrl && booking.status === 'confirmed' && (
                  <div className="meeting-info">
                    <h5>💻 Reunião Online</h5>
                    <a 
                      href={booking.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="meeting-link"
                    >
                      Entrar na Reunião
                    </a>
                  </div>
                )}

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <span className="pending-message">
                      Aguardando confirmação da casa
                    </span>
                  )}
                  
                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="cancel-btn"
                    >
                      Cancelar Agendamento
                    </button>
                  )}
                  
                  {booking.status === 'confirmed' && booking.isOnline && booking.meetingUrl && (
                    <a 
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="join-btn"
                    >
                      Entrar na Reunião
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="cancel-modal">
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)} />
          <div className="modal-content">
            <h3>Cancelar Agendamento</h3>
            <p>Tem certeza que deseja cancelar o agendamento para:</p>
            <div className="booking-summary">
              <strong>{selectedBooking.serviceTitle}</strong><br />
              {formatDate(selectedBooking.scheduledDate)} às {formatTime(selectedBooking.scheduledTime)}
            </div>
            
            <div className="form-group">
              <label>Motivo do cancelamento:</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Informe o motivo do cancelamento"
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary">
                Manter Agendamento
              </button>
              <button onClick={handleCancelBooking} className="btn-danger">
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bookings-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .manager-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .manager-header h2 {
          font-size: 32px;
          font-weight: 700;
          color: #323338;
          margin-bottom: 8px;
        }

        .manager-header p {
          color: #676879;
          font-size: 16px;
          margin: 0;
        }

        .filter-section {
          margin-bottom: 32px;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: white;
          border: 2px solid #e1e5e9;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          color: #676879;
        }

        .filter-btn:hover, .filter-btn.active {
          border-color: #0085ff;
          background: #0085ff;
          color: white;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
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

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 12px;
        }

        .empty-state p {
          color: #676879;
          margin-bottom: 24px;
          max-width: 400px;
        }

        .cta-button {
          background: #0085ff;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cta-button:hover {
          background: #0073e6;
          color: white;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e1e5e9;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 12px;
        }

        .service-title {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0;
          flex: 1;
        }

        .status-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-icon {
          font-size: 16px;
          width: 20px;
        }

        .detail-text {
          color: #323338;
          font-size: 14px;
        }

        .booking-notes {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .booking-notes h5 {
          font-size: 14px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .booking-notes p {
          color: #676879;
          font-size: 14px;
          margin: 0;
          line-height: 1.4;
        }

        .meeting-info {
          background: #e8f4ff;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .meeting-info h5 {
          font-size: 14px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .meeting-link {
          background: #0085ff;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
        }

        .meeting-link:hover {
          background: #0073e6;
          color: white;
        }

        .booking-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .pending-message {
          color: #676879;
          font-size: 14px;
          font-style: italic;
        }

        .cancel-btn {
          background: #ff3333;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #e60000;
        }

        .join-btn {
          background: #00ca72;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .join-btn:hover {
          background: #00b366;
          color: white;
        }

        .cancel-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 1001;
        }

        .modal-content h3 {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 16px 0;
        }

        .booking-summary {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .form-group {
          margin: 16px 0;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #323338;
          margin-bottom: 8px;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #0085ff;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn-secondary, .btn-danger {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #323338;
          border: 1px solid #d0d4d9;
        }

        .btn-secondary:hover {
          background: #e8eaed;
        }

        .btn-danger {
          background: #ff3333;
          color: white;
        }

        .btn-danger:hover {
          background: #e60000;
        }

        @media (max-width: 768px) {
          .bookings-grid {
            grid-template-columns: 1fr;
          }

          .booking-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-buttons {
            flex-direction: column;
            align-items: center;
          }

          .booking-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}