import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Mail, Phone, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { getAllLeads, updateLeadStatus, deleteLead } from '../services/leadService';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date instanceof Date ? date : date.toDate();
      return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const allLeads = await getAllLeads();
      setLeads(allLeads);
    } catch (error) {
      console.error('Error cargando leads:', error);
      alert('Error al cargar los leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    
    try {
      await deleteLead(leadId);
      setLeads(leads.filter(lead => lead.id !== leadId));
    } catch (error) {
      console.error('Error eliminando lead:', error);
      alert('Error al eliminar el lead');
    }
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    new: 'Nuevo',
    contacted: 'Contactado',
    qualified: 'Calificado',
    converted: 'Convertido',
    closed: 'Cerrado'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-gray-600">Gestiona los contactos recibidos desde el sitio web</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total de leads</p>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({leads.length})
          </button>
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = leads.filter(l => l.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Leads */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay leads
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'Aún no has recibido contactos desde el sitio web'
              : `No hay leads con estado "${statusLabels[filterStatus]}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {lead.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(lead.createdAt?.toDate?.() || lead.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(lead.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar lead"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Mensaje */}
              {lead.message && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Mensaje:</p>
                  <p className="text-gray-600">{lead.message}</p>
                </div>
              )}

              {/* Información del Vehículo */}
              {lead.vehicleInfo && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Vehículo de interés:</p>
                      <p className="font-semibold text-gray-900">
                        {lead.vehicleInfo.year} {lead.vehicleInfo.make} {lead.vehicleInfo.model}
                      </p>
                      {lead.vehicleInfo.price && (
                        <p className="text-sm text-gray-600">
                          Precio: ${lead.vehicleInfo.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {lead.vehicleId && (
                      <a
                        href={`/vehicle/${lead.vehicleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver vehículo
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Información Adicional */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {lead.preferredContact && (
                  <span>
                    <strong>Contacto preferido:</strong> {lead.preferredContact === 'phone' ? 'Teléfono' : 'Email'}
                  </span>
                )}
                {lead.source && (
                  <span>
                    <strong>Origen:</strong> {lead.source === 'contact_page' ? 'Página de contacto' : 'Detalle de vehículo'}
                  </span>
                )}
              </div>

              {/* Cambiar Estado */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center">Cambiar estado:</span>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(lead.id, status)}
                    disabled={lead.status === status}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      lead.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}