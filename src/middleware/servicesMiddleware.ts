// Middleware for atendimento routes
// Handles authentication and authorization for atendimento endpoints

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../lib/auth';

export const atendimentoMiddleware = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      // Check authentication
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { error: 'Autenticação necessária para acessar atendimentos' },
          { status: 401 }
        );
      }

      // Add user to request
      (request as any).user = session.user;

      return handler(request);
    } catch (error) {
      console.error('Atendimento middleware error:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
  };
};