'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { getHousesByOwner, House } from '../../../services/housesService';

// Simplified interfaces for availability
interface SimpleTimeSlot {
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface SimpleDayAvailability {
  isActive: boolean;
  onlineSlots: SimpleTimeSlot[];
  inPersonSlots: SimpleTimeSlot[];
}

export default function AvailabilitySettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [weeklyData, setWeeklyData] = useState<{
    [dayOfWeek: number]: SimpleDayAvailability;
  }>({});

  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dayNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  useEffect(() => {
    if (user) {
      loadUserHouses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedHouse) {
      initializeDefaultAvailability();
    }
  }, [selectedHouse]);

  const loadUserHouses = async () => {
    try {
      const userHouses = await getHousesByOwner(user!.uid);
      setHouses(userHouses);
      if (userHouses.length > 0 && !selectedHouse) {
        setSelectedHouse(userHouses[0]);
      }
    } catch (error) {
      console.error('Error loading houses:', error);
      showToast({
        type: 'error',
        title: 'Erro ao carregar casas',
        message: 'Não foi possível carregar suas casas'
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultAvailability = () => {
    const newWeeklyData: typeof weeklyData = {};
    
    for (let day = 0; day < 7; day++) {
      newWeeklyData[day] = {
        isActive: day >= 1 && day <= 5, // Monday to Friday active by default
        onlineSlots: day >= 1 && day <= 5 ? [
          { startTime: '09:00', endTime: '18:00', isActive: true }
        ] : [],
        inPersonSlots: day >= 1 && day <= 5 ? [
          { startTime: '09:00', endTime: '18:00', isActive: true }
        ] : []
      };
    }
    
    setWeeklyData(newWeeklyData);
  };

  const handleSaveAvailability = async () => {
    if (!selectedHouse || !user) return;
    
    try {
      setSaving(true);
      
      // Here you would normally save to Firebase
      // For now, we'll just show a success message
      console.log('Saving availability for house:', selectedHouse.id, weeklyData);
      
      showToast({
        type: 'success',
        title: 'Disponibilidade salva!',
        message: 'Os horários de atendimento foram atualizados com sucesso'
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      showToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar a disponibilidade'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (dayOfWeek: number) => {
    setWeeklyData(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isActive: !prev[dayOfWeek]?.isActive
      }
    }));
  };

  const handleAddTimeSlot = (dayOfWeek: number, type: 'online' | 'inPerson') => {
    const newSlot: SimpleTimeSlot = {
      startTime: '09:00',
      endTime: '10:00',
      isActive: true
    };

    setWeeklyData(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [`${type}Slots`]: [...(prev[dayOfWeek]?.[`${type}Slots`] || []), newSlot]
      }
    }));
  };

  const handleRemoveTimeSlot = (dayOfWeek: number, type: 'online' | 'inPerson', index: number) => {
    setWeeklyData(prev => {
      const slots = [...(prev[dayOfWeek]?.[`${type}Slots`] || [])];
      slots.splice(index, 1);
      
      return {
        ...prev,
        [dayOfWeek]: {
          ...prev[dayOfWeek],
          [`${type}Slots`]: slots
        }
      };
    });
  };

  const handleTimeSlotChange = (
    dayOfWeek: number, 
    type: 'online' | 'inPerson', 
    index: number, 
    field: keyof SimpleTimeSlot, 
    value: any
  ) => {
    setWeeklyData(prev => {
      const slots = [...(prev[dayOfWeek]?.[`${type}Slots`] || [])];
      slots[index] = { ...slots[index], [field]: value };
      
      return {
        ...prev,
        [dayOfWeek]: {
          ...prev[dayOfWeek],
          [`${type}Slots`]: slots
        }
      };
    });
  };

  if (loading && houses.length === 0) {
    return (
      <DashboardLayout title="Horários de Atendimento">
        <div className="availability-settings">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (houses.length === 0) {
    return (
      <DashboardLayout title="Horários de Atendimento">
        <div className="availability-settings">
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Nenhuma casa encontrada</h3>
            <p>Você precisa ter pelo menos uma casa registrada para configurar horários de atendimento.</p>
            <a href="/dashboard/houses" className="btn-primary">
              Cadastrar Casa
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Horários de Atendimento">
      <div className="availability-settings">
        {/* House Selector */}
        {houses.length > 1 && (
          <div className="house-selector">
            <label className="selector-label">Casa:</label>
            <select
              value={selectedHouse?.id || ''}
              onChange={(e) => {
                const house = houses.find(h => h.id === e.target.value);
                setSelectedHouse(house || null);
              }}
              className="house-select"
            >
              {houses.map(house => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Weekly Calendar */}
        <div className="weekly-calendar">
          {dayNames.map((dayName, dayOfWeek) => {
            const dayData = weeklyData[dayOfWeek] || { isActive: false, onlineSlots: [], inPersonSlots: [] };
            
            return (
              <div key={dayOfWeek} className={`day-card ${dayData.isActive ? 'active' : 'inactive'}`}>
                <div className="day-header">
                  <div className="day-info">
                    <h3 className="day-name">{dayName}</h3>
                    <span className="day-short">{dayNamesShort[dayOfWeek]}</span>
                  </div>
                  
                  <div className="day-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={dayData.isActive}
                        onChange={() => handleDayToggle(dayOfWeek)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {dayData.isActive && (
                  <div className="day-content">
                    {/* Online Slots */}
                    <div className="slot-section">
                      <div className="section-header">
                        <h4 className="section-title">💻 Online</h4>
                        <button
                          onClick={() => handleAddTimeSlot(dayOfWeek, 'online')}
                          className="add-slot-btn"
                        >
                          + Adicionar
                        </button>
                      </div>
                      
                      <div className="time-slots">
                        {dayData.onlineSlots.map((slot, index) => (
                          <div key={index} className="time-slot">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeSlotChange(dayOfWeek, 'online', index, 'startTime', e.target.value)}
                              className="time-input"
                            />
                            <span className="time-separator">até</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeSlotChange(dayOfWeek, 'online', index, 'endTime', e.target.value)}
                              className="time-input"
                            />
                            <button
                              onClick={() => handleRemoveTimeSlot(dayOfWeek, 'online', index)}
                              className="remove-slot-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        {dayData.onlineSlots.length === 0 && (
                          <p className="no-slots">Nenhum horário configurado</p>
                        )}
                      </div>
                    </div>

                    {/* In-Person Slots */}
                    <div className="slot-section">
                      <div className="section-header">
                        <h4 className="section-title">🏠 Presencial</h4>
                        <button
                          onClick={() => handleAddTimeSlot(dayOfWeek, 'inPerson')}
                          className="add-slot-btn"
                        >
                          + Adicionar
                        </button>
                      </div>
                      
                      <div className="time-slots">
                        {dayData.inPersonSlots.map((slot, index) => (
                          <div key={index} className="time-slot">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeSlotChange(dayOfWeek, 'inPerson', index, 'startTime', e.target.value)}
                              className="time-input"
                            />
                            <span className="time-separator">até</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeSlotChange(dayOfWeek, 'inPerson', index, 'endTime', e.target.value)}
                              className="time-input"
                            />
                            <button
                              onClick={() => handleRemoveTimeSlot(dayOfWeek, 'inPerson', index)}
                              className="remove-slot-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        {dayData.inPersonSlots.length === 0 && (
                          <p className="no-slots">Nenhum horário configurado</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .availability-settings {
            min-height: 100vh;
            background: #f8f9fa;
            padding: 0;
          }

          .page-header {
            background: white;
            padding: 32px;
            border-bottom: 1px solid #e1e5e9;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }

          .header-content {
            flex: 1;
          }

          .page-title {
            font-size: 32px;
            font-weight: 700;
            color: #323338;
            margin: 0 0 8px 0;
          }

          .page-description {
            font-size: 16px;
            color: #676879;
            margin: 0;
            max-width: 600px;
          }

          .header-actions {
            display: flex;
            gap: 12px;
          }

          .btn-primary {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            font-size: 14px;
            background: #0085ff;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #0073e6;
          }

          .btn-primary:disabled {
            background: #d0d4d9;
            cursor: not-allowed;
          }

          .house-selector {
            background: white;
            padding: 24px 32px;
            border-bottom: 1px solid #e1e5e9;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .selector-label {
            font-size: 16px;
            font-weight: 600;
            color: #323338;
          }

          .house-select {
            padding: 8px 12px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            min-width: 200px;
          }

          .weekly-calendar {
            padding: 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
          }

          .day-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.3s ease;
          }

          .day-card.active {
            border-left: 4px solid #0085ff;
          }

          .day-card.inactive {
            border-left: 4px solid #e1e5e9;
            opacity: 0.7;
          }

          .day-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e1e5e9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .day-info {
            display: flex;
            flex-direction: column;
          }

          .day-name {
            font-size: 18px;
            font-weight: 600;
            color: #323338;
            margin: 0 0 4px 0;
          }

          .day-short {
            font-size: 12px;
            color: #676879;
            font-weight: 500;
          }

          .day-controls {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 24px;
          }

          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #d0d4d9;
            transition: 0.3s;
            border-radius: 24px;
          }

          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
          }

          input:checked + .toggle-slider {
            background-color: #0085ff;
          }

          input:checked + .toggle-slider:before {
            transform: translateX(24px);
          }

          .day-content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .slot-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #323338;
            margin: 0;
          }

          .add-slot-btn {
            background: #f8f9fa;
            color: #0085ff;
            border: 1px solid #0085ff;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .add-slot-btn:hover {
            background: #0085ff;
            color: white;
          }

          .time-slots {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .time-slot {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 6px;
          }

          .time-input {
            padding: 4px 8px;
            border: 1px solid #e1e5e9;
            border-radius: 4px;
            font-size: 14px;
            width: 80px;
          }

          .time-separator {
            font-size: 12px;
            color: #676879;
          }

          .remove-slot-btn {
            background: none;
            border: none;
            color: #ff3333;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .remove-slot-btn:hover {
            background: #ff3333;
            color: white;
          }

          .no-slots {
            color: #676879;
            font-style: italic;
            font-size: 12px;
            margin: 0;
            text-align: center;
            padding: 16px;
          }

          .loading-state, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
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

          .empty-state h3 {
            font-size: 24px;
            font-weight: 600;
            color: #323338;
            margin: 0;
          }

          .empty-state p {
            color: #676879;
            text-align: center;
            max-width: 400px;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }

            .header-actions {
              justify-content: flex-end;
            }

            .weekly-calendar {
              grid-template-columns: 1fr;
              padding: 16px;
            }

            .day-header {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }

            .day-controls {
              justify-content: space-between;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}