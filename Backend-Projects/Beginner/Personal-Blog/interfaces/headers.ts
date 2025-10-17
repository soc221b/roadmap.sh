export interface Headers {
  get(name: string): null | string;

  set(name: string, value: string | readonly string[]): void;

  remove(name: string): void;
}
