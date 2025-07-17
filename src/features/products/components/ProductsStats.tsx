import React from 'react'
import { Package, TrendingUp } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'
import type { Product } from '../../../types'
import { formatPrice } from '../../../utils/format'

interface ProductsStatsProps {
  products: Product[]
}

interface StatsData {
  totalProducts: number
  totalValue: number
}

const ProductsStats: React.FC<ProductsStatsProps> = ({ products }) => {
  const { t } = usePageTranslation()
  const layout = getPageLayoutClasses()

  // Calculate stats
  const stats: StatsData = React.useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.price, 0)
    return {
      totalProducts: products.length,
      totalValue
    }
  }, [products])

  // Theme props for each stat card
  const totalProductsProps = getStatsCardProps('products')
  const revenueProps = getStatsCardProps('products')

  return (
    <div className={layout.grid}>
      {/* Total Products */}
      <div className={totalProductsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Package className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalProductsProps.valueClasses}>{stats.totalProducts}</div>
            <div className={totalProductsProps.labelClasses}>{t('products.totalProducts')}</div>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className={revenueProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <TrendingUp className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={revenueProps.valueClasses}>${formatPrice(stats.totalValue)}</div>
            <div className={revenueProps.labelClasses}>{t('products.totalValue')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsStats
