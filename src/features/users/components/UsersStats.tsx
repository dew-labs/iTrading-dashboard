import React from 'react'
import { Users as UsersIcon, UserCheck, Shield, UserX } from 'lucide-react'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'
import { USER_ROLES, USER_STATUSES } from '../../../constants/general'
import type { DatabaseUser } from '../../../types'

interface UsersStatsProps {
  users: DatabaseUser[]
}

interface StatsData {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  invitedUsers: number
}

const UsersStats: React.FC<UsersStatsProps> = ({ users }) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()
  const layout = getPageLayoutClasses()

  // Calculate stats
  const stats: StatsData = React.useMemo(() => {
    const activeUsers = users.filter(u => u.status === USER_STATUSES.ACTIVE).length
    const invitedUsers = users.filter(u => u.status === USER_STATUSES.INVITED).length
    const adminUsers = users.filter(
      u => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN
    ).length

    return {
      totalUsers: users.length,
      activeUsers,
      adminUsers,
      invitedUsers
    }
  }, [users])

  // Theme props for each stat card
  const totalUsersProps = getStatsCardProps('users')
  const activeUsersProps = getStatsCardProps('users')
  const adminUsersProps = getStatsCardProps('users')
  const invitedUsersProps = getStatsCardProps('users')

  return (
    <div className={layout.grid}>
      {/* Total Users */}
      <div className={totalUsersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <UsersIcon className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalUsersProps.valueClasses}>{stats.totalUsers}</div>
            <div className={totalUsersProps.labelClasses}>{tCommon('entities.users')}</div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className={activeUsersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'posts')}>
            <UserCheck className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={activeUsersProps.valueClasses}>{stats.activeUsers}</div>
            <div className={activeUsersProps.labelClasses}>
              {tCommon('status.active')} {tCommon('entities.users')}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className={adminUsersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Shield className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={adminUsersProps.valueClasses}>{stats.adminUsers}</div>
            <div className={adminUsersProps.labelClasses}>{t('users.adminUsers')}</div>
          </div>
        </div>
      </div>

      {/* Invited Users */}
      <div className={invitedUsersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'banners')}>
            <UserX className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={invitedUsersProps.valueClasses}>{stats.invitedUsers}</div>
            <div className={invitedUsersProps.labelClasses}>{t('users.pendingInvites')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersStats
