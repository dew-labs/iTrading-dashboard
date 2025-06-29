import React from 'react'

const Chart: React.FC = () => {
  const data = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 78 },
    { month: 'Mar', value: 52 },
    { month: 'Apr', value: 82 },
    { month: 'May', value: 91 },
    { month: 'Jun', value: 76 }
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className='h-64'>
      <div className='flex items-end justify-between h-48 space-x-2'>
        {data.map((item, index) => (
          <div key={index} className='flex-1 flex flex-col items-center'>
            <div
              className='w-full bg-gradient-to-t from-gray-900 to-gray-700 rounded-t-md hover:from-black hover:to-gray-800 transition-all duration-300 cursor-pointer'
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`${item.month}: ${item.value}k`}
            />
            <span className='text-xs text-gray-600 mt-2 font-medium'>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Chart
