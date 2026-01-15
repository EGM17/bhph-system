import { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { usePublicVehicles, useFilterOptions } from '../../hooks/usePublicVehicles';
import VehicleCard from '../../components/public/VehicleCard';
import { useLanguage } from '../../context/LanguageContext'; // 🆕 NUEVO

const STORAGE_KEY = 'inventory_filters';

export default function InventoryPage() {
  const { language } = useLanguage(); // 🆕 NUEVO
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
    
    if (language === 'es') {
      const labels = {
        featured: 'Destacados Primero',
        price: sortOrder === 'asc' ? 'Precio: Menor a Mayor' : 'Precio: Mayor a Menor',
        year: sortOrder === 'asc' ? 'Año: Más Antiguo' : 'Año: Más Reciente',
        mileage: sortOrder === 'asc' ? 'Millaje: Menor a Mayor' : 'Millaje: Mayor a Menor',
        createdAt: 'Más Recientes'
      };
      return labels[sortBy] || labels.featured;
    } else {
      const labels = {
        featured: 'Featured First',
        price: sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low',
        year: sortOrder === 'asc' ? 'Year: Oldest' : 'Year: Newest',
        mileage: sortOrder === 'asc' ? 'Mileage: Low to High' : 'Mileage: High to Low',
        createdAt: 'Most Recent'
      };
      return labels[sortBy] || labels.featured;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            {language === 'es' ? 'Conoce nuestro inventario' : 'Browse Our Inventory'}
          </h1>
          <p className="text-base md:text-xl text-blue-100">
            <span className="notranslate">{filteredVehicles.length}</span>{' '}
            {language === 'es' ? 'vehículos disponibles' : 'vehicles available'}
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
                placeholder={language === 'es' 
                  ? 'Buscar por marca, modelo o año...' 
                  : 'Search by make, model or year...'}
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
                {language === 'es' ? (
                  <>
                    <option value="featured">Destacados Primero</option>
                    <option value="price">Precio</option>
                    <option value="year">Año</option>
                    <option value="mileage">Millaje</option>
                    <option value="createdAt">Más Recientes</option>
                  </>
                ) : (
                  <>
                    <option value="featured">Featured First</option>
                    <option value="price">Price</option>
                    <option value="year">Year</option>
                    <option value="mileage">Mileage</option>
                    <option value="createdAt">Most Recent</option>
                  </>
                )}
              </select>
              <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              
              {(filters.sortBy === 'price' || filters.sortBy === 'year' || filters.sortBy === 'mileage') && (
                <button
                  onClick={() => {
                    const currentOrder = filters.sortOrder || 'desc';
                    handleFilterChange('sortOrder', currentOrder === 'desc' ? 'asc' : 'desc');
                  }}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition"
                  title={filters.sortOrder === 'asc' 
                    ? (language === 'es' ? 'Cambiar a descendente' : 'Change to descending')
                    : (language === 'es' ? 'Cambiar a ascendente' : 'Change to ascending')}
                >
                  <ArrowUpDown className={`w-4 h-4 text-blue-600 transition-transform ${
                    filters.sortOrder === 'asc' ? 'rotate-180' : ''
                  }`} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 transition font-medium"
            >
              <Filter className="w-5 h-5" />
              {language === 'es' ? 'Filtros' : 'Filters'}
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.keys(filters).filter(k => k !== 'sortBy' && k !== 'sortOrder').length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'es' ? 'Marca' : 'Make'}
                  </label>
                  <select
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">{language === 'es' ? 'Todas las marcas' : 'All makes'}</option>
                    {options.makes?.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'es' ? 'Año' : 'Year'}
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">{language === 'es' ? 'Todos los años' : 'All years'}</option>
                    {options.years?.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'es' ? 'Tipo de financiamiento' : 'Financing Type'}
                  </label>
                  <select
                    value={filters.financingType || ''}
                    onChange={(e) => handleFilterChange('financingType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'es' ? 'Todos' : 'All'}</option>
                    <option value="in-house">{language === 'es' ? 'Financiamiento en casa' : 'In-house Financing'}</option>
                    <option value="cash-only">{language === 'es' ? 'Solo efectivo' : 'Cash Only'}</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                  </button>
                </div>
              )}
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
                {language === 'es' ? 'No se encontraron vehículos' : 'No vehicles found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === 'es' 
                  ? 'Intenta ajustar tus filtros de búsqueda' 
                  : 'Try adjusting your search filters'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {language === 'es' ? 'Limpiar Filtros' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <span>
                {language === 'es' ? 'Mostrando' : 'Showing'} {filteredVehicles.length}{' '}
                {language === 'es' ? 'vehículos ordenados por:' : 'vehicles sorted by:'}
              </span>
              <span className="font-semibold text-blue-600">{getSortLabel()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} language={language} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}