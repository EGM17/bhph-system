'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import VehicleCard from './VehicleCard'
import type { Vehicle } from '@/types'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest'

interface InventoryClientProps {
  vehicles: Vehicle[]
  locale: string
}

export default function InventoryClient({ vehicles, locale }: InventoryClientProps) {
  const t = useTranslations('inventory')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [filterMake, setFilterMake] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles]
  )

  const years = useMemo(
    () => Array.from(new Set(vehicles.map((v) => String(v.year)))).sort((a, b) => Number(b) - Number(a)),
    [vehicles]
  )

  const filtered = useMemo(() => {
    let result = [...vehicles]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.make?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          String(v.year).includes(q) ||
          v.title?.en?.toLowerCase().includes(q) ||
          v.title?.es?.toLowerCase().includes(q)
      )
    }

    // Make filter
    if (filterMake) {
      result = result.filter((v) => v.make === filterMake)
    }

    // Year filter
    if (filterYear) {
      result = result.filter((v) => String(v.year) === filterYear)
    }

    // Sort
    switch (sort) {
      case 'featured':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
      case 'price-asc':
        result.sort(
          (a, b) => (a.monthlyPaymentFrom ?? a.price ?? 0) - (b.monthlyPaymentFrom ?? b.price ?? 0)
        )
        break
      case 'price-desc':
        result.sort(
          (a, b) => (b.monthlyPaymentFrom ?? b.price ?? 0) - (a.monthlyPaymentFrom ?? a.price ?? 0)
        )
        break
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [vehicles, search, sort, filterMake, filterYear])

  const sortLabel: Record<SortOption, string> = {
    featured: t('sortFeatured'),
    'price-asc': t('sortPriceLow'),
    'price-desc': t('sortPriceHigh'),
    newest: t('sortNewest'),
  }

  return (
    <>
      {/* Page header banner */}
      <div className="bg-blue-600 text-white py-10 px-4">
        <div className="container-section">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white">{t('title')}</h1>
          <p className="text-white/80 text-sm">
            {t('availableCount', { count: vehicles.filter((v) => v.status === 'available').length })}
          </p>
        </div>
      </div>

      <div className="container-section py-8">
        {/* Search + sort + filters bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input-field pl-10 py-2.5 text-sm"
              aria-label={t('searchPlaceholder')}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input-field pl-9 py-2.5 text-sm pr-8 appearance-none bg-white cursor-pointer min-w-[180px]"
              aria-label="Sort vehicles"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price-asc">{t('sortPriceLow')}</option>
              <option value="price-desc">{t('sortPriceHigh')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {t('filters')}
          </button>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div
            id="filters-panel"
            className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Make
              </label>
              <select
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="input-field py-2 text-sm min-w-[160px]"
              >
                <option value="">All makes</option>
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field py-2 text-sm min-w-[120px]"
              >
                <option value="">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {(filterMake || filterYear) && (
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterMake(''); setFilterYear('') }}
                  className="text-sm text-blue-600 hover:underline py-2"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {t('showing', { count: filtered.length })}{' '}
          <strong className="text-blue-600">{sortLabel[sort]}</strong>
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('noResults')}</p>
          </div>
        )}
      </div>
    </>
  )
}
