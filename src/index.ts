import {
  getTargetFramework,
  insertTargetFrameworkSwitcherImporter,
  listing,
  switchTargetFramework,
} from "./Usecases";

const _args = process.argv.slice(2);
const command = _args.shift();

const run = async (cmd: string, args: string[]) => {
  switch (cmd) {
    case "list":
      return listing(args[0]);
    case "init":
      return insertTargetFrameworkSwitcherImporter(args[0]);
    case "switch":
      return switchTargetFramework(args[0], args[1]);
    case "current":
      return getTargetFramework(args[0]);
    default:
      throw new Error("command is not defined");
  }
};

run(command!, _args)
  .then((v) => {
    console.dir(v, { depth: null });
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
