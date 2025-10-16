import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { ArticleRepository } from "../../interfaces/article-repository.ts";

const register = (app: Express) => {
  app.get("/home", async (req, res) => {
    const articleRepository = inject(ArticleRepository);

    res.render("home", {
      articles: await articleRepository.getAll(),
    });
  });
};

export default register;
