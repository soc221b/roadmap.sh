import type { Article } from "../../interfaces/article.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import { PrismaClient } from "./orm/generated/prisma/default.js";

export class ORMArticleRepository implements ArticleRepository {
  private prisma = new PrismaClient();

  async getAll(): Promise<Article[]> {
    const found = await this.prisma.article.findMany();
    return found.map((article) => ({
      ...article,
      publishingDate: new Date(article.publishingDate)
        .toISOString()
        .slice(0, 10),
    }));
  }

  async get(article: Pick<Article, "id">): Promise<Article> {
    try {
      const found = await this.prisma.article.findFirstOrThrow({
        where: { id: article.id },
      });
      return {
        ...found,
        publishingDate: new Date(found.publishingDate)
          .toISOString()
          .slice(0, 10),
      };
    } catch {
      throw ReferenceError();
    }
  }

  async post(article: Omit<Article, "id">): Promise<Pick<Article, "id">> {
    const created = await this.prisma.article.create({
      data: {
        ...article,
        publishingDate: new Date(article.publishingDate),
      },
    });
    return { id: created.id };
  }

  async put(article: Article): Promise<void> {
    await this.prisma.article.update({
      where: {
        id: article.id,
      },
      data: {
        ...article,
        publishingDate: new Date(article.publishingDate),
      },
    });
  }

  async delete(article: Pick<Article, "id">): Promise<void> {
    await this.prisma.article.delete({ where: { id: article.id } });
  }
}
