export abstract class AuthRepository {
  abstract login(user: {
    email: string;
    password: string;
  }): Promise<{ token: string }>;
}
