import { useState, useMemo } from 'react'
import type { Broker } from '../types'
import { DEFAULT_VALUES } from '../constants/ui'

export interface FilterState {
  searchTerm: string
  sortColumn: keyof Broker | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
  viewMode: 'list' | 'card'
}

export interface UseBrokersFilteringProps {
  brokers: Broker[]
  itemsPerPage?: number
}

export interface UseBrokersFilteringReturn {
  filterState: FilterState
  filteredAndSortedBrokers: Broker[]
  paginatedBrokers: Broker[]
  totalPages: number
  setSearchTerm: (term: string) => void
  setSortColumn: (column: keyof Broker | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setPageInputValue: (value: string) => void
  setViewMode: (mode: 'list' | 'card') => void
  handleSort: (column: keyof Broker) => void
  handlePageChange: (page: number) => void
}

export const useBrokersFiltering = ({
  brokers,
  itemsPerPage: initialItemsPerPage = DEFAULT_VALUES.BROKERS_PAGINATION_LIMIT
}: UseBrokersFilteringProps): UseBrokersFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Broker | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')

  // Enhanced filtering and sorting
  const filteredAndSortedBrokers = useMemo(() => {
    const filtered = brokers.filter(broker => {
      const matchesSearch =
        (broker.headquarter &&
          broker.headquarter.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.name && broker.name.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })

    // Sort brokers
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'headquarter':
        aValue = (a.headquarter || '').toLowerCase()
        bValue = (b.headquarter || '').toLowerCase()
        break
      case 'established_in':
        aValue = a.established_in || 0
        bValue = b.established_in || 0
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
  }, [brokers, searchTerm, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBrokers.length / itemsPerPage)
  const paginatedBrokers = filteredAndSortedBrokers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof Broker) => {
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
    sortColumn,
    sortDirection,
    currentPage,
    itemsPerPage,
    pageInputValue,
    viewMode
  }

  return {
    // State
    filterState,

    // Computed data
    filteredAndSortedBrokers,
    paginatedBrokers,
    totalPages,

    // Actions
    setSearchTerm,
    setSortColumn,
    setSortDirection,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    setViewMode,
    handleSort,
    handlePageChange
  }
}
