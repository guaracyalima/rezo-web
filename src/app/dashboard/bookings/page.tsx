'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { getProviderBookings, Booking } from '../../../services/bookingServiceClean';

export default function BookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('next7days');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const providerBookings = await getProviderBookings(user!.uid);
      setBookings(providerBookings);
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

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    
    // Filter by date
    let dateMatch = true;
    if (dateFilter === 'next7days') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 6); // Include today + next 6 days = 7 days total
      next7Days.setHours(23, 59, 59, 999);
      
      const bookingDate = new Date(booking.scheduledDate);
      bookingDate.setHours(0, 0, 0, 0);
      
      dateMatch = bookingDate >= today && bookingDate <= next7Days;
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      
      const bookingDate = new Date(booking.scheduledDate);
      dateMatch = bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    } else if (dateFilter === 'thisMonth') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      const bookingDate = new Date(booking.scheduledDate);
      dateMatch = bookingDate >= startOfMonth && bookingDate <= endOfMonth;
    }
    
    return statusMatch && dateMatch;
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      case 'no_show': return 'Ausência';
      default: return status;
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      // TODO: Implement confirm booking API call
      showToast({
        type: 'success',
        title: 'Agendamento confirmado!',
        message: 'O cliente será notificado por email'
      });
      loadBookings(); // Reload data
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro ao confirmar',
        message: 'Não foi possível confirmar o agendamento'
      });
    }
  };

  const handleReschedule = (bookingId: string) => {
    // TODO: Implement reschedule modal/flow
    showToast({
      type: 'info',
      title: 'Reagendamento',
      message: 'Funcionalidade em desenvolvimento'
    });
  };

  const handleStartSession = (booking: Booking) => {
    if (booking.isOnline && booking.meetingUrl) {
      window.open(booking.meetingUrl, '_blank');
    } else {
      showToast({
        type: 'info',
        title: 'Iniciar atendimento',
        message: 'Funcionalidade em desenvolvimento'
      });
    }
  };

  const canReschedule = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const scheduledDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${booking.scheduledTime}`);
    const now = new Date();
    const hoursUntilSession = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilSession > 24; // Allow reschedule if more than 24h away
  };

  const canStartSession = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const scheduledDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${booking.scheduledTime}`);
    const now = new Date();
    const minutesUntilSession = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);
    
    return minutesUntilSession <= 15 && minutesUntilSession >= -60; // 15min before to 1h after
  };

  if (loading) {
    return (
      <DashboardLayout title="Meus Agendamentos">
        <div className="bookings-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meus Agendamentos">
      <div className="bookings-page">
        {/* Header Actions */}
        <div className="page-actions">
          <div className="filters">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-filter"
            >
              <option value="next7days">Próximos 7 dias</option>
              <option value="thisWeek">Esta semana</option>
              <option value="thisMonth">Este mês</option>
              <option value="all">Todos os períodos</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Bookings Content */}
        <div className="bookings-content">
          {filteredBookings.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📅</div>
              <h3>Nenhum agendamento encontrado</h3>
              <p>Quando clientes agendarem seus serviços, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-info">
                      <h3 className="service-title">{booking.serviceTitle}</h3>
                      <p className="customer-name">Cliente: {booking.customerName}</p>
                    </div>
                    <div className={`status-badge status-${booking.status}`}>
                      {getStatusLabel(booking.status)}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">📅 Data:</span>
                      <span className="detail-value">{formatDate(booking.scheduledDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">⏰ Horário:</span>
                      <span className="detail-value">{formatTime(booking.scheduledTime)} - {booking.endTime}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">💰 Valor:</span>
                      <span className="detail-value">{formatPrice(booking.servicePrice)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📍 Modalidade:</span>
                      <span className="detail-value">
                        {booking.isOnline ? '💻 Online' : '🏠 Presencial'}
                      </span>
                    </div>
                    {booking.customerPhone && (
                      <div className="detail-row">
                        <span className="detail-label">📱 Contato:</span>
                        <span className="detail-value">{booking.customerPhone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmBooking(booking.id!)}
                        className="btn-confirm"
                      >
                        ✅ Confirmar
                      </button>
                    )}
                    
                    {canReschedule(booking) && (
                      <button
                        onClick={() => handleReschedule(booking.id!)}
                        className="btn-reschedule"
                      >
                        📅 Reagendar
                      </button>
                    )}
                    
                    {canStartSession(booking) && (
                      <button
                        onClick={() => handleStartSession(booking)}
                        className="btn-start"
                      >
                        🚀 Iniciar Atendimento
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open(`mailto:${booking.customerEmail}`)}
                      className="btn-contact"
                    >
                      ✉️ Contatar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bookings-page {
          background: #f8f9fa;
        }

        .page-actions {
          background: white;
          padding: 24px 32px;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .filters {
          display: flex;
          gap: 16px;
        }

        .date-filter,
        .status-filter {
          padding: 8px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          min-width: 180px;
        }

        .bookings-content {
          padding: 32px;
        }

        .loading-state, .empty-bookings {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e1e5e9;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 80px;
          opacity: 0.6;
        }

        .empty-bookings h3 {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .empty-bookings p {
          color: #676879;
          max-width: 400px;
          line-height: 1.5;
          margin: 8px 0 24px 0;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .booking-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 4px 0;
        }

        .customer-name {
          font-size: 14px;
          color: #676879;
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-confirmed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .status-completed {
          background: #d4edda;
          color: #155724;
        }

        .status-no_show {
          background: #ffeaa7;
          color: #6c757d;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-label {
          font-size: 14px;
          color: #676879;
          min-width: 120px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #323338;
        }

        .booking-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-confirm {
          background: #00c875;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-confirm:hover {
          background: #00a86b;
        }

        .btn-reschedule {
          background: #ff9500;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-reschedule:hover {
          background: #e6850e;
        }

        .btn-start {
          background: #0085ff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-start:hover {
          background: #0073e6;
        }

        .btn-contact {
          background: #676879;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-contact:hover {
          background: #5a5c65;
        }

        @media (max-width: 768px) {
          .bookings-content {
            padding: 16px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}