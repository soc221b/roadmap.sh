export interface ITask {
  id: number;
  title: string;
  status: IStatus;
}

export type IStatus = "todo" | "in-progress" | "done";

export interface ITaskRepository {
  add(task: ITask): Promise<void>;

  update(task: Pick<ITask, "id"> & Partial<ITask>): Promise<void>;

  delete(task: Pick<ITask, "id">): Promise<void>;

  list(status?: IStatus): Promise<ITask[]>;
}
