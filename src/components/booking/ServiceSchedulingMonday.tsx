'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Service } from '../../services/servicesService';
import { createBooking } from '../../services/bookingServiceClean';
import { 
  getAvailableTimeSlotsForWeek, 
  WeeklyTimeSlot,
  getDayName,
  formatDateForDisplay 
} from '../../services/weeklyAvailabilityService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ServiceSchedulingProps {
  service: Service;
  onBookingComplete?: (bookingId: string) => void;
  onClose?: () => void;
}

interface BookingData {
  serviceId: string;
  providerId: string;
  customerId: string;
  houseId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceTitle: string;
  servicePrice: number;
  serviceDuration: number;
  isOnline: boolean;
  isInPerson: boolean;
  scheduledDate: Date;
  scheduledTime: string;
  endTime: string;
  timezone: string;
  paymentAmount: number;
  platformFee: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  calendarReminders: boolean;
  location?: {
    address: string;
    city: string;
    state: string;
    complement?: string;
    instructions?: string;
  };
  customerNotes?: string;
  providerNotes?: string;
}

const ServiceScheduling: React.FC<ServiceSchedulingProps> = ({
  service,
  onBookingComplete,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Estados do componente
  const [currentStep, setCurrentStep] = useState<'slots' | 'confirmation'>('slots');
  const [selectedSlot, setSelectedSlot] = useState<WeeklyTimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<WeeklyTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados do formulário (só o que é necessário)
  const [notes, setNotes] = useState('');

  // Get next 7 days including today
  const getNext7Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const next7Days = getNext7Days();

  // Função para formatar CPF/CNPJ - removida pois não precisamos mais

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user) {
      // Salvar URL atual para redirecionamento pós-login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      // Redirecionar para login
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    console.log('🚀 ServiceSchedulingMonday mounted with service:', {
      id: service?.id,
      houseId: service?.houseId,
      title: service?.title,
      providerId: service?.providerId
    });
    
    if (service?.id && service?.houseId) {
      loadAvailableSlots();
    } else {
      console.error('❌ Missing required service data:', {
        hasId: !!service?.id,
        hasHouseId: !!service?.houseId,
        service
      });
    }
  }, [service]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading available slots for service:', {
        serviceId: service.id,
        houseId: service.houseId,
        duration: service.duration
      });
      
      // Create set of next 7 days date strings for filtering
      const next7DaysStrings = getNext7Days().map(date => 
        date.toISOString().split('T')[0]
      );
      
      console.log('📅 Next 7 days to filter:', next7DaysStrings);
      
      // Get all available slots for the week
      const allWeekSlots = await getAvailableTimeSlotsForWeek(
        service.id!,
        service.houseId,
        service.duration || 60
      );
      
      console.log('📋 All week slots received:', {
        totalSlots: allWeekSlots.length,
        firstFewSlots: allWeekSlots.slice(0, 3),
        allDates: [...new Set(allWeekSlots.map(slot => slot.date))].sort()
      });
      
      // Filter slots to only include next 7 days
      const next7DaysSlots = allWeekSlots.filter(slot => {
        const isIncluded = next7DaysStrings.includes(slot.date);
        if (isIncluded) {
          console.log(`✅ Including slot: ${slot.date} ${slot.time}`);
        }
        return isIncluded;
      });
      
      console.log('✅ Available slots loaded:', {
        totalWeekSlots: allWeekSlots.length,
        next7DaysSlots: next7DaysSlots.length,
        slotsGrouped: next7DaysSlots.reduce((acc, slot) => {
          if (!acc[slot.date]) acc[slot.date] = 0;
          acc[slot.date]++;
          return acc;
        }, {} as Record<string, number>)
      });
      
      setAvailableSlots(next7DaysSlots);
    } catch (error) {
      console.error('❌ Error loading slots:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar horários',
        message: 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: WeeklyTimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep('confirmation');
  };

  // Função para processar o pagamento com estrutura simplificada
  const processPayment = async (bookingId: string, bookingData: BookingData) => {
    try {
      // Baixar a imagem do Firebase e converter para base64
      let imageBase64 = '';
      if (service.images && service.images.length > 0) {
        try {
          const response = await fetch(service.images[0]);
          const blob = await response.blob();
          imageBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove o prefixo data:image/...;base64,
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Erro ao baixar imagem:', error);
          imageBase64 = '';
        }
      }

      const paymentData = {
        houseId: service.houseId,
        amount: service.basePrice,
        packageName: service.title,
        userId: user!.uid,
        bookingId: bookingId,
        serviceId: service.id!,
        items: [
          {
            imageBase64: imageBase64,
            name: service.title,
            quantity: 1,
            value: service.basePrice,
            externalReference: bookingId
          }
        ]
      };

      console.log('💳 Processando pagamento:', paymentData);

      const response = await fetch('https://primary-production-9acc.up.railway.app/webhook/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      // Verificar se o checkout foi criado com sucesso
      if (!result.checkoutUrl || result.checkoutUrl === null || result.checkoutUrl === '') {
        throw new Error('Erro ao gerar link de pagamento');
      }

      // Fechar o modal antes de mostrar o SweetAlert
      if (onClose) {
        onClose();
      }
// Redirecionar para a página de pagamento
      window.open(result.checkoutUrl, '_blank');
      // Mostrar SweetAlert informando sobre o redirecionamento
      await Swal.fire({
        title: '🎉 Agendamento Confirmado!',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 16px;">Seu atendimento foi agendado com sucesso!</p>
            <p style="margin-bottom: 16px;">Você será redirecionado para a página de pagamento para finalizar sua reserva.</p>
            <p style="color: #666; font-size: 14px;">Após o pagamento, você receberá a confirmação por email.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Ir para Pagamento',
        confirmButtonColor: '#28a745',
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      // Redirecionar para a página de pagamento
      window.location.href = result.checkoutUrl;

    } catch (error: any) {
      console.error('❌ Erro no pagamento:', error);
      showToast({
        type: 'error',
        title: 'Erro no pagamento',
        message: error.message || 'Não foi possível processar o pagamento'
      });
      throw error;
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !user) return;

    try {
      setSubmitting(true);

      const bookingData: BookingData = {
        serviceId: service.id!,
        providerId: service.providerId || service.houseId,
        customerId: user.uid,
        houseId: service.houseId,
        customerName: user.displayName || user.email || 'Usuário',
        customerEmail: user.email || '',
        customerPhone: '',
        serviceTitle: service.title,
        servicePrice: service.basePrice,
        serviceDuration: service.duration || 60,
        isOnline: service.isOnline,
        isInPerson: service.isInPerson,
        scheduledDate: new Date(selectedSlot.date + 'T00:00:00'),
        scheduledTime: selectedSlot.time,
        endTime: selectedSlot.endTime,
        timezone: 'America/Sao_Paulo',
        paymentAmount: service.basePrice,
        platformFee: service.basePrice * 0.1,
        paymentStatus: 'pending',
        status: 'pending',
        calendarReminders: true,
        customerNotes: notes.trim()
      };

      console.log('📋 Creating booking with data:', {
        serviceId: bookingData.serviceId,
        providerId: bookingData.providerId,
        houseId: bookingData.houseId,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime
      });

      console.log('📋 Creating booking:', bookingData);
      const bookingId = await createBooking(bookingData);
      
      if (!bookingId) {
        throw new Error('Erro ao criar agendamento');
      }

      console.log('✅ Agendamento criado com ID:', bookingId);

      // Processar pagamento após criar o agendamento
      await processPayment(bookingId, bookingData);

    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      showToast({
        type: 'error',
        title: 'Erro no agendamento',
        message: error.message || 'Não foi possível realizar o agendamento'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Group slots by day
  const slotsByDay = next7Days.reduce((acc: Record<string, WeeklyTimeSlot[]>, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySlots = availableSlots.filter(slot => slot.date === dateStr);
    acc[dateStr] = daySlots;
    return acc;
  }, {} as Record<string, WeeklyTimeSlot[]>);

  if (loading) {
    return (
      <div className="scheduling-container">
        <div className="monday-card">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando horários disponíveis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="scheduling-container">
        <div className="monday-card">
          <div className="auth-required">
            <h3>🔐 Login Necessário</h3>
            <p>Você precisa estar logado para realizar um agendamento.</p>
            <div className="auth-actions">
              <button onClick={onClose} className="btn-secondary">
                Fechar
              </button>
              <a href="/auth/login" className="btn-primary">
                Fazer Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduling-container">
      <div className="monday-card">
        {/* Header */}
        <div className="monday-header">
          <div className="header-content">
            <div className="header-left">
              <h2 className="monday-title">Agendar {service.title}</h2>
              <p className="monday-subtitle">
                {service.isOnline && service.isInPerson ? 'Online ou Presencial' :
                 service.isOnline ? 'Atendimento Online' : 'Atendimento Presencial'}
              </p>
            </div>
            {onClose && (
              <button onClick={onClose} className="close-btn">✕</button>
            )}
          </div>
          
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep === 'slots' ? 'active' : 'completed'}`}>
              <span className="step-number">1</span>
              <span className="step-label">Escolher Horário</span>
            </div>
            <div className={`step ${currentStep === 'confirmation' ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Confirmação</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="monday-content">
          {currentStep === 'slots' && (
            <div className="time-selection">
              <h3 className="section-title">Escolha um horário</h3>
              <p className="section-subtitle">Selecione um horário disponível na semana</p>
              
              <div className="weekly-calendar">
                {next7Days.map((date: Date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const daySlots = slotsByDay[dateStr] || [];
                  const dayOfWeek = date.getDay();
                  
                  return (
                    <div key={dateStr} className="day-column">
                      <div className="day-header">
                        <div className="day-name">{getDayName(dayOfWeek)}</div>
                        <div className="day-date">{formatDateForDisplay(dateStr)}</div>
                      </div>
                      
                      <div className="time-slots">
                        {daySlots.length === 0 ? (
                          <div className="no-slots">Indisponível</div>
                        ) : (
                          daySlots.map((slot: WeeklyTimeSlot) => (
                            <button
                              key={`${slot.date}-${slot.time}`}
                              onClick={() => handleSlotSelect(slot)}
                              className="time-slot"
                            >
                              {slot.time}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && selectedSlot && (
            <div className="confirmation">
              <h3 className="section-title">Confirmar agendamento</h3>
              
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="label">Atendimento:</span>
                  <span className="value">{service.title}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Data e horário:</span>
                  <span className="value">
                    {getDayName(selectedSlot.dayOfWeek)}, {selectedSlot.displayDate} às {selectedSlot.time}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Duração:</span>
                  <span className="value">{service.duration || 60} minutos</span>
                </div>
                <div className="summary-item">
                  <span className="label">Modalidade:</span>
                  <span className="value">
                    {service.isOnline && service.isInPerson ? 'Online ou Presencial' :
                     service.isOnline ? 'Online' : 'Presencial'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Valor:</span>
                  <span className="value price">R$ {service.basePrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Campo para observações */}
              <div className="form-group full-width">
                <label className="monday-label">Observações (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="monday-textarea"
                  placeholder="Alguma informação adicional..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setCurrentStep('slots')}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Voltar
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scheduling-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .monday-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .monday-header {
          background: #f8f9fb;
          border-bottom: 1px solid #e1e5e9;
          padding: 24px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .monday-title {
          font-size: 24px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 4px 0;
        }

        .monday-subtitle {
          font-size: 14px;
          color: #676879;
          margin: 0;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f1f2f4;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #676879;
        }

        .close-btn:hover {
          background: #e1e5e9;
        }

        .progress-steps {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          background: #d0d4d9;
          color: #676879;
        }

        .step.active .step-number {
          background: #0085ff;
          color: white;
        }

        .step.completed .step-number {
          background: #00c875;
          color: white;
        }

        .step-label {
          font-size: 14px;
          color: #676879;
          font-weight: 500;
        }

        .step.active .step-label {
          color: #323338;
        }

        .monday-content {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: #676879;
          margin: 0 0 24px 0;
        }

        .weekly-calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 16px;
        }

        .day-column {
          min-height: 400px;
          max-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .day-header {
          text-align: center;
          padding: 12px 0;
          border-bottom: 2px solid #f1f2f4;
          margin-bottom: 12px;
        }

        .day-name {
          font-size: 14px;
          font-weight: 600;
          color: #323338;
          margin-bottom: 4px;
        }

        .day-date {
          font-size: 12px;
          color: #676879;
        }

        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .time-slots::-webkit-scrollbar {
          width: 4px;
        }

        .time-slots::-webkit-scrollbar-track {
          background: #f1f2f4;
          border-radius: 2px;
        }

        .time-slots::-webkit-scrollbar-thumb {
          background: #d0d4d9;
          border-radius: 2px;
        }

        .time-slots::-webkit-scrollbar-thumb:hover {
          background: #a1a6b7;
        }

        .time-slot {
          padding: 8px 12px;
          border: 1px solid #d0d4d9;
          border-radius: 6px;
          background: white;
          color: #323338;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-slot:hover {
          border-color: #0085ff;
          background: #f0f9ff;
        }

        .no-slots {
          padding: 8px 12px;
          text-align: center;
          color: #a1a6b7;
          font-size: 12px;
          background: #f8f9fb;
          border-radius: 6px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .monday-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #323338;
          margin-bottom: 6px;
        }

        .monday-input, .monday-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d0d4d9;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .monday-input:focus, .monday-textarea:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
        }

        .btn-secondary, .btn-primary {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary {
          background: white;
          border: 1px solid #d0d4d9;
          color: #323338;
        }

        .btn-secondary:hover {
          background: #f1f2f4;
        }

        .btn-primary {
          background: #0085ff;
          border: 1px solid #0085ff;
          color: white;
        }

        .btn-primary:hover {
          background: #0073e6;
        }

        .btn-primary:disabled {
          background: #d0d4d9;
          border-color: #d0d4d9;
          cursor: not-allowed;
        }

        .booking-summary {
          background: #f8f9fb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e1e5e9;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item .label {
          font-size: 14px;
          color: #676879;
        }

        .summary-item .value {
          font-size: 14px;
          font-weight: 500;
          color: #323338;
        }

        .summary-item .value.price {
          font-size: 18px;
          font-weight: 600;
          color: #00c875;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .auth-required {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
          text-align: center;
        }

        .auth-required h3 {
          font-size: 20px;
          font-weight: 600;
          color: #323338;
          margin: 0;
        }

        .auth-required p {
          color: #676879;
          margin: 0;
        }

        .auth-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f1f2f4;
          border-top: 3px solid #0085ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .weekly-calendar {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .progress-steps {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceScheduling;