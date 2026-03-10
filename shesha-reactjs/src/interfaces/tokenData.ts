export interface ITokenData {
  readonly "access_token": string;
  readonly "token_type": string;
  readonly "expires_in": number;
  readonly "userName": string;
  readonly "userId": string;
  readonly "requireChangePassword": boolean;
  readonly '.issued': string;
  readonly '.expires': string;
}
