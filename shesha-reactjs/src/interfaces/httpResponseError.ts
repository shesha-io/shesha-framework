export interface IHttpResponseError {
  readonly code: number;
  readonly message: string;
  readonly details: string;
  readonly validationErrors: string;
}
