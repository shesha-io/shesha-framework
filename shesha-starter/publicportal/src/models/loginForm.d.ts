export interface ILoginForm {
  readonly userNameOrEmailAddress: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}
