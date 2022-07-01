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

/**
 * signature: signature of the user.
 * example: wallet.signMessage(keccak256(toUtf8Bytes(`MVM:Bridge:Proxy:${server_public_key_base64}:${address}`))).slice(2)
 */
export interface RegisterRequest {
  public_key: string;
  signature?: string;
}

export interface GenerateExtraRequest {
  destination?: string;
  tag?: string;
  receivers: string[];
  threshold: number;
  extra: string;
}
