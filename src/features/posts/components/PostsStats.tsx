import React from 'react'
import { FileText, Bookmark, Edit2, TrendingUp } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'
import { POST_STATUSES } from '../../../constants/general'
import type { PostWithAuthor } from '../../../hooks/usePosts'

interface PostsStatsProps {
  posts: PostWithAuthor[]
}

interface StatsData {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
}

const PostsStats: React.FC<PostsStatsProps> = ({ posts }) => {
  const { t } = usePageTranslation()
  const layout = getPageLayoutClasses()

  // Calculate stats
  const stats: StatsData = React.useMemo(() => {
    const publishedPosts = posts.filter(p => p.status === POST_STATUSES.PUBLISHED).length
    const draftPosts = posts.filter(p => p.status === POST_STATUSES.DRAFT).length
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)

    return {
      totalPosts: posts.length,
      publishedPosts,
      draftPosts,
      totalViews
    }
  }, [posts])

  // Theme props for each stat card
  const totalPostsProps = getStatsCardProps('posts')
  const publishedProps = getStatsCardProps('posts')
  const draftsProps = getStatsCardProps('posts')
  const viewsProps = getStatsCardProps('posts')

  return (
    <div className={layout.grid}>
      {/* Total Posts */}
      <div className={totalPostsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'posts')}>
            <FileText className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalPostsProps.valueClasses}>{stats.totalPosts}</div>
            <div className={totalPostsProps.labelClasses}>{t('posts.totalPosts')}</div>
          </div>
        </div>
      </div>

      {/* Published Posts */}
      <div className={publishedProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'posts')}>
            <Bookmark className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={publishedProps.valueClasses}>{stats.publishedPosts}</div>
            <div className={publishedProps.labelClasses}>{t('posts.published')}</div>
          </div>
        </div>
      </div>

      {/* Draft Posts */}
      <div className={draftsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'banners')}>
            <Edit2 className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={draftsProps.valueClasses}>{stats.draftPosts}</div>
            <div className={draftsProps.labelClasses}>{t('posts.drafts')}</div>
          </div>
        </div>
      </div>

      {/* Total Views */}
      <div className={viewsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <TrendingUp className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={viewsProps.valueClasses}>{stats.totalViews.toLocaleString()}</div>
            <div className={viewsProps.labelClasses}>{t('posts.totalViews')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostsStats
