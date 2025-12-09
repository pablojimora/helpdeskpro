import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  ticketId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'El ticket es obligatorio'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es obligatorio'],
  },
  message: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    minlength: [1, 'El mensaje debe tener al menos 1 carácter'],
    maxlength: [2000, 'El mensaje no puede exceder 2000 caracteres'],
  },
}, {
  timestamps: true, // Crea automáticamente createdAt y updatedAt
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
