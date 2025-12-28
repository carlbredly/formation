import { useState } from 'react'
import { addCourse } from '../lib/courses'
import type { Resource } from '../types/course'

interface AddCourseFormProps {
  onSuccess: () => void
}

const AddCourseForm = ({ onSuccess }: AddCourseFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceUrl, setNewResourceUrl] = useState('')

  const handleAddResource = () => {
    if (newResourceTitle && newResourceUrl) {
      setResources([
        ...resources,
        {
          id: Date.now().toString(),
          title: newResourceTitle,
          url: newResourceUrl
        }
      ])
      setNewResourceTitle('')
      setNewResourceUrl('')
    }
  }

  const handleRemoveResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!title || !youtubeVideoId) {
      setError('Le titre et l\'ID de la vidéo YouTube sont requis')
      setLoading(false)
      return
    }

    const { error } = await addCourse({
      title,
      description: description || undefined,
      youtubeVideoId,
      resources
    })

    if (error) {
      setError(error.message || 'Erreur lors de l\'ajout du cours')
    } else {
      setTitle('')
      setDescription('')
      setYoutubeVideoId('')
      setResources([])
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Ajouter un cours</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Titre du cours"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Description du cours (optionnel)"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">ID Vidéo YouTube *</label>
          <input
            type="text"
            value={youtubeVideoId}
            onChange={(e) => setYoutubeVideoId(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="dQw4w9WgXcQ"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Extrait de l'URL YouTube : youtube.com/watch?v=ID</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Ressources</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={newResourceTitle}
              onChange={(e) => setNewResourceTitle(e.target.value)}
              className="flex-1 p-2 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              placeholder="Titre de la ressource"
            />
            <input
              type="url"
              value={newResourceUrl}
              onChange={(e) => setNewResourceUrl(e.target.value)}
              className="flex-1 p-2 border border-gray-700 rounded-md bg-[#0F0F0F] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              placeholder="URL"
            />
            <button
              type="button"
              onClick={handleAddResource}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-sm sm:text-base"
            >
              Ajouter
            </button>
          </div>
          {resources.length > 0 && (
            <div className="space-y-2">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-2 sm:p-3 bg-[#0F0F0F] rounded-md gap-2">
                  <span className="text-xs sm:text-sm text-white break-words flex-1">{resource.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(resource.id)}
                    className="text-red-400 hover:text-red-300 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le cours'}
        </button>
      </div>
    </form>
  )
}

export default AddCourseForm

