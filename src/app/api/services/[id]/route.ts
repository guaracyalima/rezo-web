// API route handler for individual atendimento
// GET /api/atendimentos/[id] - Get atendimento by ID
// PUT /api/atendimentos/[id] - Update atendimento
// DELETE /api/atendimentos/[id] - Delete atendimento

import { NextRequest, NextResponse } from 'next/server';
import { getAtendimento, updateAtendimento, deleteAtendimento } from '../../../../services/servicesService';
import { auth } from '../../../../lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const atendimento = await getAtendimento(params.id);
    
    if (!atendimento) {
      return NextResponse.json(
        { error: 'Atendimento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(atendimento);
  } catch (error: any) {
    console.error('Error fetching atendimento:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar atendimento' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const updatedAtendimento = await updateAtendimento(params.id, data);

    return NextResponse.json(updatedAtendimento);
  } catch (error: any) {
    console.error('Error updating atendimento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar atendimento' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    await deleteAtendimento(params.id);

    return NextResponse.json({ message: 'Atendimento excluído com sucesso' });
  } catch (error: any) {
    console.error('Error deleting atendimento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir atendimento' },
      { status: 500 }
    );
  }
}