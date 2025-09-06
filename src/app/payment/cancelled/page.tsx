'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    setPaymentId(payment);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de cancelamento */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Título e mensagem */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>
        
        <p className="text-gray-600 mb-6">
          O pagamento foi cancelado. Seu agendamento não foi confirmado. 
          Você pode tentar novamente quando desejar.
        </p>

        {/* Informações do pagamento */}
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>ID do Pagamento:</strong> {paymentId}
            </p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link 
            href="/services"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
          >
            Tentar Novamente
          </Link>
          
          <Link 
            href="/dashboard/bookings"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
          >
            Ver Meus Agendamentos
          </Link>
          
          <Link 
            href="/"
            className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 transition-colors block"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
