import axios from 'axios';

const API_BASE_URL = '/api';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'agent';
}

export const userService = {
  // Obtener todos los usuarios
  async getUsers(role?: 'client' | 'agent'): Promise<IUser[]> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      
      const response = await axios.get(`${API_BASE_URL}/users?${params.toString()}`);
      return response.data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtener solo agentes
  async getAgents(): Promise<IUser[]> {
    return this.getUsers('agent');
  },

  // Obtener solo clientes
  async getClients(): Promise<IUser[]> {
    return this.getUsers('client');
  },
};
