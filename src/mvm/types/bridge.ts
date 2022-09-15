export interface RegisteredUser {
  contract: string;
  created_at: string;
  full_name: string;
  user_id: string;
  session_id: string;
  key: {
    client_id: string;
    private_key: string;
    session_id: string;
  };
}

export interface RegisterRequest {
  public_key: string;
  signature?: string;
}

export interface GenerateExtraRequest {
  /** for cross-chain withdrawal */
  destination?: string;
  tag?: string;

  /** for mixin user transfer */
  receivers?: string[];
  threshold?: number;

  extra: string;
}
