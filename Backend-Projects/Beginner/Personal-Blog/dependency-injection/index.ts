import { ArticleRepository } from "../interfaces/article-repository.ts";
import { AuthRepository } from "../interfaces/auth-repository.ts";
import { FileSystemArticleRepository } from "../repositories/article/file-system.ts";
import { JWTAuthRepository } from "../repositories/auth.ts";

const articleRepository: ArticleRepository = new FileSystemArticleRepository();
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
