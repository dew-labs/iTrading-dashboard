import React from 'react'
import { Book, MessageCircle, Mail, Phone, FileText, Video, Search } from 'lucide-react'
import {
  getPageLayoutClasses,
  getButtonClasses,
  getTypographyClasses,
  getCardClasses,
  cn
} from '../utils/theme'

const Help: React.FC = () => {
  const layout = getPageLayoutClasses()

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      description: 'Learn the basics of using your iTrading dashboard',
      items: ['Dashboard Overview', 'Navigation Guide', 'Basic Setup', 'First Steps Tutorial'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'User Management',
      icon: MessageCircle,
      description: 'Everything about managing users and permissions',
      items: [
        'Adding New Users',
        'Role Management',
        'Permission Settings',
        'User Activity Tracking'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Content Management',
      icon: FileText,
      description: 'Create and manage posts, products, and banners',
      items: ['Creating Posts', 'Product Catalog', 'Banner Management', 'Media Upload Guide'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      description: 'Step-by-step video guides for common tasks',
      items: [
        'Quick Start Video',
        'User Management Tutorial',
        'Content Creation Guide',
        'Advanced Features'
      ],
      color: 'from-teal-500 to-teal-600'
    }
  ]

  const faqItems = [
    {
      question: 'How do I reset my password?',
      answer:
        'You can reset your password by clicking on your profile menu and selecting "Change Password". Follow the instructions to create a new secure password.'
    },
    {
      question: 'How do I add new users to the system?',
      answer:
        'Navigate to the Users section in the sidebar, click "Add User", fill in the required information, and assign appropriate roles and permissions.'
    },
    {
      question: 'Can I customize the dashboard layout?',
      answer:
        'Yes, you can customize various aspects of the dashboard including the sidebar, theme, and notification preferences in the Settings section.'
    },
    {
      question: 'How do I export data from the system?',
      answer:
        'Each section (Users, Products, Posts, Banners) has an export feature. Look for the export button in the respective section\'s toolbar.'
    }
  ]

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Help Center</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Find answers, guides, and get support for your iTrading dashboard
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <button className={getButtonClasses('secondary', 'md')}>
              <MessageCircle className='w-4 h-4 mr-2' />
              Live Chat
            </button>
            <button className={getButtonClasses('primary', 'md')}>
              <Mail className='w-4 h-4 mr-2' />
              Contact Support
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={getCardClasses('base')}>
          <div className='p-6'>
            <div className='max-w-md mx-auto'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search help articles...'
                  className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {helpCategories.map(category => {
            const Icon = category.icon
            return (
              <div key={category.title} className={getCardClasses('base')}>
                <div className='p-6'>
                  <div className='flex items-start space-x-4'>
                    <div
                      className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>{category.title}</h3>
                      <p className={cn(getTypographyClasses('description'), 'mb-4')}>
                        {category.description}
                      </p>
                      <ul className='space-y-2'>
                        {category.items.map(item => (
                          <li key={item}>
                            <button className='flex items-center text-left hover:text-teal-600 transition-colors'>
                              <div className='w-1.5 h-1.5 bg-teal-500 rounded-full mr-3'></div>
                              <span
                                className={cn(
                                  getTypographyClasses('small'),
                                  'text-gray-600 hover:text-teal-600'
                                )}
                              >
                                {item}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className='mt-6 pt-4 border-t border-gray-100'>
                    <button className={getButtonClasses('secondary', 'sm')}>Browse Articles</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className={getCardClasses('base')}>
          <div className='p-6'>
            <h3 className={cn(getTypographyClasses('h3'), 'mb-6')}>Frequently Asked Questions</h3>

            <div className='space-y-4'>
              {faqItems.map((faq, index) => (
                <div key={index} className='border border-gray-200 rounded-lg p-4'>
                  <h4 className={cn(getTypographyClasses('h4'), 'mb-2')}>{faq.question}</h4>
                  <p className={cn(getTypographyClasses('small'), 'text-gray-600')}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className={getCardClasses('base')}>
            <div className='p-6 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <Mail className='w-8 h-8 text-white' />
              </div>
              <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>Email Support</h3>
              <p className={cn(getTypographyClasses('small'), 'text-gray-600 mb-4')}>
                Get help via email within 24 hours
              </p>
              <button className={getButtonClasses('primary', 'sm')}>Send Email</button>
            </div>
          </div>

          <div className={getCardClasses('base')}>
            <div className='p-6 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <MessageCircle className='w-8 h-8 text-white' />
              </div>
              <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>Live Chat</h3>
              <p className={cn(getTypographyClasses('small'), 'text-gray-600 mb-4')}>
                Chat with our support team instantly
              </p>
              <button className={getButtonClasses('primary', 'sm')}>Start Chat</button>
            </div>
          </div>

          <div className={getCardClasses('base')}>
            <div className='p-6 text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <Phone className='w-8 h-8 text-white' />
              </div>
              <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>Phone Support</h3>
              <p className={cn(getTypographyClasses('small'), 'text-gray-600 mb-4')}>
                Call us for urgent technical issues
              </p>
              <button className={getButtonClasses('primary', 'sm')}>Call Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
