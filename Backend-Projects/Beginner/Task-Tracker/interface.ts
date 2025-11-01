export interface ITask {
  id: number;
  description: string;
  status: IStatus;
  createdAt: number;
  updatedAt: number;
}

export type IStatus = "todo" | "in-progress" | "done";

export interface IRepository {
  add(task: ITask): Promise<void>;

  update(task: Pick<ITask, "id" | "updatedAt"> & Partial<ITask>): Promise<void>;

  delete(task: Pick<ITask, "id">): Promise<void>;

  list(status?: IStatus): Promise<ITask[]>;
}

export abstract class ICommander {
  protected repository: IRepository;
  protected argv: string[];

  constructor(repository: IRepository, argv: string[]) {
    this.repository = repository;
    this.argv = argv;
  }

  abstract process(): Promise<void>;
}
