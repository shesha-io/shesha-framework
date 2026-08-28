import { isDefined } from "@/utils";

export interface ILoginForm {
  readonly username: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export const isLoginFormData = (data: unknown): data is ILoginForm => {
  return isDefined(data) && typeof data === 'object' && 'username' in data && 'password' in data;
};

