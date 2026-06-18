export interface IAccessToken {
  accessToken?: string | undefined;
  expireInSeconds?: number | undefined;
  expireOn?: string | undefined;
}

export interface IStoredToken extends IAccessToken {
  nonce?: string; // Client-side unique identifier for encoding uniqueness
}

export interface IHttpHeaders {
  [key: string]: string;
}
