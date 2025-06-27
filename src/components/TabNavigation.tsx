import React from 'react'

interface Tab {
  id: string
  label: string
  count: number
  description?: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  children
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8 px-6' aria-label='Tabs'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <div className='flex items-center space-x-2'>
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}

export default TabNavigation
