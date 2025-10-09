export interface ITask {
  id: number;
  title: string;
  status: IStatus;
}

export type IStatus = "todo" | "in-progress" | "done";

export interface IRepository {
  add(task: ITask): Promise<void>;

  update(task: Pick<ITask, "id"> & Partial<ITask>): Promise<void>;

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
