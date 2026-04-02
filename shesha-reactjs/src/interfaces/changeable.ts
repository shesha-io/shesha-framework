export interface IChangeable {
  onChange?: (...params: unknown[]) => void;
}
