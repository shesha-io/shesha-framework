export interface IChangeable<TValue = unknown> {
  onChange?: ((newValue: TValue | null) => void) | undefined;
}
