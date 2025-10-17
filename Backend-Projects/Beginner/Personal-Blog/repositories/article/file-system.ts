import { readFileSync, writeFileSync } from "fs";
import z from "zod/v4";
import { expectType, type TypeEqual } from "ts-expect";
import type { Article } from "../../interfaces/article.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import { resolve } from "path";

const path = resolve(import.meta.dirname, "./articles.json");
const schema = z.array(
  z.object({
    id: z.string().regex(/^\d+$/),
    title: z.string(),
    // z.iso.date() do not accepts dates like "234567-08-09"
    // publishingDate: z.iso.date(),
    publishingDate: z.string(),
    content: z.string(),
  })
);
// guarantee the structure of the schema is the same as the Article interface
expectType<TypeEqual<z.infer<typeof schema>[number], Article>>(true);

export class FileSystemArticleRepository implements ArticleRepository {
  async getAll(): Promise<Article[]> {
    return this.readAll();
  }

  async get(article: Pick<Article, "id">): Promise<Article> {
    const articles = await this.getAll();
    const found = articles.find((a) => a.id === article.id);
    if (found) {
      return found;
    } else {
      throw ReferenceError();
    }
  }

  async post(article: Omit<Article, "id">): Promise<Pick<Article, "id">> {
    const articles = await this.readAll();
    const id =
      Math.max(0, ...articles.map((a) => a.id).map((id) => parseInt(id, 10))) +
      1 +
      "";
    await this.writeAll(
      articles.concat({
        ...article,
        id,
      })
    );
    return { id };
  }

  async put(article: Article): Promise<void> {
    const articles = await this.readAll();
    await this.writeAll(
      articles.map((a) => {
        if (a.id === article.id) {
          return { ...a, ...article };
        } else {
          return a;
        }
      })
    );
  }

  async delete(article: Pick<Article, "id">): Promise<void> {
    const articles = await this.readAll();
    await this.writeAll(articles.filter((a) => a.id !== article.id));
  }

  private async readAll(): Promise<Article[]> {
    try {
      return schema.parse(JSON.parse(readFileSync(path, "utf-8")));
    } catch {
      return [];
    }
  }

  private async writeAll(articles: Article[]): Promise<void> {
    writeFileSync(path, JSON.stringify(articles, null, 2), "utf8");
  }
}
