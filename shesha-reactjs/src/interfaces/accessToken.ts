export interface IAccessToken {
  accessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
}

/**
 * Internal interface for token storage that includes a nonce for uniqueness.
 * This should only be used by storage-related functions.
 * @internal
 */
export interface IStoredToken extends IAccessToken {
  nonce?: string; // Client-side unique identifier for encoding uniqueness
}

export interface IHttpHeaders {
  [key: string]: string;
}
