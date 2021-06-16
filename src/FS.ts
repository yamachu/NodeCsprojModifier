import { Dirent } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import touch from "touch";

export const lsDirFiles = async (path: string): Promise<Array<Dirent>> =>
  readdir(path, { withFileTypes: true }).then((x) =>
    x.filter((d) => d.isFile())
  );

export const getFileContent = async (path: string): Promise<string> =>
  readFile(path, { encoding: "utf-8" });

export const writeFileContent = async (
  path: string,
  content: string
): Promise<void> => writeFile(path, content, { encoding: "utf-8" });

export const touchFile = async (path: string): Promise<void> => touch(path);
