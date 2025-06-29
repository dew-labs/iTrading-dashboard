// Users Feature - API Types
import type { DatabaseUser, UserRole } from '../../../types/users'

export type { DatabaseUser, Permission, UserRole } from '../../../types/users'

// Feature-specific filter types
export interface UsersFilterState {
  searchTerm: string
  filterRole: UserRole | 'all'
  sortColumn: keyof DatabaseUser | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface UsersFilterOptions {
  users: DatabaseUser[]
  itemsPerPage?: number
}
