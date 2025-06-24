import React, { useState, useEffect } from 'react'
import type { Broker, BrokerInsert } from '../types'
import RichTextEditor from './RichTextEditor'
import DatePicker from './DatePicker'

interface BrokerFormProps {
  broker?: Broker | null;
  onSubmit: (data: BrokerInsert) => void;
  onCancel: () => void;
}

const BrokerForm: React.FC<BrokerFormProps> = ({ broker, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BrokerInsert>({
    established_at: '',
    headquarter: '',
    description: ''
  })

  useEffect(() => {
    if (broker) {
      setFormData({
        established_at: broker.established_at || '',
        headquarter: broker.headquarter || '',
        description: broker.description || ''
      })
    }
  }, [broker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert empty strings to null for optional fields
    const submittedData: BrokerInsert = {
      established_at: formData.established_at || null,
      headquarter: formData.headquarter || null,
      description: formData.description || null
    }
    onSubmit(submittedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <DatePicker
          label="Established Date"
          value={formData.established_at || ''}
          onChange={(date) => setFormData({ ...formData, established_at: date })}
          placeholder="Select establishment date"
          id="established_at"
          name="established_at"
        />
      </div>

      <div>
        <label htmlFor="headquarter" className="block text-sm font-medium text-gray-700 mb-1">
          Headquarter
        </label>
        <input
          type="text"
          id="headquarter"
          name="headquarter"
          value={formData.headquarter || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="e.g., New York, USA"
        />
      </div>

      <div>
        <RichTextEditor
          label="Description"
          content={formData.description || ''}
          onChange={(description) => setFormData({ ...formData, description })}
          placeholder="Broker description and services..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Image Management</h4>
        <p className="text-xs text-gray-600">
          Broker logos and images are managed through the centralized Images table. After creating the
          broker, you can upload and associate images using the image management system.
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
          {broker ? 'Update' : 'Add'} Broker
        </button>
      </div>
    </form>
  )
}

export default BrokerForm
