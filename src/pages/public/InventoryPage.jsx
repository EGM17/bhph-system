import { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { usePublicVehicles, useFilterOptions } from '../../hooks/usePublicVehicles';
import VehicleCard from '../../components/public/VehicleCard';

const STORAGE_KEY = 'inventory_filters';

export default function InventoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  
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
      return saved ? JSON.parse(saved).filters || { sortBy: 'featured' } : { sortBy: 'featured' };
    } catch {
      return { sortBy: 'featured' };
    }
  });
  
  const { vehicles, loading, updateFilters } = usePublicVehicles(filters);
  const { options, loading: optionsLoading } = useFilterOptions();

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, search }));
    } catch (error) {
      console.error('Error guardando filtros:', error);
    }
  }, [filters, search]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === null || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    const newFilters = { ...filters, sortBy: newSortBy };
    
    // Limpiar sortOrder cuando cambie a featured o createdAt
    if (newSortBy === 'featured' || newSortBy === 'createdAt') {
      delete newFilters.sortOrder;
    }
    
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { sortBy: 'featured' };
    setFilters(emptyFilters);
    updateFilters(emptyFilters);
    setSearch('');
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

  const hasActiveFilters = Object.keys(filters).filter(k => k !== 'sortBy' && k !== 'sortOrder').length > 0 || search;

  const getSortLabel = () => {
    const sortBy = filters.sortBy || 'featured';
    const sortOrder = filters.sortOrder || 'desc';
    
    const labels = {
      featured: 'Destacados Primero',
      price: sortOrder === 'asc' ? 'Precio: Menor a Mayor' : 'Precio: Mayor a Menor',
      year: sortOrder === 'asc' ? 'Año: Más Antiguo' : 'Año: Más Reciente',
      mileage: sortOrder === 'asc' ? 'Millaje: Menor a Mayor' : 'Millaje: Mayor a Menor',
      createdAt: 'Más Recientes'
    };
    
    return labels[sortBy] || labels.featured;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Conoce nuestro inventario</h1>
          <p className="text-xl text-blue-100">
            <span className="notranslate">{filteredVehicles.length}</span>{' '}vehículos disponibles
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
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

            <div className="relative">
              <select
                value={filters.sortBy || 'featured'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer min-w-[240px]"
              >
                <option value="featured">Destacados Primero</option>
                <option value="price">Precio</option>
                <option value="year">Año</option>
                <option value="mileage">Millaje</option>
                <option value="createdAt">Más Recientes</option>
              </select>
              <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              
              {(filters.sortBy === 'price' || filters.sortBy === 'year' || filters.sortBy === 'mileage') && (
                <button
                  onClick={() => {
                    const currentOrder = filters.sortOrder || 'desc';
                    handleFilterChange('sortOrder', currentOrder === 'desc' ? 'asc' : 'desc');
                  }}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition"
                  title={filters.sortOrder === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
                >
                  <svg 
                    className="w-5 h-5 text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ transform: filters.sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                  {Object.keys(filters).filter(k => k !== 'sortBy' && k !== 'sortOrder').length}
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

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value || undefined)}
                    className="notranslate w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">Todas</option>
                    {options.makes.map(make => (
                      <option key={make} value={make} className="notranslate">{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                    className="notranslate w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">Todos</option>
                    {options.years.map(year => (
                      <option key={year} value={year} className="notranslate">{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Máximo
                  </label>
                  <select
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin límite</option>
                    <option value="5000">Hasta $5,000</option>
                    <option value="10000">Hasta $10,000</option>
                    <option value="15000">Hasta $15,000</option>
                    <option value="20000">Hasta $20,000</option>
                    <option value="30000">Hasta $30,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No se encontraron vehículos
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar tus filtros de búsqueda
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrando {filteredVehicles.length} vehículos ordenados por:</span>
              <span className="font-semibold text-blue-600">{getSortLabel()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}