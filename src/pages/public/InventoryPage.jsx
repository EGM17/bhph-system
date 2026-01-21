import { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { usePublicVehicles, useFilterOptions } from '../../hooks/usePublicVehicles';
import VehicleCard from '../../components/public/VehicleCard';
import SEO from '../../components/SEO';
import { useLanguage } from '../../context/LanguageContext';

const STORAGE_KEY = 'inventory_filters';

export default function InventoryPage() {
  const { language } = useLanguage();
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
        year: sortOrder === 'asc' ? 'Año: Más Antiguos' : 'Año: Más Recientes',
        mileage: sortOrder === 'asc' ? 'Millaje: Menor a Mayor' : 'Millaje: Mayor a Menor',
        createdAt: 'Recién Agregados'
      };
      return labels[sortBy] || 'Destacados Primero';
    } else {
      const labels = {
        featured: 'Featured First',
        price: sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low',
        year: sortOrder === 'asc' ? 'Year: Oldest' : 'Year: Newest',
        mileage: sortOrder === 'asc' ? 'Mileage: Low to High' : 'Mileage: High to Low',
        createdAt: 'Recently Added'
      };
      return labels[sortBy] || 'Featured First';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={language === 'es' ? 'Inventario de Autos' : 'Car Inventory'}
        description={
          language === 'es'
            ? 'Explora nuestro inventario de autos usados en Salem, Oregon. Financiamiento disponible sin revisar crédito. Encuentra tu auto ideal hoy.'
            : 'Explore our used car inventory in Salem, Oregon. Financing available with no credit check. Find your ideal car today.'
        }
        keywords={[
          'inventario autos salem',
          'autos usados salem',
          'carros en venta salem',
          'used cars salem oregon',
          'buy here pay here inventory'
        ]}
        type="website"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'es' ? 'Nuestro Inventario' : 'Our Inventory'}
          </h1>
          <p className="text-xl text-blue-100">
            {language === 'es' ? 'Encuentra el auto perfecto para ti' : 'Find the perfect car for you'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar por marca, modelo o año...' : 'Search by make, model or year...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Filter className="w-5 h-5" />
              {language === 'es' ? 'Filtros' : 'Filters'}
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {language === 'es' ? 'Activos' : 'Active'}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <ArrowUpDown className="w-5 h-5 text-gray-600" />
              <select
                value={filters.sortBy || 'featured'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="featured">{language === 'es' ? 'Destacados' : 'Featured'}</option>
                <option value="price">{language === 'es' ? 'Precio' : 'Price'}</option>
                <option value="year">{language === 'es' ? 'Año' : 'Year'}</option>
                <option value="mileage">{language === 'es' ? 'Millaje' : 'Mileage'}</option>
                <option value="createdAt">{language === 'es' ? 'Recientes' : 'Recent'}</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'es' ? 'Marca' : 'Make'}
                  </label>
                  <select
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">{language === 'es' ? 'Todas las marcas' : 'All makes'}</option>
                    {options.makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'es' ? 'Año' : 'Year'}
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">{language === 'es' ? 'Todos los años' : 'All years'}</option>
                    {options.years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'es' ? 'Precio máximo' : 'Max price'}
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="$50,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'es' ? 'Tipo de carrocería' : 'Body type'}
                  </label>
                  <select
                    value={filters.bodyType || ''}
                    onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={optionsLoading}
                  >
                    <option value="">{language === 'es' ? 'Todos los tipos' : 'All types'}</option>
                    {options.bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <X className="w-4 h-4" />
                  {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">
                {language === 'es' ? 'Cargando vehículos...' : 'Loading vehicles...'}
              </p>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {language === 'es' 
                ? 'No se encontraron vehículos con los filtros seleccionados'
                : 'No vehicles found with the selected filters'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {language === 'es' 
                ? `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}`
                : `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'vehicle found' : 'vehicles found'}`
              }
            </p>
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