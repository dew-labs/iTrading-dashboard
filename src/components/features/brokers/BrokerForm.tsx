import React, { useMemo, useCallback, useState } from 'react'
import { X, Save, Plus, Building2, Calendar, MapPin, Languages, CheckCircle, CreditCard, Trash2, TrendingUp, Bitcoin, Coins } from 'lucide-react'
import type { Broker, BrokerInsert, Image } from '../../../types'
import type { Tables } from '../../../types/database'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField, Button } from '../../atoms'
import { Select } from '../../molecules'
import { MainImageUpload } from '../images'
import { ConfirmDialog } from '../../common'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { useToast } from '../../../hooks/useToast'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'
import TranslationManager from '../translations/TranslationManager'
import { CONTENT_LANGUAGE_CODES } from '../../../constants/languages'
import type { LanguageCode } from '../../../types/translations'
import { VALIDATION } from '../../../constants/ui'
import { useQuery } from '@tanstack/react-query'

// Broker category type
type BrokerCategory = Tables<'broker_categories'>

// Move schema outside component to prevent re-renders
// Only description is handled in translations now
const BROKER_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: VALIDATION.REQUIRED_FIELD_MIN_LENGTH,
    maxLength: VALIDATION.REQUIRED_FIELD_MAX_LENGTH
  },
  headquarter: {
    maxLength: VALIDATION.HEADQUARTER_MAX_LENGTH
  },
  established_in: {
    min: VALIDATION.YEAR_MIN,
    max: VALIDATION.YEAR_MAX,
    custom: (value: number | null) => !value || (value >= VALIDATION.YEAR_MIN && value <= VALIDATION.YEAR_MAX)
  },
  category_id: {
    required: true
  }
} as const

// Account type interface - extended to track if it's in database
interface AccountType {
  id?: string // UUID for React keys
  database_id?: string // Actual database ID for existing records
  account_type: string
  spreads: string | null
  commission: string | null
  min_deposit: string | null
}

interface BrokerFormProps {
  broker?: Broker | null
  onSubmit: (
    data: BrokerInsert,
    logoImage?: (Partial<Image> & { file?: File }) | null,
    accountTypes?: AccountType[]
  ) => void
  onCancel: () => void
  images?: Image[] | null
}

const BrokerForm: React.FC<BrokerFormProps> = ({ broker, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()
  const toast = useToast()
  const [_currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en')

  const [logoImage, setLogoImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])

  // Delete confirmation state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean
    accountTypeId: string | null
    accountTypeName: string | null
    databaseId: string | null
  }>({
    isOpen: false,
    accountTypeId: null,
    accountTypeName: null,
    databaseId: null
  })
  const [isDeletingAccountType, setIsDeletingAccountType] = useState(false)

  // Helper function to get category icon based on category name
  const getCategoryIcon = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase()

    if (name.includes('fx') || name.includes('cfd') || name.includes('forex')) {
      return TrendingUp
    } else if (name.includes('crypto') || name.includes('bitcoin') || name.includes('digital')) {
      return Bitcoin
    } else if (name.includes('commodity') || name.includes('metal') || name.includes('gold')) {
      return Coins
    } else {
      return Building2
    }
  }, [])

  // Load broker categories from database
  const { data: brokerCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['broker_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broker_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as BrokerCategory[]
    }
  })

  // Memoize initial data to prevent re-renders (description is handled in translations)
  const initialData = useMemo(() => ({
    name: '',
    headquarter: '',
    established_in: null as number | null,
    category_id: null as string | null,
    is_visible: true
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleChange,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: BROKER_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (broker) {
      reset({
        name: broker.name,
        headquarter: broker.headquarter || '',
        established_in: broker.established_in || null,
        category_id: broker.category_id || null,
        is_visible: broker.is_visible !== false
      })
      const existingLogo = images?.find(
        img => img.record_id === broker.id && img.type === 'logo'
      )
      if (existingLogo) {
        const { data: urlData } = supabase.storage
          .from('brokers')
          .getPublicUrl(existingLogo.path)
        setLogoImage({ ...existingLogo, publicUrl: urlData.publicUrl })
      } else {
        setLogoImage(null)
      }

      // Load existing account types for this broker
      const loadAccountTypes = async () => {
        const { data } = await supabase
          .from('broker_account_types')
          .select('*')
          .eq('broker_id', broker.id)
        if (data) {
          // Add stable IDs to existing account types for React keys and track database IDs
          setAccountTypes(data.map(at => ({
            ...at,
            id: crypto.randomUUID(), // React key
            database_id: at.id // Database ID for deletion
          })))
        }
      }
      loadAccountTypes()
    } else {
      reset(initialData)
      setLogoImage(null)
      setAccountTypes([])
    }
  }, [broker, reset, images, initialData])

  const handleLogoUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId, blurhash } = uploadResult
        setLogoImage({
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'brokers',
          record_id: broker?.id || '',
          type: 'logo',
          alt_text: `${broker?.name || 'Broker'} logo`,
          file_size: file.size,
          mime_type: file.type,
          blurhash: blurhash || null,
          file
        })
      } else {
        setLogoImage(null)
      }
    },
    [broker?.id, broker?.name]
  )

  const handleEstablishedYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateField('established_in', value ? parseInt(value) : null)
  }, [updateField])

  // Account types handlers
  const addAccountType = useCallback(() => {
    setAccountTypes(prev => [...prev, {
      id: crypto.randomUUID(), // Add stable ID for React key
      account_type: '',
      spreads: null,
      commission: null,
      min_deposit: null
    }])
  }, [])

  const handleDeleteAccountType = useCallback((id: string, accountTypeName: string, databaseId?: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      accountTypeId: id,
      accountTypeName: accountTypeName,
      databaseId: databaseId || null
    })
  }, [])

  const handleConfirmDeleteAccountType = useCallback(async () => {
    if (!deleteConfirmDialog.accountTypeId) return

    const idToDelete = deleteConfirmDialog.accountTypeId
    const databaseId = deleteConfirmDialog.databaseId

    setIsDeletingAccountType(true)

    try {
      // If this account type exists in the database, delete it immediately
      if (databaseId) {
        const { error } = await supabase
          .from('broker_account_types')
          .delete()
          .eq('id', databaseId)

        if (error) {
          console.error('Failed to delete account type from database:', error)
          toast.error(null, null, 'Failed to delete account type')
          return
        }

        toast.success('deleted', 'accountType')
      }

      // Remove from local state
      setAccountTypes(prev => prev.filter(at => at.id !== idToDelete))

    } catch (error) {
      console.error('Error deleting account type:', error)
      toast.error(null, null, 'Failed to delete account type')
    } finally {
      setIsDeletingAccountType(false)
      setDeleteConfirmDialog({
        isOpen: false,
        accountTypeId: null,
        accountTypeName: null,
        databaseId: null
      })
    }
  }, [deleteConfirmDialog, toast])

  const handleCancelDeleteAccountType = useCallback(() => {
    setDeleteConfirmDialog({
      isOpen: false,
      accountTypeId: null,
      accountTypeName: null,
      databaseId: null
    })
  }, [])

  const updateAccountType = useCallback((index: number, field: keyof AccountType, value: string) => {
    setAccountTypes(prev => prev.map((accountType, i) =>
      i === index ? { ...accountType, [field]: value } : accountType
    ))
  }, [])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    // Description is now handled by the translation system
    const brokerData: BrokerInsert = {
      ...data
    }
    onSubmit(brokerData, logoImage, accountTypes)
  }, [onSubmit, logoImage, accountTypes])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Sidebar - Settings & Media */}
        <div className="xl:col-span-1 space-y-6">

          {/* Broker Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.brokerSettings')}</h3>
            </div>

            <div className="space-y-4">
              <FormField
                label={tForm('labels.name')}
                name='name'
                value={formData.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                placeholder={tForm('placeholders.enterBrokerName')}
                required
                disabled={isValidating}
                {...(errors.name && { error: errors.name })}
                icon={<Building2 className='w-5 h-5' />}
                helperText={tForm('helpers.brokerNameHelper')}
              />

              <FormField
                label={tForm('labels.headquarter')}
                name='headquarter'
                value={formData.headquarter || ''}
                onChange={handleChange('headquarter')}
                onBlur={handleBlur('headquarter')}
                placeholder={tForm('placeholders.enterHeadquarter')}
                disabled={isValidating}
                {...(errors.headquarter && { error: errors.headquarter })}
                icon={<MapPin className='w-5 h-5' />}
                helperText={tForm('helpers.brokerLocationHelper')}
              />

              <FormField
                label={tForm('labels.establishedYear')}
                type='number'
                name='established_in'
                value={formData.established_in?.toString() || ''}
                onChange={handleEstablishedYearChange}
                onBlur={handleBlur('established_in')}
                placeholder={tForm('placeholders.enterEstablishedYear')}
                disabled={isValidating}
                {...(errors.established_in && { error: errors.established_in })}
                icon={<Calendar className='w-5 h-5' />}
                helperText={tForm('helpers.brokerEstablishedHelper')}
              />

              <Select
                label={tForm('labels.category')}
                value={formData.category_id || ''}
                onChange={(value) => updateField('category_id', value)}
                options={brokerCategories.map(category => {
                  const IconComponent = getCategoryIcon(category.name)
                  return {
                    value: category.id,
                    label: category.name,
                    icon: <IconComponent className="w-4 h-4" />
                  }
                })}
                placeholder={categoriesLoading ? tCommon('feedback.loading') : tForm('placeholders.selectCategory')}
                required
                disabled={isValidating || categoriesLoading}
                {...(errors.category_id && { error: errors.category_id })}
                aria-label={tForm('labels.category')}
              />
            </div>
          </div>

          {/* Logo Upload Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.brokerLogo')}</h3>
            </div>

            <MainImageUpload
              label=""
              imageUrl={logoImage?.publicUrl || logoImage?.path || null}
              onChange={handleLogoUpload}
              bucket='brokers'
              folder='logos'
              size='lg'
              disabled={isValidating}
              recommendationText={tForm('hints.logoRecommendation')}
              alt={tCommon('accessibility.brokerLogo')}
            />
          </div>
        </div>

        {/* Right Main Content - Account Types & Translations */}
        <div className="xl:col-span-3 space-y-6">

          {/* Account Types Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.accountTypes')}</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addAccountType}
                  leftIcon={Plus}
                  disabled={isValidating}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {tCommon('actions.addAccountType')}
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {accountTypes.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {tCommon('content.noAccountTypes')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {tCommon('content.addAccountTypesDescription')}
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={addAccountType}
                    leftIcon={Plus}
                    disabled={isValidating}
                  >
                    {tCommon('actions.addFirstAccountType')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountTypes.map((accountType, index) => (
                    <div key={accountType.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {tCommon('content.accountType')} #{index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccountType(accountType.id!, accountType.account_type || 'Account Type', accountType.database_id)}
                          leftIcon={Trash2}
                          disabled={isValidating}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {tCommon('actions.delete')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          label={tForm('labels.accountTypeName')}
                          name={`account_type_${index}`}
                          value={accountType.account_type}
                          onChange={(e) => updateAccountType(index, 'account_type', e.target.value)}
                          placeholder={tForm('placeholders.enterAccountType')}
                          required
                          disabled={isValidating}
                        />

                        <FormField
                          label={tForm('labels.spreads')}
                          name={`spreads_${index}`}
                          value={accountType.spreads || ''}
                          onChange={(e) => updateAccountType(index, 'spreads', e.target.value)}
                          placeholder={tForm('placeholders.enterSpreads')}
                          disabled={isValidating}
                        />

                        <FormField
                          label={tForm('labels.commission')}
                          name={`commission_${index}`}
                          value={accountType.commission || ''}
                          onChange={(e) => updateAccountType(index, 'commission', e.target.value)}
                          placeholder={tForm('placeholders.enterCommission')}
                          disabled={isValidating}
                        />

                        <FormField
                          label={tForm('labels.minDeposit')}
                          name={`min_deposit_${index}`}
                          value={accountType.min_deposit || ''}
                          onChange={(e) => updateAccountType(index, 'min_deposit', e.target.value)}
                          placeholder={tForm('placeholders.enterMinDeposit')}
                          disabled={isValidating}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content & Translations Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.contentAndTranslations')}</h3>
                </div>
                {broker && (
                  <div id="translation-status-container" className="flex items-center">
                    {/* Translation status will be rendered here by TranslationManager */}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {broker ? (
                <TranslationManager
                  contentType="brokers"
                  contentId={broker.id}
                  defaultLanguage="en"
                  requiredLanguages={CONTENT_LANGUAGE_CODES}
                  onLanguageChange={setCurrentLanguage}
                  className="border-0 p-0 bg-transparent"
                />
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="relative">
                    {/* Visual indicator */}
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                      <Languages className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Main heading */}
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {tCommon('content.contentTranslationManagement')}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                      {tCommon('content.contentEditorDescription', { type: 'broker' })}
                    </p>

                    {/* Features preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.brokerDetailsEditor')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.descriptionAndDetails')}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.multiLanguageSupport')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.englishAndPortuguese')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{tCommon('content.completeSettingsToEnableEditing', { type: 'broker' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          leftIcon={X}
          disabled={isValidating}
          className="px-6"
        >
          {tCommon('actions.cancel')}
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isValidating}
          {...(!isValidating && { leftIcon: broker ? Save : Plus })}
          className="px-8"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              {broker ? tCommon('feedback.updating') : tCommon('feedback.creating')}
            </>
          ) : (
            <>
              {broker ? `${tCommon('actions.update')} ${tCommon('entities.brokers')}` : `${tCommon('actions.add')} ${tCommon('entities.brokers')}`}
            </>
          )}
        </Button>
      </div>

      {/* Delete Account Type Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onClose={handleCancelDeleteAccountType}
        onConfirm={handleConfirmDeleteAccountType}
        title={tCommon('actions.deleteAccountType')}
        message={
          <div className="space-y-2">
            <p>
              {tCommon('content.confirmDeleteAccountType')}{' '}
              <strong className="font-semibold text-gray-900 dark:text-gray-100">
                {deleteConfirmDialog.accountTypeName || tCommon('content.thisAccountType')}
              </strong>
              ?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tCommon('content.actionCannotBeUndone')}
            </p>
          </div>
        }
        confirmLabel={tCommon('actions.delete')}
        cancelLabel={tCommon('actions.cancel')}
        isDestructive={true}
        isLoading={isDeletingAccountType}
        variant="danger"
      />
    </form>
  )
}

export default BrokerForm
