import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import dbConnection from "@/app/lib/dbconnection";
import Ticket from "@/app/models/ticket";
import { sendTicketClosedEmail } from "@/app/services/emailService";

// GET - Obtener un ticket por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    await dbConnection();

    const { id } = await params;
    const ticket = await Ticket.findById(id)
      .populate("clientId", "name email")
      .populate("agentId", "name email");

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Verificar permisos: cliente solo puede ver sus propios tickets
    if (userRole === "client" && ticket.clientId._id.toString() !== userId) {
      return NextResponse.json(
        { error: "No autorizado para ver este ticket" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { ticket },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener ticket:", error);
    return NextResponse.json(
      { error: "Error al obtener el ticket" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, agentId } = body;

    await dbConnection();

    const { id } = await params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Cliente solo puede editar título y descripción de sus propios tickets
    if (userRole === "client") {
      if (ticket.clientId.toString() !== userId) {
        return NextResponse.json(
          { error: "No autorizado para editar este ticket" },
          { status: 403 }
        );
      }

      // Cliente solo puede modificar título y descripción
      if (title) ticket.title = title;
      if (description) ticket.description = description;
    }
    // Agente puede modificar todos los campos
    else if (userRole === "agent") {
      const wasClosing = status === "closed" && ticket.status !== "closed";
      
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (status) {
        ticket.status = status;
        // Si se cierra el ticket, marcar fecha de cierre
        if (status === "closed" && !ticket.closedAt) {
          ticket.closedAt = new Date();
        }
      }
      if (priority) ticket.priority = priority;
      if (agentId !== undefined) ticket.agentId = agentId || null;

      await ticket.save();
      await ticket.populate("clientId", "name email");
      await ticket.populate("agentId", "name email");

      // Enviar email al cliente si se cerró el ticket
      if (wasClosing) {
        try {
          const clientData = ticket.clientId as any;
          await sendTicketClosedEmail({
            clientEmail: clientData.email,
            clientName: clientData.name,
            ticketId: ticket._id.toString(),
            ticketTitle: ticket.title,
            closedAt: ticket.closedAt!,
          });
        } catch (emailError) {
          console.error('Error enviando email de cierre:', emailError);
          // No fallar el request si el email falla
        }
      }
    } else {
      return NextResponse.json(
        { error: "Rol no autorizado" },
        { status: 403 }
      );
    }

    // Populate solo si no es agente (ya se hizo arriba para agente)
    if (userRole === "client") {
      await ticket.save();
      await ticket.populate("clientId", "name email");
      await ticket.populate("agentId", "name email");
    }

    return NextResponse.json(
      {
        message: "Ticket actualizado exitosamente",
        ticket,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar ticket:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar el ticket" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    await dbConnection();

    const { id } = await params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Solo el cliente propietario o un agente pueden eliminar
    if (userRole === "client" && ticket.clientId.toString() !== userId) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este ticket" },
        { status: 403 }
      );
    }

    await Ticket.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Ticket eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar ticket:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ticket" },
      { status: 500 }
    );
  }
}
