'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ticketService, ITicket, CreateTicketData } from '../services/ticketService';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function DashClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'client') {
      router.push('/dashAgent');
      return;
    }

    loadTickets();
  }, [session, status, router]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (err) {
      setError('Error al cargar los tickets. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors = { title: '', description: '' };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    } else if (formData.title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
      isValid = false;
    } else if (formData.title.length > 200) {
      errors.title = 'El título no puede exceder 200 caracteres';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
      isValid = false;
    } else if (formData.description.length > 2000) {
      errors.description = 'La descripción no puede exceder 2000 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateEditForm = (): boolean => {
    const errors = { title: '', description: '' };
    let isValid = true;

    if (!editFormData.title.trim()) {
      errors.title = 'El título es obligatorio';
      isValid = false;
    } else if (editFormData.title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
      isValid = false;
    } else if (editFormData.title.length > 200) {
      errors.title = 'El título no puede exceder 200 caracteres';
      isValid = false;
    }

    if (!editFormData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
      isValid = false;
    } else if (editFormData.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
      isValid = false;
    } else if (editFormData.description.length > 2000) {
      errors.description = 'La descripción no puede exceder 2000 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await ticketService.createTicket(formData);
      setSuccess('Ticket creado correctamente');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'medium' });
      setFormErrors({ title: '', description: '' });
      loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el ticket');
      console.error(err);
    }
  };

  const handleViewDetail = (ticket: ITicket) => {
    router.push(`/tickets/${ticket._id}`);
  };

  const handleOpenEditModal = (ticket: ITicket) => {
    setSelectedTicket(ticket);
    setEditFormData({
      title: ticket.title,
      description: ticket.description,
    });
    setFormErrors({ title: '', description: '' });
    setShowEditModal(true);
  };

  const handleEditTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !selectedTicket?._id) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await ticketService.updateTicket(selectedTicket._id, {
        title: editFormData.title,
        description: editFormData.description,
      });
      setSuccess('Ticket actualizado correctamente');
      setShowEditModal(false);
      setSelectedTicket(null);
      setEditFormData({ title: '', description: '' });
      setFormErrors({ title: '', description: '' });
      loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el ticket');
      console.error(err);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAgentName = (agentId: ITicket['agentId']) => {
    if (typeof agentId === 'object' && agentId) {
      return agentId.name;
    }
    return 'No asignado';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'open': 'Abierto',
      'in-progress': 'En Progreso',
      'resolved': 'Resuelto',
      'closed': 'Cerrado',
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente',
    };
    return priorityMap[priority] || priority;
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Tickets de Soporte
            </h1>
            <p className="text-gray-600">
              Bienvenido, {session?.user?.name || 'Cliente'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowCreateModal(true)}
          >
            + Crear Nuevo Ticket
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Listado de Tickets */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Mis Tickets ({tickets.length})
          </h2>
          {tickets.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No tienes tickets creados aún
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreateModal(true)}
                >
                  Crear mi primer ticket
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket._id}>
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {ticket.title}
                      </h3>
                      <Badge variant={ticket.status}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {ticket.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Prioridad:</span>
                        <Badge variant={ticket.priority}>
                          {getPriorityText(ticket.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Agente asignado:</span>
                        <span className="font-medium text-gray-700">
                          {getAgentName(ticket.agentId)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Creado:</span>
                        <span className="text-gray-700">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                      {ticket.closedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Cerrado:</span>
                          <span className="text-gray-700">
                            {formatDate(ticket.closedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(ticket)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetail(ticket)}
                          className="flex-1"
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Creación */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Crear Nuevo Ticket</h2>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Ticket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      setFormErrors({ ...formErrors, title: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Ej: Problema con el inicio de sesión"
                    maxLength={200}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Problema <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setFormErrors({ ...formErrors, description: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.description
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Describe detalladamente tu problema o solicitud..."
                    rows={6}
                    maxLength={2000}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/2000 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    Crear Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ title: '', description: '', priority: 'medium' });
                      setFormErrors({ title: '', description: '' });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        {showDetailModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Detalle del Ticket</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedTicket.title}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Badge variant={selectedTicket.status}>
                      {getStatusText(selectedTicket.status)}
                    </Badge>
                    <Badge variant={selectedTicket.priority}>
                      {getPriorityText(selectedTicket.priority)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Descripción:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Información del Ticket:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <p className="font-medium">{getStatusText(selectedTicket.status)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prioridad:</span>
                      <p className="font-medium">{getPriorityText(selectedTicket.priority)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Agente Asignado:</span>
                      <p className="font-medium">{getAgentName(selectedTicket.agentId)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Creado:</span>
                      <p className="font-medium">{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Última actualización:</span>
                      <p className="font-medium">{formatDate(selectedTicket.updatedAt)}</p>
                    </div>
                    {selectedTicket.closedAt && (
                      <div>
                        <span className="text-gray-500">Fecha de cierre:</span>
                        <p className="font-medium">{formatDate(selectedTicket.closedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 italic">
                    Nota: Si necesitas agregar más información o hacer seguimiento, 
                    contacta con el agente asignado o espera su respuesta.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenEditModal(selectedTicket);
                  }}
                  className="flex-1"
                >
                  Editar Ticket
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición */}
        {showEditModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Editar Ticket</h2>
              
              <form onSubmit={handleEditTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Ticket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, title: e.target.value });
                      setFormErrors({ ...formErrors, title: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Ej: Problema con el inicio de sesión"
                    maxLength={200}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.title.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Problema <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, description: e.target.value });
                      setFormErrors({ ...formErrors, description: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.description
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Describe detalladamente tu problema o solicitud..."
                    rows={6}
                    maxLength={2000}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.description.length}/2000 caracteres
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Como cliente, solo puedes editar el título y la descripción de tus tickets. 
                    El estado, prioridad y agente asignado son gestionados por el equipo de soporte.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTicket(null);
                      setEditFormData({ title: '', description: '' });
                      setFormErrors({ title: '', description: '' });
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
