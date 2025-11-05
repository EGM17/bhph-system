import { useState } from 'react';
import { Search, Edit2, Trash2, Eye, Filter, X, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function ClientList({ clients, onEdit, onDelete, onViewDetail }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    overduePayments: 'all', // all, 1, 2, 3+
    overdueDays: 'all', // all, 1-30, 31-60, 61-90, 90+
    pendingDownPayment: false,
    pendingPlates: false,
    balanceRange: 'all' // all, 0-5000, 5000-10000, 10000+
  });

  const { formatCurrency } = useSettings();

  // 🔧 FIX: Calcular pagos atrasados correctamente
  const calculateOverduePayments = (client) => {
    if (!client.scheduledPayments) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return client.scheduledPayments.filter(sp => {
      if (sp.status === 'paid' || sp.remainingAmount <= 0) return false;
      
      const [year, month, day] = sp.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    }).length;
  };

  // Calcular días de atraso más antiguo
  const calculateOverdueDays = (client) => {
    if (!client.scheduledPayments) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueDates = client.scheduledPayments
      .filter(sp => {
        if (sp.status === 'paid' || sp.remainingAmount <= 0) return false;
        const [year, month, day] = sp.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
      .map(sp => {
        const [year, month, day] = sp.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      });
    
    return overdueDates.length > 0 ? Math.max(...overdueDates) : 0;
  };

  // Aplicar todos los filtros
  const filteredClients = clients.filter(client => {
    // Búsqueda por texto
    const matchesSearch = 
      client.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      client.vinNumber?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.includes(search);
    
    if (!matchesSearch) return false;

    // Filtro básico de estado
    if (filter !== 'all') {
      // 🔧 FIX: Verificar si realmente tiene pagos atrasados para ser moroso
      if (filter === 'defaulted') {
        const overdueCount = calculateOverduePayments(client);
        if (overdueCount === 0) return false;
      } else if (client.status !== filter) {
        return false;
      }
    }

    // Filtros avanzados
    if (showAdvancedFilters) {
      // Filtro por número de pagos atrasados
      if (advancedFilters.overduePayments !== 'all') {
        const overdueCount = calculateOverduePayments(client);
        if (advancedFilters.overduePayments === '1' && overdueCount !== 1) return false;
        if (advancedFilters.overduePayments === '2' && overdueCount !== 2) return false;
        if (advancedFilters.overduePayments === '3+' && overdueCount < 3) return false;
      }

      // Filtro por días de atraso
      if (advancedFilters.overdueDays !== 'all') {
        const days = calculateOverdueDays(client);
        if (advancedFilters.overdueDays === '1-30' && (days < 1 || days > 30)) return false;
        if (advancedFilters.overdueDays === '31-60' && (days < 31 || days > 60)) return false;
        if (advancedFilters.overdueDays === '61-90' && (days < 61 || days > 90)) return false;
        if (advancedFilters.overdueDays === '90+' && days < 90) return false;
      }

      // Filtro por enganche pendiente
      if (advancedFilters.pendingDownPayment) {
        const pending = (client.downPayment || 0) - (client.downPaymentPaid || 0);
        if (pending <= 0) return false;
      }

      // Filtro por placas pendientes
      if (advancedFilters.pendingPlates) {
        const pending = (client.platesAmount || 0) - (client.platesPaid || 0);
        if (pending <= 0) return false;
      }

      // Filtro por rango de balance
      if (advancedFilters.balanceRange !== 'all') {
        const balance = client.remainingBalance || 0;
        if (advancedFilters.balanceRange === '0-5000' && (balance < 0 || balance > 5000)) return false;
        if (advancedFilters.balanceRange === '5000-10000' && (balance < 5000 || balance > 10000)) return false;
        if (advancedFilters.balanceRange === '10000+' && balance < 10000) return false;
      }
    }

    return true;
  });

  // Estadísticas de los clientes filtrados
  const stats = {
    total: filteredClients.length,
    totalBalance: filteredClients.reduce((sum, c) => sum + (c.remainingBalance || 0), 0),
    avgBalance: filteredClients.length > 0 
      ? filteredClients.reduce((sum, c) => sum + (c.remainingBalance || 0), 0) / filteredClients.length 
      : 0,
    withOverdue: filteredClients.filter(c => calculateOverduePayments(c) > 0).length
  };

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      overduePayments: 'all',
      overdueDays: 'all',
      pendingDownPayment: false,
      pendingPlates: false,
      balanceRange: 'all'
    });
  };

  const hasActiveFilters = 
    advancedFilters.overduePayments !== 'all' ||
    advancedFilters.overdueDays !== 'all' ||
    advancedFilters.pendingDownPayment ||
    advancedFilters.pendingPlates ||
    advancedFilters.balanceRange !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros Avanzados
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {Object.values(advancedFilters).filter(v => v !== 'all' && v !== false).length}
            </span>
          )}
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Clientes Mostrados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Balance Total</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBalance)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Balance Promedio</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgBalance)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Con Pagos Atrasados</p>
          <p className="text-2xl font-bold text-red-600">{stats.withOverdue}</p>
        </div>
      </div>

      {/* Búsqueda y filtro básico */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, VIN o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="paid">Pagados</option>
            <option value="defaulted">Morosos</option>
          </select>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Avanzados
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetAdvancedFilters}
                className="flex items-center gap-2 px-3 py-1 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pagos atrasados */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Pagos Atrasados
              </label>
              <select
                value={advancedFilters.overduePayments}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, overduePayments: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="1">1 pago atrasado</option>
                <option value="2">2 pagos atrasados</option>
                <option value="3+">3+ pagos atrasados</option>
              </select>
            </div>

            {/* Días de atraso */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Días de Atraso
              </label>
              <select
                value={advancedFilters.overdueDays}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, overdueDays: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="1-30">1-30 días</option>
                <option value="31-60">31-60 días</option>
                <option value="61-90">61-90 días</option>
                <option value="90+">90+ días</option>
              </select>
            </div>

            {/* Rango de balance */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Rango de Balance
              </label>
              <select
                value={advancedFilters.balanceRange}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, balanceRange: e.target.value })}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="0-5000">$0 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">$10,000+</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advancedFilters.pendingDownPayment}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, pendingDownPayment: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">Con Enganche Pendiente</span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advancedFilters.pendingPlates}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, pendingPlates: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">Con Placas Pendientes</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago Mensual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atraso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map(client => {
                const hasPendingDown = (client.downPayment || 0) - (client.downPaymentPaid || 0) > 0;
                const hasPendingPlates = (client.platesAmount || 0) - (client.platesPaid || 0) > 0;
                const overdueCount = calculateOverduePayments(client);
                const overdueDays = calculateOverdueDays(client);
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{client.customerName}</p>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                        {(hasPendingDown || hasPendingPlates) && (
                          <div className="flex gap-1 mt-1">
                            {hasPendingDown && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Enganche
                              </span>
                            )}
                            {hasPendingPlates && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Placas
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {client.vehicleYear} {client.vehicleMake} {client.vehicleModel}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatCurrency(client.remainingBalance || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          de {formatCurrency(client.totalBalance || 0)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {formatCurrency(client.monthlyPayment || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {overdueCount > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                            {overdueCount} pago{overdueCount > 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-600">
                            {overdueDays} día{overdueDays > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                          Al día
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        overdueCount > 0 ? 'bg-red-100 text-red-800' :
                        client.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {overdueCount > 0 ? 'Moroso' :
                         client.status === 'paid' ? 'Pagado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(client)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          onClick={() => onEdit(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se encontraron clientes</p>
              <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}