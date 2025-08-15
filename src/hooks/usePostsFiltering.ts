import { useState, useMemo } from 'react'
import type { PostWithAuthor } from './usePosts'
import { DEFAULT_VALUES } from '../constants/ui'

export interface FilterState {
  searchTerm: string
  activeTab: string
  filterStatus: 'all' | 'draft' | 'published'
  sortColumn: keyof PostWithAuthor | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface UsePostsFilteringProps {
  posts: PostWithAuthor[]
  itemsPerPage?: number
}

export interface UsePostsFilteringReturn {
  filterState: FilterState
  filteredAndSortedPosts: PostWithAuthor[]
  paginatedPosts: PostWithAuthor[]
  totalPages: number
  setSearchTerm: (term: string) => void
  setActiveTab: (tab: string) => void
  setFilterStatus: (status: 'all' | 'draft' | 'published') => void
  setSortColumn: (column: keyof PostWithAuthor | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof PostWithAuthor) => void
  handlePageChange: (page: number) => void
  handleTabChange: (tabId: string) => void
}

export const usePostsFiltering = ({
  posts,
  itemsPerPage: initialItemsPerPage = DEFAULT_VALUES.PAGINATION_LIMIT
}: UsePostsFilteringProps): UsePostsFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [sortColumn, setSortColumn] = useState<keyof PostWithAuthor | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting - simplified since title/content are now in translations
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      // Search functionality removed - title/content are now in translations
      // Only filter by author name if search is provided
      const matchesSearch =
        !searchTerm || // If no search term, match all
        (post.author?.full_name &&
          post.author.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = activeTab === 'all' || post.type === activeTab
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })

    // Sort posts - simplified since title is no longer available
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'created_at':
      default:
        aValue = new Date((a.created_at as string) || 0).getTime()
        bValue = new Date((b.created_at as string) || 0).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [posts, searchTerm, activeTab, filterStatus, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / itemsPerPage)
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof PostWithAuthor) => {
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1) // Reset to first page when changing tabs
    setPageInputValue('1')
  }

  const filterState: FilterState = {
    searchTerm,
    activeTab,
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
    filteredAndSortedPosts,
    paginatedPosts,
    totalPages,

    // Actions
    setSearchTerm,
    setActiveTab,
    setFilterStatus,
    setSortColumn,
    setSortDirection,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange,
    handleTabChange
  }
}
