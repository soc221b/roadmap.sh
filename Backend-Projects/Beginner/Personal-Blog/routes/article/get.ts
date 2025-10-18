import type { Express } from "express";
import sanitizer from "sanitizer";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";

const register = (app: Express) => {
  app.get("/article/:id", async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    try {
      res.render("article", {
        article: await articleRepository.get({
          id: parseInt(sanitizer.escape(req.params.id), 10),
        }),
      });
    } catch {
      res.sendStatus(404);
    }
  });
};

export default register;
