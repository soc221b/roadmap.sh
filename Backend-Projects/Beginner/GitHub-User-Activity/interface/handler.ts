export interface Handler {
  (next: (event: unknown) => void): {
    (event: unknown): void;
  };
}
