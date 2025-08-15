// 🎯 Affiliate Details Modal Component
// Displays detailed information about an affiliate including referrals and metrics

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  User,
  Mail,
  Link,


  Copy,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Users,
  Key
} from 'lucide-react'
import { Badge, Button } from '../../../components/atoms'
import { Table } from '../../../components/molecules'
import RecordImage from '../../../components/features/images/RecordImage'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { useAffiliateReferrals, useAffiliateReferralCodes, useCreateReferralCode, useUpdateReferralCodeStatus, useDeleteReferralCode } from '../api/hooks'
import { getTypographyClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import { toast } from '../../../utils/toast'
import type { AffiliateWithMetrics, UserReferralWithUser, Image } from '../../../types'

interface AffiliateDetailsModalProps {
  affiliate: AffiliateWithMetrics | null
  isOpen: boolean
  onClose: () => void
  imagesByRecord?: Record<string, Image[]>
}

const AffiliateDetailsModal: React.FC<AffiliateDetailsModalProps> = ({
  affiliate,
  isOpen,
  onClose,
  imagesByRecord = {}
}) => {
  const { t } = usePageTranslation() // Page-specific translations
  const { t: tCommon } = useTranslation() // Common translations

  // API hooks
  const { data: referrals, isLoading: referralsLoading } = useAffiliateReferrals(affiliate?.id || '')
  const { data: referralCodes, isLoading: codesLoading } = useAffiliateReferralCodes(affiliate?.id || '')
  const createCodeMutation = useCreateReferralCode()

  const updateCodeStatusMutation = useUpdateReferralCodeStatus()
  const deleteCodeMutation = useDeleteReferralCode()

  // Modal animation states
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  if (!affiliate || !isVisible) return null

  const affiliateImage = imagesByRecord[affiliate.id]?.find(img => img.type === 'avatar')

  // Use fresh data when available, fallback to prop data
  const activeCodes = referralCodes?.filter(code => code.is_active).length ?? affiliate.metrics.total_active_codes

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(t('affiliates.details.codeCopied'))
    } catch (_error) {
      toast.error(t('affiliates.details.copyFailed'))
    }
  }

  const handleCreateCode = async () => {
    try {
      await createCodeMutation.mutateAsync({ user_id: affiliate.id })
    } catch (_error) {
      // Error handling is done in the hook
    }
  }



  const handleToggleCodeStatus = async (codeId: string, isActive: boolean) => {
    try {
      await updateCodeStatusMutation.mutateAsync({ code_id: codeId, is_active: isActive })
    } catch (_error) {
      // Error handling is done in the hook
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    try {
      await deleteCodeMutation.mutateAsync({ code_id: codeId })
    } catch (_error) {
      // Error handling is done in the hook
    }
  }



  const referralColumns = [
    {
      header: t('affiliates.details.referrals.user'),
      accessor: 'referred_user' as keyof UserReferralWithUser,
      render: (value: UserReferralWithUser['referred_user'], _row: UserReferralWithUser) => (
        <div className='flex items-center space-x-3'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
              <User className='w-4 h-4 text-white' />
            </div>
          </div>
          <div>
            <div className={getTypographyClasses('h4')}>
              {value.full_name || t('affiliates.details.referrals.noName')}
            </div>
            <div className={cn(getTypographyClasses('small'), 'text-gray-500')}>
              {value.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('affiliates.details.referrals.code'),
      accessor: 'referral_code' as keyof UserReferralWithUser,
      render: (value: unknown) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {value as string}
        </span>
      )
    },

    {
      header: t('affiliates.details.referrals.date'),
      accessor: 'referred_at' as keyof UserReferralWithUser,
      render: (value: unknown) => formatDateDisplay(value as string)
    },

  ]

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4'
      aria-labelledby='affiliate-modal-title'
      role='dialog'
      aria-modal='true'
      onClick={handleBackdropClick}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden='true'
        onClick={handleBackdropClick}
      />

      <div
        className={`relative z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-200 ease-out ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section */}
        <div className='bg-gradient-to-r from-gray-900 to-black dark:from-gray-700 dark:to-gray-800 px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex-shrink-0'>
                <RecordImage
                  image={affiliateImage || null}
                  fallbackClassName='w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center'
                  className='w-16 h-16 rounded-xl object-cover border-2 border-white/20'
                  fallbackIcon={<User className='w-8 h-8 text-white' />}
                  alt={`${affiliate.full_name || tCommon('roles.affiliate')} ${tCommon('ui.profileImage')}`}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <h1 id='affiliate-modal-title' className={cn(
                  getTypographyClasses('h1'),
                  'text-2xl lg:text-3xl font-bold leading-tight text-white truncate'
                )}>
                  {affiliate.full_name || t('affiliates.details.noName')}
                </h1>
                <div className='flex flex-col space-y-2 mt-2'>
                  <div className='flex items-center gap-4 text-gray-300'>
                    <div className='flex items-center'>
                      <Mail className='w-4 h-4 mr-1 flex-shrink-0' />
                      <span className='text-sm truncate'>{affiliate.email}</span>
                    </div>
                    <div className='flex items-center'>
                      <Users className='w-4 h-4 mr-1 flex-shrink-0' />
                      <span className='text-sm'>{affiliate.metrics.total_referrals} {t('affiliates.details.totalReferrals')}</span>
                    </div>
                    <div className='flex items-center'>
                      <Key className='w-4 h-4 mr-1 flex-shrink-0' />
                      <span className='text-sm'>{activeCodes} {t('affiliates.details.activeCodes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              type='button'
              className='bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors'
              onClick={handleClose}
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto max-h-[calc(95vh-8rem)]'>
          <div className='px-8 py-6'>
            <div className="space-y-6">

        {/* Referral Codes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={getTypographyClasses('h3')}>
              {t('affiliates.details.referralCodes')}
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCode}
              disabled={createCodeMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('affiliates.details.createCode')}</span>
            </Button>
          </div>

                    {codesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(referralCodes || []).map((code) => (
              <div key={code.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-base font-semibold text-gray-900 dark:text-white">
                    {code.referral_code}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge
                      variant={code.is_active ? 'active' : 'inactive'}
                      size="sm"
                      showIcon
                    >
                      {code.is_active ? tCommon('status.active') : tCommon('status.inactive')}
                    </Badge>
                    <button
                      onClick={() => handleToggleCodeStatus(code.id, !code.is_active)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors disabled:opacity-50"
                      title={code.is_active ? t('affiliates.details.deactivateCode') : t('affiliates.details.activateCode')}
                      disabled={updateCodeStatusMutation.isPending}
                    >
                      {code.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopyCode(code.referral_code)}
                      className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors"
                      title={t('affiliates.details.copyCode')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors disabled:opacity-50"
                      title={t('affiliates.details.deleteCode')}
                      disabled={deleteCodeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(referralCodes || []).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                <Link className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="mb-3">{t('affiliates.details.noReferralCodes')}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateCode}
                  disabled={createCodeMutation.isPending}
                >
                  {t('affiliates.details.createFirstCode')}
                </Button>
              </div>
            )}
          </div>
                    )}
        </div>

              {/* All Referrals */}
              <div>
                <h3 className={cn(getTypographyClasses('h3'), 'mb-4')}>
                  {t('affiliates.details.allReferrals')}
                </h3>
                {referralsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <Table<Record<string, unknown>>
                    data={(referrals || []) as unknown as Record<string, unknown>[]}
                    columns={referralColumns as unknown as { header: string; accessor: keyof Record<string, unknown>; render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode }[]}
                    onSort={() => {}}
                    sortColumn={null}
                    sortDirection="asc"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default React.memo(AffiliateDetailsModal)
