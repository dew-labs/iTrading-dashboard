import React from 'react'
import { X, Save } from 'lucide-react'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField, Button } from '../../atoms'
import { FormErrorBanner } from '../../molecules'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import type { BrokerCategory, BrokerCategoryInsert } from '../../../types'

// Validation schema
const validationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  }
}

interface BrokerCategoryFormProps {
  category?: BrokerCategory | null
  onSubmit: (data: BrokerCategoryInsert) => Promise<void>
  onCancel: () => void
}

const BrokerCategoryForm: React.FC<BrokerCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel
}) => {
  const { t: tPages } = useTranslation('pages')
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation('common')
  const prevCategoryId = React.useRef<string | null>(null)

  const {
    data,
    errors,
    isValidating,
    updateField,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: validationSchema,
    initialData: {
      name: category?.name || ''
    }
  })

  // Reset form when category changes
  React.useEffect(() => {
    const currentCategoryId = category?.id || null

    // Only reset if the category actually changed
    if (prevCategoryId.current !== currentCategoryId) {
      reset({
        name: category?.name || ''
      })
      prevCategoryId.current = currentCategoryId
    }
  }, [category?.id, category?.name, reset])

  const handleFormSubmit = async (formData: typeof data) => {
    const submitData: BrokerCategoryInsert = {
      name: formData.name.trim()
    }
    await onSubmit(submitData)
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormErrorBanner errors={errors} />

        <div className="space-y-4">
          <FormField
            label={tForm('labels.name')}
            required
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            {...(errors.name && { error: errors.name })}
            placeholder={tPages('brokerCategories.form.namePlaceholder')}
            disabled={isValidating}
            maxLength={100}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isValidating}
          >
            <X className="w-4 h-4 mr-2" />
            {tForm('actions.cancel')}
          </Button>

          <Button
            type="submit"
            disabled={isValidating}
          >
            <Save className="w-4 h-4 mr-2" />
            {isValidating
              ? tCommon('feedback.saving')
              : category
                ? tCommon('actions.update')
                : tCommon('actions.create')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BrokerCategoryForm
