import axios from 'axios';

const API_BASE_URL = '/api';

export interface ITicket {
  _id?: string;
  title: string;
  description: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  agentId?: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  agentId?: string | null;
}

export const ticketService = {
  // Obtener todos los tickets (filtrados por rol en el backend)
  async getTickets(filters?: { status?: string; priority?: string }): Promise<ITicket[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      
      const response = await axios.get(`${API_BASE_URL}/tickets?${params.toString()}`);
      return response.data.tickets || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Obtener un ticket por ID
  async getTicketById(id: string): Promise<ITicket> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${id}`);
      return response.data.ticket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Crear un nuevo ticket
  async createTicket(data: CreateTicketData): Promise<ITicket> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, data);
      return response.data.ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Actualizar un ticket
  async updateTicket(id: string, data: UpdateTicketData): Promise<ITicket> {
    try {
      const response = await axios.put(`${API_BASE_URL}/tickets/${id}`, data);
      return response.data.ticket;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Eliminar un ticket
  async deleteTicket(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/tickets/${id}`);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },
};
