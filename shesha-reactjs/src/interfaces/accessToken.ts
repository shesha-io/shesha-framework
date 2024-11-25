export interface IAccessToken {
  accessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
}

export interface IHttpHeaders {
  [key: string]: string;
}
