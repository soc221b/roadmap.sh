import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.get("/edit/:id", authMiddleware, async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    try {
      res.render("edit", {
        article: await articleRepository.get({ id: req.params.id }),
      });
    } catch {
      res.sendStatus(404);
    }
  });
};

export default register;
