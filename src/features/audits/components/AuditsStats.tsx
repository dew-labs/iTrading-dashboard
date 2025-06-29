import React from 'react'
import { Activity, Users, Shield, Clock } from 'lucide-react'
import { StatsCard } from '../../../components/molecules'
import { usePageTranslation } from '../../../hooks/useTranslation'
import type { AuditLog } from '../../../types'

interface AuditsStatsProps {
  auditLogs: AuditLog[]
}

const AuditsStats: React.FC<AuditsStatsProps> = ({ auditLogs }) => {
  const { t } = usePageTranslation()

  // Calculate stats
  const totalActivities = auditLogs.length
  const uniqueUsers = new Set(auditLogs.map(log => log.user_id)).size
  const recentActivities = auditLogs.filter(log => {
    if (!log.created_at) return false
    const logDate = new Date(log.created_at)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return logDate >= yesterday
  }).length
  const criticalActions = auditLogs.filter(log => log.action === 'DELETE').length

  const stats = [
    {
      title: t('audits.stats.totalActivities'),
      value: totalActivities.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: t('audits.stats.activeUsers'),
      value: uniqueUsers.toLocaleString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: t('audits.stats.recentActivities'),
      value: recentActivities.toLocaleString(),
      change: '-8%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    },
    {
      title: t('audits.stats.criticalActions'),
      value: criticalActions.toLocaleString(),
      change: '-15%',
      changeType: 'negative' as const,
      icon: Shield,
      color: 'bg-gradient-to-br from-red-500 to-red-600'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}

export default AuditsStats
