import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { usePageTranslation } from '../hooks/useTranslation'
import { useBrokerCategories } from '../hooks/useBrokerCategories'
import { BrokerCategoriesGrid, BrokerCategoryForm } from '../components/features/brokerCategories'
import { Modal, Button } from '../components/atoms'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import type { BrokerCategory, BrokerCategoryInsert } from '../types'
import { getPageLayoutClasses, getTypographyClasses } from '../utils/theme'

const BrokerCategories: React.FC = () => {
  const {
    brokerCategories,
    loading,
    createBrokerCategory,
    updateBrokerCategory,
    deleteBrokerCategory,
    isDeleting
  } = useBrokerCategories()
  const { t } = usePageTranslation()

  // Component state
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BrokerCategory | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    category: BrokerCategory | null
    isDeleting: boolean
  }>({
    isOpen: false,
    category: null,
    isDeleting: false
  })

  const layout = getPageLayoutClasses()

  // Handlers
  const handleCreate = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const _handleEdit = (category: BrokerCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleInlineEdit = async (category: BrokerCategory, data: BrokerCategoryInsert) => {
    try {
      await updateBrokerCategory({ id: category.id, updates: data })
    } catch (error) {
      console.error('Failed to update broker category:', error)
      throw error
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (data: BrokerCategoryInsert) => {
    try {
      if (editingCategory) {
        await updateBrokerCategory({ id: editingCategory.id, updates: data })
      } else {
        await createBrokerCategory(data)
      }
      handleCloseForm()
    } catch (error) {
      console.error('Failed to save broker category:', error)
    }
  }

  const handleDeleteClick = (category: BrokerCategory) => {
    setDeleteConfirm({
      isOpen: true,
      category,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.category) return

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))

    try {
      await deleteBrokerCategory(deleteConfirm.category.id)
      setDeleteConfirm({ isOpen: false, category: null, isDeleting: false })
    } catch (error) {
      console.error('Failed to delete broker category:', error)
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('brokerCategories.loadingCategories')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('brokerCategories.title')}</h1>
            <p className={getTypographyClasses('muted')}>
              {t('brokerCategories.description')}
            </p>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('brokerCategories.actions.create')}
          </Button>
        </div>

        {/* Grid */}
        <BrokerCategoriesGrid
          brokerCategories={brokerCategories}
          onEdit={handleInlineEdit}
          onDelete={handleDeleteClick}
          onCreate={handleCreate}
        />

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleCloseForm} size="sm" title={editingCategory ? t('brokerCategories.form.editTitle') : t('brokerCategories.form.createTitle')}>
          <BrokerCategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
          />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, category: null, isDeleting: false })}
          onConfirm={handleDeleteConfirm}
          title={t('brokerCategories.deleteDialog.title')}
          message={
            <>
              {t('brokerCategories.deleteDialog.message')}{' '}
              <strong>{deleteConfirm.category?.name}</strong>?
            </>
          }
          confirmLabel={t('brokerCategories.deleteDialog.confirm')}
          isDestructive
          isLoading={deleteConfirm.isDeleting || isDeleting}
        />
      </div>
    </div>
  )
}

export default BrokerCategories