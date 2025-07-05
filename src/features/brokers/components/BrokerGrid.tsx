import React from 'react'
import BrokerCard from './BrokerCard'
import type { Broker, Image } from '../../../types'

interface BrokerGridProps {
  brokers: Broker[]
  imagesByRecord?: Record<string, Image[]>
  onView: (broker: Broker) => void
  onEdit: (broker: Broker) => void
  onDelete: (broker: Broker) => void
}

const BrokerGrid: React.FC<BrokerGridProps> = ({
  brokers,
  imagesByRecord = {},
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {brokers.map((broker) => (
        <BrokerCard
          key={broker.id}
          broker={broker}
          image={imagesByRecord[broker.id]?.[0] || null}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default BrokerGrid
