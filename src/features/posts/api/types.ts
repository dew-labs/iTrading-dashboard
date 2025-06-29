// Posts Feature - API Types
import type { PostWithAuthor } from '../../../hooks/usePosts'

export type { Post, PostInsert, PostUpdate } from '../../../types/posts'
export type { PostWithAuthor } from '../../../hooks/usePosts'

// Feature-specific filter types
export interface PostsFilterState {
  searchTerm: string
  filterType: 'all' | 'news' | 'event' | 'terms_of_use' | 'privacy_policy'
  sortColumn: keyof PostWithAuthor | null
  sortDirection: 'asc' | 'desc'
  currentPage: number
  itemsPerPage: number
  pageInputValue: string
}

export interface PostsFilterOptions {
  posts: PostWithAuthor[]
  itemsPerPage?: number
}
