import { Dirent } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import touch from "touch";

type ExtendDirent = { dirent: Dirent; path: string };

export const lsDirFiles = async (
  path: string,
  recursive: boolean = false
): Promise<Array<ExtendDirent>> =>
  readdir(path, { withFileTypes: true }).then((x) => {
    if (recursive) {
      return x.reduce((prev, curr) => {
        if (curr.isDirectory()) {
          const nextPath = join(path, curr.name);
          return Promise.all([prev, lsDirFiles(nextPath, recursive)]).then(
            ([p, c]) => [...p, ...c]
          );
        }
        return prev.then((acc) => [...acc, { dirent: curr, path }]);
      }, Promise.resolve([] as ExtendDirent[]));
    }
    return x.filter((d) => d.isFile()).map((d) => ({ dirent: d, path }));
  });

export const getFileContent = async (path: string): Promise<string> =>
  readFile(path, { encoding: "utf-8" });

export const writeFileContent = async (
  path: string,
  content: string
): Promise<void> => writeFile(path, content, { encoding: "utf-8" });

export const touchFile = async (path: string): Promise<void> => touch(path);
