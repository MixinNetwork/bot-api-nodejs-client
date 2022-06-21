export interface AppResponse {
  type: 'app';
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
  session_secret: string;
  updated_at: Date;
}

export interface AppPropertyResponse {
  count: number;
  price: string;
}

export interface AppSecretResponse {
  app_secret: string;
}

export interface AppSessionResponse {
  session_id: string;
  pin_token_base64: string;
}

export interface AppRequest {
  redirect_uri: string;
  home_uri: string;
  name: string;
  description: string;
  icon_base64: string;
  category: string;
  capabilities: string[];
  resource_patterns: string[];
}