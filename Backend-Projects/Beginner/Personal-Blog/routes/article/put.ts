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
        id: parseInt(sanitizer.escape(req.params.id), 10),
        title: sanitizer.escape(req.body.title),
        publishingDate: sanitizer.escape(req.body.publishingDate),
        content: sanitizer.escape(req.body.content),
      });
      res.sendStatus(204);
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });
};

export default register;
