import React, { useState, useEffect } from 'react'
import type { Banner, BannerInsert } from '../types'

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL Field */}
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

      {/* Active Status */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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
        <span className="text-xs text-gray-500">
          {formData.is_active ? 'Banner is visible' : 'Banner is hidden'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          {banner ? 'Update' : 'Create'} Banner
        </button>
      </div>
    </form>
  )
}

export default BannerForm
