import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, Filter, TrendingUp, Package, DollarSign, Car } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import VehicleForm from './VehicleForm';
import { formatVehicleTitle } from '../../services/vinService';

export default function InventoryList() {
  const { vehicles, loading, stats, addVehicle, editVehicle, removeVehicle, togglePublish } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Filtrar vehículos
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.vin?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.stockNumber?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'published') return vehicle.isPublished;
    if (filter === 'draft') return !vehicle.isPublished;
    if (filter === 'available') return vehicle.status === 'available';
    if (filter === 'sold') return vehicle.status === 'sold';
    
    return true;
  });

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await editVehicle(editingVehicle.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }
      setShowForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      throw error;
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    if (confirm(`¿Estás seguro de eliminar ${formatVehicleTitle(vehicle)}? Esta acción no se puede deshacer.`)) {
      try {
        await removeVehicle(vehicle.id);
      } catch (error) {
        alert('Error al eliminar el vehículo');
      }
    }
  };

  const handleTogglePublish = async (vehicle) => {
    try {
      await togglePublish(vehicle.id, !vehicle.isPublished);
    } catch (error) {
      alert('Error al cambiar el estado de publicación');
    }
  };

  if (showForm) {
    return (
      <VehicleForm
        vehicle={editingVehicle}
        onSave={handleSaveVehicle}
        onCancel={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventario de Vehículos</h2>
          <p className="text-sm text-gray-600 mt-1">Gestiona el inventario de tu dealership</p>
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Agregar Vehículo
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inventario</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Car className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ${(stats.totalValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vistas Totales</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.totalViews || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por VIN, marca, modelo o stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
              <option value="available">Disponibles</option>
              <option value="sold">Vendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
        </div>
      )}

      {/* Lista de Vehículos */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay vehículos</p>
              <p className="text-sm mt-2">
                {search || filter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer vehículo al inventario'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock/VIN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Millaje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vistas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVehicles.map(vehicle => {
                    const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
                    const title = formatVehicleTitle(vehicle);
                    
                    return (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={title}
                              className="w-20 h-14 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{title}</p>
                          <p className="text-sm text-gray-600">{vehicle.bodyClass}</p>
                        </td>
                        
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{vehicle.stockNumber}</p>
                          <p className="text-xs text-gray-500 font-mono">{vehicle.vin?.slice(-8)}</p>
                        </td>
                        
                        <td className="px-6 py-4">
                          <p className="font-bold text-green-600">
                            ${(vehicle.price || 0).toLocaleString()}
                          </p>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(vehicle.mileage || 0).toLocaleString()} mi
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                              vehicle.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicle.status === 'available' ? 'Disponible' :
                               vehicle.status === 'sold' ? 'Vendido' : 'Pendiente'}
                            </span>
                            {vehicle.isPublished && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Publicado
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {vehicle.viewCount || 0}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePublish(vehicle)}
                              className={`p-2 rounded-lg transition ${
                                vehicle.isPublished
                                  ? 'text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={vehicle.isPublished ? 'Despublicar' : 'Publicar'}
                            >
                              {vehicle.isPublished ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(vehicle)}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}