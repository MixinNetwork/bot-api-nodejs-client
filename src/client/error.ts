export class ResponseError extends Error {
  constructor(public code: number, public description: string, public status: number, public extra: object, public requestId: string | undefined, public originalError: unknown) {
    super(`code: ${code}, description: ${description}, status: ${status}, extra: ${extra}, requestId: ${requestId} originalError: ${originalError}`);
  }
}

export default ResponseError;
