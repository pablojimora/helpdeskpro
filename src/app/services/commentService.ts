import axios from 'axios';

const API_BASE_URL = '/api';

export interface IComment {
  _id?: string;
  ticketId: string;
  author: {
    _id: string;
    name: string;
    email: string;
    role: 'client' | 'agent';
  };
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentData {
  ticketId: string;
  message: string;
}

export const commentService = {
  // Obtener comentarios de un ticket
  async getCommentsByTicket(ticketId: string): Promise<IComment[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments?ticketId=${ticketId}`);
      return response.data.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Crear un nuevo comentario
  async createComment(data: CreateCommentData): Promise<IComment> {
    try {
      const response = await axios.post(`${API_BASE_URL}/comments`, data);
      return response.data.comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
};
