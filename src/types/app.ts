
interface App {
  updated_at: string
  app_id: string
  app_number: string
  redirect_url: string
  home_url: string
  name: string
  icon_url: string
  description: string
  capabilities: string[]
  resource_patterns: string[]
  category: string
  creator_id: string
  app_secret: string
}

interface FavoriteApp {
  user_id: string
  app_id: string
  created_at: string
}