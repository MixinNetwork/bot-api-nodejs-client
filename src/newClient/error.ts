export class ApiError extends Error {
  constructor(public code: number, public description: string, public status: number, public extra: unknown, requestId: string, public originalError: unknown) {
    super(`code: ${code}, description: ${description}, status: ${status}, extra: ${extra}, requestId: ${requestId} originalError: ${originalError}`);
  }
}
