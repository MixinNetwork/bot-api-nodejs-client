export interface ErrorResponse {
  status: number;
  code: number;
  description: string;
  extra?: object;
  request_id?: string;
}
