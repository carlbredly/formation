import type { Course } from '../types/course'

interface CourseCardProps {
  course: Course
}

const CourseCard = ({ course }: CourseCardProps) => {
  const embedUrl = `https://www.youtube.com/embed/${course.youtubeVideoId}`

  return (
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white pb-2">{course.title}</h2>
      
      <div className="mb-6">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={embedUrl}
            title={course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      {course.description && (
        <p className="text-gray-400 py-2 mb-4 text-sm">{course.description}</p>
      )}
      {course.resources && course.resources.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Ressources</h3>
          <div className="flex flex-col gap-2">
            {course.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] rounded-md hover:bg-[#252525] transition-colors text-blue-400 hover:text-blue-300"
              >
                <span className="text-sm">{resource.title}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseCard

