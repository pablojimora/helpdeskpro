import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import dbConnection from "@/app/lib/dbconnection";
import Ticket from "@/app/models/ticket";
import { sendTicketCreatedEmail } from "@/app/services/emailService";

// POST - Crear un nuevo ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { title, description, priority } = await request.json();

    // Validaciones básicas
    if (!title || !description) {
      return NextResponse.json(
        { error: "Título y descripción son requeridos" },
        { status: 400 }
      );
    }

    await dbConnection();

    // Crear el ticket asociado al usuario autenticado
    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || "medium",
      status: "open",
      clientId: (session.user as any).id,
    });

    // Poblar la información del cliente
    await newTicket.populate("clientId", "name email");

    // Enviar correo al cliente
    try {
      const clientData = newTicket.clientId as any;
      await sendTicketCreatedEmail({
        clientEmail: clientData.email,
        clientName: clientData.name,
        ticketId: newTicket._id.toString(),
        ticketTitle: newTicket.title,
        ticketDescription: newTicket.description,
      });
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      // No fallar el request si el email falla
    }

    return NextResponse.json(
      {
        message: "Ticket creado exitosamente",
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear ticket:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el ticket" },
      { status: 500 }
    );
  }
}

// GET - Obtener tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    await dbConnection();

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const priorityFilter = searchParams.get('priority');

    // Construir filtro base
    let filter: any = {};

    // Si es cliente, solo ve sus propios tickets
    if (userRole === "client") {
      filter.clientId = userId;
    } 
    // Si es agente, ve todos los tickets
    else if (userRole === "agent") {
      // No se agrega filtro adicional, ve todos
    } else {
      return NextResponse.json(
        { error: "Rol no autorizado" },
        { status: 403 }
      );
    }

    // Aplicar filtros adicionales
    if (statusFilter) {
      filter.status = statusFilter;
    }
    if (priorityFilter) {
      filter.priority = priorityFilter;
    }

    const tickets = await Ticket.find(filter)
      .populate("clientId", "name email")
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { tickets },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json(
      { error: "Error al obtener tickets" },
      { status: 500 }
    );
  }
}
