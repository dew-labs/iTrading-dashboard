import React from 'react'
import { Edit2, Trash2, Eye, Building2, Calendar, FileText, EyeOff, Languages, TrendingUp, Bitcoin, Coins } from 'lucide-react'
import Table from '../../../components/molecules/Table'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { TranslationStatusIndicator, Badge } from '../../../components/atoms'
import type { Broker } from '../../../types'
import type { BrokerWithTranslations, BrokerTranslation } from '../../../types/translations'
import RecordImage from '../../../components/features/images/RecordImage'

interface BrokersTableProps {
  brokers: (Broker | BrokerWithTranslations)[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  categoriesByRecord?: Record<string, { id: string; name: string }>
  onView: (broker: Broker | BrokerWithTranslations) => void
  onEdit: (broker: Broker | BrokerWithTranslations) => void
  onDelete: (broker: Broker | BrokerWithTranslations) => void
  onToggleVisible?: (broker: Broker | BrokerWithTranslations) => Promise<void>
  sortColumn: keyof Broker | null
  sortDirection: 'asc' | 'desc'
  onSort: (column: keyof Broker) => void
  showTranslationStatus?: boolean
}

const BrokersTable: React.FC<BrokersTableProps> = ({
  brokers,
  imagesByRecord = {},
  categoriesByRecord = {},
  onView,
  onEdit,
  onDelete,
  onToggleVisible,
  sortColumn,
  sortDirection,
  onSort,
  showTranslationStatus = false
}) => {
  const { t } = usePageTranslation()

  const handleToggleVisible = async (broker: Broker | BrokerWithTranslations) => {
    if (typeof onToggleVisible === 'function') {
      await onToggleVisible(broker)
    }
  }

  // Helper function to get category icon and styling
  const getCategoryDisplay = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('fx') || name.includes('cfd') || name.includes('forex')) {
      return {
        icon: TrendingUp,
        variant: 'success' as const,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/50'
      }
    } else if (name.includes('crypto') || name.includes('bitcoin') || name.includes('digital')) {
      return {
        icon: Bitcoin,
        variant: 'warning' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/50'
      }
    } else if (name.includes('commodity') || name.includes('metal') || name.includes('gold')) {
      return {
        icon: Coins,
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700/50'
      }
    } else {
      return {
        icon: Building2,
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600'
      }
    }
  }

  // Helper function to get display content (only description uses translations)
  const getDisplayContent = (broker: Broker | BrokerWithTranslations) => {
    let description = null
    if ('translations' in broker && broker.translations && broker.translations.length > 0) {
      // Get the first available translation (preferably English)
      const translation = broker.translations.find((t: BrokerTranslation) => t.language_code === 'en') || broker.translations[0]
      if (translation) {
        description = translation.description
      }
    }
    return {
      name: broker.name,
      headquarter: broker.headquarter,
      description: description
    }
  }



  const columns = [
    {
      header: t('brokers.brokerInformation'),
      accessor: 'name' as keyof Broker,
      sortable: true,
      render: (value: unknown, row: Broker | BrokerWithTranslations) => {
        const displayContent = getDisplayContent(row)
        
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {imagesByRecord?.[row.id]?.[0] ? (
                <RecordImage image={imagesByRecord[row.id]?.[0] || null} className='w-12 h-12 rounded-lg object-cover border border-gray-200' />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center'>
                  <Building2 className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{displayContent.name}</div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 truncate')}>
                {displayContent.headquarter || t('brokers.noHeadquarterInfo')}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('brokers.category'),
      accessor: 'category_id' as keyof Broker,
      render: (value: unknown, row: Broker | BrokerWithTranslations) => {
        const category = row.category_id ? categoriesByRecord[row.category_id] : null
        
        if (!category) {
          return (
            <div className='flex items-center'>
              <Badge variant='secondary' size='sm' className='bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600'>
                {t('brokers.notSpecified')}
              </Badge>
            </div>
          )
        }

        const { icon: Icon, className } = getCategoryDisplay(category.name)
        
        return (
          <div className='flex items-center'>
            <Badge 
              variant='secondary' 
              size='sm' 
              className={cn('inline-flex items-center', className)}
            >
              <Icon className='w-3 h-3 mr-1' />
              {category.name}
            </Badge>
          </div>
        )
      }
    },
        ...(showTranslationStatus ? [{
      header: t('brokers.translations'),
      accessor: 'updated_at' as keyof Broker,
      render: (value: unknown, row: Broker | BrokerWithTranslations) => {
        const translationCount = 'translations' in row ? row.translations?.length || 0 : 0
        const hasTranslations = 'translations' in row && row.translations && row.translations.length > 0
        const hasEnglish = hasTranslations ? row.translations!.some((t: BrokerTranslation) => t.language_code === 'en') : false
        const hasPortuguese = hasTranslations ? row.translations!.some((t: BrokerTranslation) => t.language_code === 'pt') : false

        return (
          <div className='flex items-center space-x-2'>
            <Languages className='w-4 h-4 text-gray-400' />
            <TranslationStatusIndicator
              hasEnglish={hasEnglish}
              hasPortuguese={hasPortuguese}
              hasAnyTranslation={hasTranslations}
              totalTranslations={translationCount}
              completedTranslations={translationCount}
              size='sm'
              variant='badges'
            />
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              {translationCount === 0 ? t('brokers.noTranslations') :
               translationCount === 1 ? t('brokers.oneTranslation') :
               t('brokers.multipleTranslations', { count: translationCount })}
            </span>
          </div>
        )
      }
    }] : []),
    {
      header: t('brokers.established'),
      accessor: 'established_in' as keyof Broker,
      sortable: true,
      render: (value: unknown) => (
        <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
          {value ? (
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
              <span>{value as number}</span>
            </div>
          ) : (
            <span className='text-gray-400 dark:text-gray-500'>{t('brokers.notSpecified')}</span>
          )}
        </div>
      )
    },
    {
      header: t('brokers.createdDate'),
      accessor: 'created_at' as keyof Broker,
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
      header: t('brokers.actions'),
      accessor: 'id' as keyof Broker,
      render: (value: unknown, row: Broker | BrokerWithTranslations) => (
        <div className='flex space-x-1'>
          <button
            onClick={e => { e.stopPropagation(); handleToggleVisible(row) }}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={row.is_visible ? t('banners.tooltips.deactivateBanner') : t('banners.tooltips.activateBanner')}
          >
            {row.is_visible ? (
              <Eye className={getIconClasses('action')} />
            ) : (
              <EyeOff className={getIconClasses('action')} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('brokers.tooltips.editBroker')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('brokers.tooltips.deleteBroker')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table<Broker>
      data={brokers as Broker[]}
      columns={columns}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onView}
    />
  )
}

export default React.memo(BrokersTable)
