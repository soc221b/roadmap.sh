import type { Express } from "express";
import sanitizer from "sanitizer";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.delete("/article/:id", authMiddleware, async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    try {
      await articleRepository.delete({
        id: parseInt(sanitizer.escape(req.params.id), 10),
      });
      res.sendStatus(204);
    } catch (e) {
      console.error(e);
      res.sendStatus(400);
    }
  });
};

export default register;
