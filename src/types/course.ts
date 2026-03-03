export interface Course {
  id: string
  title: string
  price?: number
  thumbnail?: string
}

export interface Resource {
  id: string
  title: string
  url: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  youtubeVideoId?: string
  videoUrl?: string
  contentUrl?: string
  resources: Resource[]
  position: number
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  accessCode: string
  expiresAt: string
  status: 'pending' | 'active' | 'expired'
  createdAt: string
}

export interface CourseProgress {
  id: string
  enrollmentId: string
  lessonId: string
  completed: boolean
  completedAt: string | null
}

export interface CoursePayment {
  id: string
  userId: string
  courseId: string
  amount: number
  paymentMethod: 'zelle' | 'moncash' | 'other'
  proofUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt: string | null
}




