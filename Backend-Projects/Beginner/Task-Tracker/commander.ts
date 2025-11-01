import { ICommander } from "./interface.ts";

export class RootCommander extends ICommander {
  async process() {
    const argv: string[] = [...this.argv.slice(0, 2), ...this.argv.slice(3)];
    switch (this.argv[2]) {
      case "add": {
        const processor = new AddCommander(this.repository, argv);
        await processor.process();
        break;
      }
      case "update": {
        const processor = new UpdateCommander(this.repository, argv);
        await processor.process();
        break;
      }
      case "delete": {
        const processor = new DeleteCommander(this.repository, argv);
        await processor.process();
        break;
      }
      case "mark-in-progress": {
        const processor = new MarkInProgressCommander(this.repository, argv);
        await processor.process();
        break;
      }
      case "mark-done": {
        const processor = new MarkDoneCommander(this.repository, argv);
        await processor.process();
        break;
      }
      case "list": {
        const processor = new ListCommander(this.repository, argv);
        await processor.process();
        break;
      }
      default: {
        throw new Error("Unknown command");
      }
    }
  }
}

class AddCommander extends ICommander {
  async process() {
    const description = this.argv[2];
    if (!description) {
      throw new Error("Title is required");
    }

    const list = await this.repository.list();
    const id = Math.max(0, ...list.map((t) => t.id)) + 1;
    await this.repository.add({
      id,
      description,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log(`Task added successfully (ID: ${id})`);
  }
}

class UpdateCommander extends ICommander {
  async process() {
    const id = Number(this.argv[2]);
    const description = this.argv[3];
    if (!id || !description) {
      throw new Error("ID and Title are required");
    }

    const list = await this.repository.list();
    if (!list.find((t) => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.repository.update({ id, description, updatedAt: Date.now() });
  }
}

class DeleteCommander extends ICommander {
  async process() {
    const id = Number(this.argv[2]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.repository.list();
    if (!list.find((t) => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.repository.delete({ id });
  }
}

class MarkInProgressCommander extends ICommander {
  async process() {
    const id = Number(this.argv[2]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.repository.list();
    if (!list.find((t) => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.repository.update({
      id,
      status: "in-progress",
      updatedAt: Date.now(),
    });
  }
}

class MarkDoneCommander extends ICommander {
  async process() {
    const id = Number(this.argv[2]);
    if (!id) {
      throw new Error("ID is required");
    }

    const list = await this.repository.list();
    if (!list.find((t) => t.id === id)) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await this.repository.update({ id, status: "done", updatedAt: Date.now() });
  }
}

class ListCommander extends ICommander {
  async process() {
    const status = this.argv[2] as "todo" | "in-progress" | "done" | undefined;
    if (status && !["todo", "in-progress", "done"].includes(status)) {
      throw new Error("Invalid status");
    }

    const tasks = await this.repository.list(status);
    tasks.forEach((task) => {
      console.log(`${task.id}. [${task.status}] ${task.description}`);
    });
  }
}
