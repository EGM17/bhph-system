import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { usePublicVehicles, useFilterOptions } from '../../hooks/usePublicVehicles';
import VehicleCard from '../../components/public/VehicleCard';

const STORAGE_KEY = 'inventory_filters';

export default function InventoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  
  // 🔧 Cargar filtros desde sessionStorage al iniciar
  const [search, setSearch] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).search || '' : '';
    } catch {
      return '';
    }
  });
  
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).filters || {} : {};
    } catch {
      return {};
    }
  });
  
  const { vehicles, loading, updateFilters } = usePublicVehicles(filters);
  const { options, loading: optionsLoading } = useFilterOptions();

  // 💾 Guardar filtros en sessionStorage cuando cambien
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, search }));
    } catch (error) {
      console.error('Error guardando filtros:', error);
    }
  }, [filters, search]);

  // 🔧 FIX: Eliminar keys con valor undefined/vacío del objeto
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    
    // Si el valor es undefined, null o string vacío, eliminar la key
    if (value === undefined || value === null || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    updateFilters(emptyFilters);
    setSearch('');
    // También limpiar del storage
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando filtros:', error);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.year?.toString().includes(searchLower)
    );
  });

  const hasActiveFilters = Object.keys(filters).length > 0 || search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Inventario */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Conoce nuestro inventario</h1>
          <p className="text-xl text-blue-100">
            {filteredVehicles.length} vehículos disponibles
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo o año..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">Todas</option>
                    {options.makes.map(make => (
                      <option key={make} value={make}className="notranslate">{make}</option>
                    ))}
                  </select>
                </div>

                {/* Año */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">Todos</option>
                    {options.years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Precio Máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Máximo
                  </label>
                  <select
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin límite</option>
                    <option value="10000">Hasta $5,000</option>
                    <option value="15000">Hasta $7,000</option>
                    <option value="20000">Hasta $9,000</option>
                    <option value="25000">Hasta $15,000</option>
                  </select>
                </div>

                {/* Tipo de Carrocería */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo
                  </label>
                  <select
                    value={filters.bodyType || ''}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">Todos</option>
                    {options.bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando vehículos...</p>
          </div>
        )}

        {/* Grid de Vehículos */}
        {!loading && (
          <>
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-600 mb-2">
                  No se encontraron vehículos
                </p>
                <p className="text-gray-500">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}