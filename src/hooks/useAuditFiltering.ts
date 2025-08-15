import { useState, useMemo } from 'react'
import type { AuditLog, AuditFilters } from '../types'
import { AUDIT_TABLES, AUDIT_ACTIONS } from '../types/audits'
import { DEFAULT_VALUES } from '../constants/ui'

interface FilterState {
  searchTerm: string
  selectedTable: string
  selectedAction: string
  selectedUser: string
  selectedRole: string
  dateFrom: string
  dateTo: string
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export const useAuditFiltering = (auditLogs: AuditLog[]) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_VALUES.PAGINATION_LIMIT * 2) // Audits use more items per page
  const [pageInputValue, setPageInputValue] = useState('1')

  // Get unique options for filters
  const filterOptions = useMemo(() => {
    const tables = Array.from(new Set(auditLogs.map(log => log.table_name)))
      .map(table => ({
        value: table,
        label: AUDIT_TABLES[table]?.displayName || table
      }))

    const actions = Object.keys(AUDIT_ACTIONS).map(action => ({
      value: action,
      label: AUDIT_ACTIONS[action as keyof typeof AUDIT_ACTIONS].label
    }))

    const users = Array.from(new Set(auditLogs
      .filter(log => log.user_email)
      .map(log => log.user_email!)))
      .map(email => ({
        value: email,
        label: email
      }))

    const roles = Array.from(new Set(auditLogs
      .filter(log => log.user_role)
      .map(log => log.user_role!)))
      .map(role => ({
        value: role,
        label: role.replace('_', ' ').toUpperCase()
      }))

    return { tables, actions, users, roles }
  }, [auditLogs])

  // Apply filters
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (
          !log.user_email?.toLowerCase().includes(searchLower) &&
          !log.table_name.toLowerCase().includes(searchLower) &&
          !log.record_id.toLowerCase().includes(searchLower) &&
          !log.action.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Table filter
      if (selectedTable !== 'all' && log.table_name !== selectedTable) {
        return false
      }

      // Action filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false
      }

      // User filter
      if (selectedUser !== 'all' && log.user_email !== selectedUser) {
        return false
      }

      // Role filter
      if (selectedRole !== 'all' && log.user_role !== selectedRole) {
        return false
      }

      // Date filters
      if (dateFrom && log.created_at && new Date(log.created_at) < new Date(dateFrom)) {
        return false
      }
      if (dateTo && log.created_at && new Date(log.created_at) > new Date(dateTo + 'T23:59:59')) {
        return false
      }

      return true
    })
  }, [auditLogs, searchTerm, selectedTable, selectedAction, selectedUser, selectedRole, dateFrom, dateTo])

  // Pagination
  const totalPages = Math.ceil(filteredAuditLogs.length / itemsPerPage)
  const paginatedAuditLogs = filteredAuditLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Actions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPageInputValue(page.toString())
  }



  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (selectedTable !== 'all') count++
    if (selectedAction !== 'all') count++
    if (selectedUser !== 'all') count++
    if (selectedRole !== 'all') count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }

  // Generate filters object for API (memoized to prevent unnecessary re-renders)
  const getApiFilters = useMemo((): AuditFilters => {
    const filters: AuditFilters = {}

    if (searchTerm) filters.search = searchTerm
    if (selectedTable !== 'all') filters.table_name = selectedTable
    if (selectedAction !== 'all') filters.action = selectedAction as 'INSERT' | 'UPDATE' | 'DELETE'
    if (selectedUser !== 'all') filters.user_email = selectedUser
    if (selectedRole !== 'all') filters.user_role = selectedRole as 'admin' | 'moderator'
    if (dateFrom) filters.date_from = dateFrom
    if (dateTo) filters.date_to = dateTo + 'T23:59:59'

    return filters
  }, [searchTerm, selectedTable, selectedAction, selectedUser, selectedRole, dateFrom, dateTo])

  const filterState: FilterState = {
    searchTerm,
    selectedTable,
    selectedAction,
    selectedUser,
    selectedRole,
    dateFrom,
    dateTo,
    currentPage,
    itemsPerPage,
    pageInputValue
  }

  return {
    // State
    filterState,
    filterOptions,

    // Computed data
    filteredAuditLogs,
    paginatedAuditLogs,
    totalPages,
    activeFiltersCount: getActiveFiltersCount(),

    // Actions
    setSearchTerm,
    setSelectedTable,
    setSelectedAction,
    setSelectedUser,
    setSelectedRole,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    setItemsPerPage,
    setPageInputValue,
    handlePageChange,
    getApiFilters
  }
}
