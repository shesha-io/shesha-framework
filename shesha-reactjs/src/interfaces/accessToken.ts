export interface IAccessToken {
  accessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
  nonce?: string; // Client-side unique identifier for encoding uniqueness
}

export interface IHttpHeaders {
  [key: string]: string;
}
