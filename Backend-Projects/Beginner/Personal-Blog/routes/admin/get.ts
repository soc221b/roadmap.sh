import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.get("/admin", authMiddleware, async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    res.render("admin", { articles: await articleRepository.getAll() });
  });
};

export default register;
