export interface Headers {
  get(name: string): null | string;

  set(name: string, value: string): void;
}
