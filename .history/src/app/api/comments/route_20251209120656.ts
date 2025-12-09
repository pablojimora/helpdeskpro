import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnection from '@/app/lib/dbconnection';
import Comment from '@/app/models/comment';
import Ticket from '@/app/models/ticket';
import { sendAgentResponseEmail } from '@/app/services/emailService';

// GET - Obtener comentarios de un ticket
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnection();

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { error: 'El ticketId es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Verificar permisos: cliente solo puede ver comentarios de sus tickets
    if (userRole === 'client' && ticket.clientId.toString() !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver comentarios de este ticket' },
        { status: 403 }
      );
    }

    // Obtener comentarios del ticket
    const comments = await Comment.find({ ticketId })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 }); // Orden cronológico

    return NextResponse.json(
      { comments },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener los comentarios' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo comentario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, message } = body;

    if (!ticketId || !message) {
      return NextResponse.json(
        { error: 'ticketId y message son obligatorios' },
        { status: 400 }
      );
    }

    await dbConnection();

    // Verificar que el ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Verificar permisos: cliente solo puede comentar en sus tickets
    if (userRole === 'client' && ticket.clientId.toString() !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para comentar en este ticket' },
        { status: 403 }
      );
    }

    // Crear el comentario
    const comment = new Comment({
      ticketId,
      author: userId,
      message,
    });

    await comment.save();
    await comment.populate('author', 'name email role');

    // Enviar email al cliente si quien comenta es un agente
    if (userRole === 'agent') {
      try {
        await ticket.populate('clientId', 'name email');
        await ticket.populate('title');
        const clientData = ticket.clientId as any;
        const authorData = comment.author as any;
        
        await sendAgentResponseEmail({
          clientEmail: clientData.email,
          clientName: clientData.name,
          ticketId: ticket._id.toString(),
          ticketTitle: ticket.title,
          agentName: authorData.name,
          commentMessage: comment.message,
        });
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // No fallar el request si el email falla
      }
    }

    return NextResponse.json(
      {
        message: 'Comentario creado exitosamente',
        comment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear comentario:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el comentario' },
      { status: 500 }
    );
  }
}
