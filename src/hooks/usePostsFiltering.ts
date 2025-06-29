import { useState, useMemo } from 'react'
import type { PostWithAuthor } from './usePosts'

interface UsePostsFilteringProps {
  posts: PostWithAuthor[]
  itemsPerPage?: number
}

interface FilterState {
  searchTerm: string
  activeTab: string
  filterStatus: 'all' | 'draft' | 'published'
  sortColumn: keyof PostWithAuthor | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

interface UsePostsFilteringReturn {
  // State
  filterState: FilterState

  // Computed data
  filteredAndSortedPosts: PostWithAuthor[]
  paginatedPosts: PostWithAuthor[]
  totalPages: number

  // Actions
  setSearchTerm: (term: string) => void
  setActiveTab: (tab: string) => void
  setFilterStatus: (status: 'all' | 'draft' | 'published') => void
  setSortColumn: (column: keyof PostWithAuthor | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof PostWithAuthor) => void
  handlePageChange: (page: number) => void
  handleTabChange: (tabId: string) => void
}

export const usePostsFiltering = ({
  posts,
  itemsPerPage: initialItemsPerPage = 10
}: UsePostsFilteringProps): UsePostsFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [sortColumn, setSortColumn] = useState<keyof PostWithAuthor | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.author?.full_name &&
          post.author.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = activeTab === 'all' || post.type === activeTab
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })

    // Sort posts
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at || 0).getTime()
        bValue = new Date(b.created_at || 0).getTime()
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
