// Brokers Feature - API Types
import type { Broker } from '../../../types/brokers'

export type { Broker } from '../../../types/brokers'

// Feature-specific filter types
export interface BrokersFilterState {
  searchTerm: string
  filterType: 'all' | 'active' | 'inactive'
  sortColumn: keyof Broker | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface BrokersFilterOptions {
  brokers: Broker[]
  itemsPerPage?: number
}
