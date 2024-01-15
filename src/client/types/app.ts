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
  session_public_key: string;
  has_safe: boolean;
  spend_public_key: string;
  safe_created_at: string;
  updated_at: string;
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
  server_public_key: string;
}

export interface AppRegistrationResponse {
  spend_public_key: string;
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

export interface AppSafeSessionRequest {
  session_public_key: string;
}

export interface AppSafeRegistrationRequest {
  spend_public_key: string;
  signature_base64: string;
}
