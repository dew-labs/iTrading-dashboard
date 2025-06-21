import React, { useState, useEffect } from 'react'
import { Banner, BannerInsert } from '../types/database'

interface BannerFormProps {
  banner?: Banner | null;
  onSubmit: (data: BannerInsert) => void;
  onCancel: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BannerInsert>({
    target_url: '',
    is_active: false
  })

  useEffect(() => {
    if (banner) {
      setFormData({
        target_url: banner.target_url || '',
        is_active: banner.is_active
      })
    }
  }, [banner])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 mb-1">
          Target URL
        </label>
        <input
          type="url"
          id="target_url"
          name="target_url"
          value={formData.target_url || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="https://example.com/landing-page"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active Banner
        </label>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Image Management</h4>
        <p className="text-xs text-gray-600">
          Banner images are managed through the centralized Images table.
          After creating the banner, you can upload and associate images using the image management system.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          {banner ? 'Update' : 'Create'} Banner
        </button>
      </div>
    </form>
  )
}

export default BannerForm
