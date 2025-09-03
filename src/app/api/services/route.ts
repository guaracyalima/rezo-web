// API route handler for atendimentos
// GET /api/atendimentos - Get all atendimentos
// POST /api/atendimentos - Create new atendimento

import { NextRequest, NextResponse } from 'next/server';
import { getAtendimentos, createAtendimento } from '../../../services/servicesService';
import { auth } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);

    const result = await getAtendimentos(filters);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching atendimentos:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar atendimentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const newAtendimento = await createAtendimento({
      ...data,
      providerId: session.user.id
    });

    return NextResponse.json(newAtendimento, { status: 201 });
  } catch (error: any) {
    console.error('Error creating atendimento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar atendimento' },
      { status: 500 }
    );
  }
}