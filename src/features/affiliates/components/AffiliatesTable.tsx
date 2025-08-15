import React from 'react'
import { Eye, FileText, HandCoins, Key } from 'lucide-react'
import Table from '../../../components/molecules/Table'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { Badge } from '../../../components/atoms'
import type { AffiliateWithMetrics } from '../../../types'
import RecordImage from '../../../components/features/images/RecordImage'

interface AffiliatesTableProps {
  affiliates: AffiliateWithMetrics[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onViewDetails: (affiliate: AffiliateWithMetrics) => void
  sortColumn: keyof AffiliateWithMetrics | null
  sortDirection: 'asc' | 'desc'
  onSort: (column: keyof AffiliateWithMetrics) => void
}

const AffiliatesTable: React.FC<AffiliatesTableProps> = ({
  affiliates,
  imagesByRecord = {},
  onViewDetails,
  sortColumn,
  sortDirection,
  onSort
}) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="active" size="sm" showIcon>{tCommon('status.active')}</Badge>
      case 'inactive':
        return <Badge variant="inactive" size="sm" showIcon>{tCommon('status.inactive')}</Badge>
      case 'suspended':
        return <Badge variant="suspended" size="sm" showIcon>{tCommon('status.suspended')}</Badge>
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>
    }
  }



  const columns = [
    {
      header: t('affiliates.table.affiliateDetails'),
      accessor: 'email' as keyof AffiliateWithMetrics,
      sortable: true,
      render: (value: unknown, row: AffiliateWithMetrics) => {
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {imagesByRecord?.[row.id]?.[0] ? (
                <RecordImage image={imagesByRecord[row.id]?.[0] || null} className='w-12 h-12 rounded-lg object-cover border border-gray-200' />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
                  <HandCoins className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{row.full_name || tCommon('roles.affiliate')}</div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 truncate')}>
                {value as string}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('affiliates.table.referralCodes'),
      accessor: 'referral_codes' as keyof AffiliateWithMetrics,
      render: (value: unknown, row: AffiliateWithMetrics) => {
        const activeCodes = row.referral_codes.filter(code => code.is_active)

        return (
          <div className='flex items-center'>
            <Badge
              variant='secondary'
              size='sm'
              className='inline-flex items-center bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50'
            >
              <Key className='w-3 h-3 mr-1' />
              {activeCodes.length} {activeCodes.length === 1 ? t('affiliates.table.code') : t('affiliates.table.codes')}
            </Badge>
          </div>
        )
      }
    },
    {
      header: t('affiliates.table.status'),
      accessor: 'status' as keyof AffiliateWithMetrics,
      render: (value: unknown, row: AffiliateWithMetrics) => {
        return getStatusBadge(row.status)
      }
    },
    // {
    //   header: t('affiliates.table.performance'),
    //   accessor: 'metrics' as keyof AffiliateWithMetrics,
    //   render: (value: unknown, row: AffiliateWithMetrics) => {
    //     const { metrics } = row
    //     return (
    //       <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
    //         <div className='flex items-center'>
    //           <TrendingUp className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
    //           <span>{metrics.total_referrals} {metrics.total_referrals === 1 ? t('affiliates.table.referral') : t('affiliates.table.referrals')}</span>
    //         </div>
    //       </div>
    //     )
    //   }
    // },
    {
      header: t('affiliates.table.joinedDate'),
      accessor: 'created_at' as keyof AffiliateWithMetrics,
      sortable: true,
      render: (value: unknown) => (
        <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
          <div className='flex items-center'>
            <FileText className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
            <span>{formatDateDisplay(value as string)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('affiliates.table.actions'),
      accessor: 'id' as keyof AffiliateWithMetrics,
      render: (value: unknown, row: AffiliateWithMetrics) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => onViewDetails(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={t('affiliates.table.viewDetails')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table
      data={affiliates as unknown as Record<string, unknown>[]}
      columns={columns as unknown as Array<{ header: string; accessor: string; render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode; sortable?: boolean }>}
      sortColumn={sortColumn as string}
      sortDirection={sortDirection}
      onSort={onSort as (column: string) => void}
      onRowClick={onViewDetails as unknown as (row: Record<string, unknown>) => void}
    />
  )
}

export default React.memo(AffiliatesTable)
