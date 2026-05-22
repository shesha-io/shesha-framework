import { ICanvasContextApi } from "./canvasContextApi";

export interface PageApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly context: Record<string, any>;
  readonly canvas: ICanvasContextApi | undefined;
}
