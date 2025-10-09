import { TaskCLI } from "./cli.ts";
import type { ITaskRepository } from "./interface.d.ts";
import { TaskRepository } from "./repository.ts";

const taskRepository: ITaskRepository = new TaskRepository();

const cli = new TaskCLI(taskRepository);
cli.run();
