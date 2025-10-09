import type { ITaskRepository } from "./interface.d.ts";

export class TaskCLI {
  private taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository;
  }

  run() {
    switch (process.argv[2]) {
      case "add":
        this.add();
        break;
      case "update":
        this.update();
        break;
      case "delete":
        this.delete();
        break;
      case "mark-in-progress":
        this.markInProgress();
        break;
      case "mark-done":
        this.markDone();
        break;
      case "list":
        this.list();
        break;
      default: {
        throw new Error("Unknown command");
      }
    }
  }

  private async add() {
    const title = process.argv[3];
    if (!title) {
      throw new Error("Title is required");
    }

    const list = await  this.taskRepository.list()
    const id = Math.max(0, ...list.map(t => t.id)) + 1;
    await this.taskRepository.add({ id, title, status: "todo" });
    console.log(`Task added successfully (ID: ${id})`)
  }

  private async update() {
    const id = Number(process.argv[3]);
    const title = process.argv[4];
    if (!id || !title) {
      throw new Error("ID and Title are required");
    }

    const list = await this.taskRepository.list()
    if (!list.find(t => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.taskRepository.update({ id, title });
  }

  private async delete() {
    const id = Number(process.argv[3]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.taskRepository.list()
    if (!list.find(t => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.taskRepository.delete({ id });
  }

  private async markInProgress() {
    const id = Number(process.argv[3]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.taskRepository.list()
    if (!list.find(t => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.taskRepository.update({ id, status: "in-progress" });
  }

  private async markDone() {
    const id = Number(process.argv[3]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.taskRepository.list()
    if (!list.find(t => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.taskRepository.update({ id, status: "done" });
  }

  private async list() {
    const status = process.argv[3] as "todo" | "in-progress" | "done" | undefined;
    if (status && !["todo", "in-progress", "done"].includes(status)) {
      throw new Error("Invalid status");
    }

    const tasks = await this.taskRepository.list(status);
    tasks.forEach((task) => {
      console.log(`${task.id}. [${task.status}] ${task.title}`);
    });
  }
}
