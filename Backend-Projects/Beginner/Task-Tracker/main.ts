import { RootCommander } from "./commander.ts";
import type { ICommander, IRepository } from "./interface.ts";
import { Repository } from "./repository.ts";

const repository: IRepository = new Repository();
const commander: ICommander = new RootCommander(repository, process.argv);
commander.process();
