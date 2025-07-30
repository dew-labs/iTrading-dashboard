import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { usePermissions } from './usePermissions'

export interface DashboardStats {
  users: {
    total: number
    active: number
    newThisMonth: number
    byRole: {
      user: number
      moderator: number
      admin: number
    }
  }
  posts: {
    total: number
    published: number
    draft: number
    views: number
    newThisMonth: number
  }
  products: {
    total: number
    withAffiliateLink: number
    averagePrice: number
  }
  brokers: {
    total: number
    visible: number
    byCategory: Record<string, number>
  }
  banners: {
    total: number
    active: number
    visibilityRate: number
  }
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch all stats in parallel for better performance
    const [
      usersStats,
      postsStats,
      productsStats,
      brokersStats,
      bannersStats,
      userRoles,
      brokerCategories
    ] = await Promise.all([
      // Users stats
      supabase
        .from('users')
        .select('id, created_at, last_login, status, role')
        .neq('role', 'user'), // Only count non-user roles for dashboard

      // Posts stats  
      supabase
        .from('posts')
        .select('id, created_at, status, views'),

      // Products stats
      supabase
        .from('products')
        .select('id, price, affiliate_link'),

      // Brokers stats
      supabase
        .from('brokers')
        .select('id, is_visible, category_id, created_at'),

      // Banners stats
      supabase
        .from('banners')
        .select('id, is_visible, created_at'),

      // User roles breakdown
      supabase
        .from('users')
        .select('role')
        .neq('role', 'user'),

      // Broker categories
      supabase
        .from('broker_categories')
        .select('id, name')
    ])

    // Process users data
    const currentDate = new Date()
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    const totalUsers = usersStats.data?.length || 0
    const activeUsers = usersStats.data?.filter(user => 
      user.last_login && new Date(user.last_login) >= thirtyDaysAgo
    ).length || 0
    const newUsersThisMonth = usersStats.data?.filter(user =>
      new Date(user.created_at) >= startOfMonth
    ).length || 0

    // User roles breakdown
    const roleBreakdown = userRoles.data?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, { user: 0, moderator: 0, admin: 0 }) || { user: 0, moderator: 0, admin: 0 }

    // Process posts data
    const totalPosts = postsStats.data?.length || 0
    const publishedPosts = postsStats.data?.filter(post => post.status === 'published').length || 0
    const draftPosts = postsStats.data?.filter(post => post.status === 'draft').length || 0
    const totalViews = postsStats.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
    const newPostsThisMonth = postsStats.data?.filter(post =>
      new Date(post.created_at) >= startOfMonth
    ).length || 0

    // Process products data
    const totalProducts = productsStats.data?.length || 0
    const productsWithAffiliateLink = productsStats.data?.filter(product => 
      product.affiliate_link
    ).length || 0
    const averagePrice = productsStats.data?.length 
      ? productsStats.data.reduce((sum, product) => sum + (product.price || 0), 0) / productsStats.data.length
      : 0

    // Process brokers data
    const totalBrokers = brokersStats.data?.length || 0
    const visibleBrokers = brokersStats.data?.filter(broker => broker.is_visible).length || 0
    
    // Broker categories breakdown
    const categoryMap = brokerCategories.data?.reduce((acc, category) => {
      acc[category.id] = category.name
      return acc
    }, {} as Record<string, string>) || {}

    const brokersByCategory = brokersStats.data?.reduce((acc, broker) => {
      const categoryName = categoryMap[broker.category_id || ''] || 'Uncategorized'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Process banners data
    const totalBanners = bannersStats.data?.length || 0
    const activeBanners = bannersStats.data?.filter(banner => banner.is_visible).length || 0
    const visibilityRate = totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        byRole: roleBreakdown
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        views: totalViews,
        newThisMonth: newPostsThisMonth
      },
      products: {
        total: totalProducts,
        withAffiliateLink: productsWithAffiliateLink,
        averagePrice: Math.round(averagePrice * 100) / 100
      },
      brokers: {
        total: totalBrokers,
        visible: visibleBrokers,
        byCategory: brokersByCategory
      },
      banners: {
        total: totalBanners,
        active: activeBanners,
        visibilityRate: Math.round(visibilityRate * 100) / 100
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export const useDashboardStats = () => {
  const { can } = usePermissions()

  const {
    data: stats,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    enabled: can('users', 'read'), // Basic permission check
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2
  })

  // Default stats for loading/error states
  const defaultStats: DashboardStats = {
    users: { total: 0, active: 0, newThisMonth: 0, byRole: { user: 0, moderator: 0, admin: 0 } },
    posts: { total: 0, published: 0, draft: 0, views: 0, newThisMonth: 0 },
    products: { total: 0, withAffiliateLink: 0, averagePrice: 0 },
    brokers: { total: 0, visible: 0, byCategory: {} },
    banners: { total: 0, active: 0, visibilityRate: 0 }
  }

  return {
    stats: stats || defaultStats,
    loading,
    error: error as Error | null,
    refetch,
    hasPermission: can('users', 'read')
  }
}