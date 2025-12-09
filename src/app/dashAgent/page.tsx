'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ticketService, ITicket } from '../services/ticketService';
import { userService, IUser } from '../services/userService';
import { notification } from '@/helpers/notificaciones';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function DashAgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [agents, setAgents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    agentId: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'agent') {
      router.push('/dashClient');
      return;
    }

    loadTickets();
    loadAgents();
  }, [session, status, router, statusFilter, priorityFilter]);

  const loadAgents = async () => {
    try {
      const data = await userService.getAgents();
      setAgents(data);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { status?: string; priority?: string } = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      
      const data = await ticketService.getTickets(filters);
      setTickets(data);
    } catch (err) {
      setError('Error al cargar los tickets. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket?._id) return;

    try {
      setError(null);
      const updatePayload: any = {};
      if (updateData.status) updatePayload.status = updateData.status;
      if (updateData.priority) updatePayload.priority = updateData.priority;
      if (updateData.agentId) updatePayload.agentId = updateData.agentId;

      await ticketService.updateTicket(selectedTicket._id, updatePayload);
      setShowUpdateModal(false);
      setSelectedTicket(null);
      setUpdateData({ status: '', priority: '', agentId: '' });
      loadTickets();
      notification('Ticket actualizado correctamente', 'success');
    } catch (err) {
      setError('Error al actualizar el ticket');
      notification('Error al actualizar el ticket', 'error');
      console.error(err);
    }
  };

  const openUpdateModal = (ticket: ITicket) => {
    setSelectedTicket(ticket);
    setUpdateData({
      status: ticket.status,
      priority: ticket.priority,
      agentId: typeof ticket.agentId === 'object' && ticket.agentId ? ticket.agentId._id : (ticket.agentId || ''),
    });
    setShowUpdateModal(true);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getClientName = (clientId: ITicket['clientId']) => {
    if (typeof clientId === 'object' && clientId) {
      return clientId.name;
    }
    return 'Cliente desconocido';
  };

  const getAgentName = (agentId: ITicket['agentId']) => {
    if (typeof agentId === 'object' && agentId) {
      return agentId.name;
    }
    return 'No asignado';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Agente
          </h1>
          <p className="text-gray-600">
            Bienvenido, {session?.user?.name || 'Agente'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="in-progress">En Progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las prioridades</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={loadTickets} variant="primary" size="md">
              Aplicar Filtros
            </Button>
          </div>
        </div>

        {/* Listado de Tickets */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Tickets ({tickets.length})
          </h2>
          {tickets.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500">
                No hay tickets para mostrar
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket._id}>
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {ticket.title}
                      </h3>
                      <Badge variant={ticket.status}>{ticket.status}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Prioridad:</span>
                        <Badge variant={ticket.priority}>{ticket.priority}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Cliente:</span>
                        <span className="font-medium">{getClientName(ticket.clientId)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Agente:</span>
                        <span className="font-medium">{getAgentName(ticket.agentId)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Creado:</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openUpdateModal(ticket)}
                        className="flex-1"
                      >
                        Gestionar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/tickets/${ticket._id}`)}
                        className="flex-1"
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Actualización */}
        {showUpdateModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Actualizar Ticket</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Abierto</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="resolved">Resuelto</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={updateData.priority}
                    onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar Agente
                  </label>
                  <select
                    value={updateData.agentId}
                    onChange={(e) => setUpdateData({ ...updateData, agentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin asignar</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona un agente para asignar el ticket
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpdateTicket}
                  className="flex-1"
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedTicket(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
