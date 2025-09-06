'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Capturar parâmetros da URL se necessário
    const payment = searchParams.get('payment');
    const booking = searchParams.get('booking');
    
    setPaymentId(payment);
    setBookingId(booking);
  }, [searchParams]);

  //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


   //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNWEyMWMyYS0zOTg0LTRkNzctODJiYS1jOTMyY2JlNzMxZmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU3MTIzMzgxLCJleHAiOjE3NjQ4MjQ0MDB9.6x8qzQuh3XHf2o0HfSzTglbEqbQfJxTsGS1_z_bOc4s
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de sucesso */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Título e mensagem */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento Realizado com Sucesso!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Seu agendamento foi confirmado e o pagamento processado com sucesso. 
          Você receberá um email de confirmação em breve.
        </p>

        {/* Informações do pagamento */}
        {paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>ID do Pagamento:</strong> {paymentId}
            </p>
            {bookingId && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>ID do Agendamento:</strong> {bookingId}
              </p>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link 
            href="/dashboard/bookings"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
          >
            Ver Meus Agendamentos
          </Link>
          
          <Link 
            href="/services"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors block"
          >
            Agendar Outro Serviço
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
