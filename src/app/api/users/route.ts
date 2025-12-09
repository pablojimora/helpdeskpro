import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnection from '@/app/lib/dbconnection';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnection();

    // Obtener parámetro de filtro por rol
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Construir filtro
    const filter: any = {};
    if (role) {
      filter.role = role;
    }

    // Obtener usuarios (solo campos necesarios)
    const users = await User.find(filter)
      .select('_id name email role')
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
