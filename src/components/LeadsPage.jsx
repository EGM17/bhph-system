import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Mail, Phone, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { getAllLeads, updateLeadStatus, deleteLead } from '../services/leadService';
import { cacheService } from '../services/cacheService';

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

    // ⬅️ NUEVO: Suscribirse a invalidaciones de caché
    const unsubscribe = cacheService.subscribe((type) => {
      if (type === 'leads' || type === 'all') {
        console.log('🔄 Caché de leads invalidada, recargando...');
        loadLeads(true);
      }
    }, 'leads');

    return () => unsubscribe();
  }, []);

  // ⬅️ MODIFICADO: Función para cargar leads con caché
  const loadLeads = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const allLeads = await getAllLeads({}, forceRefresh);
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
      
      // La caché se invalida automáticamente en el servicio
      // Actualizar estado local inmediatamente para mejor UX
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
      
      // La caché se invalida automáticamente en el servicio
      // Actualizar estado local inmediatamente para mejor UX
      setLeads(leads.filter(lead => lead.id !== leadId));
    } catch (error) {
      console.error('Error eliminando lead:', error);
      alert('Error al eliminar el lead');
    }
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const statusOptions = [
    { value: 'all', label: 'Todos', color: 'gray' },
    { value: 'new', label: 'Nuevos', color: 'blue' },
    { value: 'contacted', label: 'Contactados', color: 'yellow' },
    { value: 'qualified', label: 'Calificados', color: 'purple' },
    { value: 'converted', label: 'Convertidos', color: 'green' },
    { value: 'closed', label: 'Cerrados', color: 'red' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">{filteredLeads.length} leads totales</p>
        </div>
        
        {/* Botón de refresh */}
        <button
          onClick={() => loadLeads(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === option.value
                  ? `bg-${option.color}-100 text-${option.color}-800 border-2 border-${option.color}-500`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({
                option.value === 'all' 
                  ? leads.length 
                  : leads.filter(l => l.status === option.value).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Leads */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No hay leads para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lead.vehicleInfo || 'No especificado'}</div>
                    {lead.vehicleId && (
                      <a
                        href={`/inventory/${lead.vehicleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Ver vehículo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(lead.createdAt)}</div>
                    <div className="text-xs text-gray-500">
                      Fuente: {lead.source === 'website' ? 'Web' : lead.source}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 font-semibold border-0 focus:ring-2 focus:ring-blue-500 ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="new">Nuevo</option>
                      <option value="contacted">Contactado</option>
                      <option value="qualified">Calificado</option>
                      <option value="converted">Convertido</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                        title="Eliminar lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensaje si hay notas */}
      {filteredLeads.some(lead => lead.message) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensajes de Leads</h3>
          <div className="space-y-4">
            {filteredLeads
              .filter(lead => lead.message)
              .map(lead => (
                <div key={lead.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{lead.name}</span>
                      <span className="text-sm text-gray-500 ml-2">{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{lead.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}