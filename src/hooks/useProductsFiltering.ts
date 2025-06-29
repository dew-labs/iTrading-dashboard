import { useState, useMemo } from 'react'
import type { Product } from '../types'

interface UseProductsFilteringProps {
  products: Product[]
  itemsPerPage?: number
}

interface FilterState {
  searchTerm: string
  filterType: 'all' | 'subscription' | 'oneTime'
  sortColumn: keyof Product | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

interface UseProductsFilteringReturn {
  // State
  filterState: FilterState

  // Computed data
  filteredAndSortedProducts: Product[]
  paginatedProducts: Product[]
  totalPages: number

  // Actions
  setSearchTerm: (term: string) => void
  setFilterType: (type: 'all' | 'subscription' | 'oneTime') => void
  setSortColumn: (column: keyof Product | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof Product) => void
  handlePageChange: (page: number) => void
}

export const useProductsFiltering = ({
  products,
  itemsPerPage: initialItemsPerPage = 10
}: UseProductsFilteringProps): UseProductsFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'subscription' | 'oneTime'>('all')
  const [sortColumn, setSortColumn] = useState<keyof Product | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType =
        filterType === 'all' ||
        (filterType === 'subscription' && product.subscription) ||
        (filterType === 'oneTime' && !product.subscription)

      return matchesSearch && matchesType
    })

    // Sort products
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'created_at':
      default:
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [products, searchTerm, filterType, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof Product) => {
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
    filterType,
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
    filteredAndSortedProducts,
    paginatedProducts,
    totalPages,

    // Actions
    setSearchTerm,
    setFilterType,
    setSortColumn,
    setSortDirection,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  }
}
