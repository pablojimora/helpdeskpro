'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ticketService, ITicket } from '@/app/services/ticketService';
import { commentService, IComment } from '@/app/services/commentService';
import { notification } from '@/helpers/notificaciones';
import Card from '@/app/components/Card';
import Badge from '@/app/components/Badge';
import Button from '@/app/components/Button';

export default function TicketDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (ticketId) {
      loadTicketAndComments();
    }
  }, [session, status, router, ticketId]);

  const loadTicketAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        commentService.getCommentsByTicket(ticketId),
      ]);
      
      setTicket(ticketData);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los datos');
      notification('Error al cargar el ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      notification('El comentario no puede estar vacío', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const comment = await commentService.createComment({
        ticketId,
        message: newComment,
      });
      
      setComments([...comments, comment]);
      setNewComment('');
      notification('Comentario agregado correctamente', 'success');
    } catch (err: any) {
      notification(err.response?.data?.error || 'Error al agregar comentario', 'error');
    } finally {
      setSubmitting(false);
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

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Ticket no encontrado'}</p>
              <Button onClick={() => router.back()} variant="secondary">
                Volver
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => router.back()} variant="secondary" size="sm">
            ← Volver
          </Button>
        </div>

        {/* Información del Ticket */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <div className="flex gap-2">
                <Badge variant={ticket.status}>{getStatusText(ticket.status)}</Badge>
                <Badge variant={ticket.priority}>{getPriorityText(ticket.priority)}</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Descripción:</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Información:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Cliente:</span>
                  <p className="font-medium">{getClientName(ticket.clientId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Agente:</span>
                  <p className="font-medium">{getAgentName(ticket.agentId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Creado:</span>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Actualizado:</span>
                  <p className="font-medium">{formatDate(ticket.updatedAt)}</p>
                </div>
                {ticket.closedAt && (
                  <div>
                    <span className="text-gray-500">Cerrado:</span>
                    <p className="font-medium">{formatDate(ticket.closedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Sección de Comentarios */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Comentarios ({comments.length})
          </h2>

          {/* Listado de Comentarios */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {comment.author.name}
                      </span>
                      <Badge
                        variant={comment.author.role === 'agent' ? 'in-progress' : 'open'}
                        className="ml-2"
                      >
                        {comment.author.role === 'agent' ? 'Agente' : 'Cliente'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Formulario para agregar comentario */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Agregar Comentario</h3>
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario aquí..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                maxLength={2000}
                disabled={submitting}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newComment.length}/2000 caracteres
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? 'Enviando...' : 'Agregar Comentario'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
