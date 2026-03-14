export interface IAccessToken {
  accessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
}

export interface IStoredToken extends IAccessToken {
  nonce?: string; // Client-side unique identifier for encoding uniqueness
}

export interface IHttpHeaders {
  [key: string]: string;
}
