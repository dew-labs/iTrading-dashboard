import { useState, useMemo, useCallback } from 'react'
import type { DatabaseUser, Broker, Product } from '../../types'
import type { PostWithAuthor } from '../usePosts'

/**
 * Generic data table configuration
 */
export interface DataTableConfig<T> {
  searchFields?: (keyof T)[]
  filterFields?: Array<{
    key: keyof T
    type: 'select' | 'boolean' | 'date' | 'number'
    options?: Array<{ value: string; label: string }>
  }>
  sortableFields?: (keyof T)[]
  defaultSort?: {
    field: keyof T
    direction: 'asc' | 'desc'
  }
  itemsPerPageOptions?: number[]
  defaultItemsPerPage?: number
}

/**
 * Generic data table state
 */
export interface DataTableState<T> {
  searchTerm: string
  filters: Record<string, string | boolean | number>
  sortColumn: keyof T | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

/**
 * Generic data table return type
 */
export interface UseDataTableReturn<T> {
  // State
  state: DataTableState<T>

  // Computed data
  filteredData: T[]
  paginatedData: T[]
  totalPages: number
  totalItems: number

  // Actions
  setSearchTerm: (term: string) => void
  setFilter: (key: string, value: string | boolean | number) => void
  setSort: (column: keyof T, direction?: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setPageInputValue: (value: string) => void
  resetFilters: () => void

  // Handlers
  handleSort: (column: keyof T) => void
  handlePageChange: (page: number) => void
  handleSearch: (term: string) => void
}

/**
 * Generic data table hook
 * Replaces all the duplicated filtering hooks with a single reusable implementation
 */
export function useDataTable<T extends Record<string, unknown>>(
  data: T[],
  config: DataTableConfig<T> = {}
): UseDataTableReturn<T> {
  const {
    searchFields = [],
    filterFields = [],
    sortableFields = [],
    defaultSort,
    defaultItemsPerPage = 10
  } = config

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string | boolean | number>>({})
  const [sortColumn, setSortColumn] = useState<keyof T | null>(defaultSort?.field || null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSort?.direction || 'desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Memoized filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower)
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower)
          }
          return false
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== 'all') {
        const filterConfig = filterFields.find(f => f.key === key)
        if (filterConfig) {
          switch (filterConfig.type) {
            case 'select':
              filtered = filtered.filter(item => String(item[key]) === String(value))
              break
            case 'boolean':
              filtered = filtered.filter(item => Boolean(item[key]) === Boolean(value))
              break
            case 'number':
              filtered = filtered.filter(item => Number(item[key]) === Number(value))
              break
            default:
              filtered = filtered.filter(item => String(item[key]) === String(value))
          }
        }
      }
    })

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        let comparison = 0

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Try to parse as dates first
          const aDate = new Date(aValue)
          const bDate = new Date(bValue)
          if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
            comparison = aDate.getTime() - bDate.getTime()
          } else {
            comparison = aValue.localeCompare(bValue)
          }
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, filters, sortColumn, sortDirection, searchFields, filterFields])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  // Actions
  const setFilter = useCallback((key: string, value: string | boolean | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  const setSort = useCallback((column: keyof T, direction?: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction || (sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'))
  }, [sortColumn, sortDirection])

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    setPageInputValue(String(page))
  }, [totalPages])

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({})
    setCurrentPage(1)
    setPageInputValue('1')
  }, [])

  // Handlers
  const handleSort = useCallback((column: keyof T) => {
    if (sortableFields.includes(column)) {
      setSort(column)
    }
  }, [sortableFields, setSort])

  const handlePageChange = useCallback((page: number) => {
    setPage(page)
  }, [setPage])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    setPageInputValue('1')
  }, [])

  const state: DataTableState<T> = {
    searchTerm,
    filters,
    sortColumn,
    sortDirection,
    currentPage,
    itemsPerPage,
    pageInputValue
  }

  return {
    state,
    filteredData,
    paginatedData,
    totalPages,
    totalItems: filteredData.length,
    setSearchTerm: handleSearch,
    setFilter,
    setSort,
    setPage,
    setItemsPerPage,
    setPageInputValue,
    resetFilters,
    handleSort,
    handlePageChange,
    handleSearch
  }
}

// Export specific configurations for different entities
export const createPostsTableConfig = (): DataTableConfig<PostWithAuthor> => ({
  searchFields: ['author_name'], // Since title/content are in translations
  filterFields: [
    { key: 'status', type: 'select', options: [
      { value: 'all', label: 'All Status' },
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' }
    ]},
    { key: 'type', type: 'select', options: [
      { value: 'all', label: 'All Types' },
      { value: 'news', label: 'News' },
      { value: 'event', label: 'Events' },
      { value: 'terms_of_use', label: 'Terms of Use' },
      { value: 'privacy_policy', label: 'Privacy Policy' }
    ]}
  ],
  sortableFields: ['created_at', 'updated_at', 'views'],
  defaultSort: { field: 'created_at', direction: 'desc' }
})

export const createUsersTableConfig = (): DataTableConfig<DatabaseUser> => ({
  searchFields: ['full_name', 'email'],
  filterFields: [
    { key: 'status', type: 'select', options: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]},
    { key: 'role', type: 'select', options: [
      { value: 'all', label: 'All Roles' },
      { value: 'admin', label: 'Admin' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'user', label: 'User' }
    ]}
  ],
  sortableFields: ['full_name', 'email', 'created_at'],
  defaultSort: { field: 'created_at', direction: 'desc' }
})

export const createBrokersTableConfig = (): DataTableConfig<Broker> => ({
  searchFields: ['name', 'headquarter'],
  filterFields: [
    { key: 'is_visible', type: 'boolean' },
    { key: 'headquarter', type: 'select', options: [
      { value: 'all', label: 'All Headquarters' },
      // Add more headquarters as needed
    ]}
  ],
  sortableFields: ['name', 'headquarter', 'created_at'],
  defaultSort: { field: 'created_at', direction: 'desc' }
})

export const createProductsTableConfig = (): DataTableConfig<Product> => ({
  searchFields: ['id', 'affiliate_link'],
  filterFields: [],
  sortableFields: ['price', 'created_at'],
  defaultSort: { field: 'created_at', direction: 'desc' }
})
