import React, { useState } from 'react'
import { Edit2, Trash2, Building2, Check, X } from 'lucide-react'
import { FormField } from '../../atoms'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import type { BrokerCategory, BrokerCategoryInsert } from '../../../types'

interface BrokerCategoryCardProps {
  category: BrokerCategory
  onEdit: (category: BrokerCategory, data: BrokerCategoryInsert) => Promise<void>
  onDelete: (category: BrokerCategory) => void
  isEditing?: boolean
}

const BrokerCategoryCard: React.FC<BrokerCategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  isEditing = false
}) => {
  const { t } = usePageTranslation()
  const [editMode, setEditMode] = useState(isEditing)
  const [editValue, setEditValue] = useState(category.name)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEditStart = () => {
    setEditMode(true)
    setEditValue(category.name)
    setError(null)
  }

  const handleEditCancel = () => {
    setEditMode(false)
    setEditValue(category.name)
    setError(null)
  }

  const handleEditSave = async () => {
    if (!editValue.trim()) {
      setError('Category name is required')
      return
    }

    if (editValue.trim() === category.name) {
      setEditMode(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onEdit(category, { name: editValue.trim() })
      setEditMode(false)
    } catch (err) {
      setError('Failed to update category')
      console.error('Failed to update category:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleEditCancel()
    }
  }

  return (
    <div className={cn(
      'group relative bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200',
      'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
      'hover:shadow-md hover:-translate-y-0.5',
      'p-6'
    )}>
      {/* Category Icon and Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
            'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40',
            'transition-colors duration-200'
          )}>
            <Building2 className={cn(
              getIconClasses('action'),
              'text-blue-600 dark:text-blue-400'
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-3">
            {editMode ? (
              <div className="space-y-2">
                <FormField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('brokerCategories.form.namePlaceholder')}
                  disabled={isLoading}
                  autoFocus
                  className="text-sm"
                  maxLength={100}
                  {...(error && { error })}
                />
                {error && (
                  <p className={cn(getTypographyClasses('caption'), 'text-red-600 dark:text-red-400')}>
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2">
                <h3 className={cn(
                  getTypographyClasses('base'),
                  'font-semibold text-gray-900 dark:text-white',
                  'truncate group-hover:text-blue-600 dark:group-hover:text-blue-400',
                  'transition-colors duration-200'
                )}>
                  {category.name}
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          'flex items-center space-x-1 flex-shrink-0',
          editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200'
        )}>
          {editMode ? (
            <>
              <button
                onClick={handleEditSave}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-500 hover:text-green-600 hover:bg-green-50',
                  'dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title={t('brokerCategories.actions.save')}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className={getIconClasses('action')} />
                )}
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                  'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title={t('brokerCategories.actions.cancel')}
              >
                <X className={getIconClasses('action')} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditStart}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50',
                  'dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20'
                )}
                title={t('brokerCategories.actions.edit')}
              >
                <Edit2 className={getIconClasses('action')} />
              </button>
              <button
                onClick={() => onDelete(category)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-gray-500 hover:text-red-600 hover:bg-red-50',
                  'dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                )}
                title={t('brokerCategories.actions.delete')}
              >
                <Trash2 className={getIconClasses('action')} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrokerCategoryCard