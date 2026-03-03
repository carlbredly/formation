import { useState, useEffect } from 'react'
import { updateCourse } from '../lib/courses'
import type { Course } from '../types/course'

interface EditCourseFormProps {
  course: Course
  onSuccess: () => void
  onCancel: () => void
}

const EditCourseForm = ({ course, onSuccess, onCancel }: EditCourseFormProps) => {
  const [title, setTitle] = useState(course.title)
  const [price, setPrice] = useState<number>(course.price ?? 0)
  const [thumbnail, setThumbnail] = useState(course.thumbnail || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setTitle(course.title)
    setPrice(course.price ?? 0)
    setThumbnail(course.thumbnail || '')
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    const { error } = await updateCourse(course.id, {
      title: title.trim(),
      price,
      thumbnail: thumbnail.trim() || undefined
    })

    if (error) {
      setError(error.message || 'Error while updating the course')
    } else {
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">Edit course</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Cancel
        </button>
      </div>

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
          <p className="text-xs text-gray-500 mt-1">Full URL or path in bucket course-thumbnails</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default EditCourseForm
