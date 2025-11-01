import type { ICommander, IRepository } from "./interface.ts";
import { RootCommander } from "./commander.ts";
import { Repository } from "./repository.ts";

const repository: IRepository = new Repository();
const commander: ICommander = new RootCommander(repository, process.argv);
commander.process();
