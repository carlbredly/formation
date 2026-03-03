import { useState } from 'react'
import { addCourse } from '../lib/courses'

interface AddCourseFormProps {
  onSuccess: () => void
}

const AddCourseForm = ({ onSuccess }: AddCourseFormProps) => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [thumbnail, setThumbnail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    const { error } = await addCourse({
      title: title.trim(),
      price,
      thumbnail: thumbnail.trim() || undefined
    })

    if (error) {
      setError(error.message || 'Error while adding the course')
    } else {
      setTitle('')
      setPrice(0)
      setThumbnail('')
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Add a course</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            placeholder="Course title"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Price ($) *</label>
          <input
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Thumbnail (image)</label>
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            placeholder="https://... or filename (Storage)"
          />
          <p className="text-xs text-gray-500 mt-1">Full URL (https://…) or file path in Storage (bucket course-thumbnails)</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add course'}
        </button>
      </div>
    </form>
  )
}

export default AddCourseForm
