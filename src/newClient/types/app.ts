export interface AppResponse {
  updated_at: string;
  app_id: string;
  app_number: string;
  redirect_url: string;
  home_url: string;
  name: string;
  icon_url: string;
  description: string;
  capabilities: string[];
  resource_patterns: string[];
  category: string;
  creator_id: string;
  app_secret: string;
}

export interface UpdateAppRequest {
  redirect_uri: string;
  home_uri: string;
  name: string;
  description: string;
  icon_base64: string;
  session_secret: string;
  category: string;
  capabilities: string[];
  resource_patterns: string[];
}