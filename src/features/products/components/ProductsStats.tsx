import React from 'react'
import { Package } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getStatsCardProps, getIconClasses } from '../../../utils/theme'
import type { Product } from '../../../types'

interface ProductsStatsProps {
  products: Product[]
}

const ProductsStats: React.FC<ProductsStatsProps> = ({ products }) => {
  const { t } = usePageTranslation()

  // Calculate stats - only total products now that pricing is removed
  const totalProducts = products.length

  // Theme props for the stat card
  const totalProductsProps = getStatsCardProps('products')

  return (
    <div className='grid grid-cols-1 gap-6'>
      {/* Total Products */}
      <div className={totalProductsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Package className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalProductsProps.valueClasses}>{totalProducts}</div>
            <div className={totalProductsProps.labelClasses}>{t('products.totalProducts')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsStats
