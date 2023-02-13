export interface IComment {
  readonly id: number;
  readonly postId: string;
  readonly name: string;
  readonly email: string;
  readonly body: string;
}
