import type { Article } from "./article.ts";

export abstract class ArticleRepository {
  abstract getAll(): Promise<Article[]>;

  abstract get(article: Pick<Article, "id">): Promise<Article>;

  abstract post(article: Omit<Article, "id">): Promise<Pick<Article, "id">>;

  abstract put(article: Article): Promise<void>;

  abstract delete(article: Pick<Article, "id">): Promise<void>;
}
