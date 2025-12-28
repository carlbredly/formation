export interface Course {
  id: string
  title: string
  description?: string
  youtubeVideoId: string
  resources: Resource[]
}

export interface Resource {
  id: string
  title: string
  url: string
}


