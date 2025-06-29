import { useState, useMemo } from 'react'
import type { DatabaseUser } from '../types'

interface UseUsersFilteringProps {
  users: DatabaseUser[]
  itemsPerPage?: number
}

interface FilterState {
  searchTerm: string
  activeTab: string
  filterStatus: string
  filterRole: string
  sortColumn: keyof DatabaseUser | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

interface UseUsersFilteringReturn {
  // State
  filterState: FilterState

  // Computed data
  filteredAndSortedUsers: DatabaseUser[]
  paginatedUsers: DatabaseUser[]
  totalPages: number

  // Actions
  setSearchTerm: (term: string) => void
  setActiveTab: (tab: string) => void
  setFilterStatus: (status: string) => void
  setFilterRole: (role: string) => void
  setSortColumn: (column: keyof DatabaseUser | null) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof DatabaseUser) => void
  handlePageChange: (page: number) => void
  handleTabChange: (tabId: string) => void
}

export const useUsersFiltering = ({
  users,
  itemsPerPage: initialItemsPerPage = 10
}: UseUsersFilteringProps): UseUsersFilteringReturn => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<keyof DatabaseUser | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesTab = activeTab === 'all' || user.role === activeTab
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesTab && matchesStatus && matchesRole
    })

    // Sort users
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number | null
      let bValue: string | number | null

      switch (sortColumn) {
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'full_name':
        aValue = (a.full_name || '').toLowerCase()
        bValue = (b.full_name || '').toLowerCase()
        break
      case 'role':
        aValue = a.role
        bValue = b.role
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'last_login':
        aValue = a.last_login ? new Date(a.last_login).getTime() : 0
        bValue = b.last_login ? new Date(b.last_login).getTime() : 0
        break
      case 'created_at':
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0
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
  }, [users, searchTerm, activeTab, filterStatus, filterRole, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handleSort = (column: keyof DatabaseUser) => {
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
    filterRole,
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
    filteredAndSortedUsers,
    paginatedUsers,
    totalPages,

    // Actions
    setSearchTerm,
    setActiveTab,
    setFilterStatus,
    setFilterRole,
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
