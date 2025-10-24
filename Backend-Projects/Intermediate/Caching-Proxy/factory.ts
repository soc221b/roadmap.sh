import { type Response as ExpressResponse } from "express";
import { Factory } from "./interface.ts";

export const selectFactory = (mediaType: null | string): Factory => {
  let factory: Factory;
  switch (mediaType) {
    case "application/json":
      factory = new ApplicationJsonFactory();
      break;
    case "text/html":
      factory = new TextHtmlFactory();
      break;
    default: {
      throw Error(`Unimplemented media-type: ${mediaType}`);
    }
  }
  return factory;
};

export class ApplicationJsonFactory implements Factory {
  async send(res: ExpressResponse, cacheValue: string): Promise<void> {
    const { headers, json } = JSON.parse(cacheValue);

    headers.forEach(([name, value]: any) => {
      res.setHeader(name, value);
    });
    res.json(json);
  }

  async build(res: Response): Promise<{ cacheValue: string }> {
    return {
      cacheValue: JSON.stringify({
        headers: [...res.headers.entries()],
        json: await res.json(),
      }),
    };
  }
}

export class TextHtmlFactory implements Factory {
  async send(res: ExpressResponse, cacheValue: string): Promise<void> {
    const { headers, text } = JSON.parse(cacheValue);
    headers.forEach(([name, value]: any) => {
      res.setHeader(name, value);
    });
    res.send(text);
  }

  async build(res: Response): Promise<{ cacheValue: string }> {
    return {
      cacheValue: JSON.stringify({
        headers: [...res.headers.entries()],
        text: await res.text(),
      }),
    };
  }
}
