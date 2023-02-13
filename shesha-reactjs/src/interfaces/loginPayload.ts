export interface ILoginPayload {
  readonly username: string;
  readonly password: string;
  readonly url?: string;
  readonly rememberMe?: boolean;
  readonly grant_type: string | 'password';
}
