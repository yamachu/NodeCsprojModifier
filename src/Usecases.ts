import { dirname, join, relative, resolve } from "path";
import upath from "upath";
import {
  EXTENSION_CONFIGURE_FILE_NAME,
  EXTENSION_CONFIGURE_FILE_TEMPLATE,
} from "./Constants";
import {
  insertTargetFrameworkSwitcherImporterToCsproj,
  parseCsproj,
  parseExtensionConfig,
  parseSolution,
} from "./Domains";
import { getFileContent, lsDirFiles, touchFile, writeFileContent } from "./FS";
import { csprojFileRegex, solutionFileRegex } from "./RegExps";
import { ProjectInfo } from "./Types";
import { groupByWithOmitKey } from "./Utils";
const { normalize } = upath;

export const listing = async (
  path: string
): Promise<ReadonlyMap<string, Array<ProjectInfo>>> => {
  const recursiveDirFiles = lsDirFiles(path, true);

  const solutionFiles = await recursiveDirFiles.then((x) =>
    x.filter((d) => solutionFileRegex.test(d.dirent.name))
  );

  if (solutionFiles.length === 0) {
    const maybeCsprojFile = await lsDirFiles(path).then((x) =>
      x.find((d) => csprojFileRegex.test(d.dirent.name))
    );
    if (maybeCsprojFile === undefined) {
      return new Map();
    }

    const maybeParsedCsproj = await getFileContent(
      resolve(path, maybeCsprojFile?.dirent.name)
    ).then(parseCsproj);

    return new Map([
      [
        ".",
        [
          {
            projectName: maybeCsprojFile.dirent.name.split(".csproj")[0],
            projectSettings: maybeParsedCsproj,
            projectResolvedPath: resolve(path, maybeCsprojFile.dirent.name),
          },
        ],
      ],
    ]);
  } else {
    const solutionWithProjects = await Promise.all(
      solutionFiles.map((x) =>
        getFileContent(resolve(x.path, x.dirent.name))
          .then(parseSolution)
          .then((v) => {
            const relativePathSolutionName = normalize(
              join(relative(path, x.path), x.dirent.name)
            );
            return {
              solutionName: relativePathSolutionName,
              basePath: x.path,
              projects: v.filter((p) => p.relativePath.endsWith(".csproj")),
            };
          })
      )
    );
    const solutionWithProjectDeepParsed = await Promise.all(
      solutionWithProjects.flatMap((x) => {
        return x.projects.map((v) => {
          const resolvedPath = resolve(x.basePath, normalize(v.relativePath));
          return getFileContent(resolvedPath)
            .then(parseCsproj)
            .then((projectSettings) => ({
              solutionName: x.solutionName,
              projectName: v.name,
              projectSettings,
              projectResolvedPath: resolvedPath,
            }));
        });
      })
    );

    return groupByWithOmitKey(solutionWithProjectDeepParsed, "solutionName");
  }
};

export const insertTargetFrameworkSwitcherImporter = async (
  csprojFilePath: string
): Promise<void> => {
  const content = await getFileContent(csprojFilePath);
  if (parseCsproj(content).extensionEntryAdded) {
    return;
  }
  const insertedCsprojContent =
    insertTargetFrameworkSwitcherImporterToCsproj(content);
  await writeFileContent(csprojFilePath, insertedCsprojContent);
};

export const switchTargetFramework = async (
  csprojFilePath: string,
  targetFramework: string
): Promise<void> => {
  const template = EXTENSION_CONFIGURE_FILE_TEMPLATE`${targetFramework}`;
  const extensionFilePath = resolve(
    dirname(csprojFilePath),
    EXTENSION_CONFIGURE_FILE_NAME
  );
  await writeFileContent(extensionFilePath, template).then(() =>
    touchFile(csprojFilePath)
  );
};

export const getTargetFramework = async (
  csprojFilePath: string
): Promise<string | undefined> => {
  const extensionFilePath = resolve(
    dirname(csprojFilePath),
    EXTENSION_CONFIGURE_FILE_NAME
  );
  const content = await getFileContent(extensionFilePath).catch(
    (_) => undefined
  );
  if (content === undefined) {
    return undefined;
  }
  return parseExtensionConfig(content);
};
