import mongoose, { Schema, Document, Model } from 'mongoose';

// Definir los estados permitidos del ticket
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// Definir las prioridades permitidas
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Interface para el documento de ticket
export interface ITicket extends Document {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

// Schema de Mongoose
const TicketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'resolved', 'closed'],
        message: 'El estado debe ser open, in-progress, resolved o closed',
      },
      default: 'open',
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'La prioridad debe ser low, medium, high o urgent',
      },
      default: 'medium',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID del cliente es requerido'],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices para mejorar rendimiento de búsquedas
TicketSchema.index({ clientId: 1, status: 1 });
TicketSchema.index({ agentId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });

// Prevenir la recreación del modelo en hot reload de Next.js
const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
