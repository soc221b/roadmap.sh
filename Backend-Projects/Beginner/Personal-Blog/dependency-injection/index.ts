import { ArticleRepository } from "../interfaces/article-repository.ts";
import { AuthRepository } from "../interfaces/auth-repository.ts";
// import { InMemoryArticleRepository } from "../repositories/article/in-memory.ts";
// import { FileSystemArticleRepository } from "../repositories/article/file-system.ts";
import { ORMArticleRepository } from "../repositories/article/orm.ts";
import { JWTAuthRepository } from "../repositories/auth/jwt.ts";

const articleRepository: ArticleRepository = new ORMArticleRepository();
const authRepository: AuthRepository = new JWTAuthRepository();

function inject(token: typeof ArticleRepository): ArticleRepository;
function inject(token: typeof AuthRepository): AuthRepository;
function inject(token: unknown) {
  switch (token) {
    case ArticleRepository: {
      return articleRepository;
    }

    case AuthRepository: {
      return authRepository;
    }

    default: {
      throw ReferenceError();
    }
  }
}

export default inject;
