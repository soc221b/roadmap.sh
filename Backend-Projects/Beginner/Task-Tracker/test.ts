import { spawnSync } from "child_process";
import { mkdirSync } from "fs";
import { chdir } from "process";

function test(title: string, command: string[], expectedOutput: string) {
  const result = spawnSync("node", ["../main.ts", ...command], {
    encoding: "utf-8",
  });
  const output = result.stdout.trim() || result.stderr.trim();
  if (output === expectedOutput) {
    console.log(`✅ ${title}`);
  } else {
    console.error(`❌ ${title}`);
    console.error(`   Expected: "${expectedOutput}"`);
    console.error(`   Received: "${output}"`);
    process.exit(1);
  }
}

const dir = mkdirSync("test-" + new Date().toISOString(), { recursive: true });
chdir(dir!);

test("Add Task", ["add", "Buy groceries"], "Task added successfully (ID: 1)");
test("List All Tasks", ["list"], `1. [todo] Buy groceries`);

test("Add Task", ["add", "Cook dinner"], "Task added successfully (ID: 2)");
test(
  "List All Tasks",
  ["list"],
  `1. [todo] Buy groceries\n2. [todo] Cook dinner`
);

test("Update Task", ["update", "1", "Buy groceries this weekend"], "");
test(
  "List All Tasks",
  ["list"],
  `1. [todo] Buy groceries this weekend\n2. [todo] Cook dinner`
);

test("Mark Task In-Progress", ["mark-in-progress", "1"], "");
test(
  "List All Tasks",
  ["list"],
  `1. [in-progress] Buy groceries this weekend\n2. [todo] Cook dinner`
);
test(
  "List In-Progress Tasks",
  ["list", "in-progress"],
  `1. [in-progress] Buy groceries this weekend`
);
test("List Todo Tasks", ["list", "todo"], "2. [todo] Cook dinner");

test("Mark Task Done", ["mark-done", "1"], "");
test(
  "List All Tasks",
  ["list"],
  `1. [done] Buy groceries this weekend\n2. [todo] Cook dinner`
);
test(
  "List Done Tasks",
  ["list", "done"],
  `1. [done] Buy groceries this weekend`
);

test("Delete Task", ["delete", "2"], "");
test("List All Tasks", ["list"], `1. [done] Buy groceries this weekend`);
