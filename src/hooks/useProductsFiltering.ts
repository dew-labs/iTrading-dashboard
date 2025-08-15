import { useState, useMemo } from 'react'
import type { Product } from '../types'
import { DEFAULT_VALUES } from '../constants/ui'

export interface FilterState {
  searchTerm: string
  sortColumn: keyof Product | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface UseProductsFilteringProps {
  products: Product[]
  itemsPerPage?: number
}

export interface UseProductsFilteringReturn {
  filterState: FilterState
  filteredAndSortedProducts: Product[]
  paginatedProducts: Product[]
  totalPages: number
  setSearchTerm: (term: string) => void
  setSortColumn: (column: keyof Product | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof Product) => void
  handlePageChange: (page: number) => void
}

export const useProductsFiltering = ({
  products,
  itemsPerPage: initialItemsPerPage = DEFAULT_VALUES.PAGINATION_LIMIT
}: UseProductsFilteringProps): UseProductsFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Product | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const sorted = [...products]
    sorted.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'created_at':
      default:
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0
        break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }, [products, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

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
    pageInputValue
  }

  return {
    filterState,

    filteredAndSortedProducts,
    paginatedProducts,
    totalPages,

    setSearchTerm,
    setSortColumn,
    setSortDirection,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  };
}
