import type { Express } from "express";
import sanitizer from "sanitizer";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.put("/article/:id", authMiddleware, async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    try {
      await articleRepository.put({
        id: sanitizer.escape(req.params.id),
        title: sanitizer.escape(req.body.title),
        publishingDate: sanitizer.escape(req.body.publishingDate),
        content: sanitizer.escape(req.body.content),
      });
      res.sendStatus(204);
    } catch {
      res.sendStatus(400);
    }
  });
};

export default register;
