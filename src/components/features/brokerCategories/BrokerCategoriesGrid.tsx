import React from 'react'
import { Plus, Building2 } from 'lucide-react'
import BrokerCategoryCard from './BrokerCategoryCard'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, cn } from '../../../utils/theme'
import type { BrokerCategory, BrokerCategoryInsert } from '../../../types'

interface BrokerCategoriesGridProps {
  brokerCategories: BrokerCategory[]
  onEdit: (category: BrokerCategory, data: BrokerCategoryInsert) => Promise<void>
  onDelete: (category: BrokerCategory) => void
  onCreate: () => void
}

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => {
  const { t } = usePageTranslation()

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Building2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className={cn(getTypographyClasses('h3'), 'mb-2', 'text-gray-900 dark:text-white')}>
        {t('brokerCategories.empty.title')}
      </h3>
      <p className={cn(getTypographyClasses('base'), 'text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto')}>
        {t('brokerCategories.empty.description')}
      </p>
      <button
        onClick={onCreate}
        className={cn(
          'inline-flex items-center px-6 py-3 rounded-lg transition-colors',
          'bg-blue-600 hover:bg-blue-700 text-white',
          'dark:bg-blue-500 dark:hover:bg-blue-600',
          'font-medium text-sm'
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('brokerCategories.actions.create')}
      </button>
    </div>
  )
}

const BrokerCategoriesGrid: React.FC<BrokerCategoriesGridProps> = ({
  brokerCategories,
  onEdit,
  onDelete,
  onCreate
}) => {
  // Show empty state if no categories
  if (brokerCategories.length === 0) {
    return <EmptyState onCreate={onCreate} />
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brokerCategories.map((category) => (
          <BrokerCategoryCard
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default BrokerCategoriesGrid