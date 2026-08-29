/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PageApi {
  /** page additional state (data) */
  readonly state: Record<string, any>;
  readonly location: Location | undefined;
}
