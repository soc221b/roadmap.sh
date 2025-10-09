import { readFileSync, writeFileSync } from "fs";
import type { ITask, ITaskRepository } from "./interface.d.ts";
import { resolve } from "path";
import { cwd } from "process";

export class TaskRepository implements ITaskRepository {
  private readonly path = resolve(cwd(), "tasks.json");

  async add(task: ITask): Promise<void> {
    await this._update([...(await this._read()), task]);
  }

  async update(task: Pick<ITask, "id"> & Partial<ITask>): Promise<void> {
    await this._update(
      (
        await this._read()
      ).map((t) => (t.id === task.id ? { ...t, ...task } : t))
    );
  }

  async delete(task: Pick<ITask, "id">): Promise<void> {
    await this._update((await this._read()).filter((t) => t.id !== task.id));
  }

  async list(
    status?: import("./interface").IStatus | undefined
  ): Promise<ITask[]> {
    return (await this._read()).filter(
      (task) => task.status === status || status === undefined
    );
  }

  private async _update(tasks: ITask[]): Promise<void> {
    writeFileSync(this.path, JSON.stringify(tasks, null, 2));
  }

  private async _read(): Promise<ITask[]> {
    try {
      const data = readFileSync(this.path, "utf-8");
      return JSON.parse(data) as ITask[];
    } catch {
      return [];
    }
  }
}
