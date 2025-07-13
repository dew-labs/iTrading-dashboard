import { useState, useMemo } from 'react'
import type { Banner } from '../types'
import { DEFAULT_VALUES } from '../constants/ui'

export interface FilterState {
  searchTerm: string
  filterStatus: string
  sortColumn: keyof Banner | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface UseBannersFilteringProps {
  banners: Banner[]
  itemsPerPage?: number
}

export interface UseBannersFilteringReturn {
  filterState: FilterState
  filteredAndSortedBanners: Banner[]
  paginatedBanners: Banner[]
  totalPages: number
  setSearchTerm: (term: string) => void
  setFilterStatus: (status: string) => void
  setSortColumn: (column: keyof Banner | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof Banner) => void
  handlePageChange: (page: number) => void
}

export const useBannersFiltering = ({
  banners,
  itemsPerPage: initialItemsPerPage = DEFAULT_VALUES.PAGINATION_LIMIT
}: UseBannersFilteringProps): UseBannersFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<keyof Banner | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting
  const filteredAndSortedBanners = useMemo(() => {
    const filtered = banners.filter(banner => {
      const matchesSearch = searchTerm === '' ||
        banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.target_url && banner.target_url.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && banner.is_visible) ||
        (filterStatus === 'inactive' && !banner.is_visible)

      return matchesSearch && matchesStatus
    })

    // Sort banners
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number | boolean
      let bValue: string | number | boolean

      switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'target_url':
        aValue = (a.target_url || '').toLowerCase()
        bValue = (b.target_url || '').toLowerCase()
        break
      case 'is_visible':
        aValue = a.is_visible ? 1 : 0
        bValue = b.is_visible ? 1 : 0
        break
      case 'created_at':
        aValue = new Date(a.created_at || 0).getTime()
        bValue = new Date(b.created_at || 0).getTime()
        break
      default:
        return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [banners, searchTerm, filterStatus, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBanners.length / itemsPerPage)
  const paginatedBanners = filteredAndSortedBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof Banner) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPageInputValue(page.toString())
  }

  const filterState: FilterState = {
    searchTerm,
    filterStatus,
    sortColumn,
    sortDirection,
    currentPage,
    itemsPerPage,
    pageInputValue
  }

  return {
    // State
    filterState,

    // Computed data
    filteredAndSortedBanners,
    paginatedBanners,
    totalPages,

    // Actions
    setSearchTerm,
    setFilterStatus,
    setSortColumn,
    setSortDirection,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  }
}
