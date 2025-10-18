import type { Article } from "../../interfaces/article.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";

export class InMemoryArticleRepository implements ArticleRepository {
  private articles: Article[] = [
    {
      id: 0,
      title: "My first article",
      publishingDate: "2024-08-07",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      id: 1,
      title: "Second article",
      publishingDate: "2024-08-04",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  ];

  async getAll(): Promise<Article[]> {
    return this.articles;
  }

  async get(article: Pick<Article, "id">): Promise<Article> {
    const found = this.articles.find((a) => a.id === article.id);
    if (found) {
      return found;
    } else {
      throw ReferenceError();
    }
  }

  async post(article: Omit<Article, "id">): Promise<Pick<Article, "id">> {
    const id = Math.max(...this.articles.map((a) => a.id).map((id) => id)) + 1;
    this.articles = this.articles.concat({
      ...article,
      id,
    });
    return { id };
  }

  async put(article: Article): Promise<void> {
    this.articles = this.articles.map((a) => {
      if (a.id === article.id) {
        return { ...a, ...article };
      } else {
        return a;
      }
    });
  }

  async delete(article: Pick<Article, "id">): Promise<void> {
    this.articles = this.articles.filter((a) => a.id !== article.id);
  }
}
