export type ProjectSettings = {
  targetFrameworks: Array<string>;
  targetFramework: string | undefined;
  extensionEntryAdded: boolean;
};

export type Project = {
  name: string;
  relativePath: string;
};

export type ProjectInfo = {
  projectName: string;
  projectSettings: ProjectSettings;
  projectResolvedPath: string;
};
