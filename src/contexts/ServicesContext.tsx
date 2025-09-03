// Atendimentos Context
// Provides atendimento-related state management across the application

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Atendimento } from '../types/service';

interface AtendimentosState {
  atendimentos: Atendimento[];
  selectedAtendimento: Atendimento | null;
  loading: boolean;
  error: string | null;
}

type AtendimentosAction =
  | { type: 'SET_ATENDIMENTOS'; payload: Atendimento[] }
  | { type: 'SET_SELECTED_ATENDIMENTO'; payload: Atendimento | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ATENDIMENTO'; payload: Atendimento }
  | { type: 'UPDATE_ATENDIMENTO'; payload: Atendimento }
  | { type: 'DELETE_ATENDIMENTO'; payload: string };

const atendimentosReducer = (state: AtendimentosState, action: AtendimentosAction): AtendimentosState => {
  switch (action.type) {
    case 'SET_ATENDIMENTOS':
      return { ...state, atendimentos: action.payload };
    case 'SET_SELECTED_ATENDIMENTO':
      return { ...state, selectedAtendimento: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_ATENDIMENTO':
      return { ...state, atendimentos: [action.payload, ...state.atendimentos] };
    case 'UPDATE_ATENDIMENTO':
      return {
        ...state,
        atendimentos: state.atendimentos.map(a =>
          a.id === action.payload.id ? action.payload : a
        )
      };
    case 'DELETE_ATENDIMENTO':
      return {
        ...state,
        atendimentos: state.atendimentos.filter(a => a.id !== action.payload)
      };
    default:
      return state;
  }
};

const AtendimentosContext = createContext<{
  state: AtendimentosState;
  dispatch: React.Dispatch<AtendimentosAction>;
} | null>(null);

export const AtendimentosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(atendimentosReducer, {
    atendimentos: [],
    selectedAtendimento: null,
    loading: false,
    error: null
  });

  return (
    <AtendimentosContext.Provider value={{ state, dispatch }}>
      {children}
    </AtendimentosContext.Provider>
  );
};

export const useAtendimentosContext = () => {
  const context = useContext(AtendimentosContext);
  if (!context) {
    throw new Error('useAtendimentosContext must be used within an AtendimentosProvider');
  }
  return context;
};