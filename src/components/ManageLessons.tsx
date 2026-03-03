import { useState, useEffect } from 'react'
import { getLessonsByCourseId, addLesson, deleteLesson } from '../lib/lessons'
import type { Lesson } from '../types/course'
import type { Resource } from '../types/course'

interface ManageLessonsProps {
  courseId: string
  courseTitle: string
  onClose: () => void
}

const ManageLessons = ({ courseId, courseTitle, onClose }: ManageLessonsProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newYoutubeVideoId, setNewYoutubeVideoId] = useState('')
  const [newResources, setNewResources] = useState<Resource[]>([])
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceUrl, setNewResourceUrl] = useState('')

  const loadLessons = () => getLessonsByCourseId(courseId).then(setLessons)

  useEffect(() => {
    loadLessons().finally(() => setLoading(false))
  }, [courseId])

  const handleAddResource = () => {
    if (newResourceTitle.trim() && newResourceUrl.trim()) {
      setNewResources([
        ...newResources,
        { id: Date.now().toString(), title: newResourceTitle.trim(), url: newResourceUrl.trim() }
      ])
      setNewResourceTitle('')
      setNewResourceUrl('')
    }
  }

  const handleRemoveResource = (id: string) => {
    setNewResources(newResources.filter(r => r.id !== id))
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!newTitle.trim()) {
      setError('Lesson title is required')
      return
    }
    setSubmitting(true)
    const { error: err } = await addLesson({
      courseId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      youtubeVideoId: newYoutubeVideoId.trim() || undefined,
      resources: newResources.length ? newResources : undefined,
      position: lessons.length
    })
    setSubmitting(false)
    if (err) {
      setError(err.message || 'Failed to add lesson')
      return
    }
    setNewTitle('')
    setNewDescription('')
    setNewYoutubeVideoId('')
    setNewResources([])
    loadLessons()
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    const { error } = await deleteLesson(lessonId)
    if (!error) loadLessons()
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl border border-white/10 bg-[#111] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Lessons: {courseTitle}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5">✕</button>
        </div>
        <div className="p-4 space-y-6">
          <form onSubmit={handleAddLesson} className="space-y-4 p-4 rounded-2xl border border-white/10 bg-white/5">
            <h4 className="text-sm font-semibold text-white">Add a lesson</h4>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Lesson title" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Lesson description" rows={2} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">YouTube video ID</label>
              <input type="text" value={newYoutubeVideoId} onChange={e => setNewYoutubeVideoId(e.target.value)} placeholder="e.g. dQw4w9WgXcQ (from youtube.com/watch?v=ID)" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Resources</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newResourceTitle} onChange={e => setNewResourceTitle(e.target.value)} placeholder="Resource title" className={"flex-1 " + inputClass} />
                <input type="url" value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)} placeholder="URL" className={"flex-1 " + inputClass} />
                <button type="button" onClick={handleAddResource} className="px-4 py-3 rounded-xl bg-emerald-500 text-black text-sm font-semibold whitespace-nowrap hover:bg-emerald-400">
                  Add
                </button>
              </div>
              {newResources.length > 0 && (
                <ul className="space-y-1">
                  {newResources.map(r => (
                    <li key={r.id} className="flex items-center justify-between text-xs text-gray-300 py-1">
                      <span className="truncate">{r.title}</span>
                      <button type="button" onClick={() => handleRemoveResource(r.id)} className="text-red-400 ml-2 hover:text-red-300">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add lesson'}
            </button>
          </form>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <p className="text-gray-400 text-sm">No lessons yet. Add one above.</p>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Lessons list</h4>
              <ul className="space-y-2">
                {lessons.map((l, i) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-white">#{i + 1} {l.title}</span>
                      {l.description && <p className="text-xs text-gray-400 truncate mt-0.5">{l.description}</p>}
                      {l.youtubeVideoId && <p className="text-xs text-gray-500 mt-0.5">YouTube: {l.youtubeVideoId}</p>}
                    </div>
                    <button type="button" onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-300 text-xs shrink-0">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageLessons
