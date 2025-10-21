import { spawnSync } from "child_process";
import { mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { chdir } from "process";

function test({
  title,
  argv,
  expected,
}: {
  title: string;
  argv: string[];
  expected: string;
}) {
  const result = spawnSync("node", ["../main.ts", ...argv.slice(1)], {
    encoding: "utf-8",
  });
  const actual = result.stdout.trim() || result.stderr.trim();
  if (actual === expected) {
    console.log(`✅ ${title}`);
  } else {
    console.error(`❌ ${title}`);
    console.error(`   Expected: "${expected}"`);
    console.error(`     Actual: "${actual}"`);
    process.exit(1);
  }
}

const dir = resolve(
  mkdirSync("test-" + new Date().toISOString(), { recursive: true })!
);
chdir(dir);

test({
  title: "Add Task",
  argv: ["task-cli", "add", "Buy groceries"],
  expected: "Task added successfully (ID: 1)",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [todo] Buy groceries`,
});

test({
  title: "Add Task",
  argv: ["task-cli", "add", "Another task"],
  expected: "Task added successfully (ID: 2)",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [todo] Buy groceries\n2. [todo] Another task`,
});

test({
  title: "Update Task",
  argv: ["task-cli", "update", "1", "Buy groceries and cook dinner"],
  expected: "",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [todo] Buy groceries and cook dinner\n2. [todo] Another task`,
});

test({
  title: "Mark Task In-Progress",
  argv: ["task-cli", "mark-in-progress", "1"],
  expected: "",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [in-progress] Buy groceries and cook dinner\n2. [todo] Another task`,
});
test({
  title: "List In-Progress Tasks",
  argv: ["task-cli", "list", "in-progress"],
  expected: `1. [in-progress] Buy groceries and cook dinner`,
});
test({
  title: "List Todo Tasks",
  argv: ["task-cli", "list", "todo"],
  expected: "2. [todo] Another task",
});

test({
  title: "Mark Task Done",
  argv: ["task-cli", "mark-done", "1"],
  expected: "",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [done] Buy groceries and cook dinner\n2. [todo] Another task`,
});
test({
  title: "List Done Tasks",
  argv: ["task-cli", "list", "done"],
  expected: `1. [done] Buy groceries and cook dinner`,
});

test({
  title: "Delete Task",
  argv: ["task-cli", "delete", "2"],
  expected: "",
});
test({
  title: "List All Tasks",
  argv: ["task-cli", "list"],
  expected: `1. [done] Buy groceries and cook dinner`,
});

rmSync(dir, { force: true, recursive: true });
